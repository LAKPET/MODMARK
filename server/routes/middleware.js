const jwt = require("jsonwebtoken");
const redis = require("redis");
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
const verifyToken = async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // ดึง token
    if (!token) return res.status(403).json({ message: "No token provided" });
  
    console.log("Received token:", token);  // เพิ่ม log ดูว่า token ที่ส่งมาคืออะไร
    
    try {
      // ตรวจสอบว่า token อยู่ใน blacklist หรือไม่
      const isBlacklisted = await redisClient.get(token);
      console.log("Token blacklist status:", isBlacklisted); // เพิ่ม log เพื่อตรวจสอบสถานะของ token
      if (isBlacklisted === "blacklisted") {
        return res.status(401).json({ message: "Token has been logged out" });
      }
  
      // ตรวจสอบความถูกต้องของ token
      const decoded = jwt.verify(token, JWT_SECRET);
  
      console.log("Decoded user info:", decoded); // เพิ่ม log ที่นี่
  
      if (!decoded || !decoded.role ) {
        return res.status(401).json({ message: "Invalid token data" });
      }
  
      // ตั้งค่า req.user ด้วยข้อมูลจาก decoded
      req.user = decoded; // ตรวจสอบว่า req.user ถูกตั้งค่าหรือไม่
  
      // ส่งข้อมูลผู้ใช้ไปยัง route ถัดไป
      next();
    } catch (error) {
      console.error("Error in verifyToken:", error);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token has expired" });
      }
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };

// Middleware สำหรับตรวจสอบว่าเป็นแอดมินหรือไม่
const checkAdmin = (req, res, next) => {
    // ตรวจสอบว่า req.user ถูกตั้งค่าหรือไม่
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: `User ${req.user?.username || req.user?.id} is not authorized to access this resource. Only admins can access this resource.`
      });
    }
    next();
  };
  
// Middleware สำหรับตรวจสอบว่าเป็นแอดมินหรืออาจารย์
const checkAdminOrProfessor = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "professor") {
    return res.status(403).json({
      message: "Only admins and professors can access this resource"
    });
  }
  next();
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
