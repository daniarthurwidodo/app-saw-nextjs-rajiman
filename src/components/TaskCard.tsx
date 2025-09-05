'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task, TaskPriority, Subtask, TaskStatus, SubtaskStatus } from '@/types';
import {
  Calendar,
  User,
  MoreHorizontal,
  Plus,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import SubtaskDetailDialog from './SubtaskDetailDialog';
import EditSubtaskModal from './EditSubtaskModal';

type ExtendedTask = Task;

type TaskCardProps = {
  task: ExtendedTask;
  onEdit?: (task: ExtendedTask) => void;
  onDelete?: (taskId: number) => void;
  onStatusChange?: (taskId: number, newStatus: string) => void;
  onDragStart?: (task: ExtendedTask) => void;
  onViewDetails?: (task: ExtendedTask) => void;
  onAddSubtask?: (task: ExtendedTask) => void;
  onRefresh?: () => void;
};

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onDragStart,
  onViewDetails,
  onAddSubtask,
  onRefresh,
}: TaskCardProps) {
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getSubtaskStatusBadgeColor = (status: string) => {
    switch (status) {
      case SubtaskStatus.DONE:
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case SubtaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case SubtaskStatus.TODO:
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getSubtaskStatusLabel = (status: string) => {
    switch (status) {
      case SubtaskStatus.DONE:
        return 'Done';
      case SubtaskStatus.IN_PROGRESS:
        return 'In Progress';
      case SubtaskStatus.TODO:
        return 'To Do';
      default:
        return 'Unknown';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.task_id.toString());
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(task);
  };

  return (
    <Card
      className='w-full mb-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing'
      draggable
      onDragStart={handleDragStart}
    >
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between'>
          <h4 className='text-sm font-semibold text-gray-900 leading-tight'>{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {onViewDetails && (
                <DropdownMenuItem onClick={() => onViewDetails(task)}>
                  View Details
                </DropdownMenuItem>
              )}
              {onAddSubtask && (
                <DropdownMenuItem onClick={() => onAddSubtask(task)}>
                  <Plus className='h-4 w-4 mr-2' />
                  Add Subtask
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>Edit Task</DropdownMenuItem>
              )}
              {onStatusChange && task.status !== 'todo' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.task_id, 'todo')}>
                  Move to Todo
                </DropdownMenuItem>
              )}
              {onStatusChange && task.status !== 'in_progress' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.task_id, 'in_progress')}>
                  Move to In Progress
                </DropdownMenuItem>
              )}
              {onStatusChange && task.status !== 'done' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.task_id, 'done')}>
                  Move to Done
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(task.task_id)}
                  className='text-red-600 focus:text-red-600'
                >
                  Delete Task
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className='text-xs text-gray-600 mt-2 line-clamp-2'>{task.description}</p>
        )}
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='flex flex-wrap gap-2 mb-3'>
          <Badge variant='secondary' className={`text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority.toUpperCase()}
          </Badge>

          {task.approval_status && task.approval_status !== 'pending' && (
            <Badge
              variant={task.approval_status === 'approved' ? 'default' : 'destructive'}
              className='text-xs'
            >
              {task.approval_status.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className='space-y-2'>
          {task.assigned_user_name && (
            <div className='flex items-center text-xs text-gray-600'>
              <User className='h-3 w-3 mr-1' />
              <span>{task.assigned_user_name}</span>
            </div>
          )}

          {task.due_date && (
            <div className='flex items-center text-xs text-gray-600'>
              <Calendar className='h-3 w-3 mr-1' />
              <span className={isOverdue(task.due_date) ? 'text-red-600 font-medium' : ''}>
                {formatDate(task.due_date)}
                {isOverdue(task.due_date) && ' (Overdue)'}
              </span>
            </div>
          )}

          <div className='space-y-3 mt-3'>
            <div className='text-xs text-gray-500 w-full'>
              Created by {task.created_by_name || 'Unknown'}
            </div>

            {task.subtasks && task.subtasks.length > 0 ? (
              <>
                <div className='flex items-center text-xs text-gray-600'>
                  <div className='w-full bg-gray-200 rounded-full h-1.5'>
                    <div
                      className='bg-blue-600 h-1.5 rounded-full'
                      style={{
                        width: `${task.subtasks ? (task.subtasks.filter((s) => s.status === 'done' || s.is_completed).length / task.subtasks.length) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className='ml-2'>
                    {task.subtasks
                      ? task.subtasks.filter((s) => s.status === 'done' || s.is_completed).length
                      : 0}
                    /{task.subtasks?.length || 0}
                  </span>
                </div>

                <div className='space-y-2 border rounded-lg p-2 bg-gray-50'>
                  {task.subtasks
                    .filter((subtask) => subtask !== null)
                    .map((subtask) => {
                      const isCompleted = subtask.status === 'done' || subtask.is_completed;
                      const subtaskTitle =
                        subtask.title || subtask.subtask_title || 'Untitled Subtask';

                      return (
                        <div
                          key={subtask.subtask_id}
                          className='flex items-start space-x-2 text-xs w-full hover:bg-gray-100 p-1.5 rounded-md transition-colors'
                        >
                          <button
                            className='flex-grow text-left flex items-start justify-between w-full'
                            onClick={() => setEditingSubtask(subtask)}
                          >
                            <div className='flex-grow'>
                              <div className='flex items-center justify-between mb-1'>
                                <div
                                  className={`font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                                >
                                  {subtaskTitle}
                                </div>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${getSubtaskStatusBadgeColor(subtask.status)}`}
                                >
                                  {getSubtaskStatusLabel(subtask.status)}
                                </Badge>
                              </div>
                              {subtask?.assigned_user_name && (
                                <div className='text-gray-400 text-xs'>
                                  {subtask.assigned_user_name}
                                </div>
                              )}
                              {subtask.images && subtask.images.length > 0 && (
                                <div className='flex items-center mt-1'>
                                  <ImageIcon className='h-3 w-3 text-blue-500 mr-1' />
                                  <span className='text-blue-500 text-xs'>
                                    {subtask.images.length} image
                                    {subtask.images.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                            <ChevronRight className='h-4 w-4 text-gray-400 flex-shrink-0 self-center' />
                          </button>
                        </div>
                      );
                    })}
                  {onAddSubtask && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddSubtask(task);
                      }}
                      className='flex items-center justify-center w-full text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-1.5 rounded-md transition-colors mt-2'
                    >
                      <Plus className='h-3 w-3 mr-1' />
                      Add Subtask
                    </button>
                  )}
                </div>
              </>
            ) : (
              onAddSubtask && (
                <Button
                  variant='secondary'
                  size='sm'
                  className='w-full h-7 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                  onClick={() => onAddSubtask(task)}
                >
                  <Plus className='h-3 w-3 mr-1' />
                  Add Subtask
                </Button>
              )
            )}

            {selectedSubtask && (
              <SubtaskDetailDialog
                subtask={selectedSubtask}
                open={selectedSubtask !== null}
                onOpenChange={(open) => !open && setSelectedSubtask(null)}
              />
            )}

            {editingSubtask && (
              <EditSubtaskModal
                subtask={editingSubtask}
                open={editingSubtask !== null}
                onOpenChange={(open) => !open && setEditingSubtask(null)}
                onSuccess={() => {
                  onRefresh?.();
                  setEditingSubtask(null);
                }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
