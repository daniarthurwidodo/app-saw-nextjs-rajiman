import { NextRequest } from 'next/server';
import { UsersController } from '@/modules/users/controller';

export async function GET(request: NextRequest) {
  return await UsersController.getUsersByRole(request);
}