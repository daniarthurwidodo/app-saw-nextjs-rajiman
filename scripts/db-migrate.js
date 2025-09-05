#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function runMigrations() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306
  };

  console.log('🔧 Running database migrations...');
  console.log(`📍 Database: ${config.database}`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Check if admin user already exists
    const [existingAdmin] = await connection.execute(
      'SELECT email FROM users WHERE email = ?',
      ['admin@claudecode.com']
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin user already exists, skipping user creation');
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('password123', 12);
      const currentTime = new Date();

      await connection.execute(
        `INSERT INTO users (name, email, password, role, created_at, updated_at, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['System Administrator', 'admin@claudecode.com', hashedPassword, 'super_admin', currentTime, currentTime, 1]
      );
      console.log('✅ Created admin user: admin@claudecode.com');
    }

    // Insert sample schools
    const schools = [
      ['SDN 01 Jakarta', 'Jl. Merdeka No. 123, Jakarta Pusat', '021-1234567'],
      ['SMP 05 Bandung', 'Jl. Asia Afrika No. 456, Bandung', '022-7654321'],
      ['SMA 03 Surabaya', 'Jl. Pahlawan No. 789, Surabaya', '031-9876543'],
      ['SDN 12 Medan', 'Jl. Gatot Subroto No. 321, Medan', '061-5432109']
    ];

    for (const [nama, alamat, kontak] of schools) {
      // Check if school already exists
      const [existing] = await connection.execute(
        'SELECT nama_sekolah FROM schools WHERE nama_sekolah = ?',
        [nama]
      );

      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO schools (nama_sekolah, alamat, kontak, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [nama, alamat, kontak, new Date(), new Date()]
        );
        console.log(`✅ Created school: ${nama}`);
      }
    }

    // Insert decision criteria
    const criteria = [
      ['Academic Performance', 30.0, 'Student academic achievements and test scores'],
      ['Infrastructure Quality', 25.0, 'School facilities and infrastructure condition'],
      ['Teacher Quality', 20.0, 'Teacher qualifications and performance'],
      ['Student Attendance', 15.0, 'Student attendance and participation rates'],
      ['Community Engagement', 10.0, 'Parent and community involvement']
    ];

    for (const [name, weight, description] of criteria) {
      // Check if criteria already exists
      const [existing] = await connection.execute(
        'SELECT criteria_name FROM criteria WHERE criteria_name = ?',
        [name]
      );

      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO criteria (criteria_name, weight, description, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [name, weight, description, 1, new Date(), new Date()]
        );
        console.log(`✅ Created criteria: ${name}`);
      }
    }

    await connection.end();
    console.log('🎉 Database migration complete!');
    console.log('');
    console.log('🔑 Admin Credentials:');
    console.log('   Email: admin@claudecode.com');
    console.log('   Password: password123');
    console.log('');
    console.log('Next steps:');
    console.log('  npm run db:seed     - Add test users (optional)');
    console.log('  npm run dev         - Start development server');

  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(`   - ${error.message}`);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Database does not exist, run: npm run db:create');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('💡 Tables do not exist, run: npm run db:init');
    }
    
    process.exit(1);
  }
}

runMigrations();