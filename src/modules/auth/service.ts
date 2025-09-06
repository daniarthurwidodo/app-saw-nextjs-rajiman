import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { UserRole } from '@/types';
import logger from '@/lib/logger';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  AuthenticationError,
} from './types';
import { AuthValidator } from './validation';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  static async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      logger.info({ email: loginData.email }, 'Login attempt started');

      // Validate input
      const validationErrors = AuthValidator.validateLogin(loginData);
      if (validationErrors.length > 0) {
        logger.warn(
          {
            email: loginData.email,
            errors: validationErrors.map((e) => e.message),
          },
          'Login validation failed'
        );

        throw new AuthenticationError(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Sanitize input
      const sanitizedData = AuthValidator.sanitizeLoginInput(loginData);

      // Find user by email
      logger.debug({ email: sanitizedData.email }, 'Querying user by email');
      const users = (await query('SELECT * FROM users WHERE email = ? AND is_active = 1', [
        sanitizedData.email,
      ])) as any[];

      if (users.length === 0) {
        logger.warn({ email: sanitizedData.email }, 'Login failed - user not found');
        throw new AuthenticationError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const user = users[0];

      // Verify password
      logger.debug({ userId: user.user_id }, 'Verifying password');
      const isValidPassword = await bcrypt.compare(sanitizedData.password, user.password);
      if (!isValidPassword) {
        logger.warn({ userId: user.user_id }, 'Login failed - invalid password');
        throw new AuthenticationError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      logger.info({ userId: user.user_id, email: user.email }, 'Login successful');
      return {
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        logger.warn(
          {
            email: loginData.email,
            error: error.message,
            code: error.code,
          },
          'Authentication error'
        );
        throw error;
      }

      logger.error(
        {
          email: loginData.email,
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
        'Unexpected error during login'
      );
      throw new AuthenticationError('An error occurred during login', 500, 'INTERNAL_ERROR');
    }
  }

  static async register(registerData: RegisterRequest): Promise<RegisterResponse> {
    try {
      logger.info({ email: registerData.email }, 'Registration attempt started');

      // Validate input
      const validationErrors = AuthValidator.validateRegister(registerData);
      if (validationErrors.length > 0) {
        logger.warn(
          {
            email: registerData.email,
            errors: validationErrors.map((e) => e.message),
          },
          'Registration validation failed'
        );

        throw new AuthenticationError(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Sanitize input
      const sanitizedData = AuthValidator.sanitizeRegisterInput(registerData);

      // Check if user already exists
      logger.debug({ email: sanitizedData.email }, 'Checking if user already exists');
      const existingUsers = (await query('SELECT email FROM users WHERE email = ?', [
        sanitizedData.email,
      ])) as any[];

      if (existingUsers.length > 0) {
        logger.warn({ email: sanitizedData.email }, 'Registration failed - email already exists');
        throw new AuthenticationError('User with this email already exists', 409, 'EMAIL_EXISTS');
      }

      // Validate school_id if provided
      if (sanitizedData.school_id) {
        logger.debug({ schoolId: sanitizedData.school_id }, 'Validating school ID');
        const schools = (await query('SELECT sekolah_id FROM schools WHERE sekolah_id = ?', [
          sanitizedData.school_id,
        ])) as any[];

        if (schools.length === 0) {
          logger.warn(
            { schoolId: sanitizedData.school_id },
            'Registration failed - invalid school ID'
          );
          throw new AuthenticationError('Invalid school ID', 400, 'INVALID_SCHOOL_ID');
        }
      }

      // Hash password
      logger.debug({ email: sanitizedData.email }, 'Hashing password');
      const hashedPassword = await bcrypt.hash(sanitizedData.password, this.SALT_ROUNDS);
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Insert new user
      logger.debug({ email: sanitizedData.email }, 'Inserting new user');
      const result = (await query(
        `INSERT INTO users (name, email, password, role, school_id, created_at, updated_at, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          sanitizedData.name,
          sanitizedData.email,
          hashedPassword,
          sanitizedData.role,
          sanitizedData.school_id || null,
          currentTime,
          currentTime,
        ]
      )) as any;

      logger.info(
        {
          userId: result.insertId,
          email: sanitizedData.email,
        },
        'User registered successfully'
      );

      return {
        success: true,
        message: 'User registered successfully',
        user_id: result.insertId,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        logger.warn(
          {
            email: registerData.email,
            error: error.message,
            code: error.code,
          },
          'Registration error'
        );
        throw error;
      }

      logger.error(
        {
          email: registerData.email,
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
        'Unexpected error during registration'
      );
      throw new AuthenticationError('An error occurred during registration', 500, 'INTERNAL_ERROR');
    }
  }

  static async getUserById(userId: number): Promise<any> {
    try {
      logger.debug({ userId }, 'Fetching user by ID');

      const users = (await query(
        'SELECT user_id, name, email, role, school_id, created_at, updated_at, is_active FROM users WHERE user_id = ? AND is_active = 1',
        [userId]
      )) as any[];

      if (users.length === 0) {
        logger.warn({ userId }, 'User not found');
        throw new AuthenticationError('User not found', 404, 'USER_NOT_FOUND');
      }

      logger.debug({ userId }, 'User fetched successfully');
      return users[0];
    } catch (error) {
      if (error instanceof AuthenticationError) {
        logger.warn(
          {
            userId,
            error: error.message,
            code: error.code,
          },
          'Error fetching user by ID'
        );
        throw error;
      }

      logger.error(
        {
          userId,
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
        'Unexpected error while fetching user by ID'
      );
      throw new AuthenticationError('An error occurred while fetching user', 500, 'INTERNAL_ERROR');
    }
  }

  static async getUserByEmail(email: string): Promise<any> {
    try {
      const sanitizedEmail = AuthValidator.sanitizeInput(email.toLowerCase());
      logger.debug({ email: sanitizedEmail }, 'Fetching user by email');

      const users = (await query(
        'SELECT user_id, name, email, role, school_id, created_at, updated_at, is_active FROM users WHERE email = ? AND is_active = 1',
        [sanitizedEmail]
      )) as any[];

      if (users.length === 0) {
        logger.warn({ email: sanitizedEmail }, 'User not found by email');
        throw new AuthenticationError('User not found', 404, 'USER_NOT_FOUND');
      }

      logger.debug(
        { email: sanitizedEmail, userId: users[0].user_id },
        'User fetched by email successfully'
      );
      return users[0];
    } catch (error) {
      if (error instanceof AuthenticationError) {
        logger.warn(
          {
            email,
            error: error.message,
            code: error.code,
          },
          'Error fetching user by email'
        );
        throw error;
      }

      logger.error(
        {
          email,
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
        'Unexpected error while fetching user by email'
      );
      throw new AuthenticationError('An error occurred while fetching user', 500, 'INTERNAL_ERROR');
    }
  }

  static async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    try {
      logger.info({ userId }, 'Password update attempt started');

      const passwordError = AuthValidator.validatePassword(newPassword);
      if (passwordError) {
        logger.warn({ userId, error: passwordError.message }, 'Password validation failed');
        throw new AuthenticationError(passwordError.message, 400, 'VALIDATION_ERROR');
      }

      logger.debug({ userId }, 'Hashing new password');
      const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      logger.debug({ userId }, 'Updating user password');
      await query(
        'UPDATE users SET password = ?, updated_at = ? WHERE user_id = ? AND is_active = 1',
        [hashedPassword, currentTime, userId]
      );

      logger.info({ userId }, 'Password updated successfully');
    } catch (error) {
      if (error instanceof AuthenticationError) {
        logger.warn(
          {
            userId,
            error: error.message,
            code: error.code,
          },
          'Password update error'
        );
        throw error;
      }

      logger.error(
        {
          userId,
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
        'Unexpected error while updating password'
      );
      throw new AuthenticationError(
        'An error occurred while updating password',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async deactivateUser(userId: number): Promise<void> {
    try {
      logger.info({ userId }, 'User deactivation attempt started');

      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      logger.debug({ userId }, 'Deactivating user');
      await query('UPDATE users SET is_active = 0, updated_at = ? WHERE user_id = ?', [
        currentTime,
        userId,
      ]);

      logger.info({ userId }, 'User deactivated successfully');
    } catch (error) {
      logger.error(
        {
          userId,
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
        'Unexpected error while deactivating user'
      );
      throw new AuthenticationError(
        'An error occurred while deactivating user',
        500,
        'INTERNAL_ERROR'
      );
    }
  }
}
