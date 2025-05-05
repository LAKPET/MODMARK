const mongoose = require('mongoose');

const studentScoreSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true }, // Add section_id
  submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  score: { type: Number, required: true },
});

module.exports = mongoose.model('StudentScore', studentScoreSchema);
