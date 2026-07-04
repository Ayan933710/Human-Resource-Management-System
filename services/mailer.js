const nodemailer = require("nodemailer");

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const MAIL_MODE = process.env.SMTP_HOST ? "smtp" : "console";

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

async function sendMail(to, subject, text, html) {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || "HRMS <no-reply@hrms.com>",
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });
  } catch (err) {
    console.error("Mail send failed:", err.message);
  }
  if (MAIL_MODE === "console") {
    console.log(
      "\n===================== EMAIL (console demo) =====================",
    );
    console.log(` To:      ${to}`);
    console.log(` Subject: ${subject}`);
    console.log(` ${text}`);
    console.log(
      "================================================================\n",
    );
  }
}

async function sendOtpEmail(email, otp, purpose) {
  const label = purpose === "reset" ? "password reset" : "email verification";
  await sendMail(
    email,
    `Your HRMS ${label} code`,
    `Your HRMS ${label} code is: ${otp}  (valid for 15 minutes).`,
    `<p>Your HRMS ${label} code is:</p><h2 style="letter-spacing:4px">${otp}</h2><p>It is valid for 15 minutes.</p>`,
  );
}

async function sendCredentialsEmail(email, name, company, loginCode, tempPw) {
  const text =
    `Hi ${name}, an account was created for you at ${company}.\n` +
    `Login ID: ${loginCode}\nTemporary password: ${tempPw}\n` +
    `Sign in at ${BASE_URL}/login and change your password immediately.`;
  await sendMail(
    email,
    `Your HRMS account for ${company}`,
    text,
    `<p>Hi ${name}, an account was created for you at <b>${company}</b>.</p>
     <p><b>Login ID:</b> ${loginCode}<br/><b>Temporary password:</b> ${tempPw}</p>
     <p>Sign in at <a href="${BASE_URL}/login">${BASE_URL}/login</a> and change your password immediately.</p>`,
  );
}

module.exports = {
  sendMail,
  sendOtpEmail,
  sendCredentialsEmail,
  MAIL_MODE,
  BASE_URL,
};
