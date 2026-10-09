/**
 * <ThemeToggle /> — light/dark switch (sticky to the header, in Settings).
 *
 * Syncs with the `useTheme` hook via props (`theme`, `setTheme`) or via the
 * global storage directly.
 */

import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ theme, setTheme, size = 'sm' }) {
  const isDark = theme === 'dark';
  const dim = size === 'lg' ? 'h-10 w-20' : 'h-8 w-16';
  const knob = size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  const shift = size === 'lg' ? 'translate-x-[2.45rem]' : 'translate-x-[2.25rem]';

  if (!setTheme) {
    // fallback: toggle directly via storage + class
    return (
      <button
        type="button"
        onClick={toggleViaStorage}
        aria-pressed={isDark}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        className={`relative inline-flex items-center ${dim} rounded-full border border-ink-200 dark:border-ink-700 bg-ink-100 dark:bg-ink-850 transition`}
      >
        <span className={`absolute left-1 inline-flex items-center justify-center rounded-full bg-white dark:bg-ink-700 shadow-sm transition-transform ${knob} ${isDark ? shift : ''}`}>
          {isDark ? <Moon className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" /> : <Sun className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />}
        </span>
        <span className="sr-only">Theme: {isDark ? 'dark' : 'light'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`relative inline-flex items-center ${dim} rounded-full border border-ink-200 dark:border-ink-700 bg-ink-100 dark:bg-ink-850 transition`}
    >
      <span className={`absolute left-1 inline-flex items-center justify-center rounded-full bg-white dark:bg-ink-700 shadow-sm transition-transform ${knob} ${isDark ? shift : ''}`}>
        {isDark ? <Moon className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" /> : <Sun className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />}
      </span>
      <span className="sr-only">Theme: {isDark ? 'dark' : 'light'}</span>
    </button>
  );
}

function toggleViaStorage() {
  try {
    const raw = window.localStorage?.getItem('promptvault:v1:prefs') || '{}';
    const prefs = JSON.parse(raw);
    const theme = prefs?.theme === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem('promptvault:v1:prefs', JSON.stringify({ ...prefs, theme }));
    document.documentElement.classList.toggle('dark', theme === 'dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#06070c' : '#f7f7fb');
  } catch { /* no-op */ }
}

export default ThemeToggle;
