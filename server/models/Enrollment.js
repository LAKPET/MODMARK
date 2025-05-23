const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // เพิ่ม student_id
    personal_num: { type: Number, required: true },
    email: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    course_number: { type: String, required: true },
    section_number: { type: Number, required: true },
    semester_term: { type: Number, required: true, enum: [1, 2] },
    semester_year: { type: Number, required: true, min: 2000, max: 2100 },
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
