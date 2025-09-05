import { NextRequest } from 'next/server';
import { SubtasksController } from '@/modules/subtasks/controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return SubtasksController.getSubtasksByTask(request, params);
}