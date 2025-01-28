const express = require("express");
const Assessment = require("../models/Aseessment");
const { verifyToken, checkAdminOrProfessor } = require("./middleware");

const router = express.Router();

// Create a new assessment
router.post("/create", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const {
    course_id,
    section_id,
    personal_id,
    assessment_name,
    assessment_description,
    assignment_type,
    teamgrading_type,
    publish_date,
    due_date,
  } = req.body;

  try {
    const newAssessment = new Assessment({
      course_id,
      section_id,
      personal_id,
      assessment_name,
      assessment_description,
      assignment_type,
      teamgrading_type,
      publish_date,
      due_date,
    });

    await newAssessment.save();
    res.status(201).json({ message: "Assessment created successfully!", assessment: newAssessment });
  } catch (error) {
    console.error("Error creating assessment:", error);
    res.status(500).json({ message: "Error creating assessment", error });
  }
});

// Get all assessments
router.get("/", verifyToken, checkAdminOrProfessor, async (req, res) => {
  try {
    const assessments = await Assessment.find().populate("course_id section_id professor_id");
    res.status(200).json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ message: "Error fetching assessments", error });
  }
});

// Get a specific assessment by ID
router.get("/:id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { id } = req.params;

  try {
    const assessment = await Assessment.findById(id).populate("course_id section_id professor_id");
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json(assessment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ message: "Error fetching assessment", error });
  }
});

// Update an assessment
router.put("/update/:id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { id } = req.params;
  const {
    course_id,
    section_id,
    personal_id,
    assessment_name,
    assessment_description,
    assignment_type,
    teamgrading_type,
    publish_date,
    due_date,
  } = req.body;

  try {
    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    assessment.course_id = course_id || assessment.course_id;
    assessment.section_id = section_id || assessment.section_id;
    assessment.personal_id = personal_id || assessment.personal_id;
    assessment.assessment_name = assessment_name || assessment.assessment_name;
    assessment.assessment_description = assessment_description || assessment.assessment_description;
    assessment.assignment_type = assignment_type || assessment.assignment_type;
    assessment.teamgrading_type = teamgrading_type || assessment.teamgrading_type;
    assessment.publish_date = publish_date || assessment.publish_date;
    assessment.due_date = due_date || assessment.due_date;

    await assessment.save();
    res.status(200).json({ message: "Assessment updated successfully!", assessment });
  } catch (error) {
    console.error("Error updating assessment:", error);
    res.status(500).json({ message: "Error updating assessment", error });
  }
});

// Delete an assessment
router.delete("/delete/:id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { id } = req.params;

  try {
    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    await assessment.deleteOne();
    res.status(200).json({ message: "Assessment deleted successfully!" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({ message: "Error deleting assessment", error });
  }
});

module.exports = router; 
