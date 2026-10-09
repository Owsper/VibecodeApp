/**
 * PromptVault — main application component.
 * Wires up usePrompts + useTheme + useToasts + keyboard shortcuts,
 * owns: active section, detail view, create/edit form, delete confirm.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePrompts } from './hooks/usePrompts.js';
import { useTheme } from './hooks/useTheme.js';
import { useToasts } from './hooks/useToasts.js';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { copyToClipboard } from './utils/clipboard.js';

import { Layout } from './components/Layout.jsx';
import { PromptForm } from './components/PromptForm.jsx';
import { PromptDetail } from './components/PromptDetail.jsx';
import { ConfirmDialog } from './components/ConfirmDialog.jsx';

import { AllPrompts } from './pages/AllPrompts.jsx';
import { Favorites } from './pages/Favorites.jsx';
import { RecentlyAdded } from './pages/RecentlyAdded.jsx';
import { CategoryView } from './pages/CategoryView.jsx';
import { Settings } from './pages/Settings.jsx';

const SECTION_META = {
  all: { title: 'All Prompts', subtitle: 'Your complete prompt library' },
  favorites: { title: 'Favorites', subtitle: 'The prompts you keep coming back to' },
  recent: { title: 'Recently Added', subtitle: 'New prompts, last 7 days' },
  category: { title: 'Categories', subtitle: 'Browse by topic' },
  settings: { title: 'Settings', subtitle: 'Personalize and manage your library' },
};

export default function App() {
  const pv = usePrompts();
  const { theme, setTheme } = useTheme();
  const toastsHook = useToasts();

  const [category, setCategory] = useState('');
  const [detailId, setDetailId] = useState(null);
  const [form, setForm] = useState({ open: false, prompt: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [onboarded, setOnboarded] = useState(() => {
    try { return !!window.localStorage?.getItem('promptvault:v1:onboarded'); }
    catch { return true; }
  });

  const { prompts } = pv;

  useEffect(() => {
    const p = prompts.find((x) => x.id === detailId);
    document.title = p ? `${p.title} · PromptVault` : 'PromptVault';
  }, [detailId, prompts]);

  const detail = useMemo(
    () => prompts.find((x) => x.id === detailId) || null,
    [prompts, detailId]
  );

  const handleCopy = useCallback(async (prompt) => {
    const text = prompt?.body || prompt?.title || '';
    if (!text) { toastsHook.pushError('Nothing to copy'); return; }
    const r = await copyToClipboard(text);
    if (r.ok) {
      toastsHook.pushSuccess('Prompt copied to clipboard', { ttl: 1800 });
    } else {
      toastsHook.pushError(r.error || 'Clipboard access is unavailable here.');
    }
  }, [toastsHook]);

  const handleAddPrompt = useCallback(() => setForm({ open: true, prompt: null }), []);

  const handleEditPrompt = useCallback((id) => {
    const p = prompts.find((x) => x.id === id);
    if (!p) return;
    if (detailId && detailId !== id) setDetailId(null);
    setForm({ open: true, prompt: p });
  }, [prompts, detailId]);

  const handleOpenPrompt = useCallback((id) => setDetailId(id), []);
  const handleToggleFavorite = useCallback((id) => { pv.toggleFavorite(id); }, [pv.toggleFavorite]);
  const handleOpenDelete = useCallback((id) => setDeleteTarget(id), []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    const p = prompts.find((x) => x.id === deleteTarget);
    pv.deletePrompt(deleteTarget);
    if (detailId === deleteTarget) setDetailId(null);
    setDeleteTarget(null);
    toastsHook.pushSuccess(`Deleted "${p?.title || 'prompt'}"`, { ttl: 2400 });
  }, [deleteTarget, prompts, pv.deletePrompt, toastsHook, detailId]);

  const handleSubmitForm = useCallback((values) => {
    const tags = (values.tagsText || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => t.toLowerCase());
    const cleanTags = Array.from(new Set(tags));
    const payload = {
      title: values.title,
      description: values.description,
      body: values.body,
      category: (values.category || '').trim() || 'Uncategorized',
      tags: cleanTags,
    };
    if (values.notes) payload.notes = values.notes;
    if (values.usageInstructions) payload.usageInstructions = values.usageInstructions;

    if (form.prompt) {
      pv.updatePrompt(form.prompt.id, payload);
      toastsHook.pushSuccess('Prompt updated');
    } else {
      pv.createPrompt(payload);
      toastsHook.pushSuccess(`Created "${payload.title}"`);
    }
    setForm({ open: false, prompt: null });
  }, [form.prompt, pv.createPrompt, pv.updatePrompt, toastsHook]);

  const handleCloseForm = useCallback(() => setForm({ open: false, prompt: null }), []);

  useKeyboardShortcuts({
    onSearch: () => {},
    onNewPrompt: handleAddPrompt,
  });

  const meta = SECTION_META[pv.section] || SECTION_META.all;
  const sectionTitle = pv.section === 'category'
    ? (category || 'Categories')
    : meta.title;
  const sectionSubtitle = pv.section === 'category'
    ? (category ? `Prompts in ${category}` : 'Browse by topic')
    : meta.subtitle;

  const commonActions = {
    onCopy: handleCopy,
    onOpen: handleOpenPrompt,
    onEdit: handleEditPrompt,
    onToggleFavorite: handleToggleFavorite,
  };

  const renderPage = () => {
    switch (pv.section) {
      case 'favorites':
        return <Favorites pv={pv} onAddPrompt={handleAddPrompt} {...commonActions} />;
      case 'recent':
        return <RecentlyAdded pv={pv} {...commonActions} />;
      case 'category':
        return (
          <CategoryView
            pv={pv}
            category={category}
            onBack={(c) => { pv.setSection('category'); setCategory(c || ''); }}
            onClearCategory={() => {
              pv.setSection('all');
              setCategory('');
              pv.setCategoryFilter?.('');
            }}
            {...commonActions}
          />
        );
      case 'settings':
        return (
          <Settings
            pv={pv}
            theme={theme}
            setTheme={setTheme}
            toasts={toastsHook}
          />
        );
      default:
        return (
          <AllPrompts
            pv={pv}
            onAddPrompt={handleAddPrompt}
            onNavigate={(s, c) => {
              pv.setSection(s);
              if (s === 'category') setCategory(c || '');
            }}
            {...commonActions}
          />
        );
    }
  };

  return (
    <>
      <Layout
        title={sectionTitle}
        subtitle={sectionSubtitle}
        section={pv.section}
        onNavigate={(s, c) => {
          pv.setSection(s);
          if (s === 'category') setCategory(c || '');
          else setCategory('');
          if (s === 'all') pv.setCategoryFilter?.('');
          pv.setSearch?.('');
        }}
        activeCategory={category}
        categories={pv.categories}
        counts={pv.counts}
        theme={theme}
        setTheme={setTheme}
        searchValue={pv.search}
        onSearchChange={pv.setSearch}
        onAddPrompt={handleAddPrompt}
        toasts={toastsHook.toasts}
        onDismiss={toastsHook.dismiss}
        onboardingHidden={onboarded}
        onOnboardingDismiss={() => {
          setOnboarded(true);
          try { window.localStorage?.setItem('promptvault:v1:onboarded', '1'); } catch {}
        }}
      >
        {renderPage()}
      </Layout>

      {form.open ? (
        <PromptForm
          open={form.open}
          prompt={form.prompt}
          categories={pv.categories}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {detail ? (
        <PromptDetail
          prompt={detail}
          onClose={() => setDetailId(null)}
          onEdit={() => handleEditPrompt(detail.id)}
          onToggleFavorite={() => handleToggleFavorite(detail.id)}
          onDelete={() => handleOpenDelete(detail.id)}
          onCopy={handleCopy}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete this prompt?"
          body={`"${prompts.find((x) => x.id === deleteTarget)?.title || 'This prompt'}" will be permanently removed from your library. This cannot be undone.`}
          confirmLabel="Delete"
          tone="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </>
  );
}