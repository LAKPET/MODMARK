const express = require("express");
const CourseInstructor = require("../models/CourseInstructor");
const Section = require("../models/Section");
const { verifyToken, checkAdminOrProfessor } = require("./middleware");

const router = express.Router();

// ลงทะเบียนอาจารย์ใน Section
router.post("/register-instructor", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { section_id } = req.body; 
  const professor_id = req.user.id;
  
  try {
    const section = await Section.findById(section_id);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const existingInstructor = await CourseInstructor.findOne({
      section_id: section._id,
      professor_id
    });

    if (existingInstructor) {
      return res.status(400).json({ message: "Instructor is already registered for this section" });
    }

    const newInstructor = new CourseInstructor({
      section_id: section._id,
      professor_id,
      email: req.user.email,
      username: req.user.username,
      course_number: section.course_id.course_number,
      section_name: section.section_name,
    });

    await newInstructor.save();

    res.status(200).json({
      message: "Instructor successfully registered for the section",
      courseInstructor: newInstructor
    });
  } catch (error) {
    console.error("Error registering instructor:", error);
    res.status(500).json({ message: "Error registering instructor", error });
  }
});

module.exports = router;
