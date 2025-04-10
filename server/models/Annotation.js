const mongoose = require("mongoose");

const annotationSchema = new mongoose.Schema({
  submission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission",
    required: true,
  },
  file_url: { type: String, required: true },
  page_number: { type: Number, required: true },
  highlight_text: { type: String, required: true },
  bounding_box: { type: Object, required: true },
  professor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  highlight_color: { type: String, default: "#ffeb3b" },
  comment: { type: String, required: false },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // เก็บรายการ Comment
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Annotation", annotationSchema);
