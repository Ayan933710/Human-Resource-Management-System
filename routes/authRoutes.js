const router = require("express").Router();
const c = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

router.get("/signup", c.signupForm);
router.post("/signup", c.signup);

router.get("/verify-otp", c.verifyOtpForm);
router.post("/verify-otp", c.verifyOtp);
router.post("/resend-otp", c.resendOtp);
router.get("/verify", c.verifyLegacy);

router.get("/login", c.loginForm);
router.post("/login", c.login);
router.get("/logout", c.logout);

router.get("/forgot", c.forgotForm);
router.post("/forgot", c.forgot);
router.get("/reset", c.resetForm);
router.post("/reset", c.reset);

router.get("/change-password", requireAuth, c.changePasswordForm);
router.post("/change-password", requireAuth, c.changePassword);

module.exports = router;
