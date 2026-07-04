require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.query.msg || null;
  res.locals.error = req.query.err || null;
  next();
});

app.use(require("./routes/authRoutes"));
app.use(require("./routes/employeeRoutes"));
app.use(require("./routes/attendanceRoutes"));
app.use(require("./routes/leaveRoutes"));
app.use(require("./routes/salaryRoutes"));

app.get("/", (req, res) =>
  res.redirect(req.session.user ? "/profile" : "/login"),
);
app.use((req, res) => res.status(404).send("404 — Not Found"));
app.listen(PORT, () => console.log(`HRMS running on ${PORT}`));
