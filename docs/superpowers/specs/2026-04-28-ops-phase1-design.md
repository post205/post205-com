# ops.post205.com — Phase 1 Design Spec

**Date:** 2026-04-28  
**Status:** Approved  
**Scope:** Foundation — clients, partners, projects, lifecycle, dashboard  
**Next phases:** Phase 2 (billing/invoices), Phase 3 (Xendit subscriptions), Phase 4 (client embed)

---

## What this builds

A private command center at `ops.post205.com` — accessible only to Toffer. Phase 1 establishes the full data model and UI for managing clients, partners, and projects, including the activation lifecycle and 4Rs retention framework. No billing or payment features yet; those are Phase 2.

---

## Stack

- **Frontend:** Vanilla HTML/CSS/JS — no framework, no build step
- **Deploy:** Netlify (separate site from post205.com)
- **Database/Auth:** Supabase — same project as post205.com (`dikuhcaaxxsadlwepblf`)
- **Email:** Resend (Phase 2)
- **Payments:** Xendit (Phase 3)

---

## Auth

Supabase email/password auth. Session persisted via `localStorage`. Single user — Toffer only. No client-facing login, no client access to ops, ever.

On load: check session. If none, redirect to `/login`. After login, redirect to `/`.

**RLS:** All ops tables have RLS enabled. Policy on every table: `auth.uid() = '<toffer-auth-uid>'` — only Toffer's authenticated session can read or write. The Supabase anon key is safe to use in the frontend JS because RLS blocks all other users. Do not use the service role key client-side.

---

## Navigation

Persistent left sidebar, 200px wide. Items:

| Label | Route | Phase |
|---|---|---|
| Dashboard | `/` | 1 |
| Clients | `/clients` | 1 |
| Partners | `/partners` | 1 |
| — | — | — |
| Invoices | `/invoices` | 2 — greyed out |
| Subscriptions | `/subscriptions` | 3 — greyed out |
| — | — | — |
| Settings | `/settings` | 1 (business info only) |

Sidebar header: `POST 205 OPS` in monospace + `· PRIVATE ·` subtext. Footer: logged-in email.

---

## Dashboard

Single screen showing everything that matters today.

### Action needed strip

A horizontal strip at the top of the dashboard. Shows live counts — computed from database state, not stored. Updates on every page load.

| Signal | Condition |
|---|---|
| Clients not yet activated | `lifecycle_stage = 'onboarding'` AND `activated_at IS NULL` |
| Onboarding overdue (14+ days) | above AND `created_at < now() - interval '14 days'` |
| Activated — no review ask | `activated_at IS NOT NULL` AND `review_asked_at IS NULL` |
| Partner not yet activated | `activation_status = 'pending'` |
| Referral opportunity | `review_received_at IS NOT NULL` AND `referral_asked_at IS NULL` |

No automated actions triggered. This is signal only — Toffer decides when to act.

### Stats row

Four cards:

- **Monthly retainers** — SUM of `retainer_rate` WHERE `projects.status = 'active'`
- **Active clients** — COUNT where `lifecycle_stage IN ('activated', 'retained')` + subtext showing onboarding count
- **Outstanding** — placeholder, "Phase 2"
- **Due this month** — placeholder, "Phase 2"

### Content cards

Two columns below stats:

- **Left:** Client list (name, stage badge, project count)
- **Right:** Projects by status (Active / On Hold / Pending)

---

## Clients

Split view: left rail (220px) + right detail pane.

### Left rail

- Search bar (client-side filter)
- Scrollable list of all clients, sorted by lifecycle stage priority (onboarding first, then activated, then retained, then churned)
- Each row: client name + stage badge + overdue flag if applicable

### Right detail pane — tabs

**Overview tab**
- Client header: name, domain, lifecycle stage badge
- Contact info: email, phone, billing address
- Proposal URL (links to post205.com/p/[slug]) and Service Agreement URL (links to post205.com/sa/[slug]) — stored on the client record, editable inline
- Notes field (editable)

**Projects tab**
- List of all projects for this client
- Each project: name, status, retainer rate, billing cadence, start date, proposal link
- Click → project detail view (inline, within the pane)

**Lifecycle tab**
- Stage progress bar: Onboarding → Activated → Retained → Reviewed → Referred. "Reviewed" and "Referred" are visual-only derived states — computed from timestamp fields (`review_received_at IS NOT NULL` → Reviewed; `referral_asked_at IS NOT NULL` → Referred). They are not stored values in `lifecycle_stage`. `lifecycle_stage` stores only: onboarding | activated | retained | churned.
- Activation checklist: steps with label, completed_at, win_note. Steps are editable/addable per client. Add step = inline text input that appends a new `activation_steps` row. Edit step = click label to edit inline. Mark complete = click checkbox, stamps `completed_at = now()`.
- 4Rs tracker (visible after activation):
  - **Retain:** last check-in date
  - **Review:** prompted when activated and no review asked yet
  - **Refer:** prompted when review received and no referral asked
  - **Resell:** timing note only (no automation)
- All 4R actions are logged by Toffer manually — dates stamped on the `clients` record

**Costs tab**
- Revenue: retainer_rate × months since start
- Itemized project costs (from `project_costs` for projects belonging to this client)
- Net and margin calculation
- Phase 2 note: "Full profitability tracks against invoices paid"

---

## Partners

Split view identical in structure to Clients.

### Partner types

| Type | Description |
|---|---|
| `agent` | Refers clients. Commission on activation, not per project. Not project-facing. |
| `supplier` | Provides services on specific projects. Per-project cost entries. |
| `employee` | Manages/works on projects. Allocated cost per project per month. |

### Left rail

