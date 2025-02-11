const jwt = require("jsonwebtoken");
const redis = require("redis");
const User = require("../models/User");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

// ตรวจสอบว่า Redis เชื่อมต่อแล้วหรือไม่เมื่อแอปเริ่มทำงาน
const redisClient = redis.createClient();

redisClient.connect()
  .then(() => console.log("Redis connected successfully"))
  .catch(err => console.error("Redis connection error:", err));

redisClient.on('error', (err) => {
  console.log("Redis client error:", err);
});

// Middleware ตรวจสอบ token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// Middleware สำหรับตรวจสอบว่าเป็นแอดมินหรือไม่
const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Middleware สำหรับตรวจสอบว่าเป็นแอดมินหรืออาจารย์
const checkAdminOrProfessor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id); // ตรวจสอบว่าผู้ใช้มีอยู่ในฐานข้อมูลหรือไม่
    if (!user) {
      return res.status(404).json({ message: "User not found" }); // หากไม่พบผู้ใช้ ส่งสถานะ 404 พร้อมข้อความ
    }
    if (user.role !== "admin" && user.role !== "professor") {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Middleware สำหรับตรวจสอบว่าเป็นแอดมินหรืออาจารย์
const checkAdminOrStudent = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "student") {
    return res.status(403).json({
      message: "Only admins and student can access this resource"
    });
  }
  next();
};

module.exports = { verifyToken, checkAdmin, checkAdminOrProfessor, checkAdminOrStudent };
