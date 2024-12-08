const mongoose = require('mongoose');

const rawScoreSchema = new mongoose.Schema({
    professor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    score: { type: Number, required: true }
});

module.exports = mongoose.model('RawScore', rawScoreSchema);
