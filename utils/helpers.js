// [AUTH-BACKEND] Pure helpers from index.js lines 92-127.
exports.isStrongPassword  = (pw) => typeof pw==='string' && pw.length>=8 &&
  /[A-Za-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
exports.generateLoginCode = (company, first, last, year, serial) => { /* TODO */ };
exports.randomTempPassword= () => { /* TODO */ };
exports.genOtp            = () => { /* TODO */ };
exports.ymd               = (d) => { /* TODO */ };
exports.todayStr          = () => { /* TODO */ };
exports.addDaysStr        = (dateStr, n) => { /* TODO */ };
