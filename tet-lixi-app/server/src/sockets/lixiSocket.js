// server/src/sockets/lixiSocket.js
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Có người kết nối:', socket.id);

    // Xử lý sự kiện khi người dùng vào phòng
    socket.on('join_room', ({ roomId, userName }) => {
      if (!roomId) return;

      // 1. Cho socket này tham gia vào kênh (room) cụ thể
      socket.join(roomId);
      console.log(`✅ ${userName} (${socket.id}) đã vào phòng: ${roomId}`);

      // 2. Báo cho những người KHÁC trong phòng biết
      socket.to(roomId).emit('user_joined', { 
        message: `${userName} vừa tham gia cuộc chiến!` 
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Ai đó đã ngắt kết nối:', socket.id);
    });
  });
};