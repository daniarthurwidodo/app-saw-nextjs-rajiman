import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from './service';
import { LoginRequest, RegisterRequest, AuthenticationError } from './types';
import { withLogger } from '@/lib/logger-middleware';

export class AuthController {
  static login = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const loginData: LoginRequest = {
        email: body.email,
        password: body.password,
      };

      const result = await AuthService.login(loginData);

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          { status: error.status }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  });

  static register = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const registerData: RegisterRequest = {
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
        school_id: body.school_id,
      };

      const result = await AuthService.register(registerData);

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          { status: error.status }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  });

  static getProfile = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      // In a real implementation, you would extract user ID from JWT token
      // For now, we'll use a query parameter or assume it's passed somehow
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');

      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            message: 'User ID is required',
            code: 'MISSING_USER_ID',
          },
          { status: 400 }
        );
      }

      const user = await AuthService.getUserById(parseInt(userId));

      return NextResponse.json({
        success: true,
        message: 'Profile retrieved successfully',
        user,
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          { status: error.status }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  });

  static updatePassword = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const { userId, newPassword } = body;

      if (!userId || !newPassword) {
        return NextResponse.json(
          {
            success: false,
            message: 'User ID and new password are required',
            code: 'MISSING_PARAMETERS',
          },
          { status: 400 }
        );
      }

      await AuthService.updateUserPassword(parseInt(userId), newPassword);

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          { status: error.status }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  });
}
