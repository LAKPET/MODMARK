const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  annotation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Annotation",
    required: true,
  }, // เพิ่ม field นี้เพื่อเชื่อมโยงกับ Annotation
  parent_comment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" }, // ใช้สำหรับ Reply
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment_text: { type: String, required: true },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // เก็บ Reply
  highlight_color: { type: String, default: "#ffeb3b" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", commentSchema);
