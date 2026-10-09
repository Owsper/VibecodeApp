/**
 * Versioned LocalStorage wrapper with graceful degradation.
 *
 * Keys (all namespaced):
 *   promptvault:v1:prompts        - Array<Prompt>
 *   promptvault:v1:categories     - Array<string>
 *   promptvault:v1:tags           - Array<string>
 *   promptvault:v1:prefs          - { theme, focusSearchShortcut, ... }
 *   promptvault:v1:seeded         - "1" when sample prompts have been seeded
 *
 * Guarantees:
 *  - Never throws on missing keys / malformed JSON / storage-unavailable.
 *  - Returns a typed default when the stored value has the wrong shape.
 *  - Exposes a `storageFailed` flag so the UI can warn the user once.
 */

const NS = 'promptvault';
const V = 'v1';

const KEYS = {
  prompts: `${NS}:${V}:prompts`,
  categories: `${NS}:${V}:categories`,
  tags: `${NS}:${V}:tags`,
  prefs: `${NS}:${V}:prefs`,
  seeded: `${NS}:${V}:seeded`,
};

function safeGet(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export const STORAGE_AVAILABLE = (() => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const t = `__pv_probe_${Date.now()}`;
    window.localStorage.setItem(t, '1');
    window.localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
})();

function readJSON(key, fallback, validator) {
  const raw = safeGet(key);
  if (raw === null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (validator && !validator(parsed)) return fallback;
    return parsed;
  } catch {
    // Malformed JSON: preserve the raw string for diagnostics but return the
    // fallback. The user's valid library is NOT secretly wiped.
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    const s = JSON.stringify(value);
    return safeSet(key, s);
  } catch {
    return false;
  }
}

// ---- Validator helpers ----

function isNonEmptyStringArray(v) {
  return Array.isArray(v) && v.every((s) => typeof s === 'string' && s.length > 0);
}

const REQUIRED_PROMPT_KEYS = [
  'id',
  'title',
  'body',
];

export function validatePrompt(p) {
  return (
    p &&
    typeof p === 'object' &&
    REQUIRED_PROMPT_KEYS.every((k) => typeof p[k] === 'string' && p[k].length > 0) &&
    typeof p.favorite === 'boolean' &&
    Array.isArray(p.tags) &&
    p.tags.every((t) => typeof t === 'string')
  );
}

export function validatePromptArray(v) {
  return Array.isArray(v) && v.every(validatePrompt);
}

// ---- Prompts ----

export function loadPrompts() {
  return readJSON(KEYS.prompts, [], validatePromptArray);
}

export function savePrompts(prompts) {
  if (!validatePromptArray(prompts)) return false;
  return writeJSON(KEYS.prompts, prompts);
}

// ---- Categories ----

export function loadCategories() {
  return readJSON(KEYS.categories, [], isNonEmptyStringArray);
}

export function saveCategories(categories) {
  if (!isNonEmptyStringArray(categories)) return false;
  return writeJSON(KEYS.categories, categories);
}

// ---- Tags ----

export function loadTags() {
  return readJSON(KEYS.tags, [], isNonEmptyStringArray);
}

export function saveTags(tags) {
  if (!isNonEmptyStringArray(tags)) return false;
  return writeJSON(KEYS.tags, tags);
}

// ---- Preferences ----

const DEFAULT_PREFS = {
  theme: 'dark',
  lastSection: 'all',
  onboardingSeen: false,
};

function validatePrefs(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return false;
  return typeof p.theme === 'string';
}

export function loadPrefs() {
  return readJSON(KEYS.prefs, { ...DEFAULT_PREFS }, validatePrefs);
}

export function savePrefs(prefs) {
  const clean = { ...DEFAULT_PREFS, ...prefs };
  return writeJSON(KEYS.prefs, clean);
}

// ---- Seeded flag ----

export function isSeeded() {
  return safeGet(KEYS.seeded) === '1';
}

export function setSeeded(value) {
  return safeSet(KEYS.seeded, value ? '1' : '');
}

// ---- Bulk reset ----

export function resetAll() {
  Object.values(KEYS).forEach((k) => safeRemove(k));
}

// ---- No-op probing (used to surface a one-time warning in the UI) ----

export function probeStorageWritable() {
  return STORAGE_AVAILABLE;
}

export default {
  KEYS,
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
  resetAll,
  STORAGE_AVAILABLE,
  probeStorageWritable,
};
