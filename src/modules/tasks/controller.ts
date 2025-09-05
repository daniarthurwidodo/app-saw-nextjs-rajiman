import { NextRequest, NextResponse } from 'next/server';
import { TasksService } from './service';
import { TasksValidator } from './validation';
import { TasksError } from './types';

export class TasksController {
  static async getTasks(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      
      // Parse filters
      const filters = TasksValidator.validateFilters({
        status: searchParams.get('status'),
        priority: searchParams.get('priority'),
        assigned_to: searchParams.get('assigned_to'),
        created_by: searchParams.get('created_by'),
        approval_status: searchParams.get('approval_status'),
        search: searchParams.get('search')
      });

      // Parse pagination
      const pagination = TasksValidator.validatePagination(
        searchParams.get('page') || 1,
        searchParams.get('limit') || 10
      );

      const result = await TasksService.getTasks(filters, pagination);

      return NextResponse.json(result);
    } catch (error) {
      console.error('Get tasks controller error:', error);
      
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
  }

  static async getTasksByStatus(): Promise<NextResponse> {
    try {
      const result = await TasksService.getTasksByStatus();
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get tasks by status controller error:', error);
      
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
  }

  static async getTaskById(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const taskId = TasksValidator.validateTaskId(params.id);
      const result = await TasksService.getTaskById(taskId);

      return NextResponse.json(result);
    } catch (error) {
      console.error('Get task by id controller error:', error);
      
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
  }

  static async createTask(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      
      // For now, using a hardcoded created_by value
      // In a real app, this would come from the authenticated user
      const createdBy = 1;

      const result = await TasksService.createTask(body, createdBy);

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      console.error('Create task controller error:', error);
      
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
  }

  static async updateTask(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const taskId = TasksValidator.validateTaskId(params.id);
      const body = await request.json();

      const result = await TasksService.updateTask(taskId, body);

      return NextResponse.json(result);
    } catch (error) {
      console.error('Update task controller error:', error);
      
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
  }

  static async deleteTask(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const taskId = TasksValidator.validateTaskId(params.id);
      const result = await TasksService.deleteTask(taskId);

      return NextResponse.json(result);
    } catch (error) {
      console.error('Delete task controller error:', error);
      
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
  }
}