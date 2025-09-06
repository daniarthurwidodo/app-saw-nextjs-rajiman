'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types';
import { Spinner } from '@/components/ui/spinner';
import EditUserModal from '@/components/EditUserModal';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

interface User {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  school_id?: number;
  school_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface UsersResponse {
  success: boolean;
  message: string;
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.USER as UserRole,
  });

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      if (roleFilter) {
        params.append('role', roleFilter);
      }

      const response = await fetch(`/api/users?${params}`);
      const data: UsersResponse = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      } else {
        setError(data.message);
      }
    } catch (_) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
    // Auto-search when filter changes
    setTimeout(() => fetchUsers(1), 100);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const result = await response.json();

      if (result.success) {
        setIsCreatingUser(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: UserRole.USER,
        });
        fetchUsers(currentPage); // Refresh current page
      } else {
        setError(result.message);
      }
    } catch (_) {
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    fetchUsers(currentPage);
    toast.success('User updated successfully');
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.ADMIN:
        return 'bg-blue-100 text-blue-800';
      case UserRole.KEPALA_SEKOLAH:
        return 'bg-green-100 text-green-800';
      case UserRole.USER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (loading && users.length === 0) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center min-h-64'>
          <div className='text-center space-y-4'>
            <Spinner size='lg' className='mx-auto' />
            <p className='text-gray-500'>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>User Management</h1>
        <Button onClick={() => setIsCreatingUser(true)}>Add New User</Button>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4 items-end'>
            <div className='flex-1'>
              <Label htmlFor='search'>Search Users</Label>
              <Input
                id='search'
                placeholder='Search by name or email...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className='w-48'>
              <Label htmlFor='role'>Filter by Role</Label>
              <select
                id='role'
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className='w-full px-3 py-2 border border-input rounded-md bg-background'
              >
                <option value=''>All Roles</option>
                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.KEPALA_SEKOLAH}>Principal</option>
                <option value={UserRole.USER}>Staff</option>
              </select>
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Users ({users.length} of {totalPages * 10} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left p-2 font-medium'>Name</th>
                  <th className='text-left p-2 font-medium'>Email</th>
                  <th className='text-left p-2 font-medium'>Role</th>
                  <th className='text-left p-2 font-medium'>School</th>
                  <th className='text-left p-2 font-medium'>Status</th>
                  <th className='text-left p-2 font-medium'>Created</th>
                  <th className='text-left p-2 font-medium'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} className='border-b hover:bg-gray-50'>
                    <td className='p-2'>{user.name}</td>
                    <td className='p-2'>{user.email}</td>
                    <td className='p-2'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(user.role)}`}
                      >
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className='p-2'>{user.school_name || user.school_id || '-'}</td>
                    <td className='p-2'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='p-2'>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className='p-2'>
                      <Button size='sm' variant='outline' onClick={() => handleEditUser(user)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center gap-2 mt-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => fetchUsers(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <span className='px-3 py-2 text-sm'>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => fetchUsers(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {isCreatingUser && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className='space-y-4'>
                <div>
                  <Label htmlFor='name'>Full Name</Label>
                  <Input
                    id='name'
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor='password'>Password</Label>
                  <Input
                    id='password'
                    type='password'
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor='role'>Role</Label>
                  <select
                    id='role'
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    className='w-full px-3 py-2 border border-input rounded-md bg-background'
                  >
                    <option value={UserRole.USER}>Staff</option>
                    <option value={UserRole.KEPALA_SEKOLAH}>Principal</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                  </select>
                </div>
                <div className='flex gap-2'>
                  <Button type='submit' disabled={loading}>
                    {loading && <Spinner size='sm' className='mr-2' />}
                    {loading ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button type='button' variant='outline' onClick={() => setIsCreatingUser(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        open={showEditModal}
        onClose={handleCloseEditModal}
        user={editingUser}
        onSuccess={handleEditSuccess}
      />

      <Toaster position='top-right' />
    </div>
  );
}
