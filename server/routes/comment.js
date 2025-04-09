const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const { verifyToken } = require("./middleware");

// Add a comment to an annotation
router.post("/create", verifyToken, async (req, res) => {
  try {
    console.log("Creating comment:", req.body);
    const { user_id, comment_text } = req.body;

    const comment = new Comment({
      user_id,
      comment_text,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(400).json({ message: error.message });
  }
});

// Reply to a comment
router.post("/reply/:commentId", verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { user_id, comment_text } = req.body;

    console.log("Replying to comment:", commentId);

    // สร้าง Reply ใหม่
    const reply = new Comment({
      parent_comment_id: commentId,
      user_id,
      comment_text,
    });

    // บันทึก Reply
    await reply.save();

    // อัปเดต Comment หลักให้มี Reply
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }
    parentComment.replies.push(reply._id);
    await parentComment.save();

    res.status(201).json(reply);
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get all comments for an annotation (with replies)
router.get("/annotation/:annotationId", verifyToken, async (req, res) => {
  try {
    console.log("Fetching comments for annotation:", req.params.annotationId);

    const comments = await Comment.find({
      parent_comment_id: null, // ดึงเฉพาะ Comment หลัก
    })
      .populate("user_id", "username first_name last_name email")
      .populate({
        path: "replies",
        populate: { path: "user_id", select: "username first_name last_name email" },
      });

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;