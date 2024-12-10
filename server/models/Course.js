const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  course_number: { type: String, required: true },
  course_name: { type: String, required: true },
  course_description: { type: String },
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }]  // เชื่อมโยง Section ที่เกี่ยวข้อง
});

module.exports = mongoose.model('Course', courseSchema);
