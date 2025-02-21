const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateToken, logout } = require("./middleware");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register User
router.post("/register", async (req, res) => {
  const { personal_num, first_name, last_name, email, password, username, role } = req.body;

  // Validate required fields
  if (!personal_num || !first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ personal_num });
    if (existingUser)
      return res.status(400).json({ message: "This Personal Number already exists." });

    const userRole = role || "student";
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      personal_num,
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
    const token = await generateToken(user);

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
        personal_num: user.personal_num,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

// Logout User
router.post("/logout", logout);

module.exports = router;
