import { NextRequest } from 'next/server';
import { UsersController } from '@/modules/users/controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return await UsersController.getUserById(request, params.id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return await UsersController.updateUser(request, params.id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return await UsersController.deleteUser(request, params.id);
}