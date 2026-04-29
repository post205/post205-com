# Learnings — Desk Projects

*Things that surprised us. What bit us, what worked unexpectedly well. Add after every project.*

---

## Supabase

**RLS verification — SQL Editor bypasses RLS.**
Always test access control using the REST API with the anon key in a private browser window, not the Supabase SQL Editor. The editor runs as service_role and will make everything appear to work even when RLS would block real users.

**Always use `(SELECT auth.uid())` not `auth.uid()` in RLS policies.**
`auth.uid()` called directly in a policy can cause infinite recursion when the policy queries a table that has the same policy. `(SELECT auth.uid())` is evaluated once and cached, breaking the recursion. It's also faster — `auth.uid()` is re-evaluated per row.

**RLS UPDATE blocking returns `{ data: [], error: null }` — not an error.**
A PostgREST UPDATE blocked by RLS returns an empty array with no error. The UI appears to succeed. Nothing is written to the DB. Always verify rows were actually updated if something feels like it's silently not working.

**`.single()` throws on 0 rows OR 2+ rows — use `.maybeSingle()` when a row might not exist.**
PostgREST's `.single()` returns a 406 error in both cases. Use `.maybeSingle()` for optional rows. Always destructure `{ data, error }` — not just `{ data }` — because `.maybeSingle()` swallows the error if you only destructure data.

**RLS UUID must be exact — get it from Authentication → Users, not the profiles table.**
Hardcoded policies like `auth.uid() = 'your-uuid'::uuid` fail silently if the UUID is wrong. The user gets permission denied with no explanation. Get the UUID from Supabase Dashboard → Authentication → Users — not from a profiles table query.

**Supabase JS v2 CDN — use the UMD build, not ESM.**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.js"></script>
```
The `/dist/umd/` path exposes `supabase` on `window`. The ESM build does not work as a plain script tag. Pin the minor version so nothing breaks on CDN updates.

**`env.js` and Supabase CDN must load before any page scripts.**
Load order matters: Supabase CDN → `env.js` (which sets `window.ENV`) → `supabase-client.js`. If `env.js` is missing or listed after the page script, the page runs before globals are available — no error, just `undefined`.

**env.js must be created manually after every fresh clone.**
`env.js` is gitignored. After cloning or working on a new machine, create `js/env.js` manually with the Supabase URL and anon key. Document this in the README or CLAUDE.md so you don't spend 20 minutes debugging a blank page.

**Netlify token expiry.**
The `NETLIFY_AUTH_TOKEN` expires. When a deploy fails with an auth error, regenerate the token at app.netlify.com/user/applications. Name it something recognizable. Update `.env` immediately.

**Service role key in PATCH vs PUT (Supabase Admin API).**
When updating a user via the Supabase Admin API (`/auth/v1/admin/users/{uid}`), PATCH returns 405. Use PUT instead.

**Check constraints cause runtime errors, not design-time errors.**
If a column has `CHECK (category IN ('a','b','c'))`, any INSERT with a value outside that list fails at runtime. This burns you if you use a `prompt()` to collect the value — user types anything, it fails. Always use a `<select>` locked to the valid values.

**Verify DB state via Management API — don't trust conversation history.**
Memory and session history say "we deployed X" but Supabase is the ground truth. Always verify triggers, functions, policies, and columns actually exist before building on top of them. Use the Supabase Dashboard Table Editor or the SQL Editor (running as service_role) to check.

---

## Auth and Session

**`requireAuth()` with a never-resolving promise halts execution cleanly.**
```js
async function requireAuth() {
  const { data } = await db.auth.getSession();
  const session = data?.session ?? null;
  if (!session) {
    window.location.href = '/login/';
    await new Promise(() => {}); // never resolves — halts execution
  }
  return session;
}
```
Calling `await requireAuth()` at the top of page init is sufficient. No `if (!session) return` guards needed anywhere else.

**The login page must check session in the other direction.**
On `login/index.html`, check session first and redirect to `/` if already signed in. Otherwise a logged-in user navigating to /login/ sees a broken state.

**Guard `getSession()` destructure against null data.**
```js
// WRONG — crashes with TypeError if Supabase returns { data: null }
const { data: { session } } = await supabase.auth.getSession();

