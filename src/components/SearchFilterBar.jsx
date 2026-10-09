/**
 * <SearchFilterBar /> — the search-controls strip under the Header, used by
 * every list view (All, Favorites, Recent, Category, Settings-in-prompt-mode).
 *
 * Props:
 *   searchValue, onSearchChange
 *   categoryFilter, onCategoryChange, categories
 *   recentlyOnly, onRecentlyToggle
 *   sort, onSortChange
 *   hasActive, onClearAll
 *   visibleCount, totalCount
 */

import { memo } from 'react';
import {
  Search as SearchIcon,
  XCircle,
  Clock,
  LayoutGrid,
  Heart,
  Sparkles,
} from 'lucide-react';

const SORTS = [
  { id: 'newest',  label: 'Newest',    icon: Sparkles },
  { id: 'oldest',  label: 'Oldest',    icon: Clock },
  { id: 'alpha',   label: 'A → Z',     icon: null },
  { id: 'updated', label: 'Updated',   icon: Clock },
];

export const SearchFilterBar = memo(function SearchFilterBar({
  searchValue, onSearchChange,
  categoryFilter, onCategoryChange, categories,
  recentlyOnly, onRecentlyToggle,
  sort, onSortChange,
  hasActive, onClearAll,
  visibleCount, totalCount,
  context, // 'all' | 'favorites' | 'recent' | 'category' | 'settings'
}) {
  // in facilitative views we hide category + recently + clear if irrelevant
  const showCategory = context === 'all' || context === 'favorites';
  const showRecent = context === 'all';
  return (
    <div className="space-y-2">
      {/* Search row (row wraps on mobile) */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 dark:text-paper-500" aria-hidden="true" />
          <input
            type="search"
            value={searchValue ?? ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search title, description, body, category, tags…"
            aria-label="Filter current view"
            className="pv-field w-full pl-9 pr-9"
            autoComplete="off"
            spellCheck="false"
          />
          {searchValue ? (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-400 hover:bg-ink-100 dark:text-paper-500 dark:hover:bg-ink-850"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {showCategory ? (
          <div className="relative flex items-center md:w-48">
            <select
              value={categoryFilter || ''}
              onChange={(e) => onCategoryChange?.(e.target.value)}
              aria-label="Filter by category"
              className="pv-field w-full appearance-none bg-white dark:bg-ink-900 pl-9 pr-8"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <LayoutGrid className="pointer-events-none absolute left-2.5 h-4 w-4 text-ink-400 dark:text-paper-500" aria-hidden="true" />
          </div>
        ) : null}

        {showRecent ? (
          <button
            type="button"
            aria-pressed={recentlyOnly}
            onClick={() => onRecentlyToggle?.(!recentlyOnly)}
            className={`pv-btn border ${
              recentlyOnly
                ? 'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                : 'border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-paper-300 hover:bg-ink-50 dark:hover:bg-ink-700'
            }`}
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            Last 7 days
          </button>
        ) : null}

        <label className="relative flex items-center md:w-44">
          <span className="sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="pv-field w-full appearance-none bg-white dark:bg-ink-900 pl-3 pr-8"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2.5 h-4 w-4 text-ink-400 dark:text-paper-500" aria-hidden="true" />
        </label>

        {hasActive ? (
          <button
            type="button"
            onClick={onClearAll}
            className="pv-btn border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-600 dark:text-paper-400 hover:bg-ink-50 dark:hover:bg-ink-700"
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-xs text-ink-500 dark:text-paper-400">
        <span>
          Showing <strong className="text-ink-900 dark:text-paper-100">{visibleCount}</strong> of <strong className="text-ink-900 dark:text-paper-100">{totalCount}</strong> prompts
        </span>
        {hasActive ? (
          <span className="text-violet-600 dark:text-violet-400">
            Filters active
          </span>
        ) : null}
      </div>
    </div>
  );
});

function ChevronDownIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default SearchFilterBar;
