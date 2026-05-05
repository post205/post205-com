# [CLIENT NAME] — Desk

## Always do first

- **Invoke `frontend-design`** before writing any frontend code, every session, no exceptions.

## Skills

| Skill | When to invoke |
|---|---|
| `frontend-design` | Before writing any frontend code |
| `editorial` | Before writing or editing any article, newsletter body, or long-form content |
| `copywriting` | Before writing newsletter subject lines, CTAs, or short marketing copy |
| `firecrawl` | When researching for an article or gathering reference material |
| `mobile-responsive` | Before shipping any page, or when debugging a mobile layout issue |
| `superpowers:brainstorming` | Before designing any new feature |
| `superpowers:systematic-debugging` | When hitting any bug |
| `gsd:new-project` | When planning a full structured build with multiple phases |

---

## Before we start

This file has placeholders. **Ask me for each one before doing anything else.** Do not write any code until all placeholders are filled in.

| Placeholder | What it is | How to find it |
|---|---|---|
| `[CLIENT NAME]` | Client's business name | — |
| `[DOMAIN]` | Their domain, no protocol | — |
| `[TOFFER_UID]` | Your Supabase user UUID | Supabase dashboard → Authentication → Users → copy your ID |

Once I give you the answers, find and replace every placeholder in this file, then confirm what you replaced before proceeding.

---

## What this project is

Content management subdomain for [CLIENT NAME]'s website at `[DOMAIN]`. Lives at `desk.[domain]`. Toffer-only — no client access, never linked from the public site. Not crawled.

This desk **writes** to Supabase. The public website **reads** from it. They share the same Supabase project. No redirect, no sync — the database is the connection.

## Paired project

Public website: `[DOMAIN]` — separate repo, separate Netlify site. This project only manages content for that site.

## Tech stack

- Vanilla HTML/CSS/JS — no frameworks, no build step
- Netlify hosting — deploy via CLI only
- Supabase for auth + data — email/password login, RLS on all tables
- System fonts only

**Deploy command:**
```bash
source .env && npx netlify deploy --prod --dir=. --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
```

## Auth

Supabase email/password. RLS on all tables.

**For Toffer-only tools (ops, your own desk):**
```sql
auth.uid() = '[TOFFER_UID]'
```

**For client-facing tools (client's desk, portals):**
Use a `profiles` table with a `role` column (`admin`, `editor`, `viewer`). RLS policies reference role:
```sql
-- editors and admins can read
auth.uid() in (select id from profiles where role in ('admin', 'editor'))

-- only admins can publish (update status to 'published')
auth.uid() in (select id from profiles where role = 'admin')
```
Toffer is always `admin`. Client team members are `editor` by default. Editors draft; admins publish. Add users via Supabase dashboard — no self-signup unless explicitly built.

**Note:** SQL Editor in Supabase dashboard runs as service_role and bypasses RLS. Always verify RLS using the REST API with the anon key, not the SQL editor.

## robots.txt

```
User-agent: *
Disallow: /
```

Private subdomain. Block all crawlers. No sitemap. No JSON-LD.

## What desk manages

| Content | Supabase table/bucket | Notes |
|---|---|---|
| Articles / frameworks | `articles` | slug, title, subtitle, date, section, content, status (draft/published) |
| Homepage copy | `site_content` | Editable sections: hero, promises, about, CTA |
| Images | Supabase Storage `images` | Upload here, reference URL in articles or site_content |

## Pages to build

- [ ] `index.html` — login form → article list + status badges + new/edit buttons
- [ ] `articles/edit.html` — split-pane markdown editor
  - Cmd+S → save as draft
  - Cmd+Shift+P → publish
  - Snippets menu: deep-dive, drop-mic, pullquote, prompt-block blocks
- [ ] `robots.txt` — `Disallow: /`

## Articles table schema

```sql
articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text,
  subtitle text,
  date date,
  section text,
  author text,
  hero_image text,
  content text,
  content_format text default 'markdown', -- 'markdown' | 'html'
  seo_title text,
  seo_description text,
  status text default 'draft', -- 'draft' | 'published'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

**RLS:**
- Public: SELECT where status = 'published'
- Authenticated: SELECT, INSERT, UPDATE, DELETE

## Secrets management

Three tiers. Never mix them.

**`.env` — local dev only, never committed to git**
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
NETLIFY_AUTH_TOKEN=
NETLIFY_SITE_ID=
```

**Netlify dashboard environment variables — production server-side secrets**
Set via Netlify UI or CLI (`netlify env:set KEY value`). Never written to any file.
```
SUPABASE_SERVICE_ROLE_KEY=    ← server-side only, never in frontend
RESEND_API_KEY=               ← if email notifications are needed
```

**Never in frontend code — regardless of where the key is stored**
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS entirely, exposes all data if leaked
- Any secret API key

**`.env.example` — committed to git, values blank**
Documents what keys are needed without exposing any values.

## WAT Framework (Workflows, Agents, Tools)

This project follows the WAT architecture. AI handles orchestration; deterministic scripts handle execution. The content publication pipeline is the core use case here — each step from draft to published article to newsletter should have a workflow.

**Layer 1 — Workflows** (`workflows/`): Markdown SOPs. Each defines the objective, inputs, which tool to call, expected output, and how to handle failure.
**Layer 2 — Agent** (you): Read the relevant workflow. Run tools in sequence. Handle errors. Ask when blocked.
**Layer 3 — Tools** (`tools/`): Scripts that do the actual work — consistent, testable, fast.

Before building anything new, check `tools/` first. Only create a new script when nothing exists for that task. When a tool fails, fix it, verify the fix, then update the workflow so it doesn't fail the same way again.

### Workflows in this project

| Workflow | What it does |
|---|---|
| `publish-article.md` | Draft → AI alignment check → publish to Supabase → trigger learnings extraction |
| `send-newsletter.md` | Compose subject + body → preview → send to all active subscribers via Resend |
| `extract-learnings.md` | Pull insights from a published article, append to `docs/learnings.md` |
| `deploy.md` | Deploy to Netlify via CLI with env vars |

### Tools in this project

| Tool | What it does |
|---|---|
| `ai-check.py` | POSTs article content to `/api/ai` (action: `check`), prints flagged paragraphs |
| `send-newsletter.py` | POSTs subject + body to `/api/send-newsletter`, returns delivery status |
| `extract-learnings.py` | POSTs article content to `/api/ai` (action: `extract`), appends result to `docs/learnings.md` |
| `deploy.sh` | Runs the Netlify deploy command using `.env` vars |

## Rules and reference

Read these three files before building anything — they're in `docs/`:

- **`build-rules.md`** — what we always do (architecture, DNS, stack, secrets, design)
- **`core-values.md`** — why we do it (the principles behind the rules)
- **`learnings.md`** — what surprised us across past projects (add to this after every build)

Key rules from `build-rules.md`:

- This is a private subdomain — no public links, no crawling, no sitemap
- `toffer@post205.com` never in source
- Service role key never in frontend code
- Deploy via CLI only

## Folder structure

```
[project-root]/
├── CLAUDE.md
├── .env                    ← never commit
├── .env.example
├── netlify.toml
├── robots.txt              ← Disallow: /
├── index.html              ← login + content list
├── articles/
│   └── edit.html           ← markdown editor
├── workflows/
│   ├── publish-article.md
│   ├── send-newsletter.md
│   ├── extract-learnings.md
│   └── deploy.md
├── tools/
│   ├── ai-check.py
│   ├── send-newsletter.py
│   ├── extract-learnings.py
│   └── deploy.sh
└── docs/
    ├── build-rules.md
    └── core-values.md
```
