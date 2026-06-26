# Decisions

Settled calls across the POST205 ecosystem. Check here before re-deciding. Each line
is the rule; the link is the full reasoning. If a call is genuinely wrong, change it
here and in its source doc, don't just work around it.

Canonical sources (read in full when the work touches them):
- **[../docs/build-rules.md](../docs/build-rules.md)** — architecture, stack, DNS, secrets, design rules.
- **[../DESIGN.md](../DESIGN.md)** — the visual system (theme, color, type, elevation, bans).
- **[../docs/writing-style.md](../docs/writing-style.md)** — voice + hard bans (see also [anti-slop-log.md](anti-slop-log.md)).
- **piandre-www/docs/SECURE-SUBMISSION.md** — the public-form security pattern. Copy into every new public-form project.

---

## Stack & build
- Vanilla HTML/CSS/JS. No frameworks, no build step unless the app genuinely needs one. The output is what you write. (`build-rules.md`)
- Hosting: Netlify, deploy via CLI with the token in `.env` (not GitHub auto-deploy for the static sites). (`build-rules.md`)
- Database: Supabase. Each client entity gets its own project (never mix client data). POST205's own tools share one project. (`build-rules.md`)
- Fonts: system fonts only. `system-ui` body, `ui-monospace` labels. No Google Fonts, no web fonts.
- Secrets: `.env` (local, never committed) and Netlify dashboard (production, server-side). Service role + API keys **never** in frontend. Commit a blank `.env.example`.
- Private subdomains: `robots.txt` Disallow all, no sitemap/schema. Public sites: full SEO (sitemap, JSON-LD, canonicals).

## Design
- One theme: light teal field (`#e7efee`) under a dark masthead (`#141416`). No theme toggle (deprecated 2026-06-17).
- Accent `#0e9a9d` on light, `#3BD1D3` only on dark. The Economy Rule: accent on at most ~10% of a screen. Three teal elements is too many.
- Every neutral derives from the accent hue (~181°). No pure grays, warm creams, or slates.
- Type: weights 800 (headers) and 400 (body) only. No 500/600 — the gap is the hierarchy. Text columns max ~680px.
- Flat surfaces, tonal layering for depth. No decorative box-shadow. Hover/focus shifts opacity, not elevation.
- Banned permanently: Syne, Lora, DM Sans, Inter; gradient text; thick `border-left/right` accent stripes; glassmorphism-by-default; identical card grids; the hero-metric template.
- Mobile: 16px inputs (iOS zoom), `overflow-x: clip`, dvh, 44px touch targets, `env(safe-area-inset-bottom)`.

## Security & compliance
- Public forms: cheap guards (honeypot + min-fill + dedupe) now → Turnstile-verified edge-function write + revoke anon INSERT before a domain goes live. (`SECURE-SUBMISSION.md`; also the go-live block in [CLAUDE.md](../CLAUDE.md).)
- RLS on every table. Toffer-only tools gate on `auth.uid()`; client teams use a `profiles` role column (only admins publish).
- RA 8792 (E-Commerce Act): an email/electronic acceptance is a binding signature. Used on the sign.* pages. Don't silently edit a signed acceptance record; log a dated correction or have them re-sign.
- RA 10173 (Data Privacy Act): clients own their data. POST205 is a collaborator, not a custodian.

## Naming & brand
- Spelling: **POST205** / post205 (no space). "POST 205" only in formal proper-name prose.
- Email privacy: `toffer@post205.com` is **never** on a public page (source, mailto, JSON-LD). Public contact = forms. `dpo@post205.com` for legal/privacy. `office@post205.com` is OK to expose (the FAQ KB uses it).
- Admin/ops always on its own subdomain (`desk.`, `ops.`), never an `/admin/` path. A path can be guessed; a subdomain is a separate surface.
- Never name infrastructure vendors (Supabase, Netlify, Resend) in client-facing copy. Use generic terms ("cloud database", "email delivery service").
- Client owns their domain, DNS, database, email, and social accounts. Give them a CNAME; never touch their registrar credentials.

## Settled — don't revisit (recurring mistakes)
- **Revoke anon INSERT last**, only after every writer has moved to the edge function. Revoking early broke a still-direct `.insert()` on piandre-booking.
- **Service role key never ships to the browser** — it bypasses RLS entirely.
- **No `/admin/` on a public site** — separate subdomain, separate security model.
- **Don't name vendors in client copy** — it confuses ownership and makes clients feel locked in.
- **No build step by reflex** — a Duda site moved to vanilla and maintenance dropped.
- **No self-signup on private tools** — admins add team members.
- **BIR 10-year retention**: official invoices/proposals can't be deleted inside the window; show a lock notice, not a delete button. (accountinus)
- **Don't "improve" Toffer's voice** into something more clever or more American than how he actually talks. The plainer line wins. (see [anti-slop-log.md](anti-slop-log.md))
