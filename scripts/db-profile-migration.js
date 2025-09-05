#!/usr/bin/env node

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const profileMigrationSQL = `
-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN profile_image VARCHAR(500) NULL AFTER is_active,
ADD COLUMN phone VARCHAR(20) NULL AFTER profile_image,
ADD COLUMN address TEXT NULL AFTER phone,
ADD COLUMN bio TEXT NULL AFTER address;
`;

async function runProfileMigration() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306
  };

  console.log('🔧 Running profile migration...');
  console.log(`📍 Database: ${config.database}`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Check if columns already exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('profile_image', 'phone', 'address', 'bio')
    `, [config.database]);

    if (columns.length > 0) {
      console.log('ℹ️  Profile columns already exist, skipping migration');
      await connection.end();
      return;
    }

    // Execute migration
    await connection.query(profileMigrationSQL);
    console.log('✅ Profile migration completed successfully');

    // Verify the migration
    const [newColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('profile_image', 'phone', 'address', 'bio')
    `, [config.database]);

    console.log('📋 Added columns:');
    newColumns.forEach(col => {
      console.log(`   ✓ ${col.COLUMN_NAME}`);
    });

    await connection.end();
    console.log('🎉 Profile migration complete!');

  } catch (error) {
    console.error('❌ Profile migration failed:');
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`   - Database '${config.database}' does not exist`);
      console.error('   - Run: npm run db:create && npm run db:init');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   - Cannot connect to MySQL server');
      console.error(`   - Check connection to ${config.host}:${config.port}`);
    } else if (error.code === 'ER_DUP_FIELDNAME') {
      console.error('   - Profile columns already exist');
    } else {
      console.error(`   - ${error.message}`);
    }
    
    process.exit(1);
  }
}

runProfileMigration();