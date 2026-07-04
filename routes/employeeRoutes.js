const router = require("express").Router();
const c = require("../controllers/employeeController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/profile", requireAuth, c.profile);

router.get("/employees", requireAdmin, c.list);
router.get("/employees/new", requireAdmin, c.newForm);
router.post("/employees", requireAdmin, c.create);
router.get("/employees/:id", requireAdmin, c.detail);
router.get("/employees/:id/edit", requireAuth, c.editForm);
router.patch("/employees/:id", requireAuth, c.update);
router.delete("/employees/:id", requireAdmin, c.remove);

module.exports = router;
