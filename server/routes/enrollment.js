const express = require("express");
const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const CourseInstructor = require("../models/CourseInstructor");
const User = require("../models/User");
const Section = require("../models/Section");
const bcrypt = require("bcryptjs");
const {
  verifyToken,
  checkAdmin,
  checkAdminOrProfessorOrTeacherAssistant,
} = require("./middleware");

const router = express.Router();

// ฟังก์ชันสำหรับลงทะเบียนนักเรียนใน Section
router.post("/enroll", verifyToken, checkAdminOrProfessorOrTeacherAssistant, async (req, res) => {
  const { section_id, students } = req.body;

  if (!section_id || !Array.isArray(students) || students.length === 0) {
    return res
      .status(400)
      .json({ message: "section_id and students are required" });
  }

  try {
    // ตรวจสอบว่า Section มีอยู่หรือไม่
    const section = await Section.findById(section_id).populate("course_id");
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const enrollments = [];

    for (const student of students) {
      const { personal_num, email } = student;
      const userByPersonalNum = await User.findOne({ personal_num });
      const userByEmail = await User.findOne({ email });

      if (!userByPersonalNum || !userByEmail) {
        return res.status(404).json({
          message: `User with personal_num ${personal_num} or email ${email} not found in the system`,
        });
      }

      if (userByPersonalNum._id.toString() !== userByEmail._id.toString()) {
        return res
          .status(400)
          .json({ message: "Personal number and email do not match" });
      }
      const user = userByPersonalNum;
      if (user.role !== "student") {
        return res.status(400).json({
          message: `User with personal_num ${personal_num} is not a student`,
        });
      }

      // ตรวจสอบว่า Student ได้ลงทะเบียนใน Section นี้แล้วหรือยัง
      const existingEnrollment = await Enrollment.findOne({
        section_id: section._id,
        personal_num: user.personal_num,
      });

      if (existingEnrollment) {
        continue; // ข้ามการลงทะเบียนถ้านักเรียนได้ลงทะเบียนแล้ว
      }

      // สร้าง Enrollment ใหม่
      const newEnrollment = new Enrollment({
        section_id: section._id,
        student_id: user._id,
        personal_num: user.personal_num,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        course_number: section.course_id.course_number,
        section_number: section.section_number,
        semester_term: section.semester_term,
        semester_year: section.semester_year,
      });

      await newEnrollment.save();
      enrollments.push(newEnrollment);
    }

    res.status(200).json({
      message: "Students successfully enrolled in the section",
      enrollments,
    });
  } catch (error) {
    console.error("Error enrolling students:", error.message);
    res.status(500).json({ message: "Error enrolling students" });
  }
});

// ฟังก์ชันสำหรับลบนักเรียนหรืออาจารย์จาก Section
router.post(
  "/unenroll",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { section_id, personal_id } = req.body;

    if (!section_id || !personal_id) {
      return res
        .status(400)
        .json({ message: "section_id and personal_num are required" });
    }

    try {
      // ตรวจสอบว่า Section มีอยู่หรือไม่
      const section = await Section.findById(section_id);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }

      // ลบ Enrollment ของนักเรียน
      const enrollment = await Enrollment.findOneAndDelete({
        section_id: section._id,
        student_id: personal_id,
      });

      // ลบ CourseInstructor ของอาจารย์
      const courseInstructor = await CourseInstructor.findOneAndDelete({
        section_id: section._id,
        professor_id: personal_id,
      });

      if (!enrollment && !courseInstructor) {
        return res
          .status(404)
          .json({ message: "Enrollment or CourseInstructor not found" });
      }

      res
        .status(200)
        .json({ message: "User successfully unenrolled from the section" });
    } catch (error) {
      console.error("Error unenrolling user:", error.message);
      res.status(500).json({ message: "Error unenrolling user" });
    }
  }
);

module.exports = router;
