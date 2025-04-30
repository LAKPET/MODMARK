const express = require("express");
const router = express.Router();
const Annotation = require("../models/Annotation");
const Comment = require("../models/Comment"); // เพิ่มการ require โมเดล Comment
const { verifyToken, checkAdminOrProfessorOrTeacherAssistant } = require("./middleware");

// Create a new annotation
router.post("/create", verifyToken, checkAdminOrProfessorOrTeacherAssistant, async (req, res) => {
  try {
    console.log("Creating annotation:", req.body);
    const {
      submission_id,
      file_url,
      page_number,
      highlight_text,
      bounding_box,
      professor_id,
      highlight_color, // Optional field
      comment_text, // รับ comment_text จาก body
    } = req.body;

    // ตรวจสอบค่าที่จำเป็น
    if (
      !submission_id ||
      !file_url ||
      !page_number ||
      !highlight_text ||
      !bounding_box ||
      !professor_id
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // สร้าง Annotation ใหม่
    const annotation = new Annotation({
      submission_id,
      file_url,
      page_number,
      highlight_text,
      bounding_box,
      professor_id,
      highlight_color, // ใช้ค่า default หากไม่ได้ส่งมา
    });

    await annotation.save();

    // ถ้ามี comment_text ให้สร้าง Comment ใหม่ที่เชื่อมโยงกับ Annotation
    if (comment_text) {
      const comment = new Comment({
        annotation_id: annotation._id,
        parent_comment_id: null,
        user_id: professor_id, // ใช้ professor_id เป็น user_id ของ comment
        comment_text: comment_text,
      });

      await comment.save();

      // เพิ่ม Comment ลงใน Annotation
      annotation.comments.push(comment._id);
      await annotation.save();
    }

    res.status(201).json({ annotation });
  } catch (error) {
    console.error("Error creating annotation:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get all annotations for a submission (with comments)
router.get("/submission/:submissionId", verifyToken, async (req, res) => {
  try {
    console.log(
      "Fetching annotations for submission:",
      req.params.submissionId
    );

    const annotations = await Annotation.find({
      submission_id: req.params.submissionId,
    })
      .populate("professor_id", "username first_name last_name email")
      .populate({
        path: "comments",
        populate: {
          path: "user_id",
          select: "username first_name last_name email",
        },
      });

    console.log("Found annotations:", annotations);
    res.json(annotations);
  } catch (error) {
    console.error("Error fetching annotations:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete an annotation
router.delete(
  "/delete/:id",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    try {
      console.log("Deleting annotation:", req.params.id);

      // Find the annotation first to get its comments
      const annotation = await Annotation.findById(req.params.id);
      if (!annotation) {
        return res.status(404).json({ message: "Annotation not found" });
      }

      // Delete all comments associated with this annotation
      await Comment.deleteMany({ annotation_id: req.params.id });

      // Delete the annotation
      await Annotation.findByIdAndDelete(req.params.id);

      res.json({
        message: "Annotation and associated comments deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting annotation:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
