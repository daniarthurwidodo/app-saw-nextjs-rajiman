#!/usr/bin/env node

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function migrateSubtasks() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306
    });

    console.log('🔧 Starting subtask migration...');

    // Step 1: Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'subtasks' 
      AND COLUMN_NAME = 'is_completed'
    `);

    // Add column if it doesn't exist
    if (Array.isArray(columns) && columns.length === 0) {
      await connection.query(`
        ALTER TABLE subtasks
        ADD COLUMN is_completed BOOLEAN DEFAULT FALSE AFTER assigned_to
      `);
    }
    console.log('✅ Added is_completed column');

    // Step 2: Update the is_completed values based on the old subtask_status
    await connection.query(`
      UPDATE subtasks
      SET is_completed = (subtask_status = 'done')
      WHERE subtask_status IS NOT NULL
    `);
    console.log('✅ Updated is_completed values');

    // Step 3: Check and remove old columns
    const [oldColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'subtasks' 
      AND COLUMN_NAME IN ('subtask_status', 'subtask_comment', 'subtask_date')
    `);

    if (oldColumns.length > 0) {
      const columnsToRemove = oldColumns.map(col => col.COLUMN_NAME);
      if (columnsToRemove.length > 0) {
        await connection.query(`
          ALTER TABLE subtasks
          ${columnsToRemove.map(col => `DROP COLUMN ${col}`).join(', ')}
        `);
      }
    }
    console.log('✅ Removed old columns');

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrateSubtasks();
