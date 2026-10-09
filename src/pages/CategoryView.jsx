/**
 * CategoryView — prompts belonging to a single category. Rendering the
 * category chip and the matching card grid in one place.
 */

import { useMemo } from 'react';
import { Folder, FolderOpen, Check } from 'lucide-react';
import { SearchFilterBar } from '../components/SearchFilterBar.jsx';
import { PromptCard } from '../components/PromptCard.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

export function CategoryView({
  pv, category, onCopy, onOpen, onEdit, onToggleFavorite,
  onBack, onClearCategory,
}) {
  const {
    list, counts, categories,
    search, setSearch,
    sort, setSort,
    hasActiveFilters, clearFilters,
  } = pv;

  const totalInCat = counts.categoryCount?.[category] ?? 0;

  // Category tabs inside
  const siblings = useMemo(() => {
    const known = ['Coding','Writing','Study','Research','Productivity','Business','Design','Creativity'];
    const order = new Map(known.map((c, i) => [c, i]));
    const next = new Set(categories);
    next.add(category);
    return Array.from(next).sort((a, b) => {
      const ai = order.get(a) ?? Number.MAX_SAFE_INTEGER;
      const bi = order.get(b) ?? Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.localeCompare(b);
    });
  }, [categories, category]);

  return (
    <div className="flex min-h-full flex-col gap-5 px-4 py-5 md:px-6 md:py-6">
      <section aria-label="Category navigation">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClearCategory}
            className="rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 px-3 py-1.5 text-sm text-ink-700 dark:text-paper-300 hover:bg-ink-50 dark:hover:bg-ink-700"
            aria-label="Clear category filter and show all prompts"
          >
            <FolderOpen className="h-4 w-4" aria-hidden="true" />
            All
          </button>
          {siblings.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onBack?.(c)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                c === category
                  ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300 shadow-[inset_0_0_0_1px_rgb(139_92_246/0.25)]'
                  : 'border border-ink-100 bg-white text-ink-600 hover:border-violet-300 hover:bg-violet-50 dark:border-ink-850 dark:bg-ink-900 dark:text-paper-400 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300'
              }`}
              aria-pressed={c === category}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-2 text-sm text-ink-500 dark:text-paper-400">
        <FolderOpen className="h-4 w-4" aria-hidden="true" />
        <span>Category:</span>
        <span className="font-medium text-ink-900 dark:text-paper-100">{category}</span>
        <span aria-hidden="true">·</span>
        <span>{totalInCat} prompts</span>
      </div>

      <SearchFilterBar
        context="category"
        searchValue={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        hasActive={hasActiveFilters}
        onClearAll={() => {
          // keep the category, clear other filters
          clearFilters();
        }}
        categories={[]}
        visibleCount={list.length}
        totalCount={totalInCat}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={Folder}
          title={totalInCat === 0 ? `No prompts in "${category}"` : 'No matches in this category'}
          description={totalInCat === 0
            ? 'This category is empty. Add a prompt and it will live here.'
            : 'No prompts in this category match your current search.'}
          actions={
            totalInCat === 0
              ? null
              : (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="pv-btn border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-paper-300"
                >
                  Reset search
                </button>
              )
          }
        />
      ) : (
        <section aria-label={`${category} prompts`} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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

export default CategoryView;
