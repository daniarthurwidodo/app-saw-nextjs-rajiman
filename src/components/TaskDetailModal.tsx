'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types';
import SubtaskManager from './SubtaskManager';
import { Calendar, User, Clock, AlertCircle } from 'lucide-react';

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function TaskDetailModal({ open, onClose, task }: TaskDetailModalProps) {
  if (!task) return null;

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'outline',
      medium: 'default',
      high: 'destructive',
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'outline'}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      todo: 'outline',
      in_progress: 'default',
      done: 'secondary',
    } as const;

    const colors = {
      todo: 'text-yellow-700 bg-yellow-100',
      in_progress: 'text-blue-700 bg-blue-100',
      done: 'text-green-700 bg-green-100',
    };

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || 'outline'}
        className={colors[status as keyof typeof colors]}
      >
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl'>{task.title}</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Task Overview */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 space-y-4'>
              {/* Description */}
              {task.description && (
                <div>
                  <h4 className='font-medium mb-2'>Description</h4>
                  <div className='p-3 bg-gray-50 rounded-lg text-sm'>{task.description}</div>
                </div>
              )}

              {/* Status and Priority */}
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>Status:</span>
                  {getStatusBadge(task.status)}
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>Priority:</span>
                  {getPriorityBadge(task.priority)}
                </div>
              </div>
            </div>

            {/* Task Details Sidebar */}
            <div className='space-y-4 p-4 bg-gray-50 rounded-lg'>
              <h4 className='font-medium text-sm uppercase tracking-wider text-gray-600'>
                Task Details
              </h4>

              <div className='space-y-3'>
                {/* Assigned To */}
                {task.assigned_user_name && (
                  <div className='flex items-center gap-2 text-sm'>
                    <User className='w-4 h-4 text-gray-500' />
                    <span className='text-gray-600'>Assigned to:</span>
                    <span className='font-medium'>{task.assigned_user_name}</span>
                  </div>
                )}

                {/* Created By */}
                {task.created_by_name && (
                  <div className='flex items-center gap-2 text-sm'>
                    <User className='w-4 h-4 text-gray-500' />
                    <span className='text-gray-600'>Created by:</span>
                    <span className='font-medium'>{task.created_by_name}</span>
                  </div>
                )}

                {/* Due Date */}
                {task.due_date && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Calendar className='w-4 h-4 text-gray-500' />
                    <span className='text-gray-600'>Due:</span>
                    <span className='font-medium'>
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Created Date */}
                <div className='flex items-center gap-2 text-sm'>
                  <Clock className='w-4 h-4 text-gray-500' />
                  <span className='text-gray-600'>Created:</span>
                  <span className='font-medium'>
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Approval Status */}
                {task.approval_status && task.approval_status !== 'pending' && (
                  <div className='flex items-center gap-2 text-sm'>
                    <AlertCircle className='w-4 h-4 text-gray-500' />
                    <span className='text-gray-600'>Approval:</span>
                    <Badge
                      variant={task.approval_status === 'approved' ? 'default' : 'destructive'}
                    >
                      {task.approval_status.toUpperCase()}
                    </Badge>
                  </div>
                )}

                {/* Approved By */}
                {task.approved_by_name && task.approval_date && (
                  <div className='text-xs text-gray-500 pl-6'>
                    by {task.approved_by_name} on{' '}
                    {new Date(task.approval_date).toLocaleDateString()}
                  </div>
                )}

                {/* Last Updated */}
                {task.updated_at && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Clock className='w-4 h-4 text-gray-500' />
                    <span className='text-gray-600'>Updated:</span>
                    <span className='font-medium'>
                      {new Date(task.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className='border-t pt-6'>
            <SubtaskManager taskId={task.task_id} taskTitle={task.title} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
