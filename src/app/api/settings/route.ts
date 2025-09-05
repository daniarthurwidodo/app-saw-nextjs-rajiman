import { NextRequest } from 'next/server';
import { SettingsController } from '@/modules/settings/controller';

export async function GET(request: NextRequest) {
  return SettingsController.getAllSettings(request);
}

export async function PUT(request: NextRequest) {
  return SettingsController.updateMultipleSettings(request);
}
