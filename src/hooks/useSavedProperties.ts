// ============================================================
// useSavedProperties — Hook for localStorage saved stays
// ============================================================

import { useState, useCallback, useEffect } from 'react';

const SAVED_KEY = 'dbuu_saved';

export function useSavedProperties() {
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]') as string[];
    } catch {
      return [];
    }
  });

  // Sync to localStorage whenever saved changes
  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved]);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  const toggleSave = useCallback((id: string) => {
    setSaved(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }, []);

  const clearAll = useCallback(() => {
    setSaved([]);
  }, []);

  return { saved, isSaved, toggleSave, clearAll };
}
