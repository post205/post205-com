# /cpd — CPD Showcase Page Design

**Date:** 2026-06-09
**Route:** `post205.com/cpd` (served from `cpd/index.html`)
**Status:** Approved design, pending implementation plan

## Purpose

A self-contained, single-page demo that proves the concept of a PRC-compliant
Continuing Professional Development (CPD) flow to prospects (e.g. an architectural
firm or group). It shows — end to end, on one page — how a CPD event invite, a
post-session questionnaire, a completion certificate, a notification email, and an
organizer dashboard fit together.

This is a **showcase / sales artifact**, not a production tool. No backend.

## Non-goals (YAGNI)

- No Supabase, no Netlify Forms, no server.
- No real email send (Resend etc.). Email is rendered as a styled preview only.
- No authentication, no admin login.
- No real PRC API validation. PRC fields are collected and echoed, not verified.
- No third-party JS libraries. Certificate download uses the browser's native
  print-to-PDF via a print stylesheet.

## Stack & constraints

- Static HTML + vanilla JS + CSS, consistent with the rest of the post205 site.
- Reuses the existing design system / tokens (see `DESIGN.md`) and is
  `theme-toggle.js` compatible (light/dark).
- Zero build step, zero dependencies.
- Layout: **single scrolling page with progressive reveal** (approach A). Sections
  1 and 2 render on load; Section 3 is hidden until a valid submit, then scrolls
  into view.

## Page structure — three sections

### Section 1 — The Invite
An invitation card for a **seeded sample** architectural CPD event. Fields shown:
- Event title
- Date & time
- Venue
- Accrediting / sponsoring body (e.g. UAP, PRC-accredited provider)
- CPD units / credit
- Speaker name + topic

Purely presentational. Sets the scene for the questionnaire.

### Section 2 — The Questionnaire
A single form, two groups. Every field is marked **required** or **optional**;
the validator enforces required fields before submit.

**PRC-style identity**
- Full name — required
- Email — required, format-validated
- PRC license number — required
- Profession / registration (e.g. Architect) — required
- License validity date — required. Input `type="date"`, stored ISO `YYYY-MM-DD`.
  No past/future check — this is a demo; any date is accepted.

**Event feedback** (CPD-style questions)
- Speaker rating (Likert radio, 1–5) — required
- Relevance of topic (Likert radio, 1–5) — required
- Key takeaway (short text) — required
- Suggested future topics (short text) — optional

**On submit:**
1. Validate required fields + email format. Show inline errors; do not proceed if invalid.
2. Build a submission record and append it to localStorage.
3. Reveal Section 3 and scroll to it.

**Repeat submit within a session:** Section 3 always (re)binds to the **most recent**
submission — the certificate and email preview re-render for the newest submitter,
and the dashboard table/stats refresh to include the new row. The previously shown
cert/email are replaced, not stacked.

### Section 3 — Results (revealed on submit)
Three blocks:

1. **Certificate of completion** — PRC-style layout (see note below), auto-filled
   from the submitter's answers + `EVENT`: attendee name + PRC number (from
   submission), event title + CPD units + speaker (from `EVENT`). The date printed
   on the cert is the **event date** (`EVENT.date`) as the completion date; a
   smaller "Issued: <submittedAt>" line carries the submission timestamp.
   A **Download** button triggers browser print-to-PDF. Print isolation: a print
   stylesheet hides everything except the certificate subtree
   (`@media print { body * { visibility: hidden } #certificate, #certificate * { visibility: visible } #certificate { position: absolute; inset: 0 } }`)
   so the PDF contains only the cert — no dashboard/email bleed.

2. **Email preview** — a styled mockup of the approval/notification email the
   attendee would receive, with the certificate shown as "attached." Clearly
   labeled "Preview — this is what gets sent." No actual send.

