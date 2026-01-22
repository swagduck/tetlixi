// server/src/routes/lixiRoutes.js
const express = require("express");
const router = express.Router();
const lixiController = require("../controllers/lixiController");

// 1. Tạo phòng lì xì (Admin)
// POST http://localhost:5000/api/lixi/create
router.post("/create", lixiController.createEnvelope);

// 2. Mở bao lì xì (User)
// POST http://localhost:5000/api/lixi/open
router.post("/open", lixiController.openEnvelope);

// 3. Lấy thông tin chi tiết phòng
// GET http://localhost:5000/api/lixi/info/:envelopeId
router.get("/info/:envelopeId", lixiController.getEnvelopeInfo);

// 4. Xem lịch sử/Bảng xếp hạng (User + Realtime update sau này)
// GET http://localhost:5000/api/lixi/history/:envelopeId
router.get("/history/:envelopeId", lixiController.getHistory);

module.exports = router;
