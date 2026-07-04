// [DATABASE] Leave queries.
const pool = require('../config/db');
exports.create        = async (userId, s, e, type, reason) => { /* POST /leaves */ };
exports.listByCompany = async (company) => { /* GET /leaves */ };
exports.byUser        = async (userId) => { /* profile */ };
exports.setStatus     = async (id, company, status) => { /* approve/reject */ };
