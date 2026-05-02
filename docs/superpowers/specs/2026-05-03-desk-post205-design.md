# desk.post205.com — Design Spec

> **For agentic workers:** This is a design spec, not an implementation plan. Use it as the source of truth when an implementation plan is written. Do not build directly from this file.

**Date:** 2026-05-03
**Status:** Approved
**Project:** desk.post205.com (separate repo, separate Netlify site, separate Claude Code session)

---

## Goal

A private publishing command center for POST205. Toffer writes articles, runs an AI alignment check, publishes to post205.com via Supabase, and sends to newsletter subscribers. A learnings layer extracts insights from published articles and grows over time.

This is Toffer's primary writing and distribution tool. Not a client tool. Not public.

---

## What this is not

- Not part of the post205 repo — separate project entirely
- Not a client-facing tool — Toffer and editors only
- Not crawlable — `robots.txt Disallow: /`
- Not a general-purpose CMS — it manages POST205 content only
- Not replacing Substack (Time Space Warp stays there — different audience, different content)

---

## Phase scope

### Phase 1 — This build

- Auth (login, editor roles)
- Dashboard
- Articles list
- Article editor with AI alignment check
- Subscribers management
- Newsletter compose and send

### Phase 2 — Deferred

- Learnings browse/search page (nav item exists, marked `soon`)
- Social copy formatter (LinkedIn/Facebook ready text on publish)
- Homepage copy editor (nav item exists, marked `locked`)

---

## Architecture

### Repo and hosting

- Repo: `post205-desk` (private GitHub repo)
- Hosting: Netlify, separate site from post205.com
- Subdomain: `desk.post205.com`
- Stack: Vanilla HTML/CSS/JS — no frameworks, no build step
- Deploy: CLI only (`npx netlify deploy --prod`)

### Supabase

Shares the POST205 Supabase project (`dikuhcaaxxsadlwepblf`). Never mixes with client Supabase projects.

Tables:

```sql
-- Already defined in template
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
  content_format text default 'markdown',
  seo_title text,
  seo_description text,
  status text default 'draft', -- 'draft' | 'published'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

-- Editor roles
profiles (
  id uuid primary key references auth.users(id),
  role text not null default 'editor' -- 'admin' | 'editor'
)

-- AI-extracted insights, populated on publish
learnings (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references articles(id),
  content text not null,
  tags text[],
  created_at timestamptz default now()
)

-- Newsletter subscriber list (lead magnet)
subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  subscribed_at timestamptz default now(),
  status text default 'active' -- 'active' | 'unsubscribed'
)

-- Send history
newsletter_sends (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references articles(id),
  subject text,
  sent_at timestamptz default now(),
  recipient_count integer
)
```

RLS:

`articles` — the role check requires a cross-table join to `profiles`. Use a security-definer helper function:
```sql
-- Helper function (run once)
create or replace function get_my_role()
returns text language sql security definer stable
as $$ select role from profiles where id = auth.uid() $$;

-- RLS policies on articles
create policy "public read published" on articles
  for select using (status = 'published');

create policy "editors read all" on articles
  for select using (get_my_role() in ('admin', 'editor'));

create policy "editors write" on articles
  for insert with check (get_my_role() in ('admin', 'editor'));

create policy "editors update" on articles
  for update using (get_my_role() in ('admin', 'editor'));

create policy "admin delete" on articles
  for delete using (get_my_role() = 'admin');
```

`profiles`: authenticated users read their own row. Writes via Supabase dashboard only.
`learnings`: no client-side RLS needed — all writes go through Netlify Function with service role key.
`subscribers`: admin only — `get_my_role() = 'admin'`.
`newsletter_sends`: admin only — `get_my_role() = 'admin'`.

### Auth

Supabase email/password. Two roles via `profiles` table:

- **admin** — Toffer. Full access. Can publish, send newsletter, manage subscribers.
- **editor** — future team writers. Can create and edit drafts. Cannot publish or send.

No self-signup. Users added via Supabase dashboard only.

### Netlify Functions

All server-side API calls are proxied through Netlify Functions. The frontend never holds sensitive keys. No API key ever appears in any `.html` or client `.js` file.

```
netlify/
  functions/
    ai.js               ← handles /api/ai (Anthropic API — check, fix, extract)
    send-newsletter.js  ← handles /api/send-newsletter (Resend API)
```

**`ai.js` — request contract**

All AI actions POST to `/api/ai` with a JSON body containing an `action` field:

