// models/Enrollment.js
const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    course_number: { type: String, required: true }, // เพิ่มรหัสวิชา
    section_name: { type: Number, required: true }, // เพิ่มชื่อ section
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
