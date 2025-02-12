const express = require("express");
const mongoose = require("mongoose");
const Rubric = require("../models/Rubric");
const { verifyToken, checkAdminOrProfessor } = require("./middleware");

const router = express.Router();

// Create a new rubric
router.post("/create", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { title, description, criteria, section_id } = req.body;

  try {
    const newRubric = new Rubric({
      rubric_name: title,
      description,
      criteria,
      created_by: req.user.id,
      section_id: section_id,
      is_global: false
    });

    await newRubric.save();
    res.status(201).json({ message: "Rubric created successfully!", rubric: newRubric });
  } catch (error) {
    console.error("Error creating rubric:", error);
    res.status(500).json({ message: "Error creating rubric", error });
  }
});

// Get all rubrics
router.get("/", verifyToken, checkAdminOrProfessor, async (req, res) => {
  try {
    const rubrics = await Rubric.find().populate("created_by", "first_name last_name email");
    res.status(200).json(rubrics);
  } catch (error) {
    console.error("Error fetching rubrics:", error);
    res.status(500).json({ message: "Error fetching rubrics", error });
  }
});

// Get a specific rubric by ID
router.get("/:id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { id } = req.params;

  try {
    const rubric = await Rubric.findById(id).populate("created_by", "first_name last_name email");
    if (!rubric) {
      return res.status(404).json({ message: "Rubric not found" });
    }
    res.status(200).json(rubric);
  } catch (error) {
    console.error("Error fetching rubric:", error);
    res.status(500).json({ message: "Error fetching rubric", error });
  }
});

// Get rubrics by section ID
router.get("/section/:section_id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { section_id } = req.params;

  try {
    const rubrics = await Rubric.find({ section_id: section_id }).populate("created_by", "first_name last_name email");
    if (rubrics.length === 0) {
      return res.status(404).json({ message: "No rubrics found for this section" });
    }
    res.status(200).json(rubrics);
  } catch (error) {
    console.error("Error fetching rubrics by section:", error);
    res.status(500).json({ message: "Error fetching rubrics by section", error });
  }
});

// Update a rubric
router.put("/update/:id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { id } = req.params;
  const { title, description, criteria, section_id, is_global } = req.body;

  try {
    const rubric = await Rubric.findById(id);
    if (!rubric) {
      return res.status(404).json({ message: "Rubric not found" });
    }

    rubric.rubric_name = title || rubric.rubric_name;
    rubric.description = description || rubric.description;
    rubric.criteria = criteria || rubric.criteria;
    rubric.section_id = section_id || rubric.section_id;
    rubric.is_global = is_global !== undefined ? is_global : rubric.is_global;

    await rubric.save();
    res.status(200).json({ message: "Rubric updated successfully!", rubric });
  } catch (error) {
    console.error("Error updating rubric:", error);
    res.status(500).json({ message: "Error updating rubric", error });
  }
});

// Delete a rubric
router.delete("/delete/:id", verifyToken, checkAdminOrProfessor, async (req, res) => {
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
});

module.exports = router;
