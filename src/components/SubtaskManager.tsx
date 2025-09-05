'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Plus, Trash2, Edit, Clock, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  user_id: number;
  name: string;
  email: string;
}

interface Subtask {
  subtask_id: number;
  relation_task_id: number;
  subtask_title: string;
  subtask_description: string | null;
  assigned_to: number | null;
  assigned_user_name?: string;
  subtask_status: 'todo' | 'in_progress' | 'done';
  subtask_comment: string | null;
  subtask_date: string | null;
  created_at: string;
  updated_at: string;
}

interface SubtaskManagerProps {
  taskId: number;
  taskTitle: string;
}

export default function SubtaskManager({ taskId, taskTitle }: SubtaskManagerProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
  const [formData, setFormData] = useState({
    subtask_title: '',
    subtask_description: '',
    assigned_to: '',
    subtask_date: '',
    subtask_status: 'todo' as 'todo' | 'in_progress' | 'done',
    subtask_comment: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchSubtasks();
      fetchUsers();
    }
  }, [taskId]);

  const fetchSubtasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subtasks/by-task/${taskId}`);
      const data = await response.json();

      if (data.success) {
        setSubtasks(data.subtasks);
      } else {
        toast.error('Failed to fetch subtasks');
      }
    } catch (error) {
      console.error('Failed to fetch subtasks:', error);
      toast.error('Failed to fetch subtasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      subtask_title: '',
      subtask_description: '',
      assigned_to: '',
      subtask_date: '',
      subtask_status: 'todo',
      subtask_comment: '',
    });
  };

  const handleCreateSubtask = async () => {
    if (!formData.subtask_title.trim()) {
      toast.error('Subtask title is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        relation_task_id: taskId,
        subtask_title: formData.subtask_title,
        subtask_description: formData.subtask_description || null,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
        subtask_date: formData.subtask_date || null,
      };

      const response = await fetch('/api/subtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Subtask created successfully');
        setShowCreateForm(false);
        resetForm();
        fetchSubtasks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create subtask');
      }
    } catch (error) {
      console.error('Failed to create subtask:', error);
      toast.error('Failed to create subtask');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubtask = async () => {
    if (!editingSubtask) return;

    setSubmitting(true);
    try {
      const payload: Partial<Subtask> = {};

      if (formData.subtask_title !== editingSubtask.subtask_title) {
        payload.subtask_title = formData.subtask_title;
      }
      if (formData.subtask_description !== (editingSubtask.subtask_description || '')) {
        payload.subtask_description = formData.subtask_description || null;
      }
      if (parseInt(formData.assigned_to || '0') !== (editingSubtask.assigned_to || 0)) {
        payload.assigned_to = formData.assigned_to ? parseInt(formData.assigned_to) : null;
      }
      if (formData.subtask_status !== editingSubtask.subtask_status) {
        payload.subtask_status = formData.subtask_status;
      }
      if (formData.subtask_comment !== (editingSubtask.subtask_comment || '')) {
        payload.subtask_comment = formData.subtask_comment || null;
      }
      if (formData.subtask_date !== (editingSubtask.subtask_date || '')) {
        payload.subtask_date = formData.subtask_date || null;
      }

      const response = await fetch(`/api/subtasks/${editingSubtask.subtask_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Subtask updated successfully');
        setShowEditForm(false);
        setEditingSubtask(null);
        resetForm();
        fetchSubtasks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update subtask');
      }
    } catch (error) {
      console.error('Failed to update subtask:', error);
      toast.error('Failed to update subtask');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    if (!confirm('Are you sure you want to delete this subtask?')) {
      return;
    }

    try {
      const response = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Subtask deleted successfully');
        fetchSubtasks();
      } else {
        toast.error('Failed to delete subtask');
      }
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      toast.error('Failed to delete subtask');
    }
  };

  const handleEditSubtask = (subtask: Subtask) => {
    setEditingSubtask(subtask);
    setFormData({
      subtask_title: subtask.subtask_title,
      subtask_description: subtask.subtask_description || '',
      assigned_to: subtask.assigned_to?.toString() || '',
      subtask_date: subtask.subtask_date || '',
      subtask_status: subtask.subtask_status,
      subtask_comment: subtask.subtask_comment || '',
    });
    setShowEditForm(true);
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

  const getProgressStats = () => {
    const total = subtasks.length;
    const completed = subtasks.filter((s) => s.subtask_status === 'done').length;
    const inProgress = subtasks.filter((s) => s.subtask_status === 'in_progress').length;
    const todo = subtasks.filter((s) => s.subtask_status === 'todo').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, todo, percentage };
  };

  const stats = getProgressStats();

  return (
    <div className='space-y-4'>
      {/* Header with progress */}
      <div className='flex justify-between items-center'>
        <div>
          <h3 className='text-lg font-semibold'>Subtasks</h3>
          <p className='text-sm text-gray-600'>
            {stats.total} subtasks • {stats.completed} completed ({stats.percentage}%)
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} size='sm'>
          <Plus className='w-4 h-4 mr-2' />
          Add Subtask
        </Button>
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className='bg-green-500 h-2 rounded-full transition-all duration-300'
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>
      )}

      {/* Subtasks list */}
      {loading ? (
        <div className='flex justify-center py-8'>
          <Spinner />
        </div>
      ) : subtasks.length === 0 ? (
        <Card>
          <CardContent className='p-8 text-center'>
            <p className='text-gray-500'>No subtasks yet. Create your first subtask!</p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {subtasks.map((subtask) => (
            <Card key={subtask.subtask_id} className='hover:shadow-md transition-shadow'>
              <CardContent className='p-4'>
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h4 className='font-medium'>{subtask.subtask_title}</h4>
                      {getStatusBadge(subtask.subtask_status)}
                    </div>

                    {subtask.subtask_description && (
                      <p className='text-sm text-gray-600 mb-2'>{subtask.subtask_description}</p>
                    )}

                    <div className='flex items-center gap-4 text-xs text-gray-500'>
                      {subtask.assigned_user_name && (
                        <div className='flex items-center gap-1'>
                          <User className='w-3 h-3' />
                          {subtask.assigned_user_name}
                        </div>
                      )}
                      {subtask.subtask_date && (
                        <div className='flex items-center gap-1'>
                          <Calendar className='w-3 h-3' />
                          {new Date(subtask.subtask_date).toLocaleDateString()}
                        </div>
                      )}
                      <div className='flex items-center gap-1'>
                        <Clock className='w-3 h-3' />
                        {new Date(subtask.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {subtask.subtask_comment && (
                      <div className='mt-2 p-2 bg-gray-50 rounded text-sm'>
                        <strong>Comment:</strong> {subtask.subtask_comment}
                      </div>
                    )}
                  </div>

                  <div className='flex items-center gap-2 ml-4'>
                    <Button variant='ghost' size='sm' onClick={() => handleEditSubtask(subtask)}>
                      <Edit className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDeleteSubtask(subtask.subtask_id)}
                    >
                      <Trash2 className='w-4 h-4 text-red-500' />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Subtask Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Create Subtask</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='subtask_title'>Title *</Label>
              <Input
                id='subtask_title'
                value={formData.subtask_title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtask_title: e.target.value }))
                }
                placeholder='Enter subtask title'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='subtask_description'>Description</Label>
              <Textarea
                id='subtask_description'
                value={formData.subtask_description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtask_description: e.target.value }))
                }
                placeholder='Enter subtask description'
                rows={3}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='assigned_to'>Assigned To</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, assigned_to: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select user' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=''>Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='subtask_date'>Due Date</Label>
                <Input
                  id='subtask_date'
                  type='date'
                  value={formData.subtask_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subtask_date: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubtask} disabled={submitting}>
              {submitting && <Spinner size='sm' className='mr-2' />}
              Create Subtask
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subtask Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Edit Subtask</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit_subtask_title'>Title *</Label>
              <Input
                id='edit_subtask_title'
                value={formData.subtask_title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtask_title: e.target.value }))
                }
                placeholder='Enter subtask title'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit_subtask_description'>Description</Label>
              <Textarea
                id='edit_subtask_description'
                value={formData.subtask_description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtask_description: e.target.value }))
                }
                placeholder='Enter subtask description'
                rows={3}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit_assigned_to'>Assigned To</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, assigned_to: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select user' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=''>Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_subtask_status'>Status</Label>
                <Select
                  value={formData.subtask_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, subtask_status: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='todo'>To Do</SelectItem>
                    <SelectItem value='in_progress'>In Progress</SelectItem>
                    <SelectItem value='done'>Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit_subtask_date'>Due Date</Label>
              <Input
                id='edit_subtask_date'
                type='date'
                value={formData.subtask_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, subtask_date: e.target.value }))}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit_subtask_comment'>Comment</Label>
              <Textarea
                id='edit_subtask_comment'
                value={formData.subtask_comment}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtask_comment: e.target.value }))
                }
                placeholder='Add a comment about this subtask'
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowEditForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubtask} disabled={submitting}>
              {submitting && <Spinner size='sm' className='mr-2' />}
              Update Subtask
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
