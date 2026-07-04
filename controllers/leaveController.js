const leaveModel = require("../models/leaveModel");
const { todayStr, addDaysStr } = require("../utils/helpers");

exports.newForm = (req, res) => {
  if (req.session.user.role === "admin")
    return res.redirect("/profile?err=Admins do not apply for leave");
  res.render("leaves/new", { minDate: addDaysStr(todayStr(), 1) });
};

exports.create = async (req, res) => {
  if (req.session.user.role === "admin")
    return res.redirect("/profile?err=Admins do not apply for leave");

  const { start_date, end_date, reason } = req.body;
  const leave_type = req.body.leave_type === "sick" ? "sick" : "paid";
  const tomorrow = addDaysStr(todayStr(), 1);

  if (!start_date || !end_date)
    return res.redirect("/leaves/new?err=Dates are required");
  if (start_date < tomorrow)
    return res.redirect(
      "/leaves/new?err=Leave can only start from tomorrow onwards",
    );
  if (end_date < start_date)
    return res.redirect("/leaves/new?err=End date cannot be before start date");

  await leaveModel.create(
    req.session.user.id,
    start_date,
    end_date,
    leave_type,
    reason,
  );
  res.redirect("/profile?msg=Leave request submitted");
};

exports.list = async (req, res) => {
  const leaves = await leaveModel.listByCompany(req.session.user.company);
  res.render("leaves/index", { leaves });
};

exports.setStatus = async (req, res) => {
  const status = req.body.status === "approved" ? "approved" : "rejected";
  await leaveModel.setStatus(
    Number(req.params.id),
    req.session.user.company,
    status,
  );
  res.redirect(`/leaves?msg=Leave ${status}`);
};
