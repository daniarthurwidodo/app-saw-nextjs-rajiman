import { NextRequest, NextResponse } from 'next/server';
import { UsersService } from './service';
import { CreateUserRequest, UpdateUserRequest, UsersError } from './types';
import { UsersValidator } from './validation';
import { UserRole } from '@/types';

export class UsersController {
  static async getUsers(request: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(request.url);
      const searchParams = url.searchParams;

      // Parse pagination
      const { page, limit } = UsersValidator.validatePagination(
        searchParams.get('page') || 1,
        searchParams.get('limit') || 10
      );

      // Parse filters
      const filters = UsersValidator.validateFilters({
        role: searchParams.get('role'),
        school_id: searchParams.get('school_id'),
        is_active: searchParams.get('is_active'),
        search: searchParams.get('search')
      });

      const result = await UsersService.getUsers(filters, { page, limit });

      return NextResponse.json(result, { status: 200 });

    } catch (error) {
      if (error instanceof UsersError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code
          },
          { status: error.status }
        );
      }

      console.error('Get users controller error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  }

  static async getUserById(request: NextRequest, userId: string): Promise<NextResponse> {
    try {
      const validatedUserId = UsersValidator.validateUserId(userId);
      const result = await UsersService.getUserById(validatedUserId);

      return NextResponse.json(result, { status: 200 });

    } catch (error) {
      if (error instanceof UsersError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code
          },
          { status: error.status }
        );
      }

      console.error('Get user by id controller error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  }

  static async createUser(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const userData: CreateUserRequest = {
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
        school_id: body.school_id
      };

      const result = await UsersService.createUser(userData);

      return NextResponse.json(result, { status: 201 });

    } catch (error) {
      if (error instanceof UsersError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code
          },
          { status: error.status }
        );
      }

      console.error('Create user controller error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  }

  static async updateUser(request: NextRequest, userId: string): Promise<NextResponse> {
    try {
      const validatedUserId = UsersValidator.validateUserId(userId);
      const body = await request.json();
      
      const updateData: UpdateUserRequest = {
        name: body.name,
        email: body.email,
        role: body.role,
        school_id: body.school_id,
        is_active: body.is_active
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateUserRequest] === undefined) {
          delete updateData[key as keyof UpdateUserRequest];
        }
      });

      const result = await UsersService.updateUser(validatedUserId, updateData);

      return NextResponse.json(result, { status: 200 });

    } catch (error) {
      if (error instanceof UsersError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code
          },
          { status: error.status }
        );
      }

      console.error('Update user controller error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  }

  static async deleteUser(request: NextRequest, userId: string): Promise<NextResponse> {
    try {
      const validatedUserId = UsersValidator.validateUserId(userId);
      const result = await UsersService.deleteUser(validatedUserId);

      return NextResponse.json(result, { status: 200 });

    } catch (error) {
      if (error instanceof UsersError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code
          },
          { status: error.status }
        );
      }

      console.error('Delete user controller error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  }

  static async getUsersByRole(request: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(request.url);
      const role = url.searchParams.get('role') as UserRole;

      if (!role) {
        return NextResponse.json(
          {
            success: false,
            message: 'Role parameter is required',
            code: 'MISSING_ROLE'
          },
          { status: 400 }
        );
      }

      const validRoles = Object.values(UserRole);
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
            code: 'INVALID_ROLE'
          },
          { status: 400 }
        );
      }

      const users = await UsersService.getUsersByRole(role);

      return NextResponse.json({
        success: true,
        message: 'Users retrieved successfully',
        users
      }, { status: 200 });

    } catch (error) {
      if (error instanceof UsersError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code
          },
          { status: error.status }
        );
      }

      console.error('Get users by role controller error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  }

  static async getUsersBySchool(request: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(request.url);
      const schoolIdParam = url.searchParams.get('school_id');

      if (!schoolIdParam) {
        return NextResponse.json(
          {
            success: false,
            message: 'School ID parameter is required',
            code: 'MISSING_SCHOOL_ID'
          },
          { status: 400 }
        );
      }

      const schoolId = parseInt(schoolIdParam);
      if (isNaN(schoolId) || schoolId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid school ID',
            code: 'INVALID_SCHOOL_ID'
          },
          { status: 400 }
        );
      }

      const users = await UsersService.getUsersBySchool(schoolId);

      return NextResponse.json({
        success: true,
        message: 'Users retrieved successfully',
        users
      }, { status: 200 });

    } catch (error) {
      if (error instanceof UsersError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code
          },
          { status: error.status }
        );
      }

      console.error('Get users by school controller error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  }
}