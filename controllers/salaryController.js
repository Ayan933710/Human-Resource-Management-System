const userModel = require("../models/userModel");

const SALARY_EARNINGS = [
  "base_salary",
  "house_rent",
  "allowances",
  "standard_allowance",
  "fixed_allowance",
  "performance_bonus",
];
const SALARY_DEDUCTIONS = ["pf_contribution", "tax_deduction"];
const SALARY_FIELDS = [...SALARY_EARNINGS, ...SALARY_DEDUCTIONS];

exports.view = async (req, res) => {
  const isAdmin = req.session.user.role === "admin";

  const users = isAdmin
    ? await userModel.salaryList(req.session.user.company)
    : await userModel.salaryOne(req.session.user.id);

  const rows = users.map((u) => {
    const earnings = SALARY_EARNINGS.reduce(
      (sum, k) => sum + Number(u[k] || 0),
      0,
    );
    const deductions = SALARY_DEDUCTIONS.reduce(
      (sum, k) => sum + Number(u[k] || 0),
      0,
    );
    const net = Math.max(0, earnings - deductions);
    return {
      ...u,
      earnings: earnings.toFixed(2),
      deductions: deductions.toFixed(2),
      net: net.toFixed(2),
    };
  });

  res.render("salary/index", {
    rows,
    canEdit: isAdmin,
    monthLabel: new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    }),
  });
};

exports.update = async (req, res) => {
  const setClause = SALARY_FIELDS.map((f) => `${f} = ?`).join(", ");
  const values = SALARY_FIELDS.map((f) => Number(req.body[f]) || 0);
  await userModel.updateSalary(
    Number(req.params.id),
    req.session.user.company,
    setClause,
    values,
  );
  res.redirect("/salary?msg=Salary updated");
};
