/**
 * Stable unique ID generator.
 * Uses crypto.randomUUID() when available (modern browsers, Node 19+),
 * falls back to a version-4 UUID-style string for older environments.
 */

function cryptoRandomUUID() {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return null;
}

function randomHex(length) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let out = '';
    for (let i = 0; i < bytes.length; i += 1) {
      out += bytes[i].toString(16).padStart(2, '0');
    }
    return out;
  }
  // Last-resort fallback: Math.random (only used when crypto is unavailable)
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += Math.floor(Math.random() * 16).toString(16);
  }
  return out;
}

/**
 * Generate a stable unique ID for a prompt record.
 * Returns a string.
 */
export function makeId() {
  const fromCrypto = cryptoRandomUUID();
  if (fromCrypto) return fromCrypto;
  // Build a v4-style UUID by hand
  const hex = randomHex(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Generate a short, human-readable ID (used for toasts, snackbar, etc.)
 */
export function makeShortId() {
  return `id_${Date.now().toString(36)}_${randomHex(3)}`;
}

export default makeId;
