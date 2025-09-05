import { NextRequest } from 'next/server';
import { SubtasksController } from '@/modules/subtasks/controller';

export async function GET(request: NextRequest) {
  return SubtasksController.getSubtasks(request);
}

export async function POST(request: NextRequest) {
  return SubtasksController.createSubtask(request);
}
