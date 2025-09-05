import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role specified' },
        { status: 400 }
      );
    }

    const existingUsers = await query(
      'SELECT email FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const currentTime = new Date().toISOString();

    await query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [name, email, hashedPassword, role, currentTime, currentTime]
    );

    return NextResponse.json({
      success: true,
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}