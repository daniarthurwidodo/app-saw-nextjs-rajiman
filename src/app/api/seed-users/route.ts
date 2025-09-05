import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { UserRole } from '@/types';

const dummyUsers = [
  // Super Admin
  {
    name: 'Super Administrator',
    email: 'superadmin@claudecode.com',
    password: 'password123',
    role: UserRole.SUPER_ADMIN
  },
  // Admins
  {
    name: 'Ahmad Firdaus',
    email: 'ahmad.admin@claudecode.com',
    password: 'password123',
    role: UserRole.ADMIN
  },
  {
    name: 'Siti Nurhaliza',
    email: 'siti.admin@claudecode.com',
    password: 'password123',
    role: UserRole.ADMIN
  },
  // Kepala Sekolah (Principals)
  {
    name: 'Dr. Bambang Sutrisno',
    email: 'bambang.principal@claudecode.com',
    password: 'password123',
    role: UserRole.KEPALA_SEKOLAH
  },
  {
    name: 'Dra. Kartini Dewi',
    email: 'kartini.principal@claudecode.com',
    password: 'password123',
    role: UserRole.KEPALA_SEKOLAH
  },
  {
    name: 'Prof. Soekarno Hatta',
    email: 'soekarno.principal@claudecode.com',
    password: 'password123',
    role: UserRole.KEPALA_SEKOLAH
  },
  {
    name: 'Drs. Habibie Rahman',
    email: 'habibie.principal@claudecode.com',
    password: 'password123',
    role: UserRole.KEPALA_SEKOLAH
  },
  // Users (Staff)
  {
    name: 'Andi Wijaya',
    email: 'andi.staff@claudecode.com',
    password: 'password123',
    role: UserRole.USER
  },
  {
    name: 'Maria Santos',
    email: 'maria.staff@claudecode.com',
    password: 'password123',
    role: UserRole.USER
  },
  {
    name: 'John Doe',
    email: 'john.staff@claudecode.com',
    password: 'password123',
    role: UserRole.USER
  },
  {
    name: 'Fatimah Zahra',
    email: 'fatimah.staff@claudecode.com',
    password: 'password123',
    role: UserRole.USER
  },
  {
    name: 'Budi Santoso',
    email: 'budi.staff@claudecode.com',
    password: 'password123',
    role: UserRole.USER
  },
  {
    name: 'Dewi Sartika',
    email: 'dewi.staff@claudecode.com',
    password: 'password123',
    role: UserRole.USER
  },
  {
    name: 'Rudi Hartono',
    email: 'rudi.staff@claudecode.com',
    password: 'password123',
    role: UserRole.USER
  },
  {
    name: 'Nina Marlina',
    email: 'nina.staff@claudecode.com',
    password: 'password123',
    role: UserRole.USER
  }
];

