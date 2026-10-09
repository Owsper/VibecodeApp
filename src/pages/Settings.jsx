/**
 * Settings — theme, export/import, data reset, destructive clear-all,
 * app info. Every destructive action goes through a custom ConfirmDialog.
 */

import { useState, useRef } from 'react';
import {
  Palette,
  Download,
  Upload,
  Sparkles,
  Trash,
  Info,
  Sun,
  Moon,
  Keyboard,
  AlertTriangle,
} from 'lucide-react';

import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';

export function Settings({
  pv,
  theme, setTheme,
  toasts,
}) {
  const { prompts, exportData, importData, resetDemo, clearAll, counts } = pv;
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const clearRef = useRef(null);
  const fileRef = useRef(null);

  // --- Clipboard helpers via window-level promise so the react tree can update
  async function handleExport() {
    const r = exportData();
    if (!r?.ok) toasts.pushError(r?.error || 'Export failed');
    else toasts.pushSuccess(`Exported ${prompts.length} prompts`);
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    toasts.pushInfo(`Importing ${file.name}…`, { ttl: 1400 });
    const r = await importData(file, { mode: 'merge', keepIds: false });
    if (!r?.ok) {
      toasts.pushError(r?.error || 'Import failed');
    } else {
      toasts.pushSuccess(`Imported ${r.count} prompts (merged)`);
    }
  }

  function handleResetDemo() {
    if (prompts.length > 0) {
      setConfirmReset(true);
      return;
    }
    resetDemo();
    toasts.pushSuccess('Sample prompts restored');
  }

  function handleClearAll() {
    if (prompts.length === 0) {
      toasts.pushInfo('Library is already empty');
      return;
    }
    setConfirmClear(true);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 md:px-6 md:py-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
          <Palette className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-ink-900 dark:text-paper-100">Settings</h2>
          <p className="mt-0.5 text-sm text-ink-500 dark:text-paper-400">
            Theme, backup &amp; restore, and library maintenance.
          </p>
        </div>
      </div>

      {/* Theme */}
      <Section icon={Sun} title="Theme">
        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle theme={theme} setTheme={setTheme} size="lg" />
          <span className="text-sm text-ink-500 dark:text-paper-400">
            Currently using the <strong className="text-ink-800 dark:text-paper-200">{theme}</strong> theme. Pick whichever reads best on your display.
          </span>
        </div>
      </Section>

      {/* Keyboard shortcuts */}
      <Section icon={Keyboard} title="Keyboard shortcuts">
        <ul className="grid gap-1.5 text-sm text-ink-600 dark:text-paper-300 sm:grid-cols-2">
          <li className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2 dark:border-ink-850">
            <span>Focus search</span>
            <kbd className="rounded border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-850 px-1.5 py-0.5 font-mono text-xs">⌘K / Ctrl+K</kbd>
          </li>
          <li className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2 dark:border-ink-850">
            <span>Open Add Prompt</span>
            <kbd className="rounded border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-850 px-1.5 py-0.5 font-mono text-xs">N</kbd>
          </li>
          <li className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2 dark:border-ink-850">
            <span>Close any dialog</span>
            <kbd className="rounded border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-850 px-1.5 py-0.5 font-mono text-xs">Esc</kbd>
          </li>
        </ul>
      </Section>

      {/* Backup */}
      <Section icon={Download} title="Backup &amp; restore">
        <p className="mb-3 text-sm leading-relaxed text-ink-600 dark:text-paper-300">
          Move your library to a different browser or device with a single JSON file. Your data lives only in this browser — no cloud, no sync. Show <strong>{counts.total}</strong> prompts ready to export.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="pv-btn bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
            disabled={counts.total === 0}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export library
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="pv-btn border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-paper-300 hover:bg-ink-50 dark:hover:bg-ink-700"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Merge a backup…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportFile}
            aria-label="Select a PromptVault backup file"
          />
        </div>
        <p className="mt-2 text-xs text-ink-500 dark:text-paper-500">
          Importing never executes JSON. Malformed files are rejected with an error, and merged prompts are given fresh IDs so nothing collides.
        </p>
      </Section>

      {/* Sample prompts */}
      <Section icon={Sparkles} title="Demo data">
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex-1 text-sm text-ink-600 dark:text-paper-300">
            Replaces your entire library with the original curated samples
            you loaded on your first visit. Use to wipe out false starts without
            a hard reset.
          </p>
          <button
            type="button"
            onClick={handleResetDemo}
            className="pv-btn border border-violet-500/40 bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Reset to sample library
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <div id="danger" className="mt-8 overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-50/40 p-5 dark:bg-rose-950/20">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-rose-500/15 p-2 text-rose-500">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold">Danger zone</h3>
            <p className="mt-0.5 text-sm text-ink-600 dark:text-paper-400">
              Permanently deletes every prompt on this device. This action
              cannot be undone.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleClearAll}
                className="pv-btn bg-rose-500 text-white hover:bg-rose-600"
                disabled={counts.total === 0}
              >
                <Trash className="h-4 w-4" aria-hidden="true" />
                Clear everything
              </button>
              {counts.total === 0 ? (
                <span className="text-xs text-ink-500 dark:text-paper-500">
                  Library is already empty
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* App info */}
      <Section icon={Info} title="About PromptVault">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <InfoItem label="App version" value="1.0.0" />
          <InfoItem label="Schema version" value="1 (v1 keys)" />
          <InfoItem label="Build" value="static — no backend" />
          <InfoItem label="Storage" value="this browser&apos;s LocalStorage" />
        </dl>
        <p className="mt-3 text-xs text-ink-500 dark:text-paper-500">
          PromptVault is a personal-product project. It is 100% local-first:
          prompts, favorites, theme, and any other preference live in your
          browser&apos;s LocalStorage under a <code>promptvault:v1:</code> key
          prefix. There is no account, no telemetry, no network call.
        </p>
      </Section>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Replace library with sample prompts?"
        body={`${prompts.length} prompts will be removed and replaced by the original sample library. This action cannot be undone.`}
        confirmLabel="Replace with sample"
        onConfirm={() => {
          setConfirmReset(false);
          resetDemo();
          toasts.pushSuccess('Sample prompts restored');
        }}
      />

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all prompts?"
        body={`This will permanently delete ${prompts.length} prompts from ${window.navigator?.userAgent?.includes('Mobile') ? 'this device' : 'this browser'}. This cannot be undone.`}
        confirmLabel="Delete everything"
        onConfirm={() => {
          setConfirmClear(false);
          clearAll();
          toasts.pushWarning('Library cleared');
        }}
      />
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-ink-900 dark:text-paper-100">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-850 text-ink-500 dark:text-paper-400">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        {title}
      </h3>
      <div className="pv-card p-4">{children}</div>
    </section>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-1.5 dark:border-ink-850">
      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-paper-500">{label}</dt>
      <dd className="truncate text-sm text-ink-800 dark:text-paper-100">{value}</dd>
    </div>
  );
}

export default Settings;
