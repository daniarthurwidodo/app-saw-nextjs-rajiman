'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { Spinner } from './ui/spinner';

interface User {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess: () => void;
}

export default function EditUserModal({ open, onClose, user, onSuccess }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.USER,
    is_active: true,
  });

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      });
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        is_active: formData.is_active,
      };

      const response = await fetch(`/api/users/${user.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('User updated successfully');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Admin';
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.KEPALA_SEKOLAH:
        return 'Principal';
      case UserRole.USER:
        return 'Staff';
      default:
        return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px] bg-white/98 backdrop-blur-md border shadow-xl'>
        <DialogHeader>
          <DialogTitle>Edit User: {user?.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name *</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder='Enter user name'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email *</Label>
            <Input
              id='email'
              type='email'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder='Enter email address'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='role'>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.USER}>{getRoleDisplayName(UserRole.USER)}</SelectItem>
                <SelectItem value={UserRole.KEPALA_SEKOLAH}>
                  {getRoleDisplayName(UserRole.KEPALA_SEKOLAH)}
                </SelectItem>
                <SelectItem value={UserRole.ADMIN}>
                  {getRoleDisplayName(UserRole.ADMIN)}
                </SelectItem>
                <SelectItem value={UserRole.SUPER_ADMIN}>
                  {getRoleDisplayName(UserRole.SUPER_ADMIN)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center space-x-2'>
            <input
              type='checkbox'
              id='is_active'
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className='w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2'
            />
            <Label htmlFor='is_active' className='text-sm'>
              Active User
            </Label>
          </div>

          <DialogFooter className='gap-2'>
            <Button type='button' variant='outline' onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading && <Spinner size='sm' className='mr-2' />}
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
