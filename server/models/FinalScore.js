// models/FinalScore.js

const mongoose = require('mongoose');

const finalScoreSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  rubric_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rubric', required: true }, // Add rubric_id
  score: { type: Object, required: true }, // เปลี่ยนจาก Map มาเป็น Object
  total_score: { type: Number, required: true }, // Add total score
  status: { type: String, enum: ["pending", "graded"], default: "pending" } // Add status field
});

module.exports = mongoose.model('FinalScore', finalScoreSchema);
