-- HRMS Schema (fresh install)
DROP DATABASE IF EXISTS hrms_db;
CREATE DATABASE hrms_db;
USE hrms_db;

-- USERS: stores auth + profile + verification state
CREATE TABLE users (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(120) NOT NULL,
  email                VARCHAR(160) NOT NULL UNIQUE,
  password             VARCHAR(255) NOT NULL,             -- bcrypt hash
  company              VARCHAR(160) NOT NULL DEFAULT '',  -- links user to their company
  login_code           VARCHAR(40)  DEFAULT NULL UNIQUE,  -- generated employee ID e.g. AC-JADO-2026-0001
  year_joined          INT          DEFAULT NULL,         -- used for per-company/per-year serial
  base_salary          DECIMAL(12,2) NOT NULL DEFAULT 0,  -- monthly basic salary
  house_rent           DECIMAL(12,2) NOT NULL DEFAULT 0,   -- HRA (earning)
  allowances           DECIMAL(12,2) NOT NULL DEFAULT 0,   -- general allowances (earning)
  standard_allowance   DECIMAL(12,2) NOT NULL DEFAULT 0,   -- (earning)
  fixed_allowance      DECIMAL(12,2) NOT NULL DEFAULT 0,   -- (earning)
  performance_bonus    DECIMAL(12,2) NOT NULL DEFAULT 0,   -- (earning)
  pf_contribution      DECIMAL(12,2) NOT NULL DEFAULT 0,   -- (deduction)
  tax_deduction        DECIMAL(12,2) NOT NULL DEFAULT 0,   -- (deduction)
  phone                VARCHAR(40)  DEFAULT NULL,
  address              VARCHAR(255) DEFAULT NULL,
  about                TEXT         DEFAULT NULL,
  skills               VARCHAR(500) DEFAULT NULL,
  certifications       VARCHAR(500) DEFAULT NULL,
  resume_url           VARCHAR(500) DEFAULT NULL,
  role                 ENUM('admin','employee') NOT NULL DEFAULT 'employee',
  is_verified          TINYINT(1)   NOT NULL DEFAULT 0,   -- boolean
  must_change_password TINYINT(1)   NOT NULL DEFAULT 0,   -- forces password change on next login
  verification_token   VARCHAR(128) DEFAULT NULL,         -- legacy link-based verification (fallback)
  otp_code             VARCHAR(10)  DEFAULT NULL,          -- OTP for email verify / password reset
  otp_expires          DATETIME     DEFAULT NULL,
  otp_purpose          ENUM('verify','reset') DEFAULT NULL,
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ATTENDANCE: one row per check-in/out cycle, with admin approval workflow
CREATE TABLE attendance (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  work_date  DATE NOT NULL,
  check_in   DATETIME DEFAULT NULL,
  check_out  DATETIME DEFAULT NULL,
  status     ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  CONSTRAINT fk_att_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- LEAVES: leave requests + approval workflow
CREATE TABLE leaves (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  leave_type  ENUM('sick','paid') NOT NULL DEFAULT 'paid',
  reason      VARCHAR(500) DEFAULT NULL,
  status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed one admin (password: "admin123")
INSERT INTO users (name, email, password, company, role, is_verified)
VALUES ('HR Admin', 'admin@hrms.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'Acme Corp', 'admin', 1);
