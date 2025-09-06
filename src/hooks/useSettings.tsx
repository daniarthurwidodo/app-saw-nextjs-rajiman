'use client';

import { useState, useEffect } from 'react';

interface AppSettings {
  app_name?: string;
  app_description?: string;
  admin_email?: string;
  timezone?: string;
  date_format?: string;
  language?: string;
  theme?: string;
  [key: string]: any;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/settings');
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      } else {
        setError(data.message || 'Failed to fetch settings');
        // Use default settings if API fails
        setSettings({
          app_name: 'Qwen Code - School Management System',
          app_description: 'A comprehensive school management and task tracking system',
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setError('Failed to fetch settings');
      // Use default settings if API fails
      setSettings({
        app_name: 'Qwen Code - School Management System',
        app_description: 'A comprehensive school management and task tracking system',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Record<string, any>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      return { success: false, message: 'Failed to update settings' };
    }
  };

  const getSetting = (key: string, defaultValue?: any) => {
    return settings[key] ?? defaultValue;
  };

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    getSetting,
  };
}
