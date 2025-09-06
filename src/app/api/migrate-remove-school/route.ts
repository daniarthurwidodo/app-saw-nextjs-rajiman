import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // Remove school_id column from users table
    console.log('Removing school_id column from users table...');
    await query('ALTER TABLE users DROP COLUMN IF EXISTS school_id');
    
    // Drop schools table
    console.log('Dropping schools table...');
    await query('DROP TABLE IF EXISTS schools');
    
    return NextResponse.json({
      success: true,
      message: 'School-related tables and columns removed successfully',
      changes: [
        'Removed school_id column from users table',
        'Dropped schools table'
      ]
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