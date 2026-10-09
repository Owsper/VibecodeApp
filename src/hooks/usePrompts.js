/**
 * usePrompts — single source of truth for the prompt library.
 *
 * Owns:
 *   - loading/seeding, CRUD, favorite toggling
 *   - derived category + tag counts
 *   - search / filter / sort pipeline (used by every list view)
 *   - preferences that need to outlive a single render (persisted)
 *   - imperative: resetDemo, clearAll, importFile (replace | merge)
 *
 * Persistence: storage.js (versioned keys, safe parse, silent fail).
 */

import { useCallback, useMemo, useEffect, useRef, useState } from 'react';

import {
  loadPrompts,
  savePrompts,
  loadCategories,
  saveCategories,
  loadTags,
  saveTags,
  loadPrefs,
  savePrefs,
  isSeeded,
  setSeeded,
  resetAll as storageResetAll,
  STORAGE_AVAILABLE,
} from '../utils/storage.js';
import { buildSamplePrompts, DEFAULT_CATEGORIES, DEFAULT_TAGS } from '../data/samplePrompts.js';
import { makeId } from '../utils/ids.js';
import { nowISO, daysSince, isISODate } from '../utils/dates.js';
import { parseLabelList, uniqueLabels, displayLabel } from '../utils/helpers.js';
import {
  parseImportedFile,
  mergePrompts,
  replacePrompts,
  mergeLabelLists,
  exportToDownloadFile,
  readFileAsText,
} from '../utils/importExport.js';

// -------------------------- filter / sort logic (pure) ------------------------

const RECENT_DAYS = 7;

/**
 * Returns true when `p` matches the combined query + filters.
 */
