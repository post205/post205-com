# [ENTITY NAME] — Ops

## Always do first

- **Invoke `frontend-design`** before writing any frontend code, every session, no exceptions.

## Skills

| Skill | When to invoke |
|---|---|
| `frontend-design` | Before writing any frontend code |
| `mobile-responsive` | Before shipping any page, or when debugging a mobile layout issue |
| `firecrawl` | When researching client context, integrations, or business processes |
| `superpowers:brainstorming` | Before designing any new feature or workflow |
| `superpowers:systematic-debugging` | When hitting any bug |
| `gsd:new-project` | When planning a full structured build with multiple phases |

---

## Before we start

This file has placeholders. **Ask me for each one before doing anything else.** Do not write any code until all placeholders are filled in.

| Placeholder | What it is | How to find it |
|---|---|---|
| `[ENTITY NAME]` | Business name this tool is for | — |
| `[DOMAIN]` | The ops subdomain, no protocol | e.g. `ops.post205.com` |
| `[TOFFER_UID]` | Your Supabase user UUID | Supabase dashboard → Authentication → Users → copy your ID |

Once I give you the answers, find and replace every placeholder in this file, then confirm what you replaced before proceeding.

---

## What this project is

Internal back-office tool for [ENTITY NAME]. Lives at `[DOMAIN]`. Toffer-only (or small named team) — never linked publicly, never crawled. Auth is the only door.

This is not a public site and not a content editor. It's a command center: clients, projects, billing, documents, and any operational data the business needs to manage.

## Paired subdomains (separate projects, separate repos)

| Subdomain | Purpose |
|---|---|
| `[base domain]` | Public website — reads from Supabase |
| `desk.[domain]` | Content management — articles, copy |
| `sign.[domain]` | Proposals and service agreements (UUID-gated) |

## Tech stack

- Vanilla HTML/CSS/JS — no frameworks, no build step
- Netlify hosting — deploy via CLI only (GitHub push does NOT auto-deploy)
- Supabase for auth + data — email/password login, RLS on all tables
- System fonts only — no Google Fonts, no external font requests

**Deploy command:**
```bash
source .env && npx netlify deploy --prod --dir=. --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
```

## Auth

Supabase email/password. RLS on all tables. Use `(SELECT auth.uid())` — not `auth.uid()` — in every RLS policy to avoid recursion and improve performance.

**Toffer-only (single user):**
```sql
(SELECT auth.uid()) = '[TOFFER_UID]'::uuid
```

**Small named team (multiple users):**
Use a `profiles` table with a `role` column (`admin`, `editor`, `viewer`). RLS policies reference role:
```sql
(SELECT auth.uid()) IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
```
Add users via Supabase dashboard — no self-signup.

**`requireAuth()` pattern — halts execution cleanly:**
```js
async function requireAuth() {
  const { data } = await db.auth.getSession();
  const session = data?.session ?? null;
  if (!session) {
    window.location.href = '/login/';
    await new Promise(() => {}); // never resolves — halts page execution
  }
  return session;
}
```
Call `await requireAuth()` at the top of every page init. No other guards needed.

**Login page** must check session first and redirect to `/` if already signed in.

## Navigation

Sidebar nav — copy the sidebar HTML into every page (no build step means no components). Extract nav wiring into a named function called on every page init.

Folder-based routing — each section is its own folder:
```
clients/index.html  → /clients/
projects/index.html → /projects/
```
Never use `.html` in internal links.

## Security

**`escHtml` on every user-supplied string in innerHTML — no exceptions:**
```js
function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```
Put this in `/js/utils.js`. Import once, use everywhere. Every field from the database goes through it before `innerHTML`. Skipping it is an XSS vulnerability.

**All colors in JS-generated HTML go through CSS variables:**
```js
`<span style="color:var(--accent)">text</span>`  // correct
`<span style="color:#3BD1D3">text</span>`         // wrong — breaks theme toggle
```

## Common data patterns

**Compute status from dates — don't store it:**
For documents with expiry dates, compute status at render time from `expiry_date` vs today. Stored status goes stale. Computed status is always correct.

**Replace `prompt()` and `confirm()` with inline forms:**
Browser dialogs are jarring and unblockable on some browsers. Pattern: hide the trigger button, insert a form in place (input + Save + Cancel), handle Cancel by restoring the button.

