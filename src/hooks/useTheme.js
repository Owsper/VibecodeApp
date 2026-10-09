/**
 * useTheme — manages the light/dark preference.
 *
 * The initial class on <html> is applied by an inline script in
 * index.html to avoid a flash. This hook keeps React state in sync
 * with the persisted preference and exposes a setTheme API.
 */

import { useCallback, useEffect, useState } from 'react';
import { loadPrefs, savePrefs } from '../utils/storage.js';

function readInitialTheme() {
  try {
    return loadPrefs().theme === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#06070c' : '#f7f7fb');
    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    const safe = next === 'light' ? 'light' : 'dark';
    setThemeState(safe);
    try {
      savePrefs({ ...loadPrefs(), theme: safe });
    } catch {
      /* no-op */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try {
        savePrefs({ ...loadPrefs(), theme: next });
      } catch {
        /* no-op */
      }
      return next;
    });
  }, []);

  return { theme, setTheme, toggleTheme };
}

export default useTheme;
