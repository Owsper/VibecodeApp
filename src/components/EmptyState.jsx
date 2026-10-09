/**
 * <EmptyState /> — reusable "nothing here" visual.
 *
 * Props:
 *   icon: <Icon /> (a Lucide icon element)
 *   title: string
 *   description?: string (or children)
 *   actions?: ReactNode (button / link placed under description)
 *   promptHint?: string (showed as subtle <kbd> hint if provided)
 */

import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon, title, description = '', children, actions, promptHint,
}) {
  return (
    <div className="pv-card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-500/10 text-violet-500">
          {Icon ? <Icon className="h-6 w-6" aria-hidden="true" /> : <Inbox className="h-6 w-6" aria-hidden="true" />}
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 ring-2 ring-ink-50 dark:ring-ink-950">
          <span className="h-1 w-1 rounded-full bg-violet-400" />
        </div>
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink-900 dark:text-paper-200">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-500 dark:text-paper-400">
          {description}
        </p>
      ) : children ? (
        <div className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-500 dark:text-paper-400">
          {children}
        </div>
      ) : null}
      {actions ? <div className="mt-5 flex flex-wrap justify-center gap-2">{actions}</div> : null}
      {promptHint ? (
        <p className="mt-4 text-xs text-ink-400 dark:text-paper-500">
          Tip: press <kbd className="rounded border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-850 px-1.5 py-0.5 font-mono text-[11px]">{promptHint}</kbd> to {promptHint.startsWith('?') ? 'use prompt' : 'try it'}
        </p>
      ) : null}
    </div>
  );
}

export default EmptyState;
