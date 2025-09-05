import { NextRequest } from 'next/server';
import { SettingsController } from '@/modules/settings/controller';

export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const resolvedParams = await params;
  return SettingsController.getSetting(request, { params: resolvedParams });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const resolvedParams = await params;
  return SettingsController.updateSetting(request, { params: resolvedParams });
}
