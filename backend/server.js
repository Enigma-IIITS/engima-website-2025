const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/database");
const { basicLimiter, authLimiter } = require("./middleware/rateLimiter");
require("dotenv").config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIX: Add a custom middleware to set the required header for images
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// This line serves the static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rate limiting
app.use(basicLimiter);
app.use("/api/auth", authLimiter);

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/events", require("./routes/events"));
app.use("/api/rsvp", require("./routes/rsvp"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/showcase", require("./routes/showcase"));
app.use("/api/members", require("./routes/members"));

// Health check and root routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Enigma Backend API",
    version: "1.0.0",
    status: "Running",
  });
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
