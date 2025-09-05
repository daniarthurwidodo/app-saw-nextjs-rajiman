import { UserRole } from '@/types';
import { CreateUserRequest, UpdateUserRequest, UserFilters, UsersError } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

export class UsersValidator {
  static validateEmail(email: string): ValidationError | null {
    if (!email) {
      return { field: 'email', message: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { field: 'email', message: 'Invalid email format' };
    }

    if (email.length > 255) {
      return { field: 'email', message: 'Email must not exceed 255 characters' };
    }

    return null;
  }

  static validateName(name: string): ValidationError | null {
    if (!name) {
      return { field: 'name', message: 'Name is required' };
    }

    if (name.trim().length < 2) {
      return { field: 'name', message: 'Name must be at least 2 characters long' };
    }

    if (name.length > 255) {
      return { field: 'name', message: 'Name must not exceed 255 characters' };
    }

    return null;
  }

  static validatePassword(password: string): ValidationError | null {
    if (!password) {
      return { field: 'password', message: 'Password is required' };
    }

    if (password.length < 6) {
      return { field: 'password', message: 'Password must be at least 6 characters long' };
    }

    if (password.length > 255) {
      return { field: 'password', message: 'Password must not exceed 255 characters' };
    }

    return null;
  }

  static validateRole(role: string): ValidationError | null {
    if (!role) {
      return { field: 'role', message: 'Role is required' };
    }

    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
      return { 
        field: 'role', 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      };
    }

    return null;
  }

  static validateSchoolId(schoolId: number | undefined): ValidationError | null {
    if (schoolId !== undefined) {
      if (!Number.isInteger(schoolId) || schoolId <= 0) {
        return { 
          field: 'school_id', 
          message: 'School ID must be a positive integer' 
        };
      }
    }

    return null;
  }

  static validateCreateUser(data: CreateUserRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    const nameError = this.validateName(data.name);
    if (nameError) errors.push(nameError);

    const emailError = this.validateEmail(data.email);
    if (emailError) errors.push(emailError);

    const passwordError = this.validatePassword(data.password);
    if (passwordError) errors.push(passwordError);

    const roleError = this.validateRole(data.role);
    if (roleError) errors.push(roleError);

    const schoolIdError = this.validateSchoolId(data.school_id);
    if (schoolIdError) errors.push(schoolIdError);

    return errors;
  }

  static validateUpdateUser(data: UpdateUserRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    if (data.name !== undefined) {
      const nameError = this.validateName(data.name);
      if (nameError) errors.push(nameError);
    }

    if (data.email !== undefined) {
      const emailError = this.validateEmail(data.email);
      if (emailError) errors.push(emailError);
    }

    if (data.role !== undefined) {
      const roleError = this.validateRole(data.role);
      if (roleError) errors.push(roleError);
    }

    const schoolIdError = this.validateSchoolId(data.school_id);
    if (schoolIdError) errors.push(schoolIdError);

    if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
      errors.push({ 
        field: 'is_active', 
        message: 'is_active must be a boolean value' 
      });
    }

    return errors;
  }

  static validateUserId(userId: string | number): number {
    const id = typeof userId === 'string' ? parseInt(userId) : userId;
    
    if (isNaN(id) || id <= 0) {
      throw new UsersError('Invalid user ID', 400, 'INVALID_USER_ID');
    }

    return id;
  }

  static validatePagination(page: string | number = 1, limit: string | number = 10): { page: number; limit: number } {
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;

    const validatedPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const validatedLimit = isNaN(limitNum) || limitNum < 1 ? 10 : Math.min(limitNum, 100); // Max 100 per page

    return { page: validatedPage, limit: validatedLimit };
  }

  static validateFilters(filters: any): UserFilters {
    const validatedFilters: UserFilters = {};

    if (filters.role) {
      const validRoles = Object.values(UserRole);
      if (validRoles.includes(filters.role)) {
        validatedFilters.role = filters.role;
      }
    }

    if (filters.school_id) {
      const schoolId = parseInt(filters.school_id);
      if (!isNaN(schoolId) && schoolId > 0) {
        validatedFilters.school_id = schoolId;
      }
    }

    if (filters.is_active !== undefined) {
      if (filters.is_active === 'true' || filters.is_active === true) {
        validatedFilters.is_active = true;
      } else if (filters.is_active === 'false' || filters.is_active === false) {
        validatedFilters.is_active = false;
      }
    }

    if (filters.search && typeof filters.search === 'string') {
      validatedFilters.search = filters.search.trim();
    }

    return validatedFilters;
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static sanitizeCreateUser(data: CreateUserRequest): CreateUserRequest {
    return {
      name: this.sanitizeInput(data.name),
      email: this.sanitizeInput(data.email.toLowerCase()),
      password: data.password, // Don't sanitize password
      role: data.role,
      school_id: data.school_id
    };
  }

  static sanitizeUpdateUser(data: UpdateUserRequest): UpdateUserRequest {
    const sanitized: UpdateUserRequest = {};

    if (data.name !== undefined) {
      sanitized.name = this.sanitizeInput(data.name);
    }

    if (data.email !== undefined) {
      sanitized.email = this.sanitizeInput(data.email.toLowerCase());
    }

    if (data.role !== undefined) {
      sanitized.role = data.role;
    }

    if (data.school_id !== undefined) {
      sanitized.school_id = data.school_id;
    }

    if (data.is_active !== undefined) {
      sanitized.is_active = data.is_active;
    }

    return sanitized;
  }
}