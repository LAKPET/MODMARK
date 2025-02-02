const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    section_number: { type: Number, required: true, min: 1 },
    semester_term: { type: Number, required: true, enum: [1, 2] },
    semester_year: { type: Number, required: true, min: 2000, max: 2100 },
    professor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    course_number: { type: String, required: true },  // เพิ่ม course_number
    course_name: { type: String, required: true },    // เพิ่ม course_name
});

module.exports = mongoose.model('Section', sectionSchema);
