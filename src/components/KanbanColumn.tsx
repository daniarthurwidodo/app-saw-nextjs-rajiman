'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskStatusChange?: (taskId: number, newStatus: string) => void;
  onTaskDrop?: (taskId: number, newStatus: TaskStatus) => void;
  onTaskViewDetails?: (task: Task) => void;
  onTaskAddSubtask?: (task: Task) => void;
  onRefresh?: () => void;
}

export default function KanbanColumn({
  title,
  status,
  tasks,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskDrop,
  onTaskViewDetails,
  onTaskAddSubtask,
  onRefresh,
}: KanbanColumnProps) {
  const getColumnColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'border-l-blue-500 bg-blue-50/30';
      case TaskStatus.IN_PROGRESS:
        return 'border-l-yellow-500 bg-yellow-50/30';
      case TaskStatus.DONE:
        return 'border-l-green-500 bg-green-50/30';
      default:
        return 'border-l-gray-500 bg-gray-50/30';
    }
  };

  const getBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case TaskStatus.DONE:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('text/plain'));
    if (taskId && onTaskDrop) {
      onTaskDrop(taskId, status);
    }
  };

  return (
    <div className='flex-1 min-w-80'>
      <Card
        className={`h-full ${getColumnColor(status)} border-l-4`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold text-gray-900'>{title}</CardTitle>
            <Badge className={`${getBadgeColor(status)} text-xs font-medium`}>{tasks.length}</Badge>
          </div>
        </CardHeader>

        <CardContent className='space-y-0'>
          <div className='space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto'>
            {tasks.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                <p className='text-sm'>No tasks in this column</p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.task_id}
                  task={task}
                  onEdit={onTaskEdit}
                  onDelete={onTaskDelete}
                  onStatusChange={onTaskStatusChange}
                  onViewDetails={onTaskViewDetails}
                  onAddSubtask={onTaskAddSubtask}
                  onRefresh={onRefresh}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
