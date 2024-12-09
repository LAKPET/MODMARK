const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth"); // Import Route
require("dotenv").config();

const app = express();

// Middlewares
app.use(bodyParser.json());

// Add this line to handle root requests
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// เชื่อมต่อ MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/modmark')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('Database connection error:', err));

// Routes
app.use("/auth", authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
