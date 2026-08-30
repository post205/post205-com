# Workshop Section 1 — The Shape of Your Business

**Date:** 2026-08-30
**Status:** Approved design, ready for implementation planning
**Scope:** Section 1 of a multi-section paid workshop, plus the reusable
infrastructure every later section will sit on.

---

## 1. What this is

A half-day paid workshop for Philippine SME owners. Section 1 answers one question:
*what shape is your business, and what does running that shape actually cost you?*

The outcome is **awareness, not action**. Attendees are not asked to pivot, reprice,
or fix anything. They leave understanding that the thing they have privately treated
as their own failure is a structural property of the model they chose.

Three deliverables:

1. **The deck** — `/w/shape/`, driven from a phone remote, with spoken notes.
2. **The run sheet** — `/w/shape/script/`, for rehearsal without pairing a device.
3. **The library** — `/w/lib/`, a gated, researched concept page per idea. This is a
   paid asset that outlives the workshop and spans all future sections.

### Non-goals

- No self-scoring quiz. Scoring turns recognition into arithmetic, and people who
  score themselves wrong argue with the result instead of sitting with it.
- No advice on changing business model. That is a later section.
- The library is not DRM. The gate stops casual sharing, not a buyer who pastes
  decrypted text into a group chat. Price accordingly.

---

## 2. Research foundation

### Primary source

Alex Hormozi, "Use the Shape of Your Business to Scale," *The Game*, Ep. 1005,
17 Feb 2026. Source video referenced by Inc.: `youtube.com/watch?v=qsXxckCbci0`.

Three quotes carry the section:

> "There are only four main types of businesses. You need to know what shape your
> business really is to maximize the opportunity you're in."

> "Most people think that there is something inherently wrong with their business,
> when it is, in reality, a feature of the business, not a bug."

> "These are the core problems that make these businesses these businesses."

The second is the section's thesis.

### Verified supporting facts

| Fact | Source | Confidence |
|---|---|---|
| 182 distinct business model patterns catalogued across 22 collections; 194-element hierarchy needed to make them usable | Springer, *Electronic Markets* (2018), "A hierarchical taxonomy of business model patterns" | High — primary |
| 125,257 formal establishments in PH wholesale & retail trade | PSA, 2022 ASPBI | High — primary |
| MSMEs are ~99.5% of PH establishments; micro are ~90% of those; MSMEs are ~63% of employment | Triangulated: 2019 DTI-derived figures (99.5% / 89%) and Vilar et al., "Understanding economic contributions of MSMEs among Philippine Regions" (99.58% / 90.54% / 62.66%) | High as a **rounded** claim — say "about 99 in 100" and "about 9 in 10", never a decimal |
| ~~1,241,476 establishments; 99.63%; 90.66%; 66.58% (2024)~~ | Traceable only to a study guide citing PSA | **RETIRED 2026-08-30.** Do not use. PSA's own pages are JS-rendered and could not be scraped; the LOE URLs are shells. Precise figures without a primary source will not survive a paying room |
| ~~PH MSME sector split ("retail is ~46%")~~ | — | **RETIRED 2026-08-30.** Never located in any source. Do not use |

The 182-patterns finding is load-bearing: it is the defence for teaching a small
number. The scholarly answer to "how many shapes are there" is 182, and it is
useless in a room.

### The taxonomy: seven shapes

A shape earns its place only if it has a **distinct primary constraint**. If a
candidate's constraint is already covered, it is a variant, not a shape.

| Shape | Constraint | Attribution |
|---|---|---|
| **Product** | Cash locked in inventory; profit becomes the next order | Hormozi (renamed) |
| **Service** | Talent — the ceiling is who you can find and keep | Hormozi |
| **Info / Education** | Retention; graduates stop buying and some compete | Hormozi |
| **Software** | Patience — a long flat stretch before leverage | Hormozi |
| **Asset / Rental** | Utilization; cash locks into an asset once, then it is occupancy | POST205 |
| **Brokerage** | Deal flow; no inventory and no delivery capacity | POST205 |
| **Manufacturing** | Throughput at a bottleneck | POST205 |