// CORRECT
const { data } = await supabase.auth.getSession();
const session = data?.session ?? null;
```

---

## Vanilla JS Patterns

**`escHtml` on every user-supplied string in innerHTML — no exceptions.**
```js
function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```
Every field that comes from the database or user input goes through `escHtml` before being embedded in `innerHTML`. Skipping it is an XSS vulnerability. The `?? ''` handles null/undefined.

**Event listeners die when you replace `innerHTML` — extract rewirable functions.**
When you do `container.innerHTML = newHtml`, all previously attached event listeners on child elements are gone. Extract the wiring into a named function that you call both on init and after any DOM rebuild:
```js
function wireButtons() {
  document.getElementById('save-btn').addEventListener('click', handleSave);
}
```

**Replace `prompt()` and `confirm()` with inline forms — always.**
Browser dialogs pause the page, can't be styled, and are blocked in some browsers. Pattern: hide the trigger button, insert a form div (input + Save + Cancel) where the button was, handle Cancel by restoring the button, handle Save by submitting to Supabase and re-rendering.

**Compute status from dates — don't store it.**
For documents with expiry dates, don't store a `status` column. Compute it at render time from `expiry_date` vs today. Stored status goes stale the moment the date passes. Computed status is always correct.

**`esc()` should be a shared module, not copy-pasted per file.**
Having an identical `escHtml()` in every JS file means a future typo in any one copy creates a silent XSS vector. A single `/js/utils.js` makes it auditable in one place.

---

## DNS and Netlify

**Cloudflare proxy (orange cloud) breaks Netlify SSL provisioning.**
When pointing a domain to Netlify via Cloudflare, set DNS records to DNS-only (grey cloud), not proxied. Netlify needs to verify the domain directly to provision its Let's Encrypt SSL certificate. Switch to proxied only after SSL is confirmed.

**GitHub push does not auto-deploy.**
Netlify CLI deploy is required every time. Push to GitHub only for version control. Deploy separately via: `npx netlify deploy --prod --dir=. --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID`

**Branch dropdown empty on new Netlify site.**
If you connect a GitHub repo to Netlify before the repo has any commits, the branch dropdown is empty and uneditable. Fix: push at least one commit to create the `main` branch first, then return to Netlify to complete the setup.

**Cache-Control: no-cache is essential for plain-file projects.**
Without content hashing in filenames, browsers and CDNs serve stale JS and CSS after every deploy. Add to `netlify.toml`:
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

**Use folder-based routing — never `.html` in internal links.**
`articles/index.html` serves as `/articles/` on Netlify with no config. Always link to `/articles/`, not `/articles.html`.

---

## Mobile and iOS Safari

**Divs don't fire click events on iOS without `cursor: pointer`.**
iOS Safari only fires click events on natively interactive elements (a, button, input) or elements with `cursor: pointer`. Any div used as a tappable card silently swallows taps without it. Add `-webkit-tap-highlight-color: transparent` alongside `cursor: pointer` to also remove the gray tap flash.

**`100vh` includes the browser chrome on iOS — use `100dvh`.**
`height: 100vh` clips content behind the address bar on iOS. Use `100dvh` (iOS 15.4+) with `100vh` as a fallback:
```css
height: 100vh;
height: 100dvh;
```

**Nested `<a>` tags break layout silently.**
The browser auto-closes an outer `<a>` when it hits an inner `<a>`. Never nest anchors — use a `<div>` with `cursor: pointer` and handle navigation in JS.

---

## PDF and Printing

**Call `window.open()` before any `await`.**
Browsers require popups to be opened synchronously within a user gesture handler. Opening after an `await` breaks the gesture chain and popup blockers fire.
```js
async function printDoc(id) {
  const win = window.open('', '_blank'); // ← before any await
  if (!win) { alert('Pop-up blocked.'); return; }
  const { data } = await supabase.from('...').eq('id', id).single();
  if (!data) { win.close(); return; }
  win.document.write(`...html...`);
  win.document.close();
}
```

**Use `window.onload = window.print` when the document has images.**
Inline `<script>window.print()</script>` runs before images finish loading — the print dialog shows blank slots. Use `window.onload = window.print` instead.

**All user data in `document.write()` must pass through `esc()`.**
Every string from the DB that lands in the printed HTML is a potential XSS vector. No exceptions — even fields that "shouldn't" contain HTML.

---

## Copy and Design

**AI slop structural patterns — the ones that aren't obvious.**
Beyond banned words, watch for: three-item negative lists ("no X, no Y, no Z"), cause-effect chains ("because of X, we Y"), dramatic pivot sentences ("Something changed."), and mid-sentence question breaks ("The solution?"). These are structural tells, not just word-level ones.

**System fonts need weight 800 on headings — not 700.**
At weight 700, system-ui looks soft. Weight 800 gives the impact that web fonts like Syne provided. This is intentional — don't soften it.

**Theme flash prevention: load theme.js in `<head>` before first paint.**
Load theme.js in `<head>` immediately after the base CSS link. It reads localStorage and sets `data-theme` on `<html>` before the browser paints. Loading it after causes a visible flash.

**Write dark as the default; override with `[data-theme="light"]`.**
Write all base color values for dark, then override with `[data-theme="light"]`. System auto mode works without extra logic.

**All colors in JS-generated HTML go through CSS variables — never hardcode hex.**
Inline hardcoded hex values don't update on theme toggle. CSS vars do.

---

*Add new learnings here as they happen. One project's hard lesson is another project's avoided mistake.*
