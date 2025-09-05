import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { UserRole } from '@/types';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest,
  UsersListResponse,
  UserResponse,
  UserFilters,
  PaginationParams,
  UsersError
} from './types';
import { UsersValidator } from './validation';

export class UsersService {
  private static readonly SALT_ROUNDS = 12;

  static async getUsers(
    filters: UserFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<UsersListResponse> {
    try {
      // Start with a simple query for now to avoid parameter issues
      let whereConditions: string[] = ['1=1'];
      const params: any[] = [];

      // Apply filters
      if (filters.role) {
        whereConditions.push('u.role = ?');
        params.push(filters.role);
      }

      if (filters.school_id) {
        whereConditions.push('u.school_id = ?');
        params.push(Number(filters.school_id));
      }

      if (filters.is_active !== undefined) {
        whereConditions.push('u.is_active = ?');
        params.push(filters.is_active ? 1 : 0);
      }

      if (filters.search) {
        whereConditions.push('(u.name LIKE ? OR u.email LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      const whereClause = 'WHERE ' + whereConditions.join(' AND ');

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
      const countResult = await query(countQuery, params) as any[];
      const total = countResult[0].total;

      // Calculate pagination
      const offset = (pagination.page - 1) * pagination.limit;
      const totalPages = Math.ceil(total / pagination.limit);

      // Get users with pagination - separate the parameters clearly
      const usersQuery = `
        SELECT 
          u.user_id,
          u.name,
          u.email,
          u.role,
          u.school_id,
          s.nama_sekolah as school_name,
          u.created_at,
          u.updated_at,
          u.is_active
        FROM users u
        LEFT JOIN schools s ON u.school_id = s.sekolah_id
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `;

      // Create final parameters array with explicit types
      const queryParams = [...params];
      queryParams.push(parseInt(pagination.limit.toString()));
      queryParams.push(parseInt(offset.toString()));

      const users = await query(usersQuery, queryParams) as User[];

      return {
        success: true,
        message: 'Users retrieved successfully',
        users,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages
        }
      };

    } catch (error) {
      console.error('Get users service error:', error);
      throw new UsersError(
        'An error occurred while fetching users',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async getUserById(userId: number): Promise<UserResponse> {
    try {
      const users = await query(`
        SELECT 
          u.user_id,
          u.name,
          u.email,
          u.role,
          u.school_id,
          s.nama_sekolah as school_name,
          u.created_at,
          u.updated_at,
          u.is_active
        FROM users u
        LEFT JOIN schools s ON u.school_id = s.sekolah_id
        WHERE u.user_id = ?
      `, [userId]) as User[];

      if (users.length === 0) {
        throw new UsersError('User not found', 404, 'USER_NOT_FOUND');
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        user: users[0]
      };

    } catch (error) {
      if (error instanceof UsersError) {
        throw error;
      }

      console.error('Get user by id service error:', error);
      throw new UsersError(
        'An error occurred while fetching user',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    try {
      // Validate input
      const validationErrors = UsersValidator.validateCreateUser(userData);
      if (validationErrors.length > 0) {
        throw new UsersError(
          `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Sanitize input
      const sanitizedData = UsersValidator.sanitizeCreateUser(userData);

      // Check if email already exists
      const existingUsers = await query(
        'SELECT email FROM users WHERE email = ?',
        [sanitizedData.email]
      ) as any[];

      if (existingUsers.length > 0) {
        throw new UsersError(
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
          throw new UsersError(
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

      // Get the created user
      const newUser = await this.getUserById(result.insertId);

      return {
        success: true,
        message: 'User created successfully',
        user: newUser.user
      };

    } catch (error) {
      if (error instanceof UsersError) {
        throw error;
      }

      console.error('Create user service error:', error);
      throw new UsersError(
        'An error occurred while creating user',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async updateUser(userId: number, updateData: UpdateUserRequest): Promise<UserResponse> {
    try {
      // Validate input
      const validationErrors = UsersValidator.validateUpdateUser(updateData);
      if (validationErrors.length > 0) {
        throw new UsersError(
          `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Check if user exists
      await this.getUserById(userId);

      // Sanitize input
      const sanitizedData = UsersValidator.sanitizeUpdateUser(updateData);

      // Check if email already exists (if email is being updated)
      if (sanitizedData.email) {
        const existingUsers = await query(
          'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
          [sanitizedData.email, userId]
        ) as any[];

        if (existingUsers.length > 0) {
          throw new UsersError(
            'Email already exists',
            409,
            'EMAIL_EXISTS'
          );
        }
      }

      // Validate school_id if provided
      if (sanitizedData.school_id) {
        const schools = await query(
          'SELECT sekolah_id FROM schools WHERE sekolah_id = ?',
          [sanitizedData.school_id]
        ) as any[];

        if (schools.length === 0) {
          throw new UsersError(
            'Invalid school ID',
            400,
            'INVALID_SCHOOL_ID'
          );
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateParams: any[] = [];

      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key as keyof UpdateUserRequest] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateParams.push(sanitizedData[key as keyof UpdateUserRequest]);
        }
      });

      if (updateFields.length === 0) {
        throw new UsersError(
          'No fields to update',
          400,
          'NO_UPDATE_FIELDS'
        );
      }

      // Add updated_at
      updateFields.push('updated_at = ?');
      updateParams.push(new Date().toISOString().slice(0, 19).replace('T', ' '));

      // Add user ID for WHERE clause
      updateParams.push(userId);

      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE user_id = ?
      `;

      await query(updateQuery, updateParams);

      // Get updated user
      const updatedUser = await this.getUserById(userId);

      return {
        success: true,
        message: 'User updated successfully',
        user: updatedUser.user
      };

    } catch (error) {
      if (error instanceof UsersError) {
        throw error;
      }

      console.error('Update user service error:', error);
      throw new UsersError(
        'An error occurred while updating user',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user exists
      await this.getUserById(userId);

      // Soft delete by setting is_active to false
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      await query(
        'UPDATE users SET is_active = 0, updated_at = ? WHERE user_id = ?',
        [currentTime, userId]
      );

      return {
        success: true,
        message: 'User deleted successfully'
      };

    } catch (error) {
      if (error instanceof UsersError) {
        throw error;
      }

      console.error('Delete user service error:', error);
      throw new UsersError(
        'An error occurred while deleting user',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const users = await query(`
        SELECT 
          u.user_id,
          u.name,
          u.email,
          u.role,
          u.school_id,
          s.nama_sekolah as school_name,
          u.created_at,
          u.updated_at,
          u.is_active
        FROM users u
        LEFT JOIN schools s ON u.school_id = s.sekolah_id
        WHERE u.role = ? AND u.is_active = 1
        ORDER BY u.name
      `, [role]) as User[];

      return users;

    } catch (error) {
      console.error('Get users by role service error:', error);
      throw new UsersError(
        'An error occurred while fetching users by role',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async getUsersBySchool(schoolId: number): Promise<User[]> {
    try {
      const users = await query(`
        SELECT 
          u.user_id,
          u.name,
          u.email,
          u.role,
          u.school_id,
          s.nama_sekolah as school_name,
          u.created_at,
          u.updated_at,
          u.is_active
        FROM users u
        LEFT JOIN schools s ON u.school_id = s.sekolah_id
        WHERE u.school_id = ? AND u.is_active = 1
        ORDER BY u.role, u.name
      `, [schoolId]) as User[];

      return users;

    } catch (error) {
      console.error('Get users by school service error:', error);
      throw new UsersError(
        'An error occurred while fetching users by school',
        500,
        'INTERNAL_ERROR'
      );
    }
  }
}