- Search + filter chips: All | Agent | Supplier | Staff
- Sorted by type (agents first, then suppliers, then employees), then alphabetically by name within each type
- Each row: name, service/role, type badge

### Right detail pane — tabs

**Overview tab**
- Name, email, phone
- Agreement URL (link out — stores Google Drive or similar link)
- Commission terms (agents): type (percent | flat), rate, trigger event
- Default rate + unit (suppliers/employees): monthly | per_project | hourly
- Notes

**Clients Referred tab** (agents only)
- List of referred clients with commission status (pending | paid) and amount

**Projects tab** (suppliers/employees)
- Projects this partner is assigned to with their cost entries

**Activation tab**
- Activation status: pending | activated
- Activation checklist (same `activation_steps` table as clients, entity_type = 'partner')
- Win note: what was the first deliverable / first payment

---

## Settings

Single page. Business info for BIR compliance (used in Phase 2 invoice generation):

- Business name
- TIN + branch code
- Registered address
- VAT status (Non-VAT / VAT-registered)
- Owner name

Stored in `business_settings` table as a singleton row. On page load, SELECT the row — if none exists, form renders blank. On save, run an upsert (INSERT ... ON CONFLICT (id) DO UPDATE) using a fixed well-known UUID as the singleton key. No second row can exist.

---

## Data model

### `clients`

```
id                  uuid PK
name                text NOT NULL
email               text
phone               text
billing_address     text
domain              text
proposal_url        text
service_agreement_url text
lifecycle_stage     text — 'onboarding' | 'activated' | 'retained' | 'churned'
activated_at        timestamptz
activation_win      text
review_asked_at     timestamptz
review_received_at  timestamptz
referral_asked_at   timestamptz
last_checkin_at     timestamptz
notes               text
created_at          timestamptz DEFAULT now()
```

### `projects`

```
id                  uuid PK
client_id           uuid FK → clients
name                text NOT NULL
description         text
status              text — 'active' | 'on_hold' | 'pending' | 'completed'
retainer_rate       numeric
billing_cadence     text — 'monthly' | 'quarterly' | 'one_time'
billing_day         int — day of month (1–28); stored for Phase 2 invoice scheduling, not used in Phase 1 UI
start_date          date
proposal_url        text
proposal_title      text
notes               text
created_at          timestamptz DEFAULT now()
```

### `partners`

```
id                  uuid PK
name                text NOT NULL
type                text — 'agent' | 'supplier' | 'employee'
email               text
phone               text
agreement_url       text
commission_rate     numeric
commission_type     text — 'percent' | 'flat'
commission_trigger  text — e.g. 'client activation', 'signed agreement', 'first invoice paid'; free text
default_rate        numeric
rate_unit           text — 'monthly' | 'per_project' | 'hourly'
activation_status   text — 'pending' | 'activated'
activated_at        timestamptz
activation_win      text
notes               text
created_at          timestamptz DEFAULT now()
```

### `client_agents`

```
id                  uuid PK
client_id           uuid FK → clients
partner_id          uuid FK → partners
commission_amount   numeric — manually entered by Toffer; the agreed amount for this specific referral
commission_status   text — 'pending' | 'paid'
paid_date           date
created_at          timestamptz DEFAULT now()
```

`commission_amount` is always set manually. `partners.commission_rate` is a reference/default only — it does not auto-populate `commission_amount`. Two different clients referred by the same agent can have different agreed amounts.

### `project_costs`

```
id                  uuid PK
project_id          uuid FK → projects
partner_id          uuid FK → partners (nullable — can log misc costs without a partner)
cost_type           text — 'labor' | 'tool' | 'misc'
description         text
amount              numeric NOT NULL
cost_date           date
period_month        text — 'YYYY-MM' for recurring monthly allocations
notes               text
created_at          timestamptz DEFAULT now()
```

### `activation_steps`

```
id                  uuid PK
entity_type         text — 'client' | 'partner'
entity_id           uuid — polymorphic; points to clients.id or partners.id depending on entity_type
label               text NOT NULL
completed_at        timestamptz
win_note            text
sort_order          int DEFAULT 0  — auto-incremented on append (MAX(sort_order) + 1 for this entity); no drag-to-reorder in Phase 1
created_at          timestamptz DEFAULT now()
```

No FK constraint on `entity_id` (polymorphic). No hard deletes in Phase 1 — clients and partners are deactivated by setting `lifecycle_stage = 'churned'` or `activation_status = 'pending'`, not deleted. Orphaned rows are not a risk in Phase 1.

### `business_settings`

```
id                  uuid PK (singleton — one row only)
business_name       text
tin                 text
branch_code         text
address             text
vat_status          text — 'non_vat' | 'vat'
owner_name          text
updated_at          timestamptz DEFAULT now()
```

---

## Profitability calculation

Computed, not stored. Per project:

```
months_active = floor(days_since_start / 30)  — integer, minimum 1
revenue       = retainer_rate × months_active
costs         = SUM(project_costs.amount WHERE project_id = ?)
net           = revenue - costs
margin        = net / revenue × 100
```

For clients without platform (Phase 1 only): invoice PDF sent via email + Xendit payment link manually. No automated billing until Phase 2.

---

## Core values connection

The dashboard action strip is a direct expression of the founding principle: **culture is what we incentivize and make easy.** Activation and 4Rs aren't reminders — they're made impossible to ignore. The system doesn't do the work, but it makes the right next step visible every time Toffer opens the dashboard.

---

## Out of scope for Phase 1

- Invoice generation and PDF export (Phase 2)
- Resend email delivery (Phase 2)
- Xendit payment links (Phase 2)
- Xendit subscriptions API (Phase 3)
- Client-facing billing embed (Phase 4)
- SOA generation (Phase 2)
- Any form of client login or client-facing view (never in ops)