**Renaming decision:** Hormozi's "E-Commerce" becomes **Product**. Most Philippine
product businesses are not online; the constraint is identical whether the channel is
Shopify or a stall. Labelled on-slide as our relabeling.

**Rejected candidates:** Marketplace/platform (constraint genuinely distinct —
two-sided liquidity — but nearly absent from an SME room; mention, do not teach).
Bricks-and-mortar retail (fails: Product with a location). Franchise (fails: inherits
the franchise's shape). Agriculture (borderline; treat as Manufacturing with
uncontrolled throughput).

**Accepted cost of seven over four:** the section runs to its full one-hour ceiling rather than ~45 minutes,
and self-identification becomes *sorting* rather than *recognition*, which is a
colder mental act. Accepted because a landlord or insurance agent sitting through
four shapes that do not describe them has paid to learn nothing.

---

## 3. The deck — `/w/shape/`

Built by copying `aios/course/` per `docs/deck-with-remote-playbook.md`. That playbook
is normative for this build: type sizes, the remote's five failure modes, notes
structure, art generation, animation pacing, and the Playwright harness all carry over
unchanged. Do not re-derive any of it.

### Arc: pain first, shape second

**19 slides, ~39 minutes of content, budgeted to land at 50–55 minutes in a real
room. One hour is a hard ceiling, so the design targets 50.** Six movements.

| Movement | Slides | Budget |
|---|---|---|
| M1 Commitment | 2 | 4 min |
| M2 The claim | 2 | 3 min |
| M3 The map + seven shapes | 8 | 18 min |
| M4 The reveal | 2 | 5 min |
| M5 The seam | 3 | 6 min |
| M6 Close | 2 | 3 min |

**M1 — The commitment (2 slides).** Attendees write, on paper, the one thing about
their business that has frustrated them for years — the thing they have decided means
they are bad at this. Nobody shares. The privacy is what makes M4 land rather than
turn into a performance.

**M2 — The claim (2 slides).** Seven shapes exist. You are in one, and you probably
did not choose it — you chose a product and the shape came attached. Includes the
182-patterns finding as the reason the number is small.

**M3 — The map, then the seven shapes (8 slides: 1 overview + 1 per shape).** The
overview slide shows all seven at once so attendees know the shape of the next
eighteen minutes and can start self-sorting immediately. Then one slide per shape,
each carrying the same two beats in the same order so the pattern becomes predictable:
what your week actually looks like, and the constraint, named.

At roughly two minutes per shape the **notes are doing nearly all the work here**.
This makes the run sheet and the read-aloud pass more important than elsewhere in the
deck, not less.

**If rehearsal overruns, the cut is to merge Info and Software onto one slide** — the
two rarest shapes in a Philippine SME room. Never cut M4 or M5.

Service carries one extra beat inside its notes (not a second slide): it is the least
risky of the seven — it can cut back to solo and stay profitable — and the price it
can charge is the owner's scoreboard, not a fixed market condition.

Attribution is visible on-slide: the four Hormozi shapes and the three POST205 shapes
are marked differently. This is a strength, not an apology — it is the difference
between doing the work and repackaging a podcast.

**M4 — The reveal (2 slides).** Read your paper again. Then the "feature, not a bug"
quote, held alone on screen. **This moment is the entire section.** Everything before
it is setup. If M3 runs long the reveal loses its charge, so M3 slides stay tight and
the notes carry the detail.

**M5 — The seam (3 slides).** For everyone whose frustration spanned two shapes. Most
real SMEs are two shapes bolted together — the restaurant is Service plus Product, the
clinic sells consultations plus supplements, the agency runs retainers plus a course.
Two constraints, not one. The specific failure: funding one side from the other and
starving both. Explicitly labelled as POST205's argument, not Hormozi's.

