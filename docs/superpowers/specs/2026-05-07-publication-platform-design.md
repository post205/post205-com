# Publication Platform — Design Spec

> **For agentic workers:** This is a design spec, not an implementation plan. Use it as the source of truth when an implementation plan is written. Do not build directly from this file.

**Date:** 2026-05-07
**Status:** Approved
**Template:** `docs/templates/publication/CLAUDE.md`

---

## Goal

A multi-publication platform for media clients who run one or more independent publications under a single umbrella brand. The client manages everything from one secure ops panel. Writers and editors work in publication-specific desks. Readers access clean public-facing sites.

Built as a reusable template — POST205 spins this up per client.

---

## Reference client: Digital Advocate PH

| Site | URL | Purpose |
|---|---|---|
| Marketing site | `digitaladvocateph.com` | Public landing page for the umbrella brand |
| Ops panel | `ops.digitaladvocateph.com` | Super admin — manages all publications |
| Publication 1 (public) | `advocatesomi.com` | Public-facing publication |
| Publication 1 (desk) | `desk.advocatesomi.com` | Writers + editors for publication 1 |
| Publication 2 (public) | `inspirasyon.ph` | Public-facing publication |
| Publication 2 (desk) | `desk.inspirasyon.ph` | Writers + editors for publication 2 |

Additional publications follow the same pattern: one public site + one desk per publication.

---

## What this is not

- Not a SaaS product — POST205 manages one Supabase project per client
- Not real-time collaborative editing — one writer per article at a time
- Not a reader paywall (Phase 1) — public reading only; paywall is roadmap
- Not self-serve signup — users added via Supabase dashboard or ops panel only
- Not crawlable (ops, desks) — `robots.txt Disallow: /` on all non-public sites

---

## Architecture

### Option chosen: Shared Supabase, separate Netlify sites

One Supabase project per client. A `publications` table scopes all content. Each domain is a separate Netlify site (deployed via CLI). The ops panel has cross-publication visibility via the shared database.

**Why this over alternatives:**
- Ghost-style (separate instance per publication) = duplicate cost and fragmented admin
- Monorepo subpaths = loses clean per-publication domain identity
- Shared Supabase = one billing account, unified admin, RLS handles scoping

### Sites per client

```
[umbrella-domain].com              ← marketing site (public, crawlable)
ops.[umbrella-domain].com          ← ops panel (private, not crawled)
[publication-domain].com           ← public site (public, crawlable)
desk.[publication-domain].com      ← desk (private, not crawled)
```

Each site is:
- Separate Netlify site with its own `NETLIFY_SITE_ID`
- Separate Claude Code session and repo
- Shares one Supabase project via `SUPABASE_URL` + `SUPABASE_ANON_KEY`

---

## Roles

Three roles, scoped per publication via `profiles` table:

| Role | Access |
|---|---|
| `super_admin` | All publications — ops panel + all desks |
| `editor` | One publication — desk only, can approve/reject articles |
| `writer` | One publication — desk only, can draft and submit articles |

A writer on advocatesomi.com who also writes for inspirasyon.ph has **two separate accounts** — one per publication desk. Same email can exist in both Supabase auth tables (separate publications).

Super admin can log into any desk using their super_admin credentials — RLS allows it.

---

## Content workflow

```
writer drafts → writer submits for review → editor approves → published
                                          → editor rejects → back to draft (with note)
```

Article `status` values: `draft` | `in_review` | `published` | `rejected`

Writer cannot publish directly. Editor cannot write articles. Super admin can do both.

---

## Database schema

### Core tables (shared across publications)

```sql
publications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text unique not null,         -- e.g. 'advocatesomi.com'
  slug text unique not null,           -- e.g. 'advocatesomi'
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

### Roadmap tables (Phase 2+)

```sql
subscribers (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid references publications(id) not null,
  email text not null,
  status text default 'active',        -- 'active' | 'unsubscribed'
  created_at timestamptz default now(),
  unique(publication_id, email)
)

site_content (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid references publications(id) not null,
  section text not null,               -- 'hero' | 'about' | 'cta'
  content jsonb,
  updated_at timestamptz default now()
)
```

---

## RLS policies

### articles

```sql
-- Public: read published articles for their publication only
create policy "public read published"
on articles for select
using (status = 'published');

