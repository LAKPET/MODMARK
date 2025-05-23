const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    professor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    assessment_name: { type: String, required: true },
    assessment_description: { type: String },
    assignment_type: { type: String, enum: ['individual', 'group'], required: true },
    teamgrading_type: { type: Boolean, required: true }, // True if multiple graders, False if only the creator grades
    publish_date: { type: Date, required: true },
    due_date: { type: Date, default: Date.now, required: true },
    rubric_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rubric' } // เพิ่มฟิลด์ rubric_id
});

module.exports = mongoose.model('Assessment', assessmentSchema);
