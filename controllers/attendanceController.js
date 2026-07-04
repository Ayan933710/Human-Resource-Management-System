const attendanceModel = require('../models/attendanceModel');
const { todayStr, addDaysStr, ymd } = require('../utils/helpers');

exports.checkIn = async (req, res) => {
  const userId = req.session.user.id;
  const today  = todayStr();
  const open = await attendanceModel.openToday(userId, today);
  if (open.length) return res.redirect('/profile?err=Already checked in');
  await attendanceModel.checkIn(userId, today);
  res.redirect('/profile?msg=Checked in');
};

exports.checkOut = async (req, res) => {
  const userId = req.session.user.id;
  const today  = todayStr();
  const open = await attendanceModel.lastOpen(userId, today);
  if (!open.length) return res.redirect('/profile?err=No open check-in found');
  await attendanceModel.checkOut(open[0].id);
  res.redirect('/profile?msg=Checked out');
};

exports.board = async (req, res) => {
  const company = req.session.user.company;
  const view = req.query.view === 'weekly' ? 'weekly' : 'daily';
  const refDate = req.query.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
    ? req.query.date : todayStr();

  const days = view === 'weekly'
    ? Array.from({ length: 7 }, (_, i) => addDaysStr(refDate, i - 6))
    : [refDate];
  const rangeStart = days[0];
  const rangeEnd   = days[days.length - 1];

  const users = await attendanceModel.usersForBoard(company);
  const att   = await attendanceModel.inRange(company, rangeStart, rangeEnd);
  const lv    = await attendanceModel.approvedLeavesInRange(company, rangeStart, rangeEnd);

  const today = todayStr();
  const rows = users.map(u => {
    const cells = {};
    for (const day of days) {
      const rec = att.find(a => a.user_id === u.id && ymd(a.work_date) === day);
      const onLeave = lv.some(l => l.user_id === u.id && ymd(l.start_date) <= day && ymd(l.end_date) >= day);
      let status;
      if (rec && rec.status !== 'rejected' && rec.check_in) status = 'present';
      else if (onLeave) status = 'leave';
      else if (day > today) status = 'upcoming';
      else status = 'absent';
      cells[day] = {
        status,
        attendanceId: rec ? rec.id : null,
        attStatus: rec ? rec.status : null,
        checkIn: rec ? rec.check_in : null,
        checkOut: rec ? rec.check_out : null,
      };
    }
    return { user: u, cells };
  });

  res.render('attendance/index', { view, refDate, days, rows,
    prevDate: addDaysStr(refDate, -1), nextDate: addDaysStr(refDate, 1) });
};

exports.setStatus = async (req, res) => {
  const status = req.body.status === 'approved' ? 'approved' : 'rejected';
  await attendanceModel.setStatus(Number(req.params.id), req.session.user.company, status);
  const back = req.get('referer') || '/attendance';
  res.redirect(back.includes('?') ? back + '&msg=Attendance ' + status : back + '?msg=Attendance ' + status);
};
