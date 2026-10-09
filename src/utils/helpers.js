/**
 * General string / array / escape helpers used across the app.
 */

/**
 * Normalize a category or tag for dedupe/lowercase comparisons:
 * trim + collapse internal whitespace. Display stays primary-case.
 */
export function normalizeLabel(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Title-case normalization for display (capitalize first, lowerc rest):
 *   " CODING " -> "Coding"
 * Used for new categories/tags entered by the user.
 */
export function titleCase(value) {
  const s = normalizeLabel(value);
  if (!s) return '';
  return s
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Case/whitespace-insensitive unique-ify of a string array.
 * Keeps the FIRST occurrence as written.
 */
export function uniqueLabels(values, { titleCaseNew = false } = {}) {
  const seen = new Set();
  const out = [];
  for (const raw of values || []) {
    let v = normalizeLabel(raw);
    if (!v) continue;
    if (titleCaseNew) v = titleCase(v);
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

/**
 * Split a comma-or-newline separated string into a normalized list of
 * tags. Each entry is trimmed; whitespace-only entries are dropped.
 * Uses titleCase so "  Research " => "Research".
 */
export function parseLabelList(input, { titleCaseNew = true, max = 50 } = {}) {
  if (typeof input !== 'string') return [];
  const parts = input
    .split(/[\n,]+/)
    .map((s) => normalizeLabel(s))
    .filter(Boolean)
    .slice(0, max);
  return uniqueLabels(parts, { titleCaseNew });
}

/**
 * Clamp a number to min/max.
 */
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

/**
 * Escape a string for HTML context. We render with React (which escapes
 * strings by default) but this is available for use in `dangerouslySetInnerHTML`
 * blocks like the Markdown-ish preview, or in titles.
 */
export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Build a debounced version of fn (leading=false by default).
 */
export function debounce(fn, wait = 150) {
  let t = null;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * "Title case first letter only of a string" — used for category badges:
 *   "featured" -> "Featured"
 *   "CODE REVIEW" -> "Code review"
 */
export function displayLabel(value) {
  const s = normalizeLabel(value);
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Truncate a string for previews:
 *   truncate("long...", 60) => "long..." (length 5)
 */
export function truncate(str, max = 120) {
  if (typeof str !== 'string') return '';
  if (str.length <= max) return str;
  return `${str.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Highlights fragments of a query inside a haystack for a visual match
 * (returns an array of [before, match, after] triple per match).
 * Used by the search highlighter to wrap matched text in <mark>.
 */
export function findMatches(haystack, needle) {
  if (!haystack || !needle) return [];
  const h = String(haystack);
  const n = String(needle).trim();
  if (!n) return [];
  const hl = h.toLowerCase();
  const nl = n.toLowerCase();
  const out = [];
  let i = 0;
  while (i < h.length) {
    const idx = hl.indexOf(nl, i);
    if (idx === -1) break;
    out.push({ start: idx, end: idx + n.length });
    i = idx + n.length;
  }
  return out;
}

export default {
  normalizeLabel,
  titleCase,
  uniqueLabels,
  parseLabelList,
  clamp,
  escapeHtml,
  debounce,
  displayLabel,
  truncate,
  findMatches,
};
