import { NextRequest } from 'next/server';
import { TasksController } from '@/modules/tasks/controller';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return TasksController.getTaskById(request, { params: resolvedParams });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return TasksController.updateTask(request, { params: resolvedParams });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return TasksController.deleteTask(request, { params: resolvedParams });
}
