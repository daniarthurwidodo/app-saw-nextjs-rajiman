'use client';

import { useState } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import TaskForm from '@/components/TaskForm';
import AddSubtaskModal from '@/components/AddSubtaskModal';
import { Task } from '@/types';
import { Toaster } from 'sonner';

export default function TasksPage() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddSubtaskModal, setShowAddSubtaskModal] = useState(false);
  const [selectedTaskForSubtask, setSelectedTaskForSubtask] = useState<Task | null>(null);
  const [refreshBoard, setRefreshBoard] = useState(0);

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleFormSuccess = () => {
    // Trigger a refresh of the Kanban board
    setRefreshBoard((prev) => prev + 1);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleAddSubtask = (task: Task) => {
    setSelectedTaskForSubtask(task);
    setShowAddSubtaskModal(true);
  };

  const handleSubtaskSuccess = () => {
    // Trigger a refresh of the Kanban board
    setRefreshBoard((prev) => prev + 1);
  };

  const handleCloseAddSubtaskModal = () => {
    setShowAddSubtaskModal(false);
    setSelectedTaskForSubtask(null);
  };

  return (
    <div className='container mx-auto p-6'>
      <KanbanBoard
        onCreateTask={handleCreateTask}
        onEditTask={handleEditTask}
        onAddSubtask={handleAddSubtask}
        key={refreshBoard} // Force re-render when refreshBoard changes
      />

      <TaskForm
        open={showTaskForm}
        onClose={handleCloseForm}
        task={editingTask}
        onSuccess={handleFormSuccess}
      />

      <AddSubtaskModal
        open={showAddSubtaskModal}
        onOpenChange={setShowAddSubtaskModal}
        task={selectedTaskForSubtask}
        onSuccess={handleSubtaskSuccess}
      />

      <Toaster position='top-right' />
    </div>
  );
}
