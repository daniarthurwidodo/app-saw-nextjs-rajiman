import { SubtasksController } from '@/modules/subtasks/controller';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return SubtasksController.getSubtasksProgress(request);
}
