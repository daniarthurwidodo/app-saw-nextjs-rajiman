import { NextRequest, NextResponse } from 'next/server';
import { SubtasksService } from './service';
import {
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
  SubtasksError,
  PaginationParams,
  SubtaskFilters,
} from './types';
import { withLogger } from '@/lib/logger-middleware';

export class SubtasksController {
  static getSubtasks = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);

      // Parse pagination parameters
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

      const pagination: PaginationParams = { page, limit };

      // Parse filters
      const filters: SubtaskFilters = {};

      if (searchParams.get('relation_task_id')) {
        filters.relation_task_id = parseInt(searchParams.get('relation_task_id') || '0');
      }

      if (searchParams.get('subtask_status')) {
        filters.subtask_status = searchParams.get('subtask_status') as any;
      }

      if (searchParams.get('assigned_to')) {
        filters.assigned_to = parseInt(searchParams.get('assigned_to') || '0');
      }

      if (searchParams.get('search')) {
        filters.search = searchParams.get('search') || undefined;
      }

      const result = await SubtasksService.getSubtasks(filters, pagination);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof SubtasksError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'An error occurred while fetching subtasks',
        },
        { status: 500 }
      );
    }
  });

  static getSubtasksByTask = withLogger(async (
    request: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> => {
    try {
      const taskId = parseInt(params.id);

      if (isNaN(taskId) || taskId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid task ID',
          },
          { status: 400 }
        );
      }

      const result = await SubtasksService.getSubtasksByTask(taskId);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof SubtasksError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'An error occurred while fetching subtasks for task',
        },
        { status: 500 }
      );
    }
  });

  static getSubtasksByStatus = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      const result = await SubtasksService.getSubtasksByStatus();

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof SubtasksError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'An error occurred while fetching subtasks by status',
        },
        { status: 500 }
      );
    }
  });

  static getSubtasksProgress = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      const result = await SubtasksService.getSubtasksProgress();

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof SubtasksError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'An error occurred while fetching subtasks progress',
        },
        { status: 500 }
      );
    }
  });

  static getSubtaskById = withLogger(async (request: NextRequest, params: { id: string }): Promise<NextResponse> => {
    try {
      const subtaskId = parseInt(params.id);

      if (isNaN(subtaskId) || subtaskId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid subtask ID',
          },
          { status: 400 }
        );
      }

      const result = await SubtasksService.getSubtaskById(subtaskId);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof SubtasksError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'An error occurred while fetching subtask',
        },
        { status: 500 }
      );
    }
  });

  static createSubtask = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body: CreateSubtaskRequest = await request.json();

      const result = await SubtasksService.createSubtask(body);

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof SubtasksError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'An error occurred while creating subtask',
        },
        { status: 500 }
      );
    }
  });

  static updateSubtask = withLogger(async (request: NextRequest, params: { id: string }): Promise<NextResponse> => {
    try {
      const subtaskId = parseInt(params.id);

      if (isNaN(subtaskId) || subtaskId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid subtask ID',
          },
          { status: 400 }
        );
      }

      const body: UpdateSubtaskRequest = await request.json();

      const result = await SubtasksService.updateSubtask(subtaskId, body);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof SubtasksError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'An error occurred while updating subtask',
          error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        { status: 500 }
      );
    }
  });

  static deleteSubtask = withLogger(async (request: NextRequest, params: { id: string }): Promise<NextResponse> => {
    try {
      const subtaskId = parseInt(params.id);

      if (isNaN(subtaskId) || subtaskId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid subtask ID',
          },
          { status: 400 }
        );
      }

      const result = await SubtasksService.deleteSubtask(subtaskId);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof SubtasksError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'An error occurred while deleting subtask',
        },
        { status: 500 }
      );
    }
  });
}
