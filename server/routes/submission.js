const express = require("express");
const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const Group = require("../models/Group");
const GroupMember = require("../models/GroupMember");
const User = require("../models/User");
const {
  verifyToken,
  checkAdminOrStudent,
  checkAdminOrProfessor,
  checkAdminOrProfessorOrStudent,
  checkAdminOrProfessorOrTeacherAssistant,
} = require("./middleware");
const { upload, uploadFile } = require("../services/storageService");
const fs = require("fs");
const path = require("path");
const scoreRoutes = require("./score");

const router = express.Router();

// Create a new group and submit work
router.post(
  "/submit",
  verifyToken,
  checkAdminOrStudent,
  upload.single("file"),
  async (req, res) => {
    const {
      assessment_id,
      section_id,
      group_name,
      members, // Array of group members
      file_type,
    } = req.body;

    try {
      if (!assessment_id || !section_id) {
        return res
          .status(400)
          .json({ message: "Assessment ID and Section ID are required" });
      }

      const assessmentExists = await mongoose
        .model("Assessment")
        .exists({ _id: assessment_id });
      const sectionExists = await mongoose
        .model("Section")
        .exists({ _id: section_id });

      if (!assessmentExists || !sectionExists) {
        return res
          .status(404)
          .json({ message: "Assessment or Section not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!group_name) {
        return res.status(400).json({ message: "Group name is required" });
      }

      const file_url = await uploadFile(req.file);
      const membersArray =
        typeof members === "string" ? JSON.parse(members) : members;

      for (const member of membersArray) {
        const existingUser = await User.findById(member.user_id);
        if (!existingUser) {
          return res
            .status(404)
            .json({ message: `User with ID ${member.user_id} not found.` });
        }

        const isEnrolled = await mongoose
          .model("Enrollment")
          .exists({ section_id, student_id: existingUser._id });
        if (!isEnrolled) {
          return res.status(400).json({
            message: `User with ID ${member.user_id} is not enrolled in section ${section_id}.`,
          });
        }
      }

      const newGroup = new Group({
        assessment_id: new mongoose.Types.ObjectId(assessment_id),
        group_name: group_name,
        group_type: "study",
        status: "submit",
      });

      await newGroup.save();

      for (const member of membersArray) {
        const newGroupMember = new GroupMember({
          group_id: newGroup._id,
          assessment_id: new mongoose.Types.ObjectId(assessment_id),
          user_id: member.user_id,
          role: "student",
          weight: 1,
        });
        await newGroupMember.save();
      }

      // Fetch professors related to the section or assessment
      // Fetch professors and teaching assistants related to the section or assessment
      const graders = await mongoose.model("GroupMember").find({
        assessment_id,
        role: { $in: ["professor", "ta"] }, // Include both professors and TAs
      });

      // Create grading_status_by array with professors and TAs
      const gradingStatusBy = graders.map((graders) => ({
        grader_id: graders.user_id, // Changed to a more generic name
        role: graders.role, // Include role for clarity
        status: "pending",
      }));

      // Add grading_status_by to the submission
      const newSubmission = new Submission({
        assessment_id: new mongoose.Types.ObjectId(assessment_id),
        section_id: new mongoose.Types.ObjectId(section_id),
        group_id: newGroup._id,
        student_id: req.user.id,
        file_url: req.file.filename,
        file_type,
        status: "submit",
        grading_status_by: gradingStatusBy,
      });

      await newSubmission.save();

      res.status(201).json({
        message: "Submission created successfully!",
        submission: newSubmission,
      });
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Error creating submission", error });
    }
  }
);

// Serve PDF files
router.get(
  "/pdf/:filename",
  verifyToken,

  async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../../server/uploads", filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({ message: "File not found" });
      }

      res.sendFile(filePath);
    });
  }
);

// Read (Get all submissions in this assessment)
router.get(
  "/assessment/:assessment_id",
  verifyToken,

  async (req, res) => {
    const { assessment_id } = req.params;

    try {
      const submissions = await Submission.find({
        assessment_id: new mongoose.Types.ObjectId(assessment_id),
      })
        .populate("assessment_id", "assessment_name rubric_id due_date")
        .populate("group_id", "group_name")
        .populate("student_id", "personal_num first_name last_name email");

      // Fetch all group members for each submission
      const submissionsWithGroupMembers = await Promise.all(
        submissions.map(async (submission) => {
          const groupMembers = await GroupMember.find({
            group_id: submission.group_id,
          }).populate("user_id", "personal_num first_name last_name email");
          return {
            ...submission.toObject(),
            group_members: groupMembers,
          };
        })
      );

      res.status(200).json(submissionsWithGroupMembers);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Error fetching submissions", error });
    }
  }
);

// Read (Get all submissions)
router.get("/", verifyToken, async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("assessment_id", "assessment_name")
      .populate("group_id", "group_name")
      .populate("student_id", "first_name last_name email");
    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Error fetching submissions", error });
  }
});

// Read (Get a specific submission by ID)
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const submission = await Submission.findById(id)
      .populate("assessment_id", "assessment_name")
      .populate("group_id", "group_name")
      .populate("student_id", "first_name last_name email");
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    res.status(200).json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ message: "Error fetching submission", error });
  }
});

// Get list of submissions for all groups with specified fields
router.get("/list/all", verifyToken, checkAdminOrStudent, async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("group_id", "group_name")
      .select("group_id status submitted_at grading_status");

    const submissionList = submissions.map((submission) => ({
      group_name: submission.group_id.group_name,
      status: submission.status,
      submitted_at: submission.submitted_at,
      grading_status: submission.grading_status,
    }));

    res.status(200).json(submissionList);
  } catch (error) {
    console.error("Error fetching submission list:", error);
    res.status(500).json({ message: "Error fetching submission list", error });
  }
});

// Update a submission
router.put(
  "/update/:id",
  verifyToken,
  checkAdminOrStudent,
  upload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    const { group_name, file_type } = req.body;

    try {
      const submission = await Submission.findById(id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      // Update group name
      const group = await Group.findById(submission.group_id);
      if (group_name) {
        group.group_name = group_name;
        await group.save();
      }

      // Update file if a new file is uploaded
      if (req.file) {
        const file_url = await uploadFile(req.file);
        submission.file_url = req.file.filename; // เก็บเฉพาะชื่อไฟล์
      }

      submission.file_type = file_type || submission.file_type;

      await submission.save();

      res
        .status(200)
        .json({ message: "Submission updated successfully!", submission });
    } catch (error) {
      console.error("Error updating submission:", error);
      res.status(500).json({ message: "Error updating submission", error });
    }
  }
);

// Delete a submission
router.delete(
  "/delete/:id",
  verifyToken,
  checkAdminOrStudent,
  async (req, res) => {
    const { id } = req.params;

    try {
      const submission = await Submission.findById(id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      // Delete file from local storage if using local storage
      if (submission.file_url.startsWith("/server/uploads/")) {
        const filePath = path.join(__dirname, "../../", submission.file_url);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          }
        });
      }

      // Delete related group members
      await GroupMember.deleteMany({ group_id: submission.group_id });

      // Delete related group
      await Group.findByIdAndDelete(submission.group_id);

      // Delete the submission
      await submission.deleteOne();

      res
        .status(200)
        .json({ message: "Submission and related data deleted successfully!" });
    } catch (error) {
      console.error("Error deleting submission:", error);
      res.status(500).json({ message: "Error deleting submission", error });
    }
  }
);

router.use("/score", scoreRoutes);

module.exports = router;
