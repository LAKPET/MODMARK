const fs = require("fs");
const path = require("path");
const multer = require("multer");
const bucket = require("./firebaseConfig"); // Import Firebase bucket

// ตั้งค่า Local Storage
const localStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// ฟังก์ชันอัปโหลดไฟล์ (ใช้ Firebase อย่างเดียว)
const uploadFile = async (file) => {
  return await uploadToFirebase(file); // ใช้ Firebase Cloud
};

// อัปโหลดไปยัง Firebase Cloud Storage
const uploadToFirebase = async (file) => {
  // เพิ่มโฟลเดอร์ PDF ในชื่อไฟล์
  const firebaseFileName = `PDF/${Date.now()}_${file.originalname}`;
  const fileUpload = bucket.file(firebaseFileName);

  await fileUpload.save(fs.readFileSync(file.path), {
    metadata: { contentType: file.mimetype },
  });

  // ลบไฟล์ Local หลังจากอัปโหลด
  fs.unlinkSync(file.path);

  return `https://storage.googleapis.com/${bucket.name}/${firebaseFileName}`;
};

// Export Middleware & ฟังก์ชันอัปโหลด
module.exports = {
  upload: multer({ storage: localStorage }), // Middleware อัปโหลดไฟล์
  uploadFile,
};
