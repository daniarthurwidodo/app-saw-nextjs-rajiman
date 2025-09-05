import { TasksController } from '@/modules/tasks/controller';

export async function GET() {
  return TasksController.getTasksByStatus();
}
