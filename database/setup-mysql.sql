
CREATE DATABASE IF NOT EXISTS algovis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE algovis_db;

CREATE TABLE IF NOT EXISTS simulations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  label VARCHAR(120) NOT NULL,
  algorithm VARCHAR(32) NOT NULL,
  quantum INT NULL,
  processes_json JSON NOT NULL,
  result_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sim_algorithm_created (algorithm, created_at)
);
CREATE TABLE IF NOT EXISTS db_benchmarks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  engine VARCHAR(20) NOT NULL,
  operation_name VARCHAR(32) NOT NULL,
  records_count INT NOT NULL,
  duration_ms DECIMAL(12,3) NOT NULL,
  operations_per_second DECIMAL(14,3) NOT NULL,
  status VARCHAR(20) NOT NULL,
  details_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_benchmark_engine_created (engine, created_at)
);
CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_type VARCHAR(60) NOT NULL,
  message VARCHAR(500) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS lab_students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  department VARCHAR(50) NOT NULL,
  score INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student_department (department)
);
INSERT INTO lab_students(name, department, score)
SELECT 'Aarav','CSE',86 WHERE NOT EXISTS (SELECT 1 FROM lab_students WHERE name='Aarav' AND department='CSE');
INSERT INTO lab_students(name, department, score)
SELECT 'Diya','IT',92 WHERE NOT EXISTS (SELECT 1 FROM lab_students WHERE name='Diya' AND department='IT');
INSERT INTO lab_students(name, department, score)
SELECT 'Kabir','CSE',74 WHERE NOT EXISTS (SELECT 1 FROM lab_students WHERE name='Kabir' AND department='CSE');
INSERT INTO lab_students(name, department, score)
SELECT 'Meera','ECE',88 WHERE NOT EXISTS (SELECT 1 FROM lab_students WHERE name='Meera' AND department='ECE');
INSERT INTO lab_students(name, department, score)
SELECT 'Rohan','IT',67 WHERE NOT EXISTS (SELECT 1 FROM lab_students WHERE name='Rohan' AND department='IT');
