// [DATABASE] Attendance queries + monthlyAttendanceSummary (index.js 683-712).
const pool = require('../config/db');
exports.openToday    = async (userId, today) => { /* TODO */ };
exports.checkIn      = async (userId, today) => { /* TODO */ };
exports.checkOut     = async (id) => { /* TODO */ };
exports.boardData    = async (company, start, end) => { /* GET /attendance */ };
exports.setStatus    = async (id, company, status) => { /* approve/reject */ };
exports.monthlySummary = async (userId) => { /* returns {present, leave, absent, elapsed} */ };
