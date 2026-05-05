# [CLIENT NAME] — Website

## Always do first

- **Invoke `frontend-design`** before writing any frontend code, every session, no exceptions.
- Check `images/` for existing brand assets before designing. Use real assets — do not use placeholders where real logos, colors, or images exist.

## Skills

| Skill | When to invoke |
|---|---|
| `frontend-design` | Before writing any frontend code |
| `mobile-responsive` | Before shipping any page, or when debugging a mobile layout issue |
| `copywriting` | Before writing any page copy, headlines, CTAs, or privacy policy text |
| `firecrawl` | When researching competitors, reference sites, or existing client content |
| `superpowers:brainstorming` | Before designing any new page or feature section |
| `superpowers:systematic-debugging` | When hitting any bug |
| `gsd:new-project` | When planning a full structured build with multiple phases |

---

## Before we start

This file has placeholders. **Ask me for each one before doing anything else.** Do not write any code until all placeholders are filled in.

| Placeholder | What it is | Example |
|---|---|---|
| `[CLIENT NAME]` | Client's business name | Vienna United |
| `[DOMAIN]` | Their domain, no protocol | viennaunited.com |
| `[YEAR]` | Current year | 2026 |

Once I give you the answers, find and replace every placeholder in this file, then confirm what you replaced before proceeding.

---

## What this project is

Public marketing website for [CLIENT NAME]. Lives at `[DOMAIN]`. Built on Netlify. Reads content from Supabase. This is a display layer — no admin, no editor, no private routes.

## Paired subdomains (separate projects, separate repos)

| Subdomain | Purpose |
|---|---|
| `desk.[domain]` | Content management — articles, copy, images |
| `sign.[domain]` | Proposals and service agreements (client-facing, UUID-gated) |
| `ops.[domain]` | POST 205 business operations — Toffer only |

## Tech stack

- Vanilla HTML/CSS/JS — no frameworks, no build step
- Netlify hosting — deploy via CLI only (GitHub push does NOT auto-deploy)
- Supabase for data — anon key is safe client-side (RLS enforces access)
- System fonts only — no Google Fonts, no web fonts, zero external font requests

**Deploy command:**
```bash
source .env && npx netlify deploy --prod --dir=. --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
```

**Local dev server:**
```bash
node serve.mjs
```
Serves the project root at `http://localhost:3000`. Always develop and screenshot from localhost — never from a `file:///` URL (breaks relative fetches and CORS).

**Reference image workflow (when a design reference exists):**
Match layout, spacing, typography, and color exactly. Don't improve or add to the design. Screenshot from localhost, compare against reference, fix mismatches, screenshot again. Do at least 2 comparison rounds. Stop only when no visible differences remain.

## Design system

| Token | Dark | Light |
|---|---|---|
| Background | `#18181A` | `#f2f8f8` |
| Surface | `#1a2424` | `#f4fefe` |
| Surface 2 | `#252f2f` | `#e0fffe` |
| Border | `#1f3535` | `#c8eeed` |
| Text | `#f0f0f2` | `#0a1a1a` |
| Text 2 | `#7aacac` | `#4a6262` |
| Text 3 | `#629a9a` | `#4a7070` |
| Accent | `#3BD1D3` | `#2db8ba` |
| On accent | `#021616` | `#021616` |

**Typography:**
- Headings: `system-ui, -apple-system, sans-serif` weight 800
- Body: `system-ui, -apple-system, sans-serif` weight 400
- Mono/labels: `ui-monospace, monospace` weight 400

**Reading column (text-heavy pages):** 680px max-width

**Anti-generic guardrails:**
- **Shadows:** Never flat `box-shadow: 0 2px 4px rgba(0,0,0,0.1)`. Use layered shadows with low opacity and a color tint from the palette.
- **Typography:** Tight letter-spacing (`-0.03em`) on large headings. Generous line-height (`1.7`) on body text.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth where appropriate.
- **Animations:** Only animate `transform` and `opacity`. Never `transition: all`. Use `cubic-bezier` easing.
- **Interactive states:** Every clickable element needs `:hover`, `:focus-visible`, and `:active` states. No exceptions.
- **Images:** Add a gradient overlay (`linear-gradient(to top, rgba(0,0,0,0.6), transparent)`) where images carry text.
- **Spacing:** Use CSS custom property tokens — not arbitrary values. Keep a consistent spacing scale.
- **Depth:** Follow the layering system in the design tokens (Background → Surface → Surface 2). Elements should sit at distinct z-planes, not all at the same level.

