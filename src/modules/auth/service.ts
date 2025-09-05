import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { UserRole } from '@/types';
import { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  RegisterResponse, 
  AuthenticationError 
} from './types';
import { AuthValidator } from './validation';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  static async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      // Validate input
      const validationErrors = AuthValidator.validateLogin(loginData);
      if (validationErrors.length > 0) {
        throw new AuthenticationError(
          `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Sanitize input
      const sanitizedData = AuthValidator.sanitizeLoginInput(loginData);

      // Find user by email
      const users = await query(
        'SELECT * FROM users WHERE email = ? AND is_active = 1',
        [sanitizedData.email]
      ) as any[];

      if (users.length === 0) {
        throw new AuthenticationError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(sanitizedData.password, user.password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Login successful',
        user: userWithoutPassword
      };

    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      console.error('Login service error:', error);
      throw new AuthenticationError(
        'An error occurred during login',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async register(registerData: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Validate input
      const validationErrors = AuthValidator.validateRegister(registerData);
      if (validationErrors.length > 0) {
        throw new AuthenticationError(
          `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Sanitize input
      const sanitizedData = AuthValidator.sanitizeRegisterInput(registerData);

      // Check if user already exists
      const existingUsers = await query(
        'SELECT email FROM users WHERE email = ?',
        [sanitizedData.email]
      ) as any[];

      if (existingUsers.length > 0) {
        throw new AuthenticationError(
          'User with this email already exists',
          409,
          'EMAIL_EXISTS'
        );
      }

      // Validate school_id if provided
      if (sanitizedData.school_id) {
        const schools = await query(
          'SELECT sekolah_id FROM schools WHERE sekolah_id = ?',
          [sanitizedData.school_id]
        ) as any[];

        if (schools.length === 0) {
          throw new AuthenticationError(
            'Invalid school ID',
            400,
            'INVALID_SCHOOL_ID'
          );
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(sanitizedData.password, this.SALT_ROUNDS);
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Insert new user
      const result = await query(
        `INSERT INTO users (name, email, password, role, school_id, created_at, updated_at, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          sanitizedData.name,
          sanitizedData.email,
          hashedPassword,
          sanitizedData.role,
          sanitizedData.school_id || null,
          currentTime,
          currentTime
        ]
      ) as any;

      return {
        success: true,
        message: 'User registered successfully',
        user_id: result.insertId
      };

    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      console.error('Register service error:', error);
      throw new AuthenticationError(
        'An error occurred during registration',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async getUserById(userId: number): Promise<any> {
    try {
      const users = await query(
        'SELECT user_id, name, email, role, school_id, created_at, updated_at, is_active FROM users WHERE user_id = ? AND is_active = 1',
        [userId]
      ) as any[];

      if (users.length === 0) {
        throw new AuthenticationError('User not found', 404, 'USER_NOT_FOUND');
      }

      return users[0];
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      console.error('Get user service error:', error);
      throw new AuthenticationError(
        'An error occurred while fetching user',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async getUserByEmail(email: string): Promise<any> {
    try {
      const sanitizedEmail = AuthValidator.sanitizeInput(email.toLowerCase());
      
      const users = await query(
        'SELECT user_id, name, email, role, school_id, created_at, updated_at, is_active FROM users WHERE email = ? AND is_active = 1',
        [sanitizedEmail]
      ) as any[];

      if (users.length === 0) {
        throw new AuthenticationError('User not found', 404, 'USER_NOT_FOUND');
      }

      return users[0];
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      console.error('Get user by email service error:', error);
      throw new AuthenticationError(
        'An error occurred while fetching user',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    try {
      const passwordError = AuthValidator.validatePassword(newPassword);
      if (passwordError) {
        throw new AuthenticationError(
          passwordError.message,
          400,
          'VALIDATION_ERROR'
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await query(
        'UPDATE users SET password = ?, updated_at = ? WHERE user_id = ? AND is_active = 1',
        [hashedPassword, currentTime, userId]
      );

    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      console.error('Update password service error:', error);
      throw new AuthenticationError(
        'An error occurred while updating password',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async deactivateUser(userId: number): Promise<void> {
    try {
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await query(
        'UPDATE users SET is_active = 0, updated_at = ? WHERE user_id = ?',
        [currentTime, userId]
      );

    } catch (error) {
      console.error('Deactivate user service error:', error);
      throw new AuthenticationError(
        'An error occurred while deactivating user',
        500,
        'INTERNAL_ERROR'
      );
    }
  }
}