import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from './service';
import { SettingsError } from './types';

export class SettingsController {
  static async getAllSettings(request: NextRequest): Promise<NextResponse> {
    try {
      const result = await SettingsService.getAllSettings();
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get all settings controller error:', error);
      
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
  }

  static async getSettingsByCategory(request: NextRequest, { params }: { params: { category: string } }): Promise<NextResponse> {
    try {
      const result = await SettingsService.getSettingsByCategory(params.category);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get settings by category controller error:', error);
      
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
  }

  static async getSetting(request: NextRequest, { params }: { params: { key: string } }): Promise<NextResponse> {
    try {
      const value = await SettingsService.getSetting(params.key);
      return NextResponse.json({
        success: true,
        message: 'Setting retrieved successfully',
        value
      });
    } catch (error) {
      console.error('Get setting controller error:', error);
      
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
  }

  static async updateSetting(request: NextRequest, { params }: { params: { key: string } }): Promise<NextResponse> {
    try {
      const body = await request.json();
      const result = await SettingsService.updateSetting(params.key, body.value);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update setting controller error:', error);
      
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
  }

  static async updateMultipleSettings(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const result = await SettingsService.updateMultipleSettings(body);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update multiple settings controller error:', error);
      
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
  }
}