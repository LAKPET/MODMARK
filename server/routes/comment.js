const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const { verifyToken } = require("./middleware");

// Add a comment to an annotation
router.post("/create", verifyToken, async (req, res) => {
  try {
    console.log("Creating comment:", req.body);
    const comment = new Comment(req.body);
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get all comments for an annotation
router.get("/annotation/:annotationId", verifyToken, async (req, res) => {
  try {
    console.log("Fetching comments for annotation:", req.params.annotationId);
    const comments = await Comment.find({
      annotation_id: req.params.annotationId,
    }).populate("user_id", "username first_name last_name email");
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
