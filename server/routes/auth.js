const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const redis = require("redis");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const redisClient = redis.createClient();
redisClient.connect().catch(console.error);

// Register User
router.post("/register", async (req, res) => {
  const { first_name, last_name, email, password, username, role } = req.body;

  // Validate required fields
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists." });

    const userRole = role || "student";
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      first_name,
      last_name,
      username,
      email,
      password_hash: hashedPassword,
      role: userRole,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials." });

    // สร้าง Token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // ลงทะเบียนโทเค็นใน Redis blacklist เมื่อ login
    await redisClient.setEx(token, 3600, "valid");

    // ส่งข้อมูลของผู้ใช้พร้อมกับ Token
    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

// Logout User
router.post("/logout", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // เปลี่ยนสถานะของโทเค็นใน Redis blacklist เป็น "blacklisted"
    await redisClient.setEx(token, 3600, "blacklisted"); // ใช้ setEx เพื่อบันทึกโทเค็นเป็น "blacklisted"

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

module.exports = router;
