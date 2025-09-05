import { NextRequest } from 'next/server';
import { ProfileController } from '@/modules/profile/controller';

export async function GET(request: NextRequest) {
  return ProfileController.getCurrentProfile(request);
}

export async function PUT(request: NextRequest) {
  return ProfileController.updateCurrentProfile(request);
}