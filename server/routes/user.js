const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Ensure path is correct
const Section = require("../models/Section");
const Enrollment = require("../models/Enrollment");
const CourseInstructor = require("../models/CourseInstructor");
const {
  verifyToken,
  checkAdmin,
  checkAdminOrProfessorOrTeacherAssistant,
} = require("./middleware");

const router = express.Router();

// ฟังก์ชันสำหรับสร้างผู้ใช้ใหม่ (เฉพาะแอดมิน)
router.post("/create", verifyToken, checkAdmin, async (req, res) => {
  const {
    personal_num,
    first_name,
    last_name,
    username,
    email,
    password,
    role,
  } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (
    !personal_num ||
    !first_name ||
    !last_name ||
    !email ||
    !username ||
    !password
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // ตรวจสอบว่าผู้ใช้นี้มีอยู่ในระบบหรือไม่
    const existingUserByPersonalNum = await User.findOne({ personal_num });
    if (existingUserByPersonalNum) {
      return res
        .status(400)
        .json({ message: "User with this personal number already exists." });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // เข้ารหัสรหัสผ่านก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, 10); // ใช้ bcrypt เพื่อเข้ารหัสรหัสผ่าน

    // กำหนด role หากไม่มี ให้เป็น "student" โดย default
    const userRole = role || "student";

    // สร้างผู้ใช้ใหม่
    const newUser = new User({
      personal_num,
      first_name,
      last_name,
      username,
      email,
      password_hash: hashedPassword, // ใช้รหัสผ่านที่ถูกเข้ารหัสแล้ว
      role: userRole,
    });

    // บันทึกผู้ใช้ใหม่ลงในฐานข้อมูล
    await newUser.save();

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error });
  }
});

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ทั้งหมด (สำหรับแอดมิน)
router.post("/all", verifyToken, checkAdmin, async (req, res) => {
  const { course_number, section_number, semester_term, semester_year } =
    req.body;

  try {
    let users;

    if (course_number && section_number && semester_term && semester_year) {
      // Find sections that match the provided course number, section number, term, and year
      const sections = await Section.find({
        course_number: course_number,
        section_number: section_number,
        semester_term: semester_term,
        semester_year: semester_year,
      });

      if (sections.length === 0) {
        return res.status(404).json({
          message: "No sections found matching the provided criteria",
        });
      }

      // Find users who are enrolled in or instructing the found sections
      const sectionIds = sections.map((section) => section._id);
      const enrollments = await Enrollment.find({
        section_id: { $in: sectionIds },
      }).populate("student_id");
      const instructors = await CourseInstructor.find({
        section_id: { $in: sectionIds },
      }).populate("professor_id");

      // Combine students and professors into a single list of users
      users = [
        ...enrollments.map((enrollment) => enrollment.student_id),
        ...instructors.map((instructor) => instructor.professor_id),
      ];
    } else {
      // If no filtering criteria are provided, return all users
      users = await User.find();
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
});

// ฟังก์ชันสำหรับดึงข้อมูลโปรไฟล์ (เฉพาะแอดมินและเจ้าของข้อมูล)
router.get("/profile/:id", verifyToken, async (req, res) => {
  const { id } = req.params; // รับ id จาก URL params

  try {
    const user = await User.findById(id);

    // ตรวจสอบว่า user มีอยู่หรือไม่
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ตรวจสอบว่า user ที่ร้องขอกับ user ที่กำลังล็อกอินมี id ตรงกันหรือไม่
    // หรือว่าเป็น admin
    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to access this resource",
      });
    }

    // ส่งข้อมูลโปรไฟล์กลับไป
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
});

// ฟังก์ชันสำหรับลบผู้ใช้ (เฉพาะแอดมิน)
router.delete("/delete/:id", verifyToken, checkAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ลบข้อมูลผู้ใช้ในตาราง Enrollment ที่เกี่ยวข้อง
    await Enrollment.deleteMany({ student_id: user._id });

    // ลบข้อมูลผู้ใช้ในตาราง CourseInstructor ที่เกี่ยวข้อง
    await CourseInstructor.deleteMany({ professor_id: user._id });

    // ลบผู้ใช้ออกจากฐานข้อมูล
    await user.deleteOne();

    res
      .status(200)
      .json({ message: "User and related records deleted successfully!" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
});

// ฟังก์ชันสำหรับแก้ไขข้อมูลผู้ใช้ (เจ้าของข้อมูลและแอดมิน)
router.put("/update/:id", verifyToken, checkAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    personal_num,
    first_name,
    last_name,
    username,
    email,
    password,
    role,
  } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ตรวจสอบว่า user ที่ร้องขอกับ user ที่กำลังล็อกอินมี id ตรงกันหรือไม่ หรือว่าเป็น admin
    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to update this user",
      });
    }

    // ตรวจสอบว่าค่า personal_num และ email ที่ต้องการอัปเดตไม่มีอยู่ในระบบ
    if (personal_num && personal_num !== user.personal_num) {
      const existingUserByPersonalNum = await User.findOne({ personal_num });
      if (existingUserByPersonalNum) {
        return res
          .status(400)
          .json({ message: "User with this personal number already exists." });
      }
      user.personal_num = personal_num;
    }

    if (email && email !== user.email) {
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return res
          .status(400)
          .json({ message: "User with this email already exists." });
      }
      user.email = email;
    }

    // ปรับปรุงข้อมูลผู้ใช้ที่ต้องการแก้ไข
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (username) user.username = username;
    if (password) {
      user.password_hash = await bcrypt.hash(password, 10); // เข้ารหัสรหัสผ่านใหม่
    }
    if (req.user.role === "admin" && role) {
      user.role = role; // อนุญาตให้แอดมินเปลี่ยน role
    }

    // บันทึกการเปลี่ยนแปลง
    await user.save();

    // อัปเดตข้อมูลในตาราง Enrollment ที่เกี่ยวข้อง
    await Enrollment.updateMany(
      { student_id: user._id },
      {
        personal_num: user.personal_num,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      }
    );

    // อัปเดตข้อมูลในตาราง CourseInstructor ที่เกี่ยวข้อง
    await CourseInstructor.updateMany(
      { professor_id: user._id },
      {
        personal_num: user.personal_num,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      }
    );

    res
      .status(200)
      .json({ message: "User and related records updated successfully!" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
});

// ฟังก์ชันสำหรับดึงรายชื่อของ professor ทั้งหมดในระบบ
router.get("/all-professors", verifyToken, checkAdmin, async (req, res) => {
  try {
    const professors = await User.find({ role: { $in: ["professor", "ta"] } }); // Include both professor and TA
    res.status(200).json(professors);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
});

module.exports = router;
