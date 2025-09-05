import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'admin', 'kepala_sekolah', 'user') NOT NULL DEFAULT 'user',
        school_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `;

    const createSchoolsTable = `
      CREATE TABLE IF NOT EXISTS schools (
        sekolah_id INT AUTO_INCREMENT PRIMARY KEY,
        nama_sekolah VARCHAR(255) NOT NULL,
        alamat TEXT,
        kontak VARCHAR(100),
        kepala_sekolah_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (kepala_sekolah_id) REFERENCES users(user_id)
      )
    `;

    const createTasksTable = `
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
        FOREIGN KEY (assigned_to) REFERENCES users(user_id),
        FOREIGN KEY (created_by) REFERENCES users(user_id),
        FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id)
      )
    `;

    const createSubtasksTable = `
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
        FOREIGN KEY (relation_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(user_id)
      )
    `;

    const createDocumentationTable = `
      CREATE TABLE IF NOT EXISTS documentation (
        doc_id INT AUTO_INCREMENT PRIMARY KEY,
        subtask_id INT,
        doc_type ENUM('documentation', 'payment', 'attendance') NOT NULL,
        file_path VARCHAR(500),
        file_name VARCHAR(255),
        uploaded_by INT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subtask_id) REFERENCES subtasks(subtask_id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
      )
    `;

    const createReportsTable = `
      CREATE TABLE IF NOT EXISTS reports (
        report_id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT,
        created_by INT,
        report_data JSON,
        rating TINYINT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(user_id)
      )
    `;

    const createCriteriaTable = `
      CREATE TABLE IF NOT EXISTS criteria (
        criteria_id INT AUTO_INCREMENT PRIMARY KEY,
        criteria_name VARCHAR(255) NOT NULL,
        weight DECIMAL(5,2) NOT NULL,
        description TEXT,
        created_by INT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(user_id)
      )
    `;

    await query(createUsersTable);
    await query(createSchoolsTable);
    await query(createTasksTable);
    await query(createSubtasksTable);
    await query(createDocumentationTable);
    await query(createReportsTable);
    await query(createCriteriaTable);

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize database',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
