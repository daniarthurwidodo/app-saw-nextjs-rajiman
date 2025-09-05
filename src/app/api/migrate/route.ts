import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // Check if admin user already exists
    const existingAdmin = (await query('SELECT email FROM users WHERE email = ?', [
      'admin@claudecode.com',
    ])) as any[];

    if (existingAdmin.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Default admin user already exists',
      });
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash('password123', 12);
    const currentTime = new Date().toISOString();

    // Insert default admin user
    await query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        'System Administrator',
        'admin@claudecode.com',
        hashedPassword,
        'super_admin',
        currentTime,
        currentTime,
      ]
    );

    // Insert sample school data
    await query(
      `INSERT INTO schools (nama_sekolah, alamat, kontak, created_at, updated_at) 
       VALUES 
       ('SDN 01 Jakarta', 'Jl. Merdeka No. 123, Jakarta Pusat', '021-1234567', ?, ?),
       ('SMP 05 Bandung', 'Jl. Asia Afrika No. 456, Bandung', '022-7654321', ?, ?),
       ('SMA 03 Surabaya', 'Jl. Pahlawan No. 789, Surabaya', '031-9876543', ?, ?),
       ('SDN 12 Medan', 'Jl. Gatot Subroto No. 321, Medan', '061-5432109', ?, ?)`,
      [
        currentTime,
        currentTime,
        currentTime,
        currentTime,
        currentTime,
        currentTime,
        currentTime,
        currentTime,
      ]
    );

    // Insert sample criteria for decision support
    await query(
      `INSERT INTO criteria (criteria_name, weight, description, is_active, created_at, updated_at) 
       VALUES 
       ('Academic Performance', 30.0, 'Student academic achievements and test scores', 1, ?, ?),
       ('Infrastructure Quality', 25.0, 'School facilities and infrastructure condition', 1, ?, ?),
       ('Teacher Quality', 20.0, 'Teacher qualifications and performance', 1, ?, ?),
       ('Student Attendance', 15.0, 'Student attendance and participation rates', 1, ?, ?),
       ('Community Engagement', 10.0, 'Parent and community involvement', 1, ?, ?)`,
      [
        currentTime,
        currentTime,
        currentTime,
        currentTime,
        currentTime,
        currentTime,
        currentTime,
        currentTime,
        currentTime,
        currentTime,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Default admin user and sample data created successfully',
      credentials: {
        email: 'admin@claudecode.com',
        password: 'password123',
        role: 'super_admin',
      },
      nextSteps: {
        seedUsers: 'Run POST /api/seed-users to create dummy users for all roles',
        rollback: 'Run POST /api/rollback with {"target": "all"} to reset data',
      },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Migration failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
