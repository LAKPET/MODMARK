const express = require("express");
const mongoose = require("mongoose");
const Assessment = require("../models/Assessment");
const Group = require("../models/Group");
const GroupMember = require("../models/GroupMember");
const AssessmentRubric = require("../models/AssessmentRubric");
const Rubric = require("../models/Rubric");
const User = require("../models/User");
const Section = require("../models/Section"); // Import Section model
const {
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  checkAdminOrProfessorOrStudent,
} = require("./middleware");

const router = express.Router();

// Create a new assessment with rubric
router.post("/create", verifyToken, checkAdminOrProfessorOrTeacherAssistant, async (req, res) => {
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
    graders, // Array of graders with their weights
  } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ตรวจสอบว่ามี section นั้นหรือไม่
    const section = await Section.findById(section_id);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // ตรวจสอบว่าชื่อ assessment ซ้ำหรือไม่
    const existingAssessment = await Assessment.findOne({
      assessment_name,
      section_id,
    });
    if (existingAssessment) {
      return res
        .status(400)
        .json({ message: "Assessment name already exists in this section." });
    }

    // Find the selected rubric
    const selectedRubric = await Rubric.findById(rubric_id);
    if (!selectedRubric) {
      return res.status(404).json({ message: "Rubric not found" });
    }

    // ตรวจสอบน้ำหนักรวมของ graders
    if (graders && graders.length > 0) {
      const totalWeight = graders.reduce(
        (sum, grader) => sum + grader.weight,
        0
      );
      if (graders.some((grader) => grader.weight < 0 || grader.weight > 1)) {
        return res
          .status(400)
          .json({ message: "Weight of each grader must be between 0 and 1" });
      }
      if (totalWeight > 1) {
        return res
          .status(400)
          .json({ message: "Total weight of graders must not exceed 1" });
      }
    }

    const newAssessment = new Assessment({
      course_id: course_id, // Directly assign course_id
      section_id: section_id, // Directly assign section_id
      professor_id: req.user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      assessment_name,
      assessment_description,
      assignment_type,
      teamgrading_type,
      publish_date,
      due_date,
      rubric_id: rubric_id, // เพิ่มฟิลด์ rubric_id
    });

    await newAssessment.save();

    // Link rubric to assessment
    const newAssessmentRubric = new AssessmentRubric({
      assessment_id: newAssessment._id,
      rubric_id: selectedRubric._id,
      is_active: true,
    });
    await newAssessmentRubric.save();

    // Create group for professors who will grade the assessment
    const gradingGroup = new Group({
      assessment_id: newAssessment._id,
      group_name: `${assessment_name} Grading Group`,
      group_type: "grading",
      status: "not-submit",
    });
    await gradingGroup.save();

    // Save graders with their weights in GroupMember
    if (graders && graders.length > 0) {
      for (const grader of graders) {
        const newGroupMember = new GroupMember({
          group_id: gradingGroup._id,
          assessment_id: newAssessment._id,
          user_id: new mongoose.Types.ObjectId(grader.user_id), // ใช้ new ในการสร้าง ObjectId
          role: grader.role, // Ensure role is assigned
          weight: grader.weight,
        });
        await newGroupMember.save();
      }
    }

    res.status(201).json({
      message: "Assessment and rubric created successfully!",
      assessment: newAssessment,
      rubric: selectedRubric,
    });
  } catch (error) {
    console.error("Error creating assessment and rubric:", error);
    res
      .status(500)
      .json({ message: "Error creating assessment and rubric", error });
  }
});

// Get all assessments
router.get("/", verifyToken, checkAdminOrProfessorOrTeacherAssistant, async (req, res) => {
  try {
    const assessments = await Assessment.find()
      .populate({
        path: "course_id",
        select: "course_name",
      })
      .populate({
        path: "section_id",
        select: "section_number semester_term semester_year",
      })
      .populate({
        path: "professor_id",
        select: "first_name last_name email",
      })
      .populate({
        path: "rubric_id",
        select: "rubric_name description",
      });

    const assessmentsWithGraders = await Promise.all(
      assessments.map(async (assessment) => {
        const graders = await GroupMember.find({
          assessment_id: assessment._id,
          role: { $in: ["professor", "TA"] }, // Include both professor and TA
        })
          .populate("user_id", "first_name last_name email")
          .select("user_id weight");

        return {
          ...assessment.toObject(),
          graders,
        };
      })
    );

    res.status(200).json(assessmentsWithGraders);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ message: "Error fetching assessments", error });
  }
});

// Get a specific assessment by ID
router.get("/:id", verifyToken, checkAdminOrProfessorOrTeacherAssistant, async (req, res) => {
  const { id } = req.params;

  try {
    const assessment = await Assessment.findById(id)
      .populate({
        path: "course_id",
        select: "course_name",
      })
      .populate({
        path: "section_id",
        select: "section_number semester_term semester_year",
      })
      .populate({
        path: "professor_id",
        select: "first_name last_name email",
      })
      .populate({
        path: "rubric_id",
        select: "rubric_name description",
      });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const graders = await GroupMember.find({
      assessment_id: assessment._id,
      role: { $in: ["professor", "ta"] }, // Include both professor and TA
    })
      .populate("user_id", "first_name last_name role email")
      .select("user_id weight");

    res.status(200).json({ ...assessment.toObject(), graders });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ message: "Error fetching assessment", error });
  }
});

