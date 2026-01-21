// server/src/sockets/lixiSocket.js

// Biến lưu trữ danh sách người dùng đang online
// Cấu trúc: { "socket_id": { roomId: "123", name: "Uy" } }
const users = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Có người kết nối:", socket.id);

    // Xử lý sự kiện khi người dùng vào phòng
    socket.on("join_room", ({ roomId, userName }) => {
      // Validate dữ liệu đầu vào
      if (!roomId || !userName) return;

      // 1. Cho socket tham gia vào room cụ thể
      socket.join(roomId);

      // 2. Kiểm tra xem user này đã có trong phòng chưa (TRƯỚC KHI thêm)
      const isExistingUser = Object.entries(users).some(([socketId, u]) => 
        u.name === userName && u.roomId === roomId
      );

      // 3. Lưu thông tin người dùng vào bộ nhớ server
      users[socket.id] = { roomId, name: userName };

      // 4. Lấy danh sách tất cả người trong phòng này
      const usersInRoom = Object.values(users).filter(
        (u) => u.roomId === roomId
      );

      // 5. Gửi danh sách mới nhất cho TẤT CẢ mọi người trong phòng
      // (Để frontend cập nhật số lượng 👥 và danh sách tên)
      io.to(roomId).emit("update_player_list", usersInRoom);

      // 6. Chỉ thông báo cho người khác nếu đây là người dùng MỚI
      if (!isExistingUser) {
        socket.to(roomId).emit("user_joined", {
          message: `${userName} vừa tham gia cuộc chiến!`,
        });
      }

      console.log(
        `✅ ${userName} đã vào phòng ${roomId}. Tổng: ${usersInRoom.length} người`,
      );
    });

    // Xử lý khi người dùng ngắt kết nối (Tắt tab, mất mạng...)
    socket.on("disconnect", () => {
      const user = users[socket.id];

      if (user) {
        const { roomId, name } = user;

        // 1. Xóa người dùng khỏi danh sách
        delete users[socket.id];

        // 2. Cập nhật lại danh sách cho những người còn lại trong phòng
        const usersInRoom = Object.values(users).filter(
          (u) => u.roomId === roomId
        );
        io.to(roomId).emit("update_player_list", usersInRoom);

        console.log(`❌ ${name} đã rời phòng ${roomId}`);
      } else {
        console.log("❌ Một kết nối vãng lai đã ngắt:", socket.id);
      }
    });
  });
};