**M6 — Close (2 slides).** You will not fix your shape today and this section is not
asking you to. You will stop treating its cost as a personal failure. Then one QR to
`/w/lib/` and the passphrase spoken aloud.

### Copy discipline

`docs/writing-style.md` and `context/anti-slop-log.md` must be read **before** drafting
any slide or note copy, not after. Per the playbook, writing first and auditing second
previously produced a full rewrite. Watch specifically for: negative parallelism
("Not X. Y."), quotable one-liner drops, three-short-declarative triplets, and
polishing Toffer's dictated phrasing into something cleverer and more American than
how he speaks.

---

## 4. The library — `/w/lib/`

### Layout

```
w/
  shape/            Section 1 deck (self-contained HTML)
    r/              phone remote
    script/         run sheet — fetches and parses the deck, cannot drift
    img/            slide art (transparent PNGs)
  lib/
    index.html      gate + hub + client-side router
    lib.enc.json    AES-GCM payload: every concept page
    assets/         diagrams (unencrypted; meaningless without the prose)
    src/<slug>.html authoring source — gitignored, never deployed
    build.mjs       encrypts src/ into lib.enc.json
```

### Gate

Same crypto as `/in/mapping`: PBKDF2-SHA256 at 250,000 iterations, AES-GCM, wrong
passphrase throws. No new crypto is written for this.

**One passphrase per cohort** (decided 2026-08-30). Each run of the workshop gets its
own encrypted payload over the same content:

```
/w/lib/?c=<cohort>  ->  w/lib/lib.<cohort>.enc.json
node tools/build-lib.mjs <cohort> "<passphrase>"
```

A leaked passphrase therefore burns one cohort, not the library. Session storage is
keyed per cohort so one device can hold two cohorts without collision, and a missing
cohort payload reports that specifically rather than reading as a bad passphrase.

**Passphrases are normalised on both sides** — lowercased, all whitespace stripped —
so `Araw Bato Tubig`, `araw bato tubig` and `arawbatotubig` all open it. Thirty people
typing on phones will disagree about capitals and spaces, and none of that should
keep a buyer out mid-session.

**The passphrase does not name the workshop or its content** (decided 2026-08-30). It
rotates per cohort, so it is an access token, not a title. Naming it after Section 1
would also be wrong on its face: the library spans every section.

**`tools/build-lib.mjs`, not `encrypt-deck.mjs`.** The existing tool is shared with
`/in/mapping`, whose page does not normalise; adding normalisation there would
silently break that deck on its next rebuild. The new builder also concatenates pages
in `_manifest.json` order, which the library needs anyway.

The `normalise()` implementation is a contract across `tools/build-lib.mjs`,
`w/lib/index.html` and `tools/test-lib-roundtrip.mjs`. A mismatch makes every payload
unopenable, and the only symptom is "wrong passphrase" for a correct passphrase, so
the test cross-checks all three.

**One gate for the whole library, not one per page.** A person unlocks `/w/lib/` once;
the decrypted payload holds every concept, routed by hash (`/w/lib/#shape-brokerage`).
Per-page gates would mean re-entering a passphrase on a phone eight times and keeping
eleven encrypted files in sync.

**Authoring is separate from shipping.** Concept pages are written as readable
`src/<slug>.html` files and compiled into the payload by `build.mjs`. Editing a 40KB
JSON blob by hand is what made the mapping deck's content painful to maintain. Toffer
audits the readable source; the build ships the encrypted one.

**The deck does not link into the library during the talk.** If it is reachable
mid-session, people read instead of listening.

### Design

The hub is dark, continuous with the deck — it should feel like walking backstage.
Individual concept pages use the site's existing pattern: dark masthead over a light
reading field with `#0e9a9d`. These pages are read for forty minutes, not projected;
long-form reading on a dark field is a real cost.

### Three-tier attribution

Every page marks each claim as one of three kinds, visually distinct:

- **Sourced** — citation with a link. Mandatory for anything with a number.
- **Hormozi says** — his claim, marked as his.
- **Our read** — POST205's argument.

