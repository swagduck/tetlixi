// server/src/server.js
require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");

const server = http.createServer(app);

// Cấu hình Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// --- FIX LỖI: Gắn trực tiếp io vào prototype của request ---
// Cách này đảm bảo 100% controller sẽ nhìn thấy req.io
app.request.io = io;

// Kích hoạt logic Socket
require("./sockets/lixiSocket")(io);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Đã kết nối MongoDB thành công!");
    server.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err.message);
  });
