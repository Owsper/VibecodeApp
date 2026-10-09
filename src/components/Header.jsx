/**
 * <Header /> — sticky top bar with search, ThemeToggle, panel toggle (mobile).
 */

import {
  Search as SearchIcon,
  Plus,
  Menu,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle.jsx';

export function Header({
  title, subtitle,
  searchValue, onSearchChange,
  onOpenSidebar,
  onAddPrompt,
  theme, setTheme,
  showSearch = true,
  actions,
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-2 border-b border-ink-100 bg-ink-50/85 px-4 backdrop-blur-md dark:border-ink-850 dark:bg-ink-950/85 md:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:text-paper-400 dark:hover:bg-ink-850 md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold leading-tight text-ink-900 dark:text-paper-100 md:text-lg">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-xs leading-tight text-ink-500 dark:text-paper-400 md:text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>

      {showSearch ? (
        <div className="relative hidden w-[min(420px,38vw)] items-center md:flex">
          <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-ink-400 dark:text-paper-500" aria-hidden="true" />
          <input
            id="pv-search"
            type="search"
            value={searchValue ?? ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search prompts, tags, categories…"
            aria-label="Search prompts"
            className="pv-field w-full pl-9 pr-16"
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="pointer-events-none absolute right-3 rounded border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-850 px-1.5 py-0.5 font-mono text-[10px] text-ink-500 dark:text-paper-500">
            ⌘K
          </kbd>
        </div>
      ) : null}

      {actions ? <div className="hidden items-center gap-2 md:flex">{actions}</div> : null}

      <ThemeToggle theme={theme} setTheme={setTheme} />

      <button
        type="button"
        onClick={onAddPrompt}
        className="pv-btn bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Add Prompt</span>
      </button>
    </header>
  );
}

export default Header;
