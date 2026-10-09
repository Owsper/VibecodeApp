/**
 * useKeyboardShortcuts — registers global keyboard handlers.
 *
 * Shortcuts:
 *   Ctrl/Cmd + K  -> focus the global search field (id: pv-search)
 *   N             -> open the "Add Prompt" form (only when no dialog is
 *                    open and focus is not already in an input/textarea)
 *   Escape        -> close the topmost modal (handled by the modals)
 *
 * To disable single keys: pass { search: false, newPrompt: false }.
 */

import { useEffect } from 'react';

export function useKeyboardShortcuts({ onSearch, onNewPrompt } = {}) {
  useEffect(() => {
    function handler(e) {
      const mod = e.ctrlKey || e.metaKey;
      const target = e.target ?? e.srcElement;
      const inEditable = target && (
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      );

      if ((mod && e.key.toLowerCase() === 'k') || (e.key === 'F1' && mod)) {
        e.preventDefault();
        const el = document.getElementById('pv-search');
        if (el) {
          el.focus();
          el.select?.();
        }
        onSearch?.();
        return;
      }

      if (e.key === 'n' && !mod && !inEditable) {
        // ignore when a modal is already open
        const anyModal = document.querySelector('[data-pv-modal="open"]');
        if (anyModal) return;
        e.preventDefault();
        onNewPrompt?.();
      }
    }
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [onSearch, onNewPrompt]);
}

export function focusGlobalSearch() {
  const el = document.getElementById('pv-search');
  if (el) {
    el.focus();
    el.select?.();
  }
}

export default useKeyboardShortcuts;