// Get all assessments in a section with graders (accessible by both professors and students)
router.get(
  "/section/:section_id",
  verifyToken,
  checkAdminOrProfessorOrStudent,
  async (req, res) => {
    const { section_id } = req.params;

    try {
      const assessments = await Assessment.find({ section_id })
        .populate({
          path: "course_id",
          select: "course_name",
        })
        .populate({
          path: "section_id",
          select: "section_number semester_term semester_year",
        })
        .populate({
          path: "professor_id",
          select: "first_name last_name email",
        })
        .populate({
          path: "rubric_id",
          select: "rubric_name description",
        });

      const assessmentsWithGraders = await Promise.all(
        assessments.map(async (assessment) => {
          const graders = await GroupMember.find({
            assessment_id: assessment._id,
            role: { $in: ["professor", "TA"] }, // Include both professor and TA
          })
            .populate("user_id", "first_name last_name email")
            .select("user_id weight");

          return {
            ...assessment.toObject(),
            graders,
          };
        })
      );

      res.status(200).json(assessmentsWithGraders);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Error fetching assessments", error });
    }
  }
);

// Update an assessment
router.put(
  "/update/:id",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { id } = req.params;
    const {
      assessment_name,
      assessment_description,
      assignment_type,
      teamgrading_type,
      publish_date,
      due_date,
      rubric_id, // ID of the rubric to be used
      graders, // Array of graders with their weights
    } = req.body;

    try {
      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Update assessment details
      assessment.assessment_name =
        assessment_name || assessment.assessment_name;
      assessment.assessment_description =
        assessment_description || assessment.assessment_description;
      assessment.assignment_type =
        assignment_type || assessment.assignment_type;
      assessment.teamgrading_type =
        teamgrading_type || assessment.teamgrading_type;
      assessment.publish_date = publish_date || assessment.publish_date;
      assessment.due_date = due_date || assessment.due_date;
      assessment.rubric_id = rubric_id || assessment.rubric_id; // เพิ่มฟิลด์ rubric_id

      await assessment.save();

      // Update rubric link
      if (rubric_id) {
        const assessmentRubric = await AssessmentRubric.findOneAndUpdate(
          { assessment_id: id },
          {
            rubric_id: new mongoose.Types.ObjectId(rubric_id),
            is_active: true,
          }, // ใช้ new ในการสร้าง ObjectId
          { new: true }
        );

        // Update the rubric's assessments field
        const selectedRubric = await Rubric.findById(rubric_id);
        if (!selectedRubric.assessments.includes(assessmentRubric._id)) {
          selectedRubric.assessments.push(assessmentRubric._id);
          await selectedRubric.save();
        }
      }

      // Update group for professors who will grade the assessment
      const gradingGroup = await Group.findOneAndUpdate(
        { assessment_id: id, group_type: "grading" },
        { group_name: `${assessment_name} Grading Group` },
        { new: true }
      );

      // ตรวจสอบน้ำหนักรวมของ graders
      if (graders && graders.length > 0) {
        const totalWeight = graders.reduce(
          (sum, grader) => sum + grader.weight,
          0
        );
        if (graders.some((grader) => grader.weight < 0 || grader.weight > 1)) {
          return res
            .status(400)
            .json({ message: "Weight of each grader must be between 0 and 1" });
        }
        if (totalWeight > 1) {
          return res
            .status(400)
            .json({ message: "Total weight of graders must not exceed 1" });
        }

        await GroupMember.deleteMany({
          group_id: gradingGroup._id,
          role: { $in: ["professor", "TA"] }, // Include both professor and TA
        });
        for (const grader of graders) {
          const newGroupMember = new GroupMember({
            group_id: gradingGroup._id,
            assessment_id: assessment._id,
            user_id: new mongoose.Types.ObjectId(grader.user_id), // ใช้ new ในการสร้าง ObjectId
            role: grader.role, // Allow role to be professor or TA
            weight: grader.weight,
          });
          await newGroupMember.save();
        }
      }

      res
        .status(200)
        .json({ message: "Assessment updated successfully!", assessment });
    } catch (error) {
      console.error("Error updating assessment:", error);
      res.status(500).json({ message: "Error updating assessment", error });
    }
  }
);

// Delete an assessment
router.delete(
  "/delete/:id",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { id } = req.params;

    try {
      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      await Group.deleteMany({ assessment_id: id });
      await GroupMember.deleteMany({ assessment_id: id, role: { $in: ["professor", "TA"] } }); // Include both professor and TA
      await AssessmentRubric.deleteMany({ assessment_id: id });

      await assessment.deleteOne();
      res.status(200).json({ message: "Assessment deleted successfully!" });
    } catch (error) {
      console.error("Error deleting assessment:", error);
      res.status(500).json({ message: "Error deleting assessment", error });
    }
  }
);

module.exports = router;
