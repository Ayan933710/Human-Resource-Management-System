const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const attendanceModel = require("../models/attendanceModel");
const leaveModel = require("../models/leaveModel");
const { generateLoginCode, randomTempPassword } = require("../utils/helpers");
const { sendCredentialsEmail } = require("../services/mailer");

exports.profile = async (req, res) => {
  const uid = req.session.user.id;
  const employee = await userModel.findById(uid);
  const attendance = await attendanceModel.recentByUser(uid);
  const leaves = await leaveModel.byUser(uid);
  const summary = await attendanceModel.monthlySummary(uid);
  res.render("employees/show", {
    employee,
    attendance,
    leaves,
    summary,
    readonly: false,
  });
};

exports.list = async (req, res) => {
  const employees = await userModel.listByCompany(req.session.user.company);
  res.render("employees/index", { employees });
};

exports.newForm = (req, res) =>
  res.render("employees/new", { year: new Date().getFullYear() });

exports.create = async (req, res) => {
  const { name, email, role, base_salary } = req.body;
  if (!name || !email)
    return res.redirect("/employees/new?err=Name and email are required");

  const company = req.session.user.company;
  const existing = await userModel.findByEmail(email);
  if (existing)
    return res.redirect("/employees/new?err=Email already registered");

  const parts = name.trim().split(/\s+/);
  const first = parts[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  const year = new Date().getFullYear();

  const conn = await userModel.getConnection();
  try {
    await conn.beginTransaction();
    const cnt = await userModel.countForCompanyYear(conn, company, year);
    const serial = cnt + 1;
    const loginCode = generateLoginCode(company, first, last, year, serial);
    const tempPw = randomTempPassword();
    const hash = await bcrypt.hash(tempPw, 10);
    const safeRole = role === "admin" ? "admin" : "employee";

    await userModel.createEmployee(conn, {
      name: name.trim(),
      email: email.trim(),
      hash,
      company,
      loginCode,
      year,
      baseSalary: Number(base_salary) || 0,
      role: safeRole,
    });
    await conn.commit();

    await sendCredentialsEmail(
      email.trim(),
      name.trim(),
      company,
      loginCode,
      tempPw,
    );
    res.redirect(
      "/employees?msg=Employee added. Login ID " +
        loginCode +
        " and a temporary password were emailed (see server console in demo mode).",
    );
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error(err);
    res.redirect("/employees/new?err=Could not add employee");
  } finally {
    conn.release();
  }
};

exports.detail = async (req, res) => {
  const id = Number(req.params.id);
  const employee = await userModel.findByIdAndCompany(
    id,
    req.session.user.company,
  );
  if (!employee) return res.redirect("/employees?err=Employee not found");
  const attendance = await attendanceModel.recentByUser(id);
  const leaves = await leaveModel.byUser(id);
  const summary = await attendanceModel.monthlySummary(id);
  res.render("employees/detail", { employee, attendance, leaves, summary });
};

exports.editForm = async (req, res) => {
  const id = Number(req.params.id);
  const isAdminEditingOther =
    req.session.user.role === "admin" && req.session.user.id !== id;
  if (req.session.user.role !== "admin" && req.session.user.id !== id)
    return res.status(403).redirect("/profile?err=Not allowed");

  const employee = await userModel.findById(id);
  if (!employee) return res.redirect("/profile?err=Not found");
  res.render("employees/edit", { employee, isAdminEditingOther });
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const isAdmin = req.session.user.role === "admin";
  const isAdminEditingOther = isAdmin && req.session.user.id !== id;
  if (!isAdmin && req.session.user.id !== id)
    return res.status(403).redirect("/profile?err=Not allowed");

  const { phone, address, about, skills, certifications, resume_url } =
    req.body;

  if (isAdminEditingOther) {
    const { name, email, role, base_salary } = req.body;
    const safeRole = role === "admin" ? "admin" : "employee";
    await userModel.adminUpdate(id, req.session.user.company, {
      name,
      email,
      role: safeRole,
      base_salary: Number(base_salary) || 0,
      phone,
      address,
      about,
      skills,
      certifications,
      resume_url,
    });
    return res.redirect("/employees/" + id + "?msg=Employee updated");
  }

  await userModel.selfUpdate(id, {
    phone,
    address,
    about,
    skills,
    certifications,
    resume_url,
  });
  res.redirect("/profile?msg=Profile updated");
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.session.user.id)
    return res.redirect("/employees?err=You cannot remove your own account");
  await userModel.remove(id, req.session.user.company);
  res.redirect("/employees?msg=Employee removed");
};
