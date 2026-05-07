# [CLIENT NAME] — [PUB NAME] Desk

## Always do first

- **Invoke `frontend-design`** before writing any frontend code, every session, no exceptions.

## Skills

| Skill | When to invoke |
|---|---|
| `frontend-design` | Before writing any frontend code |
| `editorial` | Before writing or editing any article or long-form content |
| `copywriting` | Before writing CTAs or short marketing copy |
| `mobile-responsive` | Before shipping any page, or when debugging a mobile layout issue |
| `superpowers:brainstorming` | Before designing any new feature |
| `superpowers:systematic-debugging` | When hitting any bug |
| `gsd:new-project` | When planning a full structured build with multiple phases |

---

## Before we start

This file has placeholders. **Ask me for each one before doing anything else.** Do not write any code until all placeholders are filled in.

| Placeholder | What it is | How to find it |
|---|---|---|
| `[CLIENT NAME]` | Client's umbrella brand name | — |
| `[PUB NAME]` | This publication's display name | e.g. `Advocates of Mine` |
| `[PUB_DOMAIN]` | This publication's domain, no protocol | e.g. `advocatesomi.com` |
| `[PUBLICATION_ID]` | This publication's UUID in Supabase | `select id from publications where domain = '[PUB_DOMAIN]'` |

Once I give you the answers, find and replace every placeholder in this file, then confirm what you replaced before proceeding.

---

## What this project is

Content desk for [PUB NAME] — one publication in [CLIENT NAME]'s platform. Lives at `desk.[PUB_DOMAIN]`. Writers submit articles, editors approve them, super admin has full access. Not crawled.

This desk **writes** to the shared Supabase project. The public site at `[PUB_DOMAIN]` **reads** from it. All publications share one Supabase project scoped by `publication_id`.

## Paired projects

| Site | URL | Purpose |
|---|---|---|
| Public site | `[PUB_DOMAIN]` | Readers — published articles only |
| This desk | `desk.[PUB_DOMAIN]` | Writers + editors |
| Ops panel | `ops.[umbrella-domain]` | Super admin — manages all publications |

## Tech stack

- Vanilla HTML/CSS/JS — no frameworks, no build step
- Netlify hosting — deploy via CLI only
- Supabase for auth + data — email/password login, RLS on all tables
- System fonts only

**Deploy command:**
```bash
source .env && npx netlify deploy --prod --dir=. --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
```

## Auth and roles

Supabase email/password. Three roles, all scoped to this publication via `publication_id`.

| Role | Can do |
|---|---|
| `writer` | Create and edit own articles, submit for review |
| `editor` | View all articles, approve or reject, add rejection note |
| `super_admin` | All of the above across all publications |

```sql
-- Writer/editor/super_admin: scoped to this publication
auth.uid() in (
  select id from profiles
  where publication_id = '[PUBLICATION_ID]'
  and role in ('writer', 'editor', 'super_admin')
)

-- Super admin: bypass publication scope
auth.uid() in (select id from profiles where role = 'super_admin')
```

Users are added via the ops panel or Supabase dashboard — no self-signup.

**Note:** SQL Editor in Supabase dashboard runs as service_role and bypasses RLS. Verify RLS using the REST API with the anon key.

## robots.txt

```
User-agent: *
Disallow: /
```

Private subdomain. Block all crawlers. No sitemap. No JSON-LD.

## Content workflow

```
writer drafts → submits for review → editor approves → published (live on public site)
                                   → editor rejects → draft + rejection note
```

Article `status`: `draft` | `in_review` | `published` | `rejected`

Writers cannot publish directly. Editors cannot author articles. Super admin can do both.

## Articles table schema

```sql
articles (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid references publications(id) not null,
  author_id uuid references profiles(id) not null,
  slug text not null,
  title text,
  subtitle text,
  date date,
  section text,
  hero_image text,
  content text,
  content_format text default 'markdown',
  seo_title text,
  seo_description text,
  status text default 'draft',         -- 'draft' | 'in_review' | 'published' | 'rejected'
  rejection_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(publication_id, slug)
)
```

**RLS:**
- Public: SELECT where `status = 'published'` and `publication_id = '[PUBLICATION_ID]'`
- Writer: SELECT/INSERT/UPDATE own articles where `author_id = auth.uid()`
- Editor: SELECT all, UPDATE status + rejection_note
- Super admin: full access

## Pages to build

- [ ] `index.html` — login → article list with status badges + role-appropriate controls
- [ ] `articles/edit.html` — markdown editor
  - **Writer:** Cmd+S → save draft · Submit button → `in_review`
  - **Editor:** Approve button → `published` · Reject button → `rejected` + rejection note field
  - **Super admin:** all controls
- [ ] `robots.txt` — `Disallow: /`

## Secrets management

Three tiers. Never mix.

**`.env` — local dev only, never committed**
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
NETLIFY_AUTH_TOKEN=
NETLIFY_SITE_ID=
```

**Netlify dashboard — production server-side only**
```
SUPABASE_SERVICE_ROLE_KEY=    ← never in frontend
RESEND_API_KEY=               ← Phase 2, newsletter
```

**Never in frontend code:** `SUPABASE_SERVICE_ROLE_KEY`, any secret API key

## WAT Framework (Workflows, Agents, Tools)

**Layer 1 — Workflows** (`workflows/`): Markdown SOPs.
**Layer 2 — Agent** (you): Read the workflow, run tools, handle errors.
**Layer 3 — Tools** (`tools/`): Scripts that do the actual work.

### Workflows

| Workflow | What it does |
|---|---|
| `publish-article.md` | Editor approves → status updated → article live on public site |
| `send-newsletter.md` | Compose + send to subscribers via Resend (Phase 2) |
| `deploy.md` | Deploy desk to Netlify via CLI |

### Tools

| Tool | What it does |
|---|---|
| `supabase-client.py` | CRUD helper for Supabase REST API |
| `send-newsletter.py` | POST to Resend API (Phase 2) |
| `deploy.sh` | Netlify deploy using `.env` vars |

## Rules and reference

Read these before building anything:

- **`docs/build-rules.md`** — architecture, DNS, stack, secrets, design
- **`docs/core-values.md`** — the principles behind the rules
- **`docs/learnings.md`** — what surprised us across past projects

Key rules:
- Private subdomain — no public links, no crawling, no sitemap
- `toffer@post205.com` never in source
- Service role key never in frontend
- Deploy via CLI only
- Always scope queries to `publication_id = '[PUBLICATION_ID]'` — never query across publications

## Folder structure

```
[project-root]/
├── CLAUDE.md
├── .env                    ← never commit
├── .env.example
├── netlify.toml
├── robots.txt              ← Disallow: /
├── index.html              ← login + article list
├── articles/
│   └── edit.html           ← markdown editor with role-aware controls
├── workflows/
│   ├── publish-article.md
│   ├── send-newsletter.md
│   └── deploy.md
├── tools/
│   ├── supabase-client.py
│   ├── send-newsletter.py
│   └── deploy.sh
└── docs/
    ├── build-rules.md
    ├── core-values.md
    └── learnings.md
```
