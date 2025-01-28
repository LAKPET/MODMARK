const mongoose = require('mongoose');

const courseInstructorSchema = new mongoose.Schema({
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    personal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // เปลี่ยนเป็น ObjectId และอ้างอิงโมเดล User
    course_number: { type: String, required: true },
    section_number: { type: Number, required: true },
});

module.exports = mongoose.model('CourseInstructor', courseInstructorSchema);
