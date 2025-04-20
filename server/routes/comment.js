const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Annotation = require("../models/Annotation");
const { verifyToken } = require("./middleware");
const { io } = require("../server"); // Import socket.io instance

// Add a comment to an annotation
router.post("/create", verifyToken, async (req, res) => {
  try {
    console.log("Creating comment:", req.body);
    const { annotation_id, user_id, comment_text } = req.body;

    // ตรวจสอบค่าที่จำเป็น
    if (!annotation_id || !user_id || !comment_text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ตรวจสอบว่า annotation มีอยู่จริง
    const annotation = await Annotation.findById(annotation_id);
    if (!annotation) {
      return res.status(404).json({ message: "Annotation not found" });
    }

    // สร้าง Comment ใหม่
    const comment = new Comment({
      annotation_id,
      parent_comment_id: null,
      user_id,
      comment_text,
    });

    await comment.save();

    // เพิ่ม Comment ลงใน Annotation
    annotation.comments.push(comment._id);
    await annotation.save();

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

    // ตรวจสอบค่าที่จำเป็น
    if (!user_id || !comment_text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("Replying to comment:", commentId);

    // หา comment หลักเพื่อดึง annotation_id
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    // สร้าง Reply ใหม่
    const reply = new Comment({
      annotation_id: parentComment.annotation_id,
      parent_comment_id: commentId,
      user_id,
      comment_text,
    });

    await reply.save();

    // อัปเดต Comment หลักให้มี Reply
    parentComment.replies.push(reply._id);
    await parentComment.save();

    // ส่ง event ผ่าน socket.io
    io.emit("new_reply", {
      annotation_id: parentComment.annotation_id,
      parent_comment_id: commentId,
      reply,
    });

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

    const annotation = await Annotation.findById(req.params.annotationId)
      .populate({
        path: "comments",
        populate: {
          path: "replies",
          populate: {
            path: "user_id",
            select: "username first_name last_name email",
          },
        },
      })
      .populate("comments.user_id", "username first_name last_name email");

    if (!annotation) {
      return res.status(404).json({ message: "Annotation not found" });
    }

    res.json(annotation.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update a comment
router.put("/update/:commentId", verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment_text } = req.body;

    // Validate required fields
    if (!comment_text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("Updating comment:", commentId);

    // Find and update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { comment_text, updated_at: Date.now() },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(400).json({ message: error.message });
  }
});

// Update a reply
router.put("/reply/update/:replyId", verifyToken, async (req, res) => {
  try {
    const { replyId } = req.params;
    const { comment_text } = req.body;

    // Validate required fields
    if (!comment_text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("Updating reply:", replyId);

    // Find and update the reply
    const updatedReply = await Comment.findByIdAndUpdate(
      replyId,
      { comment_text, updated_at: Date.now() },
      { new: true }
    );

    if (!updatedReply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    res.status(200).json(updatedReply);
  } catch (error) {
    console.error("Error updating reply:", error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a comment
router.delete("/delete/:commentId", verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    console.log("Deleting comment:", commentId);

    // Find the comment to delete
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // If the comment has replies, delete them as well
    if (comment.replies && comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    // Remove the comment from the associated annotation
    await Annotation.findByIdAndUpdate(comment.annotation_id, {
      $pull: { comments: commentId },
    });

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a reply
router.delete("/reply/delete/:replyId", verifyToken, async (req, res) => {
  try {
    const { replyId } = req.params;

    console.log("Deleting reply:", replyId);

    // Find the reply to delete
    const reply = await Comment.findById(replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Remove the reply from the parent comment
    await Comment.findByIdAndUpdate(reply.parent_comment_id, {
      $pull: { replies: replyId },
    });

    // Delete the reply
    await Comment.findByIdAndDelete(replyId);

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
