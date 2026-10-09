# PromptVault

**Your best prompts. Organized. Ready to use.**

A personal, local-first prompt library for people who use AI assistants
for studying, writing, programming, research, and creative work.

## Overview

PromptVault is a static React app — no account, no backend, no API keys.
It lives entirely in your browser (LocalStorage) and works offline.

## Problem

Useful prompts get scattered across chats, notes, browser tabs, and
documents. PromptVault gives you one place to save, categorize, search,
favorite, and reuse them.

## Intended audience

Students, developers, writers, designers, and anyone who uses AI
assistants multiple times a week.

## Main features

- Create / edit / delete prompts (title, body, description, category,
  tags, optional notes, optional usage instructions)
- Search across title, description, body, category, and tags
- Category, Favorites, and Recently-Added views
- Sort by newest, oldest, alphabetical, or recently updated
- Dark and light themes (persisted)
- One-click copy-to-clipboard for any prompt
- JSON export (backup) and import (merge or replace)
- 10 realistic sample prompts seeded on first launch (resettable)
- Keyboard shortcuts: `⌘/Ctrl+K` focuses search, `N` opens a new prompt
- Toast notifications and confirmation dialogs for destructive actions
- Responsive from 375 px to 1440 px and up

## Tech stack

React 18 · Vite 6 · Tailwind CSS 3 · Lucide React · LocalStorage
· Clipboard API. No backend, no database, no environment variables.

## Project structure

