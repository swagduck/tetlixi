// server/src/controllers/lixiController.js
const Envelope = require("../models/Envelope");
const { Transaction } = require("../models/Transaction");
const { calculateRandomAmount } = require("../utils/rng");

exports.createEnvelope = async (req, res) => {
  try {
    const { creatorName, totalAmount, quantity, type } = req.body;
    const newEnvelope = new Envelope({
      creatorName, totalAmount, quantity,
      remainingAmount: totalAmount, remainingQuantity: quantity,
      type: type || "RANDOM",
    });
    await newEnvelope.save();
    res.status(201).json({ success: true, data: newEnvelope });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.openEnvelope = async (req, res) => {
  try {
    const { envelopeId, receiverName } = req.body;

    const existingTrans = await Transaction.findOne({ envelopeId, receiverName });
    if (existingTrans) {
      return res.status(403).json({ success: false, message: "Tham thế! Bạn đã nhận lì xì rồi.", amount: existingTrans.amount });
    }

    const envelope = await Envelope.findById(envelopeId);
    if (!envelope) return res.status(404).json({ message: "Không tìm thấy phòng!" });
    if (envelope.remainingQuantity <= 0 || envelope.remainingAmount <= 0) return res.status(400).json({ message: "Hết tiền rồi!" });

    let amount = 0;
    if (envelope.type === "EQUAL") amount = Math.floor(envelope.totalAmount / envelope.quantity);
    else amount = calculateRandomAmount(envelope.remainingAmount, envelope.remainingQuantity);

    const updatedEnvelope = await Envelope.findOneAndUpdate(
      { _id: envelopeId, remainingQuantity: { $gt: 0 }, remainingAmount: { $gte: amount } },
      { $inc: { remainingQuantity: -1, remainingAmount: -amount } },
      { new: true }
    );

    if (!updatedEnvelope) return res.status(400).json({ message: "Chậm tay quá! Hết bao." });

    const transaction = new Transaction({ envelopeId, receiverName, amount });
    await transaction.save();

    // --- PHÁT LOA SOCKET ---
    if (req.io) {
      console.log(`📡 Đang phát loa tới phòng ${envelopeId} cho ${receiverName}`);
      req.io.to(envelopeId).emit("user_won_lixi", {
        userName: receiverName,
        amount: amount,
        message: `💰 ${receiverName} vừa húp trọn ${amount.toLocaleString("vi-VN")} đ!`,
      });
    } else {
      console.error("❌ LỖI: Không tìm thấy req.io trong Controller!");
    }

    res.json({ success: true, amount, message: "Lộc về!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { envelopeId } = req.params;
    const history = await Transaction.find({ envelopeId }).sort({ openedAt: -1 });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};