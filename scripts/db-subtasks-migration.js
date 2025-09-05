import { query } from '../src/lib/db.js';

async function migrateSubtasks() {
  try {
    // Create subtasks table
    await query(`
      CREATE TABLE IF NOT EXISTS subtasks (
        subtask_id INT PRIMARY KEY AUTO_INCREMENT,
        task_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
      );
    `);

    // Create subtask_images table
    await query(`
      CREATE TABLE IF NOT EXISTS subtask_images (
        image_id INT PRIMARY KEY AUTO_INCREMENT,
        subtask_id INT NOT NULL,
        url VARCHAR(512) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subtask_id) REFERENCES subtasks(subtask_id) ON DELETE CASCADE
      );
    `);

    console.log('Subtasks migration completed successfully');
  } catch (error) {
    console.error('Error during subtasks migration:', error);
    throw error;
  }
}

migrateSubtasks();
