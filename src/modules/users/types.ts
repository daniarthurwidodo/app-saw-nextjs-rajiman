import { UserRole } from '@/types';

export interface User {
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

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  school_id?: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  school_id?: number;
  is_active?: boolean;
}

export interface UsersListResponse {
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

export interface UserResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface UserFilters {
  role?: UserRole;
  school_id?: number;
  is_active?: boolean;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export class UsersError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status: number = 400, code: string = 'USERS_ERROR') {
    super(message);
    this.name = 'UsersError';
    this.status = status;
    this.code = code;
  }
}