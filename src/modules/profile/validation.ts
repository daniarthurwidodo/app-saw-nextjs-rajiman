import { UpdateProfileRequest, ChangePasswordRequest, ProfileError } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

export class ProfileValidator {
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

  static validatePhone(phone: string | undefined): ValidationError | null {
    if (phone && phone.length > 0) {
      if (phone.length < 10 || phone.length > 15) {
        return { field: 'phone', message: 'Phone number must be between 10-15 characters' };
      }

      const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,15}$/;
      if (!phoneRegex.test(phone)) {
        return { field: 'phone', message: 'Invalid phone number format' };
      }
    }

    return null;
  }

  static validateAddress(address: string | undefined): ValidationError | null {
    if (address && address.length > 500) {
      return { field: 'address', message: 'Address must not exceed 500 characters' };
    }

    return null;
  }

  static validateBio(bio: string | undefined): ValidationError | null {
    if (bio && bio.length > 1000) {
      return { field: 'bio', message: 'Bio must not exceed 1000 characters' };
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

  static validateUpdateProfile(data: UpdateProfileRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    if (data.name !== undefined) {
      const nameError = this.validateName(data.name);
      if (nameError) errors.push(nameError);
    }

    if (data.email !== undefined) {
      const emailError = this.validateEmail(data.email);
      if (emailError) errors.push(emailError);
    }

    const phoneError = this.validatePhone(data.phone);
    if (phoneError) errors.push(phoneError);

    const addressError = this.validateAddress(data.address);
    if (addressError) errors.push(addressError);

    const bioError = this.validateBio(data.bio);
    if (bioError) errors.push(bioError);

    return errors;
  }

  static validateChangePassword(data: ChangePasswordRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    const currentPasswordError = this.validatePassword(data.currentPassword);
    if (currentPasswordError) {
      errors.push({
        field: 'currentPassword',
        message: 'Current password is required'
      });
    }

    const newPasswordError = this.validatePassword(data.newPassword);
    if (newPasswordError) {
      errors.push({
        field: 'newPassword',
        message: newPasswordError.message.replace('Password', 'New password')
      });
    }

    if (!data.confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        message: 'Password confirmation is required'
      });
    } else if (data.newPassword !== data.confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        message: 'Password confirmation does not match'
      });
    }

    if (data.currentPassword === data.newPassword) {
      errors.push({
        field: 'newPassword',
        message: 'New password must be different from current password'
      });
    }

    return errors;
  }

  static validateUserId(userId: string | number): number {
    const id = typeof userId === 'string' ? parseInt(userId) : userId;
    
    if (isNaN(id) || id <= 0) {
      throw new ProfileError('Invalid user ID', 400, 'INVALID_USER_ID');
    }

    return id;
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static sanitizeUpdateProfile(data: UpdateProfileRequest): UpdateProfileRequest {
    const sanitized: UpdateProfileRequest = {};

    if (data.name !== undefined) {
      sanitized.name = this.sanitizeInput(data.name);
    }

    if (data.email !== undefined) {
      sanitized.email = this.sanitizeInput(data.email.toLowerCase());
    }

    if (data.phone !== undefined) {
      sanitized.phone = data.phone ? this.sanitizeInput(data.phone) : undefined;
    }

    if (data.address !== undefined) {
      sanitized.address = data.address ? this.sanitizeInput(data.address) : undefined;
    }

    if (data.bio !== undefined) {
      sanitized.bio = data.bio ? this.sanitizeInput(data.bio) : undefined;
    }

    if (data.profile_image !== undefined) {
      sanitized.profile_image = data.profile_image;
    }

    return sanitized;
  }
}