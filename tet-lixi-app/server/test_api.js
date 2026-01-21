// server/test_api.js
const API_URL = "http://localhost:5000/api/lixi";

async function runTest() {
  console.log("🚀 Bắt đầu test hệ thống Lì Xì Cyberpunk...");

  // 1. TẠO PHÒNG LÌ XÌ
  console.log("\n--- Bước 1: Admin tạo phòng ---");
  const createResponse = await fetch(`${API_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creatorName: "Uy Admin",
      totalAmount: 100000, // Quỹ 100k
      quantity: 5, // 5 bao
      type: "RANDOM", // Chia ngẫu nhiên
    }),
  });

  const createData = await createResponse.json();

  if (!createData.success) {
    console.error("❌ Tạo phòng thất bại:", createData);
    return;
  }

  const envelopeId = createData.data._id;
  console.log(`✅ Tạo thành công! ID Phòng: ${envelopeId}`);

  // 2. GIẢ LẬP 6 NGƯỜI VÀO GIẬT (Dù chỉ có 5 bao)
  console.log("\n--- Bước 2: 6 người lao vào giật lì xì ---");

  const users = [
    "Deloris",
    "Bạn A",
    "Bạn B",
    "Bạn C",
    "Bạn D",
    "Người Chậm Chân",
  ];

  for (const user of users) {
    const openResponse = await fetch(`${API_URL}/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        envelopeId: envelopeId,
        receiverName: user,
      }),
    });

    const openData = await openResponse.json();

    if (openData.success) {
      console.log(
        `💰 ${user}: Nhận được ${openData.amount.toLocaleString()} VNĐ`,
      );
    } else {
      console.log(`😭 ${user}: ${openData.message}`);
    }
  }
}

runTest();
