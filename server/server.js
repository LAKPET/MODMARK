require("dotenv").config({ path: ".env" });
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const fetch = require("node-fetch");

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
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

app.get("/pdf", async (req, res) => {
  const fileUrl = req.query.url;
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error fetching PDF:", error);
    res.status(500).send("Error fetching PDF");
  }
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