export function matchesFilters(p, { query, category, favoritesOnly, recentlyOnly, tag }) {
  if (!p || typeof p !== 'object') return false;
  const q = (query || '').trim().toLowerCase();
  if (q) {
    const hay = [
      p.title,
      p.description || '',
      p.body || '',
      p.category || '',
      (p.tags || []).join(', '),
    ]
      .join('\n')
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (category && p.category !== category) return false;
  if (favoritesOnly && !p.favorite) return false;
  if (tag && !(p.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase())) return false;
  if (recentlyOnly) {
    const created = isISODate(p.createdAt) ? p.createdAt : p.updatedAt;
    if (daysSince(created, Date.now()) > RECENT_DAYS) return false;
  }
  return true;
}

const SORTS = {
  newest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  oldest: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  alpha: (a, b) => String(a.title).localeCompare(String(b.title), undefined, { sensitivity: 'base' }),
  updated: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
};

export function sortPrompts(prompts, sort) {
  const fn = SORTS[sort] || SORTS.newest;
  return prompts.slice().sort(fn);
}

// -------------------------- the hook ------------------------

export function usePrompts() {
  const [prompts, setPrompts] = useState(() => {
    let list = loadPrompts();
    // First-launch seeding happens synchronously in this initializer.
    if (!isSeeded()) {
      const samples = buildSamplePrompts();
      list = samples;
      savePrompts(samples);
      saveCategories(DEFAULT_CATEGORIES.slice());
      saveTags(unwrapTags(samples));
      setSeeded(true);
    }
    return list;
  });

  const [categories] = useState(() => loadCategories());
  const [tagsState] = useState(() => loadTags());
  const [prefs, setPrefs] = useState(() => loadPrefs());

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(''); // '' = all
  const [recentlyOnly, setRecentlyOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const [sort, setSort] = useState('newest');

  const sectionRef = useRef('all');
  const [section, _setSection] = useState(() => loadPrefs().lastSection || 'all');

  useEffect(() => {
    savePrefs({ ...loadPrefs(), lastSection: section });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // ---------------- derived counts ----------------

  const counts = useMemo(() => {
    const catCount = {};
    const tagCount = {};
    let favCount = 0;
    for (const p of prompts) {
      if (!p) continue;
      catCount[p.category] = (catCount[p.category] || 0) + 1;
      if (p.favorite) favCount += 1;
      (p.tags || []).forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    }
    const knownCats = new Set(categories);
    for (const c of Object.keys(catCount)) {
      if (!knownCats.has(c)) knownCats.add(c);
    }
    return {
      total: prompts.length,
      favCount,
      categoryCount: catCount,
      tagCount,
      categoryList: Object.keys(knownCats),
      tagList: Object.keys(tagCount),
    };
  }, [prompts, categories]);

  // ---------------- list pipeline ----------------

  const filtered = useMemo(() => {
    let list = prompts.filter((p) => matchesFilters(p, {
      query: search,
      category: categoryFilter,
      favoritesOnly: section === 'favorites',
      recentlyOnly,
      tag: tagFilter,
    }));
    if (section === 'recent') {
      list = list.filter((p) => daysSince(p.createdAt, Date.now()) <= RECENT_DAYS);
    }
    if (section === 'category' && categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter);
    }
    return list;
  }, [prompts, section, search, categoryFilter, recentlyOnly, tagFilter]);

  const sorted = useMemo(() => sortPrompts(filtered, sort), [filtered, sort]);

  const hasActiveFilters =
    search.trim() !== '' ||
    categoryFilter !== '' ||
    recentlyOnly ||
    tagFilter !== '' ||
    section === 'favorites' ||
    section === 'recent' ||
    section === 'category';

  const clearFilters = useCallback(() => {
    setSearch('');
    setCategoryFilter('');
    setRecentlyOnly(false);
    setTagFilter('');
    setSort('newest');
  }, []);

  // ---------------- CRUD ----------------

  const createPrompt = useCallback((input) => {
    const cleaned = sanitize(input);
    const now = nowISO();
    const record = {
      id: makeId(),
      title: cleaned.title,
      body: cleaned.body,
      description: cleaned.description,
      category: cleaned.category,
      tags: cleaned.tags,
      favorite: false,
      createdAt: now,
      updatedAt: now,
    };
    if (cleaned.notes) record.notes = cleaned.notes;
    if (cleaned.usageInstructions) record.usageInstructions = cleaned.usageInstructions;
    setPrompts((prev) => {
      const next = [record, ...prev];
      savePrompts(next);
      syncLabels(next);
      return next;
    });
    return record;
  }, []);

  const updatePrompt = useCallback((id, patch) => {
    const cleaned = sanitize(patch, { partial: true });
    setPrompts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...cleaned, id, updatedAt: nowISO() };
        if (!merged.notes) delete merged.notes;
        if (!merged.usageInstructions) delete merged.usageInstructions;
        return merged;
      });
      savePrompts(next);
      syncLabels(next);
      return next;
    });
  }, []);

  const deletePrompt = useCallback((id) => {
    setPrompts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      savePrompts(next);
      syncLabels(next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id) => {
    setPrompts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p));
      savePrompts(next);
      return next;
    });
  }, []);

  // ---------------- import / export / reset ----------------

  const exportData = useCallback(() => exportToDownloadFile({
    prompts, categories, tags: tagsState, prefs,
  }), [prompts, categories, tagsState, prefs]);

  const importData = useCallback(async (fileOrText, { mode = 'merge', keepIds = false } = {}) => {
    const text = typeof fileOrText === 'string'
      ? fileOrText
      : await readFileAsText(fileOrText);
    const res = await parseImportedFile({ text, keepIds });
    if (!res.ok) return res;
    if (mode === 'replace') {
      const next = replacePrompts(res.prompts);
      setPrompts(next);
      savePrompts(next);
      saveCategories(mergeLabelLists(categories, res.categories));
      saveTags(mergeLabelLists(tagsState, res.tags));
      setPrefs((p) => { const np = { ...p, theme: res.prefs?.theme || p.theme }; savePrefs(np); return np; });
      setSeeded(true);
      return { ok: true, count: next.length, dropped: res.dropped, mode };
    }
    const next = mergePrompts(prompts, res.prompts, { keepIds });
    setPrompts(next);
    savePrompts(next);
    saveCategories(mergeLabelLists(categories, res.categories));
    saveTags(mergeLabelLists(tagsState, res.tags));
    return { ok: true, count: next.length, dropped: res.dropped, mode };
  }, [prompts, categories, tagsState]);

  const resetDemo = useCallback(() => {
    const samples = buildSamplePrompts();
    setPrompts(samples);
    savePrompts(samples);
    saveCategories(DEFAULT_CATEGORIES.slice());
    saveTags(unwrapTags(samples));
    setSeeded(true);
    clearFilters();
  }, [clearFilters]);

  const clearAll = useCallback(() => {
    setPrompts([]);
    savePrompts([]);
    setSeeded(true);
    clearFilters();
  }, [clearFilters]);

  const setTheme = useCallback((theme) => {
    setPrefs((prev) => {
      const next = { ...prev, theme };
      savePrefs(next);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      return next;
    });
  }, []);

  const openPrompt = useCallback((id) => {
    const p = prompts.find((x) => x.id === id);
    if (!p) return null;
    // Tag the parent view that opened us (for focus restoration)
    sectionRef.current = section;
    document.documentElement.body.dataset.pvOpenPrompt = id;
    return p;
  }, [prompts, section]);

  const closePrompt = useCallback(() => {
    const el = document.getElementById('pv-detail-backdrop');
    el?.removeAttribute('hidden');
    el?.focus?.();
  }, []);

  return {
    // data
    prompts,
    categories,
    tags: tagsState,
    prefs,
    counts,
    // filtered/sorted
    list: sorted,
    totalFiltered: sorted.length,
    hasActiveFilters,
    clearFilters,
    // state
    search, setSearch,
    categoryFilter, setCategoryFilter,
    sort, setSort,
    recentlyOnly, setRecentlyOnly,
    tagFilter, setTagFilter,
    section,
    setSection: _setSection,
    // CRUD
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    // io
    exportData,
    importData,
    resetDemo,
    clearAll,
    // theme
    setTheme,
    openPrompt,
    closePrompt,
    RECENT_DAYS,
  };
}

