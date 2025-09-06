import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TasksListResponse,
  TaskResponse,
  TasksByStatusResponse,
  TaskFilters,
  PaginationParams,
  TasksError,
  Subtask,
  SubtaskImage,
} from './types';
import { TasksValidator } from './validation';

export class TasksService {
  static async getTasks(
    filters: TaskFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<TasksListResponse> {
    try {
      logger.info({ filters, pagination }, 'Fetching tasks with filters and pagination');

      // Build where conditions for Prisma
      const whereConditions: any = {};

      if (filters.status) {
        whereConditions.status = filters.status;
      }

      if (filters.priority) {
        whereConditions.priority = filters.priority;
      }

      if (filters.assigned_to) {
        whereConditions.assignedTo = filters.assigned_to;
      }

      if (filters.created_by) {
        whereConditions.createdBy = filters.created_by;
      }

      if (filters.approval_status) {
        whereConditions.approvalStatus = filters.approval_status;
      }

      if (filters.search) {
        whereConditions.OR = [
          { title: { contains: filters.search } },
          { description: { contains: filters.search } },
        ];
      }

      // Get total count
      const total = await prisma.task.count({ where: whereConditions });
      logger.debug({ total, filters }, 'Total tasks count retrieved');

      // Calculate pagination
      const offset = (pagination.page - 1) * pagination.limit;
      const totalPages = Math.ceil(total / pagination.limit);

      // Get tasks with relations
      logger.debug({ filters, pagination }, 'Fetching tasks with relations');
      const prismaTasksWithRelations = await prisma.task.findMany({
        where: whereConditions,
        include: {
          assignedUser: true,
          creator: true,
          approver: true,
          subtasks: {
            include: {
              documentation: {
                where: {
                  docType: 'documentation',
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: pagination.limit,
      });

      // Transform Prisma result to match the expected format
      const tasks: Task[] = prismaTasksWithRelations.map((task) => ({
        task_id: task.id,
        title: task.title,
        description: task.description,
        assigned_to: task.assignedTo,
        assigned_user_name: task.assignedUser?.name ?? undefined,
        created_by: task.createdBy || 0,
        created_by_name: task.creator?.name ?? undefined,
        status: task.status as any,
        priority: task.priority as any,
        due_date: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
        approval_status: task.approvalStatus as any,
        approved_by_user_id: task.approvedByUserId,
        approved_by_name: task.approver?.name ?? undefined,
        approval_date: task.approvalDate?.toISOString() || null,
        created_at: task.createdAt?.toISOString() || '',
        updated_at: task.updatedAt?.toISOString() || '',
        subtasks: task.subtasks.map((subtask) => ({
          subtask_id: subtask.id,
          title: subtask.title,
          status: subtask.isCompleted ? 'done' : 'todo',
          created_at: subtask.createdAt?.toISOString() || '',
          updated_at: subtask.updatedAt?.toISOString() || '',
          images: subtask.documentation.map((doc) => ({
            image_id: doc.id,
            url: doc.filePath || '',
            uploaded_at: doc.uploadedAt?.toISOString() || '',
          })),
        })),
      }));

      logger.info(
        {
          totalTasks: tasks.length,
          page: pagination.page,
          totalPages,
        },
        'Tasks retrieved successfully'
      );

      return {
        success: true,
        message: 'Tasks retrieved successfully',
        tasks,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error(
        {
          error: (error as Error).message,
          stack: (error as Error).stack,
          filters,
          pagination,
        },
        'Error occurred while fetching tasks'
      );
      throw new TasksError('An error occurred while fetching tasks', 500, 'INTERNAL_ERROR');
    }
  }

  static async getTasksByStatus(): Promise<TasksByStatusResponse> {
    try {
      logger.info('Fetching tasks grouped by status');

      const allTasksResponse = await this.getTasks({}, { page: 1, limit: 1000 }); // Get all tasks
      const allTasks = allTasksResponse.tasks;

      const tasksByStatus = {
        todo: allTasks.filter((task) => task.status === 'todo'),
        in_progress: allTasks.filter((task) => task.status === 'in_progress'),
        done: allTasks.filter((task) => task.status === 'done'),
      };

      logger.info(
        {
          todoCount: tasksByStatus.todo.length,
          inProgressCount: tasksByStatus.in_progress.length,
          doneCount: tasksByStatus.done.length,
        },
        'Tasks retrieved and grouped by status successfully'
      );

      return {
        success: true,
        message: 'Tasks retrieved successfully',
        tasks: tasksByStatus,
      };
    } catch (error) {
      logger.error(
        {
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
        'Error occurred while fetching tasks by status'
      );
      throw new TasksError(
        'An error occurred while fetching tasks by status',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async getTaskById(taskId: number): Promise<TaskResponse> {
    try {
      logger.info({ taskId }, 'Fetching task by ID');

      const prismaTask = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignedUser: true,
          creator: true,
          approver: true,
          subtasks: {
            include: {
              documentation: {
                where: {
                  docType: 'documentation',
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!prismaTask) {
        logger.warn({ taskId }, 'Task not found');
        throw new TasksError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      const task: Task = {
        task_id: prismaTask.id,
        title: prismaTask.title,
        description: prismaTask.description,
        assigned_to: prismaTask.assignedTo,
        assigned_user_name: prismaTask.assignedUser?.name ?? undefined,
        created_by: prismaTask.createdBy || 0,
        created_by_name: prismaTask.creator?.name ?? undefined,
        status: prismaTask.status as any,
        priority: prismaTask.priority as any,
        due_date: prismaTask.dueDate ? prismaTask.dueDate.toISOString().split('T')[0] : null,
        approval_status: prismaTask.approvalStatus as any,
        approved_by_user_id: prismaTask.approvedByUserId,
        approved_by_name: prismaTask.approver?.name ?? undefined,
        approval_date: prismaTask.approvalDate?.toISOString() || null,
        created_at: prismaTask.createdAt?.toISOString() || '',
        updated_at: prismaTask.updatedAt?.toISOString() || '',
        subtasks: prismaTask.subtasks.map((subtask) => ({
          subtask_id: subtask.id,
          title: subtask.title,
          status: subtask.isCompleted ? 'done' : 'todo',
          created_at: subtask.createdAt?.toISOString() || '',
          updated_at: subtask.updatedAt?.toISOString() || '',
          images: subtask.documentation.map((doc) => ({
            image_id: doc.id,
            url: doc.filePath || '',
            uploaded_at: doc.uploadedAt?.toISOString() || '',
          })),
        })),
      };

      logger.info({ taskId }, 'Task retrieved successfully');
      return {
        success: true,
        message: 'Task retrieved successfully',
        task,
      };
    } catch (error) {
      if (error instanceof TasksError) {
        logger.warn(
          {
            taskId,
            error: error.message,
            code: error.code,
          },
          'Task not found error'
        );
        throw error;
      }

      logger.error(
        {
          taskId,
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
        'Error occurred while fetching task by ID'
      );
      throw new TasksError('An error occurred while fetching task', 500, 'INTERNAL_ERROR');
    }
  }

  static async createTask(taskData: CreateTaskRequest, createdBy: number): Promise<TaskResponse> {
    try {
      logger.info({ createdBy }, 'Creating new task');

      // Validate input
      const validationErrors = TasksValidator.validateCreateTask(taskData);
      if (validationErrors.length > 0) {
        logger.warn(
          {
            createdBy,
            errors: validationErrors.map((e) => e.message),
          },
          'Task creation validation failed'
        );

        throw new TasksError(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Sanitize input
      const sanitizedData = TasksValidator.sanitizeCreateTask(taskData);

      // Validate assigned user exists if provided
      if (sanitizedData.assigned_to) {
        logger.debug({ assignedTo: sanitizedData.assigned_to }, 'Validating assigned user');
        const user = await prisma.user.findFirst({
          where: {
            id: sanitizedData.assigned_to,
            isActive: true,
          },
        });

        if (!user) {
          logger.warn(
            {
              assignedTo: sanitizedData.assigned_to,
            },
            'Assigned user not found or inactive'
          );
          throw new TasksError('Assigned user not found or inactive', 400, 'INVALID_ASSIGNED_USER');
        }
      }

      // Create new task
      logger.debug({ title: sanitizedData.title, createdBy }, 'Creating task in database');
      const createdTask = await prisma.task.create({
        data: {
          title: sanitizedData.title,
          description: sanitizedData.description || null,
          assignedTo: sanitizedData.assigned_to || null,
          createdBy: createdBy,
          priority: sanitizedData.priority || 'medium',
          dueDate: sanitizedData.due_date ? new Date(sanitizedData.due_date) : null,
        },
      });

      // Get the created task with relations
      const newTask = await this.getTaskById(createdTask.id);

      logger.info(
        { taskId: createdTask.id, title: sanitizedData.title },
        'Task created successfully'
      );
      return {
        success: true,
        message: 'Task created successfully',
        task: newTask.task,
      };
    } catch (error) {
      if (error instanceof TasksError) {
        logger.warn(
          {
            createdBy,
            error: error.message,
            code: error.code,
          },
          'Task creation error'
        );
        throw error;
      }

      logger.error(
        {
          createdBy,
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
        'Unexpected error occurred while creating task'
      );
      throw new TasksError('An error occurred while creating task', 500, 'INTERNAL_ERROR');
    }
  }

  static async updateTask(taskId: number, updateData: UpdateTaskRequest): Promise<TaskResponse> {
    try {
      logger.info({ taskId }, 'Updating task');

      // Validate input
      const validationErrors = TasksValidator.validateUpdateTask(updateData);
      if (validationErrors.length > 0) {
        logger.warn(
          {
            taskId,
            errors: validationErrors.map((e) => e.message),
          },
          'Task update validation failed'
        );

        throw new TasksError(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
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
        logger.debug({ taskId, assignedTo: sanitizedData.assigned_to }, 'Validating assigned user');
        const user = await prisma.user.findFirst({
          where: {
            id: sanitizedData.assigned_to,
            isActive: true,
          },
        });

        if (!user) {
          logger.warn(
            {
              taskId,
              assignedTo: sanitizedData.assigned_to,
            },
            'Assigned user not found or inactive'
          );
          throw new TasksError('Assigned user not found or inactive', 400, 'INVALID_ASSIGNED_USER');
        }
      }

      // Build update data for Prisma
      const updatePrismaData: any = {};

      if (sanitizedData.title !== undefined) updatePrismaData.title = sanitizedData.title;
      if (sanitizedData.description !== undefined)
        updatePrismaData.description = sanitizedData.description;
      if (sanitizedData.assigned_to !== undefined)
        updatePrismaData.assignedTo = sanitizedData.assigned_to;
      if (sanitizedData.status !== undefined) updatePrismaData.status = sanitizedData.status;
      if (sanitizedData.priority !== undefined) updatePrismaData.priority = sanitizedData.priority;
      if (sanitizedData.due_date !== undefined)
        updatePrismaData.dueDate = sanitizedData.due_date ? new Date(sanitizedData.due_date) : null;

      if (Object.keys(updatePrismaData).length === 0) {
        logger.warn({ taskId }, 'No fields to update');
        throw new TasksError('No fields to update', 400, 'NO_UPDATE_FIELDS');
      }

      // Update task
      logger.debug(
        { taskId, updateFields: Object.keys(updatePrismaData) },
        'Updating task in database'
      );
      await prisma.task.update({
        where: { id: taskId },
        data: updatePrismaData,
      });

      // Get updated task
      const updatedTask = await this.getTaskById(taskId);

      logger.info({ taskId }, 'Task updated successfully');
      return {
        success: true,
        message: 'Task updated successfully',
        task: updatedTask.task,
      };
    } catch (error) {
      if (error instanceof TasksError) {
        logger.warn(
          {
            taskId,
            error: error.message,
            code: error.code,
          },
          'Task update error'
        );
        throw error;
      }

      logger.error(
        {
          taskId,
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
        'Unexpected error occurred while updating task'
      );
      throw new TasksError('An error occurred while updating task', 500, 'INTERNAL_ERROR');
    }
  }

  static async deleteTask(taskId: number): Promise<{ success: boolean; message: string }> {
    try {
      logger.info({ taskId }, 'Deleting task');

      // Check if task exists
      await this.getTaskById(taskId);

      // Delete task (Prisma will cascade delete subtasks and documentation)
      logger.debug({ taskId }, 'Deleting task from database');
      await prisma.task.delete({
        where: { id: taskId },
      });

      logger.info({ taskId }, 'Task deleted successfully');
      return {
        success: true,
        message: 'Task deleted successfully',
      };
    } catch (error) {
      if (error instanceof TasksError) {
        logger.warn(
          {
            taskId,
            error: error.message,
            code: error.code,
          },
          'Task deletion error'
        );
        throw error;
      }

      logger.error(
        {
          taskId,
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
        'Unexpected error occurred while deleting task'
      );
      throw new TasksError('An error occurred while deleting task', 500, 'INTERNAL_ERROR');
    }
  }
}
