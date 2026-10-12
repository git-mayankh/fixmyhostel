-- FixMyHostel Database Schema

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'staff', 'warden') DEFAULT 'student',
  room_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_number INT NOT NULL,
  student_id INT NOT NULL,
  category ENUM('plumbing', 'electrical', 'internet', 'furniture', 'cleanliness', 'other') NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  title VARCHAR(200) NOT NULL,
  description TEXT,
  photo_url VARCHAR(500),
  location VARCHAR(200),
  status ENUM('RAISED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED') DEFAULT 'RAISED',
  assigned_to INT,
  resolution_notes TEXT,
  raised_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_severity (severity),
  INDEX idx_category (category),
  INDEX idx_raised_at (raised_at),
  INDEX idx_token_date (token_number, raised_at)
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT UNIQUE NOT NULL,
  student_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed default warden, student, and staff accounts
INSERT INTO users (name, email, password_hash, role) VALUES
('Mayank Heda', 'mayank@fixmyhostel.com', '$2a$10$8KxGBDGH5GJnJVL2lR7z5OtQN6oFQ/0x4RfKSJZLFpGDHn7Jbq8Ky', 'warden'),
('Ishita Gurbaxani', 'ishita@fixmyhostel.com', '$2a$10$8KxGBDGH5GJnJVL2lR7z5OtQN6oFQ/0x4RfKSJZLFpGDHn7Jbq8Ky', 'student'),
('Bhavisha Kewalramani', 'bhavisha@fixmyhostel.com', '$2a$10$8KxGBDGH5GJnJVL2lR7z5OtQN6oFQ/0x4RfKSJZLFpGDHn7Jbq8Ky', 'staff');
-- Note: The hash above is for 'password123' generated with bcrypt (10 rounds)
