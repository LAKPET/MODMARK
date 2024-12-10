const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "professor", "admin"],
    default: "student",
  },
  email: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
