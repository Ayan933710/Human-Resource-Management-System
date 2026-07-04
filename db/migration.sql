-- HRMS Feature Migration (additive — run once on an EXISTING hrms_db to keep your data)
-- Usage: mysql -u root -p hrms_db < migration.sql
-- Note: MySQL errors if a column already exists. If you re-run, remove lines already applied.
USE hrms_db;

-- ---- users -------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN login_code           VARCHAR(40)   DEFAULT NULL,
  ADD COLUMN year_joined          INT           DEFAULT NULL,
  ADD COLUMN base_salary          DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN about                TEXT          DEFAULT NULL,
  ADD COLUMN skills               VARCHAR(500)  DEFAULT NULL,
  ADD COLUMN certifications       VARCHAR(500)  DEFAULT NULL,
  ADD COLUMN resume_url           VARCHAR(500)  DEFAULT NULL,
  ADD COLUMN must_change_password TINYINT(1)    NOT NULL DEFAULT 0,
  ADD COLUMN otp_code             VARCHAR(10)   DEFAULT NULL,
  ADD COLUMN otp_expires          DATETIME      DEFAULT NULL,
  ADD COLUMN otp_purpose          ENUM('verify','reset') DEFAULT NULL;

-- Unique login code (added separately so existing NULLs are allowed)
ALTER TABLE users ADD UNIQUE KEY uq_users_login_code (login_code);

-- ---- salary breakdown (earnings + deductions) --------------------------
ALTER TABLE users
  ADD COLUMN house_rent         DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN allowances         DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN standard_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN fixed_allowance    DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN performance_bonus  DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN pf_contribution    DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN tax_deduction      DECIMAL(12,2) NOT NULL DEFAULT 0;

-- ---- attendance --------------------------------------------------------
ALTER TABLE attendance
  ADD COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending';

-- Existing attendance rows: treat historical records as already approved
UPDATE attendance SET status = 'approved' WHERE status = 'pending';

-- ---- leaves ------------------------------------------------------------
ALTER TABLE leaves
  ADD COLUMN leave_type ENUM('sick','paid') NOT NULL DEFAULT 'paid';
