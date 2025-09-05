// Migration script for tasks and subtasks system
// Run with: node scripts/tasks-subtasks-migration.js

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_management',
};

async function runMigration() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');

    // Create tasks table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        task_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to INT,
        created_by INT NOT NULL,
        status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        due_date DATETIME NULL,
        approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        approved_by_user_id INT NULL,
        approval_date DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
      )
    `);
    console.log('✓ Tasks table created/verified');

    // Create subtasks table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subtasks (
        subtask_id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Subtasks table created/verified');

    // Create subtask_images table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subtask_images (
        image_id INT AUTO_INCREMENT PRIMARY KEY,
        subtask_id INT NOT NULL,
        url VARCHAR(500) NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subtask_id) REFERENCES subtasks(subtask_id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Subtask images table created/verified');

    // Insert sample data
    console.log('\n--- Inserting Sample Data ---');

    // Insert sample task
    const [taskResult] = await connection.execute(
      `
      INSERT INTO tasks (title, description, assigned_to, created_by, status, priority, approval_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE task_id=LAST_INSERT_ID(task_id)
    `,
      [
        'Setup New School Registration System',
        'Implement and configure the new school registration system for incoming students',
        9, // assigned to user 9 (Andi Wijaya)
        8, // created by user 8 (Drs. Habibie Rahman)
        'done',
        'high',
        'pending',
      ]
    );

    const taskId = taskResult.insertId;
    console.log(`✓ Sample task inserted with ID: ${taskId}`);

    // Insert subtasks
    const subtasks = [
      { title: 'Research available systems', status: 'done' },
      { title: 'Select the best system', status: 'done' },
      { title: 'Configure the system', status: 'done' },
      { title: 'Test the system', status: 'done' },
      { title: 'Train staff on using the system', status: 'done' },
    ];

    for (const subtask of subtasks) {
      const [subtaskResult] = await connection.execute(
        `
        INSERT INTO subtasks (task_id, title, status)
        VALUES (?, ?, ?)
      `,
        [taskId, subtask.title, subtask.status]
      );

      // Add images only for the first subtask
      if (subtask.title === 'Research available systems') {
        const subtaskId = subtaskResult.insertId;

        await connection.execute(
          `
          INSERT INTO subtask_images (subtask_id, url, uploaded_at)
          VALUES (?, ?, ?), (?, ?, ?)
        `,
          [
            subtaskId,
            'https://example.com/images/research1.png',
            '2025-09-05 06:50:00',
            subtaskId,
            'https://example.com/images/research2.png',
            '2025-09-05 06:55:00',
          ]
        );
        console.log(`✓ Images added for subtask: ${subtask.title}`);
      }

      console.log(`✓ Subtask inserted: ${subtask.title}`);
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
