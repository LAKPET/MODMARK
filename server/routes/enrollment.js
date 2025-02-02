const express = require("express");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const Section = require("../models/Section");
const bcrypt = require("bcryptjs");
const { verifyToken, checkAdmin } = require("./middleware");

const router = express.Router();

// ฟังก์ชันสำหรับลงทะเบียนนักเรียนใน Section
router.post("/enroll", verifyToken, checkAdmin, async (req, res) => {
  const { section_id, students } = req.body;

  if (!section_id || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: "section_id and students are required" });
  }

  try {
    // ตรวจสอบว่า Section มีอยู่หรือไม่
    const section = await Section.findById(section_id).populate("course_id");
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const enrollments = [];

    for (const student of students) {
      const { personal_id, first_name, last_name, email } = student;

      // ตรวจสอบว่า User ที่เป็น Student มีอยู่หรือไม่
      let user = await User.findOne({ personal_id });
      if (!user) {
        // ถ้าไม่มี User ให้สร้างใหม่
        const username = email;
        const password_hash = await bcrypt.hash(`password${personal_id}`, 10);

        user = new User({
          personal_id,
          first_name,
          last_name,
          email,
          username,
          password_hash,
          role:"student",
        });
        await user.save();
      }

      // ตรวจสอบว่า Student ได้ลงทะเบียนใน Section นี้แล้วหรือยัง
      const existingEnrollment = await Enrollment.findOne({
        section_id: section._id,
        personal_id: user.personal_id,
      });

      if (existingEnrollment) {
        continue; // ข้ามการลงทะเบียนถ้านักเรียนได้ลงทะเบียนแล้ว
      }

      // สร้าง Enrollment ใหม่
      const newEnrollment = new Enrollment({
        section_id: section._id,
        personal_id: user.personal_id,
        first_name: user.first_name,
        last_name: user.last_name,
        course_number: section.course_id.course_number,
        section_number: section.section_number, // เปลี่ยนจาก section_name เป็น section_number
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

module.exports = router;
