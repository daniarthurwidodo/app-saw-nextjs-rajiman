'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { BarChart3, PieChart, TrendingUp, Users, Calendar, Download } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  activeTasks: number;
  completedTasks: number;
}

interface TaskStats {
  todo: number;
  in_progress: number;
  done: number;
}

interface UserStats {
  super_admin: number;
  admin: number;
  kepala_sekolah: number;
  user: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    activeTasks: 0,
    completedTasks: 0,
  });
  const [taskStats, setTaskStats] = useState<TaskStats>({
    todo: 0,
    in_progress: 0,
    done: 0,
  });
  const [userStats, setUserStats] = useState<UserStats>({
    super_admin: 0,
    admin: 0,
    kepala_sekolah: 0,
    user: 0,
  });
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchReportsData();
  }, [selectedPeriod]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const dashboardResponse = await fetch('/api/dashboard/stats');
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        if (dashboardData.success) {
          setDashboardStats(dashboardData.data);
        }
      }

      // Fetch task stats from Kanban endpoint
      const tasksResponse = await fetch('/api/tasks/kanban');
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        if (tasksData.success) {
          setTaskStats({
            todo: tasksData.tasks.todo.length,
            in_progress: tasksData.tasks.in_progress.length,
            done: tasksData.tasks.done.length,
          });
        }
      }

      // Mock user role stats (you can replace with real API)
      setUserStats({
        super_admin: 1,
        admin: 3,
        kepala_sekolah: 5,
        user: dashboardStats.totalUsers - 9,
      });
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    // Mock export functionality
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  const getTaskCompletionRate = () => {
    const total = taskStats.todo + taskStats.in_progress + taskStats.done;
    return total > 0 ? Math.round((taskStats.done / total) * 100) : 0;
  };

  const getUserActivationRate = () => {
    return dashboardStats.totalUsers > 0
      ? Math.round((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100)
      : 0;
  };

  if (loading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center min-h-64'>
          <div className='text-center space-y-4'>
            <Spinner size='lg' className='mx-auto' />
            <p className='text-gray-500'>Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Reports & Analytics</h1>
          <p className='text-gray-600 mt-1'>System performance and usage statistics</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => handleExportReport('pdf')}>
            <Download className='w-4 h-4 mr-2' />
            Export PDF
          </Button>
          <Button variant='outline' onClick={() => handleExportReport('excel')}>
            <Download className='w-4 h-4 mr-2' />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='w-5 h-5' />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label>Time Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='7d'>Last 7 days</SelectItem>
                  <SelectItem value='30d'>Last 30 days</SelectItem>
                  <SelectItem value='90d'>Last 3 months</SelectItem>
                  <SelectItem value='1y'>Last year</SelectItem>
                  <SelectItem value='custom'>Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPeriod === 'custom' && (
              <>
                <div className='space-y-2'>
                  <Label>Start Date</Label>
                  <Input
                    type='date'
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>End Date</Label>
                  <Input
                    type='date'
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Users</p>
                <p className='text-3xl font-bold'>{dashboardStats.totalUsers}</p>
                <p className='text-sm text-green-600'>{getUserActivationRate()}% active</p>
              </div>
              <Users className='w-8 h-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Active Tasks</p>
                <p className='text-3xl font-bold'>{dashboardStats.activeTasks}</p>
                <p className='text-sm text-blue-600'>
                  {dashboardStats.activeTasks + dashboardStats.completedTasks} total
                </p>
              </div>
              <BarChart3 className='w-8 h-8 text-green-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Completion Rate</p>
                <p className='text-3xl font-bold'>{getTaskCompletionRate()}%</p>
                <p className='text-sm text-green-600'>{taskStats.done} completed</p>
              </div>
              <TrendingUp className='w-8 h-8 text-purple-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>System Health</p>
                <p className='text-3xl font-bold'>98%</p>
                <p className='text-sm text-green-600'>Excellent</p>
              </div>
              <PieChart className='w-8 h-8 text-orange-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Reports */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>To Do</span>
                <div className='flex items-center gap-2'>
                  <div className='w-32 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full'
                      style={{
                        width: `${(taskStats.todo / Math.max(taskStats.todo + taskStats.in_progress + taskStats.done, 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className='text-sm w-8'>{taskStats.todo}</span>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>In Progress</span>
                <div className='flex items-center gap-2'>
                  <div className='w-32 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-yellow-500 h-2 rounded-full'
                      style={{
                        width: `${(taskStats.in_progress / Math.max(taskStats.todo + taskStats.in_progress + taskStats.done, 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className='text-sm w-8'>{taskStats.in_progress}</span>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Done</span>
                <div className='flex items-center gap-2'>
                  <div className='w-32 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-500 h-2 rounded-full'
                      style={{
                        width: `${(taskStats.done / Math.max(taskStats.todo + taskStats.in_progress + taskStats.done, 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className='text-sm w-8'>{taskStats.done}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Staff</span>
                <div className='flex items-center gap-2'>
                  <div className='w-32 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-gray-500 h-2 rounded-full'
                      style={{
                        width: `${(userStats.user / Math.max(dashboardStats.totalUsers, 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className='text-sm w-8'>{userStats.user}</span>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Principals</span>
                <div className='flex items-center gap-2'>
                  <div className='w-32 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-500 h-2 rounded-full'
                      style={{
                        width: `${(userStats.kepala_sekolah / Math.max(dashboardStats.totalUsers, 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className='text-sm w-8'>{userStats.kepala_sekolah}</span>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Admins</span>
                <div className='flex items-center gap-2'>
                  <div className='w-32 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full'
                      style={{
                        width: `${(userStats.admin / Math.max(dashboardStats.totalUsers, 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className='text-sm w-8'>{userStats.admin}</span>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Super Admins</span>
                <div className='flex items-center gap-2'>
                  <div className='w-32 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-red-500 h-2 rounded-full'
                      style={{
                        width: `${(userStats.super_admin / Math.max(dashboardStats.totalUsers, 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className='text-sm w-8'>{userStats.super_admin}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left p-3 font-medium'>Metric</th>
                  <th className='text-left p-3 font-medium'>Current Value</th>
                  <th className='text-left p-3 font-medium'>Previous Period</th>
                  <th className='text-left p-3 font-medium'>Change</th>
                  <th className='text-left p-3 font-medium'>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-b hover:bg-gray-50'>
                  <td className='p-3'>Total Users</td>
                  <td className='p-3 font-semibold'>{dashboardStats.totalUsers}</td>
                  <td className='p-3'>{Math.max(0, dashboardStats.totalUsers - 2)}</td>
                  <td className='p-3 text-green-600'>+2</td>
                  <td className='p-3'>
                    <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                      Growing
                    </span>
                  </td>
                </tr>
                <tr className='border-b hover:bg-gray-50'>
                  <td className='p-3'>Active Tasks</td>
                  <td className='p-3 font-semibold'>{dashboardStats.activeTasks}</td>
                  <td className='p-3'>{Math.max(0, dashboardStats.activeTasks - 1)}</td>
                  <td className='p-3 text-green-600'>+1</td>
                  <td className='p-3'>
                    <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
                      Active
                    </span>
                  </td>
                </tr>
                <tr className='border-b hover:bg-gray-50'>
                  <td className='p-3'>Completed Tasks</td>
                  <td className='p-3 font-semibold'>{dashboardStats.completedTasks}</td>
                  <td className='p-3'>{Math.max(0, dashboardStats.completedTasks - 5)}</td>
                  <td className='p-3 text-green-600'>+5</td>
                  <td className='p-3'>
                    <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                      Improving
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
