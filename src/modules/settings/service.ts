import { PrismaClient } from '@prisma/client';
import { SettingsResponse, SettingResponse, SettingsError } from './types';

const prisma = new PrismaClient();

type SettingValue = string | number | boolean | object;

function parseSettingValue(value: string): SettingValue {
  const lowercaseValue = value.toLowerCase();

  if (lowercaseValue === 'true' || lowercaseValue === 'false') {
    return lowercaseValue === 'true';
  }

  if (!isNaN(Number(value))) {
    return Number(value);
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export class SettingsService {
  static async getAllSettings(): Promise<SettingsResponse> {
    try {
      const settings = await prisma.appSetting.findMany({
        orderBy: [{ category: 'asc' }, { key: 'asc' }],
      });

      const settingsObject: Record<string, SettingValue> = {};
      for (const setting of settings) {
        settingsObject[setting.key] = parseSettingValue(setting.value || '');
      }

      return {
        success: true,
        message: 'Settings retrieved successfully',
        settings: settingsObject,
      };
    } catch (error) {
      console.error('Get all settings error:', error);
      throw new SettingsError('Failed to get settings', 500);
    }
  }

  static async getSettingsByCategory(category: string): Promise<SettingsResponse> {
    try {
      const settings = await prisma.appSetting.findMany({
        where: { category },
        orderBy: { key: 'asc' },
      });

      const settingsObject: Record<string, SettingValue> = {};
      for (const setting of settings) {
        settingsObject[setting.key] = parseSettingValue(setting.value || '');
      }

      return {
        success: true,
        message: `Settings for category ${category} retrieved successfully`,
        settings: settingsObject,
      };
    } catch (error) {
      console.error('Get settings by category error:', error);
      throw new SettingsError(`Failed to get settings for category ${category}`, 500);
    }
  }

  static async getSetting(key: string): Promise<SettingValue> {
    try {
      const setting = await prisma.appSetting.findUnique({
        where: { key },
      });

      if (!setting) {
        throw new SettingsError(`Setting ${key} not found`, 404);
      }

      return parseSettingValue(setting.value || '');
    } catch (error) {
      if (error instanceof SettingsError) throw error;
      console.error('Get setting error:', error);
      throw new SettingsError(`Failed to get setting ${key}`, 500);
    }
  }

  static async updateSetting(key: string, value: SettingValue): Promise<SettingResponse> {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

      const updatedSetting = await prisma.appSetting.update({
        where: { key },
        data: { value: stringValue },
      });

      return {
        success: true,
        message: `Setting ${key} updated successfully`,
        setting: updatedSetting,
      };
    } catch (error) {
      if (error instanceof SettingsError) throw error;
      console.error('Update setting error:', error);
      throw new SettingsError(`Failed to update setting ${key}`, 500);
    }
  }

  static async updateMultipleSettings(
    updates: Record<string, SettingValue>
  ): Promise<SettingsResponse> {
    try {
      const settingsToUpdate = Object.entries(updates);
      const updatedSettings: Record<string, SettingValue> = {};

      await prisma.$transaction(async (tx: PrismaClient) => {
        for (const [key, value] of settingsToUpdate) {
          const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          await tx.appSetting.update({
            where: { key },
            data: { value: stringValue },
          });
          updatedSettings[key] = value;
        }
      });

      return {
        success: true,
        message: 'Settings updated successfully',
        settings: updatedSettings,
      };
    } catch (error) {
      console.error('Update multiple settings error:', error);
      throw new SettingsError('Failed to update settings', 500);
    }
  }
}
