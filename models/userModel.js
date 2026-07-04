const pool = require("../config/db");

// --- Lookups -------------------------------------------------------------
exports.findByEmailOrCode = async (id) => {
  // POST /login
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ? OR login_code = ?",
    [id, id],
  );
  return rows[0];
};

exports.findById = async (id) => {
  // /profile, edit
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

exports.findByIdAndCompany = async (id, company) => {
  // GET /employees/:id
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE id = ? AND company = ?",
    [id, company],
  );
  return rows[0];
};

exports.findByEmail = async (email) => {
  // signup/forgot/resend checks
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows[0];
};

exports.getPasswordById = async (id) => {
  // POST /change-password
  const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [
    id,
  ]);
  return rows[0] && rows[0].password;
};

exports.listByCompany = async (company) => {
  // GET /employees
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE company = ? ORDER BY created_at DESC",
    [company],
  );
  return rows;
};

// --- Create --------------------------------------------------------------
exports.createAdmin = async ({ name, email, hash, company, otp }) => {
  // POST /signup
  await pool.query(
    `INSERT INTO users (name, email, password, company, role, is_verified, otp_code, otp_expires, otp_purpose)
     VALUES (?, ?, ?, ?, 'admin', 0, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 'verify')`,
    [name, email, hash, company, otp],
  );
};

exports.countForCompanyYear = async (conn, company, year) => {
  // serial for login code (in txn)
  const [[{ cnt }]] = await conn.query(
    "SELECT COUNT(*) AS cnt FROM users WHERE company = ? AND year_joined = ?",
    [company, year],
  );
  return cnt;
};

exports.createEmployee = async (
  conn,
  {
    // POST /employees (inside a txn)
    name,
    email,
    hash,
    company,
    loginCode,
    year,
    baseSalary,
    role,
  },
) => {
  await conn.query(
    `INSERT INTO users (name, email, password, company, login_code, year_joined, base_salary,
                        role, is_verified, must_change_password)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
    [name, email, hash, company, loginCode, year, baseSalary, role],
  );
};

// --- Updates -------------------------------------------------------------
exports.adminUpdate = async (id, company, f) => {
  // PATCH /employees/:id (admin)
  await pool.query(
    `UPDATE users SET name = ?, email = ?, role = ?, base_salary = ?,
       phone = ?, address = ?, about = ?, skills = ?, certifications = ?, resume_url = ?
     WHERE id = ? AND company = ?`,
    [
      f.name,
      f.email,
      f.role,
      f.base_salary,
      f.phone,
      f.address,
      f.about,
      f.skills,
      f.certifications,
      f.resume_url,
      id,
      company,
    ],
  );
};

exports.selfUpdate = async (id, f) => {
  // PATCH /employees/:id (self)
  await pool.query(
    `UPDATE users SET phone = ?, address = ?, about = ?, skills = ?, certifications = ?, resume_url = ?
     WHERE id = ?`,
    [f.phone, f.address, f.about, f.skills, f.certifications, f.resume_url, id],
  );
};

exports.remove = async (id, company) => {
  // DELETE /employees/:id
  await pool.query("DELETE FROM users WHERE id = ? AND company = ?", [
    id,
    company,
  ]);
};

// --- OTP / verification / password ---------------------------------------
exports.setOtp = async (id, otp, purpose) => {
  // forgot / resend
  await pool.query(
    `UPDATE users SET otp_code = ?, otp_expires = DATE_ADD(NOW(), INTERVAL 15 MINUTE), otp_purpose = ?
     WHERE id = ?`,
    [otp, purpose, id],
  );
};

exports.findByValidOtp = async (email, otp, purpose) => {
  // verify-otp / reset
  const [rows] = await pool.query(
    `SELECT id FROM users
     WHERE email = ? AND otp_code = ? AND otp_purpose = ? AND otp_expires > NOW()`,
    [email, otp, purpose],
  );
  return rows[0];
};

exports.markVerified = async (id) => {
  // POST /verify-otp
  await pool.query(
    `UPDATE users SET is_verified = 1, otp_code = NULL, otp_expires = NULL, otp_purpose = NULL
     WHERE id = ?`,
    [id],
  );
};

exports.setPasswordAfterReset = async (id, hash) => {
  // POST /reset
  await pool.query(
    `UPDATE users SET password = ?, must_change_password = 0,
       otp_code = NULL, otp_expires = NULL, otp_purpose = NULL WHERE id = ?`,
    [hash, id],
  );
};

exports.setPassword = async (id, hash) => {
  // POST /change-password
  await pool.query(
    "UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?",
    [hash, id],
  );
};

// --- Salary --------------------------------------------------------------
exports.salaryList = async (company) => {
  // GET /salary (admin)
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE company = ? ORDER BY name",
    [company],
  );
  return rows;
};

exports.salaryOne = async (id) => {
  // GET /salary (employee)
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows;
};

exports.updateSalary = async (id, company, setClause, values) => {
  // POST /salary/:id
  await pool.query(
    `UPDATE users SET ${setClause} WHERE id = ? AND company = ?`,
    [...values, id, company],
  );
};

// --- Legacy link verification (harmless fallback, GET /verify) -----------
exports.findByVerificationToken = async (token) => {
  const [rows] = await pool.query(
    "SELECT id FROM users WHERE verification_token = ?",
    [token],
  );
  return rows[0];
};
exports.markVerifiedByToken = async (id) => {
  await pool.query(
    "UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?",
    [id],
  );
};

// Expose a pool connection for the create-employee transaction (controller manages commit/rollback).
exports.getConnection = () => pool.getConnection();
