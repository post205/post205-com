# POST 205 — Build Rules

*A living reference. Check this before building anything. Update it when a new decision is made.*

---

## Architecture

**1. Admin always lives on its own subdomain.**
Never `/admin/` as a path on a public site. Use `desk.[domain]` for content management, `ops.[domain]` for business operations. A path can be guessed. A subdomain is a separate surface with its own rules.

**2. The public site is a display layer only.**
It reads from the database. It doesn't edit anything. Content management happens on a separate subdomain. The public domain has no admin paths, no editor routes, nothing to protect.

**3. Each client entity gets its own Supabase project.**
Never mix client data. POST 205's own tools (post205.com, ops, desk) share one Supabase project. Each client gets a separate project under their own or our account — documented at handoff.

**4. Admin subdomains are fully private.**
`robots.txt: Disallow: /` — one line, blocks all crawlers. No sitemap. No JSON-LD schema. Auth is the only door.

**5. Public sites are fully crawlable.**
`robots.txt: Allow: /` — no exceptions needed because there's nothing to hide. Full sitemap.xml. JSON-LD schema. Canonical URLs. No path-level blocking required.

---

## DNS and Domain Management

**6. For a subdomain: give the client a CNAME, they add it.**
You give them one DNS record. They add it in their own registrar or DNS provider. You never touch their registrar credentials. You never need to.

```
desk.clientname.com → CNAME → their-site.netlify.app
```

**7. For ongoing DNS management: they create Cloudflare, add you as a member.**
Client owns the account. You manage it. If the engagement ends, they remove you. Their domain never depends on your account.

**8. Never point client nameservers to your Cloudflare.**
If your account has an issue, their entire domain goes down. That's not a risk any client should carry. Their DNS account stays under their name.

---

## Subdomain Naming

**9. Content management: `desk.[domain]`**
Where you write, edit, and publish. Human, not technical. Works for any client.

**10. Business operations: `ops.[domain]`**
Clients, billing, projects, lifecycle. Toffer-only (or team-only). Never client-facing.

Avoid: `admin`, `cms`, `panel`, `dashboard` — predictable, guessable, generic.

---

## Stack

**11. Vanilla HTML/CSS/JS — no frameworks, no build step.**
The output is what you write. No compilation, no dependencies to update, no breaking changes from upstream. A file that works today will work in ten years.

**12. Netlify for hosting. Deploy via CLI with token.**
`npx netlify deploy --prod --dir=. --auth=$NETLIFY_AUTH_TOKEN --site=[site-id]`
GitHub push does NOT auto-deploy — CLI is required each time. Token stored in `.env`.

**13. Supabase for data and auth.**
Anon key is safe client-side (RLS enforces access). Service role key never in frontend code. Always read `.env` before building any backend feature.

**14. System fonts only. No Google Fonts. No web fonts.**
`system-ui, -apple-system, sans-serif` — weight 800 for headings, 400 for body.
`ui-monospace, monospace` — weight 400 for labels, nav, mono elements.
Zero external font requests.

---

## Privacy and Email

**15. `toffer@post205.com` never appears on any public page.**
Not in HTML source, not in mailto links, not in JSON-LD. Crawlers index everything in source. Use Netlify forms for public contact. Use `dpo@post205.com` for legal/privacy contact only.

**16. Public contact = forms only.**
No mailto links on public pages. Netlify forms handle submission without exposing any email address.

**17. Vendor names are internal.**
Don't name Supabase, Resend, Netlify, or any infrastructure vendor in client-facing copy (privacy policies, proposals, website). Use generic classes: "cloud database provider," "email delivery service."

---

## Design

**18. Reading columns: 680px max-width for text-heavy pages.**
Optimal line length for reading. Every major publication uses 600–700px. Don't override this because it "looks narrow on a large monitor" — it's correct because it works for the reader.

**19. Design decisions serve the person using the thing, not the person building it.**
Before overriding a standard or convention: ask who benefits. "It looks better to us" is not a reason.

---

*Started: 2026-04-29*
*Source: decisions made while building post205.com, ops.post205.com, and the desk subdomain architecture.*
