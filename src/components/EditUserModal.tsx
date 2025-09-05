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
  school_id?: number;
  school_name?: string;
  is_active: boolean;
}

interface School {
  sekolah_id: number;
  nama_sekolah: string;
}

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess: () => void;
}

export default function EditUserModal({ open, onClose, user, onSuccess }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.USER,
    school_id: '0',
    is_active: true,
  });

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        school_id: user.school_id?.toString() || '0',
        is_active: user.is_active,
      });
    }
  }, [open, user]);

  // Fetch schools when dialog opens
  useEffect(() => {
    if (open) {
      fetchSchools();
    }
  }, [open]);

  const fetchSchools = async () => {
    try {
      // For now, we'll create a simple mock schools list since we don't have schools API yet
      const mockSchools: School[] = [
        { sekolah_id: 1, nama_sekolah: 'SDN 01 Jakarta' },
        { sekolah_id: 2, nama_sekolah: 'SMP 05 Bandung' },
        { sekolah_id: 3, nama_sekolah: 'SMA 03 Surabaya' },
        { sekolah_id: 4, nama_sekolah: 'SDN 12 Medan' },
      ];
      setSchools(mockSchools);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      toast.error('Failed to fetch schools');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        school_id:
          formData.school_id && formData.school_id !== '0' ? parseInt(formData.school_id) : null,
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

          <div className='grid grid-cols-2 gap-4'>
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

            <div className='space-y-2'>
              <Label htmlFor='school'>School</Label>
              <Select
                value={formData.school_id}
                onValueChange={(value) => handleInputChange('school_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select school' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>No school assigned</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school.sekolah_id} value={school.sekolah_id.toString()}>
                      {school.nama_sekolah}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
