# Learnings — Ops Projects

*Internal tools are where the real complexity lives. These patterns come from building ops.post205.com, the Piandré booking system, and the Piandré SBI portal. Add after every project.*

---

## Supabase / PostgREST

**Always use `(SELECT auth.uid())` not `auth.uid()` in RLS policies.**
`auth.uid()` is re-evaluated per row and can cause infinite recursion when the policy queries a table with the same policy. `(SELECT auth.uid())` is evaluated once per query — faster and recursion-safe.

**RLS UPDATE blocking returns `{ data: [], error: null }` — not an error.**
A PostgREST UPDATE blocked by RLS returns an empty array with no error. The UI appears to succeed. Nothing is written to the DB. Always verify rows were actually updated if something feels like it's silently not working.

**`.single()` throws on 0 rows OR 2+ rows — use `.maybeSingle()` when a row might not exist.**
PostgREST's `.single()` returns a 406 error in both cases. Use `.maybeSingle()` for optional rows. Always destructure `{ data, error }` — not just `{ data }` — `.maybeSingle()` swallows the error if you only destructure data.

**Voided records accumulate — always filter them out.**
After revoke/void cycles, old records pile up. Any query for "the current X" must filter with `.neq('status', 'Voided')` or you'll hit multiple-row errors or show stale data. Never use `[0]` to get the current record — use `.find(d => d.status !== 'Voided')`.

**RLS policy UUID must be exact — get it from Authentication → Users.**
Hardcoded policies like `(SELECT auth.uid()) = 'your-uuid'::uuid` fail silently if the UUID is wrong. The user gets permission denied with no explanation. Get the UUID from Supabase Dashboard → Authentication → Users.

**Upsert vs insert matters at re-run time.**
Seed scripts using `.insert()` create duplicates silently on re-run. Always use `.upsert([...], { onConflict: 'column' })` for seed scripts. `.insert()` is never safe to re-run.

**`.in()` queries have a practical limit around 400–500 items.**
Passing thousands of IDs into `.in()` will fail or time out. Batch in chunks of 400. For very large sets, push the logic server-side via an RPC or a join.

**Per-record API calls don't scale.**
Checking something for each of N records one by one is N API calls. Instead: batch `.in()` all IDs at once, get back the subset with data. A bulk check that would take 10+ minutes runs in seconds.

**RPCs with duplicate overloads cause PGRST203.**
If two overloads of the same RPC exist, PostgREST 203 fires when called with zero args. Fix: merge into one overload with `DEFAULT NULL` parameters.

**RPC upserts must be `INSERT … ON CONFLICT DO UPDATE`, not UPDATE-only.**
An UPDATE-only RPC silently skips rows that don't exist yet. No error is raised — nothing happens.

**`SECURITY DEFINER` is required for RPCs that touch RLS-protected tables.**
Functions that must bypass RLS need `SECURITY DEFINER` to run as the function owner, not the calling user.

**Supabase JS v2 CDN — use the UMD build, not ESM.**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.js"></script>
```
The `/dist/umd/` path exposes `supabase` on `window`. The ESM build does not work as a plain script tag. Pin the minor version.

**Check constraints cause runtime errors, not design-time errors.**
If a column has `CHECK (status IN ('draft','published'))`, any INSERT with a value outside that list fails at runtime with no obvious message. Always use a `<select>` locked to the valid values — never `prompt()`.

**Verify DB state via Management API — don't trust conversation history.**
Memory and session history say "we deployed X" but Supabase is the ground truth. Verify triggers, functions, policies, and columns actually exist before building on top of them. Use the SQL Editor (runs as service_role) or the Supabase dashboard Table Editor.

**DB triggers are the most reliable way to enforce state cascades.**
Client code has bugs. A Postgres trigger fires regardless of how a row is updated — UI, direct SQL, future code. For critical state invariants, implement the cascade in JS (for UX) AND in a trigger (for integrity).

---

## Auth and Session

**`requireAuth()` with a never-resolving promise halts execution cleanly.**
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
Call `await requireAuth()` at the top of every page init. No other session guards needed anywhere.

**The login page must check session first and redirect if already signed in.**
Otherwise a logged-in user navigating to `/login/` sees a broken state.

**Guard `getSession()` destructure against null data.**
```js
// WRONG — crashes with TypeError if Supabase returns { data: null }
const { data: { session } } = await supabase.auth.getSession();

