import { UserRole } from '@/types';

export interface UserProfile {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  school_id: number | null;
  school_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  profile_image?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  profile_image?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

export class ProfileError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'ProfileError';
  }
}
