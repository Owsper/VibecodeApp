/**
 * AllPrompts — default dashboard. Greeting, real summary cards, category
 * chips, and the prompt grid.
 */

import { useMemo } from 'react';
import {
  Sparkles,
  Folder,
  FolderOpen,
  Heart,
  Plus,
  Search as SearchIcon,
  ArrowRight,
} from 'lucide-react';

import { SearchFilterBar } from '../components/SearchFilterBar.jsx';
import { PromptCard } from '../components/PromptCard.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

export function AllPrompts({
  pv, // the whole hook object from usePrompts, exposed via context/prop
  title,
  onCopy,
  onOpen,
  onEdit,
  onToggleFavorite,
  onAddPrompt,
  onNavigate,
}) {
  const {
    list, prompts, categories, counts,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    sort, setSort,
    recentlyOnly, setRecentlyOnly,
    hasActiveFilters, clearFilters,
  } = pv;

  // Build category chips from real data (union of categories + activeCategoryFilter)
  const chips = useMemo(() => {
    const all = new Set(categories);
    if (categoryFilter) all.add(categoryFilter);
    return Array.from(all).sort((a, b) => {
      const ca = counts.categoryCount?.[a] || 0;
      const cb = counts.categoryCount?.[b] || 0;
      if (ca !== cb) return cb - ca;
      return a.localeCompare(b);
    });
  }, [categories, categoryFilter, counts.categoryCount]);

  return (
    <div className="flex min-h-full flex-col gap-5 px-4 py-5 md:px-6 md:py-6">
      {/* Greeting */}
      <section aria-label="Welcome">
        <h2 className="text-xl font-semibold tracking-tight text-ink-900 dark:text-paper-100 md:text-2xl">
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
            Welcome back
          </span>{' '}
          to your vault
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-500 dark:text-paper-400">
          Search, filter, favorite, and reuse the prompts you actually keep coming back to. Everything you save stays in this browser — no account, no cloud, no pitch.
        </p>
      </section>

      {/* Summary cards (all derived from real data) */}
      <section aria-label="Library summary" className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Sparkles}
          label="Total prompts"
          value={counts.total}
          hint={`across ${new Set(prompts.map((p) => p.category)).size} categories`}
        />
        <SummaryCard
          icon={Heart}
          label="Favorites"
          value={counts.favCount}
          hint={counts.total ? `${Math.round((counts.favCount / Math.max(1, counts.total)) * 100)}% of your library` : 'nothing hearted yet'}
        />
        <SummaryCard
          icon={FolderOpen}
          label="Active filters"
          value={hasActiveFilters ? 'on' : 'off'}
          hint={hasActiveFilters ? `${list.length} match your search` : `show all ${counts.total}`}
          active={hasActiveFilters}
        />
      </section>

      {/* Category chips */}
      {chips.length ? (
        <section aria-label="Browse by category">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-paper-500">
            <Folder className="h-3 w-3" aria-hidden="true" />
            Categories in your library
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Chip
              label="All"
              icon={FolderOpen}
              count={counts.total}
              onClick={() => setCategoryFilter('')}
              active={!categoryFilter}
            />
            {chips.map((c) => (
              <Chip
                key={c}
                label={c}
                icon={FolderOpen}
                count={counts.categoryCount?.[c] || 0}
                onClick={() => setCategoryFilter(c)}
                active={categoryFilter === c}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Filters + grid */}
      <SearchFilterBar
        context="all"
        searchValue={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={chips}
        recentlyOnly={recentlyOnly}
        onRecentlyToggle={setRecentlyOnly}
        sort={sort}
        onSortChange={setSort}
        hasActive={hasActiveFilters}
        onClearAll={clearFilters}
        visibleCount={list.length}
        totalCount={counts.total}
      />

      {list.length === 0 ? (
        prompts.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Your vault is empty"
            description="Add your first prompt and it will live here, in this browser, exactly when you need it."
            actions={
              <>
                <button
                  type="button"
                  onClick={onAddPrompt}
                  className="pv-btn bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add your first prompt
                </button>
              </>
            }
            promptHint="N"
          />
        ) : (
          <EmptyState
            icon={SearchIcon}
            title="No prompts match your filters"
            description={`None of your ${counts.total} prompts match the current filter. Try widening your search, or start fresh.`}
            actions={
              <>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="pv-btn border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-paper-300 hover:bg-ink-50 dark:hover:bg-ink-700"
                >
                  <SearchIcon className="h-4 w-4" aria-hidden="true" />
                  Clear filters
                </button>
                <button
                  type="button"
                  onClick={onAddPrompt}
                  className="pv-btn bg-violet-600 text-white hover:bg-violet-700"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New prompt
                </button>
              </>
            }
          />
        )
      ) : (
        <section
          aria-label="Prompt library"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {list.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              onOpen={onOpen}
              onEdit={onEdit}
              onToggleFavorite={onToggleFavorite}
              onCopy={onCopy}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, hint, active }) {
  return (
    <div className={`pv-card flex items-start gap-3 p-4 ${active ? 'border-violet-500/40' : ''}`}>
      <div className={`rounded-xl p-2 ${active ? 'bg-violet-500/15 text-violet-600 dark:text-violet-300' : 'bg-ink-100 dark:bg-ink-850 text-ink-500 dark:text-paper-400'}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-paper-500">
          {label}
        </div>
        <div className="mt-0.5 truncate text-2xl font-semibold tabular-nums text-ink-900 dark:text-paper-100">
          {value}
        </div>
        {hint ? (
          <div className="mt-0.5 truncate text-xs text-ink-500 dark:text-paper-400">{hint}</div>
        ) : null}
      </div>
    </div>
  );
}

function Chip({ label, icon: Icon, count, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium transition ${
        active
          ? 'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300 shadow-[inset_0_0_0_1px_rgb(139_92_246/0.25)]'
          : 'border-ink-100 bg-white text-ink-600 hover:border-violet-300 hover:bg-violet-50 dark:border-ink-850 dark:bg-ink-900 dark:text-paper-400 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300'
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
      <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? 'bg-violet-500/15 text-violet-700 dark:text-violet-300' : 'bg-ink-100 dark:bg-ink-850 text-ink-500 dark:text-paper-400'}`}>
        {count}
      </span>
    </button>
  );
}

export default AllPrompts;