This exists because the failure mode of the whole project is Hormozi's authority
quietly stretching to cover claims he never made. `the-seam` is nearly all "our read"
and must not look like research.

### The eleven pages

| Slug | Covers | Research |
|---|---|---|
| `seven-shapes` | The map; how to place yourself; why 182 is the wrong answer | firecrawl |
| `shape-product` | Why a profitable product business has no cash | **storm** |
| `shape-service` | The talent ceiling; price as scoreboard | firecrawl |
| `shape-info` | The graduate problem; churn | firecrawl |
| `shape-software` | The flat stretch before leverage | firecrawl |
| `shape-asset` | Utilization, not inventory | **storm** |
| `shape-brokerage` | Deal flow as the only constraint | **storm** |
| `shape-manufacturing` | Throughput at the bottleneck | **storm** |
| `feature-not-bug` | Why owners read structural cost as personal failure | **storm** |
| `constraints` | One constraint at a time (Goldratt; credited by Hormozi) | **storm** |
| `the-seam` | Hybrids carry two constraints | **storm** |

Seven storm runs, four firecrawl-only. The three Hormozi shapes skip storm because on
those, he *is* the citation. The three POST205 shapes all get storm because they carry
no borrowed authority — `shape-brokerage` most of all, since it will be read by people
who are insurance agents and know more than the page does.

### Per-page pipeline

1. **Firecrawl** primary sources — the actual Hormozi transcript, not a summary of it;
   Goldratt directly, not a blog about Goldratt.
2. **Storm** (where specified) — five lenses, contradiction map, adversarial peer
   review, primary-source verification. Output committed to
   `storm-reports/<slug>-briefing.html`. That is the audit trail: when a paying
   attendee challenges a number, the briefing opens.
3. **Write the page from the briefing**, not from memory.
4. **Toffer audits it.** One page, live URL, then the next.

### Audit cadence

`seven-shapes` is built completely — storm, design, deploy — and reviewed alone. It
sets the template, citation style, depth, and length. Only after it is approved do the
remaining ten proceed. Building all eleven and handing over a pile would compound a
mistake through ten pages that would have been caught on the first.

---

## 5. Verification

Per `~/.claude/CLAUDE.md` and the project CLAUDE.md: loading it is part of done.

- Playwright harness from the playbook §7, run at 1920×1080, 1600×900, 1366×768 and
  1024×768: frame overflow, right-edge escape, text/art intersection, SVG label
  containment, dangling paths, headline runts, failed images, `pageerror`.
- Known false-finding traps documented in the playbook §7 apply unchanged — headless
  Chrome's ~500px window floor, `--virtual-time-budget` skipping real network waits,
  screenshots taken mid-transition, and ≤6px descender overflow.
- **The library gate must be tested against a wrong passphrase**, an empty passphrase,
  and a reload after unlock. The mapping pattern throws on a wrong key; confirm the
  page reports that rather than failing silently.
- **Every citation link must be fetched and confirmed to resolve.** A paid research
  asset with a dead footnote is worse than one with no footnote.
- Read the notes out loud. It is the only test that finds notes which fight the mouth.

---

## 6. Open items

1. ~~Re-verify the PSA 2024 MSME figures.~~ **Closed 2026-08-30 — retired.** PSA's own
   pages are JS-rendered and unscrapeable; the precise 2024 figures had no primary
   source. Replaced by the rounded triangulated claim in §2.
2. ~~The PH MSME sector split.~~ **Closed 2026-08-30 — retired**, never located.
3. ~~Passphrase and QR target.~~ **Partially closed 2026-08-30.** Access model decided:
   one passphrase per cohort, normalised, unrelated to the workshop's name. The QR in
   M6 must carry `?c=<cohort>`. **Still open:** the actual passphrase for the first
   cohort, and the cohort slug.
4. **Later sections** reuse `/w/lib/` and the deck shell. Their arcs are out of scope
   for this spec.
