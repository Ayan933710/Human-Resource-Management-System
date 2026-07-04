const crypto = require("crypto");

exports.isStrongPassword = (pw) =>
  typeof pw === "string" &&
  pw.length >= 8 &&
  /[A-Za-z]/.test(pw) &&
  /[0-9]/.test(pw) &&
  /[^A-Za-z0-9]/.test(pw);

exports.generateLoginCode = (company, first, last, year, serial) => {
  const take2 = (s) =>
    (s || "")
      .replace(/[^A-Za-z]/g, "")
      .slice(0, 2)
      .toUpperCase()
      .padEnd(2, "X");
  return `${take2(company)}-${take2(first)}${take2(last)}-${year}-${String(serial).padStart(4, "0")}`;
};

exports.randomTempPassword = () => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const syms = "!@#$%&*?";
  const pick = (set) => set[crypto.randomInt(set.length)];
  let core = "";
  for (let i = 0; i < 6; i++) core += pick(letters);
  return pick(letters) + core + pick(digits) + pick(digits) + pick(syms);
};

exports.genOtp = () => String(crypto.randomInt(100000, 1000000));

const ymd = (d) => {
  const x = new Date(d);
  const local = new Date(x.getTime() - x.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
exports.ymd = ymd;
exports.todayStr = () => ymd(new Date());
exports.addDaysStr = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return ymd(d);
};
