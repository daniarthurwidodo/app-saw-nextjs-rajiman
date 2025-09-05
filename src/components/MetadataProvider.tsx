'use client';

import { useAppTitle } from '@/hooks/useAppTitle';
import { useEffect } from 'react';

export default function MetadataProvider() {
  const title = useAppTitle();

  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}
