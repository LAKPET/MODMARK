const admin = require("firebase-admin");

// ใช้ path ตรงไปยังไฟล์ Service Account Key
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // แปลง \n กลับเป็น newline จริง
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Set this in your .env file
});

const bucket = admin.storage().bucket();

module.exports = bucket;
