const mongoose = require('mongoose');

const courseInstructorSchema = new mongoose.Schema({
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    professor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('CourseInstructor', courseInstructorSchema);
