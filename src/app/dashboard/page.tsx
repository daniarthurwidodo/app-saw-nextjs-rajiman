'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  activeTasks: number;
  completedTasks: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    activeTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        }
      } catch (_) {
        console.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);
  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Qwen Code Dashboard</h1>
        <Button>New Task</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Tasks</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='m22 21-3-3' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold flex items-center'>
              {loading ? <Spinner size='sm' /> : stats.activeTasks}
            </div>
            <p className='text-xs text-muted-foreground'>Tasks in progress or todo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Completed Tasks</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <rect width='20' height='14' x='2' y='5' rx='2' />
              <path d='m9 12 2 2 4-4' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold flex items-center'>
              {loading ? <Spinner size='sm' /> : stats.completedTasks}
            </div>
            <p className='text-xs text-muted-foreground'>Tasks marked as done</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='m22 21-3-3' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold flex items-center'>
              {loading ? <Spinner size='sm' /> : stats.activeUsers}
            </div>
            <p className='text-xs text-muted-foreground'>
              Total active users (
              {loading ? <Spinner size='sm' className='inline' /> : stats.totalUsers} total)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                <div>
                  <p className='font-medium'>Setup New School Registration</p>
                  <p className='text-sm text-muted-foreground'>Assigned to Ahmad Suharto</p>
                </div>
                <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs'>
                  In Progress
                </span>
              </div>
              <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                <div>
                  <p className='font-medium'>Update Student Database</p>
                  <p className='text-sm text-muted-foreground'>Assigned to Maria Santos</p>
                </div>
                <span className='bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs'>
                  Todo
                </span>
              </div>
              <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                <div>
                  <p className='font-medium'>Generate Monthly Report</p>
                  <p className='text-sm text-muted-foreground'>Assigned to John Doe</p>
                </div>
                <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs'>
                  Done
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
