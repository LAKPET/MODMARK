const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    section_name: { type: Number, required: true },
    semester_term: { type: Number, required: true },
    semester_year: { type: Number, required: true },
    professor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Section', sectionSchema);
