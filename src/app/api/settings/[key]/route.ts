import { NextRequest } from 'next/server';
import { SettingsController } from '@/modules/settings/controller';

export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  return SettingsController.getSetting(request, { params });
}

export async function PUT(request: NextRequest, { params }: { params: { key: string } }) {
  return SettingsController.updateSetting(request, { params });
}