# PromptVault — Week 1 Process Log

**Assignment:** Week 1 — Personal Product
**Date:** [TODO: today's date, e.g. 2026-10-09]
**Author:** [TODO: full name]

## 1. Problem being solved

Useful prompts get scattered across chats, notes, and browser tabs.
I needed one local place to save, categorize, search, and reuse them.

## 2. Intended users

Students, developers, writers, designers, and anyone who uses AI
assistants multiple times a week.

## 3. Product idea & rationale

A local-first, no-account, no-backend prompt library. Rationale:
a static site is trivially deployable, has zero privacy risk, and
works offline — which removes the three most common excuses for
not finishing a personal tool.

## 4. Main features implemented

- CRUD on prompts (title, body, description, category, tags,
  favorite flag, optional notes, optional usage instructions)
- Search across title / description / body / category / tags
- Category + Favorites + Recently-Added views with combined filters
- Four sort orders (newest, oldest, A→Z, recently updated)
- Dark/light theme, persisted in LocalStorage
- Copy-to-clipboard with Clipboard API + fallback
- JSON export (backup) and import (merge or replace)
- Keyboard shortcuts (`⌘/Ctrl+K` for search, `N` for new prompt)
- Toast notifications + confirmation dialogs for destructive actions
- 10 realistic sample prompts auto-seeded on first launch, resettable
  from Settings
- Responsive from 375 px (mobile) to desktop
- First-run onboarding banner

[TODO: add or remove any feature you want to highlight]

## 5. Design decisions

- Violet / indigo accents on a deep-ink canvas (primary = dark)
- Tailwind for layout + CSS variables for design tokens
- System font stack (no external font service; works offline)
- No router — internal view switch keeps it a single HTML + JS bundle
- LocalStorage with a versioned prefix `promptvault:v1:` to make
  future storage migrations straightforward

## 6. Technology choices

React 18 · Vite 6 · Tailwind CSS 3 · Lucide React · LocalStorage
· Clipboard API. No backend, no database, no environment secrets,
no AI API calls.

## 7. How AI-assisted coding was used

[TODO: honestly describe what you used the assistant for — scaffolding,
debugging, docs, code review, refactoring, etc. Do NOT paste the full
spec; a paragraph is plenty.]

## 8. Development milestones

- Day 1 — Spec written, project scaffolding
- Day 2 — Data model, storage layer, sample prompts
- Day 3 — Core components (card, form, detail, sidebar, header, toasts)
- Day 4 — Pages + App wiring + theme + keyboard shortcuts
- Day 5 — Docs (README + this log), local build verification

[TODO: adjust the timeline if your real one is different]

## 9. Testing checklist

Before submission, I verified:

- [ ] `npm run build` completes without errors
- [ ] `npm run preview` loads the built site at http://localhost:4173
- [ ] Create / edit / delete a prompt → changes persist after refresh
- [ ] Favorite / unlike → reflected in the Favorites view
- [ ] Search + category filter + sort combine correctly
- [ ] Copy a prompt → toast confirms, text is on the clipboard
- [ ] Export produces a valid `.json` file
- [ ] Import a valid `.json` with "Merge" → prompts are added
- [ ] Import a malformed `.json` → error toast, library unchanged
- [ ] Toggle theme → persists after refresh
- [ ] Keyboard: ⌘/Ctrl+K focuses search, N opens the new-prompt form
- [ ] Confirmation dialogs appear for delete / clear-all
- [ ] Viewport: 375 px and 1440 px both look correct

[TODO: tick the boxes you have actually tested. Leave the rest unchecked
or delete them if N/A. Do not check them without verifying.]

## 10. Challenges & solutions

[TODO: list any real issues you hit — build errors, design decisions,
things you had to redo. One line each. Do not invent these.]

## 11. What I learned

[TODO: 3–5 honest sentences. Do not invent.]

## 12. Potential improvements

- Sync via a hosted JSON vault (optional, user-driven)
- Prompt templates with `{VARIABLE}` substitution
- Command palette (⌘K) that unifies search + actions
- Prompt usage analytics (local-only)
- Archive instead of delete
- Tag-based filtering UI

[TODO: add any of your own]

## 13. Submission artifacts

- Live app URL:        https://[TODO]
- GitHub repo URL:     https://[TODO]
- Public deployment:   [TODO: verify by opening the URL and
  confirming theme + search + copy all work]
