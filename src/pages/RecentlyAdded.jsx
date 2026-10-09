/**
 * RecentlyAdded — prompts created in the last 7 days (RECENT_DAYS from hook).
 */

import { History, Sparkles } from 'lucide-react';
import { SearchFilterBar } from '../components/SearchFilterBar.jsx';
import { PromptCard } from '../components/PromptCard.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

export function RecentlyAdded({ pv, onCopy, onOpen, onEdit, onToggleFavorite }) {
  const { list, counts, search, setSearch, sort, setSort, hasActiveFilters, clearFilters, RECENT_DAYS } = pv;

  return (
    <div className="flex min-h-full flex-col gap-5 px-4 py-5 md:px-6 md:py-6">
      <section aria-label="Recently added intro">
        <div className="flex items-center gap-2.5 text-sm text-ink-500 dark:text-paper-400">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
            <History className="h-4 w-4" aria-hidden="true" />
          </span>
          New prompts, from the last {RECENT_DAYS} days.
        </div>
      </section>

      <SearchFilterBar
        context="recent"
        searchValue={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        hasActive={hasActiveFilters}
        onClearAll={clearFilters}
        categories={[]}
        visibleCount={list.length}
        totalCount={list.length}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Nothing new (last 7 days)"
          description="Add a fresh prompt or widen the time window. New prompts added now will show up here immediately."
        />
      ) : (
        <section aria-label="Recently added prompts" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              showDate
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

export default RecentlyAdded;
