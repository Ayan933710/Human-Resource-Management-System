const router = require("express").Router();
const c = require("../controllers/salaryController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/salary", requireAuth, c.view);
router.post("/salary/:id", requireAdmin, c.update);

module.exports = router;
