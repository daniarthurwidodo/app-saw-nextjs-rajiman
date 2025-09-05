'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { useAppTitle } from '@/hooks/useAppTitle';
import { useState, useEffect } from 'react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z'
        />
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
        />
      </svg>
    ),
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
        />
      </svg>
    ),
  },
  {
    name: 'Users',
    href: '/users',
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
        />
      </svg>
    ),
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        />
      </svg>
    ),
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        />
      </svg>
    ),
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
        />
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const appTitle = useAppTitle();

  useEffect(() => {
    // Mock user data if not authenticated - in real app this would redirect to login
    if (!user) {
      // For demo purposes, using mock data
      setCurrentUser({
        name: 'Admin User',
        email: 'admin@school-system.com',
        role: 'Super Admin',
      });
    } else {
      setCurrentUser(user);
    }
  }, [user]);

  const handleLogout = () => {
    if (user) {
      logout();
    } else {
      // For mock logout, just redirect
      window.location.href = '/login';
    }
  };

  return (
    <div className='flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen'>
      <div className='flex items-center justify-center h-16 px-4 border-b border-gray-200'>
        <h1 className='text-lg font-bold text-gray-800 text-center leading-tight'>{appTitle}</h1>
      </div>

      <nav className='flex-1 px-4 py-4 space-y-2'>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <span className='mr-3'>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className='p-4 border-t border-gray-200'>
        {currentUser && (
          <>
            <div className='flex items-center mb-4'>
              <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-medium'>
                  {currentUser.name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2) || 'U'}
                </span>
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-900'>{currentUser.name || 'User'}</p>
                <p className='text-xs text-gray-500'>{currentUser.email || 'user@example.com'}</p>
                {currentUser.role && (
                  <p className='text-xs text-blue-600 font-medium'>{currentUser.role}</p>
                )}
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='w-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors'
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
