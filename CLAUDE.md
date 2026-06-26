# POST205 — post205.com

## Working context (read before writing copy or making calls)
- **Before writing or editing ANY user-facing copy** (site, demos, emails, chat, SA
  pages, labels), read [docs/writing-style.md](docs/writing-style.md) and skim
  [context/anti-slop-log.md](context/anti-slop-log.md). When you hand copy to a
  subagent, paste the writing-style "Hard Bans" + the anti-slop log into its brief —
  most slop we've shipped came from subagents that never saw the style guide.
- **Before a product/design/stack/naming decision**, check [context/decisions.md](context/decisions.md)
  (settled calls + recurring mistakes) and [DESIGN.md](DESIGN.md) / [docs/build-rules.md](docs/build-rules.md).
- New slop flagged or new decision made → log it in `context/` in the same change.

## Public form security (go-live blocker)
Public form/chat submissions here must adopt the secure-submission pattern before
this site's production domain goes live: cheap guards (honeypot + min-fill-time +
dedupe) now; Turnstile-verified edge-function write + revoke anon INSERT before
launch. If the target table is shared with another live app, the revoke is a
coordinated cutover. Pattern: client-sites skill → "Securing Public Form
Submissions". Canonical impl: ~/Documents/2026/Claude/Projects/piandre-www/docs/SECURE-SUBMISSION.md

> **Status (2026-06-13):** No public browser-side anonymous INSERT to Supabase
> exists today. Contact forms (`index.html`, `privacy.html`) use Netlify Forms;
> `/cpd` uses localStorage only; the only Supabase writes are admin-authenticated
> (`admin/articles/edit.html`, behind login). This block becomes a live blocker
> the moment any public form is wired to insert into Supabase with the anon key.
