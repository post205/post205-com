# [CLIENT NAME] — Desk

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

## Rules

Read `docs/build-rules.md` before building anything. Key ones:

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
└── docs/
    ├── build-rules.md
    └── core-values.md
```
