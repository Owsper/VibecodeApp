/**
 * <PromptDetail /> — full-prompt reader + actions.
 *
 * Props:
 *   prompt
 *   onClose()
 *   onEdit()
 *   onToggleFavorite()
 *   onDelete()
 *   onCopy(prompt)
 */

import { useEffect, useMemo, useRef } from 'react';
import {
  X,
  Copy,
  Heart,
  Pencil,
  Trash,
  CornerDownLeft,
  CalendarClock,
  Hash,
  Info,
  StickyNote,
} from 'lucide-react';
import { formatDateTime } from '../utils/dates.js';

export function PromptDetail({
  prompt,
  onClose,
  onEdit,
  onToggleFavorite,
  onDelete,
  onCopy,
}) {
  const panelRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    if (!prompt) return undefined;
    lastFocused.current = document.activeElement;
    const t = setTimeout(() => panelRef.current?.focus?.(), 30);
    return () => {
      clearTimeout(t);
      lastFocused.current?.focus?.();
    };
  }, [prompt]);

  const bodyChars = useMemo(
    () => (prompt?.body || '').length,
    [prompt]
  );

  if (!prompt) return null;

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  }

  async function handledCopy() {
    await onCopy?.(prompt);
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-ink-950/50 p-0 sm:p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pv-detail-title"
      data-pv-modal="open"
    >
      <div
        ref={panelRef}
        id="pv-detail-backdrop"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="pv-card flex max-h-dvh w-full flex-col sm:max-w-2xl sm:rounded-2xl outline-none"
      >
        {/* header */}
        <div className="flex items-start gap-3 border-b border-ink-100 px-5 py-3.5 dark:border-ink-850">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-ink-400 dark:text-paper-500">
              <span>{prompt.category || 'Uncategorized'}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{prompt.description || 'No description'}</span>
            </div>
            <h2 id="pv-detail-title" className="mt-1 text-lg font-semibold leading-snug">
              {prompt.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:text-paper-500 dark:hover:bg-ink-850"
            aria-label="Close detail view"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {(prompt.tags || []).length ? (
            <div className="flex flex-wrap items-center gap-1.5 text-[13px]">
              <Hash className="h-3.5 w-3.5 text-ink-400 dark:text-paper-500" aria-hidden="true" />
              {prompt.tags.map((t) => (
                <span key={t} className="rounded-md border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono text-[11px] text-ink-600 dark:border-ink-800 dark:bg-ink-900 dark:text-paper-300">
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          {prompt.description ? (
            <p className="text-sm leading-relaxed text-ink-700 dark:text-paper-300">
              {prompt.description}
            </p>
          ) : null}

          <section aria-label="Prompt body" className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-paper-500">
                Full prompt
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-ink-400 dark:text-paper-500">
                <Copy className="h-3 w-3" aria-hidden="true" />
                {bodyChars} chars
              </div>
            </div>
            <pre className="max-h-[52vh] overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-ink-100 bg-ink-50 px-4 py-3 font-mono text-[13px] leading-relaxed text-ink-800 dark:border-ink-850 dark:bg-ink-900 dark:text-paper-200">
              {prompt.body}
            </pre>
          </section>

          {prompt.usageInstructions ? (
            <Section icon={CornerDownLeft} title="Usage instructions">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700 dark:text-paper-300">
                {prompt.usageInstructions}
              </p>
            </Section>
          ) : null}

          {prompt.notes ? (
            <Section icon={StickyNote} title="Notes">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700 dark:text-paper-300">
                {prompt.notes}
              </p>
            </Section>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-ink-100 bg-ink-50/70 px-3 py-2 text-[12px] text-ink-500 dark:border-ink-850 dark:bg-ink-900/60 dark:text-paper-400">
            <div className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-medium">Created</span>
              {formatDateTime(prompt.createdAt)}
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-medium">Updated</span>
              {formatDateTime(prompt.updatedAt)}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 px-5 py-3 dark:border-ink-850">
          <button
            type="button"
            onClick={handledCopy}
            className="pv-btn bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy full prompt
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={!!prompt.favorite}
            className={`pv-btn border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 ${
              prompt.favorite
                ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                : 'text-ink-700 dark:text-paper-300 hover:bg-ink-50 dark:hover:bg-ink-700'
            }`}
          >
            <Heart className="h-4 w-4" aria-hidden="true" fill={prompt.favorite ? 'currentColor' : 'none'} />
            {prompt.favorite ? 'Favorited' : 'Favorite'}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="pv-btn border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-paper-300 hover:bg-ink-50 dark:hover:bg-ink-700"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="pv-btn ml-auto border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <Trash className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="space-y-1.5">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-paper-500">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

export default PromptDetail;
