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
const {
  upload,
  uploadFile,
  fetchFileFromStorage,
} = require("../services/storageService");
const bucket = require("../services/firebaseConfig"); // เพิ่มบรรทัดนี้
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

      // อัปโหลดไฟล์ไปยัง Firebase และรับ URL
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

      // Fetch professors and teaching assistants related to the section or assessment
      const graders = await mongoose.model("GroupMember").find({
        assessment_id,
        role: { $in: ["professor", "ta"] },
      });

      const gradingStatusBy = graders.map((grader) => ({
        grader_id: grader.user_id,
        role: grader.role,
        status: "pending",
      }));

      const newSubmission = new Submission({
        assessment_id: new mongoose.Types.ObjectId(assessment_id),
        section_id: new mongoose.Types.ObjectId(section_id),
        group_id: newGroup._id,
        student_id: req.user.id,
        file_url, // Save Firebase file URL
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
router.post("/pdf/file", verifyToken, async (req, res) => {
  const { filename } = req.body;

  try {
    // ดึง URL ของไฟล์จาก Firebase Storage
    const fileUrl = await fetchFileFromStorage(filename);
    if (!fileUrl) {
      return res.status(404).json({ message: "File not found" });
    }

    // ส่ง URL กลับไปให้ client
    res.status(200).json({ fileUrl });
  } catch (error) {
    console.error("Error fetching file from storage:", error);
    res.status(500).json({ message: "Error fetching file from storage" });
  }
});

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

router.get(
  "/student/:student_id",
  verifyToken,
  checkAdminOrStudent,
  async (req, res) => {
    const { student_id } = req.params;

    try {
      const submissions = await Submission.find({ student_id })
        .populate("assessment_id", "assessment_name rubric_id due_date")
        .populate("group_id", "group_name");

      if (!submissions || submissions.length === 0) {
        return res.status(404).json({ message: "No submissions found" });
      }

      res.status(200).json(submissions);
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      res.status(500).json({ message: "Error fetching student submissions" });
    }
  }
);

router.get(
  "/student/with-groups/:student_id",
  verifyToken,
  checkAdminOrStudent,
  async (req, res) => {
    const { student_id } = req.params;

    try {
      // Find all groups the student is part of
      const studentGroups = await GroupMember.find({
        user_id: student_id,
      }).distinct("group_id");

      // Find all direct submissions by the student
      const directSubmissions = await Submission.find({ student_id })
        .populate(
          "assessment_id",
          "assessment_name rubric_id due_date assignment_type"
        )
        .populate("group_id", "group_name")
        .lean();

      // Find all group submissions where the student is a member
      const groupSubmissions = await Submission.find({
        group_id: { $in: studentGroups },
        student_id: { $ne: student_id }, // Exclude submissions directly made by this student (already in directSubmissions)
      })
        .populate(
          "assessment_id",
          "assessment_name rubric_id due_date assignment_type"
        )
        .populate("group_id", "group_name")
        .populate("student_id", "first_name last_name email") // Include info about who submitted
        .lean();

      // For each group submission, add a flag indicating it's from a group member
      groupSubmissions.forEach((submission) => {
        submission.isGroupMemberSubmission = true;
      });

      // Combine both sets of submissions
      const allSubmissions = [...directSubmissions, ...groupSubmissions];

      if (!allSubmissions || allSubmissions.length === 0) {
        return res.status(404).json({ message: "No submissions found" });
      }

      res.status(200).json(allSubmissions);
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      res.status(500).json({ message: "Error fetching student submissions" });
    }
  }
);

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

      const group = await Group.findById(submission.group_id);
      if (group_name) {
        group.group_name = group_name;
        await group.save();
      }

      if (req.file) {
        // ลบไฟล์เดิมใน Firebase Storage ถ้ามี
        if (submission.file_url) {
          const oldFile = bucket.file(submission.file_url);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
          }
        }

        // Upload the new file to Firebase storage
        const file_url = await uploadFile(req.file);
        submission.file_url = file_url;
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

      // Extract the correct file path from file_url
      // เปลี่ยนจาก file_url เป็นชื่อไฟล์ที่เก็บใน Firebase (file_url ในระบบนี้คือชื่อไฟล์ ไม่ใช่ URL)
      if (submission.file_url) {
        const file = bucket.file(submission.file_url);
        const [exists] = await file.exists();
        if (exists) {
          await file.delete();
        }
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
