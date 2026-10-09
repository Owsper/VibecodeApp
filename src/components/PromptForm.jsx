/**
 * <PromptForm /> — create OR edit. Mount with a valid `prompt` to enter edit mode.
 *
 * Props:
 *   open
 *   prompt: null | stored record (edit mode)
 *   categories: string[]
 *   onClose()
 *   onSubmit(values): void     (parent handles create/update + close)
 *   onDirtyChange(isDirty)     (optional; used by parent to show discard)
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Save, AlertCircle, Info } from 'lucide-react';

const EMPTY = {
  title: '',
  description: '',
  body: '',
  category: '',
  tagsText: '',
  notes: '',
  usageInstructions: '',
};

export function PromptForm({
  open,
  prompt,
  categories = [],
  onClose,
  onSubmit,
}) {
  const mode = prompt ? 'edit' : 'create';
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const dirtyRef = useRef(false);

  // initialize form values when the dialog opens
  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (prompt) {
      dirtyRef.current = false;
      setValues({
        title: prompt.title || '',
        description: prompt.description || '',
        body: prompt.body || '',
        category: prompt.category || '',
        tagsText: (prompt.tags || []).join(', '),
        notes: prompt.notes || '',
        usageInstructions: prompt.usageInstructions || '',
      });
    } else {
      dirtyRef.current = false;
      setValues(EMPTY);
    }
    // focus first field
    const t = setTimeout(() => {
      document.getElementById('pv-prompt-title')?.focus();
    }, 30);
    return () => clearTimeout(t);
  }, [open, prompt]);

  // Track dirty for discard protection
  useEffect(() => {
    const initial = prompt
      ? {
          title: prompt.title || '',
          description: prompt.description || '',
          body: prompt.body || '',
        }
      : { title: '', description: '', body: '' };
    const dirty =
      values.title !== initial.title ||
      values.description !== initial.description ||
      values.body !== initial.body ||
      values.category !== (prompt?.category || '') ||
      values.tagsText !== (prompt?.tags || []).join(', ');
    dirtyRef.current = dirty;
    return () => {};
  }, [values, prompt]);

  const visibleCats = useMemo(() => {
    const known = ['Coding','Writing','Study','Research','Productivity','Business','Design','Creativity'];
    const order = new Map(known.map((c, i) => [c, i]));
    const all = new Set(categories);
    all.add(values.category);
    return Array.from(all).filter(Boolean).sort((a, b) => {
      const ai = order.get(a) ?? Number.MAX_SAFE_INTEGER;
      const bi = order.get(b) ?? Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.localeCompare(b);
    });
  }, [categories, values.category]);

  if (!open) return null;

  function update(k, v) {
    setValues((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => {
      if (!prev[k]) return prev;
      const n = { ...prev };
      delete n[k];
      return n;
    });
  }

  function attemptSubmit() {
    const v = {
      title: values.title.trim(),
      description: values.description.trim(),
      body: values.body.trim(),
      category: values.category.trim() || 'Uncategorized',
      tagsText: values.tagsText,
      notes: values.notes.trim(),
      usageInstructions: values.usageInstructions.trim(),
    };
    const nextErrors = {};
    if (!v.title) nextErrors.title = 'Title is required.';
    if (!v.body) nextErrors.body = 'The full prompt body is required.';
    if (v.title.length > 140) nextErrors.title = 'Keep the title under 140 characters.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    dirtyRef.current = false;
    onSubmit?.(v);
  }

  function handleCancel() {
    if (dirtyRef.current) {
      // Use the custom confirm dialog below
      setConfirmOpen(true);
      return;
    }
    onClose?.();
  }

  const [confirmOpen, setConfirmOpen] = useState(false);

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
    if (e.key === 'Tab') {
      // simple focus trap
      const panel = document.getElementById('pv-prompt-form');
      const focusables = panel?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-ink-950/50 p-0 sm:p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pv-prompt-form-title"
      data-pv-modal="open"
    >
      <div
        id="pv-prompt-form"
        onKeyDown={onKeyDown}
        className="pv-card flex max-h-dvh w-full flex-col sm:max-w-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5 dark:border-ink-850">
          <h2 id="pv-prompt-form-title" className="text-base font-semibold">
            {mode === 'edit' ? 'Edit prompt' : 'Add a prompt'}
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:text-paper-500 dark:hover:bg-ink-850"
            aria-label="Close form"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <Field
            id="pv-prompt-title"
            label="Title"
            value={values.title}
            error={errors.title}
            onChange={(v) => update('title', v)}
            placeholder="a short name for this prompt"
            required
          />

          <Field
            label="Short description"
            value={values.description}
            onChange={(v) => update('description', v)}
            placeholder="One line: what this prompt is for"
          />

          <Field
            id="pv-prompt-body"
            label="Prompt body"
            value={values.body}
            error={errors.body}
            onChange={(v) => update('body', v)}
            placeholder="Paste the full prompt…"
            rows={7}
            mono
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Category"
              value={values.category}
              onChange={(v) => update('category', v)}
              placeholder="e.g. Coding, Study"
              list="pv-categories"
            />
            <Field
              label="Tags (comma separated)"
              value={values.tagsText}
              onChange={(v) => update('tagsText', v)}
              placeholder="code-review, refactor"
            />
            <datalist id="pv-categories">
              {visibleCats.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <Field
            label="Notes (optional)"
            value={values.notes}
            onChange={(v) => update('notes', v)}
            placeholder="Anything to remember when reusing this prompt"
            rows={2}
          />

          <Field
            label="Usage instructions (optional)"
            value={values.usageInstructions}
            onChange={(v) => update('usageInstructions', v)}
            placeholder="How to fill in placeholders, what to replace"
            rows={2}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-100 px-5 py-3 dark:border-ink-850">
          <button
            type="button"
            className="pv-btn border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-paper-300 hover:bg-ink-50 dark:hover:bg-ink-700"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pv-btn bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
            onClick={attemptSubmit}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {mode === 'edit' ? 'Save changes' : 'Create prompt'}
          </button>
        </div>
      </div>

      {confirmOpen ? (
        <ConfirmDialogShell
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => { setConfirmOpen(false); onClose?.(); }}
          onStay={() => setConfirmOpen(false)}
        />
      ) : null}
    </div>
  );
}

function Field({
  id, label, value, onChange, placeholder, rows, mono, error, required, list,
}) {
  return (
    <label className={mono ? 'block' : 'block'}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-[13px] font-medium text-ink-700 dark:text-paper-300">
          {label}{required ? <span className="text-rose-500"> *</span> : null}
        </span>
      </div>
      {rows > 1 ? (
        <textarea
          id={id}
          list={list}
          rows={rows}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`pv-field w-full resize-y ${mono ? 'font-mono text-[12px]' : ''} ${
            error ? 'border-rose-400 dark:border-rose-500/60' : ''
          }`}
          aria-invalid={!!error}
        />
      ) : (
        <input
          id={id}
          list={list}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`pv-field w-full ${error ? 'border-rose-400 dark:border-rose-500/60' : ''}`}
          aria-invalid={!!error}
        />
      )}
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </label>
  );
}

function ConfirmDialogShell({ onCancel, onConfirm, onStay }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="pv-discard-title"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div className="pv-card w-full max-w-sm p-5">
        <h3 id="pv-discard-title" className="text-base font-semibold">Discard changes?</h3>
        <p className="mt-2 text-sm text-ink-500 dark:text-paper-400">
          You have unsaved edits. If you close now, they will be lost.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="pv-btn border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-paper-300" onClick={onStay}>
            Keep editing
          </button>
          <button type="button" className="pv-btn bg-rose-500 text-white hover:bg-rose-600" onClick={onConfirm}>
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromptForm;
