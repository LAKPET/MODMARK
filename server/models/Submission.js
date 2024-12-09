const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    file_url: { type: String, required: true },
    file_type: { type: String, enum: ['doc', 'link', 'photo', 'video', 'audio'], required: true },
    submitted_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['submit', 'late', 'not-submit'], default: 'not-submit' },
    grading_status: { type: String, enum: ['pending', 'already'], default: 'pending' },
    score: { type: Number }
});

module.exports = mongoose.model('Submission', submissionSchema);
