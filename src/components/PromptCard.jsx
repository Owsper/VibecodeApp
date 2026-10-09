/**
 * <PromptCard /> — single tile in the library grid.
 *
 * Props:
 *   prompt
 *   onOpen(id)
 *   onEdit(id)
 *   onToggleFavorite(id)
 *   onCopy(prompt)      (async; parent handles the toast)
 */

import { memo } from 'react';
import {
  Heart,
  Copy,
  Pencil,
  Eye,
  Code2,
  BookOpen,
  GraduationCap,
  FlaskConical,
  Zap,
  Briefcase,
  Palette,
  Lightbulb,
  Tag,
} from 'lucide-react';
import { formatShortDate } from '../utils/dates.js';

const CATEGORY_STYLE = {
  Coding: { bg: 'bg-sky-500/15', fg: 'text-sky-600 dark:text-sky-300', Icon: Code2 },
  Writing: { bg: 'bg-rose-500/15', fg: 'text-rose-600 dark:text-rose-300', Icon: BookOpen },
  Study: { bg: 'bg-emerald-500/15', fg: 'text-emerald-600 dark:text-emerald-300', Icon: GraduationCap },
  Research: { bg: 'bg-indigo-500/15', fg: 'text-indigo-600 dark:text-indigo-300', Icon: FlaskConical },
  Productivity: { bg: 'bg-violet-500/15', fg: 'text-violet-600 dark:text-violet-300', Icon: Zap },
  Business: { bg: 'bg-amber-500/15', fg: 'text-amber-600 dark:text-amber-300', Icon: Briefcase },
  Design: { bg: 'bg-teal-500/15', fg: 'text-teal-600 dark:text-teal-300', Icon: Palette },
  Creativity: { bg: 'bg-fuchsia-500/15', fg: 'text-fuchsia-600 dark:text-fuchsia-300', Icon: Lightbulb },
};
const FALLBACK = { bg: 'bg-ink-100 dark:bg-ink-850', fg: 'text-ink-600 dark:text-paper-400', Icon: Tag };

export const PromptCard = memo(function PromptCard({
  prompt,
  onOpen, onEdit, onToggleFavorite, onCopy,
  showDate = false,
}) {
  if (!prompt) return null;
  const cat = CATEGORY_STYLE[prompt.category] || FALLBACK;
  const BodyPreview = bodyPreview(prompt.body, 280);

  return (
    <article
      className="pv-card pv-card-hover group relative flex flex-col gap-3 overflow-hidden p-4"
      aria-label={prompt.title}
    >
      {/* Top row: category badge + favorite */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cat.bg} ${cat.fg}`}
        >
          <cat.Icon className="h-3 w-3" aria-hidden="true" />
          {prompt.category || 'Uncategorized'}
        </span>
        <button
          type="button"
          onClick={() => onToggleFavorite?.(prompt.id)}
          aria-pressed={!!prompt.favorite}
          aria-label={prompt.favorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`rounded-full px-2 py-1 text-ink-400 transition ${prompt.favorite ? 'text-rose-500' : 'hover:text-ink-700 dark:hover:text-paper-300'}`}
        >
          <Heart
            className="h-4 w-4"
            aria-hidden="true"
            fill={prompt.favorite ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Title + description */}
      <div>
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-ink-900 dark:text-paper-100">
          {prompt.title}
        </h3>
        {prompt.description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-500 dark:text-paper-400">
            {prompt.description}
          </p>
        ) : null}
      </div>

      {/* Body preview */}
      {prompt.body ? (
        <pre className="pv-preview max-h-28 overflow-hidden whitespace-pre-wrap break-words rounded-lg bg-ink-50 px-3 py-2 font-mono text-[12px] leading-relaxed text-ink-600 dark:bg-ink-900/80 dark:text-paper-400">
          {BodyPreview.more ? (
            <>
              {BodyPreview.text}
              <span className="text-ink-400 dark:text-paper-500">…</span>
            </>
          ) : BodyPreview.text}
        </pre>
      ) : null}

      {/* Tags */}
      {(prompt.tags || []).length ? (
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-md border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono text-[11px] text-ink-600 dark:border-ink-800 dark:bg-ink-900 dark:text-paper-400"
            >
              <Tag className="h-2.5 w-2.5 opacity-60" aria-hidden="true" />
              {t}
            </span>
          ))}
          {prompt.tags.length > 4 ? (
            <span className="rounded-md border border-ink-100 bg-ink-50 px-1.5 py-0.5 text-[11px] text-ink-500 dark:bg-ink-900 dark:text-paper-500">
              +{prompt.tags.length - 4}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Footer: date + actions */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-100 pt-3 dark:border-ink-850">
        <span className="text-[11px] uppercase tracking-wider text-ink-400 dark:text-paper-500">
          {showDate
            ? formatShortDate(prompt.updatedAt || prompt.createdAt)
            : `Updated ${formatShortDate(prompt.updatedAt || prompt.createdAt)}`}
        </span>
        <div className="flex items-center gap-1.5 opacity-80 transition group-hover:opacity-100">
          <IconBtn title="Copy prompt"
            onClick={() => onCopy?.(prompt)}
            Icon={Copy}
            ariaLabel={`Copy "${prompt.title}"`}
          />
          <IconBtn title="View full prompt"
            onClick={() => onOpen?.(prompt.id)}
            Icon={Eye}
            ariaLabel={`Open "${prompt.title}"`}
          />
          <IconBtn title="Edit prompt"
            onClick={() => onEdit?.(prompt.id)}
            Icon={Pencil}
            ariaLabel={`Edit "${prompt.title}"`}
          />
        </div>
      </div>
    </article>
  );
});

function IconBtn({ onClick, Icon, title, ariaLabel }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      className="rounded-lg border border-ink-100 bg-white p-2 text-ink-500 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-ink-850 dark:bg-ink-900 dark:text-paper-400 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}

function bodyPreview(body, max = 280) {
  if (!body) return { text: '', more: false };
  const flat = body.replace(/\r\n/g, '\n');
  if (flat.length <= max) return { text: flat, more: false };
  return { text: flat.slice(0, max).trimEnd(), more: true };
}

export default PromptCard;
