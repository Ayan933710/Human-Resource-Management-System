exports.requireAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login?err=Please log in first");

  if (
    req.session.user.must_change_password &&
    !req.path.startsWith("/change-password") &&
    req.path !== "/logout"
  ) {
    return res.redirect(
      "/change-password?err=Please set a new password to continue",
    );
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login?err=Please log in first");
  if (req.session.user.role !== "admin")
    return res.status(403).redirect("/profile?err=Admins only");
  next();
};
