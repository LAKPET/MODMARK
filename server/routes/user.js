const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Ensure path is correct
const { verifyToken, checkAdmin } = require("./middleware");

const router = express.Router();

// ฟังก์ชันสำหรับสร้างผู้ใช้ใหม่ (เฉพาะแอดมิน)
router.post("/create", verifyToken, checkAdmin, async (req, res) => {
  const { first_name, last_name, username, email, password, role } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!first_name || !last_name || !email || !username || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // ตรวจสอบว่าผู้ใช้นี้มีอยู่ในระบบหรือไม่
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // เข้ารหัสรหัสผ่านก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, 10); // ใช้ bcrypt เพื่อเข้ารหัสรหัสผ่าน

    // กำหนด role หากไม่มี ให้เป็น "student" โดย default
    const userRole = role || "student";

    // สร้างผู้ใช้ใหม่
    const newUser = new User({
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
router.get("/all", verifyToken, checkAdmin, async (req, res) => {
  // เพิ่ม verifyToken ก่อน checkAdmin
  try {
    const users = await User.find();
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
  // เพิ่ม verifyToken ก่อน checkAdmin
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    // เปลี่ยนสถานะเป็น 'deleted' แทนการลบ
    user.isDeleted = false;
    await user.save();

    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
});

// ฟังก์ชันสำหรับแก้ไขข้อมูลผู้ใช้ (เจ้าของข้อมูลและแอดมิน)
router.put("/update/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, username, email, password, role, isDeleted } =
    req.body;

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

    // ปรับปรุงข้อมูลผู้ใช้ที่ต้องการแก้ไข
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      user.password_hash = await bcrypt.hash(password, 10); // เข้ารหัสรหัสผ่านใหม่
    }
    if (req.user.role === "admin" && role) {
      user.role = role; // อัปเดต role เฉพาะเมื่อเป็น admin
    }
    if (typeof isDeleted !== "undefined") user.isDeleted = isDeleted; // ตรวจสอบว่ามีการส่ง isDeleted มาหรือไม่

    // บันทึกการเปลี่ยนแปลง
    await user.save();

    res.status(200).json({ message: "User updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
});

module.exports = router;