**Verify RLS by API — not the SQL Editor:**
The SQL Editor runs as service_role and bypasses RLS. Test access control using the REST API with the anon key in a private browser window.

## robots.txt

```
User-agent: *
Disallow: /
```

Private tool. Block all crawlers. No sitemap. No JSON-LD.

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
RESEND_API_KEY=               ← if email notifications needed
ANTHROPIC_API_KEY=            ← if AI features needed
XENDIT_SECRET_KEY=            ← if Xendit billing needed
STRIPE_SECRET_KEY=            ← if Stripe payments needed
```

**Never in frontend code — regardless of where the key is stored**
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS entirely, exposes all data if leaked
- Any secret API key — treat as a password

**`.env.example` — committed to git, values blank**
Documents what keys are needed without exposing any values.

**`js/env.js` — gitignored, sets `window.ENV`**
```js
window.ENV = {
  SUPABASE_URL: 'https://xxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJ...'  // must be in quotes — bare value causes silent JS error
};
```
Load order in every HTML file: Supabase CDN → `env.js` → `supabase-client.js`.
After every fresh clone, `env.js` must be created manually — it's never in the repo.

## Pages to build

- [ ] `login/index.html` — auth gate, redirects to `/` if already signed in
- [ ] `index.html` — dashboard / home overview
- [ ] `clients/index.html` — client list + add client
- [ ] `robots.txt` — `Disallow: /`

Add more sections as needed. Each section = its own folder.

## WAT Framework (Workflows, Agents, Tools)

This project follows the WAT architecture. AI handles orchestration; deterministic scripts handle execution. Ops is where WAT pays off most — client onboarding, proposals, billing checks, and invoices are all multi-step processes with external APIs.

**Layer 1 — Workflows** (`workflows/`): Markdown SOPs. Each defines the objective, inputs, which tool to call, expected output, and how to handle failure.
**Layer 2 — Agent** (you): Read the relevant workflow. Run tools in sequence. Handle errors. Ask when blocked.
**Layer 3 — Tools** (`tools/`): Scripts that do the actual work — consistent, testable, fast.

Before building anything new, check `tools/` first. Only create a new script when nothing exists for that task. When a tool fails, fix it, verify the fix, then update the workflow so it doesn't fail the same way again.

### Workflows in this project

| Workflow | What it does |
|---|---|
| `onboard-client.md` | Create client record in Supabase, set up profile, output subdomain CNAME instructions |
| `generate-proposal.md` | Draft proposal content, store in Supabase, return `sign.post205.com/p/[uuid]` URL |
| `create-sla.md` | Draft service agreement, store in Supabase, return `sign.post205.com/sa/[uuid]` URL |
| `billing-check.md` | Fetch Xendit subscription statuses, compare to client records, flag mismatches |
| `send-invoice.md` | Generate invoice content, send via Resend to client email, log in Supabase |
| `deploy.md` | Deploy to Netlify via CLI with env vars |

### Tools in this project

| Tool | What it does |
|---|---|
| `supabase-client.py` | CRUD on clients, projects, proposals, SLA tables via service role key |
| `xendit-check.py` | Fetch subscription statuses from Xendit API, return structured list |
| `resend-send.py` | Send transactional email via Resend (invoice, proposal notification, SLA notification) |
| `generate-uuid-doc.py` | Insert proposal or SLA record into Supabase, return UUID-gated sign URL |
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
├── js/
│   ├── env.js              ← never commit (gitignored)
│   ├── supabase-client.js  ← creates global db
│   ├── theme.js            ← sets data-theme before first paint
│   └── utils.js            ← escHtml and shared helpers
├── css/
│   └── base.css            ← design tokens + global styles
├── login/
│   └── index.html
├── index.html              ← dashboard
├── clients/
│   └── index.html
├── workflows/
│   ├── onboard-client.md
│   ├── generate-proposal.md
│   ├── create-sla.md
│   ├── billing-check.md
│   ├── send-invoice.md
│   └── deploy.md
├── tools/
│   ├── supabase-client.py
│   ├── xendit-check.py
│   ├── resend-send.py
│   ├── generate-uuid-doc.py
│   └── deploy.sh
└── docs/
    ├── build-rules.md
    ├── core-values.md
    └── learnings.md
```
