"use client";

import { useState, useEffect } from 'react';
import { Task, TaskStatus } from "@/types";
import { TasksByStatusResponse } from "@/modules/tasks/types";
import KanbanColumn from "./KanbanColumn";
import TaskDetailModal from "./TaskDetailModal";
import { Button } from "./ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

interface KanbanBoardProps {
  onCreateTask?: () => void;
  onEditTask?: (task: Task) => void;
  onAddSubtask?: (task: Task) => void;
}

export default function KanbanBoard({ onCreateTask, onEditTask, onAddSubtask }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<{
    todo: Task[];
    in_progress: Task[];
    done: Task[];
  }>({
    todo: [],
    in_progress: [],
    done: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  const fetchTasks = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/tasks/kanban');
      const data: TasksByStatusResponse = await response.json();
      
      if (data.success) {
        setTasks(data.tasks);
      } else {
        toast.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Task deleted successfully');
        fetchTasks(); // Refresh the board
      } else {
        toast.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleTaskStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Task status updated successfully');
        fetchTasks(); // Refresh the board
      } else {
        toast.error('Failed to update task status');
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleTaskDrop = async (taskId: number, newStatus: TaskStatus) => {
    // Find the current task to check if status is actually changing
    const allTasks = [...tasks.todo, ...tasks.in_progress, ...tasks.done];
    const task = allTasks.find(t => t.task_id === taskId);
    
    if (task && task.status !== newStatus) {
      await handleTaskStatusChange(taskId, newStatus);
    }
  };

  const handleViewTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleCloseTaskDetail = () => {
    setShowTaskDetail(false);
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Spinner size="lg" />
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Board</h2>
          <p className="text-gray-600 mt-1">Manage your tasks with drag and drop</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTasks}
            disabled={refreshing}
          >
            {refreshing ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          {onCreateTask && (
            <Button onClick={onCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        <KanbanColumn
          title="To Do"
          status={TaskStatus.TODO}
          tasks={tasks.todo}
          onTaskEdit={onEditTask}
          onTaskDelete={handleTaskDelete}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskDrop={handleTaskDrop}
          onTaskViewDetails={handleViewTaskDetails}
          onTaskAddSubtask={onAddSubtask}
        />
        
        <KanbanColumn
          title="In Progress"
          status={TaskStatus.IN_PROGRESS}
          tasks={tasks.in_progress}
          onTaskEdit={onEditTask}
          onTaskDelete={handleTaskDelete}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskDrop={handleTaskDrop}
          onTaskViewDetails={handleViewTaskDetails}
          onTaskAddSubtask={onAddSubtask}
        />
        
        <KanbanColumn
          title="Done"
          status={TaskStatus.DONE}
          tasks={tasks.done}
          onTaskEdit={onEditTask}
          onTaskDelete={handleTaskDelete}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskDrop={handleTaskDrop}
          onTaskViewDetails={handleViewTaskDetails}
          onTaskAddSubtask={onAddSubtask}
        />
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        open={showTaskDetail}
        onClose={handleCloseTaskDetail}
        task={selectedTask}
      />
    </div>
  );
}