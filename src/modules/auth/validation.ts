import { UserRole } from '@/types';
import { LoginRequest, RegisterRequest, ValidationError } from './types';

export class AuthValidator {
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

  static validateLogin(data: LoginRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    const emailError = this.validateEmail(data.email);
    if (emailError) errors.push(emailError);

    const passwordError = this.validatePassword(data.password);
    if (passwordError) errors.push(passwordError);

    return errors;
  }

  static validateRegister(data: RegisterRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    const nameError = this.validateName(data.name);
    if (nameError) errors.push(nameError);

    const emailError = this.validateEmail(data.email);
    if (emailError) errors.push(emailError);

    const passwordError = this.validatePassword(data.password);
    if (passwordError) errors.push(passwordError);

    const roleError = this.validateRole(data.role);
    if (roleError) errors.push(roleError);

    if (data.school_id !== undefined) {
      if (!Number.isInteger(data.school_id) || data.school_id <= 0) {
        errors.push({ 
          field: 'school_id', 
          message: 'School ID must be a positive integer' 
        });
      }
    }

    return errors;
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static sanitizeLoginInput(data: LoginRequest): LoginRequest {
    return {
      email: this.sanitizeInput(data.email.toLowerCase()),
      password: data.password // Don't sanitize password to preserve original
    };
  }

  static sanitizeRegisterInput(data: RegisterRequest): RegisterRequest {
    return {
      name: this.sanitizeInput(data.name),
      email: this.sanitizeInput(data.email.toLowerCase()),
      password: data.password, // Don't sanitize password
      role: data.role,
      school_id: data.school_id
    };
  }
}