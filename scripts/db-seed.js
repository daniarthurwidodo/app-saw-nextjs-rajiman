#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const dummyUsers = [
  // Super Admin
  { name: 'Super Administrator', email: 'superadmin@claudecode.com', role: 'super_admin' },
  
  // Admins
  { name: 'Ahmad Firdaus', email: 'ahmad.admin@claudecode.com', role: 'admin' },
  { name: 'Siti Nurhaliza', email: 'siti.admin@claudecode.com', role: 'admin' },
  
  // Principals
  { name: 'Dr. Bambang Sutrisno', email: 'bambang.principal@claudecode.com', role: 'kepala_sekolah' },
  { name: 'Dra. Kartini Dewi', email: 'kartini.principal@claudecode.com', role: 'kepala_sekolah' },
  { name: 'Prof. Soekarno Hatta', email: 'soekarno.principal@claudecode.com', role: 'kepala_sekolah' },
  { name: 'Drs. Habibie Rahman', email: 'habibie.principal@claudecode.com', role: 'kepala_sekolah' },
  
  // Staff
  { name: 'Andi Wijaya', email: 'andi.staff@claudecode.com', role: 'user' },
  { name: 'Maria Santos', email: 'maria.staff@claudecode.com', role: 'user' },
  { name: 'John Doe', email: 'john.staff@claudecode.com', role: 'user' },
  { name: 'Fatimah Zahra', email: 'fatimah.staff@claudecode.com', role: 'user' },
  { name: 'Budi Santoso', email: 'budi.staff@claudecode.com', role: 'user' },
  { name: 'Dewi Sartika', email: 'dewi.staff@claudecode.com', role: 'user' },
  { name: 'Rudi Hartono', email: 'rudi.staff@claudecode.com', role: 'user' },
  { name: 'Nina Marlina', email: 'nina.staff@claudecode.com', role: 'user' }
];

const sampleTasks = [
  {
    title: 'Setup New School Registration System',
    description: 'Implement and configure the new school registration system for incoming students',
    priority: 'high'
  },
  {
    title: 'Update Student Database',
    description: 'Update all student records with current academic year information',
    priority: 'medium'
  },
  {
    title: 'Generate Monthly Performance Report',
    description: 'Create comprehensive monthly performance report for all schools',
    priority: 'medium'
  },
  {
    title: 'Conduct Teacher Training Workshop',
    description: 'Organize and conduct professional development workshop for teachers',
    priority: 'high'
  },
  {
    title: 'Review Infrastructure Maintenance',
    description: 'Assess and plan infrastructure maintenance for all school facilities',
    priority: 'low'
  }
];

async function seedDatabase() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306
  };

  console.log('🔧 Seeding database with test data...');
  console.log(`📍 Database: ${config.database}`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    let createdUsers = 0;
    let skippedUsers = 0;

    // Create users
    for (const user of dummyUsers) {
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT email FROM users WHERE email = ?',
        [user.email]
      );

      if (existing.length > 0) {
        skippedUsers++;
        continue;
      }

      const hashedPassword = await bcrypt.hash('password123', 12);
      const currentTime = new Date();

      await connection.execute(
        'INSERT INTO users (name, email, password, role, created_at, updated_at, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.name, user.email, hashedPassword, user.role, currentTime, currentTime, 1]
      );

      createdUsers++;
      console.log(`✅ Created user: ${user.name} (${user.role})`);
    }

    // Assign principals to schools
    const [principals] = await connection.execute(
      'SELECT user_id, email FROM users WHERE role = ? ORDER BY user_id ASC',
      ['kepala_sekolah']
    );

    const [schools] = await connection.execute(
      'SELECT sekolah_id FROM schools ORDER BY sekolah_id ASC'
    );

    for (let i = 0; i < Math.min(principals.length, schools.length); i++) {
      await connection.execute(
        'UPDATE schools SET kepala_sekolah_id = ? WHERE sekolah_id = ?',
        [principals[i].user_id, schools[i].sekolah_id]
      );

      await connection.execute(
        'UPDATE users SET school_id = ? WHERE user_id = ?',
        [schools[i].sekolah_id, principals[i].user_id]
      );

      console.log(`✅ Assigned principal to school: ${principals[i].email}`);
    }

    // Create sample tasks
    const [users] = await connection.execute(
      'SELECT user_id, role FROM users WHERE role IN (?, ?) ORDER BY user_id ASC',
      ['user', 'kepala_sekolah']
    );

    const staffUsers = users.filter(u => u.role === 'user');
    const principalUsers = users.filter(u => u.role === 'kepala_sekolah');

    for (let i = 0; i < Math.min(sampleTasks.length, staffUsers.length); i++) {
      const task = sampleTasks[i];
      const randomPrincipal = principalUsers[Math.floor(Math.random() * principalUsers.length)];
      
      await connection.execute(
        'INSERT INTO tasks (title, description, assigned_to, created_by, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          task.title,
          task.description,
          staffUsers[i].user_id,
          randomPrincipal.user_id,
          task.priority,
          new Date(),
          new Date()
        ]
      );

      console.log(`✅ Created task: ${task.title}`);
    }

    await connection.end();
    console.log('🎉 Database seeding complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Users created: ${createdUsers}`);
    console.log(`   Users skipped: ${skippedUsers}`);
    console.log(`   Sample tasks: ${Math.min(sampleTasks.length, staffUsers.length)}`);
    console.log('');
    console.log('🔑 Test Credentials (all use password: password123):');
    console.log('   Super Admin: superadmin@claudecode.com');
    console.log('   Admin: ahmad.admin@claudecode.com');
    console.log('   Principal: bambang.principal@claudecode.com');
    console.log('   Staff: andi.staff@claudecode.com');
    console.log('');
    console.log('🚀 Ready to start development:');
    console.log('   npm run dev');

  } catch (error) {
    console.error('❌ Seeding failed:');
    console.error(`   - ${error.message}`);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Database does not exist, run: npm run db:create');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('💡 Tables do not exist, run: npm run db:init');
    }
    
    process.exit(1);
  }
}

seedDatabase();