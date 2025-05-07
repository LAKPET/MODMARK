const fs = require("fs");
const path = require("path");
const multer = require("multer");
const bucket = require("./firebaseConfig"); // Import Firebase bucket
const { getSignedUrl } = require("@google-cloud/storage"); // Import getSignedUrl

// ตั้งค่า Local Storage
const localStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Upload File Function
const uploadFile = async(file) => {
  try {
    if (!file) return "";

    // ใช้ชื่อไฟล์ที่กำหนดเอง หรือสร้างชื่อไฟล์ใหม่
    const fileName = `PDF/${new Date().getTime()}_${file.originalname}`;

    const fileUpload = bucket.file(fileName);
    await fileUpload.save(fs.readFileSync(file.path), {
      metadata: { contentType: file.mimetype },
    });

    // ลบไฟล์ Local หลังจากอัปโหลด
    fs.unlinkSync(file.path);

    return fileName; // คืนค่าชื่อไฟล์ที่อัปโหลด
  } catch (error) {
    console.error("Error uploading file:", error);
    return "";
  }
};

const fetchFileFromStorage = async(path) => {
  try {
    let filePath;
    if (path.startsWith("/")) filePath = path.split("/")[1];
    else filePath = path;
    const file = bucket.file(filePath);

    // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
    const [exists] = await file.exists();
    if (!exists) {
      console.error("File not found in storage:", path);
      return "";
    }

    // สร้าง Signed URL สำหรับการเข้าถึงไฟล์
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // ลิงก์หมดอายุใน 1 ชั่วโมง
    });

    console.log(url);

    return url;
  } catch (error) {
    console.error("Error fetching file from storage:", error);
    return "";
  }
};

// Export Middleware & ฟังก์ชันอัปโหลด
module.exports = {
  upload: multer({ storage: localStorage }), // Middleware อัปโหลดไฟล์
  uploadFile,
  fetchFileFromStorage
};