## Pages to build

- [ ] `index.html` — homepage (hero, case studies or services, CTA with chat widget)
- [ ] `privacy.html` — privacy policy (RA 10173 compliant, plain language)
- [ ] `robots.txt` — `Allow: /` (public, fully crawlable)
- [ ] `sitemap.xml` — all public pages
- [ ] `js/cookie-banner.js` — theme preference notice, SVG icon, localStorage only
- [ ] `netlify.toml` — routing rules

## Standard patterns

**Contact:** Netlify form only. No mailto links. No email address in source.

**Theme:** Dark / light / system toggle. Persists via localStorage. Default: system.

**Footer:** `© [YEAR] · [CLIENT NAME]` + city only. No full street address. Privacy Policy link in accent color.

**Cookie banner:** Slides in from bottom. Dismisses to localStorage. Links to privacy.html.

**JSON-LD schema:** Organisation type, name, URL, logo, address. No email field.

**Privacy policy:** RA 10173 sections: who we are, what we collect (data table), cookies, who we share with (classes only — no vendor names), how we protect, retention, 7 rights, DPO contact, NPC complaint path.

## Secrets management

Three tiers. Never mix them.

**`.env` — local dev only, never committed to git**
Safe for keys used from the command line or that are already public (anon key is safe — RLS protects it).
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
NETLIFY_AUTH_TOKEN=
NETLIFY_SITE_ID=
```

**Netlify dashboard environment variables — production server-side secrets**
Set via Netlify UI or CLI (`netlify env:set KEY value`). These are injected into Netlify Functions at runtime. Never written to any file.
```
SUPABASE_SERVICE_ROLE_KEY=    ← server-side only
RESEND_API_KEY=               ← if email is needed
STRIPE_SECRET_KEY=            ← if payments are needed
ANTHROPIC_API_KEY=            ← if AI features are needed
```

**Never in frontend code — regardless of where the key is stored**
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS, exposes all data if leaked
- Any secret API key — treat as a password

**`.env.example` — committed to git, values blank**
Documents what keys are needed without exposing any values.

## WAT Framework (Workflows, Agents, Tools)

This project follows the WAT architecture. AI handles orchestration; deterministic scripts handle execution. When a task involves multiple steps or an external API, use a workflow + tool rather than doing it all inline.

**Layer 1 — Workflows** (`workflows/`): Markdown SOPs. Each defines the objective, inputs, which tool to call, expected output, and how to handle failure.
**Layer 2 — Agent** (you): Read the relevant workflow. Run tools in sequence. Handle errors. Ask when blocked.
**Layer 3 — Tools** (`tools/`): Scripts that do the actual work — consistent, testable, fast.

Before building anything new, check `tools/` first. Only create a new script when nothing exists for that task. When a tool fails, fix it, verify the fix, then update the workflow so it doesn't fail the same way again.

### Workflows in this project

| Workflow | What it does |
|---|---|
| `deploy.md` | Deploy to Netlify via CLI with env vars |
| `sitemap-update.md` | Regenerate `sitemap.xml` from current pages |

### Tools in this project

| Tool | What it does |
|---|---|
| `deploy.sh` | Runs the Netlify deploy command using `.env` vars |
| `sitemap-gen.py` | Scans HTML files, writes `sitemap.xml` with correct base URL |

## Rules and reference

Read these three files before building anything — they're in `docs/`:

- **`build-rules.md`** — what we always do (architecture, DNS, stack, secrets, design)
- **`core-values.md`** — why we do it (the principles behind the rules)
- **`learnings.md`** — what surprised us across past projects (add to this after every build)

Key rules from `build-rules.md`:

- Admin never lives on this domain — always `desk.[domain]`
- `toffer@post205.com` never in source — not in HTML, not in JSON-LD
- Vendor names (Supabase, Resend, Netlify) never in client-facing copy
- Deploy via CLI only

## Folder structure

```
[project-root]/
├── CLAUDE.md
├── .env                    ← never commit
├── .env.example
├── netlify.toml
├── robots.txt
├── sitemap.xml
├── index.html
├── privacy.html
├── images/
│   ├── logo.png
│   ├── favicon.svg
│   ├── favicon-32.png
│   └── apple-touch-icon.png
├── js/
│   └── cookie-banner.js
├── workflows/
│   ├── deploy.md
│   └── sitemap-update.md
├── tools/
│   ├── deploy.sh
│   └── sitemap-gen.py
└── docs/
    ├── build-rules.md
    └── core-values.md
```
