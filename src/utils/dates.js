/**
 * Date & time helpers. All timestamps are ISO-8601 strings.
 */

const ISO_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

export function nowISO() {
  return new Date().toISOString();
}

export function isISODate(value) {
  if (typeof value !== 'string') return false;
  return ISO_PATTERN.test(value) && !Number.isNaN(new Date(value).getTime());
}

export function toISO(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function parseDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Human-friendly relative "time ago" string.
 * `minutes=90` -> "an hour ago", `days=5` -> "5 days ago".
 */
export function timeAgo(input, options = {}) {
  const { now = Date.now(), max = 'never' } = options;
  const d = parseDate(input);
  if (!d) return 'unknown';
  const diffMs = now - d.getTime();
  if (diffMs < 0) return 'just now';
  const s = Math.floor(diffMs / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s} seconds ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return m === 1 ? 'a minute ago' : `${m} minutes ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return h === 1 ? 'an hour ago' : `${h} hours ago`;
  const day = Math.floor(h / 24);
  if (day < 7) return day === 1 ? 'yesterday' : `${day} days ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return wk === 1 ? 'last week' : `${wk} weeks ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return mo === 1 ? 'last month' : `${mo} months ago`;
  const yr = Math.floor(day / 365);
  if (yr < 2) return yr === 1 ? 'last year' : `${yr} years ago`;
  return max;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Short localized date: "Oct 8, 2026".
 */
export function formatShortDate(input) {
  const d = parseDate(input);
  if (!d) return '';
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Long localized date-time: "Oct 8, 2026, 9:41 PM".
 */
export function formatDateTime(input) {
  const d = parseDate(input);
  if (!d) return '';
  let h = d.getHours();
  const am = h < 12;
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}, ${h}:${m} ${am ? 'AM' : 'PM'}`;
}

/**
 * Days elapsed since a date (0 if today).
 * Used by "Recently Added" filters (e.g. past 7 days).
 */
export function daysSince(input, now = Date.now()) {
  const d = parseDate(input);
  if (!d) return Number.POSITIVE_INFINITY;
  return Math.floor((now - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default {
  nowISO,
  isISODate,
  toISO,
  parseDate,
  timeAgo,
  formatShortDate,
  formatDateTime,
  daysSince,
};
