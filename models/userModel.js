// [DATABASE] Data access for users. Fill bodies with the queries from index.js.
const pool = require('../config/db');
exports.findByEmailOrCode = async (id) => {           // login
  const [r] = await pool.query('SELECT * FROM users WHERE email=? OR login_code=?', [id, id]);
  return r[0];
};
exports.findById      = async (id) => { /* TODO */ };
exports.findByEmail   = async (email) => { /* TODO */ };
exports.createAdmin   = async ({ name, email, hash, company, otp }) => { /* signup */ };
exports.createEmployee= async (data) => { /* POST /employees */ };
exports.listByCompany = async (company) => { /* GET /employees */ };
exports.updateProfile = async (id, fields) => { /* PATCH /employees/:id */ };
exports.updateSalary  = async (id, company, values) => { /* POST /salary/:id */ };
exports.remove        = async (id, company) => { /* DELETE /employees/:id */ };
exports.setOtp        = async (id, otp, purpose) => { /* forgot/resend */ };
exports.verify        = async (id) => { /* verify-otp */ };
exports.setPassword   = async (id, hash) => { /* reset/change-password */ };
