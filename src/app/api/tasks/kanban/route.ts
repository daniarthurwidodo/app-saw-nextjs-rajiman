import { TasksController } from '@/modules/tasks/controller';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return TasksController.getTasksByStatus(request);
}
