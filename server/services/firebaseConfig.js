const admin = require("firebase-admin");

// ใช้ path ตรงไปยังไฟล์ Service Account Key
const serviceAccount = require(process.env.FIREBASE_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Set this in your .env file
});

const bucket = admin.storage().bucket();

module.exports = bucket;
