# [CLIENT NAME] — Publication Ops

## Always do first

- **Invoke `frontend-design`** before writing any frontend code, every session, no exceptions.

## Skills

| Skill | When to invoke |
|---|---|
| `frontend-design` | Before writing any frontend code |
| `mobile-responsive` | Before shipping any page, or when debugging a mobile layout issue |
| `firecrawl` | When researching client publications or integration options |
| `superpowers:brainstorming` | Before designing any new feature or workflow |
| `superpowers:systematic-debugging` | When hitting any bug |
| `gsd:new-project` | When planning a full structured build with multiple phases |

---

## Before we start

This file has placeholders. **Ask me for each one before doing anything else.** Do not write any code until all placeholders are filled in.

| Placeholder | What it is | How to find it |
|---|---|---|
| `[CLIENT NAME]` | Client's umbrella brand name | — |
| `[UMBRELLA_DOMAIN]` | Their main domain, no protocol | e.g. `digitaladvocateph.com` |
| `[TOFFER_UID]` | Your Supabase user UUID | Supabase dashboard → Authentication → Users → copy your ID |

Once I give you the answers, find and replace every placeholder in this file, then confirm what you replaced before proceeding.

---

## What this project is

Super admin control center for [CLIENT NAME]'s publication platform. Lives at `ops.[UMBRELLA_DOMAIN]`. Toffer + client super admin only — never linked publicly, never crawled. Auth is the only door.

This ops panel **manages** all publications, users, and account settings. It reads from and writes to the shared Supabase project that all publications use.

## Paired projects (separate repos, separate Netlify sites)

| Site | URL | Purpose |
|---|---|---|
| Marketing site | `[UMBRELLA_DOMAIN]` | Public umbrella brand site |
| This ops panel | `ops.[UMBRELLA_DOMAIN]` | Super admin control center |
| Publication desk | `desk.[pub-domain]` | Writers + editors per publication |
| Publication site | `[pub-domain]` | Public-facing articles per publication |

All share one Supabase project. Each is a separate Netlify site.

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

Supabase email/password. RLS on all tables. Super admin only.

```sql
-- Super admin access
auth.uid() in (select id from profiles where role = 'super_admin')
```

**Note:** SQL Editor in Supabase dashboard runs as service_role and bypasses RLS. Always verify RLS using the REST API with the anon key.

## robots.txt

```
User-agent: *
Disallow: /
```

Private subdomain. Block all crawlers. No sitemap. No JSON-LD.

## What ops manages

| Function | Supabase table | Notes |
|---|---|---|
| Publications | `publications` | Add, view, deactivate publications |
| Users | `profiles` + `auth.users` | Add writers/editors, assign to publication |
| Articles overview | `articles` | Read-only cross-publication view |
| Account/billing | — | Contact and invoice management with POST205 |

## Database schema (shared across all sites)

```sql
publications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text unique not null,
  slug text unique not null,
  status text default 'active',        -- 'active' | 'inactive'
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
  status text default 'draft',         -- 'draft' | 'in_review' | 'published' | 'rejected'
  rejection_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(publication_id, slug)
)
```

## Pages to build

- [ ] `index.html` — login → publications dashboard (all pubs, article counts, status)
- [ ] `publications/index.html` — list all publications, add new, deactivate
- [ ] `users/index.html` — list all users across publications, add writer/editor, assign to publication
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
SUPABASE_SERVICE_ROLE_KEY=    ← needed for user management, never in frontend
RESEND_API_KEY=               ← if email notifications needed
```

**Never in frontend code:** `SUPABASE_SERVICE_ROLE_KEY`, any secret API key

## WAT Framework (Workflows, Agents, Tools)

**Layer 1 — Workflows** (`workflows/`): Markdown SOPs.
**Layer 2 — Agent** (you): Read the workflow, run tools, handle errors.
**Layer 3 — Tools** (`tools/`): Scripts that do the actual work.

### Workflows

| Workflow | What it does |
|---|---|
| `add-publication.md` | Create new publication row in Supabase |
| `add-user.md` | Invite user to Supabase auth + create profile with role + publication |
| `deploy.md` | Deploy ops panel to Netlify via CLI |

### Tools

| Tool | What it does |
|---|---|
| `add-user.py` | Invite user to Supabase auth + insert profile row |
| `supabase-client.py` | CRUD helper for Supabase REST API |
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

## Folder structure

```
[project-root]/
├── CLAUDE.md
├── .env                    ← never commit
├── .env.example
├── netlify.toml
├── robots.txt              ← Disallow: /
├── index.html              ← login + publications dashboard
├── publications/
│   └── index.html          ← manage publications
├── users/
│   └── index.html          ← manage users across publications
├── workflows/
│   ├── add-publication.md
│   ├── add-user.md
│   └── deploy.md
├── tools/
│   ├── add-user.py
│   ├── supabase-client.py
│   └── deploy.sh
└── docs/
    ├── build-rules.md
    ├── core-values.md
    └── learnings.md
```