```json
// Check draft for style alignment
{ "action": "check", "content": "<full markdown>", "styleGuide": "<writing-style.md text>", "slopPatterns": "<ai-slop-patterns.md text>", "learnings": ["..."] }

// Fix a single flagged paragraph
{ "action": "fix", "paragraph": "<flagged text>", "patternName": "<pattern>", "explanation": "<why it was flagged>", "styleGuide": "<writing-style.md text>" }

// Extract learnings from a published article (fired after publish)
{ "action": "extract", "content": "<full markdown>", "articleId": "<uuid>" }
```

Responses:
- `check`: `{ flags: [{ anchor, patternName, explanation, suggestedFix }] }`
- `fix`: `{ rewrite: "<suggested paragraph text>", note: "<one-line explanation>" }`
- `extract`: writes directly to `learnings` table via `SUPABASE_SERVICE_ROLE_KEY`, returns `{ ok: true }`

**`send-newsletter.js` — request contract**

POST to `/api/send-newsletter`:
```json
{ "articleId": "<uuid>", "subject": "<string>" }
```
Function fetches article content from Supabase, fetches active subscribers, sends via Resend, records in `newsletter_sends`. Returns `{ sent: <count> }`.

### Environment variables

`.env` (local, never committed):
```
SUPABASE_URL=
SUPABASE_ANON_KEY=        ← public-safe by design, used directly in client JS for auth and reads
NETLIFY_AUTH_TOKEN=
NETLIFY_SITE_ID=
```

Note: `SUPABASE_ANON_KEY` is intentionally public-safe. Supabase designed it to be used in frontend code — RLS enforces access, not key secrecy. It is safe to reference in client JS. It is in `.env` for local dev convenience only, not because it is secret.

Netlify dashboard (production — server-side only, never in frontend):
```
SUPABASE_SERVICE_ROLE_KEY=   ← Netlify Functions only, bypasses RLS for writes
ANTHROPIC_API_KEY=           ← Netlify Functions only (ai.js)
RESEND_API_KEY=              ← Netlify Functions only (send-newsletter.js)
```

---

## Pages

### `index.html` — Login + Dashboard

**Login state:** Email/password form. On success, redirects to dashboard. Session persisted via Supabase auth.

**Auth guard (applies to all pages except `index.html`):** Every page except the login page runs this check at the top of its inline `<script>`:
```js
const { data: { session } } = await supabase.auth.getSession()
if (!session) { window.location.href = '/' }
```
No session → immediate redirect to `index.html`. No page content renders without a valid session.

**Dashboard (authenticated):**

Four stat tiles: Published count, Drafts count, Subscriber count (highlighted in accent), Learnings count.

Recent articles list: title, section, status badge (published teal / draft gray), date. Click to open editor.

Last newsletter send: article title, recipient count, date, "Send next →" shortcut link to Newsletter page.

Primary action: `+ New article` button (top right, accent color).

Nav: always-visible left sidebar.

```
Content
  ▦ Dashboard        ← active
  ✎ Articles
  ◈ Learnings        [soon]

Audience
  ◎ Subscribers
  ⊞ Newsletter

Site
  ⊡ Homepage copy    [locked]
```

Top bar: POST205 logo | desk | breadcrumb. User name + sign out (top right).

---

### `articles/index.html` — Article list

Table or list view. Columns: title, section, status, date, actions (edit, delete).

Filter by status (all / draft / published). Search by title.

`+ New article` creates a blank article record in Supabase, gets back the new UUID, then redirects to `articles/edit.html?id=<uuid>`. The editor reads the `id` query param on load to fetch and save the correct record. Refreshing the editor page reloads the same article. The ← Articles back link always goes to `articles/index.html`.

---

### `articles/edit.html` — Editor

**Layout C:** Full-width split pane. Title in top bar. Metadata in ⚙ drawer.

**Top bar (left to right):**
- ← Articles (back link)
- Title field (editable inline)
- ⚙ (opens metadata drawer)
- ✦ Check button (runs AI alignment check)
- Draft / Published status badge
- Publish button (admin only)

**⚙ Metadata drawer (slides from right, pushes editor — does not overlay):**
- Slug (auto-generated from title, editable)
- Section (text input)
- Date (date picker)
- Hero image (upload or URL)
- Subtitle
- SEO title / SEO description

**Split pane:**
- Left: markdown editor (monospace, line height 1.8)
- Right: live rendered preview

**Image insertion:**
- Drag file onto markdown pane → uploads to Supabase Storage → inserts `![alt](url)` at cursor
- Paste from clipboard → same
- Preview renders image in context immediately

