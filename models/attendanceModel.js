// Database queries for attendance records
const pool = require('../config/db');
const { ymd, todayStr, addDaysStr } = require('../utils/helpers');

exports.recentByUser = async (userId) => {                       // get last 15 attendance records for a user
  const [rows] = await pool.query(
    'SELECT * FROM attendance WHERE user_id = ? ORDER BY work_date DESC LIMIT 15', [userId]);
  return rows;
};

exports.openToday = async (userId, today) => {                   // check if user already has an open check-in today
  const [rows] = await pool.query(
    'SELECT id FROM attendance WHERE user_id = ? AND work_date = ? AND check_out IS NULL',
    [userId, today]);
  return rows;
};

exports.checkIn = async (userId, today) => {                     // create a new check-in record
  await pool.query(
    "INSERT INTO attendance (user_id, work_date, check_in, status) VALUES (?, ?, NOW(), 'pending')",
    [userId, today]);
};

exports.lastOpen = async (userId, today) => {                    // find the open check-in to close for check-out
  const [rows] = await pool.query(
    'SELECT id FROM attendance WHERE user_id = ? AND work_date = ? AND check_out IS NULL ORDER BY id DESC LIMIT 1',
    [userId, today]);
  return rows;
};

exports.checkOut = async (id) => {                               // mark check-out time
  await pool.query('UPDATE attendance SET check_out = NOW() WHERE id = ?', [id]);
};

exports.setStatus = async (id, company, status) => {            // approve or reject an attendance record
  await pool.query(
    `UPDATE attendance a JOIN users u ON u.id = a.user_id
     SET a.status = ? WHERE a.id = ? AND u.company = ?`, [status, id, company]);
};

// Get all employees in a company, used for the admin attendance board
exports.usersForBoard = async (company) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role FROM users WHERE company = ? ORDER BY name', [company]);
  return rows;
};

// Get attendance records for a company within a date range
exports.inRange = async (company, start, end) => {
  const [rows] = await pool.query(
    `SELECT a.* FROM attendance a JOIN users u ON u.id = a.user_id
     WHERE u.company = ? AND a.work_date BETWEEN ? AND ?`, [company, start, end]);
  return rows;
};

// Get approved leaves for a company that overlap a date range
exports.approvedLeavesInRange = async (company, rangeStart, rangeEnd) => {
  const [rows] = await pool.query(
    `SELECT l.* FROM leaves l JOIN users u ON u.id = l.user_id
     WHERE u.company = ? AND l.status = 'approved' AND l.start_date <= ? AND l.end_date >= ?`,
    [company, rangeEnd, rangeStart]);
  return rows;
};

// Get present, leave, and absent day counts for the current month for one user
exports.monthlySummary = async (userId) => {
  const now = new Date();
  const monthStart = ymd(new Date(now.getFullYear(), now.getMonth(), 1));
  const today = todayStr();

  const [[att]] = await pool.query(
    `SELECT COUNT(DISTINCT work_date) AS present FROM attendance
     WHERE user_id = ? AND status <> 'rejected' AND check_in IS NOT NULL
       AND work_date BETWEEN ? AND ?`, [userId, monthStart, today]);

  const [lv] = await pool.query(
    `SELECT start_date, end_date FROM leaves
     WHERE user_id = ? AND status = 'approved' AND start_date <= ? AND end_date >= ?`,
    [userId, today, monthStart]);

  let leaveDays = 0;
  for (const l of lv) {
    let d = ymd(l.start_date) < monthStart ? monthStart : ymd(l.start_date);
    const end = ymd(l.end_date) > today ? today : ymd(l.end_date);
    while (d <= end) { leaveDays++; d = addDaysStr(d, 1); }
  }
  const elapsed = Number(today.slice(8, 10));
  const present = att.present;
  const absent = Math.max(0, elapsed - present - leaveDays);
  return { present, leave: leaveDays, absent, elapsed };
};