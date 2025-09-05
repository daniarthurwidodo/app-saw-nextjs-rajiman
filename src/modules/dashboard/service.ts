import { query } from '@/lib/db';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSchools: number;
  activeTasks: number;
  completedTasks: number;
}

export class DashboardService {
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get total users
      const totalUsersResult = await query(
        'SELECT COUNT(*) as count FROM users'
      ) as any[];
      const totalUsers = totalUsersResult[0]?.count || 0;

      // Get active users (is_active = true)
      const activeUsersResult = await query(
        'SELECT COUNT(*) as count FROM users WHERE is_active = 1'
      ) as any[];
      const activeUsers = activeUsersResult[0]?.count || 0;

      // Get total schools
      const totalSchoolsResult = await query(
        'SELECT COUNT(*) as count FROM schools'
      ) as any[];
      const totalSchools = totalSchoolsResult[0]?.count || 0;

      // Get active tasks (not done)
      const activeTasksResult = await query(
        'SELECT COUNT(*) as count FROM tasks WHERE status != ?',
        ['done']
      ) as any[];
      const activeTasks = activeTasksResult[0]?.count || 0;

      // Get completed tasks
      const completedTasksResult = await query(
        'SELECT COUNT(*) as count FROM tasks WHERE status = ?',
        ['done']
      ) as any[];
      const completedTasks = completedTasksResult[0]?.count || 0;

      return {
        totalUsers,
        activeUsers,
        totalSchools,
        activeTasks,
        completedTasks
      };
    } catch (error) {
      console.error('Dashboard service error:', error);
      // Return default values if there's an error
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalSchools: 0,
        activeTasks: 0,
        completedTasks: 0
      };
    }
  }
}