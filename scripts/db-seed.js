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
    priority: 'high',
    status: 'todo',
    due_date: new Date('2024-12-31')
  },
  {
    title: 'Update Student Database',
    description: 'Update all student records with current academic year information',
    priority: 'medium',
    status: 'in_progress',
    due_date: new Date('2024-11-30')
  },
  {
    title: 'Generate Monthly Performance Report',
    description: 'Create comprehensive monthly performance report for all schools',
    priority: 'medium',
    status: 'done',
    due_date: new Date('2024-10-15')
  },
  {
    title: 'Conduct Teacher Training Workshop',
    description: 'Organize and conduct professional development workshop for teachers',
    priority: 'high',
    status: 'todo',
    due_date: new Date('2024-11-15')
  },
  {
    title: 'Review Infrastructure Maintenance',
    description: 'Assess and plan infrastructure maintenance for all school facilities',
    priority: 'low',
    status: 'in_progress',
    due_date: new Date('2024-12-01')
  },
  {
    title: 'Digital Library System Implementation',
    description: 'Setup and configure new digital library management system',
    priority: 'medium',
    status: 'todo',
    due_date: new Date('2024-11-20')
  },
  {
    title: 'Annual Budget Review',
    description: 'Review and prepare annual budget for next academic year',
    priority: 'high',
    status: 'todo',
    due_date: new Date('2024-12-15')
  },
  {
    title: 'Security System Audit',
    description: 'Conduct comprehensive security audit of all school premises',
    priority: 'high',
    status: 'in_progress',
    due_date: new Date('2024-11-10')
  }
];

const sampleDocuments = [
  {
    title: 'Student Registration Form 2024',
    description: 'Official form for new student registration process',
    file_name: 'registration_form_2024.pdf',
    file_type: 'PDF',
    file_size: 2.5,
    file_path: '/uploads/forms/registration_form_2024.pdf',
    category: 'Forms',
    status: 'active'
  },
  {
    title: 'Academic Calendar 2024',
    description: 'Complete academic calendar for the year 2024',
    file_name: 'academic_calendar_2024.pdf',
    file_type: 'PDF',
    file_size: 1.8,
    file_path: '/uploads/calendar/academic_calendar_2024.pdf',
    category: 'Calendar',
    status: 'active'
  },
  {
    title: 'Teacher Handbook',
    description: 'Guidelines and policies for teaching staff',
    file_name: 'teacher_handbook_2024.docx',
    file_type: 'DOCX',
    file_size: 3.2,
    file_path: '/uploads/handbooks/teacher_handbook_2024.docx',
    category: 'Policies',
    status: 'active'
  },
  {
    title: 'Emergency Procedures Manual',
    description: 'Complete guide for emergency response procedures',
    file_name: 'emergency_procedures_2024.pdf',
    file_type: 'PDF',
    file_size: 4.1,
    file_path: '/uploads/manuals/emergency_procedures_2024.pdf',
    category: 'Safety',
    status: 'active'
  },
  {
    title: 'Budget Template 2024',
    description: 'Standard template for budget planning',
    file_name: 'budget_template_2024.xlsx',
    file_type: 'XLSX',
    file_size: 0.8,
    file_path: '/uploads/templates/budget_template_2024.xlsx',
    category: 'Templates',
    status: 'draft'
  }
];

const defaultSettings = [
  { setting_key: 'app_name', setting_value: 'Claude Code School Management', description: 'Application name displayed in the interface' },
  { setting_key: 'app_version', setting_value: '1.0.0', description: 'Current application version' },
  { setting_key: 'maintenance_mode', setting_value: 'false', description: 'Enable/disable maintenance mode' },
  { setting_key: 'max_file_upload_size', setting_value: '10485760', description: 'Maximum file upload size in bytes (10MB)' },
  { setting_key: 'session_timeout', setting_value: '3600', description: 'User session timeout in seconds' },
  { setting_key: 'email_notifications', setting_value: 'true', description: 'Enable/disable email notifications' },
  { setting_key: 'backup_retention_days', setting_value: '30', description: 'Number of days to retain backups' },
  { setting_key: 'default_theme', setting_value: 'light', description: 'Default application theme' }
];

let connection = null;

// Graceful shutdown handling
function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  if (connection) {
    connection.end()
      .then(() => {
        console.log('✅ Database connection closed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error closing database connection:', error);
        process.exit(1);
      });
  } else {
    process.exit(0);
  }
}

// Handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

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
    connection = await mysql.createConnection(config);
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
        'INSERT INTO tasks (title, description, assigned_to, created_by, priority, status, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          task.title,
          task.description,
          staffUsers[i].user_id,
          randomPrincipal.user_id,
          task.priority,
          task.status,
          task.due_date,
          new Date(),
          new Date()
        ]
      );

      console.log(`✅ Created task: ${task.title}`);
    }

    // Create sample documents
    const [adminUsers] = await connection.execute(
      'SELECT user_id FROM users WHERE role = ? LIMIT 1',
      ['super_admin']
    );

    if (adminUsers.length > 0) {
      for (const doc of sampleDocuments) {
        await connection.execute(
          'INSERT INTO documents (title, description, file_name, file_type, file_size, file_path, category, status, uploaded_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            doc.title,
            doc.description,
            doc.file_name,
            doc.file_type,
            doc.file_size,
            doc.file_path,
            doc.category,
            doc.status,
            adminUsers[0].user_id,
            new Date(),
            new Date()
          ]
        );

        console.log(`✅ Created document: ${doc.title}`);
      }
    }

    // Create system settings
    for (const setting of defaultSettings) {
      await connection.execute(
        'INSERT IGNORE INTO settings (setting_key, setting_value, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [
          setting.setting_key,
          setting.setting_value,
          setting.description,
          new Date(),
          new Date()
        ]
      );

      console.log(`✅ Created setting: ${setting.setting_key}`);
    }

    // Create user profiles
    const [allUsers] = await connection.execute(
      'SELECT user_id, name, email FROM users ORDER BY user_id ASC'
    );

    for (const user of allUsers) {
      await connection.execute(
        'INSERT IGNORE INTO profiles (user_id, first_name, last_name, phone, address, bio, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          user.user_id,
          user.name.split(' ')[0] || user.name,
          user.name.split(' ').slice(1).join(' ') || '',
          `+62-${Math.floor(Math.random() * 900000000) + 100000000}`,
          `Jl. Sample Street No. ${Math.floor(Math.random() * 100) + 1}, Jakarta`,
          'Professional educator with extensive experience in the field.',
          null,
          new Date(),
          new Date()
        ]
      );

      console.log(`✅ Created profile: ${user.name}`);
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