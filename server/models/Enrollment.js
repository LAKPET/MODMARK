// models/Enrollment.js
const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
    personal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // เปลี่ยนเป็น ObjectId และอ้างอิงโมเดล User
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    course_number: { type: String, required: true },
    section_number: { type: Number, required: true },
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
