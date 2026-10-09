/**
 * Reusable copy-to-clipboard utility.
 *
 * Usage:
 *   const r = await copyToClipboard('hello');
 *   if (r.ok) showSuccess('Copied'); else showError(r.error);
 *
 * Strategy:
 *   1. Try the modern `navigator.clipboard.writeText` API.
 *   2. Fall back to a hidden textarea + `document.execCommand('copy')`
 *      (covers older browsers / non-secure contexts).
 *   3. Return `{ ok, error }` — never throws. Never reports success
 *      before the underlying op returned success.
 */

export function canUseClipboard() {
  try {
    if (typeof navigator === 'undefined') return false;
    return (
      !!navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    );
  } catch {
    return false;
  }
}

function legacyCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.width = '1px';
    ta.style.height = '1px';
    ta.style.padding = '0';
    ta.style.border = 'none';
    ta.style.outline = 'none';
    ta.style.boxShadow = 'none';
    ta.style.background = 'transparent';
    ta.style.opacity = '0';
    ta.style.zIndex = '-1';

    document.body.appendChild(ta);
    ta.focus();
    ta.select();

    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * @param {string} text  The text to copy.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function copyToClipboard(text) {
  if (typeof text !== 'string') {
    return { ok: false, error: 'Nothing to copy.' };
  }
  if (text.length === 0) {
    return { ok: true };
  }

  // 1) Modern API
  if (canUseClipboard()) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    } catch {
      // fall through to legacy copy
    }
  }

  // 2) Legacy fallback
  if (legacyCopy(text)) return { ok: true };

  return {
    ok: false,
    error:
      'Copy failed. Please select and copy the text manually (Ctrl/Cmd + C).',
  };
}

/**
 * Single-line, non-async convenience wrapper for existing callers that
 * only care about success/failure.
 */
export function copySafe(text) {
  return copyToClipboard(text).then((r) => r.ok);
}

export default { copyToClipboard, copySafe, canUseClipboard };
