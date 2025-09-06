import { TasksService } from './service';
import { TasksError } from './types';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
  },
}));

// Mock the logger
jest.mock('@/lib/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('TasksService', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    assignedTo: 2,
    createdBy: 1,
    status: 'todo',
    priority: 'medium',
    dueDate: new Date('2023-12-31'),
    approvalStatus: 'pending',
    approvedByUserId: null,
    approvalDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedUser: {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com',
    },
    creator: {
      id: 1,
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    approver: null,
    subtasks: [],
  };

  const mockTaskResponse = {
    task_id: 1,
    title: 'Test Task',
    description: 'Test Description',
    assigned_to: 2,
    assigned_user_name: 'John Doe',
    created_by: 1,
    created_by_name: 'Jane Smith',
    status: 'todo',
    priority: 'medium',
    due_date: '2023-12-31',
    approval_status: 'pending',
    approved_by_user_id: null,
    approved_by_name: null,
    approval_date: null,
    created_at: expect.any(String),
    updated_at: expect.any(String),
    subtasks: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should return tasks with pagination', async () => {
      const mockTasks = [mockTask];
      const mockCount = 1;

      (prisma.task.count as jest.Mock).mockResolvedValue(mockCount);
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const result = await TasksService.getTasks({}, { page: 1, limit: 10 });

      expect(result).toEqual({
        success: true,
        message: 'Tasks retrieved successfully',
        tasks: [mockTaskResponse],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });

      expect(prisma.task.count).toHaveBeenCalled();
      expect(prisma.task.findMany).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ filters: {}, pagination: { page: 1, limit: 10 } }),
        'Fetching tasks with filters and pagination'
      );
    });

    it('should handle errors gracefully', async () => {
      (prisma.task.count as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(TasksService.getTasks()).rejects.toThrow(TasksError);
      await expect(TasksService.getTasks()).rejects.toThrow(
        'An error occurred while fetching tasks'
      );

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getTaskById', () => {
    it('should return a task when found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);

      const result = await TasksService.getTaskById(1);

      expect(result).toEqual({
        success: true,
        message: 'Task retrieved successfully',
        task: mockTaskResponse,
      });

      expect(prisma.task.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
      expect(logger.info).toHaveBeenCalledWith({ taskId: 1 }, 'Fetching task by ID');
      expect(logger.info).toHaveBeenCalledWith({ taskId: 1 }, 'Task retrieved successfully');
    });

    it('should throw an error when task is not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(TasksService.getTaskById(999)).rejects.toThrow(TasksError);
      await expect(TasksService.getTaskById(999)).rejects.toThrow('Task not found');

      expect(logger.warn).toHaveBeenCalledWith({ taskId: 999 }, 'Task not found');
    });
  });

  describe('createTask', () => {
    const createTaskData = {
      title: 'New Task',
      description: 'New Task Description',
      assigned_to: 2,
      priority: 'high' as const,
      due_date: '2023-12-31',
    };

    it('should create a task successfully', async () => {
      const mockCreatedTask = { id: 2, ...createTaskData };
      const mockUser = { id: 2, name: 'John Doe', email: 'john@example.com', isActive: true };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.task.create as jest.Mock).mockResolvedValue(mockCreatedTask);
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        ...mockTask,
        id: 2,
        title: 'New Task',
      });

      const result = await TasksService.createTask(createTaskData, 1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Task created successfully');
      expect(prisma.task.create).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        { taskId: 2, title: 'New Task' },
        'Task created successfully'
      );
    });

    it('should handle validation errors', async () => {
      const invalidTaskData = { title: '' }; // Invalid title

      await expect(TasksService.createTask(invalidTaskData as any, 1)).rejects.toThrow(TasksError);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    const updateTaskData = {
      title: 'Updated Task Title',
      description: 'Updated Description',
    };

    it('should update a task successfully', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.update as jest.Mock).mockResolvedValue({ ...mockTask, ...updateTaskData });
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        ...mockTask,
        ...updateTaskData,
      });

      const result = await TasksService.updateTask(1, updateTaskData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Task updated successfully');
      expect(prisma.task.update).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith({ taskId: 1 }, 'Task updated successfully');
    });

    it('should throw an error when task is not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(TasksService.updateTask(999, updateTaskData)).rejects.toThrow(TasksError);
      await expect(TasksService.updateTask(999, updateTaskData)).rejects.toThrow('Task not found');

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ taskId: 999 }),
        'Task not found error'
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await TasksService.deleteTask(1);

      expect(result).toEqual({
        success: true,
        message: 'Task deleted successfully',
      });

      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(logger.info).toHaveBeenCalledWith({ taskId: 1 }, 'Task deleted successfully');
    });

    it('should throw an error when task is not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(TasksService.deleteTask(999)).rejects.toThrow(TasksError);
      await expect(TasksService.deleteTask(999)).rejects.toThrow('Task not found');

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ taskId: 999 }),
        'Task deletion error'
      );
    });
  });
});
