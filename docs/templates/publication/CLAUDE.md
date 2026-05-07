# Publication Platform — Template Overview

A multi-publication CMS platform for media clients. One client, multiple publications, one Supabase project.

**Spec:** `docs/superpowers/specs/2026-05-07-publication-platform-design.md`

---

## How to use this template

Each publication platform involves four site types. Each is a **separate repo and separate Netlify site**. Copy the matching sub-template folder into the new repo.

| Sub-template | Copy into | Lives at |
|---|---|---|
| `ops/` | ops panel repo | `ops.[umbrella-domain]` |
| `desk/` | desk repo (one per publication) | `desk.[pub-domain]` |
| `website/` | public site repo (one per publication) | `[pub-domain]` |

The umbrella marketing site (`[umbrella-domain]`) uses the existing `website/` template from `docs/templates/website/`.

---

## Platform architecture

```
[umbrella-domain].com          ← marketing site (website template)
ops.[umbrella-domain].com      ← super admin ops panel (this template: ops/)

[pub-domain].com               ← publication public site (this template: website/)
desk.[pub-domain].com          ← publication desk — writers + editors (this template: desk/)
```

Repeat `[pub-domain]` + `desk.[pub-domain]` for each additional publication.

---

## Shared Supabase project

All sites for one client share **one Supabase project**. The `publications` table scopes all content.

Core tables: `publications`, `profiles`, `articles`
Roadmap tables: `subscribers`, `site_content`

See the spec for the full schema and RLS policies.

---

## Roles

| Role | Where they work | Scope |
|---|---|---|
| `super_admin` | Ops panel + any desk | All publications |
| `editor` | Desk only | One publication |
| `writer` | Desk only | One publication — own articles only |

---

## Content workflow

```
writer drafts → submits for review → editor approves → published
                                   → editor rejects → draft + rejection note
```

---

## Phase roadmap

| Phase | What gets built |
|---|---|
| 1 | Ops panel + public sites + desks with full editorial workflow |
| 2 | Newsletter (Resend) + subscriber management |
| 3 | Reader opt-in, paywall, member access |
| 4 | Community (reader accounts, comments) |

---

## Reference client: Digital Advocate PH

| Site | URL |
|---|---|
| Marketing site | `digitaladvocateph.com` |
| Ops panel | `ops.digitaladvocateph.com` |
| Publication 1 (public) | `advocatesomi.com` |
| Publication 1 (desk) | `desk.advocatesomi.com` |
| Publication 2 (public) | `inspirasyon.ph` |
| Publication 2 (desk) | `desk.inspirasyon.ph` |
