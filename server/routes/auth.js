const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Model ที่สร้างไว้
const redis = require("redis");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// สร้าง Redis client และเชื่อมต่อ
const redisClient = redis.createClient();
redisClient.connect().catch(console.error); // จัดการข้อผิดพลาดในการเชื่อมต่อ

// Register User
router.post("/register", async (req, res) => {
    const { username, password, email, first_name, last_name, role } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) return res.status(400).json({ message: "User already exists." });

        const userRole = role || "student";
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password_hash: hashedPassword,
            email,
            first_name,
            last_name,
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
        if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials." });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful!", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
});

// Update Role for a User (only accessible by admin)
router.post("/update-role", async (req, res) => {
    const { email, role } = req.body;

    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token) return res.status(403).json({ message: "No token provided" });

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Only admins can update user roles" });
        }

        if (!["student", "professor", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findOneAndUpdate({ email }, { role }, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User role updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
    }
});

// Log out user
router.post("/logout", async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(400).json({ message: "No token provided" });
    }

    try {
        // ตรวจสอบว่า Redis เชื่อมต่อหรือไม่
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        // เพิ่ม token ใน Redis blacklist พร้อมตั้งค่าให้หมดอายุใน 1 ชั่วโมง
        await redisClient.setEx(token, 3600, "blacklisted");

        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error.message);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
});



// Middleware ตรวจสอบ token
const verifyToken = async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        // ตรวจสอบว่า token อยู่ใน blacklist หรือไม่
        const isBlacklisted = await redisClient.get(token);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Token has been logged out" });
        }

        // ตรวจสอบความถูกต้องของ token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // ส่งข้อมูลผู้ใช้ไปยัง route ถัดไป
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};



module.exports = router;
