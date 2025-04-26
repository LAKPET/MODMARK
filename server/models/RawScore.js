const mongoose = require('mongoose');

const rawScoreSchema = new mongoose.Schema({
    professor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    rubric_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rubric', required: true }, // Add rubric_id
    score: { type: Map, of: Number, required: true }, // Store scores as a map of criteria to values
    total_score: { type: Number, required: true } // Add total score
});

module.exports = mongoose.model('RawScore', rawScoreSchema);
