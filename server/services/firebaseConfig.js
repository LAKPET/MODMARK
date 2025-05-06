const admin = require("firebase-admin");

// ใช้ path ตรงไปยังไฟล์ Service Account Key
const serviceAccount = require("D:/Project/MODMARK/modmark-79380-firebase-adminsdk-fbsvc-01eddb138f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Set this in your .env file
});

const bucket = admin.storage().bucket();

module.exports = bucket;
