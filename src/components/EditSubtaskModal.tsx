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
import { Subtask, User, SubtaskStatus } from '@/types';
import { Check, X, Clock, Upload, ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditSubtaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtask: Subtask | null;
  onSuccess?: () => void;
}

interface SubtaskFormData {
  title: string;
  description: string;
  assigned_to: number | null;
  status: SubtaskStatus;
}

export default function EditSubtaskModal({
  open,
  onOpenChange,
  subtask,
  onSuccess,
}: EditSubtaskModalProps) {
  const [formData, setFormData] = useState<SubtaskFormData>({
    title: '',
    description: '',
    assigned_to: null,
    status: SubtaskStatus.TODO,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Load users on mount
  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  // Initialize form data when subtask changes or modal opens
  useEffect(() => {
    if (subtask && open) {
      setFormData({
        title: subtask.title || subtask.subtask_title || '',
        description: subtask.subtask_description || '',
        assigned_to: subtask.assigned_to || null,
        status:
          subtask.status === SubtaskStatus.DONE || subtask.is_completed
            ? SubtaskStatus.DONE
            : subtask.status === SubtaskStatus.IN_PROGRESS
              ? SubtaskStatus.IN_PROGRESS
              : SubtaskStatus.TODO,
      });
      // Reset upload states when modal opens
      setSelectedFiles([]);
      setUploadSuccess(false);
      setUploadingImages(false);
    }
  }, [subtask, open]);

  // Clear states when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedFiles([]);
      setUploadSuccess(false);
      setUploadingImages(false);
    }
  }, [open]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // Updated to 10MB to match API
        toast.error(`${file.name} is larger than 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) selected for upload`);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<void> => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected for upload');
      return;
    }

    if (!subtask?.subtask_id) {
      toast.error('Subtask ID is required for upload');
      return;
    }

    setUploadingImages(true);
    setUploadSuccess(false);

    let successCount = 0;
    let failedFiles: string[] = [];

    try {
      for (const file of selectedFiles) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('subtask_id', subtask.subtask_id.toString());
          formData.append('doc_type', 'documentation'); // Fixed casing
          formData.append('uploaded_by', '1'); // You might want to get this from user context

          const response = await fetch('/api/documentation', {
            method: 'POST',
            body: formData,
          });

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(responseData.message || `Failed to upload ${file.name}`);
          }

          successCount++;
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError);
          failedFiles.push(file.name);
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} image(s) uploaded successfully!`);
        setSelectedFiles([]);
        setUploadSuccess(true);
        // Trigger a refresh of the parent component to show new images
        onSuccess?.();
      }

      if (failedFiles.length > 0) {
        toast.error(`Failed to upload: ${failedFiles.join(', ')}`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== EDIT SUBTASK SUBMIT DEBUG ===');
    console.log('1. Form data:', formData);
    console.log('2. Subtask data:', subtask);

    if (!subtask) {
      console.log('ERROR: No subtask selected');
      toast.error('No subtask selected');
      return;
    }

    if (!formData.title.trim()) {
      console.log('ERROR: Empty title');
      toast.error('Subtask title is required');
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {
        subtask_title: formData.title.trim(),
        subtask_status: formData.status,
      };

      if (formData.description.trim()) {
        updateData.subtask_description = formData.description.trim();
      }

      if (formData.assigned_to !== null) {
        updateData.assigned_to = formData.assigned_to;
      }

      console.log('3. Update data to send:', updateData);
      console.log('4. API URL:', `/api/subtasks/${subtask.subtask_id}`);

      const response = await fetch(`/api/subtasks/${subtask.subtask_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('5. Response status:', response.status);
      console.log('6. Response ok:', response.ok);

      const responseData = await response.json();
      console.log('7. Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update subtask');
      }

      toast.success('Subtask updated successfully!');
      
      // If images were uploaded, mention they should refresh to see them
      if (uploadSuccess) {
        toast.success('Subtask updated! New images are now attached.', { duration: 4000 });
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('8. ERROR updating subtask:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update subtask');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: SubtaskStatus) => {
    switch (status) {
      case SubtaskStatus.DONE:
        return <Check className='h-4 w-4 text-green-600' />;
      case SubtaskStatus.IN_PROGRESS:
        return <Clock className='h-4 w-4 text-blue-600' />;
      case SubtaskStatus.TODO:
        return <Clock className='h-4 w-4 text-orange-600' />;
      default:
        return <Clock className='h-4 w-4 text-gray-600' />;
    }
  };

  const getStatusLabel = (status: SubtaskStatus) => {
    switch (status) {
      case SubtaskStatus.DONE:
        return 'Completed';
      case SubtaskStatus.IN_PROGRESS:
        return 'In Progress';
      case SubtaskStatus.TODO:
        return 'To Do';
      default:
        return 'Unknown';
    }
  };

  if (!subtask) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit Subtask</DialogTitle>
          <DialogDescription>Update subtask details and change its status</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid gap-4'>
            {/* Status */}
            <div>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: SubtaskStatus) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className='flex items-center gap-2'>
                      {getStatusIcon(formData.status)}
                      {getStatusLabel(formData.status)}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SubtaskStatus.TODO}>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-orange-600' />
                      To Do
                    </div>
                  </SelectItem>
                  <SelectItem value={SubtaskStatus.IN_PROGRESS}>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-blue-600' />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value={SubtaskStatus.DONE}>
                    <div className='flex items-center gap-2'>
                      <Check className='h-4 w-4 text-green-600' />
                      Completed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            {/* Image Upload Section */}
            <div>
              <Label>Upload New Images</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="flex-1"
                    disabled={uploadingImages}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={uploadImages}
                    disabled={selectedFiles.length === 0 || uploadingImages}
                  >
                    {uploadingImages ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploadingImages ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>

                {/* Upload success indicator */}
                {uploadSuccess && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-md text-sm">
                    <Check className="h-4 w-4" />
                    Images uploaded successfully! The subtask will show updated images after you close this modal.
                  </div>
                )}

                {/* Selected files preview */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Selected Files ({selectedFiles.length}):</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <ImageIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              ({(file.size / 1024 / 1024).toFixed(1)}MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelectedFile(index)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                            disabled={uploadingImages}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload instructions */}
                <p className="text-xs text-gray-500">
                  Select multiple images (JPG, PNG, GIF, WebP) up to 10MB each. 
                  Images will be attached to this subtask as documentation.
                </p>
              </div>
            </div>

            {/* Show existing images if available */}
            {subtask.images && subtask.images.length > 0 && (
              <div>
                <Label>Existing Images ({subtask.images.length})</Label>
                <div className='grid grid-cols-3 gap-2 mt-2'>
                  {subtask.images.slice(0, 6).map((image) => (
                    <div key={image.image_id} className='relative group'>
                      <img
                        src={image.url}
                        alt={`Subtask image ${image.image_id}`}
                        className='w-full h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity'
                        onClick={() => window.open(image.url, '_blank')}
                        title='Click to view full size'
                      />
                    </div>
                  ))}
                  {subtask.images.length > 6 && (
                    <div className='flex items-center justify-center h-20 bg-gray-100 rounded-md border text-gray-500 text-sm'>
                      +{subtask.images.length - 6} more
                    </div>
                  )}
                </div>
              </div>
            )}
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
                  Updating...
                </>
              ) : (
                'Update Subtask'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
