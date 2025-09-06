'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task, User } from '@/types';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AddSubtaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSuccess?: () => void;
}

interface SubtaskFormData {
  title: string;
  description: string;
  assigned_to: number | null;
  images: File[];
}

export default function AddSubtaskModal({
  open,
  onOpenChange,
  task,
  onSuccess,
}: AddSubtaskModalProps) {
  const [formData, setFormData] = useState<SubtaskFormData>({
    title: '',
    description: '',
    assigned_to: null,
    images: [],
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Load users on mount
  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        description: '',
        assigned_to: null,
        images: [],
      });
      setImagePreviews([]);
    }
  }, [open, task]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (field: keyof SubtaskFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...validFiles],
      }));

      // Create image previews
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!task) {
      toast.error('No task selected');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Subtask title is required');
      return;
    }

    setLoading(true);

    try {
      // Create subtask first
      const subtaskData: any = {
        relation_task_id: task.task_id,
        subtask_title: formData.title.trim(),
      };

      // Only include description if it's not empty
      if (formData.description.trim()) {
        subtaskData.subtask_description = formData.description.trim();
      }

      // Only include assigned_to if it's not null
      if (formData.assigned_to !== null) {
        subtaskData.assigned_to = formData.assigned_to;
      }

      const response = await fetch('/api/subtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subtaskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Subtask creation failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestData: subtaskData,
        });
        throw new Error(errorData.message || 'Failed to create subtask');
      }

      const result = await response.json();
      const createdSubtask = result.subtask;

      // If there are images, upload them
      if (formData.images.length > 0 && createdSubtask) {
        await uploadImages(createdSubtask.subtask_id);
      }

      toast.success('Subtask created successfully!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating subtask:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create subtask');
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (subtaskId: number) => {
    for (const image of formData.images) {
      try {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('subtask_id', subtaskId.toString());
        formData.append('doc_type', 'documentation');

        const uploadResponse = await fetch('/api/documentation', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          console.warn(`Failed to upload image: ${image.name}`);
        }
      } catch (error) {
        console.warn(`Error uploading image ${image.name}:`, error);
      }
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add Subtask</DialogTitle>
          <DialogDescription>Add a new subtask to &quot;{task.title}&quot;</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid gap-4'>
            {/* Title */}
            <div>
              <Label htmlFor='title'>
                Title <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='title'
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder='Enter subtask title'
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder='Enter subtask description (optional)'
                rows={3}
              />
            </div>

            {/* Assign to User */}
            <div>
              <Label htmlFor='assigned_to'>Assign to</Label>
              <Select
                value={formData.assigned_to?.toString() || 'unassigned'}
                onValueChange={(value) =>
                  handleInputChange('assigned_to', value === 'unassigned' ? null : parseInt(value))
                }
                disabled={loadingUsers}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loadingUsers ? 'Loading users...' : 'Select a user (optional)'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='unassigned'>Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id.toString()}>
                      {user.name} ({user.role.replace('_', ' ')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor='images'>Images</Label>
              <div className='space-y-2'>
                <div className='flex items-center justify-center w-full'>
                  <label
                    htmlFor='images'
                    className='flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'
                  >
                    <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                      <Upload className='w-8 h-8 mb-4 text-gray-500' />
                      <p className='mb-2 text-sm text-gray-500'>
                        <span className='font-semibold'>Click to upload</span> or drag and drop
                      </p>
                      <p className='text-xs text-gray-500'>PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      id='images'
                      type='file'
                      className='hidden'
                      multiple
                      accept='image/*'
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className='grid grid-cols-2 gap-4 mt-4'>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className='relative group'>
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className='w-full h-24 object-cover rounded-md border'
                        />
                        <button
                          type='button'
                          onClick={() => removeImage(index)}
                          className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <X className='h-3 w-3' />
                        </button>
                        <div className='absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded'>
                          {formData.images[index]?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                  Creating...
                </>
              ) : (
                'Create Subtask'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
