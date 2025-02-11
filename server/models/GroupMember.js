const mongoose = require('mongoose');

const groupMemberSchema = new mongoose.Schema({
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['student', 'professor'], required: true },
    weight: { type: Number, required: true }
});

module.exports = mongoose.model('GroupMember', groupMemberSchema);
