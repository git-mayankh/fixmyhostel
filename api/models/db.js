const mysql = require('mysql2/promise');

let pool = null;

function getPool() {
  if (!pool && process.env.NODE_ENV !== 'test') {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'fixmyhostel',
      password: process.env.DB_PASSWORD || 'hostel123',
      database: process.env.DB_NAME || 'fixmyhosteldb',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

async function query(sql, params = []) {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('Database pool not initialized or in test mode without DB');
  }
  const [results] = await currentPool.query(sql, params);
  return results;
}

async function initDbSchema() {
  const currentPool = getPool();
  if (!currentPool) return;

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('student', 'staff', 'warden') NOT NULL DEFAULT 'student',
      room_number VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  const createComplaintsTable = `
    CREATE TABLE IF NOT EXISTS complaints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      token_number VARCHAR(50) NOT NULL,
      student_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      category ENUM('plumbing', 'electrical', 'internet', 'furniture', 'cleanliness', 'other') NOT NULL,
      severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
      location VARCHAR(100) NOT NULL,
      photo_url VARCHAR(255),
      status ENUM('RAISED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED') NOT NULL DEFAULT 'RAISED',
      assigned_to INT,
      resolution_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      accepted_at TIMESTAMP NULL,
      started_at TIMESTAMP NULL,
      resolved_at TIMESTAMP NULL,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );
  `;

  const createFeedbackTable = `
    CREATE TABLE IF NOT EXISTS feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      complaint_id INT NOT NULL,
      student_id INT NOT NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  await query(createUsersTable);
  await query(createComplaintsTable);
  await query(createFeedbackTable);
}

module.exports = {
  getPool,
  query,
  initDbSchema
};
