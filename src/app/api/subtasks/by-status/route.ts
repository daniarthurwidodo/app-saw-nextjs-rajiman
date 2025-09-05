import { SubtasksController } from '@/modules/subtasks/controller';

export async function GET() {
  return SubtasksController.getSubtasksByStatus();
}
