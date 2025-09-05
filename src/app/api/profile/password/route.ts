import { NextRequest } from 'next/server';
import { ProfileController } from '@/modules/profile/controller';

export async function PUT(request: NextRequest) {
  // For now, using hardcoded user ID (in a real app, this would come from JWT/session)
  return ProfileController.changePassword(request, { params: { id: '1' } });
}
