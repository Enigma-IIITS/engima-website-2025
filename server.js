// const express = require("express");
// const dotenv = require("dotenv");
// const connectDB = require("./config/db");
// const path = require("path");

// dotenv.config();
// connectDB();

// const app = express();

// // parse JSON/form bodies
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Routes
// app.use("/api/about", require("./routes/clubInfoRoutes"));
// app.use("/api/events", require("./routes/eventRoutes"));
// app.use("/api/team", require("./routes/teamRoutes"));
// app.use("/api/socials", require("./routes/socialRoutes"));

// // Basic health check
// app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require("express");
const app = express();

// Middleware
app.use(express.json());
app.use("/images", express.static("images")); // serve images/icons

// Routes
app.use("/api/about", require("./routes/clubInfoRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
app.use("/api/socials", require("./routes/socialRoutes"));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
