const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
    personal_num: { type: Number, required: true }, // เปลี่ยนเป็น personal_num
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    course_number: { type: String, required: true },
    section_number: { type: Number, required: true },
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
