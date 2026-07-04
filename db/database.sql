-- HRMS Schema (fresh install)
DROP DATABASE IF EXISTS hrms_db;
CREATE DATABASE hrms_db;
USE hrms_db;

-- USERS table: login info, profile, salary, and verification status
CREATE TABLE users (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(120) NOT NULL,
  email                VARCHAR(160) NOT NULL UNIQUE,
  password             VARCHAR(255) NOT NULL,             -- hashed password
  company              VARCHAR(160) NOT NULL DEFAULT '',  -- company the user belongs to
  login_code           VARCHAR(40)  DEFAULT NULL UNIQUE,  -- unique employee ID
  year_joined          INT          DEFAULT NULL,         -- year employee joined
  base_salary          DECIMAL(12,2) NOT NULL DEFAULT 0,  -- basic monthly salary
  house_rent           DECIMAL(12,2) NOT NULL DEFAULT 0,  -- HRA earning
  allowances           DECIMAL(12,2) NOT NULL DEFAULT 0,  -- general allowance
  standard_allowance   DECIMAL(12,2) NOT NULL DEFAULT 0,  -- standard allowance
  fixed_allowance      DECIMAL(12,2) NOT NULL DEFAULT 0,  -- fixed allowance
  performance_bonus    DECIMAL(12,2) NOT NULL DEFAULT 0,  -- bonus earning
  pf_contribution      DECIMAL(12,2) NOT NULL DEFAULT 0,  -- PF deduction
  tax_deduction        DECIMAL(12,2) NOT NULL DEFAULT 0,  -- tax deduction
  phone                VARCHAR(40)  DEFAULT NULL,
  address              VARCHAR(255) DEFAULT NULL,
  about                TEXT         DEFAULT NULL,
  skills               VARCHAR(500) DEFAULT NULL,
  certifications       VARCHAR(500) DEFAULT NULL,
  resume_url           VARCHAR(500) DEFAULT NULL,
  role                 ENUM('admin','employee') NOT NULL DEFAULT 'employee',
  is_verified          TINYINT(1)   NOT NULL DEFAULT 0,   -- account verified or not
  must_change_password TINYINT(1)   NOT NULL DEFAULT 0,   -- must change password on next login
  verification_token   VARCHAR(128) DEFAULT NULL,         -- backup email verification method
  otp_code             VARCHAR(10)  DEFAULT NULL,          -- OTP for verify/reset
  otp_expires          DATETIME     DEFAULT NULL,
  otp_purpose          ENUM('verify','reset') DEFAULT NULL,
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ATTENDANCE table: daily check-in/check-out with approval status
CREATE TABLE attendance (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  work_date  DATE NOT NULL,
  check_in   DATETIME DEFAULT NULL,
  check_out  DATETIME DEFAULT NULL,
  status     ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  CONSTRAINT fk_att_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- LEAVES table: leave requests with approval status
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

-- Create a default admin account (password: "admin123")
INSERT INTO users (name, email, password, company, role, is_verified)
VALUES ('HR Admin', 'admin@hrms.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'Acme Corp', 'admin', 1);