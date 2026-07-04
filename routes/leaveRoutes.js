const router = require("express").Router();
const c = require("../controllers/leaveController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/leaves/new", requireAuth, c.newForm);
router.post("/leaves", requireAuth, c.create);
router.get("/leaves", requireAdmin, c.list);
router.patch("/leaves/:id", requireAdmin, c.setStatus);

module.exports = router;
