const router = require("express").Router();
const c = require("../controllers/attendanceController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.post("/attendance/check-in", requireAuth, c.checkIn);
router.post("/attendance/check-out", requireAuth, c.checkOut);
router.get("/attendance", requireAdmin, c.board);
router.patch("/attendance/:id/status", requireAdmin, c.setStatus);

module.exports = router;
