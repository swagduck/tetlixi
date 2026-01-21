// server/src/app.js
const express = require("express");
const cors = require("cors");
const lixiRoutes = require("./routes/lixiRoutes");

const app = express();

// Middleware
app.use(cors()); // Cho phép Frontend (React) gọi API
app.use(express.json()); // Để server hiểu được JSON gửi lên từ body

// Routes
app.use("/api/lixi", lixiRoutes);

// Root route (để test xem server sống hay chết)
app.get("/", (req, res) => {
  res.send("🧧 Lixi Cyberpunk Server is Running! 🧧");
});

module.exports = app;
