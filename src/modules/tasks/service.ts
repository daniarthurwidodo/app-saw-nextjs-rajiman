import { query } from '@/lib/db';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest,
  TasksListResponse,
  TaskResponse,
  TasksByStatusResponse,
  TaskFilters,
  PaginationParams,
  TasksError
} from './types';
import { TasksValidator } from './validation';

export class TasksService {
  static async getTasks(
    filters: TaskFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<TasksListResponse> {
    try {
      const whereConditions: string[] = ['1=1'];
      const params: (string | number | null)[] = [];

      // Apply filters
      if (filters.status) {
        whereConditions.push('t.status = ?');
        params.push(filters.status);
      }

      if (filters.priority) {
        whereConditions.push('t.priority = ?');
        params.push(filters.priority);
      }

      if (filters.assigned_to) {
        whereConditions.push('t.assigned_to = ?');
        params.push(filters.assigned_to);
      }

      if (filters.created_by) {
        whereConditions.push('t.created_by = ?');
        params.push(filters.created_by);
      }

      if (filters.approval_status) {
        whereConditions.push('t.approval_status = ?');
        params.push(filters.approval_status);
      }

      if (filters.search) {
        whereConditions.push('(t.title LIKE ? OR t.description LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      const whereClause = 'WHERE ' + whereConditions.join(' AND ');

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM tasks t ${whereClause}`;
      const countResult = await query(countQuery, params) as any[];
      const total = countResult[0].total;

      // Calculate pagination
      const offset = (pagination.page - 1) * pagination.limit;
      const totalPages = Math.ceil(total / pagination.limit);

      // Get tasks with user information
      const tasksQuery = `
        SELECT 
          t.task_id,
          t.title,
          t.description,
          t.assigned_to,
          assigned_user.name as assigned_user_name,
          t.created_by,
          creator.name as created_by_name,
          t.status,
          t.priority,
          t.due_date,
          t.approval_status,
          t.approved_by_user_id,
          approver.name as approved_by_name,
          t.approval_date,
          t.created_at,
          t.updated_at
        FROM tasks t
        LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.user_id
        LEFT JOIN users creator ON t.created_by = creator.user_id
        LEFT JOIN users approver ON t.approved_by_user_id = approver.user_id
        ${whereClause}
        ORDER BY t.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const queryParams = [...params];
      queryParams.push(parseInt(pagination.limit.toString()));
      queryParams.push(parseInt(offset.toString()));

      const tasks = await query(tasksQuery, queryParams) as Task[];

      return {
        success: true,
        message: 'Tasks retrieved successfully',
        tasks,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages
        }
      };

    } catch (error) {
      console.error('Get tasks service error:', error);
      throw new TasksError(
        'An error occurred while fetching tasks',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async getTasksByStatus(): Promise<TasksByStatusResponse> {
    try {
      const tasksQuery = `
        WITH TasksWithSubtasks AS (
          SELECT 
            t.task_id,
            t.title,
            t.description,
            t.assigned_to,
            assigned_user.name as assigned_user_name,
            t.created_by,
            creator.name as created_by_name,
            t.status,
            t.priority,
            t.due_date,
            t.approval_status,
            t.approved_by_user_id,
            approver.name as approved_by_name,
            t.approval_date,
            t.created_at,
            t.updated_at,
            COUNT(s.subtask_id) as subtasks_count,
            SUM(CASE WHEN s.is_completed THEN 1 ELSE 0 END) as completed_subtasks,
            JSON_ARRAYAGG(
              CASE WHEN s.subtask_id IS NOT NULL THEN
                JSON_OBJECT(
                  'subtask_id', s.subtask_id,
                  'relation_task_id', s.relation_task_id,
                  'subtask_title', s.subtask_title,
                  'subtask_description', s.subtask_description,
                  'assigned_to', s.assigned_to,
                  'assigned_user_name', subtask_user.name,
                  'is_completed', s.is_completed,
                  'created_at', s.created_at,
                  'updated_at', s.updated_at
                )
              ELSE NULL END
            ) as subtasks
          FROM tasks t
          LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.user_id
          LEFT JOIN users creator ON t.created_by = creator.user_id
          LEFT JOIN users approver ON t.approved_by_user_id = approver.user_id
          LEFT JOIN subtasks s ON t.task_id = s.relation_task_id
          LEFT JOIN users subtask_user ON s.assigned_to = subtask_user.user_id
          GROUP BY t.task_id
        )
        SELECT *,
          CASE 
            WHEN subtasks = JSON_ARRAY() THEN NULL 
            ELSE subtasks 
          END as subtasks
        FROM TasksWithSubtasks
        ORDER BY created_at DESC
      `;

      const rawTasks = await query(tasksQuery) as any[];
      
      // Process the tasks to parse the JSON subtasks field
      const allTasks = rawTasks.map(task => ({
        ...task,
        subtasks: task.subtasks || [], // Already JSON from MySQL JSON_ARRAYAGG
        subtasks_count: Number(task.subtasks_count || 0),
        completed_subtasks: Number(task.completed_subtasks || 0)
      })) as Task[];

      const tasksByStatus = {
        todo: allTasks.filter(task => task.status === 'todo'),
        in_progress: allTasks.filter(task => task.status === 'in_progress'),
        done: allTasks.filter(task => task.status === 'done')
      };

      return {
        success: true,
        message: 'Tasks retrieved successfully',
        tasks: tasksByStatus
      };

    } catch (error) {
      console.error('Get tasks by status service error:', error);
      throw new TasksError(
        'An error occurred while fetching tasks by status',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async getTaskById(taskId: number): Promise<TaskResponse> {
    try {
      const tasks = await query(`
        SELECT 
          t.task_id,
          t.title,
          t.description,
          t.assigned_to,
          assigned_user.name as assigned_user_name,
          t.created_by,
          creator.name as created_by_name,
          t.status,
          t.priority,
          t.due_date,
          t.approval_status,
          t.approved_by_user_id,
          approver.name as approved_by_name,
          t.approval_date,
          t.created_at,
          t.updated_at
        FROM tasks t
        LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.user_id
        LEFT JOIN users creator ON t.created_by = creator.user_id
        LEFT JOIN users approver ON t.approved_by_user_id = approver.user_id
        WHERE t.task_id = ?
      `, [taskId]) as Task[];

      if (tasks.length === 0) {
        throw new TasksError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      return {
        success: true,
        message: 'Task retrieved successfully',
        task: tasks[0]
      };

    } catch (error) {
      if (error instanceof TasksError) {
        throw error;
      }

      console.error('Get task by id service error:', error);
      throw new TasksError(
        'An error occurred while fetching task',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async createTask(taskData: CreateTaskRequest, createdBy: number): Promise<TaskResponse> {
    try {
      // Validate input
      const validationErrors = TasksValidator.validateCreateTask(taskData);
      if (validationErrors.length > 0) {
        throw new TasksError(
          `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Sanitize input
      const sanitizedData = TasksValidator.sanitizeCreateTask(taskData);

      // Validate assigned user exists if provided
      if (sanitizedData.assigned_to) {
        const users = await query(
          'SELECT user_id FROM users WHERE user_id = ? AND is_active = 1',
          [sanitizedData.assigned_to]
        ) as any[];

        if (users.length === 0) {
          throw new TasksError(
            'Assigned user not found or inactive',
            400,
            'INVALID_ASSIGNED_USER'
          );
        }
      }

      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Insert new task
      const result = await query(
        `INSERT INTO tasks (title, description, assigned_to, created_by, priority, due_date, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sanitizedData.title,
          sanitizedData.description || null,
          sanitizedData.assigned_to || null,
          createdBy,
          sanitizedData.priority,
          sanitizedData.due_date || null,
          currentTime,
          currentTime
        ]
      ) as { insertId: number };

      // Get the created task
      const newTask = await this.getTaskById(result.insertId);

      return {
        success: true,
        message: 'Task created successfully',
        task: newTask.task
      };

    } catch (error) {
      if (error instanceof TasksError) {
        throw error;
      }

      console.error('Create task service error:', error);
      throw new TasksError(
        'An error occurred while creating task',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async updateTask(taskId: number, updateData: UpdateTaskRequest): Promise<TaskResponse> {
    try {
      // Validate input
      const validationErrors = TasksValidator.validateUpdateTask(updateData);
      if (validationErrors.length > 0) {
        throw new TasksError(
          `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Check if task exists
      await this.getTaskById(taskId);

      // Sanitize input
      const sanitizedData = TasksValidator.sanitizeUpdateTask(updateData);

      // Validate assigned user exists if provided
      if (sanitizedData.assigned_to) {
        const users = await query(
          'SELECT user_id FROM users WHERE user_id = ? AND is_active = 1',
          [sanitizedData.assigned_to]
        ) as any[];

        if (users.length === 0) {
          throw new TasksError(
            'Assigned user not found or inactive',
            400,
            'INVALID_ASSIGNED_USER'
          );
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateParams: any[] = [];

      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key as keyof UpdateTaskRequest] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateParams.push(sanitizedData[key as keyof UpdateTaskRequest]);
        }
      });

      if (updateFields.length === 0) {
        throw new TasksError(
          'No fields to update',
          400,
          'NO_UPDATE_FIELDS'
        );
      }

      // Add updated_at
      updateFields.push('updated_at = ?');
      updateParams.push(new Date().toISOString().slice(0, 19).replace('T', ' '));

      // Add task ID for WHERE clause
      updateParams.push(taskId);

      const updateQuery = `
        UPDATE tasks 
        SET ${updateFields.join(', ')} 
        WHERE task_id = ?
      `;

      await query(updateQuery, updateParams);

      // Get updated task
      const updatedTask = await this.getTaskById(taskId);

      return {
        success: true,
        message: 'Task updated successfully',
        task: updatedTask.task
      };

    } catch (error) {
      if (error instanceof TasksError) {
        throw error;
      }

      console.error('Update task service error:', error);
      throw new TasksError(
        'An error occurred while updating task',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async deleteTask(taskId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Check if task exists
      await this.getTaskById(taskId);

      // Delete task (this will cascade delete subtasks and documentation)
      await query('DELETE FROM tasks WHERE task_id = ?', [taskId]);

      return {
        success: true,
        message: 'Task deleted successfully'
      };

    } catch (error) {
      if (error instanceof TasksError) {
        throw error;
      }

      console.error('Delete task service error:', error);
      throw new TasksError(
        'An error occurred while deleting task',
        500,
        'INTERNAL_ERROR'
      );
    }
  }
}