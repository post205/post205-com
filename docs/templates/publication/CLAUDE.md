# [CLIENT NAME] — Publication Platform

## Always do first

- **Invoke `frontend-design`** before writing any frontend code, every session, no exceptions.

## Skills

| Skill | When to invoke |
|---|---|
| `frontend-design` | Before writing any frontend code |
| `editorial` | Before writing or editing any article, newsletter body, or long-form content |
| `copywriting` | Before writing subject lines, CTAs, or short marketing copy |
| `firecrawl` | When researching client publications, content, or competitors |
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
| `[UMBRELLA_DOMAIN]` | Their main domain, no protocol | e.g. `digitaladvocateph.com` |
| `[PUB_DOMAIN]` | This publication's domain, no protocol | e.g. `advocatesomi.com` |
| `[PUB_NAME]` | This publication's display name | e.g. `Advocates of Mine` |
| `[TOFFER_UID]` | Your Supabase user UUID | Supabase dashboard → Authentication → Users → copy your ID |
| `[PUBLICATION_ID]` | This publication's UUID in Supabase | Run: `select id from publications where domain = '[PUB_DOMAIN]'` |

Once I give you the answers, find and replace every placeholder in this file, then confirm what you replaced before proceeding.

---

## What this project is

A multi-publication platform for [CLIENT NAME]. One Supabase project shared across all publications. Each publication has its own public site and desk. The ops panel at `ops.[UMBRELLA_DOMAIN]` is the super admin control center.

This is a POST205 template — spin up once per client, then once per publication under that client.

## Full site map

| Site | URL | Purpose |
|---|---|---|
| Marketing site | `[UMBRELLA_DOMAIN]` | Public umbrella brand site |
| Ops panel | `ops.[UMBRELLA_DOMAIN]` | Super admin — manages all publications |
| This publication (public) | `[PUB_DOMAIN]` | Public-facing articles |
| This publication (desk) | `desk.[PUB_DOMAIN]` | Writers + editors |

Each site is a separate repo, separate Netlify site, separate Claude Code session. They share one Supabase project.

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

Supabase email/password. RLS on all tables. Users are added via Supabase dashboard or ops panel — no self-signup.

### Roles

| Role | Where they log in | What they can do |
|---|---|---|
| `super_admin` | Ops panel + any desk | Everything across all publications |
| `editor` | Desk for their publication | Read all articles, approve/reject, cannot write |
| `writer` | Desk for their publication | Write and submit own articles only |

**RLS — publication-scoped access:**
```sql
-- Writers and editors: own publication only
auth.uid() in (
  select id from profiles
  where publication_id = '[PUBLICATION_ID]'
  and role in ('writer', 'editor', 'super_admin')
)

-- Super admin: all publications
auth.uid() in (select id from profiles where role = 'super_admin')

-- Public: published articles only
status = 'published'
```

**Note:** SQL Editor in Supabase dashboard runs as service_role and bypasses RLS. Always verify RLS using the REST API with the anon key.

## Content workflow

```
writer drafts → submits for review → editor approves → published
                                   → editor rejects → draft (with note)
```

Article `status`: `draft` | `in_review` | `published` | `rejected`

Writers cannot publish directly. Editors cannot write. Super admin can do both.

## robots.txt

**Ops panel and desks — block all crawlers:**
```
User-agent: *
Disallow: /
```

**Public sites and marketing site — crawlable:**
```
User-agent: *
Allow: /
```

## Database schema

```sql
publications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text unique not null,
  slug text unique not null,
  status text default 'active',
  created_at timestamptz default now()
)

profiles (
  id uuid primary key references auth.users(id),
  publication_id uuid references publications(id),
  role text not null,                  -- 'super_admin' | 'editor' | 'writer'
  display_name text,
  created_at timestamptz default now()
)

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
  status text default 'draft',
  rejection_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(publication_id, slug)
)
```

**Phase 2 (roadmap):**
```sql
subscribers (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid references publications(id) not null,
  email text not null,
  status text default 'active',
  created_at timestamptz default now(),
  unique(publication_id, email)
)
```

