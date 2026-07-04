// [AUTH-BACKEND] Calls models, renders views BY NAME with the documented locals.
const userModel = require('../models/userModel');
exports.loginForm  = (req, res) => res.render('login');
exports.login      = async (req, res) => { /* TODO: bcrypt + session */ };
exports.signupForm = (req, res) => res.render('signup');
exports.signup     = async (req, res) => { /* TODO */ };
// verifyOtp, forgot, reset, changePassword ...
