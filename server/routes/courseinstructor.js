const express = require("express");
const CourseInstructor = require("../models/CourseInstructor");
const Section = require("../models/Section");
const User = require("../models/User"); // Import User model
const bcrypt = require("bcryptjs");
const { verifyToken, checkAdminOrProfessor } = require("./middleware");

const router = express.Router();

// ลงทะเบียนอาจารย์ใน Section
router.post("/register-instructor", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { section_id, professors } = req.body;

  // ตรวจสอบว่ามีการส่งค่า section_id และ professors มาหรือไม่
  if (!section_id || !Array.isArray(professors) || professors.length === 0) {
    return res.status(400).json({ message: "section_id and professors are required" });
  }

  try {
    // ตรวจสอบว่า Section มีอยู่หรือไม่
    const section = await Section.findById(section_id).populate("course_id");
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const registeredInstructors = [];

    for (const professor of professors) {
      const { personal_id, first_name, last_name, email } = professor;

      // ตรวจสอบว่า User ที่เป็น Professor มีอยู่หรือไม่
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
          role: "professor",
        });
        await user.save();
      } else if (user.role !== "professor") {
        return res.status(400).json({ message: `User with personal_id ${personal_id} is not a professor` });
      }

      // ตรวจสอบว่า Professor ได้ลงทะเบียนใน Section นี้แล้วหรือยัง
      const existingInstructor = await CourseInstructor.findOne({
        section_id: section._id,
        personal_id: user.personal_id,
      });

      if (existingInstructor) {
        continue; // ข้ามการลงทะเบียนถ้าอาจารย์ได้ลงทะเบียนแล้ว
      }

      // สร้าง CourseInstructor ใหม่
      const newInstructor = new CourseInstructor({
        section_id: section._id,
        personal_id: user.personal_id,
        email: user.email,
        username: user.username,
        course_number: section.course_id.course_number,
        section_number: section.section_number,
      });

      await newInstructor.save();
      registeredInstructors.push(newInstructor);
    }

    res.status(200).json({
      message: "Professors successfully registered for the section",
      registeredInstructors,
    });
  } catch (error) {
    console.error("Error registering instructors:", error.message);
    res.status(500).json({ message: "Error registering instructors" });
  }
});

module.exports = router;
