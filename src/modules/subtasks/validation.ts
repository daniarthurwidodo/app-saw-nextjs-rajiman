import { CreateSubtaskRequest, UpdateSubtaskRequest, SubtaskStatus } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

export class SubtasksValidator {
  static validateCreateSubtask(data: CreateSubtaskRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate relation_task_id
    if (
      !data.relation_task_id ||
      typeof data.relation_task_id !== 'number' ||
      data.relation_task_id <= 0
    ) {
      errors.push({
        field: 'relation_task_id',
        message: 'Valid task ID is required',
      });
    }

    // Validate subtask_title
    if (!data.subtask_title || typeof data.subtask_title !== 'string') {
      errors.push({
        field: 'subtask_title',
        message: 'Subtask title is required',
      });
    } else {
      const trimmedTitle = data.subtask_title.trim();
      if (trimmedTitle.length === 0) {
        errors.push({
          field: 'subtask_title',
          message: 'Subtask title cannot be empty',
        });
      } else if (trimmedTitle.length > 255) {
        errors.push({
          field: 'subtask_title',
          message: 'Subtask title must be 255 characters or less',
        });
      }
    }

    // Validate subtask_description (optional)
    if (data.subtask_description !== undefined) {
      if (typeof data.subtask_description !== 'string') {
        errors.push({
          field: 'subtask_description',
          message: 'Subtask description must be a string',
        });
      } else if (data.subtask_description.length > 5000) {
        errors.push({
          field: 'subtask_description',
          message: 'Subtask description must be 5000 characters or less',
        });
      }
    }

    // Validate assigned_to (optional)
    if (data.assigned_to !== undefined) {
      if (typeof data.assigned_to !== 'number' || data.assigned_to <= 0) {
        errors.push({
          field: 'assigned_to',
          message: 'Assigned user ID must be a positive number',
        });
      }
    }

    // Validate subtask_date (optional)
    if (data.subtask_date !== undefined) {
      if (typeof data.subtask_date !== 'string') {
        errors.push({
          field: 'subtask_date',
          message: 'Subtask date must be a string',
        });
      } else if (data.subtask_date && !this.isValidDate(data.subtask_date)) {
        errors.push({
          field: 'subtask_date',
          message: 'Subtask date must be in YYYY-MM-DD format',
        });
      }
    }

    return errors;
  }

  static validateUpdateSubtask(data: UpdateSubtaskRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check if at least one field is provided
    const hasValidFields = Object.keys(data).some(
      (key) => data[key as keyof UpdateSubtaskRequest] !== undefined
    );

    if (!hasValidFields) {
      errors.push({
        field: 'general',
        message: 'At least one field must be provided for update',
      });
      return errors;
    }

    // Validate subtask_title (optional)
    if (data.subtask_title !== undefined) {
      if (typeof data.subtask_title !== 'string') {
        errors.push({
          field: 'subtask_title',
          message: 'Subtask title must be a string',
        });
      } else {
        const trimmedTitle = data.subtask_title.trim();
        if (trimmedTitle.length === 0) {
          errors.push({
            field: 'subtask_title',
            message: 'Subtask title cannot be empty',
          });
        } else if (trimmedTitle.length > 255) {
          errors.push({
            field: 'subtask_title',
            message: 'Subtask title must be 255 characters or less',
          });
        }
      }
    }

    // Validate subtask_description (optional)
    if (data.subtask_description !== undefined) {
      if (typeof data.subtask_description !== 'string') {
        errors.push({
          field: 'subtask_description',
          message: 'Subtask description must be a string',
        });
      } else if (data.subtask_description.length > 5000) {
        errors.push({
          field: 'subtask_description',
          message: 'Subtask description must be 5000 characters or less',
        });
      }
    }

    // Validate assigned_to (optional)
    if (data.assigned_to !== undefined) {
      if (
        data.assigned_to !== null &&
        (typeof data.assigned_to !== 'number' || data.assigned_to <= 0)
      ) {
        errors.push({
          field: 'assigned_to',
          message: 'Assigned user ID must be a positive number or null',
        });
      }
    }

    // Validate subtask_status (optional)
    if (data.subtask_status !== undefined) {
      if (!Object.values(SubtaskStatus).includes(data.subtask_status)) {
        errors.push({
          field: 'subtask_status',
          message: `Subtask status must be one of: ${Object.values(SubtaskStatus).join(', ')}`,
        });
      }
    }

    // Validate subtask_comment (optional)
    if (data.subtask_comment !== undefined) {
      if (typeof data.subtask_comment !== 'string') {
        errors.push({
          field: 'subtask_comment',
          message: 'Subtask comment must be a string',
        });
      } else if (data.subtask_comment.length > 2000) {
        errors.push({
          field: 'subtask_comment',
          message: 'Subtask comment must be 2000 characters or less',
        });
      }
    }

    // Validate subtask_date (optional)
    if (data.subtask_date !== undefined) {
      if (data.subtask_date !== null) {
        if (typeof data.subtask_date !== 'string') {
          errors.push({
            field: 'subtask_date',
            message: 'Subtask date must be a string or null',
          });
        } else if (!this.isValidDate(data.subtask_date)) {
          errors.push({
            field: 'subtask_date',
            message: 'Subtask date must be in YYYY-MM-DD format',
          });
        }
      }
    }

    return errors;
  }

  static sanitizeCreateSubtask(data: CreateSubtaskRequest): CreateSubtaskRequest {
    return {
      relation_task_id: data.relation_task_id,
      subtask_title:
        typeof data.subtask_title === 'string' ? data.subtask_title.trim() : data.subtask_title,
      subtask_description:
        typeof data.subtask_description === 'string'
          ? data.subtask_description.trim() || null
          : data.subtask_description,
      assigned_to: data.assigned_to || null,
      subtask_date:
        typeof data.subtask_date === 'string'
          ? data.subtask_date.trim() || null
          : data.subtask_date,
    };
  }

  static sanitizeUpdateSubtask(data: UpdateSubtaskRequest): UpdateSubtaskRequest {
    const sanitized: UpdateSubtaskRequest = {};

    if (data.subtask_title !== undefined) {
      sanitized.subtask_title =
        typeof data.subtask_title === 'string' ? data.subtask_title.trim() : data.subtask_title;
    }

    if (data.subtask_description !== undefined) {
      sanitized.subtask_description =
        typeof data.subtask_description === 'string'
          ? data.subtask_description.trim() || null
          : data.subtask_description;
    }

    if (data.assigned_to !== undefined) {
      sanitized.assigned_to = data.assigned_to;
    }

    if (data.subtask_status !== undefined) {
      sanitized.subtask_status = data.subtask_status;
    }

    if (data.subtask_comment !== undefined) {
      sanitized.subtask_comment =
        typeof data.subtask_comment === 'string'
          ? data.subtask_comment.trim() || null
          : data.subtask_comment;
    }

    if (data.subtask_date !== undefined) {
      sanitized.subtask_date =
        typeof data.subtask_date === 'string'
          ? data.subtask_date.trim() || null
          : data.subtask_date;
    }

    return sanitized;
  }

  private static isValidDate(dateString: string): boolean {
    // Check YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    // Check if it's a valid date
    const date = new Date(dateString);
    const timestamp = date.getTime();

    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
      return false;
    }

    // Check if the date string matches the parsed date
    return dateString === date.toISOString().split('T')[0];
  }
}
