import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from './service';
import { ProfileValidator } from './validation';
import { ProfileError } from './types';
import { withLogger } from '@/lib/logger-middleware';

export class ProfileController {
  static getProfile = withLogger(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> => {
    try {
      const userId = ProfileValidator.validateUserId(params.id);
      const result = await ProfileService.getProfile(userId);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof ProfileError) {
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

  static updateProfile = withLogger(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> => {
    try {
      const userId = ProfileValidator.validateUserId(params.id);
      const body = await request.json();

      const result = await ProfileService.updateProfile(userId, body);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof ProfileError) {
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

  static changePassword = withLogger(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> => {
    try {
      const userId = ProfileValidator.validateUserId(params.id);
      const body = await request.json();

      const result = await ProfileService.changePassword(userId, body);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof ProfileError) {
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

  static uploadProfileImage = withLogger(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> => {
    try {
      const userId = ProfileValidator.validateUserId(params.id);
      const body = await request.json();

      if (!body.imagePath) {
        return NextResponse.json(
          { success: false, message: 'Image path is required' },
          { status: 400 }
        );
      }

      const result = await ProfileService.uploadProfileImage(userId, body.imagePath);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof ProfileError) {
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

  // For getting current user's profile (without user ID in params)
  static getCurrentProfile = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      // For now, using hardcoded user ID (in a real app, this would come from JWT/session)
      const userId = 1;

      const result = await ProfileService.getProfile(userId);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof ProfileError) {
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

  static updateCurrentProfile = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      // For now, using hardcoded user ID (in a real app, this would come from JWT/session)
      const userId = 1;
      const body = await request.json();

      const result = await ProfileService.updateProfile(userId, body);

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof ProfileError) {
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
