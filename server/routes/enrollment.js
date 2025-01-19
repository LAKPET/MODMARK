const express = require("express");
const Enrollment = require("../models/Enrollment");
const Section = require("../models/Section");
const { verifyToken, checkAdminOrStudent } = require("./middleware");

const router = express.Router();

// ลงทะเบียนนักเรียนใน Section
router.post("/enroll", verifyToken, checkAdminOrStudent, async (req, res) => {
  const { section_id, student_id } = req.body; // รับข้อมูล section_id และ student_id จาก body
  const studentId = student_id || req.user.id;  // ใช้ student_id จาก body หรือจาก token (ผู้ใช้ที่ล็อกอินอยู่)

  try {
    const section = await Section.findById(section_id).populate("course_id");

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const existingEnrollment = await Enrollment.findOne({
      student_id: studentId,
      section_id: section._id
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: "You are already enrolled in this section" });
    }

    const newEnrollment = new Enrollment({
      student_id: studentId,
      section_id: section._id,
      email: req.user.email,
      username: req.user.username,
      course_number: section.course_id.course_number,
      section_name: section.section_name,
    });

    await newEnrollment.save();

    res.status(200).json({
      message: "Successfully enrolled in the course section",
      enrollment: newEnrollment
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ message: "Error enrolling in course", error });
  }
});

module.exports = router;
