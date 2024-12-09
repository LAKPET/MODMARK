const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    course_number: { type: String, required: true },
    course_name: { type: String, required: true },
    course_description: { type: String }
});

module.exports = mongoose.model('Course', courseSchema);
