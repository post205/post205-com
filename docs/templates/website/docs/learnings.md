# Learnings — Website Projects

*Things that surprised us. What bit us, what worked unexpectedly well. Add after every project.*

---

## Supabase

**RLS verification — SQL Editor bypasses RLS.**
Always test access control using the REST API with the anon key in a private browser window, not the Supabase SQL Editor. The editor runs as service_role and will make everything appear to work even when RLS would block real users.

**Netlify token expiry.**
The `NETLIFY_AUTH_TOKEN` expires. When a deploy fails with an auth error, regenerate the token at app.netlify.com/user/applications. Name it something recognizable (e.g. `post205-claude`). Update `.env` immediately.

**Service role key in PATCH vs PUT (Supabase Admin API).**
When updating a user via the Supabase Admin API (`/auth/v1/admin/users/{uid}`), PATCH returns 405. Use PUT instead.

---

## Mobile and iOS Safari

**Divs don't fire click events on iOS without `cursor: pointer`.**
iOS Safari only fires click events on natively interactive elements (a, button, input) or elements with `cursor: pointer`. Any div used as a tappable card silently swallows taps without it. Add `-webkit-tap-highlight-color: transparent` alongside `cursor: pointer` to also remove the gray flash on tap.

**`100vh` includes the browser chrome on iOS — use `100dvh`.**
`height: 100vh` clips content behind the address bar on iOS. Use `100dvh` (dynamic viewport height, iOS 15.4+) with `100vh` as a fallback above it:
```css
height: 100vh;
height: 100dvh;
```

**Nested `<a>` tags break layout silently.**
The browser auto-closes an outer `<a>` when it hits an inner `<a>`. Everything after the inner anchor falls outside the flex container at the wrong position. Never nest anchors — use a `<div>` with `cursor: pointer` and handle navigation in JS, or use a single outer anchor with plain-text children.

---

## DNS and Netlify

**Cloudflare proxy (orange cloud) breaks Netlify SSL provisioning.**
When pointing a domain to Netlify via Cloudflare, set DNS records to DNS-only (grey cloud), not proxied. Netlify needs to verify the domain directly to provision its Let's Encrypt SSL certificate. Switch to proxied only after SSL is confirmed.

**GitHub push does not auto-deploy.**
Netlify CLI deploy is required every time. Push to GitHub only for version control. Deploy separately via: `npx netlify deploy --prod --dir=. --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID`

**Branch dropdown empty on new Netlify site.**
If you connect a GitHub repo to Netlify before the repo has any commits, the branch dropdown is empty and uneditable. Fix: push at least one commit to create the `main` branch first, then return to Netlify to complete the setup.

**Cache-Control: no-cache is essential for plain-file projects.**
Without content hashing in filenames (like `app.a3f4b2.js`), browsers and CDNs serve stale JS and CSS after every deploy. Add to `netlify.toml`:
```toml
[[headers]]
  for = "/js/*"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/css/*"
  [headers.values]
    Cache-Control = "no-cache"
```
Don't use `max-age` unless filenames change on every deploy.

**Use folder-based routing — never `.html` in internal links.**
`clients/index.html` serves as `/clients/` on Netlify with no config. Always link to `/clients/`, not `/clients.html`. The URL bar shouldn't show file extensions.

---

## Privacy and Compliance (RA 10173)

**Vendor names in privacy policies are a liability.**
Don't name Supabase, Resend, or any infrastructure vendor in the privacy policy. Use generic classes: "cloud database provider," "email delivery service." Vendor relationships are not public.

**Section 16(b) requires scope and method of processing.**
RA 10173 mandates explaining how data is processed, not just what is collected. Include: collected by email and proposal forms, reviewed manually, nothing processed automatically.

---

## Copy and Design

**AI slop structural patterns — the ones that aren't obvious.**
Beyond banned words, watch for: three-item negative lists ("no X, no Y, no Z"), cause-effect chains ("because of X, we Y"), dramatic pivot sentences ("Something changed."), and mid-sentence question breaks ("The solution?"). These are structural tells, not just word-level ones.

**System fonts need weight 800 on headings — not 700.**
At weight 700, system-ui looks soft. Weight 800 gives the impact that web fonts like Syne provided. This is intentional — don't soften it.

**Theme flash prevention: load theme.js in `<head>` before first paint.**
If theme.js loads after CSS, the page renders in the default theme first, then flashes to the user's saved preference. Load it in `<head>` immediately after the base CSS link — before any other scripts. It reads localStorage and sets `data-theme` on `<html>` before the browser paints anything.

**Write dark as the default; override with `[data-theme="light"]`.**
If you define light as the default and override for dark, the `data-theme="dark"` class conflicts with system dark mode when `prefers-color-scheme` is active. Write all base color values for dark, then override with `[data-theme="light"]`. Auto/system mode works without any extra logic.

**All colors in JS-generated HTML go through CSS variables — never hardcode hex.**
```js
// correct
`<span style="color:var(--accent)">Expired</span>`
// wrong — breaks theme toggle
`<span style="color:#3BD1D3">Expired</span>`
```
Inline hardcoded hex values survive a theme switch only if the user reloads. CSS vars update immediately.

---

*Add new learnings here as they happen. One project's hard lesson is another project's avoided mistake.*
