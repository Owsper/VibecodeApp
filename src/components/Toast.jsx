/**
 * <Toast /> + <Toasts /> — small, sticky, auto-dismissed feedback surface.
 *
 * Used for: copy success, save, delete, import result, theme change, etc.
 */

import { useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES = {
  success: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40',
  error: 'border-rose-500/40 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40',
  info: 'border-sky-500/40 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40',
  warning: 'border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40',
};

export function Toast({ toast, onDismiss }) {
  const Icon = ICONS[toast.kind] || Info;
  const ref = useRef(null);
  useEffect(() => () => {}, []);
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={`pv-toast pointer-events-auto flex items-start gap-3 rounded-xl border px-3.5 py-2.5 shadow-sm backdrop-blur-md ${STYLES[toast.kind] || STYLES.info}`}
      data-pv-toast={toast.id}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug">{toast.title}</p>
        {toast.message ? (
          <p className="mt-0.5 text-sm leading-snug opacity-90">{toast.message}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss?.(toast.id)}
        className="-m-1 rounded-md p-1 opacity-60 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function Toasts({ toasts, onDismiss }) {
  if (!toasts?.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default Toasts;
