const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cloudinary = require("./cloudinaryConfig");
const { storageType } = require("./config");

// ตั้งค่า Local Storage
const localStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// ฟังก์ชันอัปโหลดไฟล์ (เลือก Local หรือ Cloud)
const uploadFile = async (file) => {
  if (storageType === "local") {
    return `/uploads/${file.filename}`; // ใช้ไฟล์ Local
  } else if (storageType === "cloud") {
    return await uploadToCloudinary(file); // ใช้ Cloud
  }
};

// อัปโหลดไปยัง Cloudinary
const uploadToCloudinary = async (file) => {
  const result = await cloudinary.uploader.upload(file.path);
  return result.secure_url; // URL ของไฟล์ที่อัปโหลด
};

// Export Middleware & ฟังก์ชันอัปโหลด
module.exports = {
  upload: multer({ storage: localStorage }), // Middleware อัปโหลดไฟล์
  uploadFile,
};
