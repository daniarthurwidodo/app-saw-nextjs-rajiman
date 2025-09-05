import { NextRequest } from 'next/server';
import { UsersController } from '@/modules/users/controller';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return await UsersController.getUserById(request, resolvedParams.id);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return await UsersController.updateUser(request, resolvedParams.id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return await UsersController.deleteUser(request, resolvedParams.id);
}
