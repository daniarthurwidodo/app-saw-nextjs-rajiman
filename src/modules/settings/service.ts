import { query } from '@/lib/db';
import { 
  AppSetting, 
  UpdateSettingRequest,
  SettingsResponse,
  SettingResponse,
  SettingsError 
} from './types';

export class SettingsService {
  static async getAllSettings(): Promise<SettingsResponse> {
    try {
      const settings = await query(
        'SELECT * FROM app_settings ORDER BY category, setting_key'
      ) as AppSetting[];

      // Convert to key-value object with proper type conversion
      const settingsObject: Record<string, any> = {};
      
      settings.forEach(setting => {
        let value: any = setting.setting_value;
        
        // Convert based on type
        switch (setting.setting_type) {
          case 'number':
            value = parseFloat(setting.setting_value);
            break;
          case 'boolean':
            value = setting.setting_value.toLowerCase() === 'true';
            break;
          case 'json':
            try {
              value = JSON.parse(setting.setting_value);
            } catch {
              value = setting.setting_value;
            }
            break;
          // 'string' type remains as is
        }
        
        settingsObject[setting.setting_key] = value;
      });

      return {
        success: true,
        message: 'Settings retrieved successfully',
        settings: settingsObject
      };

    } catch (error) {
      console.error('Get settings service error:', error);
      throw new SettingsError(
        'An error occurred while fetching settings',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async getSettingsByCategory(category: string): Promise<SettingsResponse> {
    try {
      const settings = await query(
        'SELECT * FROM app_settings WHERE category = ? ORDER BY setting_key',
        [category]
      ) as AppSetting[];

      const settingsObject: Record<string, any> = {};
      
      settings.forEach(setting => {
        let value: any = setting.setting_value;
        
        switch (setting.setting_type) {
          case 'number':
            value = parseFloat(setting.setting_value);
            break;
          case 'boolean':
            value = setting.setting_value.toLowerCase() === 'true';
            break;
          case 'json':
            try {
              value = JSON.parse(setting.setting_value);
            } catch {
              value = setting.setting_value;
            }
            break;
        }
        
        settingsObject[setting.setting_key] = value;
      });

      return {
        success: true,
        message: `Settings for ${category} retrieved successfully`,
        settings: settingsObject
      };

    } catch (error) {
      console.error('Get settings by category service error:', error);
      throw new SettingsError(
        'An error occurred while fetching settings',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async getSetting(key: string): Promise<any> {
    try {
      const settings = await query(
        'SELECT * FROM app_settings WHERE setting_key = ?',
        [key]
      ) as AppSetting[];

      if (settings.length === 0) {
        throw new SettingsError(`Setting '${key}' not found`, 404, 'SETTING_NOT_FOUND');
      }

      const setting = settings[0];
      let value: any = setting.setting_value;

      // Convert based on type
      switch (setting.setting_type) {
        case 'number':
          value = parseFloat(setting.setting_value);
          break;
        case 'boolean':
          value = setting.setting_value.toLowerCase() === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(setting.setting_value);
          } catch {
            value = setting.setting_value;
          }
          break;
      }

      return value;

    } catch (error) {
      if (error instanceof SettingsError) {
        throw error;
      }

      console.error('Get setting service error:', error);
      throw new SettingsError(
        'An error occurred while fetching setting',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async updateSetting(key: string, value: any): Promise<SettingResponse> {
    try {
      // Check if setting exists
      const existingSettings = await query(
        'SELECT * FROM app_settings WHERE setting_key = ?',
        [key]
      ) as AppSetting[];

      if (existingSettings.length === 0) {
        throw new SettingsError(`Setting '${key}' not found`, 404, 'SETTING_NOT_FOUND');
      }

      const setting = existingSettings[0];
      let stringValue: string;

      // Convert value to string based on type
      switch (setting.setting_type) {
        case 'number':
          stringValue = value.toString();
          break;
        case 'boolean':
          stringValue = value ? 'true' : 'false';
          break;
        case 'json':
          stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          break;
        default:
          stringValue = value.toString();
      }

      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Update the setting
      await query(
        'UPDATE app_settings SET setting_value = ?, updated_at = ? WHERE setting_key = ?',
        [stringValue, currentTime, key]
      );

      // Get updated setting
      const updatedSettings = await query(
        'SELECT * FROM app_settings WHERE setting_key = ?',
        [key]
      ) as AppSetting[];

      return {
        success: true,
        message: 'Setting updated successfully',
        setting: updatedSettings[0]
      };

    } catch (error) {
      if (error instanceof SettingsError) {
        throw error;
      }

      console.error('Update setting service error:', error);
      throw new SettingsError(
        'An error occurred while updating setting',
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  static async updateMultipleSettings(updates: Record<string, any>): Promise<SettingsResponse> {
    try {
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Update each setting
      for (const [key, value] of Object.entries(updates)) {
        // Get setting type first
        const existingSettings = await query(
          'SELECT setting_type FROM app_settings WHERE setting_key = ?',
          [key]
        ) as Pick<AppSetting, 'setting_type'>[];

        if (existingSettings.length > 0) {
          let stringValue: string;
          const settingType = existingSettings[0].setting_type;

          switch (settingType) {
            case 'number':
              stringValue = value.toString();
              break;
            case 'boolean':
              stringValue = value ? 'true' : 'false';
              break;
            case 'json':
              stringValue = typeof value === 'string' ? value : JSON.stringify(value);
              break;
            default:
              stringValue = value.toString();
          }

          await query(
            'UPDATE app_settings SET setting_value = ?, updated_at = ? WHERE setting_key = ?',
            [stringValue, currentTime, key]
          );
        }
      }

      // Return updated settings
      return await this.getAllSettings();

    } catch (error) {
      console.error('Update multiple settings service error:', error);
      throw new SettingsError(
        'An error occurred while updating settings',
        500,
        'INTERNAL_ERROR'
      );
    }
  }
}