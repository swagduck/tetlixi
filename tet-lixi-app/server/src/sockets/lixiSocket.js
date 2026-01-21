// server/src/sockets/lixiSocket.js

// Biến lưu trữ tạm thời danh sách người chơi trong RAM
// Cấu trúc: { "roomId": [ {id: "socketId", name: "Uy"}, ... ] }
const roomUsers = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    // 1. Xử lý khi người dùng vào phòng
    socket.on("join_room", ({ roomId, userName }) => {
      socket.join(roomId);

      // Lưu thông tin vào socket để dùng khi disconnect
      socket.data.roomId = roomId;
      socket.data.userName = userName;

      // --- LOGIC MỚI: THÊM VÀO DANH SÁCH ---
      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }

      // Kiểm tra xem đã có user này chưa (tránh duplicate khi reload)
      const existingUser = roomUsers[roomId].find((u) => u.name === userName);
      if (!existingUser) {
        roomUsers[roomId].push({ id: socket.id, name: userName });
      }

      console.log(
        `👤 ${userName} joined ${roomId}. Total: ${roomUsers[roomId].length}`,
      );

      // Thông báo log chat (như cũ)
      socket.to(roomId).emit("user_joined", {
        userName,
        message: `${userName} vừa tham gia cuộc chơi!`,
      });

      // --- QUAN TRỌNG: Gửi danh sách người chơi mới nhất cho CẢ PHÒNG ---
      io.to(roomId).emit("update_player_list", roomUsers[roomId]);
    });

    // 2. Xử lý khi người dùng thoát (tắt tab hoặc mất mạng)
    socket.on("disconnect", () => {
      const { roomId, userName } = socket.data;

      if (roomId && roomUsers[roomId]) {
        // Lọc bỏ người vừa thoát ra khỏi danh sách
        roomUsers[roomId] = roomUsers[roomId].filter(
          (user) => user.id !== socket.id,
        );

        console.log(`❌ ${userName} left ${roomId}`);

        // Gửi danh sách mới cho những người còn lại
        io.to(roomId).emit("update_player_list", roomUsers[roomId]);
      }
    });
  });
};
