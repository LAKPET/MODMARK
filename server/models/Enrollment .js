const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true }
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
