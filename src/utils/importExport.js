/**
 * JSON import/export for the PromptVault library.
 *
 * Export:
 *   exportLibrary(prompts, categories, tags, prefs) -> { name, text }
 *   (ready to pass to Blob + URL.createObjectURL for a download)
 *
 * Import:
 *   parseImportedText(text) -> { ok, prompts?, categories?, tags?, prefs?,
 *                                 error?, canonicalIdToNewMap? }
 *   - never executes anything, no eval/Function
 *   - validates structure, returns typed errors
 *   - assigns new IDs to avoid collisions when caller passes keepIds=false
 *
 * Schema (documented in README):
 *   {
 *     "promptvault.version": 1,
 *     "exportedAt": "<ISO>",
 *     "prompts":      [ { id, title, body, description,
 *                        category, tags, favorite,
 *                        createdAt, updatedAt,
 *                        notes?, usageInstructions? } ],
 *     "categories":   [ "Coding", ... ],
 *     "tags":         [ "code-review", ... ],
 *     "prefs":        { "theme": "dark", "lastSection": "all" }
 *   }
 */

import { validatePromptArray } from './storage.js';
import { isISODate } from './dates.js';
import { makeId } from './ids.js';
import { uniqueLabels } from './helpers.js';

const SCHEMA_VERSION = 1;
const MAX_PROMPTS = 5000;
const MAX_TEXT_BYTES = 5 * 1024 * 1024; // 5MB safety cap

/**
 * Build the JSON string for a downloadable backup file.
 */
export function buildExportPayload({
  prompts = [],
  categories = [],
  tags = [],
  prefs = {},
}) {
  const payload = {
    'promptvault.version': SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    prompts,
    categories,
    tags,
    prefs,
  };
  return JSON.stringify(payload, null, 2);
}

function downloadBlob({ filename, blob }) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Trigger a Browser download for a silence backup.
 * Falls back to a console warning if Blob/URL are unavailable.
 */
export function exportToDownloadFile({ prompts, categories, tags, prefs }) {
  try {
    const text = buildExportPayload({ prompts, categories, tags, prefs });
    const blob = new Blob([text], { type: 'application/json' });
    const stamp = new Date().toISOString().slice(0, 10);
    downloadBlob({ filename: `promptvault-backup-${stamp}.json`, blob });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `Export failed: ${err?.message || err}` };
  }
}

/**
 * Read a File object -> Promise<string>. Uses FileReader so it works
 * everywhere (no modern Blob.text() requirement).
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    if (!file || typeof file.text === 'function') {
      // Modern Blob path
      file
        .text()
        .then(resolve)
        .catch(reject);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error || new Error('Read failed'));
    reader.readAsText(file);
  });
}

function canonCategory(value) {
  if (typeof value !== 'string') return 'Uncategorized';
  const t = value.trim();
  return t ? t : 'Uncategorized';
}

/**
 * Normalize a single prompt coming from an import into the internal shape.
 * Resigns id if keepIds=false (default true for "merge" semantics,
 * keepIds=false for "replace" — both safe in practice).
 */
function normalizeImportedPrompt(p, idMap, keepIds) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  const existingId = typeof p.id === 'string' && p.id ? p.id : '';
  let id = existingId;
  if (!id || !keepIds) {
    id = makeId();
  }

  const tagsRaw = Array.isArray(p.tags) ? p.tags : [];
  const tags = uniqueLabels(
    tagsRaw.map((t) => (typeof t === 'string' ? t : String(t))),
    { titleCaseNew: false }
  );

  const category = canonCategory(p.category);

  const createdAt =
    isISODate(p.createdAt) || isISODate(p.updatedAt)
      ? isISODate(p.createdAt)
        ? p.createdAt
        : p.updatedAt
      : new Date().toISOString();
  const updatedAt = isISODate(p.updatedAt)
    ? p.updatedAt
    : createdAt;

  const title =
    typeof p.title === 'string' && p.title.trim()
      ? p.title.trim()
      : '';
  const body = typeof p.body === 'string' ? p.body : '';
  if (!title || !body) return null; // drop malformed prompt

  idMap.set(existingId || id, id);

  const out = {
    id,
    title,
    body,
    description:
      typeof p.description === 'string' ? p.description.trim() : '',
    category,
    tags,
    favorite: Boolean(p.favorite),
    createdAt,
    updatedAt,
  };
  if (typeof p.notes === 'string' && p.notes.trim()) out.notes = p.notes.trim();
  if (
    typeof p.usageInstructions === 'string' &&
    p.usageInstructions.trim()
  ) {
    out.usageInstructions = p.usageInstructions.trim();
  }
  return out;
}

/**
 * Parse + validate a JSON import blob.
 *
 * @param {string} text
 * @param {object} [opts]
 * @param {boolean} [opts.keepIds=false]  When true, imported prompts keep
 *   their original IDs (merge mode); when false, fresh IDs are assigned
 *   (replace mode).
 * @returns {Promise<{ok: boolean, prompts?: Array, categories?: string[],
 *          tags?: string[], prefs?: object, error?: string,
 *          idMap?: Map<string,string>}>}
 */
