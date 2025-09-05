import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ProfileResponse,
  ProfileError,
} from './types';
import { ProfileValidator } from './validation';

export class ProfileService {
  private static readonly SALT_ROUNDS = 12;

  static async getProfile(userId: number): Promise<ProfileResponse> {
    try {
      const users = (await query(
        `
        SELECT 
          u.user_id,
          u.name,
          u.email,
          u.role,
          u.school_id,
          s.nama_sekolah as school_name,
          u.created_at,
          u.updated_at,
          u.is_active,
          u.profile_image,
          u.phone,
          u.address,
          u.bio
        FROM users u
        LEFT JOIN schools s ON u.school_id = s.sekolah_id
        WHERE u.user_id = ? AND u.is_active = 1
      `,
        [userId]
      )) as UserProfile[];

      if (users.length === 0) {
        throw new ProfileError('User not found', 404, 'USER_NOT_FOUND');
      }

      return {
        success: true,
        message: 'Profile retrieved successfully',
        user: users[0],
      };
    } catch (error) {
      if (error instanceof ProfileError) {
        throw error;
      }

      console.error('Get profile service error:', error);
      throw new ProfileError('An error occurred while fetching profile', 500, 'INTERNAL_ERROR');
    }
  }

  static async updateProfile(
    userId: number,
    updateData: UpdateProfileRequest
  ): Promise<ProfileResponse> {
    try {
      // Validate input
      const validationErrors = ProfileValidator.validateUpdateProfile(updateData);
      if (validationErrors.length > 0) {
        throw new ProfileError(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Check if user exists
      await this.getProfile(userId);

      // Sanitize input
      const sanitizedData = ProfileValidator.sanitizeUpdateProfile(updateData);

      // Check if email already exists (if email is being updated)
      if (sanitizedData.email) {
        const existingUsers = (await query(
          'SELECT user_id FROM users WHERE email = ? AND user_id != ? AND is_active = 1',
          [sanitizedData.email, userId]
        )) as any[];

        if (existingUsers.length > 0) {
          throw new ProfileError('Email already exists', 409, 'EMAIL_EXISTS');
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateParams: any[] = [];

      Object.keys(sanitizedData).forEach((key) => {
        if (sanitizedData[key as keyof UpdateProfileRequest] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateParams.push(sanitizedData[key as keyof UpdateProfileRequest]);
        }
      });

      if (updateFields.length === 0) {
        throw new ProfileError('No fields to update', 400, 'NO_UPDATE_FIELDS');
      }

      // Add updated_at
      updateFields.push('updated_at = ?');
      updateParams.push(new Date().toISOString().slice(0, 19).replace('T', ' '));

      // Add user ID for WHERE clause
      updateParams.push(userId);

      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE user_id = ? AND is_active = 1
      `;

      await query(updateQuery, updateParams);

      // Get updated profile
      const updatedProfile = await this.getProfile(userId);

      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedProfile.user,
      };
    } catch (error) {
      if (error instanceof ProfileError) {
        throw error;
      }

      console.error('Update profile service error:', error);
      throw new ProfileError('An error occurred while updating profile', 500, 'INTERNAL_ERROR');
    }
  }

  static async changePassword(
    userId: number,
    passwordData: ChangePasswordRequest
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate input
      const validationErrors = ProfileValidator.validateChangePassword(passwordData);
      if (validationErrors.length > 0) {
        throw new ProfileError(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Get current user with password
      const users = (await query('SELECT password FROM users WHERE user_id = ? AND is_active = 1', [
        userId,
      ])) as any[];

      if (users.length === 0) {
        throw new ProfileError('User not found', 404, 'USER_NOT_FOUND');
      }

      const user = users[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(passwordData.currentPassword, user.password);
      if (!isValidPassword) {
        throw new ProfileError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, this.SALT_ROUNDS);
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Update password
      await query(
        'UPDATE users SET password = ?, updated_at = ? WHERE user_id = ? AND is_active = 1',
        [hashedNewPassword, currentTime, userId]
      );

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      if (error instanceof ProfileError) {
        throw error;
      }

      console.error('Change password service error:', error);
      throw new ProfileError('An error occurred while changing password', 500, 'INTERNAL_ERROR');
    }
  }

  static async uploadProfileImage(userId: number, imagePath: string): Promise<ProfileResponse> {
    try {
      // Check if user exists
      await this.getProfile(userId);

      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await query(
        'UPDATE users SET profile_image = ?, updated_at = ? WHERE user_id = ? AND is_active = 1',
        [imagePath, currentTime, userId]
      );

      // Get updated profile
      const updatedProfile = await this.getProfile(userId);

      return {
        success: true,
        message: 'Profile image updated successfully',
        user: updatedProfile.user,
      };
    } catch (error) {
      if (error instanceof ProfileError) {
        throw error;
      }

      console.error('Upload profile image service error:', error);
      throw new ProfileError(
        'An error occurred while uploading profile image',
        500,
        'INTERNAL_ERROR'
      );
    }
  }
}
