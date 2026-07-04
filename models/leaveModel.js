// Database queries for leave records
const pool = require('../config/db');

exports.byUser = async (userId) => {                             // get all leaves for a user
  const [rows] = await pool.query(
    'SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows;
};

exports.create = async (userId, startDate, endDate, type, reason) => {   // create a new leave request
  await pool.query(
    'INSERT INTO leaves (user_id, start_date, end_date, leave_type, reason) VALUES (?, ?, ?, ?, ?)',
    [userId, startDate, endDate, type, reason || null]);
};

exports.listByCompany = async (company) => {                    // get all leaves for a company, pending first
  const [rows] = await pool.query(
    `SELECT l.*, u.name, u.email FROM leaves l JOIN users u ON u.id = l.user_id
     WHERE u.company = ?
     ORDER BY FIELD(l.status,'pending','approved','rejected'), l.created_at DESC`, [company]);
  return rows;
};

exports.setStatus = async (id, company, status) => {            // approve or reject a leave request
  await pool.query(
    `UPDATE leaves l JOIN users u ON u.id = l.user_id
     SET l.status = ? WHERE l.id = ? AND u.company = ?`, [status, id, company]);
};