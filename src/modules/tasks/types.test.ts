import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  PaginationParams,
  TasksError,
} from './types';

describe('Tasks Types', () => {
  it('should define Task interface correctly', () => {
    const task: Task = {
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
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      subtasks: [],
    };

    expect(task.task_id).toBe(1);
    expect(task.title).toBe('Test Task');
  });

  it('should define CreateTaskRequest interface correctly', () => {
    const createTask: CreateTaskRequest = {
      title: 'New Task',
      description: 'New Task Description',
      assigned_to: 1,
      priority: 'high',
      due_date: '2023-12-31',
    };

    expect(createTask.title).toBe('New Task');
  });

  it('should define UpdateTaskRequest interface correctly', () => {
    const updateTask: UpdateTaskRequest = {
      title: 'Updated Task',
      status: 'in_progress',
    };

    expect(updateTask.title).toBe('Updated Task');
  });

  it('should define TaskFilters interface correctly', () => {
    const filters: TaskFilters = {
      status: 'todo',
      priority: 'high',
      assigned_to: 1,
      search: 'test',
    };

    expect(filters.status).toBe('todo');
  });

  it('should define PaginationParams interface correctly', () => {
    const pagination: PaginationParams = {
      page: 1,
      limit: 10,
    };

    expect(pagination.page).toBe(1);
  });

  it('should handle TasksError correctly', () => {
    const error = new TasksError('Test error', 400, 'TEST_ERROR');

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error instanceof Error).toBe(true);
  });
});
