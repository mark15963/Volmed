BEGIN;

-- TABLE: medications
CREATE TABLE medications (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  administered JSONB NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO medications (id, patient_id, name, dosage, frequency, administered, "createdAt") VALUES
(7, 2, 'Омепразол', '25мг', '2р/д', '["2025-05-31T18:41:27.605Z"]', '2025-05-31 18:38:01'),
(8, 84, 'Парацетамол', '500мг', '6р/д', '["2025-06-01T09:38:15.613Z"]', '2025-06-01 09:38:16'),
(9, 1, 'Омепразол', '25мг', '2р/д', '[]', '2025-06-01 16:55:31');

-- TABLE: patients
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  "lastName" VARCHAR(100) NOT NULL,
  "firstName" VARCHAR(100) NOT NULL,
  patr TEXT NOT NULL,
  sex VARCHAR(7) NOT NULL,
  "birthDate" VARCHAR(10) NOT NULL,
  phone VARCHAR(16) NOT NULL,
  email VARCHAR(100) NOT NULL,
  address VARCHAR(100) NOT NULL,
  complaint TEXT NOT NULL,
  anam TEXT NOT NULL,
  life TEXT NOT NULL,
  status TEXT NOT NULL,
  diag TEXT NOT NULL,
  mkb TEXT NOT NULL,
  sop_zab TEXT NOT NULL,
  rec TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "statusReport" TEXT NOT NULL,
  "locStat" TEXT NOT NULL,
  report TEXT NOT NULL,
  state VARCHAR(100) NOT NULL
);

-- You can split these long inserts if needed for performance or readability
INSERT INTO patients (id, "lastName", "firstName", patr, sex, "birthDate", phone, email, address, complaint, anam, life, status, diag, mkb, sop_zab, rec, created_at, "statusReport", "locStat", report, state) VALUES
-- truncated for brevity, same as original dump...

-- TABLE: patient_pulse
CREATE TABLE patient_pulse (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  pulse_value INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

INSERT INTO patient_pulse (id, patient_id, pulse_value, created_at) VALUES
(17, 2, 95, '2025-06-01 14:41:16'),
(18, 2, 86, '2025-06-01 14:43:27'),
(19, 2, 70, '2025-06-01 14:58:04'),
(20, 2, 110, '2025-06-01 15:04:34'),
(21, 1, 65, '2025-06-01 15:37:17'),
(22, 1, 85, '2025-06-01 16:09:54'),
(23, 1, 60, '2025-06-01 16:10:11'),
(24, 1, 75, '2025-06-01 16:10:16'),
(25, 2, 90, '2025-06-02 14:05:42');

-- TABLE: users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(60) NOT NULL,
  "lastName" VARCHAR(100) NOT NULL,
  "firstName" VARCHAR(100) NOT NULL,
  patr VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  "birthDay" DATE
);

INSERT INTO users (id, username, password, "lastName", "firstName", patr, email, "birthDay") VALUES
(23, 'mark15963', '$2b$10$SH2DS1QGJNOlerfFFWXxjuARtTmk3QgTfpnruw43WUWNQwaa0qye6', 'Винер', 'Марк', 'Ильич', 'mark15963@gmail.com', '1998-09-04'),
(24, 'mark', '$2y$12$Anyx6wHQnBo0mNksuKyss.nC5Fu8ZS1/Fnyh2k/tHGbib9HCi2HSm', '', '', '', 'mark@gmail.com', NULL),
(27, 'test1', '$2b$10$VVASXHjPffPMj.4UCT7IEOZsBaHBZ8atKDqO5GBuQUaDBsN09vHWO', 'test3', 'test2', 'tes4', '', NULL),
(29, 'test', '$2b$10$SH2DS1QGJNOlerfFFWXxjuARtTmk3QgTfpnruw43WUWNQwaa0qye6', 'Пользователь', 'Пользователь', 'Пользователь', '', NULL);

COMMIT;
