require("dotenv").config({ path: ".env" });
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const courseRoutes = require("./routes/course");
const courseInstructorRoutes = require("./routes/courseinstructor");
const enrollmentRoutes = require("./routes/enrollment");
const assessmentRoutes = require("./routes/assessment");
const sectionRoutes = require("./routes/section");
const rubricRoutes = require("./routes/rubric"); // Import rubric routes
const submissionRoutes = require("./routes/submission"); // Import submission routes
const annotationRoutes = require("./routes/annotation"); // Import annotation routes
const commentRoutes = require("./routes/comment"); // Import comment routes
const scoreRoutes = require("./routes/score"); // Import score routes

const app = express();

// const corsOptions = {
//   origin: 'http://localhost:5173', // URL ของ Frontend
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type'],
// };
// app.use(cors(corsOptions));
app.use(cors());

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// ใช้ตัวแปร DB_link จาก .env
const mongoUri = process.env.DB_link;

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/course", courseRoutes);
app.use("/course-instructor", courseInstructorRoutes); // เปลี่ยนเส้นทางเพื่อหลีกเลี่ยงความขัดแย้ง
app.use("/enrollment", enrollmentRoutes); // เปลี่ยนเส้นทางเพื่อหลีกเลี่ยงความขัดแย้ง
app.use("/assessment", assessmentRoutes);
app.use("/section", sectionRoutes);
app.use("/rubric", rubricRoutes); // Use rubric routes
app.use("/submission", submissionRoutes); // Use submission routes
app.use("/annotation", annotationRoutes); // Use annotation routes
app.use("/comment", commentRoutes); // Use comment routes
app.use("/score", scoreRoutes); // Use score routes

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

module.exports = { app };