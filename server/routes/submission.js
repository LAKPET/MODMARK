const express = require("express");
const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const Group = require("../models/Group");
const GroupMember = require("../models/GroupMember");
const User = require("../models/User");
const { verifyToken, checkAdminOrStudent } = require("./middleware");
const { upload, uploadFile } = require("../services/storageService");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Create a new group and submit work
router.post("/submit", verifyToken, checkAdminOrStudent, upload.single("file"), async (req, res) => {
  const {
    assessment_id,
    group_name,
    members, // Array of group members
    file_type
  } = req.body;

  try {
    // ตรวจสอบว่ามีไฟล์ถูกอัปโหลดหรือไม่
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ใช้ uploadFile() เพื่อรองรับ Local และ Cloud
    const file_url = await uploadFile(req.file);

    // Create a new group
    const newGroup = new Group({
      assessment_id: new mongoose.Types.ObjectId(assessment_id), // แปลง assessment_id เป็น ObjectId
      group_name,
      group_type: 'study',
      status: 'submit'
    });

    await newGroup.save();

    const membersArray = typeof members === "string" ? JSON.parse(members) : members;
    // Add group members
    for (const member of membersArray) {
      const existingUser = await User.findById(member.user_id);

      if (!existingUser) {
        console.error(`User with ID ${member.user_id} not found.`);
        continue; // ข้าม iteration นี้ถ้าไม่มี user จริง
      }

      const newGroupMember = new GroupMember({
        group_id: newGroup._id,
        assessment_id: new mongoose.Types.ObjectId(assessment_id), // แปลง assessment_id เป็น ObjectId
        user_id: existingUser._id, // ใช้ _id จากฐานข้อมูลที่มีอยู่จริง
        role: 'student',
        weight: 1
      });
      await newGroupMember.save();
    }

    // Create a new submission
    const newSubmission = new Submission({
      assessment_id: new mongoose.Types.ObjectId(assessment_id), // แปลง assessment_id เป็น ObjectId
      group_id: newGroup._id,
      student_id: req.user.id,
      file_url, // เก็บ URL ของไฟล์ที่อัปโหลด
      file_type,
      status: 'submit'
    });

    await newSubmission.save();

    res.status(201).json({ message: "Submission created successfully!", submission: newSubmission });
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ message: "Error creating submission", error });
  }
});

// Read (Get all submissions in this assessment)
router.get("/assessment/:assessment_id", verifyToken, checkAdminOrStudent, async (req, res) => {
  const { assessment_id } = req.params;

  try {
    const submissions = await Submission.find({ assessment_id: new mongoose.Types.ObjectId(assessment_id) })
      .populate("assessment_id", "assessment_name")
      .populate("group_id", "group_name")
      .populate("student_id", "first_name last_name email");
    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Error fetching submissions", error });
  }
});

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

// Update a submission
router.put("/update/:id", verifyToken, checkAdminOrStudent, upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const {
    group_name,
    file_type
  } = req.body;

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
      submission.file_url = file_url;
    }

    submission.file_type = file_type || submission.file_type;

    await submission.save();

    res.status(200).json({ message: "Submission updated successfully!", submission });
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({ message: "Error updating submission", error });
  }
});

// Delete a submission
router.delete("/delete/:id", verifyToken, checkAdminOrStudent, async (req, res) => {
  const { id } = req.params;

  try {
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Delete file from local storage if using local storage
    if (submission.file_url.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "../../", submission.file_url);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }

    await submission.deleteOne();

    res.status(200).json({ message: "Submission deleted successfully!" });
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ message: "Error deleting submission", error });
  }
});

module.exports = router;
