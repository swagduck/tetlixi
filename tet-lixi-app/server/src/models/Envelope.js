// server/src/models/Envelope.js
const mongoose = require("mongoose");

const EnvelopeSchema = new mongoose.Schema({
  // Người tạo (Admin/Chủ phòng)
  creatorName: {
    type: String,
    required: true,
    default: "Admin",
  },

  // Tổng tiền quỹ ban đầu
  totalAmount: {
    type: Number,
    required: true,
  },

  // Số lượng bao ban đầu
  quantity: {
    type: Number,
    required: true,
  },

  // Số bao còn lại (sẽ bị trừ dần)
  remainingQuantity: {
    type: Number,
    required: true,
  },

  // Số tiền còn lại trong quỹ (sẽ bị trừ dần)
  remainingAmount: {
    type: Number,
    required: true,
  },

  // Loại lì xì: 'RANDOM' (vui vẻ) hoặc 'EQUAL' (chia đều)
  type: {
    type: String,
    enum: ["RANDOM", "EQUAL"],
    default: "RANDOM",
  },

  // Trạng thái phòng (để sau này có thể khóa phòng)
  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Envelope", EnvelopeSchema);