export async function POST() {
  try {
    let createdUsers = 0;
    let skippedUsers = 0;
    const errors: string[] = [];

    for (const userData of dummyUsers) {
      try {
        // Check if user already exists
        const existingUsers = await query(
          'SELECT email FROM users WHERE email = ?',
          [userData.email]
        ) as any[];

        if (existingUsers.length > 0) {
          skippedUsers++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const currentTime = new Date().toISOString();

        // Insert user
        await query(
          `INSERT INTO users (name, email, password, role, created_at, updated_at, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [userData.name, userData.email, hashedPassword, userData.role, currentTime, currentTime]
        );

        createdUsers++;
      } catch (error) {
        errors.push(`Failed to create user ${userData.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Assign principals to schools
    try {
      const principals = await query(
        'SELECT user_id, email FROM users WHERE role = ? ORDER BY user_id ASC',
        [UserRole.KEPALA_SEKOLAH]
      ) as any[];

      const schools = await query(
        'SELECT sekolah_id FROM schools ORDER BY sekolah_id ASC'
      ) as any[];

      // Assign first 4 principals to schools
      for (let i = 0; i < Math.min(principals.length, schools.length); i++) {
        await query(
          'UPDATE schools SET kepala_sekolah_id = ? WHERE sekolah_id = ?',
          [principals[i].user_id, schools[i].sekolah_id]
        );

        // Update user's school_id
        await query(
          'UPDATE users SET school_id = ? WHERE user_id = ?',
          [schools[i].sekolah_id, principals[i].user_id]
        );
      }
    } catch (error) {
      errors.push(`Failed to assign principals to schools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Create sample tasks
    try {
      const users = await query(
        'SELECT user_id, role FROM users WHERE role IN (?, ?) ORDER BY user_id ASC',
        [UserRole.USER, UserRole.KEPALA_SEKOLAH]
      ) as any[];

      const sampleTasks = [
        {
          title: 'Setup New School Registration System',
          description: 'Implement and configure the new school registration system for incoming students',
          priority: 'high',
          due_date: '2024-12-31',
          status: 'todo'
        },
        {
          title: 'Update Student Database',
          description: 'Update all student records with current academic year information',
          priority: 'medium',
          due_date: '2024-11-30',
          status: 'in_progress'
        },
        {
          title: 'Generate Monthly Performance Report',
          description: 'Create comprehensive monthly performance report for all schools',
          priority: 'medium',
          due_date: '2024-10-15',
          status: 'done'
        },
        {
          title: 'Conduct Teacher Training Workshop',
          description: 'Organize and conduct professional development workshop for teachers',
          priority: 'high',
          due_date: '2024-11-15',
          status: 'todo'
        },
        {
          title: 'Review Infrastructure Maintenance',
          description: 'Assess and plan infrastructure maintenance for all school facilities',
          priority: 'low',
          due_date: '2024-12-01',
          status: 'in_progress'
        },
        {
          title: 'Digital Library System Implementation',
          description: 'Setup and configure new digital library management system',
          priority: 'medium',
          due_date: '2024-11-20',
          status: 'todo'
        },
        {
          title: 'Annual Budget Review',
          description: 'Review and prepare annual budget for next academic year',
          priority: 'high',
          due_date: '2024-12-15',
          status: 'todo'
        },
        {
          title: 'Security System Audit',
          description: 'Conduct comprehensive security audit of all school premises',
          priority: 'high',
          due_date: '2024-11-10',
          status: 'in_progress'
        }
      ];

      const staffUsers = users.filter(u => u.role === UserRole.USER);
      const principals = users.filter(u => u.role === UserRole.KEPALA_SEKOLAH);
      
      for (let i = 0; i < sampleTasks.length && i < staffUsers.length; i++) {
        const currentTime = new Date().toISOString();
        const randomPrincipal = principals[Math.floor(Math.random() * principals.length)];
        
        await query(
          `INSERT INTO tasks (title, description, assigned_to, created_by, priority, due_date, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sampleTasks[i].title,
            sampleTasks[i].description,
            staffUsers[i].user_id,
            randomPrincipal.user_id,
            sampleTasks[i].priority,
            sampleTasks[i].due_date,
            sampleTasks[i].status,
            currentTime,
            currentTime
          ]
        );
      }
    } catch (error) {
      errors.push(`Failed to create sample tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Create sample documents
    try {
      const adminUser = await query(
        'SELECT user_id FROM users WHERE role = ? LIMIT 1',
        [UserRole.SUPER_ADMIN]
      ) as any[];

      if (adminUser.length > 0) {
        const sampleDocuments = [
          {
            title: 'Student Registration Form 2024',
            description: 'Official form for new student registration process',
            file_name: 'registration_form_2024.pdf',
            file_type: 'PDF',
            file_size: 2.5,
            file_path: '/uploads/forms/registration_form_2024.pdf',
            category: 'Forms',
            status: 'active',
            uploaded_by: adminUser[0].user_id
          },
          {
            title: 'Academic Calendar 2024',
            description: 'Complete academic calendar for the year 2024',
            file_name: 'academic_calendar_2024.pdf',
            file_type: 'PDF',
            file_size: 1.8,
            file_path: '/uploads/calendar/academic_calendar_2024.pdf',
            category: 'Calendar',
            status: 'active',
            uploaded_by: adminUser[0].user_id
          },
          {
            title: 'Teacher Handbook',
            description: 'Guidelines and policies for teaching staff',
            file_name: 'teacher_handbook_2024.docx',
            file_type: 'DOCX',
            file_size: 3.2,
            file_path: '/uploads/handbooks/teacher_handbook_2024.docx',
            category: 'Policies',
            status: 'active',
            uploaded_by: adminUser[0].user_id
          },
          {
            title: 'Emergency Procedures Manual',
            description: 'Complete guide for emergency response procedures',
            file_name: 'emergency_procedures_2024.pdf',
            file_type: 'PDF',
            file_size: 4.1,
            file_path: '/uploads/manuals/emergency_procedures_2024.pdf',
            category: 'Safety',
            status: 'active',
            uploaded_by: adminUser[0].user_id
          },
          {
            title: 'Budget Template 2024',
            description: 'Standard template for budget planning',
            file_name: 'budget_template_2024.xlsx',
            file_type: 'XLSX',
            file_size: 0.8,
            file_path: '/uploads/templates/budget_template_2024.xlsx',
            category: 'Templates',
            status: 'draft',
            uploaded_by: adminUser[0].user_id
          }
        ];

        for (const doc of sampleDocuments) {
          const currentTime = new Date().toISOString();
          
          await query(
            `INSERT INTO documents (title, description, file_name, file_type, file_size, file_path, category, status, uploaded_by, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              doc.title,
              doc.description,
              doc.file_name,
              doc.file_type,
              doc.file_size,
              doc.file_path,
              doc.category,
              doc.status,
              doc.uploaded_by,
              currentTime,
              currentTime
            ]
          );
        }
      }
    } catch (error) {
      errors.push(`Failed to create sample documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Create system settings
    try {
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

      for (const setting of defaultSettings) {
        const currentTime = new Date().toISOString();
        
        await query(
          `INSERT IGNORE INTO settings (setting_key, setting_value, description, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            setting.setting_key,
            setting.setting_value,
            setting.description,
            currentTime,
            currentTime
          ]
        );
      }
    } catch (error) {
      errors.push(`Failed to create system settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Create user profiles
    try {
      const allUsers = await query(
        'SELECT user_id, name, email FROM users ORDER BY user_id ASC'
      ) as any[];

      for (const user of allUsers) {
        const currentTime = new Date().toISOString();
        
        await query(
          `INSERT IGNORE INTO profiles (user_id, first_name, last_name, phone, address, bio, avatar, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.user_id,
            user.name.split(' ')[0] || user.name,
            user.name.split(' ').slice(1).join(' ') || '',
            `+62-${Math.floor(Math.random() * 900000000) + 100000000}`,
            `Jl. Sample Street No. ${Math.floor(Math.random() * 100) + 1}, Jakarta`,
            `Professional educator with extensive experience in the field.`,
            null,
            currentTime,
            currentTime
          ]
        );
      }
    } catch (error) {
      errors.push(`Failed to create user profiles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Dummy users migration completed',
      summary: {
        created: createdUsers,
        skipped: skippedUsers,
        total: dummyUsers.length,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined,
      userCredentials: {
        super_admin: 'superadmin@claudecode.com / password123',
        admin: 'ahmad.admin@claudecode.com / password123',
        principal: 'bambang.principal@claudecode.com / password123',
        staff: 'andi.staff@claudecode.com / password123',
        note: 'All users have password: password123'
      }
    });

  } catch (error) {
    console.error('Seed users migration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Seed users migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}