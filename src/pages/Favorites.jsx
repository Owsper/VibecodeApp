/**
 * Favorites — all prompts where favorite === true.
 */

import { Heart, Plus } from 'lucide-react';
import { SearchFilterBar } from '../components/SearchFilterBar.jsx';
import { PromptCard } from '../components/PromptCard.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

export function Favorites({ pv, onCopy, onOpen, onEdit, onToggleFavorite, onAddPrompt }) {
  const {
    list, counts,
    search, setSearch,
    sort, setSort,
    hasActiveFilters, clearFilters,
  } = pv;
  const noFavorites = counts.favCount === 0 && !search;

  return (
    <div className="flex min-h-full flex-col gap-5 px-4 py-5 md:px-6 md:py-6">
      <section aria-label="Favorites intro">
        <div className="flex items-center gap-2.5 text-sm text-ink-500 dark:text-paper-400">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <Heart className="h-4 w-4" aria-hidden="true" fill="currentColor" />
          </span>
          Your one-stop shelf for prompts you keep coming back to.
        </div>
      </section>

      <SearchFilterBar
        context="favorites"
        searchValue={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        hasActive={hasActiveFilters}
        onClearAll={clearFilters}
        categories={[]}
        visibleCount={list.length}
        totalCount={counts.favCount}
      />

      {noFavorites ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart icon on any prompt card and it will end up here. It persists after a refresh, because it's saved locally."
          actions={
            <>
              <button
                type="button"
                onClick={onAddPrompt}
                className="pv-btn bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add a prompt
              </button>
            </>
          }
        />
      ) : (
        <section aria-label="Favorite prompts" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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

export default Favorites;
