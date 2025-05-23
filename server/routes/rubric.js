const express = require("express");
const mongoose = require("mongoose");
const Rubric = require("../models/Rubric");
const Section = require("../models/Section"); // Add this line to import the Section model
const {
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
} = require("./middleware");

const router = express.Router();

// Create a new rubric
router.post(
  "/create",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { title, description, score, criteria, section_id } = req.body;

    try {
      // Check if the section_id exists
      const section = await Section.findById(section_id);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }

      const newRubric = new Rubric({
        rubric_name: title,
        description,
        score,
        criteria,
        created_by: req.user.id,
        section_id: section_id,
        is_global: false,
      });

      await newRubric.save();
      res
        .status(201)
        .json({ message: "Rubric created successfully!", rubric: newRubric });
    } catch (error) {
      console.error("Error creating rubric:", error);
      res.status(500).json({ message: "Error creating rubric", error });
    }
  }
);

// Get all rubrics
router.get("/", verifyToken, async (req, res) => {
  try {
    const rubrics = await Rubric.find().populate(
      "created_by",
      "first_name last_name email"
    );
    res.status(200).json(rubrics);
  } catch (error) {
    console.error("Error fetching rubrics:", error);
    res.status(500).json({ message: "Error fetching rubrics", error });
  }
});

// Get a specific rubric by ID
router.get(
  "/:id",
  verifyToken,

  async (req, res) => {
    const { id } = req.params;

    try {
      const rubric = await Rubric.findById(id).populate(
        "created_by",
        "first_name last_name email"
      );
      if (!rubric) {
        return res.status(404).json({ message: "Rubric not found" });
      }
      res.status(200).json(rubric);
    } catch (error) {
      console.error("Error fetching rubric:", error);
      res.status(500).json({ message: "Error fetching rubric", error });
    }
  }
);

// Get rubrics by section ID
router.get(
  "/section/:section_id",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { section_id } = req.params;

    try {
      const rubrics = await Rubric.find({ section_id: section_id }).populate(
        "created_by",
        "first_name last_name email"
      );
      if (rubrics.length === 0) {
        return res
          .status(404)
          .json({ message: "No rubrics found for this section" });
      }
      res.status(200).json(rubrics);
    } catch (error) {
      console.error("Error fetching rubrics by section:", error);
      res
        .status(500)
        .json({ message: "Error fetching rubrics by section", error });
    }
  }
);

// Update a rubric
router.put(
  "/update/:id",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { id } = req.params;
    const { title, description, criteria, score, section_id, is_global } =
      req.body;

    try {
      const rubric = await Rubric.findById(id);
      if (!rubric) {
        return res.status(404).json({ message: "Rubric not found" });
      }

      rubric.rubric_name = title || rubric.rubric_name;
      rubric.description = description || rubric.description;
      rubric.score = score || rubric.score;
      rubric.criteria = criteria || rubric.criteria;
      rubric.section_id = section_id || rubric.section_id;
      rubric.is_global = is_global !== undefined ? is_global : rubric.is_global;

      await rubric.save();
      res.status(200).json({ message: "Rubric updated successfully!", rubric });
    } catch (error) {
      console.error("Error updating rubric:", error);
      res.status(500).json({ message: "Error updating rubric", error });
    }
  }
);

// Delete a rubric
router.delete(
  "/delete/:id",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { id } = req.params;

    try {
      const rubric = await Rubric.findById(id);
      if (!rubric) {
        return res.status(404).json({ message: "Rubric not found" });
      }

      await rubric.deleteOne();
      res.status(200).json({ message: "Rubric deleted successfully!" });
    } catch (error) {
      console.error("Error deleting rubric:", error);
      res.status(500).json({ message: "Error deleting rubric", error });
    }
  }
);

module.exports = router;
