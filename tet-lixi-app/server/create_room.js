// server/create_room.js
const API_URL = "http://localhost:5000/api/lixi";

async function createRoom() {
  console.log("🧧 Đang khởi tạo phòng LÌ XÌ ĐẠI GIA (Mệnh giá chẵn)...");

  try {
    const response = await fetch(`${API_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creatorName: "Uy Đại Gia",
        totalAmount: 5000000, // 5 Triệu (Để dễ ra 200k, 500k)
        quantity: 10, // 10 người
        type: "RANDOM",
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("\n========================================");
      console.log("✅ TẠO PHÒNG THÀNH CÔNG!");
      console.log(`🆔 ID Phòng:  ${data.data._id}`);
      console.log(
        `💰 Tổng quỹ:  ${data.data.totalAmount.toLocaleString()} VNĐ`,
      );
      console.log("========================================\n");
      console.log("👉 Copy ID trên và nhập vào web để chơi nhé!");
    } else {
      console.log("❌ Lỗi:", data.message);
    }
  } catch (error) {
    console.error(
      "Lỗi kết nối (Nhớ bật server trước nhé!):",
      error.cause || error,
    );
  }
}

createRoom();
