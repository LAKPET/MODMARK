const express = require("express");
const CourseInstructor = require("../models/CourseInstructor");
const Section = require("../models/Section");
const User = require("../models/User"); // Import User model
const { verifyToken, checkAdminOrProfessor } = require("./middleware");

const router = express.Router();

// ลงทะเบียนอาจารย์ใน Section
router.post("/register-instructor", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { section_id, professor_id } = req.body;

  // ตรวจสอบว่ามีการส่งค่า section_id และ professor_id มาหรือไม่
  if (!section_id || !professor_id) {
    return res.status(400).json({ message: "section_id and professor_id are required" });
  }

  try {
    // ตรวจสอบว่า Section มีอยู่หรือไม่
    const section = await Section.findById(section_id).populate("course_id");
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // ตรวจสอบว่า User ที่เป็น Professor มีอยู่หรือไม่
    const professor = await User.findById(professor_id);
    if (!professor || professor.role !== "professor") {
      return res.status(404).json({ message: "Professor not found or not valid" });
    }

    // ตรวจสอบว่า Professor ได้ลงทะเบียนใน Section นี้แล้วหรือยัง
    const existingInstructor = await CourseInstructor.findOne({
      section_id: section._id,
      professor_id: professor_id,
    });

    if (existingInstructor) {
      return res.status(400).json({ message: "Instructor is already registered for this section" });
    }

    // สร้าง CourseInstructor ใหม่
    const newInstructor = new CourseInstructor({
      section_id: section._id,
      professor_id: professor_id,
      email: professor.email, // ใช้ข้อมูล email จาก User
      username: professor.username, // ใช้ข้อมูล username จาก User
      course_number: section.course_id.course_number,
      section_name: section.section_name,
    });

    await newInstructor.save();

    res.status(200).json({
      message: "Instructor successfully registered for the section",
      courseInstructor: newInstructor,
    });
  } catch (error) {
    console.error("Error registering instructor:", error.message);
    res.status(500).json({ message: "Error registering instructor" });
  }
});

module.exports = router;
