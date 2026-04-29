# Project Templates — How to Use

Three templates. One for the public website, one for the content management desk, one for internal back-office tools. Every new client gets the first two. Add ops when they need an internal command center.

---

## Starting a new website project

**1. Duplicate the template folder**
Copy `docs/templates/website/` into your projects directory. Rename it to match the client:
```
post205-[clientname]-com/
```

**2. Fill in the placeholders**
Open `CLAUDE.md` and replace every instance of:
- `[CLIENT NAME]` → the client's business name
- `[DOMAIN]` → their domain (e.g. `clientname.com`)
- `[YEAR]` → current year

**3. Create the infrastructure**
- GitHub: new repo named `post205-[clientname]-com` (private)
- Netlify: new site connected to that repo, note the site ID
- Supabase: new project for this client (never share with another client)
- Cloudflare: client adds CNAME pointing to Netlify (you give them the record)

**4. Set up `.env`**
Copy `.env.example` to `.env`, fill in the keys from the new infrastructure.

**5. Open as a new VS Code project**
Each website is its own VS Code window and its own Claude Code session.

**6. Align Claude**
At the start of every session, say:
> "Read CLAUDE.md."

That's it. Claude will know the stack, design system, rules, and what's built vs. what's next.

---

## Starting a new desk project

**1. Duplicate the template folder**
Copy `docs/templates/desk/` into your projects directory. Rename it:
```
post205-[clientname]-desk/
```

**2. Fill in the placeholders**
Open `CLAUDE.md` and replace:
- `[CLIENT NAME]` → client's business name
- `[DOMAIN]` → their domain
- `[TOFFER_UID]` → your Supabase user UUID (from the auth.users table)

**3. Create the infrastructure**
- GitHub: new repo named `post205-[clientname]-desk` (private)
- Netlify: new site, connect to repo, note the site ID
- DNS: add `desk.[domain]` CNAME → Netlify site (client adds this in their DNS)
- No new Supabase project — desk shares the same project as the website

**4. Set up `.env`**
Same Supabase URL and keys as the paired website project.

**5. Open as a new VS Code project**
Separate window, separate Claude Code session from the website project.

**6. Align Claude**
> "Read CLAUDE.md."

---

## Starting a new ops project

**1. Duplicate the template folder**
Copy `docs/templates/ops/` into your projects directory. Rename it:
```
post205-[clientname]-ops/
```
Or for POST 205's own ops: `post205-ops/`

**2. Fill in the placeholders**
Open `CLAUDE.md` and replace:
- `[ENTITY NAME]` → the business name this tool is for
- `[DOMAIN]` → the ops subdomain (e.g. `ops.post205.com`)
- `[TOFFER_UID]` → your Supabase user UUID

**3. Create the infrastructure**
- GitHub: new repo (private)
- Netlify: new site, connect to repo, note the site ID
- DNS: add `ops.[domain]` CNAME → Netlify site
- Supabase: use the same project as the paired website and desk, or create a new one if this is a standalone tool

**4. Set up `.env` and `js/env.js`**
Copy `.env.example` to `.env`, fill in keys. Then create `js/env.js` manually — it's gitignored and must be created on every fresh clone.

**5. Open as a new VS Code project**
Separate window, separate Claude Code session.

**6. Align Claude**
> "Read CLAUDE.md."

---

## Rules that apply to every project

- Read `docs/build-rules.md` before building anything
- Admin (desk) always on its own subdomain — never `/admin/` on the public site
- Client owns their domain and DNS — you manage it as a collaborator
- `toffer@post205.com` never appears in any source file
- Deploy via Netlify CLI — GitHub push does not auto-deploy
- Vendor names (Supabase, Resend, Netlify) never in client-facing copy

---

## The subdomain picture for every client

```
[domain]          → public website     → post205-[client]-com repo
desk.[domain]     → content mgmt       → post205-[client]-desk repo
ops.[domain]      → internal tool      → post205-[client]-ops repo
sign.[domain]     → proposals + SLAs   → post205-sign repo (shared)
ops.post205.com   → POST 205 ops       → post205-ops repo (yours, not theirs)
```

`sign` is a shared tool — one Netlify site serves all clients' proposals via UUID slugs. It does not need a per-client repo.

---

*Updated: 2026-04-29*
