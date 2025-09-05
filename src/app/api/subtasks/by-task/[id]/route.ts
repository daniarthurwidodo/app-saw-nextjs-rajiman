import { NextRequest } from 'next/server';
import { SubtasksController } from '@/modules/subtasks/controller';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return SubtasksController.getSubtasksByTask(request, resolvedParams);
}
