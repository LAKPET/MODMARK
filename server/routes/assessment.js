const express = require("express");
const mongoose = require("mongoose");
const Assessment = require("../models/Assessment");
const Group = require("../models/Group");
const GroupMember = require("../models/GroupMember");
const AssessmentRubric = require("../models/AssessmentRubric");
const Rubric = require("../models/Rubric");
const User = require("../models/User");
const { verifyToken, checkAdminOrProfessor } = require("./middleware");

const router = express.Router();

// Create a new assessment with rubric
router.post("/create", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const {
    course_id,
    section_id,
    assessment_name,
    assessment_description,
    assignment_type,
    teamgrading_type,
    publish_date,
    due_date,
    rubric_id, // ID of the selected rubric
    rubric, // New rubric details if creating a new one
    graders // Array of graders with their weights
  } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let selectedRubric;

    if (rubric_id) {
      // Find the selected rubric
      selectedRubric = await Rubric.findById(rubric_id);
      if (!selectedRubric) {
        return res.status(404).json({ message: "Rubric not found" });
      }
    } else if (rubric) {
      // Create new rubric
      selectedRubric = new Rubric({
        rubric_name: rubric.title,
        description: rubric.description,
        criteria: rubric.criteria,
        created_by: req.user.id,
        section_id: new mongoose.Types.ObjectId(section_id), // ใช้ new ในการสร้าง ObjectId
        is_global: false
      });

      await selectedRubric.save();
    } else {
      return res.status(400).json({ message: "Rubric details are required" });
    }

    const newAssessment = new Assessment({
      course_id: new mongoose.Types.ObjectId(course_id), // ใช้ new ในการสร้าง ObjectId
      section_id: new mongoose.Types.ObjectId(section_id), // ใช้ new ในการสร้าง ObjectId
      professor_id: req.user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      assessment_name,
      assessment_description,
      assignment_type,
      teamgrading_type,
      publish_date,
      due_date,
    });

    await newAssessment.save();

    // Link rubric to assessment
    const newAssessmentRubric = new AssessmentRubric({
      assessment_id: newAssessment._id,
      rubric_id: selectedRubric._id,
      is_active: true
    });
    await newAssessmentRubric.save();

    // Save graders with their weights
    if (teamgrading_type && graders && graders.length > 0) {
      for (const grader of graders) {
        const newGroupMember = new GroupMember({
          group_id: newAssessment._id,
          user_id: new mongoose.Types.ObjectId(grader.user_id), // ใช้ new ในการสร้าง ObjectId
          role: 'professor',
          weight: grader.weight
        });
        await newGroupMember.save();
      }
    }

    res.status(201).json({ message: "Assessment and rubric created successfully!", assessment: newAssessment, rubric: selectedRubric });
  } catch (error) {
    console.error("Error creating assessment and rubric:", error);
    res.status(500).json({ message: "Error creating assessment and rubric", error });
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
    assessment_name,
    assessment_description,
    assignment_type,
    teamgrading_type,
    publish_date,
    due_date,
    groups, // Array of groups if assignment_type is 'group'
    rubric_id, // ID of the rubric to be used
    graders // Array of graders with their weights
  } = req.body;

  try {
    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    assessment.course_id = course_id || assessment.course_id;
    assessment.section_id = section_id || assessment.section_id;
    assessment.first_name = req.body.first_name || assessment.first_name;
    assessment.last_name = req.body.last_name || assessment.last_name;
    assessment.assessment_name = assessment_name || assessment.assessment_name;
    assessment.assessment_description = assessment_description || assessment.assessment_description;
    assessment.assignment_type = assignment_type || assessment.assignment_type;
    assessment.teamgrading_type = teamgrading_type || assessment.teamgrading_type;
    assessment.publish_date = publish_date || assessment.publish_date;
    assessment.due_date = due_date || assessment.due_date;

    await assessment.save();

    // Update groups if assignment_type is 'group'
    if (assignment_type === 'group' && groups && groups.length > 0) {
      await Group.deleteMany({ assessment_id: id });
      for (const group of groups) {
        const newGroup = new Group({
          assessment_id: id,
          group_name: group.group_name,
          group_type: 'study',
          status: 'not-submit'
        });
        await newGroup.save();

        // Add group members
        for (const member of group.members) {
          const newGroupMember = new GroupMember({
            group_id: newGroup._id,
            user_id: new mongoose.Types.ObjectId(member.user_id), // ใช้ new ในการสร้าง ObjectId
            role: 'student'
          });
          await newGroupMember.save();
        }
      }
    }

    // Update rubric link
    if (rubric_id) {
      await AssessmentRubric.findOneAndUpdate(
        { assessment_id: id },
        { rubric_id: new mongoose.Types.ObjectId(rubric_id), is_active: true }, // ใช้ new ในการสร้าง ObjectId
        { upsert: true }
      );
    }

    // Update graders with their weights
    if (teamgrading_type && graders && graders.length > 0) {
      await GroupMember.deleteMany({ group_id: id, role: 'professor' });
      for (const grader of graders) {
        const newGroupMember = new GroupMember({
          group_id: id,
          user_id: new mongoose.Types.ObjectId(grader.user_id), // ใช้ new ในการสร้าง ObjectId
          role: 'professor',
          weight: grader.weight
        });
        await newGroupMember.save();
      }
    }

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

    await Group.deleteMany({ assessment_id: id });
    await GroupMember.deleteMany({ group_id: id });
    await AssessmentRubric.deleteMany({ assessment_id: id });

    await assessment.deleteOne();
    res.status(200).json({ message: "Assessment deleted successfully!" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({ message: "Error deleting assessment", error });
  }
});

module.exports = router;
