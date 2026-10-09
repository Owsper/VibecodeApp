/**
 * <Layout /> — the app shell: sidebar + header + main + toasts + optional
 * first-run onboarding banner.
 *
 * Consumes props from <App />.
 */

import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { Toasts } from './Toast.jsx';

export function Layout({
  // top-level state
  title, subtitle,
  section, onNavigate,
  activeCategory = '',
  categories = [],
  counts = {},
  theme, setTheme,
  // search
  searchValue, onSearchChange,
  // actions
  onAddPrompt,
  // toast
  toasts, onDismiss,
  // content
  children,
  onboardingHidden, onOnboardingDismiss,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (next, category) => {
    onNavigate?.(next, category);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-dvh bg-ink-50 dark:bg-ink-950">
      <Sidebar
        section={section}
        onSelect={handleNavigate}
        activeCategory={activeCategory}
        categories={categories}
        counts={counts?.categoryCount || {}}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        setTheme={setTheme}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onOpenSidebar={() => setSidebarOpen(true)}
          onAddPrompt={onAddPrompt}
          theme={theme}
          setTheme={setTheme}
        />

        <main id="main" className="flex-1">
          {children}
        </main>
      </div>

      <Toasts toasts={toasts} onDismiss={onDismiss} />

      {!onboardingHidden ? (
        <Onboarding onDismiss={onOnboardingDismiss} onAdd={onAddPrompt} />
      ) : null}
    </div>
  );
}

function Onboarding({ onDismiss, onAdd }) {
  return (
    <aside
      role="complementary"
      aria-label="Getting started"
      className="fixed bottom-4 left-4 z-[80] w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 shadow-md dark:from-violet-950/40 dark:to-indigo-950/40"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">
            Welcome to PromptVault
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink-700 dark:text-paper-300">
            Save the prompts you actually reuse — search, filter, favorite, and copy with one click. Everything stays in your browser.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onAdd}
              className="pv-btn bg-violet-600 text-white hover:bg-violet-700"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              Add your first prompt
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="pv-btn border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-paper-300 hover:bg-ink-50 dark:hover:bg-ink-700"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Layout;
