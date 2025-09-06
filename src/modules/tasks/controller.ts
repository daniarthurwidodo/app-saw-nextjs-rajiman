import { NextRequest, NextResponse } from 'next/server';
import { TasksService } from './service';
import { TasksValidator } from './validation';
import { TasksError } from './types';
import { withLogger } from '@/lib/logger-middleware';

export class TasksController {
  static getTasks = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);

      // Parse filters
      const filters = TasksValidator.validateFilters({
        status: searchParams.get('status'),
        priority: searchParams.get('priority'),
        assigned_to: searchParams.get('assigned_to'),
        created_by: searchParams.get('created_by'),
        approval_status: searchParams.get('approval_status'),
        search: searchParams.get('search'),
      });

      // Parse pagination
      const pagination = TasksValidator.validatePagination(
        searchParams.get('page') || 1,
        searchParams.get('limit') || 10
      );

      const result = await TasksService.getTasks(filters, pagination);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof TasksError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  static getTasksByStatus = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      const result = await TasksService.getTasksByStatus();
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof TasksError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  static getTaskById = withLogger(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> => {
    try {
      const taskId = TasksValidator.validateTaskId(params.id);
      const result = await TasksService.getTaskById(taskId);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof TasksError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  static createTask = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();

      // For now, using a hardcoded created_by value
      // In a real app, this would come from the authenticated user
      const createdBy = 1;

      const result = await TasksService.createTask(body, createdBy);

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof TasksError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  static updateTask = withLogger(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> => {
    try {
      const taskId = TasksValidator.validateTaskId(params.id);
      const body = await request.json();

      const result = await TasksService.updateTask(taskId, body);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof TasksError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  static deleteTask = withLogger(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> => {
    try {
      const taskId = TasksValidator.validateTaskId(params.id);
      const result = await TasksService.deleteTask(taskId);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof TasksError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
