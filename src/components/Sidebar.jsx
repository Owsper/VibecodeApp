/**
 * <Sidebar /> — persistent desktop nav + collapsible mobile drawer.
 *
 * Props:
 *   section: string                ('all' | 'favorites' | 'recent' | 'category' | 'settings')
 *   onSelect(section: string)
 *   activeCategory?: string
 *   categories: string[]
 *   counts: { [category]: number }
 *   open (mobile): boolean
 *   onClose()
 *   theme, setTheme              (optional)
 */

import { useMemo } from 'react';
import {
  LayoutGrid,
  Heart,
  History,
  Folder,
  Settings,
  Sparkles,
  X,
  Zap,
  BookOpen,
  Briefcase,
  Palette,
  Lightbulb,
  Code2,
  GraduationCap,
  FlaskConical,
  Moon,
} from 'lucide-react';

const TOP_ITEMS = [
  { id: 'all',     label: 'All Prompts',     icon: LayoutGrid },
  { id: 'favorites', label: 'Favorites',     icon: Heart },
  { id: 'recent',  label: 'Recently Added',  icon: History },
];

const KNOWN_CATEGORIES = {
  Coding: Code2,
  Writing: BookOpen,
  Study: GraduationCap,
  Research: FlaskConical,
  Productivity: Zap,
  Business: Briefcase,
  Design: Palette,
  Creativity: Lightbulb,
};

function categoryIcon(name) {
  return KNOWN_CATEGORIES[name] || Folder;
}

export function Sidebar({
  section, onSelect,
  activeCategory = '',
  categories = [],
  counts = {},
  open = false, onClose,
  theme, setTheme,
}) {
  const sortedCats = useMemo(() => {
    const known = ['Coding','Writing','Study','Research','Productivity','Business','Design','Creativity'];
    const order = new Map(known.map((c, i) => [c, i]));
    return categories.slice().sort((a, b) => {
      const ai = order.get(a) ?? Number.MAX_SAFE_INTEGER;
      const bi = order.get(b) ?? Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.localeCompare(b);
    });
  }, [categories]);

  const nav = useMemo(() => (
    <nav aria-label="Primary">
      <ul className="space-y-1">
        {TOP_ITEMS.map(({ id, label, icon: Icon, shortcut }) => {
          const active = section === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={active ? 'page' : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300 shadow-[inset_0_0_0_1px_rgb(139_92_246/0.25)]'
                    : 'text-ink-600 dark:text-paper-400 hover:bg-ink-100/70 dark:hover:bg-ink-850/70 hover:text-ink-900 dark:hover:text-paper-200'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1 truncate text-left">{label}</span>
                {shortcut ? (
                  <kbd className="rounded border border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 px-1.5 py-0.5 font-mono text-[10px] text-ink-500 dark:text-paper-500">
                    {shortcut}
                  </kbd>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Categories */}
      <div className="mt-6">
        <div className="flex items-center gap-2 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400 dark:text-paper-500">
          <Folder className="h-3 w-3" aria-hidden="true" />
          Categories
        </div>
        <ul className="space-y-0.5">
          {sortedCats.length === 0 ? (
            <li className="px-3 py-2 text-xs text-ink-400 dark:text-paper-500">
              No categories yet
            </li>
          ) : sortedCats.map((c) => {
            const active = section === 'category' && activeCategory === c;
            const Icon = categoryIcon(c);
            return (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => onSelect('category', c)}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300 shadow-[inset_0_0_0_1px_rgb(139_92_246/0.25)]'
                      : 'text-ink-500 dark:text-paper-400 hover:bg-ink-100/70 dark:hover:bg-ink-850/70 hover:text-ink-800 dark:hover:text-paper-200'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate text-left">{c}</span>
                  <span className="rounded-full bg-ink-100 dark:bg-ink-850 px-1.5 py-0.5 text-[11px] tabular-nums text-ink-500 dark:text-paper-400">
                    {counts[c] ?? 0}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between border-t border-ink-100 dark:border-ink-800 pt-5">
        <button
          type="button"
          onClick={() => onSelect('settings')}
          aria-current={section === 'settings' ? 'page' : undefined}
          className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
            section === 'settings'
              ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
              : 'text-ink-500 dark:text-paper-400 hover:bg-ink-100/70 dark:hover:bg-ink-850/70'
          }`}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          <span>Settings</span>
        </button>
        {theme != null && setTheme ? (
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-ink-400 dark:text-paper-500 transition hover:bg-ink-100/70 dark:hover:bg-ink-850/70 hover:text-ink-700 dark:hover:text-paper-200"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            ) : (
              <MoonLike />
            )}
          </button>
        ) : null}
      </div>
    </nav>
  ), [section, onSelect, activeCategory, sortedCats, counts, theme, setTheme]);

  const brand = (
    <div className="flex items-center gap-2.5 px-3 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="text-base font-semibold tracking-tight text-ink-900 dark:text-paper-100">PromptVault</div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-violet-500 dark:text-violet-400">Local · Private</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile scrim */}
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        aria-label="Navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[272px] flex-col gap-4 overflow-y-auto border-r border-ink-100 bg-ink-50/95 px-4 pb-4 pt-4 backdrop-blur-md dark:border-ink-850 dark:bg-ink-950/95 md:sticky md:z-auto md:translate-x-0 md:bg-transparent md:backdrop-blur-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        } transition-transform`}
      >
        <div className="flex items-center justify-between">
          {brand}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 dark:text-paper-500 dark:hover:bg-ink-850 md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {nav}
      </aside>
    </>
  );
}


export default Sidebar;
