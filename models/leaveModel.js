const pool = require("../config/db");

exports.byUser = async (userId) => {
  // /profile, /employees/:id
  const [rows] = await pool.query(
    "SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
  );
  return rows;
};

exports.create = async (userId, startDate, endDate, type, reason) => {
  // POST /leaves
  await pool.query(
    "INSERT INTO leaves (user_id, start_date, end_date, leave_type, reason) VALUES (?, ?, ?, ?, ?)",
    [userId, startDate, endDate, type, reason || null],
  );
};

exports.listByCompany = async (company) => {
  // GET /leaves (admin)
  const [rows] = await pool.query(
    `SELECT l.*, u.name, u.email FROM leaves l JOIN users u ON u.id = l.user_id
     WHERE u.company = ?
     ORDER BY FIELD(l.status,'pending','approved','rejected'), l.created_at DESC`,
    [company],
  );
  return rows;
};

exports.setStatus = async (id, company, status) => {
  // approve/reject
  await pool.query(
    `UPDATE leaves l JOIN users u ON u.id = l.user_id
     SET l.status = ? WHERE l.id = ? AND u.company = ?`,
    [status, id, company],
  );
};
