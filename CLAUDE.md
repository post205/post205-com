# POST205 — post205.com

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
