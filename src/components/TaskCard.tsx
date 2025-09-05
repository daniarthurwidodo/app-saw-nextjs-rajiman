"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task, TaskPriority } from "@/types";
import { Calendar, User, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  onStatusChange?: (taskId: number, newStatus: string) => void;
  onDragStart?: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, onDragStart }: TaskCardProps) {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case TaskPriority.LOW:
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
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

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.task_id.toString());
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(task);
  };

  return (
    <Card 
      className="w-full mb-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={handleDragStart}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-semibold text-gray-900 leading-tight">
            {task.title}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  Edit Task
                </DropdownMenuItem>
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
                  className="text-red-600 focus:text-red-600"
                >
                  Delete Task
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {task.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge 
            variant="secondary" 
            className={`text-xs ${getPriorityColor(task.priority)}`}
          >
            {task.priority.toUpperCase()}
          </Badge>
          
          {task.approval_status && task.approval_status !== 'pending' && (
            <Badge 
              variant={task.approval_status === 'approved' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {task.approval_status.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {task.assigned_user_name && (
            <div className="flex items-center text-xs text-gray-600">
              <User className="h-3 w-3 mr-1" />
              <span>{task.assigned_user_name}</span>
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="h-3 w-3 mr-1" />
              <span className={isOverdue(task.due_date) ? "text-red-600 font-medium" : ""}>
                {formatDate(task.due_date)}
                {isOverdue(task.due_date) && " (Overdue)"}
              </span>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-2">
            Created by {task.created_by_name || 'Unknown'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}