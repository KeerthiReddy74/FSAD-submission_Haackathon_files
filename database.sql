-- ============================================
-- Blood Bank Management System
-- Full Schema + Seed Data
-- ============================================

CREATE DATABASE IF NOT EXISTS blood_bank;
USE blood_bank;

-- ----------------------
-- Table: donors
-- ----------------------
CREATE TABLE IF NOT EXISTS donors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(15),
  blood_group ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------
-- Table: donations
-- ----------------------
CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT,
  blood_group ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
  units DECIMAL(3,1) DEFAULT 1.0,
  donation_date DATE,
  test_result ENUM('passed','failed') DEFAULT 'passed',
  notes TEXT,
  FOREIGN KEY (donor_id) REFERENCES donors(id)
);

-- ----------------------
-- Table: blood_inventory
-- ----------------------
CREATE TABLE IF NOT EXISTS blood_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blood_group ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') UNIQUE,
  units_available DECIMAL(5,1) DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------
-- Table: hospitals
-- ----------------------
CREATE TABLE IF NOT EXISTS hospitals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(100),
  phone VARCHAR(15),
  address TEXT,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------
-- Table: blood_requests
-- ----------------------
CREATE TABLE IF NOT EXISTS blood_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT,
  blood_group ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
  units_requested DECIMAL(4,1),
  urgency ENUM('normal','urgent','critical') DEFAULT 'normal',
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- ----------------------
-- Table: eligibility_checks
-- ----------------------
CREATE TABLE IF NOT EXISTS eligibility_checks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_eligible BOOLEAN,
  reason VARCHAR(200),
  FOREIGN KEY (donor_id) REFERENCES donors(id)
);

-- ----------------------
-- Seed: blood_inventory
-- ----------------------
INSERT INTO blood_inventory (blood_group, units_available, low_stock_threshold) VALUES
('A+',  10, 5),
('A-',   4, 5),
('B+',  15, 5),
('B-',   2, 5),
('AB+',  8, 5),
('AB-',  3, 5),
('O+',  20, 5),
('O-',   1, 5)
ON DUPLICATE KEY UPDATE units_available = VALUES(units_available);

-- ----------------------
-- Seed: Sample donors
-- ----------------------
INSERT IGNORE INTO donors (name, email, phone, blood_group, date_of_birth) VALUES
('Arjun Sharma',   'arjun@example.com',  '9876543210', 'O+',  '1995-06-15'),
('Priya Reddy',    'priya@example.com',  '9876543211', 'A+',  '1998-03-22'),
('Ravi Kumar',     'ravi@example.com',   '9876543212', 'B+',  '1990-11-08'),
('Sneha Patel',    'sneha@example.com',  '9876543213', 'AB+', '2000-01-30'),
('Mohammed Ali',   'mali@example.com',   '9876543214', 'O-',  '1988-07-19'),
('Ananya Singh',   'ananya@example.com', '9876543215', 'A-',  '1997-09-05');

-- ----------------------
-- Seed: Sample hospitals
-- ----------------------
INSERT IGNORE INTO hospitals (name, email, phone, address) VALUES
('KIMS Hospital',        'kims@hospital.com',   '04023456789', 'Secunderabad, Hyderabad'),
('Apollo Hospitals',     'apollo@hospital.com', '04027891234', 'Jubilee Hills, Hyderabad'),
('Yashoda Hospital',     'yashoda@hospital.com','04066778899', 'Somajiguda, Hyderabad');

-- ----------------------
-- Seed: Sample donations (older than 90 days so donors are eligible)
-- ----------------------
INSERT IGNORE INTO donations (donor_id, blood_group, units, donation_date, test_result) VALUES
(1, 'O+',  1.0, DATE_SUB(CURDATE(), INTERVAL 120 DAY), 'passed'),
(2, 'A+',  1.0, DATE_SUB(CURDATE(), INTERVAL 100 DAY), 'passed'),
(3, 'B+',  1.0, DATE_SUB(CURDATE(), INTERVAL 95 DAY),  'passed');
