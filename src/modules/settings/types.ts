export type SettingType = 'string' | 'number' | 'boolean' | 'json';

export interface AppSetting {
  setting_id: number;
  setting_key: string;
  setting_value: string;
  setting_type: SettingType;
  description: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingRequest {
  setting_value: string;
}

export interface SettingsResponse {
  success: boolean;
  message: string;
  settings: Record<string, any>;
}

export interface SettingResponse {
  success: boolean;
  message: string;
  setting: AppSetting;
}

export class SettingsError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'SettingsError';
  }
}