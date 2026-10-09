/**
 * useToasts — minimal toast queue.
 *
 *   const { toasts, push, dismiss } = useToasts();
 *   push('Copied to clipboard', { kind: 'success', ttl: 2400 });
 *
 * Kinds: 'success' | 'error' | 'info' | 'warning'
 *
 * Rendering: the <Toasts/> component consumes the array.
 */

import { useCallback, useState } from 'react';
import { makeShortId } from '../utils/ids.js';

const TITLES = {
  success: 'Done',
  error: 'Something went wrong',
  info: 'Heads up',
  warning: 'Warning',
};

export function useToasts({ defaultTtl = 4200 } = {}) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, { kind = 'info', ttl = defaultTtl, title } = {}) => {
    const id = makeShortId();
    const safeKind = kind in TITLES ? kind : 'info';
    const t = {
      id,
      message: String(message),
      kind: safeKind,
      title: title || TITLES[safeKind],
    };
    setToasts((prev) => [...prev.slice(-4), t]);
    if (ttl > 0) {
      setTimeout(() => dismiss(id), ttl);
    }
    return id;
  }, [defaultTtl, dismiss]);

  const pushSuccess = useCallback((m, o) => push(m, { ...o, kind: 'success' }), [push]);
  const pushError = useCallback((m, o) => push(m, { ...o, kind: 'error' }), [push]);
  const pushInfo = useCallback((m, o) => push(m, { ...o, kind: 'info' }), [push]);
  const pushWarning = useCallback((m, o) => push(m, { ...o, kind: 'warning' }), [push]);

  return { toasts, push, dismiss, pushSuccess, pushError, pushInfo, pushWarning };
}

export default useToasts;