// CORRECT
const { data } = await supabase.auth.getSession();
const session = data?.session ?? null;
```

**Cache auth in sessionStorage to avoid DB roundtrips on every page load.**
Without a cache, every page load does at least 2 DB queries (getSession + profile lookup). Store the result with the userId as key and validate against a TTL. Clear the cache on any role or team change.

---

## Vanilla JS Patterns

**`escHtml` on every user-supplied string in innerHTML — no exceptions.**
```js
function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```
Put this in `/js/utils.js`. Every field from the DB goes through it before `innerHTML`. The `?? ''` handles null/undefined. Skipping it is an XSS vulnerability.

**Event listeners die when you replace `innerHTML` — extract rewirable functions.**
`container.innerHTML = newHtml` destroys all previously attached listeners on child elements. Extract wiring into a named function and call it both on init and after any DOM rebuild.

**Event delegation is the right pattern for dynamic lists.**
Wire one listener on the container, not one per item. Items are re-rendered on every search; per-item listeners on re-rendered HTML are garbage-collected. Wire the container listener once in init.

**Listener stacking is silent and devastating.**
Wiring an event listener inside a function that runs on every keystroke accumulates N listeners — one per keystroke. Each tap fires all N. Always wire listeners once, in an init function called once.

**Replace `prompt()` and `confirm()` with inline forms.**
Browser dialogs pause the page, block the tab, can't be styled, and are blocked in some browsers. Pattern: hide the trigger button, insert a form div (input + Save + Cancel) where the button was, handle Cancel by restoring the button.

**Compute status from dates — don't store it.**
For documents with expiry dates, compute status at render time from `expiry_date` vs today. Stored status goes stale the moment the date passes. Computed status is always correct:
```js
function computeStatus(doc) {
  if (!doc.expiry_date) return (doc.file_url || doc.issued_date) ? 'current' : 'missing';
  const today = new Date(); today.setHours(0,0,0,0);
  const expiry = new Date(doc.expiry_date);
  const soon = new Date(today); soon.setDate(soon.getDate() + 30);
  if (expiry < today) return 'expired';
  if (expiry <= soon) return 'expiring';
  return 'current';
}
```

**Async null guard at point of use, not just call site.**
`if (!data) return` inside a fetch helper doesn't protect downstream callers that destructure the result. Guard at every point of use:
```js
const { data } = await fetchSomething();
if (!data?.length) return;
```

**`env.js` and Supabase CDN must load before any page scripts.**
Load order: Supabase CDN → `env.js` (sets `window.ENV`) → `supabase-client.js`. If `env.js` is listed after the page script, the page runs before globals are available — no error, just `undefined`.

**env.js must be created manually after every fresh clone.**
`env.js` is gitignored. After cloning or on a new machine, create `js/env.js` manually. Document this in CLAUDE.md so future-you doesn't spend 20 minutes debugging a blank page.

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
Inline `<script>window.print()</script>` runs before images finish loading. Use `window.onload = window.print` instead.

**All user data in `document.write()` must pass through `esc()`.**
Every string from the DB that lands in the printed HTML is a potential XSS vector.

---

## CSS and Theme

**Theme flash prevention: load theme.js in `<head>` before first paint.**
Load theme.js in `<head>` immediately after the base CSS link — before any other scripts. It reads localStorage and sets `data-theme` on `<html>` before the browser paints anything.

**Write dark as the default; override with `[data-theme="light"]`.**
Write all base color values for dark, then override with `[data-theme="light"]`. System auto mode works without extra logic.

**All colors in JS-generated HTML go through CSS variables — never hardcode hex.**
Inline hardcoded hex values don't update on theme toggle without a page reload. CSS vars update immediately.

**Popovers and dropdowns must be portaled to `document.body`.**
A dropdown rendered inside a `position: relative` ancestor inside a scrolling container will be clipped by `overflow: hidden` and have z-index fights. Render to `document.body` with `position: fixed` and use `getBoundingClientRect()` to position relative to the trigger.

**Never use CSS `:not([attr])` on large tables.**
`tr:not([data-category])` forces the browser to re-evaluate every row on every DOM mutation. On a 1000+ row table this becomes a continuous reflow loop. Use `requestAnimationFrame` + `classList.toggle()` instead.

**Setting one overflow axis on a div forces both.**
`overflow-x: auto` on a div implicitly sets `overflow-y: auto` too. Any `position: sticky` inside that div will now use it as the scroll ancestor, not the real page scroll.

---

## Mobile and iOS Safari

**Divs don't fire click events on iOS without `cursor: pointer`.**
iOS Safari only fires click events on natively interactive elements or elements with `cursor: pointer`. Add `-webkit-tap-highlight-color: transparent` alongside it to remove the gray flash on tap.

**`100vh` includes the browser chrome on iOS — use `100dvh`.**
```css
height: 100vh;
height: 100dvh;
```

**Two-scroll-container problem on iOS.**
When body is scrollable and an inner container also has `overflow-y: auto`, iOS intercepts the gesture on the body first. The inner container never scrolls. Fix: `body { overflow: hidden }`, let only the inner container scroll, use `100dvh` on the body.

**Hidden flex siblings still occupy space.**
A flex sibling with `visibility: hidden` still takes up space and competes for height. Use `display: none` for flex siblings that shouldn't be visible.

---

## DNS and Netlify

**Cloudflare proxy (orange cloud) breaks Netlify SSL provisioning.**
Set DNS records to DNS-only (grey cloud) when pointing to Netlify. Switch to proxied only after SSL is confirmed.

**GitHub push does not auto-deploy.**
CLI deploy is required every time: `npx netlify deploy --prod --dir=. --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID`

**Cache-Control: no-cache is essential for plain-file projects.**
Without content hashing in filenames, browsers and CDNs serve stale JS and CSS after every deploy. Set `Cache-Control: no-cache` on `/js/*` and `/css/*` in `netlify.toml`.

**Netlify token expiry.**
The `NETLIFY_AUTH_TOKEN` expires. When a deploy fails with an auth error, regenerate at app.netlify.com/user/applications. Update `.env` immediately.

**Use folder-based routing — never `.html` in internal links.**
`clients/index.html` serves as `/clients/` with no config. Always link to `/clients/`, not `/clients.html`.

---

## Audit Logging

**Always fetch and log `full_name`, never raw auth email.**
Every mutation that calls `logActivity()` should first fetch `full_name` from the profiles table. Using raw email creates inconsistent audit trail entries that accumulate into a confusing log.

**Log all write paths — inline edits, bulk operations, and undo/reverse.**
It's easy to add logging to the happy path and forget bulk imports and undo flows. All three are writes. All three need audit entries.

**`logActivity()` is fire-and-forget by design.**
Don't `await` it in the UI — it would block the user's action on an audit write. A `console.warn` on error in the `.then()` callback is the minimum.

---

## Caching (Plain File Projects)

**Use `Cache-Control: no-cache` for JS/CSS without content hashing.**
Don't use `max-age` unless filenames change on every deploy.

**Never cache a failed or empty response.**
Always check `!error && data.length > 0` before writing to sessionStorage. An empty cache is better than a stale-empty cache that hides the fact that a fetch failed.

---

*Add new learnings here as they happen. One project's hard lesson is another project's avoided mistake.*
