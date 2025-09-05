import { prisma } from '@/lib/prisma';
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

      // Calculate pagination
      const offset = (pagination.page - 1) * pagination.limit;
      const totalPages = Math.ceil(total / pagination.limit);

      // Get tasks with relations
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
        assigned_user_name: task.assignedUser?.name || null,
        created_by: task.createdBy || 0,
        created_by_name: task.creator?.name || null,
        status: task.status as any,
        priority: task.priority as any,
        due_date: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
        approval_status: task.approvalStatus as any,
        approved_by_user_id: task.approvedByUserId,
        approved_by_name: task.approver?.name || null,
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
      console.error('Get tasks service error:', error);
      throw new TasksError('An error occurred while fetching tasks', 500, 'INTERNAL_ERROR');
    }
  }

  static async getTasksByStatus(): Promise<TasksByStatusResponse> {
    try {
      const allTasksResponse = await this.getTasks({}, { page: 1, limit: 1000 }); // Get all tasks
      const allTasks = allTasksResponse.tasks;

      const tasksByStatus = {
        todo: allTasks.filter((task) => task.status === 'todo'),
        in_progress: allTasks.filter((task) => task.status === 'in_progress'),
        done: allTasks.filter((task) => task.status === 'done'),
      };

      return {
        success: true,
        message: 'Tasks retrieved successfully',
        tasks: tasksByStatus,
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
        throw new TasksError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      const task: Task = {
        task_id: prismaTask.id,
        title: prismaTask.title,
        description: prismaTask.description,
        assigned_to: prismaTask.assignedTo,
        assigned_user_name: prismaTask.assignedUser?.name || null,
        created_by: prismaTask.createdBy || 0,
        created_by_name: prismaTask.creator?.name || null,
        status: prismaTask.status as any,
        priority: prismaTask.priority as any,
        due_date: prismaTask.dueDate ? prismaTask.dueDate.toISOString().split('T')[0] : null,
        approval_status: prismaTask.approvalStatus as any,
        approved_by_user_id: prismaTask.approvedByUserId,
        approved_by_name: prismaTask.approver?.name || null,
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

      return {
        success: true,
        message: 'Task retrieved successfully',
        task,
      };
    } catch (error) {
      if (error instanceof TasksError) {
        throw error;
      }

      console.error('Get task by id service error:', error);
      throw new TasksError('An error occurred while fetching task', 500, 'INTERNAL_ERROR');
    }
  }

  static async createTask(taskData: CreateTaskRequest, createdBy: number): Promise<TaskResponse> {
    try {
      // Validate input
      const validationErrors = TasksValidator.validateCreateTask(taskData);
      if (validationErrors.length > 0) {
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
        const user = await prisma.user.findFirst({
          where: {
            id: sanitizedData.assigned_to,
            isActive: true,
          },
        });

        if (!user) {
          throw new TasksError('Assigned user not found or inactive', 400, 'INVALID_ASSIGNED_USER');
        }
      }

      // Create new task
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

      return {
        success: true,
        message: 'Task created successfully',
        task: newTask.task,
      };
    } catch (error) {
      if (error instanceof TasksError) {
        throw error;
      }

      console.error('Create task service error:', error);
      throw new TasksError('An error occurred while creating task', 500, 'INTERNAL_ERROR');
    }
  }

  static async updateTask(taskId: number, updateData: UpdateTaskRequest): Promise<TaskResponse> {
    try {
      // Validate input
      const validationErrors = TasksValidator.validateUpdateTask(updateData);
      if (validationErrors.length > 0) {
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
        const user = await prisma.user.findFirst({
          where: {
            id: sanitizedData.assigned_to,
            isActive: true,
          },
        });

        if (!user) {
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
        throw new TasksError('No fields to update', 400, 'NO_UPDATE_FIELDS');
      }

      // Update task
      await prisma.task.update({
        where: { id: taskId },
        data: updatePrismaData,
      });

      // Get updated task
      const updatedTask = await this.getTaskById(taskId);

      return {
        success: true,
        message: 'Task updated successfully',
        task: updatedTask.task,
      };
    } catch (error) {
      if (error instanceof TasksError) {
        throw error;
      }

      console.error('Update task service error:', error);
      throw new TasksError('An error occurred while updating task', 500, 'INTERNAL_ERROR');
    }
  }

  static async deleteTask(taskId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Check if task exists
      await this.getTaskById(taskId);

      // Delete task (Prisma will cascade delete subtasks and documentation)
      await prisma.task.delete({
        where: { id: taskId },
      });

      return {
        success: true,
        message: 'Task deleted successfully',
      };
    } catch (error) {
      if (error instanceof TasksError) {
        throw error;
      }

      console.error('Delete task service error:', error);
      throw new TasksError('An error occurred while deleting task', 500, 'INTERNAL_ERROR');
    }
  }
}
