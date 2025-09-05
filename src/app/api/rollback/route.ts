import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { target } = await request.json();
    
    if (!target) {
      return NextResponse.json(
        { success: false, message: 'Rollback target is required' },
        { status: 400 }
      );
    }

    let deletedRecords = 0;
    const errors: string[] = [];

    switch (target) {
      case 'users':
        await rollbackUsers();
        break;
      case 'all':
        await rollbackAll();
        break;
      case 'sample-data':
        await rollbackSampleData();
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid rollback target. Use: users, sample-data, or all' },
          { status: 400 }
        );
    }

    async function rollbackUsers() {
      try {
        // Delete dummy users (keep the original admin)
        const dummyEmails = [
          'superadmin@claudecode.com',
          'ahmad.admin@claudecode.com',
          'siti.admin@claudecode.com',
          'bambang.principal@claudecode.com',
          'kartini.principal@claudecode.com',
          'soekarno.principal@claudecode.com',
          'habibie.principal@claudecode.com',
          'andi.staff@claudecode.com',
          'maria.staff@claudecode.com',
          'john.staff@claudecode.com',
          'fatimah.staff@claudecode.com',
          'budi.staff@claudecode.com',
          'dewi.staff@claudecode.com',
          'rudi.staff@claudecode.com',
          'nina.staff@claudecode.com'
        ];

        // Get user IDs first for foreign key cleanup
        const userIds = await query(
          `SELECT user_id FROM users WHERE email IN (${dummyEmails.map(() => '?').join(',')})`,
          dummyEmails
        ) as any[];

        const ids = userIds.map(u => u.user_id);

        if (ids.length > 0) {
          // Clean up related data first (tasks, subtasks, etc.)
          await query(
            `DELETE FROM subtasks WHERE relation_task_id IN (SELECT task_id FROM tasks WHERE assigned_to IN (${ids.map(() => '?').join(',')}) OR created_by IN (${ids.map(() => '?').join(',')}))`,
            [...ids, ...ids]
          );

          await query(
            `DELETE FROM tasks WHERE assigned_to IN (${ids.map(() => '?').join(',')}) OR created_by IN (${ids.map(() => '?').join(',')})`,
            [...ids, ...ids]
          );

          await query(
            `DELETE FROM reports WHERE created_by IN (${ids.map(() => '?').join(',')})`,
            ids
          );

          await query(
            `DELETE FROM criteria WHERE created_by IN (${ids.map(() => '?').join(',')})`,
            ids
          );

          // Update schools to remove principal assignments
          await query(
            `UPDATE schools SET kepala_sekolah_id = NULL WHERE kepala_sekolah_id IN (${ids.map(() => '?').join(',')})`,
            ids
          );

          // Delete users
          const result = await query(
            `DELETE FROM users WHERE user_id IN (${ids.map(() => '?').join(',')})`,
            ids
          ) as any;

          deletedRecords = result.affectedRows || ids.length;
        }
      } catch (error) {
        errors.push(`Failed to rollback users: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    async function rollbackSampleData() {
      try {
        // Delete sample tasks and related data
        const tasksResult = await query('DELETE FROM subtasks') as any;
        const subtasksResult = await query('DELETE FROM tasks') as any;
        const reportsResult = await query('DELETE FROM reports') as any;
        const docsResult = await query('DELETE FROM documentation') as any;
        
        deletedRecords += (tasksResult.affectedRows || 0) + 
                         (subtasksResult.affectedRows || 0) + 
                         (reportsResult.affectedRows || 0) + 
                         (docsResult.affectedRows || 0);

        // Delete sample criteria (keep user-created ones if any)
        const criteriaResult = await query(
          'DELETE FROM criteria WHERE criteria_name IN (?, ?, ?, ?, ?)',
          [
            'Academic Performance',
            'Infrastructure Quality', 
            'Teacher Quality',
            'Student Attendance',
            'Community Engagement'
          ]
        ) as any;

        deletedRecords += criteriaResult.affectedRows || 0;

        // Delete sample schools but keep structure
        await query('UPDATE schools SET kepala_sekolah_id = NULL');
        const schoolsResult = await query(
          'DELETE FROM schools WHERE nama_sekolah IN (?, ?, ?, ?)',
          ['SDN 01 Jakarta', 'SMP 05 Bandung', 'SMA 03 Surabaya', 'SDN 12 Medan']
        ) as any;

        deletedRecords += schoolsResult.affectedRows || 0;

      } catch (error) {
        errors.push(`Failed to rollback sample data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    async function rollbackAll() {
      await rollbackSampleData();
      await rollbackUsers();
    }

    return NextResponse.json({
      success: true,
      message: `Rollback completed for target: ${target}`,
      summary: {
        target,
        deletedRecords,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Rollback error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Rollback failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Rollback API endpoint',
    availableTargets: {
      'users': 'Rollback dummy users (keeps original admin)',
      'sample-data': 'Rollback sample schools, tasks, and criteria',
      'all': 'Rollback all dummy data'
    },
    usage: {
      method: 'POST',
      body: { target: 'users | sample-data | all' },
      example: 'curl -X POST http://localhost:3000/api/rollback -H "Content-Type: application/json" -d \'{"target":"users"}\''
    }
  });
}