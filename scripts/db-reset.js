#!/usr/bin/env node

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function resetDatabase() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306
  };

  console.log('🔧 Resetting database...');
  console.log(`📍 Database: ${config.database}`);
  console.log('⚠️  This will delete all data!');

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('📭 Database is already empty');
    } else {
      // Drop all tables
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);
        console.log(`🗑️  Dropped table: ${tableName}`);
      }
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    await connection.end();
    console.log('🎉 Database reset complete!');
    console.log('');
    console.log('Next steps:');
    console.log('  npm run db:init     - Create tables');
    console.log('  npm run db:migrate  - Add admin user and sample data');
    console.log('  npm run db:seed     - Add test users');

  } catch (error) {
    console.error('❌ Reset failed:');
    console.error(`   - ${error.message}`);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Database does not exist, run: npm run db:create');
    }
    
    process.exit(1);
  }
}

resetDatabase();