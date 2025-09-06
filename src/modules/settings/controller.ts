import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from './service';
import { SettingsError } from './types';
import { withLogger } from '@/lib/logger-middleware';

export class SettingsController {
  static getAllSettings = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      const result = await SettingsService.getAllSettings();
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof SettingsError) {
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

  static getSettingsByCategory = withLogger(async (
    request: NextRequest,
    { params }: { params: { category: string } }
  ): Promise<NextResponse> => {
    try {
      const result = await SettingsService.getSettingsByCategory(params.category);
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof SettingsError) {
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

  static getSetting = withLogger(async (
    request: NextRequest,
    { params }: { params: { key: string } }
  ): Promise<NextResponse> => {
    try {
      const value = await SettingsService.getSetting(params.key);
      return NextResponse.json({
        success: true,
        message: 'Setting retrieved successfully',
        value,
      });
    } catch (error) {
      if (error instanceof SettingsError) {
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

  static updateSetting = withLogger(async (
    request: NextRequest,
    { params }: { params: { key: string } }
  ): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const result = await SettingsService.updateSetting(params.key, body.value);
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof SettingsError) {
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

  static updateMultipleSettings = withLogger(async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const result = await SettingsService.updateMultipleSettings(body);
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof SettingsError) {
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
