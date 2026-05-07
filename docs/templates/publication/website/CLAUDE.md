# [CLIENT NAME] — [PUB NAME]

## Always do first

- **Invoke `frontend-design`** before writing any frontend code, every session, no exceptions.
- Check `images/` for any brand assets before requesting new ones.

## Skills

| Skill | When to invoke |
|---|---|
| `frontend-design` | Before writing any frontend code |
| `copywriting` | Before writing headlines, CTAs, or any reader-facing copy |
| `mobile-responsive` | Before shipping any page, or when debugging a mobile layout issue |
| `firecrawl` | When researching publication topics or reference material |
| `superpowers:brainstorming` | Before designing any new feature or section |
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

Public-facing site for [PUB NAME] — one publication in [CLIENT NAME]'s platform. Lives at `[PUB_DOMAIN]`. Readers access published articles with no login required. Fully crawlable.

This site **reads** from the shared Supabase project. It never writes. Content is managed at `desk.[PUB_DOMAIN]` and published there by editors.

## Paired projects

| Site | URL | Purpose |
|---|---|---|
| This public site | `[PUB_DOMAIN]` | Readers — published articles only |
| Desk | `desk.[PUB_DOMAIN]` | Writers + editors manage content |
| Ops panel | `ops.[umbrella-domain]` | Super admin |

## Tech stack

- Vanilla HTML/CSS/JS — no frameworks, no build step
- Netlify hosting — deploy via CLI only
- Supabase for data — anon key only, read published articles, no auth required
- System fonts only

**Deploy command:**
```bash
source .env && npx netlify deploy --prod --dir=. --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
```

**Local dev server:**
```bash
node serve.mjs  # → http://localhost:3000
```

## Data access

Read-only. Anon key is safe client-side — RLS restricts to published articles for this publication only.

```sql
-- Public query pattern: always scope by publication_id AND status
select * from articles
where publication_id = '[PUBLICATION_ID]'
and status = 'published'
order by date desc;
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in this project — it has no server-side functions.

## robots.txt

```
User-agent: *
Allow: /
```

Public site. Fully crawlable. Include `sitemap.xml`. Use JSON-LD for articles.

## SEO

Every article page needs:
- `<title>` — use `seo_title` if set, fall back to `title`
- `<meta name="description">` — use `seo_description` if set, fall back to `subtitle`
- Canonical URL
- JSON-LD `Article` schema
- Open Graph tags (`og:title`, `og:description`, `og:image` using `hero_image`)

## Pages to build

- [ ] `index.html` — homepage: latest published articles, section nav
- [ ] `article.html` — individual article (loaded by slug from URL param)
- [ ] `section.html` — section listing (loaded by section from URL param)
- [ ] `sitemap.xml` — generated from published articles
- [ ] `robots.txt` — `Allow: /`

## Secrets management

Two tiers only — this site has no server-side functions.

**`.env` — local dev only, never committed**
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
NETLIFY_AUTH_TOKEN=
NETLIFY_SITE_ID=
```

**Never in this project:** `SUPABASE_SERVICE_ROLE_KEY` — this site is read-only, anon key is sufficient.

## WAT Framework (Workflows, Agents, Tools)

**Layer 1 — Workflows** (`workflows/`): Markdown SOPs.
**Layer 2 — Agent** (you): Read the workflow, run tools, handle errors.
**Layer 3 — Tools** (`tools/`): Scripts that do the actual work.

### Workflows

| Workflow | What it does |
|---|---|
| `sitemap-update.md` | Regenerate sitemap.xml from published articles |
| `deploy.md` | Deploy public site to Netlify via CLI |

### Tools

| Tool | What it does |
|---|---|
| `sitemap-gen.py` | Fetches published articles from Supabase, writes sitemap.xml |
| `deploy.sh` | Netlify deploy using `.env` vars |

## Rules and reference

Read these before building anything:

- **`docs/build-rules.md`** — architecture, DNS, stack, secrets, design
- **`docs/core-values.md`** — the principles behind the rules
- **`docs/learnings.md`** — what surprised us across past projects

Key rules:
- Always scope Supabase queries to `publication_id = '[PUBLICATION_ID]'`
- No admin paths, no editor routes — this site is display only
- Reading column: 680px max-width for article body text
- Deploy via CLI only

## Folder structure

```
[project-root]/
├── CLAUDE.md
├── .env                    ← never commit
├── .env.example
├── netlify.toml
├── robots.txt              ← Allow: /
├── sitemap.xml             ← generated by tools/sitemap-gen.py
├── index.html              ← homepage: latest articles
├── article.html            ← individual article (slug via URL param)
├── section.html            ← section listing (section via URL param)
├── images/                 ← brand assets: logo, favicon, og image
├── workflows/
│   ├── sitemap-update.md
│   └── deploy.md
├── tools/
│   ├── sitemap-gen.py
│   └── deploy.sh
└── docs/
    ├── build-rules.md
    ├── core-values.md
    └── learnings.md
```
