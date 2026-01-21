// server/src/controllers/lixiController.js
const Envelope = require("../models/Envelope");
const { Transaction } = require("../models/Transaction");
const { calculateRandomAmount } = require("../utils/rng");

// ==========================================
// 1. API TẠO PHÒNG LÌ XÌ (Dùng cho Admin/Chủ phòng)
// ==========================================
exports.createEnvelope = async (req, res) => {
  try {
    const { creatorName, totalAmount, quantity, type } = req.body;

    // Tạo phòng mới với số tiền và số lượng bao ban đầu
    const newEnvelope = new Envelope({
      creatorName,
      totalAmount,
      quantity,
      remainingAmount: totalAmount, // Ban đầu còn nguyên tiền
      remainingQuantity: quantity, // Ban đầu còn nguyên bao
      type: type || "RANDOM",
    });

    await newEnvelope.save();

    // Trả về thông tin phòng (gồm ID để share)
    res.status(201).json({ success: true, data: newEnvelope });
  } catch (error) {
    console.error("Lỗi tạo phòng:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. API MỞ BAO LÌ XÌ (Logic quan trọng nhất)
// ==========================================
exports.openEnvelope = async (req, res) => {
  try {
    const { envelopeId, receiverName } = req.body;

    // --- BƯỚC 1: KIỂM TRA NGƯỜI DÙNG ĐÃ NHẬN CHƯA ---
    // Tìm trong lịch sử xem tên này ở phòng này đã có chưa
    const existingTrans = await Transaction.findOne({
      envelopeId,
      receiverName,
    });

    if (existingTrans) {
      // Nếu có rồi -> Chặn luôn, trả về mã 403
      return res.status(403).json({
        success: false,
        message: "Tham thế! Bạn đã nhận lì xì phòng này rồi.",
        amount: existingTrans.amount, // Trả về số tiền cũ để frontend hiển thị lại
      });
    }

    // --- BƯỚC 2: KIỂM TRA TRẠNG THÁI PHÒNG ---
    const envelope = await Envelope.findById(envelopeId);
    if (!envelope) {
      return res.status(404).json({ message: "Không tìm thấy phòng!" });
    }

    if (envelope.remainingQuantity <= 0) {
      return res.status(400).json({ message: "Chậm tay rồi! Hết bao lì xì." });
    }

    if (envelope.remainingAmount <= 0) {
      return res.status(400).json({ message: "Chủ phòng đã hết tiền!" });
    }

    // --- BƯỚC 3: TÍNH TOÁN SỐ TIỀN NHẬN ĐƯỢC ---
    let amount = 0;
    if (envelope.type === "EQUAL") {
      // Chia đều (làm tròn xuống)
      amount = Math.floor(envelope.totalAmount / envelope.quantity);
    } else {
      // Random theo mệnh giá chẵn (Logic trong file utils/rng.js)
      amount = calculateRandomAmount(
        envelope.remainingAmount,
        envelope.remainingQuantity,
      );
    }

    // --- BƯỚC 4: CẬP NHẬT DATABASE (ATOMIC UPDATE) ---
    // Dùng findOneAndUpdate để đảm bảo tính toàn vẹn dữ liệu khi nhiều người bấm cùng lúc
    // Điều kiện: ID đúng + Còn bao (>0) + Còn đủ tiền (>= amount)
    const updatedEnvelope = await Envelope.findOneAndUpdate(
      {
        _id: envelopeId,
        remainingQuantity: { $gt: 0 },
        remainingAmount: { $gte: amount },
      },
      {
        $inc: {
          remainingQuantity: -1, // Trừ 1 bao
          remainingAmount: -amount, // Trừ tiền
        },
      },
      { new: true }, // Trả về dữ liệu mới sau khi update
    );

    // Nếu không update được (do người khác nhanh tay hơn hốt mất cái cuối)
    if (!updatedEnvelope) {
      return res
        .status(400)
        .json({ message: "Tiếc quá! Vừa hết bao hoặc không đủ tiền." });
    }

    // --- BƯỚC 5: LƯU LỊCH SỬ GIAO DỊCH ---
    const transaction = new Transaction({
      envelopeId,
      receiverName,
      amount,
    });
    await transaction.save();

    // --- BƯỚC 6: PHÁT LOA THÔNG BÁO (SOCKET.IO) ---
    // Kiểm tra xem biến req.io có tồn tại không (do server.js truyền vào)
    if (req.io) {
      req.io.to(envelopeId).emit("user_won_lixi", {
        userName: receiverName,
        amount: amount,
        message: `💰 ${receiverName} vừa húp trọn ${amount.toLocaleString("vi-VN")} đ!`,
      });
    } else {
      console.warn("⚠️ Cảnh báo: Socket.io không hoạt động trong Controller.");
    }

    // --- BƯỚC 7: TRẢ KẾT QUẢ VỀ CHO NGƯỜI CHƠI ---
    res.json({
      success: true,
      amount,
      message: "Lộc về!",
    });
  } catch (error) {
    console.error("Lỗi mở bao:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. API LẤY LỊCH SỬ/BẢNG VÀNG
// ==========================================
exports.getHistory = async (req, res) => {
  try {
    const { envelopeId } = req.params;
    // Lấy danh sách, người mới nhất xếp trên cùng
    const history = await Transaction.find({ envelopeId }).sort({
      openedAt: -1,
    });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
