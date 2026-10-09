/**
 * <ConfirmDialog /> — small, accessible, non-blocking confirmation.
 *
 * Props:
 *   open: boolean
 *   title: string
 *   body?: string            (or use children for JSX)
 *   confirmLabel?: string    (default "Confirm")
 *   cancelLabel?: string     (default "Cancel")
 *   tone?: 'danger' | 'info' (default 'danger')
 *   onConfirm(): void
 *   onCancel(): void
 */

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CircleAlert } from 'lucide-react';

const TONE_STYLES = {
  danger: 'bg-rose-500 text-white hover:bg-rose-600',
  info: 'bg-violet-600 text-white hover:bg-violet-700',
};

export function ConfirmDialog({
  open, title, body = '', children, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  tone = 'danger', onConfirm, onCancel, initialFocus = 'cancel',
}) {
  const panelRef = useRef(null);
  const lastFocused = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      lastFocused.current = document.activeElement;
      setMounted(true);
      const t = setTimeout(() => {
        const target = panelRef.current?.querySelector(
          initialFocus === 'confirm'
            ? 'button[data-role="confirm"]'
            : 'button'
        );
        target?.focus?.();
      }, 0);
      return () => clearTimeout(t);
    }
    setMounted(false);
    lastFocused.current?.focus?.();
    return undefined;
  }, [open, initialFocus]);

  if (!open) return null;

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    }
    if (e.key === 'Tab') {
      const focusables = panelRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  const Icon = tone === 'danger' ? AlertTriangle : CircleAlert;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-ink-950/50 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pv-confirm-title"
      data-pv-modal="open"
    >
      <div
        ref={panelRef}
        onKeyDown={onKeyDown}
        className="pv-card w-full max-w-md p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-rose-500/10 p-2 text-rose-500">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="pv-confirm-title" className="text-base font-semibold leading-snug">
              {title}
            </h2>
            {body ? (
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500 dark:text-paper-300">
                {body}
              </p>
            ) : (
              children
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="pv-btn border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-800 dark:text-paper-200 hover:bg-ink-50 dark:hover:bg-ink-700"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-role="confirm"
            className={`pv-btn border ${TONE_STYLES[tone] || TONE_STYLES.danger} border-transparent`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
