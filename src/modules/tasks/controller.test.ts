import { TasksController } from './controller';
import { TasksService } from './service';
import { TasksError } from './types';

// Mock the TasksService
jest.mock('./service', () => ({
  TasksService: {
    getTasks: jest.fn(),
    getTasksByStatus: jest.fn(),
    getTaskById: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

// Create a simple mock for NextResponse
const createMockResponse = (data: any, status = 200) => {
  return {
    json: () => Promise.resolve(data),
    status,
  };
};

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (data: any, options: any = {}) => createMockResponse(data, options.status || 200),
    },
  };
});

describe('TasksController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should return tasks successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Tasks retrieved successfully',
        tasks: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      (TasksService.getTasks as jest.Mock).mockResolvedValue(mockResponse);

      // Create a proper mock request object
      const request = {
        url: 'http://localhost:3000/api/tasks?page=1&limit=10',
        json: jest.fn(),
      };

      const response = await TasksController.getTasks(request as any);
      const jsonData = await response.json();

      expect(jsonData).toEqual(mockResponse);
      expect(TasksService.getTasks).toHaveBeenCalled();
    });
  });

  describe('getTasksByStatus', () => {
    it('should return tasks grouped by status', async () => {
      const mockResponse = {
        success: true,
        message: 'Tasks retrieved successfully',
        tasks: {
          todo: [],
          in_progress: [],
          done: [],
        },
      };

      (TasksService.getTasksByStatus as jest.Mock).mockResolvedValue(mockResponse);

      const response = await TasksController.getTasksByStatus();
      const jsonData = await response.json();

      expect(jsonData).toEqual(mockResponse);
      expect(TasksService.getTasksByStatus).toHaveBeenCalled();
    });
  });

  describe('getTaskById', () => {
    it('should return a task by ID', async () => {
      const mockResponse = {
        success: true,
        message: 'Task retrieved successfully',
        task: {
          task_id: 1,
          title: 'Test Task',
        },
      };

      (TasksService.getTaskById as jest.Mock).mockResolvedValue(mockResponse);

      // Create a proper mock request object
      const request = {};

      const params = { id: '1' };

      const response = await TasksController.getTaskById(request as any, { params });
      const jsonData = await response.json();

      expect(jsonData).toEqual(mockResponse);
      expect(TasksService.getTaskById).toHaveBeenCalledWith(1);
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Task created successfully',
        task: {
          task_id: 1,
          title: 'New Task',
        },
      };

      (TasksService.createTask as jest.Mock).mockResolvedValue(mockResponse);

      // Create a proper mock request object with json method
      const request = {
        json: jest.fn().mockResolvedValue({
          title: 'New Task',
          description: 'New Task Description',
        }),
      };

      const response = await TasksController.createTask(request as any);
      const jsonData = await response.json();

      expect(jsonData).toEqual(mockResponse);
      expect(response.status).toBe(201);
      expect(TasksService.createTask).toHaveBeenCalledWith(
        {
          title: 'New Task',
          description: 'New Task Description',
        },
        1 // hardcoded createdBy value
      );
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Task updated successfully',
        task: {
          task_id: 1,
          title: 'Updated Task',
        },
      };

      (TasksService.updateTask as jest.Mock).mockResolvedValue(mockResponse);

      // Create a proper mock request object with json method
      const request = {
        json: jest.fn().mockResolvedValue({
          title: 'Updated Task',
          description: 'Updated Description',
        }),
      };

      const params = { id: '1' };

      const response = await TasksController.updateTask(request as any, { params });
      const jsonData = await response.json();

      expect(jsonData).toEqual(mockResponse);
      expect(TasksService.updateTask).toHaveBeenCalledWith(1, {
        title: 'Updated Task',
        description: 'Updated Description',
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Task deleted successfully',
      };

      (TasksService.deleteTask as jest.Mock).mockResolvedValue(mockResponse);

      // Create a proper mock request object
      const request = {};
      const params = { id: '1' };

      const response = await TasksController.deleteTask(request as any, { params });
      const jsonData = await response.json();

      expect(jsonData).toEqual(mockResponse);
      expect(TasksService.deleteTask).toHaveBeenCalledWith(1);
    });
  });
});
