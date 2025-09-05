#!/usr/bin/env node

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function createDatabase() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 3306
  };

  const dbName = process.env.DB_NAME;

  console.log('🔧 Creating database...');
  console.log(`📍 Host: ${config.host}:${config.port}`);
  console.log(`👤 User: ${config.user}`);
  console.log(`🗄️  Database: ${dbName}`);

  try {
    // Create connection without database
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist - use query() instead of execute() for DDL
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created successfully`);

    // Set charset and collation
    await connection.query(`ALTER DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Database charset set to utf8mb4');

    await connection.end();
    console.log('🎉 Database setup complete!');
    console.log('');
    console.log('Next steps:');
    console.log('  npm run db:init     - Create tables');
    console.log('  npm run db:migrate  - Add admin user and sample data');
    console.log('  npm run db:seed     - Add test users');
    
  } catch (error) {
    console.error('❌ Database creation failed:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   - MySQL server is not running');
      console.error('   - Check if MySQL is installed and started');
      console.error(`   - Verify connection to ${config.host}:${config.port}`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   - Access denied for user');
      console.error(`   - Check username: ${config.user}`);
      console.error('   - Check password in .env.local');
      console.error('   - Verify user has CREATE privileges');
    } else {
      console.error(`   - ${error.message}`);
    }
    
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Ensure MySQL server is running');
    console.error('   2. Check credentials in .env.local');
    console.error('   3. Verify user has database creation privileges');
    
    process.exit(1);
  }
}

createDatabase();