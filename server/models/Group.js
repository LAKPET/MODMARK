const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    group_name: { type: String, required: true },
    group_type: { type: String, enum: ['study', 'grading'], required: true },
    status: { type: String, enum: ['submit', 'late', 'not-submit'], default: 'not-submit' }
});

module.exports = mongoose.model('Group', groupSchema);