3. **Organizer dashboard**
   - Stat tiles: total submissions, unique attendees, average speaker rating,
     average relevance rating. **Unique attendees** = count of distinct emails after
     normalizing (trim + lowercase); same normalized email = one attendee regardless
     of name differences.
   - Submissions table: one row per submission, columns = name, PRC number, email,
     submitted timestamp, speaker rating, relevance rating. Repeat or duplicate
     emails stack as additional rows — exactly as real multi-attendee submissions would.
   - **Download CSV** button: exports **all** submissions (seeded + real) as a CSV
     blob (client-side). Columns, in order: `name, email, prcNumber, profession,
     licenseValidity, speakerRating, relevanceRating, takeaway, futureTopics,
     submittedAt`. Values are RFC-4180 quoted — any field containing a comma,
     double-quote, or newline is wrapped in double-quotes with internal quotes
     doubled. This matters for the free-text `takeaway` / `futureTopics` fields.

## Data model

Single localStorage key, e.g. `post205_cpd_submissions`, holding a JSON array of:

```json
{
  "name": "string",
  "email": "string",
  "prcNumber": "string",
  "profession": "string",
  "licenseValidity": "string (date)",
  "speakerRating": 1,
  "relevanceRating": 1,
  "takeaway": "string",
  "futureTopics": "string",
  "submittedAt": "ISO 8601 string"
}
```

**Seeding:** On first load, if the key is absent, seed 3–4 plausible sample
submissions so the dashboard and table look populated for a prospect. Seeded rows
are indistinguishable from real ones in the table (the point is to look alive), and
are **included in stats and CSV export** like any other row.

## `EVENT` config

A single static object at the top of the page script, the source of truth for the
invite + certificate + email. Keys:

```js
const EVENT = {
  title:    "string",   // event title (invite + cert)
  date:     "string",   // display date, also printed as cert completion date
  time:     "string",   // start–end time (invite)
  venue:    "string",   // (invite)
  body:     "string",   // accrediting / sponsoring body (invite + cert footer)
  cpdUnits: "string",   // e.g. "3 CPD units" (invite + cert)
  speaker:  "string",   // speaker name (invite + cert)
  topic:    "string"    // talk topic (invite + email)
};
```

The invite renderer and certificate renderer both read these exact keys.

## "PRC-style" note

There is no real PRC validation in this demo. "PRC-style" means the certificate
visually mimics a Philippine CPD completion certificate — attendee name, PRC license
number, profession, event title, CPD units, accrediting body, and date — laid out
like a formal certificate. The implementation should follow a reference certificate
image/layout if one is provided; otherwise a clean formal cert layout with those
fields is sufficient.

## Component breakdown (for isolation)

- **Invite renderer** — reads a static `EVENT` config object, renders Section 1.
  Depends on: nothing.
- **Questionnaire / validation** — renders the form, validates, produces a
  submission record. Depends on: `EVENT` (for cert fields).
- **Store** — load/save/seed the localStorage array; the single source of truth.
  Depends on: localStorage.
- **Certificate renderer** — takes one submission + `EVENT`, renders the cert and
  handles print-to-PDF. Depends on: print stylesheet.
- **Email preview renderer** — takes one submission + `EVENT`, renders the mock email.
- **Dashboard** — takes the full submissions array, renders stat tiles + table +
  CSV export. Depends on: Store.

Each unit communicates through plain submission objects + the `EVENT` config; any
can be tested by passing a fixture array.

## Error handling

- Invalid/missing required fields → inline messages, submit blocked.
- localStorage unavailable (private mode) → fall back to in-memory array for the
  session; show a non-blocking notice. The demo still works for the current visitor.
- CSV with zero rows → button disabled or downloads header-only file.

## Testing

- Manual: load → seeded dashboard visible; submit valid form → Section 3 reveals
  with correct cert + email + new table row; CSV downloads and opens correctly;
  print-to-PDF produces a clean certificate; theme toggle works in both modes;
  responsive on mobile.
- Validation: empty required fields and bad email block submit.

## Open decisions (resolved)

- Real vs demo → **demo / showcase**.
- Persistence → **localStorage only** (+ seeded samples).
- Certificate & email → **both rendered as previews**; cert downloadable via print.
- Layout → **A: single scrolling page, progressive reveal**.
