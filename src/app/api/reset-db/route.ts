import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    console.log('🔧 Starting database reset...');
    
    // Get all tables first
    const tables = await query('SHOW TABLES') as any[];
    
    if (tables.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Database is already empty',
        tablesDropped: 0
      });
    }
    
    // Disable foreign key checks
    await query('SET FOREIGN_KEY_CHECKS = 0');
    
    const droppedTables: string[] = [];
    
    // Drop all tables
    for (const table of tables) {
      const tableName = Object.values(table)[0] as string;
      try {
        await query(`DROP TABLE IF EXISTS \`${tableName}\``);
        droppedTables.push(tableName);
        console.log(`🗑️  Dropped table: ${tableName}`);
      } catch (error) {
        console.error(`Failed to drop table ${tableName}:`, error);
      }
    }
    
    // Re-enable foreign key checks
    await query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('🎉 Database reset complete!');
    
    return NextResponse.json({
      success: true,
      message: 'Database reset completed successfully',
      tablesDropped: droppedTables.length,
      droppedTables: droppedTables,
      nextSteps: [
        'Run /api/init-db to create tables',
        'Run /api/migrate to add admin user and sample data',
        'Run /api/seed-users to add test users'
      ]
    });

  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database reset failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database Reset API',
    description: 'Send a POST request to reset the database (drops all tables)',
    warning: 'This action is irreversible and will delete ALL data',
    methods: ['POST'],
    endpoint: '/api/reset-db'
  });
}