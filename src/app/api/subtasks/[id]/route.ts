import { NextRequest } from 'next/server';
import { SubtasksController } from '@/modules/subtasks/controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return SubtasksController.getSubtaskById(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return SubtasksController.updateSubtask(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return SubtasksController.deleteSubtask(request, params);
}