// ---------------- helpers ----------------

function sanitize(input, { partial = false } = {}) {
  const out = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(input, k);
  if (!partial || has('title')) out.title = String(input?.title ?? '').trim();
  if (!partial || has('body')) out.body = String(input?.body ?? '').trim();
  if (!partial || has('description')) out.description = String(input?.description ?? '').trim();
  if (!partial || has('category')) {
    const c = String(input?.category ?? '').trim();
    out.category = c ? displayLabel(c) : 'Uncategorized';
  }
  if (!partial || has('tags')) {
    const raw = Array.isArray(input?.tags) ? input.tags : parseLabelList(String(input?.tags ?? ''));
    out.tags = uniqueLabels(raw, { titleCaseNew: false });
  }
  if (has('notes')) out.notes = String(input.notes ?? '').trim();
  if (has('usageInstructions')) out.usageInstructions = String(input.usageInstructions ?? '').trim();
  return out;
}

function unwrapTags(prompts) {
  const all = [];
  prompts?.forEach((p) => { (p.tags || []).forEach((t) => all.push(t)); });
  return uniqueLabels(all, { titleCaseNew: false });
}

function syncLabels(next) {
  const cats = uniqueLabels((next || []).map((p) => p.category).filter(Boolean), { titleCaseNew: false });
  const tags = uniqueLabels((next || []).flatMap((p) => p.tags || []), { titleCaseNew: false });
  saveCategories(cats);
  saveTags(tags);
}

function readAsText(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ''));
    r.onerror = () => resolve('');
    r.readAsText(file);
  });
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    const handler = () => setReduced(mq.matches);
    handler();
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduced;
}
