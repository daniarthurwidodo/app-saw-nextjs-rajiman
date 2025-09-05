'use client';

import { useEffect, useState } from 'react';
import { useSettings } from './useSettings';

export function useAppTitle() {
  const { settings } = useSettings();
  const [title, setTitle] = useState('School Management System');

  useEffect(() => {
    if (settings?.site_name) {
      setTitle(settings.site_name);
    }
  }, [settings]);

  return title;
}
