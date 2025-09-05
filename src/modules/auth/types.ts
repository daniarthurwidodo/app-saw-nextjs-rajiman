import { UserRole } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  school_id?: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    user_id: number;
    name: string;
    email: string;
    role: UserRole;
    school_id?: number;
    created_at: string;
    updated_at: string;
    is_active: boolean;
  };
  token?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user_id?: number;
}

export interface AuthError {
  message: string;
  code: string;
  status: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class AuthenticationError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status: number = 401, code: string = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthenticationError';
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends Error {
  public status: number;
  public code: string;
  public errors: ValidationError[];

  constructor(message: string, errors: ValidationError[] = [], status: number = 400) {
    super(message);
    this.name = 'ValidationError';
    this.status = status;
    this.code = 'VALIDATION_ERROR';
    this.errors = errors;
  }
}
