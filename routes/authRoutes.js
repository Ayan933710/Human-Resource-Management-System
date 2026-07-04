// [AUTH-BACKEND] URL -> controller wiring.
const router = require('express').Router();
const c = require('../controllers/authController');
router.get('/login', c.loginForm);
router.post('/login', c.login);
router.get('/signup', c.signupForm);
router.post('/signup', c.signup);
// ... rest of auth routes
module.exports = router;
