# Human Resource Management System (HRMS)

A full-stack **Human Resource Management System** built with **Node.js, Express, MySQL and EJS**.
It handles authentication, employee management, attendance, leave approvals and payroll for a single
company workspace, with role-based access for **Admin/HR** and **Employees**.

---

## Tech Stack

- **Runtime:** Node.js + Express.js
- **Database:** MySQL (`mysql2/promise`)
- **Views:** EJS (server-side rendering) + Tailwind CSS (CDN)
- **Auth & mail:** `bcryptjs`, `crypto`, `express-session`, `nodemailer`
- **Utilities:** `dotenv`, `method-override`

---

## Features

- **Role-based access control (RBAC):** Admin/HR and Employee roles.
- **Self signup → Admin workspace:** creating an account makes you the **Admin/HR** owner of your
  company, verified by a **6-digit OTP** emailed to you. Employees are added by an admin.
- **Admin adds employees:** a unique **Login ID** (`CC-FFLL-YYYY-NNNN`, e.g. `AC-JADO-2026-0001`) and a
  **temporary password** are generated and emailed. New employees must change the password on first login.
- **Login by email OR Login ID.**
- **Forgot / reset password** via OTP, with a live **password-strength meter** (8+ chars, letters,
  numbers & a symbol — enforced server-side too).
- **Employees (admin):** card grid → full read-only profile with Edit / Salary / Remove actions.
- **Attendance:** employees check in/out; admins see **Daily & Weekly** boards and approve/reject
  check-ins. Employees get a monthly attendance report on their profile.
- **Leaves:** employees apply for **Sick** or **Paid** leave (starting tomorrow or later, end ≥ start);
  admins approve/reject. Admins cannot apply for leave.
- **Salary:** one card per employee — **Earnings** (basic, HRA, allowances, bonus) and **Deductions**
  (PF, tax) with a computed **net payable**. Everyone can view; only admins can edit.
- **Responsive UI:** feature links collapse into a hamburger menu on mobile.

---

## Project Structure

```
Human-Resource-Management-System/
├── index.js                 # App bootstrap: middleware, session, mounts routers
├── config/
│   └── db.js                # MySQL connection pool
├── db/
│   ├── database.sql         # Fresh-install schema + seed admin
│   └── migration.sql        # Additive migration for existing databases
├── models/                  # Data-access layer (all SQL lives here)
│   ├── userModel.js
│   ├── attendanceModel.js
│   └── leaveModel.js
├── controllers/             # Business logic
│   ├── authController.js
│   ├── employeeController.js
│   ├── attendanceController.js
│   ├── leaveController.js
│   └── salaryController.js
├── routes/                  # URL → controller wiring
│   ├── authRoutes.js
│   ├── employeeRoutes.js
│   ├── attendanceRoutes.js
│   ├── leaveRoutes.js
│   └── salaryRoutes.js
├── middleware/
│   └── auth.js              # requireAuth, requireAdmin (RBAC)
├── services/
│   └── mailer.js            # Nodemailer wrappers (OTP, credentials)
├── utils/
│   └── helpers.js           # Password, login-code, OTP & date helpers
├── views/                   # EJS templates
│   ├── partials/            # header, footer, password-strength meter
│   ├── auth/                # verify-otp, forgot, reset, change-password
│   ├── employees/           # index, show, detail, edit, new
│   ├── attendance/, leaves/, salary/
│   ├── login.ejs, signup.ejs
└── public/
    └── style.css
```

**Request flow:** `routes → middleware (RBAC) → controller → model → MySQL`, then the controller
renders an EJS `view`.

---

## Setup

**Prerequisites:** Node.js 18+, MySQL 8+.

```bash
# 1. install dependencies
npm install

# 2. create your env file and fill in credentials
touch .env

# 3. create the database (fresh install — this DROPS and recreates hrms_db)
mysql -u root -p
source db/database.sql

# 4. run
npm start          # or: npm run dev  (nodemon)
```

Open **http://localhost:3000**

---

## Environment Variables (`.env`)

```ini
# Server
PORT=3000
SESSION_SECRET=change_this_to_a_long_random_string
BASE_URL=http://localhost:3000

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hrms_db

# Mail — leave SMTP_HOST blank for console demo mode (codes print to the terminal).
MAIL_FROM="HRMS <no-reply@hrms.com>"
# SMTP_HOST=sandbox.smtp.mailtrap.io
# SMTP_PORT=2525
# SMTP_USER=your_smtp_user
# SMTP_PASS=your_smtp_password
```

### Email delivery

- **Console demo mode (default):** leave `SMTP_HOST` unset — every OTP, reset code and temp password
  prints to the **server console**.
- **Mailtrap (testing):** set the `sandbox.smtp.mailtrap.io` values above to catch all mail in a web inbox.
- **Real email:** set your provider's SMTP host/port/user/pass (e.g. Gmail with an App Password).

> **Never commit `.env`** — it holds DB and mail secrets. It is already in `.gitignore`.

---

## Seeded Admin

- **Email:** `admin@hrms.com`
- **Password:** `admin123` (pre-verified)

---

## Quick Tour

1. Log in as the seeded admin → **+ Add Employee** (name + email). The Login ID / temp password print
   to the console (or arrive in Mailtrap/email).
2. Log out, sign in with that **Login ID** + temp password → you're prompted to set a new password.
3. As the employee: edit your **About**, **Apply Leave** (Sick/Paid, from tomorrow), check in.
4. As admin: approve the leave and check-in (**Attendance → Daily**), view **Weekly**, adjust **Salary**,
   open the employee card for full details.
5. Try **Forgot password** and **self-signup** to see the OTP flows.

---

## Team & Architecture

The project was built by **three developers on separate branches**, each owning a distinct layer so the
work never overlapped:

| Branch            | Owner   | Owns                                                                        |
| ----------------- | ------- | --------------------------------------------------------------------------- |
| `database-schema` | Saurav  | `config/`, `db/*.sql`, `models/`                                            |
| `auth-backend`    | Narayan | `utils/`, `services/`, `middleware/`, `controllers/`, `routes/`, `index.js` |
| `frontend-ui`     | Saloni  | `views/`, `public/`                                                         |

Branches were merged into `main` bottom-up: **database → auth-backend → frontend-ui**.

---

## Scripts

| Command       | Description                      |
| ------------- | -------------------------------- |
| `npm start`   | Run the server (`node index.js`) |
| `npm run dev` | Run with nodemon (auto-reload)   |

---

## License

Built for educational / hackathon use by Team HackCypher.