**Supabase Storage:**
- Bucket name: `article-images`
- Access: public bucket — objects served via Supabase CDN URL without auth
- URL format: `<SUPABASE_URL>/storage/v1/object/public/article-images/<filename>`
- Filename on upload: `<articleId>/<timestamp>-<originalFilename>` (prevents collisions)
- Hero images: same bucket, same format — stored via ⚙ drawer upload, URL written to `articles.hero_image`

**Keyboard shortcuts:**
- `Cmd+S` → save as draft
- `Cmd+Shift+P` → publish (admin only)

**Status bar (bottom):**
- Flag count / fixed count
- `Cmd+S save · Cmd+Shift+P publish`
- `Drop image to insert`

---

### AI Alignment Check

Triggered by clicking `✦ Check` in the editor top bar. Not automatic — Toffer-initiated.

**What it checks against:**
1. `/docs/writing-style.md` — fetched from Netlify (same domain, static file)
2. `/docs/ai-slop-patterns.md` — structural AI tells (three-item lists, softening qualifiers, summarizing closers, cause-effect chains, etc.)
3. Learnings table from Supabase — extracted insights from past published articles

**API call:** Frontend POSTs to `/api/ai` with `action: "check"` (Netlify Function). Payload: current draft + style guide text + slop patterns text + recent learnings (last 20, as plain text strings). Function calls Anthropic API (Claude Haiku) server-side. Returns an array of flagged paragraphs with: `anchor` (first 80 characters of the paragraph, normalized), pattern name, explanation, suggested fix.

**Paragraph identification:** Flags are matched to paragraphs by scanning the markdown content for a substring matching the `anchor`. If the paragraph has been substantially edited since the check ran, the anchor no longer matches and the flag is silently dropped — correct behavior, since edited text should be re-checked. Flags are not persisted; they exist only in memory for the current editing session.

**Inline flag display (markdown pane):**
- Flagged paragraph: amber left border (`#ff8c00`), amber background tint
- Below the paragraph: `⚑` icon + pattern name + one-line explanation + `Fix →` button
- Check button shows flag count: `✦ Check` → `3 flags` (amber)

**Fix flow (per paragraph):**
1. Click `Fix →` on a flagged paragraph
2. API call: sends flagged paragraph + style guide + pattern explanation
3. Original paragraph struck through (dimmed)
4. Suggested rewrite appears in green box with label "✦ Suggested fix"
5. One-line note explaining what changed
6. Two actions: `Accept` (replaces text, clears flag, turns border teal) or `Edit instead` (puts suggestion in editor for manual editing)

**After fixing:** Flag turns teal with `✓ Fixed — accepted`. Status bar shows `✓ N fixed · ⚑ N remaining`.

**Cost:** ~₱0.003 per fix at Haiku pricing. Negligible.

---

### On publish — background learnings extraction

When an article is published, desk fires a background POST to `/api/ai` with `action: "extract"` — non-blocking:
- Sends full article content to Claude API (Haiku)
- Extracts key insights, observations, and patterns as discrete learnings
- Writes to `learnings` table using `SUPABASE_SERVICE_ROLE_KEY` server-side — bypasses RLS
- Learnings count on dashboard increments on next page load

This is invisible to Toffer — it runs after the publish action completes.

---

### `subscribers/index.html` — Subscribers

List of subscribers: name, email, subscribed date, status (active / unsubscribed).

Actions: export CSV, manually add subscriber, mark unsubscribed.

Subscriber count shown prominently — this is the lead magnet metric.

No self-signup UI in desk — subscribers sign up via a form on post205.com (separate implementation). Desk is the management view only.

---

### `newsletter/index.html` — Newsletter

**Compose:**
- Pick article from published list (dropdown or search)
- Subject line (pre-filled from article title, editable)
- Preview: renders article as email layout
- Recipient count shown before send

**Send:**
- Confirm dialog: "Send to 247 subscribers?"
- POSTs to `/api/send-newsletter` with `articleId` and `subject`
- Netlify Function sends via Resend API — `from: "Toffer Lorenzana <newsletter@post205.com>"`, `reply-to: "toffer@post205.com"` (never exposed publicly)
- Records in `newsletter_sends` table
- Returns to dashboard, last newsletter card updates

Note: `newsletter@post205.com` must be a verified sender domain in Resend before first send.

**Email template:** Clean, minimal. POST205 logo, article title, article body (rendered from markdown), unsubscribe link (required by RA 10173 and Resend TOS). System font. Dark-on-light for email compatibility.