## What each site manages

### ops.[UMBRELLA_DOMAIN]
- All publications (add, deactivate)
- All users across publications (add writer/editor, assign to publication)
- Cross-publication article overview
- Account and billing with POST205

### desk.[PUB_DOMAIN]
- Articles for this publication only
- Writer: own drafts + submit for review
- Editor: all articles + approve/reject
- Super admin: all controls

### [PUB_DOMAIN] (public site)
- Published articles only — reads from Supabase
- No auth required
- Pages: `/` (latest), `/[section]`, `/[slug]`

## Pages to build

### Ops panel
- [ ] `index.html` — login → publications dashboard
- [ ] `publications/index.html` — list all publications, add new
- [ ] `users/index.html` — list all users across publications, add/assign
- [ ] `robots.txt` — `Disallow: /`

### Desk (per publication)
- [ ] `index.html` — login → article list with status badges + role-appropriate controls
- [ ] `articles/edit.html` — markdown editor
  - Writer: Cmd+S → save draft, Submit button → in_review
  - Editor: Approve button → published, Reject button → rejected + note
  - Super admin: all controls
- [ ] `robots.txt` — `Disallow: /`

### Public site (per publication)
- [ ] `index.html` — latest published articles
- [ ] `[section]/index.html` — section listing
- [ ] `article.html` — individual article (slug-based)
- [ ] `robots.txt` — `Allow: /`

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

**`.env.example` — committed to git, values blank**

## WAT Framework (Workflows, Agents, Tools)

**Layer 1 — Workflows** (`workflows/`): Markdown SOPs.
**Layer 2 — Agent** (you): Read the workflow, run tools, handle errors.
**Layer 3 — Tools** (`tools/`): Scripts that do the actual work.

### Ops panel workflows

| Workflow | What it does |
|---|---|
| `add-publication.md` | Create publication row in Supabase + provision new desk |
| `add-user.md` | Invite user to Supabase auth + create profile with role |
| `billing-check.md` | Review POST205 invoices and account status |
| `deploy.md` | Deploy ops panel to Netlify |

### Desk workflows

| Workflow | What it does |
|---|---|
| `publish-article.md` | Editor approves → status updated → live on public site |
| `send-newsletter.md` | Compose + send to subscribers via Resend (Phase 2) |
| `deploy.md` | Deploy desk to Netlify |

### Public site workflows

| Workflow | What it does |
|---|---|
| `deploy.md` | Deploy public site to Netlify |

### Tools

| Tool | What it does |
|---|---|
| `supabase-client.py` | CRUD helper for Supabase REST API |
| `add-user.py` | Invite user + create profile row |
| `deploy.sh` | Netlify deploy using `.env` vars |
| `send-newsletter.py` | POST to Resend API (Phase 2) |

## Rules and reference

Read these before building anything:

- **`docs/build-rules.md`** — architecture, DNS, stack, secrets, design
- **`docs/core-values.md`** — the principles behind the rules
- **`docs/learnings.md`** — what surprised us across past projects

Key rules:
- Ops and desks are private subdomains — no public links, no crawling, no sitemap
- `toffer@post205.com` never in source
- Service role key never in frontend
- Deploy via CLI only
- Each publication is a separate Netlify site — never combine into one deploy

## Folder structure

Each site in this platform follows this structure:

```
[project-root]/
├── CLAUDE.md
├── .env                    ← never commit
├── .env.example
├── netlify.toml
├── robots.txt
├── index.html
├── [site-specific pages]
├── workflows/
│   ├── deploy.md
│   └── [site-specific workflows]
├── tools/
│   ├── deploy.sh
│   └── [site-specific tools]
└── docs/
    ├── build-rules.md
    ├── core-values.md
    └── learnings.md
```

## Phase roadmap

| Phase | What gets built |
|---|---|
| 1 | Marketing site + ops panel + public site + desk with full workflow |
| 2 | Newsletter (Resend) + subscriber management |
| 3 | Reader opt-in, paywall, member access |
| 4 | Community features (reader accounts, comments) |