export async function parseImportedFile({ text, keepIds = false }) {
  if (typeof text !== 'string' || !text.trim()) {
    return { ok: false, error: 'File is empty.' };
  }
  if (text.length > MAX_TEXT_BYTES) {
    return { ok: false, error: 'File is too large (> 5 MB).' };
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: 'Malformed JSON. ' + (e?.message || '') };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      error: 'File must be a JSON object (top-level {…}), not an array.',
    };
  }

  // Two accepted shapes:
  //   (a) native export shape: { "promptvault.version": 1, prompts: [], ... }
  //   (b) raw array of prompts: [ {...}, ... ] — NOT accepted, but we check
  //       for a top-level "prompts" key.  Users can also pass a legacy
  //       "Array<Prompt>" payload; that's handled by the outer
  //       caller using a fallback log (see README §13).

  const promptsRaw = Array.isArray(parsed.prompts) ? parsed.prompts : null;
  if (!promptsRaw) {
    return {
      ok: false,
      error:
        'Missing "prompts" array. Please use a file exported from PromptVault.',
    };
  }
  if (promptsRaw.length > MAX_PROMPTS) {
    return {
      ok: false,
      error: `Too many prompts (> ${MAX_PROMPTS}). Please split the backup.`,
    };
  }

  const idMap = new Map();
  const promptsOut = [];
  const seenOut = new Set();
  let dropped = 0;

  for (const raw of promptsRaw) {
    const p = normalizeImportedPrompt(raw, idMap, keepIds);
    if (!p) {
      dropped += 1;
      continue;
    }
    if (seenOut.has(p.id)) {
      dropped += 1;
      continue;
    }
    seenOut.add(p.id);
    promptsOut.push(p);
  }

  if (!validatePromptArray(promptsOut) && promptsOut.length > 0) {
    return {
      ok: false,
      error: 'One or more prompts failed final validation.',
    };
  }

  const categoriesRaw = Array.isArray(parsed.categories) ? parsed.categories : [];
  const tagsRaw = Array.isArray(parsed.tags) ? parsed.tags : [];

  const categories = uniqueLabels(
    categoriesRaw.map((c) => (typeof c === 'string' ? c : String(c))),
    { titleCaseNew: false }
  ).filter((c) => c);
  const tags = uniqueLabels(
    tagsRaw.map((t) => (typeof t === 'string' ? t : String(t))),
    { titleCaseNew: false }
  ).filter((t) => t);

  const prefs =
    parsed.prefs && typeof parsed.prefs === 'object' && !Array.isArray(parsed.prefs)
      ? { theme: typeof parsed.prefs.theme === 'string' ? parsed.prefs.theme : 'dark' }
      : { theme: 'dark' };

  return {
    ok: true,
    prompts: promptsOut,
    categories,
    tags,
    prefs,
    dropped,
    idMap,
  };
}

/**
 * Merge an imported prompt list with a current prompt list.
 *
 *  |                | keepIds=true ("merge" mode)     | keepIds=false ("replace" mode) |
 *  | -------------- | --------------------------------- | ------------------------------- |
 *  | Result         | union, existing wins on ID conflict | full replacement with new IDs   |
 *
 * `newer` is used for the merge-time conflict: the prompt with the later
 * updatedAt wins (e.g. importing an export containing edits to a shared
 * backup that was taken after the last local save).
 */
export function mergePrompts(current, imported, { keepIds = true } = {}) {
  if (!Array.isArray(current) || !Array.isArray(imported)) return current;

  const byId = new Map();
  for (const p of current) {
    if (p?.id) byId.set(p.id, p);
  }
  for (const p of imported) {
    if (!p?.id) continue;
    const existing = byId.get(p.id);
    if (!existing) {
      byId.set(p.id, p);
      continue;
    }
    // Conflict: keep the newer (by updatedAt). Tie -> imported wins
    // (import is the user's explicit action). Told in README.
    const u = new Date(p.updatedAt || 0).getTime();
    const eu = new Date(existing.updatedAt || 0).getTime();
    if (u >= eu) {
      byId.set(p.id, p);
    }
  }
  return Array.from(byId.values());
}

export function replacePrompts(imported) {
  if (!Array.isArray(imported)) return [];
  // Reassign every id so the replace never touches an existing user id,
  // and returns a typed copy.
  const idMap = new Map();
  return imported.map((p) => normalizeImportedPrompt(p, idMap, false) || p);
}

/**
 * Merge categories + tags arrays case-insensitively.
 */
export function mergeLabelLists(current, imported) {
  if (!Array.isArray(current) || !Array.isArray(imported)) {
    return Array.isArray(current) ? current : imported || [];
  }
  return uniqueLabels([...current, ...imported]);
}

export default {
  SCHEMA_VERSION,
  buildExportPayload,
  exportToDownloadFile,
  readFileAsText,
  parseImportedFile,
  mergePrompts,
  replacePrompts,
  mergeLabelLists,
};