**Unsubscribe implementation:** Each email includes a link to `desk.post205.com/unsubscribe?email=<encoded-email>&token=<hmac-token>`. The token is an HMAC-SHA256 of the email using `RESEND_API_KEY` as the secret — validated server-side by a Netlify Function at `/api/unsubscribe`. On valid token: sets subscriber `status = 'unsubscribed'` in Supabase via service role key, returns a confirmation page. No database query without a valid token.

---

### `learnings/index.html` — Learnings (Phase 2 placeholder)

Nav item visible, labeled `soon`. Clicking shows a placeholder: "Learnings populate as you publish. Come back when you have more articles."

Phase 2: full browse, search, filter by tag. Surfacing related learnings while writing.

---

## Docs folder (in desk repo)

```
docs/
  writing-style.md        ← copied from post205/docs/writing-style.md
  ai-slop-patterns.md     ← new file, structural AI tell patterns
  build-rules.md
  core-values.md
  learnings.md
```

`writing-style.md` and `ai-slop-patterns.md` are fetched at runtime by the check feature. Edit locally, commit, push — Netlify redeploys, checker uses updated rules.

**Access control on `/docs/`:** These files are static assets readable at `desk.post205.com/docs/writing-style.md` by anyone with the URL. This is acceptable — they contain writing style guidelines, not personal data. There is no practical mechanism to restrict static file access in a vanilla Netlify setup while also allowing the same browser session to fetch them via `fetch('/docs/...')`. Do not add a redirect rule — it would break the check feature. Accept that the style guide is readable externally.

---

## Folder structure

```
desk-post205/
├── CLAUDE.md
├── .env                      ← never commit
├── .env.example
├── netlify.toml
├── robots.txt                ← Disallow: /
├── index.html                ← login + dashboard
├── articles/
│   ├── index.html            ← article list
│   └── edit.html             ← editor (loaded as edit.html?id=<uuid>)
├── subscribers/
│   └── index.html
├── newsletter/
│   └── index.html
├── learnings/
│   └── index.html            ← placeholder
├── unsubscribe/
│   └── index.html            ← confirmation page after unsubscribe
├── netlify/
│   └── functions/
│       ├── ai.js             ← /api/ai (Anthropic API — check, fix, extract actions)
│       ├── send-newsletter.js← /api/send-newsletter (Resend API, server-side)
│       └── unsubscribe.js    ← /api/unsubscribe (HMAC token validation + status update)
└── docs/
    ├── writing-style.md
    ├── ai-slop-patterns.md
    ├── build-rules.md
    ├── core-values.md
    └── learnings.md
```

---

## Project setup steps (do this before the build session)

1. Create private GitHub repo: `post205-desk`
2. Create Netlify site — connect to repo, set build to none (static), publish directory `.`
3. Add CNAME record: `desk` → Netlify site URL (get from Netlify dashboard)
4. Set Netlify env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
5. Run Supabase SQL for new tables: `profiles`, `learnings`, `subscribers`, `newsletter_sends`
6. Add `articles` table if not already in this Supabase project (check dashboard)
7. Get `TOFFER_UID` from Supabase → Authentication → Users
8. Run this SQL in Supabase SQL Editor to bootstrap admin role:
   ```sql
   INSERT INTO profiles (id, role) VALUES ('<TOFFER_UID>', 'admin');
   ```
9. Create `article-images` storage bucket in Supabase → Storage → New bucket → name: `article-images` → Public bucket: on
10. Verify `newsletter@post205.com` as a sender domain in Resend dashboard before first send
11. Open new VS Code window, new Claude Code session — this project only

---

## Design decisions locked

| Decision | Choice | Reason |
|---|---|---|
| Editor layout | C — full-width split, ⚙ drawer | Writers need max space. Metadata is pre-publish, not mid-writing. |
| AI panel | None in writing flow | Keep editor clean. Research happens in Claude Code, draft gets pasted in. |
| AI check trigger | Manual (Check button) | Writer-initiated. Not interrupting. |
| Flag display | Inline on markdown pane | Linter pattern — flag where you edit, not where you read. |
| Fix model | Claude Haiku | Sufficient for style alignment. Cost is negligible. |
| Metadata drawer | Pushes (not overlays) | See your article while filling in metadata. |
| Newsletter | POST205 lead magnet only | Separate audience from Time Space Warp. Different content, different purpose. |
| Learnings extraction | Background on publish | Non-blocking. Invisible. Accumulates over time. |
| Style rules location | Static files in desk repo | Fetched at runtime. Update by editing + committing. No config UI. |
| Social distribution | Phase 2 | Newsletter is the priority distribution channel. |
