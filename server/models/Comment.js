const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    annotation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Annotation' },
    submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    parent_comment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment_text: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
