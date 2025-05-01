const mongoose = require('mongoose');

const studentScoreSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true }, // Add submission_id
  score: { type: Number, required: true }, // Individual score for the student
});

module.exports = mongoose.model('StudentScore', studentScoreSchema);
