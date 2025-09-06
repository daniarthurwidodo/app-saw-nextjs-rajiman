import { NextRequest } from 'next/server';
import { TasksController } from '@/modules/tasks/controller';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return TasksController.getTasks(request);
}

export async function POST(request: NextRequest) {
  return TasksController.createTask(request);
}
