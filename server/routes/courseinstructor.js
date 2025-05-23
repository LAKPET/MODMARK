const express = require("express");
const CourseInstructor = require("../models/CourseInstructor");
const Section = require("../models/Section");
const User = require("../models/User"); // Import User model
const bcrypt = require("bcryptjs");
const { verifyToken, checkAdminOrProfessorOrTeacherAssistant } = require("./middleware");

const router = express.Router();

// ลงทะเบียนอาจารย์ใน Section
router.post("/register-instructor", verifyToken, checkAdminOrProfessorOrTeacherAssistant, async (req, res) => {
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

    // ตรวจสอบรายชื่อที่ซ้ำทั้งหมดก่อน register
    const alreadyRegistered = [];
    for (const professor of professors) {
      const { personal_num, email } = professor;

      // ตรวจสอบว่า User ที่เป็น Professor หรือ TA มีอยู่หรือไม่
      const userByPersonalNum = await User.findOne({ personal_num });
      const userByEmail = await User.findOne({ email });

      if (!userByPersonalNum || !userByEmail) {
        return res.status(404).json({ message: `User with personal_num ${personal_num} or email ${email} not found in the system` });
      }

      if (userByPersonalNum._id.toString() !== userByEmail._id.toString()) {
        return res.status(400).json({ message: "Personal number and email do not match" });
      }

      const user = userByPersonalNum;

      if (user.role !== "professor" && user.role !== "ta") {
        return res.status(400).json({ message: `User with personal_num ${personal_num} is not a professor or teaching assistant` });
      }

      // ตรวจสอบว่า Professor หรือ TA ได้ลงทะเบียนใน Section นี้แล้วหรือยัง
      const existingInstructor = await CourseInstructor.findOne({
        section_id: section._id,
        personal_num: user.personal_num,
      });

      if (existingInstructor) {
        alreadyRegistered.push({
          personal_num: user.personal_num,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        });
      }
    }

    // ถ้ามีรายชื่อซ้ำ ส่ง 400 กลับทันทีและไม่ register ใครเลย
    if (alreadyRegistered.length > 0) {
      const names = alreadyRegistered.map(
        (u) => `${u.first_name} ${u.last_name} (${u.personal_num})`
      ).join(", ");
      return res.status(400).json({
        message: `Some instructors are already registered in the section: ${names}`,
        alreadyRegistered,
      });
    }

    // ถ้าไม่มีรายชื่อซ้ำ ให้ register ได้ตามปกติ
    const registeredInstructors = [];
    for (const professor of professors) {
      const { personal_num, email } = professor;
      const user = await User.findOne({ personal_num, email });

      // สร้าง CourseInstructor ใหม่
      const newInstructor = new CourseInstructor({
        section_id: section._id,
        professor_id: user._id,
        personal_num: user.personal_num,
        role: user.role,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        course_number: section.course_id.course_number,
        section_number: section.section_number,
        semester_term: section.semester_term,
        semester_year: section.semester_year,
      });

      await newInstructor.save();
      registeredInstructors.push(newInstructor);
    }

    res.status(200).json({
      message: "Professors and teaching assistants successfully registered for the section",
      registeredInstructors,
      alreadyRegistered: [],
    });
  } catch (error) {
    console.error("Error registering instructors:", error.message);
    res.status(500).json({ message: "Error registering instructors" });
  }
});

module.exports = router;
