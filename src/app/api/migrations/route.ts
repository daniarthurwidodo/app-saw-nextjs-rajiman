import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Claude Code Migration System',
    availableMigrations: {
      '/api/init-db': {
        method: 'POST',
        description: 'Initialize database tables (run first)',
        purpose: 'Creates all required database tables with proper schema'
      },
      '/api/migrate': {
        method: 'POST',
        description: 'Create default admin user and basic sample data',
        purpose: 'Sets up the system administrator and essential data',
        credentials: {
          email: 'admin@claudecode.com',
          password: 'password123',
          role: 'super_admin'
        }
      },
      '/api/seed-users': {
        method: 'POST',
        description: 'Create dummy users for all roles with sample tasks',
        purpose: 'Populates system with test users for development/demo',
        includes: [
          '1 Super Admin',
          '2 Admin users', 
          '4 Principal users',
          '8 Staff users',
          'Sample tasks and assignments'
        ],
        note: 'All users have password: password123'
      }
    },
    rollbackOptions: {
      '/api/rollback': {
        method: 'POST',
        description: 'Rollback migrations and clean up data',
        targets: {
          users: 'Remove dummy users (keeps original admin)',
          'sample-data': 'Remove sample schools, tasks, and criteria',
          all: 'Remove all dummy data and sample content'
        },
        usage: {
          body: '{"target": "users|sample-data|all"}',
          example: 'curl -X POST /api/rollback -H "Content-Type: application/json" -d \'{"target":"all"}\''
        }
      }
    },
    recommendedSequence: [
      '1. POST /api/init-db - Initialize database',
      '2. POST /api/migrate - Create admin and basic data', 
      '3. POST /api/seed-users - Create dummy users (optional)',
      '4. POST /api/rollback {"target":"all"} - Clean up when needed'
    ],
    testCredentials: {
      super_admin: 'superadmin@claudecode.com / password123',
      admin: 'ahmad.admin@claudecode.com / password123', 
      principal: 'bambang.principal@claudecode.com / password123',
      staff: 'andi.staff@claudecode.com / password123',
      original_admin: 'admin@claudecode.com / password123'
    }
  });
}