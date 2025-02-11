const express = require("express");
const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const Group = require("../models/Group");
const GroupMember = require("../models/GroupMember");
const { verifyToken } = require("./middleware");

const router = express.Router();

// Create a new group and submit work
router.post("/submit", verifyToken, async (req, res) => {
  const {
    assessment_id,
    group_name,
    members, // Array of group members
    file_url,
    file_type
  } = req.body;

  try {
    // Create a new group
    const newGroup = new Group({
      assessment_id: mongoose.Types.ObjectId(assessment_id),
      group_name,
      group_type: 'study',
      status: 'submit'
    });

    await newGroup.save();

    // Add group members
    for (const member of members) {
      const newGroupMember = new GroupMember({
        group_id: newGroup._id,
        user_id: mongoose.Types.ObjectId(member.user_id),
        role: 'student'
      });
      await newGroupMember.save();
    }

    // Create a new submission
    const newSubmission = new Submission({
      group_id: newGroup._id,
      student_id: req.user._id,
      file_url,
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

module.exports = router;
