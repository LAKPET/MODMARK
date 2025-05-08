const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  file_url: { type: String, required: true }, // URL ของไฟล์ที่อัปโหลด
  file_type: { type: String, enum: ['doc', 'link', 'pdf', 'video', 'audio'], required: true },
  submitted_at: { type: Date, default: Date.now },
  status: { type: String, enum: ['submit', 'late', 'not-submit'], default: 'not-submit' },
  grading_status: { type: String, enum: ['pending', 'already'], default: 'pending' },
  grading_status_by: {
    type: [
      {
        grader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['professor', 'ta'] },
        status: { type: String, enum: ['pending', 'already'], default: 'pending' }
      }
    ],
    default: []
  },
});

module.exports = mongoose.model('Submission', submissionSchema);