-- Writers: read/write own articles in their publication
create policy "writer access"
on articles for all
using (
  auth.uid() in (
    select id from profiles
    where publication_id = articles.publication_id
    and role in ('writer', 'editor', 'super_admin')
  )
);

-- Editors: can update status (approve/reject)
-- Handled at application layer — editors can update any article in their publication
```

### profiles

```sql
-- Users can read profiles in their own publication
create policy "read own publication profiles"
on profiles for select
using (
  publication_id = (
    select publication_id from profiles where id = auth.uid()
  )
  or
  auth.uid() in (select id from profiles where role = 'super_admin')
);
```

---

## Sites breakdown

### 1. Marketing site (`[umbrella-domain].com`)

Same as website template. Public, crawlable. Describes the umbrella brand and links to publications. No auth. Static content or Supabase `site_content` table.

### 2. Ops panel (`ops.[umbrella-domain].com`)

Super admin only. Not crawled. Manages:
- All publications (add, deactivate)
- All users across publications (add writer/editor, assign to publication)
- Cross-publication article overview and stats
- Account and billing with POST205 (view invoices, contact)

RLS: `auth.uid() in (select id from profiles where role = 'super_admin')`

### 3. Public site (`[publication-domain].com`)

Per publication. Public, crawlable. Reads from Supabase — shows published articles only. No auth required. Same architecture as website template.

Pages:
- `/` — homepage with latest articles
- `/[section]` — section listing
- `/[slug]` — individual article

### 4. Desk (`desk.[publication-domain].com`)

Per publication. Writers + editors + super admin. Not crawled.

Pages:
- `index.html` — login → article list with status badges
- `articles/edit.html` — markdown editor, submit for review / approve / reject

Writer sees: own articles only, submit button
Editor sees: all articles in publication, approve/reject buttons
Super admin sees: all articles, all controls

---

## Secrets management

Three tiers — same as all POST205 projects. Never mix.

**`.env` — local dev only, never committed**
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
NETLIFY_AUTH_TOKEN=
NETLIFY_SITE_ID=
```

**Netlify dashboard — production server-side**
```
SUPABASE_SERVICE_ROLE_KEY=    ← never in frontend
RESEND_API_KEY=               ← when newsletter is built
```

**Never in frontend code:** `SUPABASE_SERVICE_ROLE_KEY`, any secret API key

---

## WAT framework

### Ops panel workflows

| Workflow | What it does |
|---|---|
| `add-publication.md` | Create new publication in Supabase + provision desk |
| `add-user.md` | Add writer or editor to a publication |
| `billing-check.md` | Review POST205 invoices and account status |
| `deploy.md` | Deploy ops panel to Netlify |

### Desk workflows

| Workflow | What it does |
|---|---|
| `publish-article.md` | Editor approves → status → published → public site live |
| `send-newsletter.md` | Compose + send to publication subscribers via Resend (Phase 2) |
| `deploy.md` | Deploy desk to Netlify |

### Tools (shared across sites)

| Tool | What it does |
|---|---|
| `supabase-client.py` | CRUD helper for Supabase REST API |
| `deploy.sh` | Netlify deploy using `.env` vars |
| `add-user.py` | Invite user to Supabase auth + create profile row |

---

## Phase scope

### Phase 1 — This build
- All four site types (marketing, ops, public, desk)
- Auth with three roles
- Article draft → review → publish workflow
- Super admin cross-publication view

### Phase 2 — Roadmap
- Newsletter (Resend, per publication, subscriber opt-in)
- Reader subscriber management in ops panel
- Homepage copy editor in desk
- Paid/member access (paywall)
- Community features (reader accounts, comments)

---

## Influence: how global publications approach this

| Pattern | NYT/Guardian | Ghost | Our approach |
|---|---|---|---|
| Content layer | Headless CMS, API-first | Separate instance per pub | Shared Supabase, `publications` table scopes content |
| Multiple publications | Custom CMS per brand | Pay per instance | One Supabase, separate Netlify sites |
| Editorial workflow | Draft → review → publish | No built-in approval | Same: draft → in_review → published |
| Admin across pubs | Yes (custom built) | No | Yes — ops panel |
| Reader subscriptions | Custom | Built-in | Phase 2 via Resend |

Key lesson from NYT's Scoop/Oak: separate content management from presentation. We apply this — Supabase is the content layer, Netlify sites are the presentation layer.
