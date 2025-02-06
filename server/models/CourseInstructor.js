const mongoose = require('mongoose');

const courseInstructorSchema = new mongoose.Schema({
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    professor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    personal_num: { type: Number, required: true }, // เปลี่ยนเป็น personal_num
    course_number: { type: String, required: true },
    section_number: { type: Number, required: true },
});

module.exports = mongoose.model('CourseInstructor', courseInstructorSchema);
