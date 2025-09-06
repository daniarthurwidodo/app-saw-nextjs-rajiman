import { TasksValidator } from './validation';
import {
  TaskFilters,
  PaginationParams,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
  TaskPriority,
} from './types';

describe('TasksValidator', () => {
  describe('validateFilters', () => {
    it('should validate and return proper filters', () => {
      const inputFilters = {
        status: 'todo',
        priority: 'high',
        assigned_to: '1',
        created_by: '2',
        search: 'test',
      };

      const result = TasksValidator.validateFilters(inputFilters);

      expect(result).toEqual({
        status: 'todo',
        priority: 'high',
        assigned_to: 1,
        created_by: 2,
        search: 'test',
      });
    });

    it('should handle null/undefined values', () => {
      const inputFilters = {
        status: null,
        priority: undefined,
        assigned_to: 'invalid',
        created_by: 'not-a-number',
      };

      const result = TasksValidator.validateFilters(inputFilters);

      expect(result).toEqual({});
    });

    it('should filter out invalid status and priority values', () => {
      const inputFilters = {
        status: 'invalid-status',
        priority: 'invalid-priority',
        assigned_to: '1',
      };

      const result = TasksValidator.validateFilters(inputFilters);

      expect(result).toEqual({
        assigned_to: 1,
      });
    });
  });

  describe('validatePagination', () => {
    it('should validate and return proper pagination params', () => {
      const result = TasksValidator.validatePagination('2', '20');

      expect(result).toEqual({
        page: 2,
        limit: 20,
      });
    });

    it('should use default values for invalid inputs', () => {
      const result = TasksValidator.validatePagination('invalid', 'not-a-number');

      expect(result).toEqual({
        page: 1,
        limit: 10,
      });
    });

    it('should enforce maximum limit', () => {
      const result = TasksValidator.validatePagination('1', '200');

      expect(result).toEqual({
        page: 1,
        limit: 100, // Max limit is 100
      });
    });
  });

  describe('validateTaskId', () => {
    it('should validate and return task ID', () => {
      const result = TasksValidator.validateTaskId('123');

      expect(result).toBe(123);
    });

    it('should throw error for invalid task ID', () => {
      expect(() => TasksValidator.validateTaskId('invalid')).toThrow();
      expect(() => TasksValidator.validateTaskId('-1')).toThrow();
    });
  });

  describe('validateCreateTask', () => {
    it('should validate valid create task data', () => {
      const validData: CreateTaskRequest = {
        title: 'Test Task',
        description: 'Test Description',
        assigned_to: 1,
        priority: TaskPriority.HIGH,
        due_date: '2023-12-31',
      };

      const result = TasksValidator.validateCreateTask(validData);

      expect(result).toEqual([]);
    });

    it('should return errors for invalid create task data', () => {
      const invalidData: any = {
        title: '', // Empty title
        description: 'Test Description',
        assigned_to: -1, // Invalid assigned_to
        priority: 'invalid', // Invalid priority
        due_date: 'invalid-date', // Invalid date
      };

      const result = TasksValidator.validateCreateTask(invalidData);

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('validateUpdateTask', () => {
    it('should validate valid update task data', () => {
      const validData: UpdateTaskRequest = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
      };

      const result = TasksValidator.validateUpdateTask(validData);

      expect(result).toEqual([]);
    });

    it('should return errors for invalid update task data', () => {
      const invalidData: any = {
        title: '', // Empty title
        status: 'invalid', // Invalid status
        priority: 'invalid', // Invalid priority
      };

      const result = TasksValidator.validateUpdateTask(invalidData);

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeCreateTask', () => {
    it('should sanitize create task data', () => {
      const inputData: any = {
        title: '  Test Task  ',
        description: '  Test Description  ',
        assigned_to: 1,
        priority: 'HIGH', // Should remain as is
        due_date: '2023-12-31',
      };

      const result = TasksValidator.sanitizeCreateTask(inputData);

      expect(result).toEqual({
        title: 'Test Task',
        description: 'Test Description',
        assigned_to: 1,
        priority: 'HIGH',
        due_date: '2023-12-31',
      });
    });
  });

  describe('sanitizeUpdateTask', () => {
    it('should sanitize update task data', () => {
      const inputData: any = {
        title: '  Updated Task  ',
        description: '  Updated Description  ',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assigned_to: 2,
        due_date: '2023-12-31',
      };

      const result = TasksValidator.sanitizeUpdateTask(inputData);

      expect(result).toEqual({
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assigned_to: 2,
        due_date: '2023-12-31',
      });
    });

    it('should only include fields that are explicitly set', () => {
      const inputData: any = {
        title: 'Updated Task',
      };

      const result = TasksValidator.sanitizeUpdateTask(inputData);

      expect(result).toEqual({
        title: 'Updated Task',
      });
    });
  });
});
