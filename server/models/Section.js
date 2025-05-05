const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    section_number: { type: Number, required: true, min: 1 , unique: true},
    semester_term: { type: Number, required: true, enum: [1, 2] },
    semester_year: { type: Number, required: true, min: 2000, max: 2100 },
    course_number: { type: String, required: true },
    course_name: { type: String, required: true },
    personal_num: { type: Number, required: true } // เปลี่ยนเป็น personal_num
});

module.exports = mongoose.model('Section', sectionSchema);
