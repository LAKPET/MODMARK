const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const courseRoutes = require("./routes/course");
const courseInstructorRoutes = require("./routes/courseinstructor");
const enrollmentRoutes = require("./routes/enrollment");
const assessmentRoutes = require("./routes/assessment");
require("dotenv").config();

const app = express();
const cors = require("cors");
app.use(cors()); // เพิ่ม middleware นี้

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

mongoose
  .connect("mongodb://127.0.0.1:27017/modmark")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/course", courseRoutes);
app.use("/course-instructor", courseInstructorRoutes); // เปลี่ยนเส้นทางเพื่อหลีกเลี่ยงความขัดแย้ง
app.use("/enrollment", enrollmentRoutes); // เปลี่ยนเส้นทางเพื่อหลีกเลี่ยงความขัดแย้ง
app.use("/assessment", assessmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
