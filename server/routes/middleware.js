const jwt = require("jsonwebtoken");
const redis = require("redis");
const User = require("../models/User");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = 8 * 60 * 60; // 8 ชั่วโมง (วินาที)

const redisClient = redis.createClient();
// const redisClient = redis.createClient({
//   socket: {
//     host: process.env.REDIS_HOST || "127.0.0.1",
//     port: process.env.REDIS_PORT || 6379
//   }
// });


redisClient.connect()
  .then(() => console.log("Redis connected successfully"))
  .catch(err => console.error("Redis connection error:", err));

redisClient.on("error", (err) => {
  console.log("Redis client error:", err);
});

// 🔥 สร้าง Token (เรียกใช้ในระบบ Authentication เช่น Login)
const generateToken = async (user) => {
  const token = jwt.sign({ id: user._id, role: user.role, email: user.email, first_name: user.first_name, last_name: user.last_name, username: user.username, personal_num: user.personal_num }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
  await redisClient.set(token, "valid", { EX: TOKEN_EXPIRATION }); // กำหนดอายุ 8 ชั่วโมง
  return token;
};

// ✅ Middleware ตรวจสอบ Token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Access Denied" });
    }

    // ตรวจสอบ token ใน Redis
    const tokenExists = await redisClient.get(token);
    if (!tokenExists) {
      return res.status(401).json({ message: "Invalid or Expired Token" });
    }

    // ตรวจสอบ JWT
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid Token", error: error.message });
  }
};

// ✅ ลบ Token ออกจากระบบ (Logout)
const logout = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      await redisClient.del(token); // ลบ Token ออกจาก Redis
    }
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

// ✅ Middleware ตรวจสอบ Role
const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const checkAdminOrProfessor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== "admin" && user.role !== "professor")) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const checkAdminOrProfessorOrStudent = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== "admin" && user.role !== "professor" && user.role !== "student")) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const checkAdminOrProfessorOrTeacherAssistant = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== "admin" && user.role !== "professor" && user.role !== "ta")) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const checkAdminOrStudent = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "student")) {
    return res.status(403).json({
      message: "Only admins and students can access this resource",
    });
  }
  next();
};

module.exports = { 
  generateToken, 
  verifyToken, 
  logout, 
  checkAdmin, 
  checkAdminOrProfessor, 
  checkAdminOrProfessorOrStudent, 
  checkAdminOrProfessorOrTeacherAssistant,
  checkAdminOrStudent 
};
