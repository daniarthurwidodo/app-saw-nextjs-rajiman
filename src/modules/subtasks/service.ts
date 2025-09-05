import { query } from '@/lib/db';
import {
  Subtask,
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
  SubtasksListResponse,
  SubtaskResponse,
  SubtasksByTaskResponse,
  SubtasksByStatusResponse,
  SubtasksProgressResponse,
  SubtaskProgressSummary,
  SubtaskFilters,
  PaginationParams,
  SubtasksError,
} from './types';
import { SubtasksValidator } from './validation';

export class SubtasksService {
  static async getSubtasks(
    filters: SubtaskFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<SubtasksListResponse> {
    try {
      let whereConditions: string[] = ['1=1'];
      const params: any[] = [];

      // Apply filters
      if (filters.relation_task_id) {
        whereConditions.push('s.relation_task_id = ?');
        params.push(filters.relation_task_id);
      }

      if (filters.subtask_status) {
        whereConditions.push('s.subtask_status = ?');
        params.push(filters.subtask_status);
      }

      if (filters.assigned_to) {
        whereConditions.push('s.assigned_to = ?');
        params.push(filters.assigned_to);
      }

      if (filters.search) {
        whereConditions.push('(s.subtask_title LIKE ? OR s.subtask_description LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      const whereClause = 'WHERE ' + whereConditions.join(' AND ');

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM subtasks s 
        LEFT JOIN tasks t ON s.relation_task_id = t.task_id
        ${whereClause}
      `;
      const countResult = (await query(countQuery, params)) as any[];
      const total = countResult[0].total;

      // Calculate pagination
      const offset = (pagination.page - 1) * pagination.limit;
      const totalPages = Math.ceil(total / pagination.limit);

      // Get subtasks with related information
      const subtasksQuery = `
        SELECT 
          s.subtask_id,
          s.relation_task_id,
          s.subtask_title,
          s.subtask_description,
          s.assigned_to,
          assigned_user.name as assigned_user_name,
          s.subtask_status,
          s.subtask_comment,
          s.subtask_date,
          s.created_at,
          s.updated_at,
          t.title as task_title,
          t.created_by as task_created_by,
          task_creator.name as task_created_by_name
        FROM subtasks s
        LEFT JOIN users assigned_user ON s.assigned_to = assigned_user.user_id
        LEFT JOIN tasks t ON s.relation_task_id = t.task_id
        LEFT JOIN users task_creator ON t.created_by = task_creator.user_id
        ${whereClause}
        ORDER BY s.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const queryParams = [...params];
      queryParams.push(parseInt(pagination.limit.toString()));
      queryParams.push(parseInt(offset.toString()));

      const subtasks = (await query(subtasksQuery, queryParams)) as Subtask[];

      return {
        success: true,
        message: 'Subtasks retrieved successfully',
        subtasks,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error('Get subtasks service error:', error);
      throw new SubtasksError('An error occurred while fetching subtasks', 500, 'INTERNAL_ERROR');
    }
  }

  static async getSubtasksByTask(taskId: number): Promise<SubtasksByTaskResponse> {
    try {
      // First, verify the task exists
      const taskResult = (await query(
        'SELECT task_id, title, status, created_by, creator.name as created_by_name FROM tasks LEFT JOIN users creator ON tasks.created_by = creator.user_id WHERE task_id = ?',
        [taskId]
      )) as any[];

      if (taskResult.length === 0) {
        throw new SubtasksError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      const taskInfo = taskResult[0];

      // Get all subtasks for this task
      const subtasksQuery = `
        SELECT 
          s.subtask_id,
          s.relation_task_id,
          s.subtask_title,
          s.subtask_description,
          s.assigned_to,
          assigned_user.name as assigned_user_name,
          s.subtask_status,
          s.subtask_comment,
          s.subtask_date,
          s.created_at,
          s.updated_at,
          t.title as task_title,
          t.created_by as task_created_by,
          task_creator.name as task_created_by_name
        FROM subtasks s
        LEFT JOIN users assigned_user ON s.assigned_to = assigned_user.user_id
        LEFT JOIN tasks t ON s.relation_task_id = t.task_id
        LEFT JOIN users task_creator ON t.created_by = task_creator.user_id
        WHERE s.relation_task_id = ?
        ORDER BY s.created_at DESC
      `;

      const subtasks = (await query(subtasksQuery, [taskId])) as Subtask[];

      return {
        success: true,
        message: 'Subtasks retrieved successfully',
        subtasks,
        taskInfo: {
          task_id: taskInfo.task_id,
          title: taskInfo.title,
          status: taskInfo.status,
          created_by_name: taskInfo.created_by_name,
        },
      };
    } catch (error) {
      if (error instanceof SubtasksError) {
        throw error;
      }

      console.error('Get subtasks by task service error:', error);
      throw new SubtasksError(
        'An error occurred while fetching subtasks for task',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async getSubtasksByStatus(): Promise<SubtasksByStatusResponse> {
    try {
      const subtasksQuery = `
        SELECT 
          s.subtask_id,
          s.relation_task_id,
          s.subtask_title,
          s.subtask_description,
          s.assigned_to,
          assigned_user.name as assigned_user_name,
          s.subtask_status,
          s.subtask_comment,
          s.subtask_date,
          s.created_at,
          s.updated_at,
          t.title as task_title,
          t.created_by as task_created_by,
          task_creator.name as task_created_by_name
        FROM subtasks s
        LEFT JOIN users assigned_user ON s.assigned_to = assigned_user.user_id
        LEFT JOIN tasks t ON s.relation_task_id = t.task_id
        LEFT JOIN users task_creator ON t.created_by = task_creator.user_id
        ORDER BY s.created_at DESC
      `;

      const allSubtasks = (await query(subtasksQuery)) as Subtask[];

      const subtasksByStatus = {
        todo: allSubtasks.filter((subtask) => subtask.subtask_status === 'todo'),
        in_progress: allSubtasks.filter((subtask) => subtask.subtask_status === 'in_progress'),
        done: allSubtasks.filter((subtask) => subtask.subtask_status === 'done'),
      };

      return {
        success: true,
        message: 'Subtasks retrieved successfully',
        subtasks: subtasksByStatus,
      };
    } catch (error) {
      console.error('Get subtasks by status service error:', error);
      throw new SubtasksError(
        'An error occurred while fetching subtasks by status',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async getSubtaskById(subtaskId: number): Promise<SubtaskResponse> {
    try {
      const subtasks = (await query(
        `
        SELECT 
          s.subtask_id,
          s.relation_task_id,
          s.subtask_title,
          s.subtask_description,
          s.assigned_to,
          assigned_user.name as assigned_user_name,
          s.subtask_status,
          s.subtask_comment,
          s.subtask_date,
          s.created_at,
          s.updated_at,
          t.title as task_title,
          t.created_by as task_created_by,
          task_creator.name as task_created_by_name
        FROM subtasks s
        LEFT JOIN users assigned_user ON s.assigned_to = assigned_user.user_id
        LEFT JOIN tasks t ON s.relation_task_id = t.task_id
        LEFT JOIN users task_creator ON t.created_by = task_creator.user_id
        WHERE s.subtask_id = ?
      `,
        [subtaskId]
      )) as Subtask[];

      if (subtasks.length === 0) {
        throw new SubtasksError('Subtask not found', 404, 'SUBTASK_NOT_FOUND');
      }

      return {
        success: true,
        message: 'Subtask retrieved successfully',
        subtask: subtasks[0],
      };
    } catch (error) {
      if (error instanceof SubtasksError) {
        throw error;
      }

      console.error('Get subtask by id service error:', error);
      throw new SubtasksError('An error occurred while fetching subtask', 500, 'INTERNAL_ERROR');
    }
  }

  static async createSubtask(subtaskData: CreateSubtaskRequest): Promise<SubtaskResponse> {
    try {
      // Validate input
      const validationErrors = SubtasksValidator.validateCreateSubtask(subtaskData);
      if (validationErrors.length > 0) {
        throw new SubtasksError(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Sanitize input
      const sanitizedData = SubtasksValidator.sanitizeCreateSubtask(subtaskData);

      // Verify parent task exists
      const tasks = (await query('SELECT task_id FROM tasks WHERE task_id = ?', [
        sanitizedData.relation_task_id,
      ])) as any[];

      if (tasks.length === 0) {
        throw new SubtasksError('Parent task not found', 400, 'INVALID_TASK_ID');
      }

      // Validate assigned user exists if provided
      if (sanitizedData.assigned_to) {
        const users = (await query(
          'SELECT user_id FROM users WHERE user_id = ? AND is_active = 1',
          [sanitizedData.assigned_to]
        )) as any[];

        if (users.length === 0) {
          throw new SubtasksError(
            'Assigned user not found or inactive',
            400,
            'INVALID_ASSIGNED_USER'
          );
        }
      }

      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Insert new subtask
      const result = (await query(
        `INSERT INTO subtasks (relation_task_id, subtask_title, subtask_description, assigned_to, subtask_date, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          sanitizedData.relation_task_id,
          sanitizedData.subtask_title,
          sanitizedData.subtask_description,
          sanitizedData.assigned_to,
          sanitizedData.subtask_date,
          currentTime,
          currentTime,
        ]
      )) as any;

      // Get the created subtask
      const newSubtask = await this.getSubtaskById(result.insertId);

      return {
        success: true,
        message: 'Subtask created successfully',
        subtask: newSubtask.subtask,
      };
    } catch (error) {
      if (error instanceof SubtasksError) {
        throw error;
      }

      console.error('Create subtask service error:', error);
      throw new SubtasksError('An error occurred while creating subtask', 500, 'INTERNAL_ERROR');
    }
  }

  static async updateSubtask(
    subtaskId: number,
    updateData: UpdateSubtaskRequest
  ): Promise<SubtaskResponse> {
    try {
      // Validate input
      const validationErrors = SubtasksValidator.validateUpdateSubtask(updateData);
      if (validationErrors.length > 0) {
        throw new SubtasksError(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Check if subtask exists
      await this.getSubtaskById(subtaskId);

      // Sanitize input
      const sanitizedData = SubtasksValidator.sanitizeUpdateSubtask(updateData);

      // Validate assigned user exists if provided
      if (sanitizedData.assigned_to) {
        const users = (await query(
          'SELECT user_id FROM users WHERE user_id = ? AND is_active = 1',
          [sanitizedData.assigned_to]
        )) as any[];

        if (users.length === 0) {
          throw new SubtasksError(
            'Assigned user not found or inactive',
            400,
            'INVALID_ASSIGNED_USER'
          );
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateParams: any[] = [];

      Object.keys(sanitizedData).forEach((key) => {
        if (sanitizedData[key as keyof UpdateSubtaskRequest] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateParams.push(sanitizedData[key as keyof UpdateSubtaskRequest]);
        }
      });

      if (updateFields.length === 0) {
        throw new SubtasksError('No fields to update', 400, 'NO_UPDATE_FIELDS');
      }

      // Add updated_at
      updateFields.push('updated_at = ?');
      updateParams.push(new Date().toISOString().slice(0, 19).replace('T', ' '));

      // Add subtask ID for WHERE clause
      updateParams.push(subtaskId);

      const updateQuery = `
        UPDATE subtasks 
        SET ${updateFields.join(', ')} 
        WHERE subtask_id = ?
      `;

      await query(updateQuery, updateParams);

      // Get updated subtask
      const updatedSubtask = await this.getSubtaskById(subtaskId);

      return {
        success: true,
        message: 'Subtask updated successfully',
        subtask: updatedSubtask.subtask,
      };
    } catch (error) {
      if (error instanceof SubtasksError) {
        throw error;
      }

      console.error('Update subtask service error:', error);
      throw new SubtasksError('An error occurred while updating subtask', 500, 'INTERNAL_ERROR');
    }
  }

  static async deleteSubtask(subtaskId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Check if subtask exists
      await this.getSubtaskById(subtaskId);

      // Delete subtask (this will cascade delete related documentation)
      await query('DELETE FROM subtasks WHERE subtask_id = ?', [subtaskId]);

      return {
        success: true,
        message: 'Subtask deleted successfully',
      };
    } catch (error) {
      if (error instanceof SubtasksError) {
        throw error;
      }

      console.error('Delete subtask service error:', error);
      throw new SubtasksError('An error occurred while deleting subtask', 500, 'INTERNAL_ERROR');
    }
  }

  static async getSubtasksProgress(): Promise<SubtasksProgressResponse> {
    try {
      const progressQuery = `
        SELECT 
          t.task_id,
          t.title as task_title,
          COUNT(s.subtask_id) as total_subtasks,
          SUM(CASE WHEN s.subtask_status = 'done' THEN 1 ELSE 0 END) as completed_subtasks,
          SUM(CASE WHEN s.subtask_status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_subtasks,
          SUM(CASE WHEN s.subtask_status = 'todo' THEN 1 ELSE 0 END) as todo_subtasks,
          ROUND(
            (SUM(CASE WHEN s.subtask_status = 'done' THEN 1 ELSE 0 END) / COUNT(s.subtask_id)) * 100, 
            2
          ) as completion_percentage
        FROM tasks t
        LEFT JOIN subtasks s ON t.task_id = s.relation_task_id
        WHERE COUNT(s.subtask_id) > 0
        GROUP BY t.task_id, t.title
        ORDER BY completion_percentage DESC, t.created_at DESC
      `;

      const progressData = (await query(progressQuery)) as any[];

      const progress: SubtaskProgressSummary[] = progressData.map((row) => ({
        task_id: row.task_id,
        task_title: row.task_title,
        total_subtasks: row.total_subtasks || 0,
        completed_subtasks: row.completed_subtasks || 0,
        in_progress_subtasks: row.in_progress_subtasks || 0,
        todo_subtasks: row.todo_subtasks || 0,
        completion_percentage: row.completion_percentage || 0,
      }));

      return {
        success: true,
        message: 'Subtasks progress retrieved successfully',
        progress,
      };
    } catch (error) {
      console.error('Get subtasks progress service error:', error);
      throw new SubtasksError(
        'An error occurred while fetching subtasks progress',
        500,
        'INTERNAL_ERROR'
      );
    }
  }
}
