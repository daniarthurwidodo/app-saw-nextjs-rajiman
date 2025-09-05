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
          due_date: '2024-12-31'
        },
        {
          title: 'Update Student Database',
          description: 'Update all student records with current academic year information',
          priority: 'medium',
          due_date: '2024-11-30'
        },
        {
          title: 'Generate Monthly Performance Report',
          description: 'Create comprehensive monthly performance report for all schools',
          priority: 'medium',
          due_date: '2024-10-15'
        },
        {
          title: 'Conduct Teacher Training Workshop',
          description: 'Organize and conduct professional development workshop for teachers',
          priority: 'high',
          due_date: '2024-11-15'
        },
        {
          title: 'Review Infrastructure Maintenance',
          description: 'Assess and plan infrastructure maintenance for all school facilities',
          priority: 'low',
          due_date: '2024-12-01'
        }
      ];

      const staffUsers = users.filter(u => u.role === UserRole.USER);
      const principals = users.filter(u => u.role === UserRole.KEPALA_SEKOLAH);
      
      for (let i = 0; i < sampleTasks.length && i < staffUsers.length; i++) {
        const currentTime = new Date().toISOString();
        const randomPrincipal = principals[Math.floor(Math.random() * principals.length)];
        
        await query(
          `INSERT INTO tasks (title, description, assigned_to, created_by, priority, due_date, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sampleTasks[i].title,
            sampleTasks[i].description,
            staffUsers[i].user_id,
            randomPrincipal.user_id,
            sampleTasks[i].priority,
            sampleTasks[i].due_date,
            currentTime,
            currentTime
          ]
        );
      }
    } catch (error) {
      errors.push(`Failed to create sample tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
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