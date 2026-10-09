/**
 * Sample prompts — a carefully curated starter library.
 *
 * Loaded ONCE on first launch (see `isSeeded`/`setSeeded` in storage.js);
 * subsequent boots never re-seed. Users can re-seed from Settings
 * -> "Reset demo data".
 *
 * Categories in the seed: Coding, Study, Writing, Research,
 * Productivity, Business, Design, Creativity.
 *
 * Format of each prompt (matches the data model + storage.validatePrompt):
 *   {
 *     id: string (uuid)           - stable, generated once
 *     title: string
 *     body: string
 *     description: string
 *     category: string
 *     tags: string[]
 *     favorite: boolean
 *     createdAt: string (ISO)
 *     updatedAt: string (ISO)
 *     notes?: string
 *     usageInstructions?: string
 *   }
 */

import { makeId } from '../utils/ids.js';
import { nowISO } from '../utils/dates.js';

function daysAgoISO(days, hourOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hourOffset);
  return d.toISOString();
}

function seed(nowIso = nowISO()) {
  const t = nowIso;
  return [
    {
      id: makeId(),
      title: 'Explain a Concept Like I\u2019m a Smart 15-Year-Old',
      body: `Explain the topic: {TOPIC}

Rules:
- Use plain English, no buzzwords.
- Use at least one concrete, everyday-life analogy.
- Cap the answer at 250 words.
- End with a single "try this" exercise that tests my understanding.
- If I'm using a term you've defined, keep defining it the same way throughout.`,
      description:
        'A reliable way to turn any dense topic into a crisp, digestible explanation with an analogie and a self-check.',
      category: 'Study',
      tags: ['learning', 'explanation', 'flash-cards'],
      favorite: true,
      createdAt: daysAgoISO(9),
      updatedAt: daysAgoISO(1),
      notes: 'Swap {TOPIC} for any subject. Works best with interview preps.',
      usageInstructions:
        'Replace {TOPIC} with the exact phrase you want explained (including a versioned spec like "TCP keepalive" stays as-is).',
    },
    {
      id: makeId(),
      title: 'Code Review Checklist as a Prompt',
      body: `You are a senior software engineer acting as a strict code reviewer. Review the code block below:

\`\`\`
{CODE}
\`\`\`

Organize your response into these sections:
1. Bugs & correctness   (most damaging first)
2. Performance          (only real, measurable issues)
3. Readability & style  (specific spots, with a suggested rewrite)
4. Security             (input handling, authz, injection risks)
5. Suggested refactor   (one concrete change, not a full rewrite)

Format each item as [SEVERITY] line X: <description> — <one-line fix>.
Do not repeat the original code back. Do not make supportive filler comments.`,
      description:
        'Turn any snippet into a structured, prioritized review with severity labels and one-line fixes.',
      category: 'Coding',
      tags: ['code-review', 'refactor', 'best-practices'],
      favorite: true,
      createdAt: daysAgoISO(8),
      updatedAt: daysAgoISO(3),
      usageInstructions: 'Paste the code inside the fenced block and leave the rest intact.',
    },
    {
      id: makeId(),
      title: 'SHAPE — 30-Second Brainstorm',
      body: `Generate 20 distinct ideas for: {GOAL}

Structure the output as:
- 5 safe & incremental ideas
- 5 solid but slightly risky ideas
- 5 bold & unconventional ideas
- 5 "tue-2025" style wild ideas

After each idea, add a one-line "why it might work" and a one-line risk.`,
      description: 'Fast divergent-thinking prompt for when you need quantity, not polish.',
      category: 'Creativity',
      tags: ['brainstorm', 'ideas', 'divergent-thinking'],
      favorite: false,
      createdAt: daysAgoISO(7),
      updatedAt: daysAgoISO(7),
    },
    {
      id: makeId(),
      title: 'Executive Summary of a Long Document',
      body: `Read the document below. Produce:

1. A 3-sentence TL;DR.
2. The 5 most important claims or findings (bulleted).
3. 3 numbers or statistics the author leans on (quote them exactly).
4. The author's unstated assumption (1 sentence).
5. One sentence: "A skeptic would object that: ___".

Length: no more than 250 words total. No preamble.

DOCUMENT:
"""
{DOCUMENT}
"""\n`,
      description:
        'Condense a long PDF/paper/blog post into an executive summary that flags claims, stats, and blind spots.',
      category: 'Research',
      tags: ['summary', 'paper-reading', 'critique'],
      favorite: false,
      createdAt: daysAgoISO(6),
      updatedAt: daysAgoISO(2),
      usageInstructions:
        'Paste the source between the triple-quoted fences. Works with papers up to ~10 pages pasted full text.',
    },
    {
      id: makeId(),
      title: 'Weekly Planning Ritual — The Weekly Review',
      body: `Help me run a weekly review. Ask me exactly these 5 questions, one at a time, and wait for my answer before moving on:

1. What are the 3 most important things I committed to this week?
2. Which ones did I complete, partially, or drop?
3. What surprised me (good or bad) this week?
4. What's the single biggest risk to next week?
5. What's one thing I want to consciously NOT do next week?

After I answer all 5, summarize my week in 2 sentences and propose next week's top 3 priorities with a one-line cua for each.`,
      description:
        'A structured, AI-driven weekly review that turns scattered notes into 3 clear next-week priorities.',
      category: 'Productivity',
      tags: ['planning', 'retro', 'ritual'],
      favorite: true,
      createdAt: daysAgoISO(5),
      updatedAt: daysAgoISO(4),
    },
    {
      id: makeId(),
      title: 'Blog Post Outliner → First Draft',
      body: `You are a professional B2B content writer. Write a blog post for an audience of {AUDIENCE} about {TOPIC}.

Requirements:
- Tone: confident, plainspoken, no corporate fluff.
- Length: 1,200–1,500 words.
- Start with an opens that is specific (no "In today's world…" openers).
- Use short paragraphs (max 3 lines).
- Include 2 concrete examples relevant to the audience.
- Close with a single, actionable take-away.
- End with 5 SEO tags.

Deliver:
1. Working title (max 12 words)
2. 120-word meta description
3. Full draft
4. 3 headline A/B alternatives`,
      description:
        'Generates a complete on-brand blog draft (title + meta + body + A/B headlines) in one shot.',
      category: 'Writing',
      tags: ['blog', 'seo', 'copywriting'],
      favorite: false,
      createdAt: daysAgoISO(4),
      updatedAt: daysAgoISO(1),
      usageInstructions:
        'Swap {AUDIENCE} (e.g. "SaaS founders") and {TOPIC} (e.g. "async standups that actually work").',
    },
    {
      id: makeId(),
      title: 'Customer-Complaint Triage (P0 = fix first)',
      body: `I will paste a batch of customer complaints. For each one, classify it using:

- Severity: P0 (outage/security), P1 (feature broken), P2 (confusing/annoying), P3 (nice-to-have)
- Category: Bug, UX, Pricing, Onboarding, Feature Request, Docs
- One-sentence root-cause guess

Then produce:
A. A one-line "What to fix first" 
B. A one-line "What to communicate to the customer right now"

Complaints:
"""
{COMPLAINTS}
"""\n`,
      description:
        'Turn a raw pile of customer support messages into a prioritized fix list with comms neurons.',
      category: 'Business',
      tags: ['support', 'triage', 'prioritization'],
      favorite: false,
      createdAt: daysAgoISO(3),
      updatedAt: daysAgoISO(3),
    },
    {
      id: makeId(),
      title: 'Design Critique — WCAG-aware',
      body: `I will describe (or paste a snippet of) a UI. Give me a critique organized as:

1. Hierarchy (1 line) — do the most important elements read first?
2. Whitespace & rhythm (1 line)
3. Type scale (1 line)
4. Color & contrast — call out specifically which pairings fail WCAG AA and suggest the fix
5. Motion & state (1 line)
6. A/B alternatives: two concrete visual changes that would make the biggest difference

Tone: specific, not flattering. If something is fine, skip it.`,
      description:
        'A design critique prompt that pairs taste with concrete WCAG-feasible fixes rather than "make it pop".',
      category: 'Design',
      tags: ['ui', 'accessibility', 'wcag'],
      favorite: false,
      createdAt: daysAgoISO(2),
      updatedAt: daysAgoISO(2),
    },
    {
      id: makeId(),
      title: 'Convert a Meeting Drown Into Action Items',
      body: `Below is a rough transcript of a standup/sync. Extract:

1. Action items — table: [Owner] | Task | Due | Blocked?
2. Decisions made — bulleted, each 1 line
3. Open questions — bulleted
4. "Parking lot" — items that will NOT be discussed today

Format as clean Markdown. If an owner is unclear, put [UNASSIGNED]. If a due date isn't mentioned, put [NO DATE].

TRANSCRIPT:
"""
{TRANSCRIPT}
"""\n`,
      description:
        'Runs a raw meeting memo through a structured digest to turn mundanes into action items & open questions.',
      category: 'Productivity',
      tags: ['meetings', 'notes', 'action-items'],
      favorite: false,
      createdAt: daysAgoISO(1),
      updatedAt: daysAgoISO(1),
    },
    {
      id: makeId(),
      title: 'Name a SaaS Product in 60 Seconds',
      body: `Generate 30 candidate names for a SaaS product with:
- What it does: {WHAT_IT_DOES}
- Target customer: {CUSTOMER}
- Tone: {TONE} (e.g. "serious enterprise", "playful indie", "dev-tool"）

For each name include:
- A 1-line rationale
- Domain sanity check (is something close already registered? be honest)
- A pairing tagline

End with: "My top 3 recommendations because __."`,
      description: 'Turn product positioning into 30 name + tagline candidates with honest gut-feel checks.',
      category: 'Creativity',
      tags: ['branding', 'naming', 'naming'],
      favorite: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
  ];
}

/**
 * Build the seed collection with FRESH IDs + createdAt/updatedAt
 * snapshots so the "Recently Added" demo view always has live content.
 * Called by the storage layer exactly when `isSeeded()` is false.
 */
export function buildSamplePrompts() {
  return seed(nowISO());
}

/**
 * The canonical list of category names we pre-enable. New user-created
 * categories are appended on top of this set (not removed or re-ordered).
 */
export const DEFAULT_CATEGORIES = [
  'Coding',
  'Writing',
  'Study',
  'Research',
  'Productivity',
  'Business',
  'Design',
  'Creativity',
];

export const DEFAULT_TAGS = [
  'code-review',
  'refactor',
  'brainstorm',
  'summary',
  'planning',
  'seo',
  'support',
  'ui',
  'meetings',
];

export default { buildSamplePrompts, DEFAULT_CATEGORIES, DEFAULT_TAGS };
