import { NextRequest } from 'next/server';
import { SubtasksController } from '@/modules/subtasks/controller';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return SubtasksController.getSubtaskById(request, resolvedParams);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return SubtasksController.updateSubtask(request, resolvedParams);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return SubtasksController.deleteSubtask(request, resolvedParams);
}
