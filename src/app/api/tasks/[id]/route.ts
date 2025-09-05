import { NextRequest } from 'next/server';
import { TasksController } from '@/modules/tasks/controller';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return TasksController.getTaskById(request, { params });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return TasksController.updateTask(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return TasksController.deleteTask(request, { params });
}