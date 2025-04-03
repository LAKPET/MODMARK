const express = require("express");
const router = express.Router();
const Annotation = require("../models/Annotation");
const { verifyToken, checkAdminOrProfessor } = require("./middleware");

// Create a new annotation
router.post("/create", verifyToken, checkAdminOrProfessor, async (req, res) => {
  try {
    console.log("Creating annotation:", req.body);
    const annotation = new Annotation(req.body);
    await annotation.save();
    res.status(201).json(annotation);
  } catch (error) {
    console.error("Error creating annotation:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get all annotations for a submission
router.get("/submission/:submissionId", verifyToken, async (req, res) => {
  try {
    console.log(
      "Fetching annotations for submission:",
      req.params.submissionId
    );
    const annotations = await Annotation.find({
      submission_id: req.params.submissionId,
    }).populate("professor_id", "username first_name last_name email"); // เพิ่ม username
    console.log("Found annotations:", annotations);
    res.json(annotations);
  } catch (error) {
    console.error("Error fetching annotations:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add a comment to an annotation
router.post(
  "/:id/comment",
  verifyToken,
  checkAdminOrProfessor,
  async (req, res) => {
    try {
      console.log("Adding comment to annotation:", req.params.id);
      const annotation = await Annotation.findById(req.params.id);
      if (!annotation) {
        return res.status(404).json({ message: "Annotation not found" });
      }
      annotation.comment = req.body.comment;
      await annotation.save();
      res.json(annotation);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete an annotation
router.delete("/:id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  try {
    console.log("Deleting annotation:", req.params.id);
    const annotation = await Annotation.findByIdAndDelete(req.params.id);
    if (!annotation) {
      return res.status(404).json({ message: "Annotation not found" });
    }
    res.json({ message: "Annotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting annotation:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
