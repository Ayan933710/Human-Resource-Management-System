const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const { isStrongPassword, genOtp } = require("../utils/helpers");
const { sendOtpEmail } = require("../services/mailer");

exports.signupForm = (req, res) => res.render("signup");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    if (!name || !email || !password || !company)
      return res.redirect(
        "/signup?err=All fields (including company) are required",
      );
    if (!isStrongPassword(password))
      return res.redirect(
        "/signup?err=Password must be 8%2B chars with letters, numbers and a symbol",
      );

    const existing = await userModel.findByEmail(email);
    if (existing) return res.redirect("/signup?err=Email already registered");

    const hash = await bcrypt.hash(password, 10);
    const otp = genOtp();
    await userModel.createAdmin({
      name,
      email,
      hash,
      company: company.trim(),
      otp,
    });

    await sendOtpEmail(email, otp, "verify");
    res.redirect(
      "/verify-otp?email=" +
        encodeURIComponent(email) +
        "&msg=We sent a 6-digit code to your email (check the server console in demo mode).",
    );
  } catch (err) {
    console.error(err);
    res.redirect("/signup?err=Something went wrong");
  }
};

exports.verifyOtpForm = (req, res) =>
  res.render("auth/verify-otp", { email: req.query.email || "" });

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const row = await userModel.findByValidOtp(email, otp, "verify");
  if (!row)
    return res.redirect(
      "/verify-otp?email=" +
        encodeURIComponent(email || "") +
        "&err=Invalid or expired code",
    );
  await userModel.markVerified(row.id);
  res.redirect("/login?msg=Email verified! You can now log in.");
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findByEmail(email);
  if (user && !user.is_verified) {
    const otp = genOtp();
    await userModel.setOtp(user.id, otp, "verify");
    await sendOtpEmail(email, otp, "verify");
  }
  res.redirect(
    "/verify-otp?email=" +
      encodeURIComponent(email || "") +
      "&msg=A new code was sent.",
  );
};

exports.verifyLegacy = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.redirect("/login?err=Invalid verification link");
  const row = await userModel.findByVerificationToken(token);
  if (!row) return res.redirect("/login?err=Invalid or expired token");
  await userModel.markVerifiedByToken(row.id);
  res.redirect("/login?msg=Email verified! You can now log in.");
};

exports.loginForm = (req, res) => res.render("login");

exports.login = async (req, res) => {
  try {
    const id = (req.body.identifier || req.body.email || "").trim();
    const user = await userModel.findByEmailOrCode(id);
    if (!user) return res.redirect("/login?err=Invalid credentials");

    const ok = await bcrypt.compare(req.body.password, user.password);
    if (!ok) return res.redirect("/login?err=Invalid credentials");
    if (!user.is_verified)
      return res.redirect(
        "/login?err=Please verify your email before logging in",
      );

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      login_code: user.login_code,
      must_change_password: !!user.must_change_password,
    };
    if (user.must_change_password)
      return res.redirect(
        "/change-password?msg=Please set your own password to continue",
      );
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.redirect("/login?err=Something went wrong");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/login?msg=Logged out"));
};

exports.forgotForm = (req, res) => res.render("auth/forgot");

exports.forgot = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findByEmail(email);
  if (user) {
    const otp = genOtp();
    await userModel.setOtp(user.id, otp, "reset");
    await sendOtpEmail(email, otp, "reset");
  }

  res.redirect(
    "/reset?email=" +
      encodeURIComponent(email || "") +
      "&msg=If that email exists, a reset code was sent (check the server console in demo mode).",
  );
};

exports.resetForm = (req, res) =>
  res.render("auth/reset", { email: req.query.email || "" });

exports.reset = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!isStrongPassword(password))
    return res.redirect(
      "/reset?email=" +
        encodeURIComponent(email || "") +
        "&err=Password must be 8%2B chars with letters, numbers and a symbol",
    );

  const row = await userModel.findByValidOtp(email, otp, "reset");
  if (!row)
    return res.redirect(
      "/reset?email=" +
        encodeURIComponent(email || "") +
        "&err=Invalid or expired code",
    );

  const hash = await bcrypt.hash(password, 10);
  await userModel.setPasswordAfterReset(row.id, hash);
  res.redirect("/login?msg=Password updated. Please log in.");
};

exports.changePasswordForm = (req, res) => res.render("auth/change-password");

exports.changePassword = async (req, res) => {
  const { current_password, password } = req.body;
  const currentHash = await userModel.getPasswordById(req.session.user.id);
  const ok = await bcrypt.compare(current_password || "", currentHash);
  if (!ok)
    return res.redirect("/change-password?err=Current password is incorrect");
  if (!isStrongPassword(password))
    return res.redirect(
      "/change-password?err=Password must be 8%2B chars with letters, numbers and a symbol",
    );

  const hash = await bcrypt.hash(password, 10);
  await userModel.setPassword(req.session.user.id, hash);
  req.session.user.must_change_password = false;
  res.redirect("/profile?msg=Password changed");
};
