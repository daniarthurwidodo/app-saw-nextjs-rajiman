import {
  TaskStatus,
  TaskPriority,
  ApprovalStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  TasksError,
} from './types';

export interface ValidationError {
  field: string;
  message: string;
}

export class TasksValidator {
  static validateTitle(title: string): ValidationError | null {
    if (!title) {
      return { field: 'title', message: 'Title is required' };
    }

    if (title.trim().length < 3) {
      return { field: 'title', message: 'Title must be at least 3 characters long' };
    }

    if (title.length > 255) {
      return { field: 'title', message: 'Title must not exceed 255 characters' };
    }

    return null;
  }

  static validateDescription(description: string | undefined): ValidationError | null {
    if (description && description.length > 1000) {
      return { field: 'description', message: 'Description must not exceed 1000 characters' };
    }

    return null;
  }

  static validateStatus(status: string): ValidationError | null {
    if (!status) {
      return { field: 'status', message: 'Status is required' };
    }

    const validStatuses = Object.values(TaskStatus);
    if (!validStatuses.includes(status as TaskStatus)) {
      return {
        field: 'status',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      };
    }

    return null;
  }

  static validatePriority(priority: string): ValidationError | null {
    if (!priority) {
      return { field: 'priority', message: 'Priority is required' };
    }

    const validPriorities = Object.values(TaskPriority);
    if (!validPriorities.includes(priority as TaskPriority)) {
      return {
        field: 'priority',
        message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
      };
    }

    return null;
  }

  static validateUserId(userId: number | undefined): ValidationError | null {
    if (userId !== undefined) {
      if (!Number.isInteger(userId) || userId <= 0) {
        return {
          field: 'assigned_to',
          message: 'User ID must be a positive integer',
        };
      }
    }

    return null;
  }

  static validateDueDate(dueDate: string | undefined): ValidationError | null {
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        return {
          field: 'due_date',
          message: 'Invalid date format',
        };
      }
    }

    return null;
  }

  static validateCreateTask(data: CreateTaskRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    const titleError = this.validateTitle(data.title);
    if (titleError) errors.push(titleError);

    const descriptionError = this.validateDescription(data.description);
    if (descriptionError) errors.push(descriptionError);

    if (data.priority) {
      const priorityError = this.validatePriority(data.priority);
      if (priorityError) errors.push(priorityError);
    }

    const userIdError = this.validateUserId(data.assigned_to);
    if (userIdError) errors.push(userIdError);

    const dueDateError = this.validateDueDate(data.due_date);
    if (dueDateError) errors.push(dueDateError);

    return errors;
  }

  static validateUpdateTask(data: UpdateTaskRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    if (data.title !== undefined) {
      const titleError = this.validateTitle(data.title);
      if (titleError) errors.push(titleError);
    }

    if (data.description !== undefined) {
      const descriptionError = this.validateDescription(data.description);
      if (descriptionError) errors.push(descriptionError);
    }

    if (data.status !== undefined) {
      const statusError = this.validateStatus(data.status);
      if (statusError) errors.push(statusError);
    }

    if (data.priority !== undefined) {
      const priorityError = this.validatePriority(data.priority);
      if (priorityError) errors.push(priorityError);
    }

    const userIdError = this.validateUserId(data.assigned_to);
    if (userIdError) errors.push(userIdError);

    const dueDateError = this.validateDueDate(data.due_date);
    if (dueDateError) errors.push(dueDateError);

    return errors;
  }

  static validateTaskId(taskId: string | number): number {
    const id = typeof taskId === 'string' ? parseInt(taskId) : taskId;

    if (isNaN(id) || id <= 0) {
      throw new TasksError('Invalid task ID', 400, 'INVALID_TASK_ID');
    }

    return id;
  }

  static validatePagination(
    page: string | number = 1,
    limit: string | number = 10
  ): { page: number; limit: number } {
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;

    const validatedPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const validatedLimit = isNaN(limitNum) || limitNum < 1 ? 10 : Math.min(limitNum, 100);

    return { page: validatedPage, limit: validatedLimit };
  }

  static validateFilters(filters: any): TaskFilters {
    const validatedFilters: TaskFilters = {};

    if (filters.status) {
      const validStatuses = Object.values(TaskStatus);
      if (validStatuses.includes(filters.status)) {
        validatedFilters.status = filters.status;
      }
    }

    if (filters.priority) {
      const validPriorities = Object.values(TaskPriority);
      if (validPriorities.includes(filters.priority)) {
        validatedFilters.priority = filters.priority;
      }
    }

    if (filters.assigned_to) {
      const assignedTo = parseInt(filters.assigned_to);
      if (!isNaN(assignedTo) && assignedTo > 0) {
        validatedFilters.assigned_to = assignedTo;
      }
    }

    if (filters.created_by) {
      const createdBy = parseInt(filters.created_by);
      if (!isNaN(createdBy) && createdBy > 0) {
        validatedFilters.created_by = createdBy;
      }
    }

    if (filters.search && typeof filters.search === 'string') {
      validatedFilters.search = filters.search.trim();
    }

    return validatedFilters;
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static sanitizeCreateTask(data: CreateTaskRequest): CreateTaskRequest {
    return {
      title: this.sanitizeInput(data.title),
      description: data.description ? this.sanitizeInput(data.description) : undefined,
      assigned_to: data.assigned_to,
      priority: data.priority || TaskPriority.MEDIUM,
      due_date: data.due_date,
    };
  }

  static sanitizeUpdateTask(data: UpdateTaskRequest): UpdateTaskRequest {
    const sanitized: UpdateTaskRequest = {};

    if (data.title !== undefined) {
      sanitized.title = this.sanitizeInput(data.title);
    }

    if (data.description !== undefined) {
      sanitized.description = data.description ? this.sanitizeInput(data.description) : null;
    }

    if (data.status !== undefined) {
      sanitized.status = data.status;
    }

    if (data.priority !== undefined) {
      sanitized.priority = data.priority;
    }

    if (data.assigned_to !== undefined) {
      sanitized.assigned_to = data.assigned_to;
    }

    if (data.due_date !== undefined) {
      sanitized.due_date = data.due_date;
    }

    return sanitized;
  }
}
