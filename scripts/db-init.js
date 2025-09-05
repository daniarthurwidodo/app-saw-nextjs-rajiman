#!/usr/bin/env node

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const createTablesSQL = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'kepala_sekolah', 'user') NOT NULL DEFAULT 'user',
  school_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_school_id (school_id)
);

-- Schools Table
CREATE TABLE IF NOT EXISTS schools (
  sekolah_id INT AUTO_INCREMENT PRIMARY KEY,
  nama_sekolah VARCHAR(255) NOT NULL,
  alamat TEXT,
  kontak VARCHAR(100),
  kepala_sekolah_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_kepala_sekolah (kepala_sekolah_id)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to INT,
  created_by INT,
  status ENUM('todo', 'in_progress', 'done') NOT NULL DEFAULT 'todo',
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  due_date DATE,
  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by_user_id INT,
  approval_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_created_by (created_by),
  INDEX idx_status (status),
  INDEX idx_priority (priority)
);

-- Subtasks Table
CREATE TABLE IF NOT EXISTS subtasks (
  subtask_id INT AUTO_INCREMENT PRIMARY KEY,
  relation_task_id INT NOT NULL,
  subtask_title VARCHAR(255) NOT NULL,
  subtask_description TEXT,
  assigned_to INT,
  subtask_status ENUM('todo', 'in_progress', 'done') NOT NULL DEFAULT 'todo',
  subtask_comment TEXT,
  subtask_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_relation_task (relation_task_id),
  INDEX idx_assigned_to (assigned_to)
);

-- Documentation Table
CREATE TABLE IF NOT EXISTS documentation (
  doc_id INT AUTO_INCREMENT PRIMARY KEY,
  subtask_id INT,
  doc_type ENUM('documentation', 'payment', 'attendance') NOT NULL,
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  uploaded_by INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_subtask_id (subtask_id),
  INDEX idx_doc_type (doc_type)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT,
  created_by INT,
  report_data JSON,
  rating TINYINT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_id (task_id),
  INDEX idx_created_by (created_by)
);

-- Criteria Table
CREATE TABLE IF NOT EXISTS criteria (
  criteria_id INT AUTO_INCREMENT PRIMARY KEY,
  criteria_name VARCHAR(255) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  description TEXT,
  created_by INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_by (created_by),
  INDEX idx_active (is_active)
);

-- Add Foreign Key Constraints
ALTER TABLE schools 
ADD CONSTRAINT fk_schools_kepala_sekolah 
FOREIGN KEY (kepala_sekolah_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE tasks 
ADD CONSTRAINT fk_tasks_assigned_to 
FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
ADD CONSTRAINT fk_tasks_created_by 
FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
ADD CONSTRAINT fk_tasks_approved_by 
FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE subtasks 
ADD CONSTRAINT fk_subtasks_task 
FOREIGN KEY (relation_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_subtasks_assigned_to 
FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE documentation 
ADD CONSTRAINT fk_documentation_subtask 
FOREIGN KEY (subtask_id) REFERENCES subtasks(subtask_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_documentation_uploaded_by 
FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE reports 
ADD CONSTRAINT fk_reports_task 
FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_reports_created_by 
FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE criteria 
ADD CONSTRAINT fk_criteria_created_by 
FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL;
`;

async function initializeDatabase() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    multipleStatements: true
  };

  console.log('🔧 Initializing database tables...');
  console.log(`📍 Database: ${config.database}`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Execute all table creation statements - use query() for DDL statements
    await connection.query(createTablesSQL);
    console.log('✅ All tables created successfully');

    // Check created tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📋 Created tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   ✓ ${tableName}`);
    });

    await connection.end();
    console.log('🎉 Database initialization complete!');
    console.log('');
    console.log('Next steps:');
    console.log('  npm run db:migrate  - Add admin user and sample data');
    console.log('  npm run db:seed     - Add test users');
    console.log('  npm run dev         - Start development server');

  } catch (error) {
    console.error('❌ Database initialization failed:');
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`   - Database '${config.database}' does not exist`);
      console.error('   - Run: npm run db:create');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   - Cannot connect to MySQL server');
      console.error(`   - Check connection to ${config.host}:${config.port}`);
    } else {
      console.error(`   - ${error.message}`);
    }
    
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Ensure database exists: npm run db:create');
    console.error('   2. Check MySQL server is running');
    console.error('   3. Verify credentials in .env.local');
    
    process.exit(1);
  }
}

initializeDatabase();