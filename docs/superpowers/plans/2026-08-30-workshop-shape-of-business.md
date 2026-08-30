# Workshop Section 1 — Shape of Your Business — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a one-hour workshop section — a 19-slide deck driven from a phone remote, a run sheet, and a gated eleven-page researched concept library that attendees pay for.

**Architecture:** Three static HTML surfaces under `/w/`, no build step and no framework, copied from the proven `aios/course/` deck and the `in/mapping` crypto gate. The library is one AES-GCM payload unlocked once and routed client-side by hash. Research is done before writing, and every claim is tagged with its source tier.

**Tech Stack:** Vanilla HTML/CSS/JS · vendored anime.js v4 ESM (`/js/vendor/anime.esm.min.js`) · Web Crypto (PBKDF2-SHA256 250k, AES-GCM) · Supabase Realtime over a plain WebSocket · Netlify · Playwright for the visual audit.

**Spec:** `docs/superpowers/specs/2026-08-30-workshop-shape-of-business-design.md`

---

## A note on testing in this plan

This project is mostly research and prose, so strict red-green TDD applies only where
there is actual logic: the encryption round-trip, the gate's failure paths, and the
hash router. Those get real failing-test-first tasks.

Everything else is verified the way `~/.claude/CLAUDE.md` demands — **load the real
thing and look at it.** A slide that "should" fit is not a slide that fits. A citation
that "should" resolve is not one that does. Where a task's check is visual or
editorial, the step says exactly what to open and what to look for, and that check is
not optional.

---

## File structure

```
w/
  shape/
    index.html          deck: 19 slides, notes in <template class="notes">, module script
    r/index.html        phone remote (Supabase Realtime, hand-rolled WebSocket)
    script/index.html   run sheet — fetches ../index.html, parses, cannot drift
    img/                slide art, transparent PNGs
  lib/
    index.html          gate + hub + hash router + concept page renderer
    lib.enc.json        AES-GCM payload (committed; unreadable without passphrase)
    assets/             diagrams referenced by pages (unencrypted)
tools/
  encrypt-deck.mjs      EXISTS — reused as-is, do not rewrite
  lib-src/              authoring source for the 11 pages (gitignored)
    _manifest.json      slug → title, tier, order
    <slug>.html         one file per concept page
storm-reports/
  <slug>-briefing.html  committed research trail, one per stormed page
docs/superpowers/specs/2026-08-30-workshop-shape-of-business-design.md
netlify.toml            + noindex header for /w/*
robots.txt              + Disallow: /w/
```

**Boundary decisions:**

- `tools/lib-src/` is gitignored and never deployed, exactly like `tools/mapping-slides.html`.
  Toffer audits these readable files; only the ciphertext ships.
- The library is **one** payload, not eleven. Concatenated at build time from
  `_manifest.json` order, split client-side on a delimiter.
- The deck does not import anything from the library, and the library does not import
  anything from the deck. They share only the design tokens, by copy.

---

## Phase 0 — Scaffold and gate

### Task 1: Verify the two open facts before anything is written

The spec holds two facts at insufficient confidence. They block the `seven-shapes`
page. Do this first, because a wrong number on a paid slide is the single worst
outcome of this project.

**Files:**
- Modify: `docs/superpowers/specs/2026-08-30-workshop-shape-of-business-design.md:55-66`

- [x] **Step 1: Fetch the PSA/DTI primary sources**

```bash
cd /Users/toffer/Documents/2026/Claude/Projects/post205
firecrawl scrape "https://psa.gov.ph/content/2023-list-establishments" -o .firecrawl/psa-loe.md
firecrawl search "PSA 2024 List of Establishments total establishments MSME micro small medium share" \
  --scrape --limit 8 -o .firecrawl/psa-verify.json --json
```

- [x] **Step 2: Confirm or reject each figure**

For each of: 1,241,476 establishments · 99.63% MSME · 90.66% micro · 66.58% of
employment · the sector split — record the primary URL and the exact publication that
carries it.

Expected outcomes, all acceptable:
- **Confirmed** → update the spec's confidence column to "High — primary" with the URL.
- **Different number found** → use the primary figure, note the discrepancy.
- **Not findable** → mark "DO NOT USE" in the spec and design the slide without it.

- [x] **Step 3: Commit the verification result**

```bash
git add docs/superpowers/specs/2026-08-30-workshop-shape-of-business-design.md
git commit -m "docs: verify (or retire) the PSA MSME figures against primary sources"
```

**Do not proceed to Task 2 until every figure is either sourced or explicitly retired.**

---

### Task 2: Scaffold `/w/` and lock it out of search

**Files:**
- Create: `w/lib/index.html`, `w/lib/assets/.gitkeep`, `tools/lib-src/_manifest.json`
- Modify: `netlify.toml`, `robots.txt`, `.gitignore`

- [x] **Step 1: Add the noindex header and robots rule**

In `netlify.toml`, beside the existing `/p/*` and `/g/*` blocks:

```toml
# Paid workshop material — link + passphrase only
[[headers]]
  for = "/w/*"
  [headers.values]
    X-Robots-Tag = "noindex, nofollow"
```

In `robots.txt`, after `Disallow: /g/`:

```
Disallow: /w/
```

- [x] **Step 2: Gitignore the authoring source**

Append to `.gitignore`:

```
tools/lib-src/
```

- [x] **Step 3: Verify the ignore actually takes**

```bash
mkdir -p tools/lib-src && echo test > tools/lib-src/probe.html
git status --porcelain tools/lib-src/
```

Expected: **no output.** If `probe.html` appears, the ignore is wrong — fix before
continuing, because a leaked source file defeats the entire gate.

```bash
rm tools/lib-src/probe.html
```

- [x] **Step 4: Commit**

```bash
git add netlify.toml robots.txt .gitignore
git commit -m "chore: reserve /w/ for workshop material, noindex and gitignore sources"
```

---

### Task 3: The library payload round-trip (TDD)

The one piece of genuine logic. Test it before the page exists.

**Files:**
- Create: `tools/lib-src/_manifest.json`, `tools/test-lib-roundtrip.mjs`

- [x] **Step 1: Write the failing round-trip test**

`tools/test-lib-roundtrip.mjs`:

```javascript
// Round-trip test: encrypt a multi-page payload, decrypt it the way the browser
// will, and confirm every page comes back intact and splits on the delimiter.
import { webcrypto as crypto } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert';

const DELIM = '\n<!--PAGE-->\n';
const PASS = 'test-passphrase-not-the-real-one';

const pages = [
  { slug: 'alpha', html: '<h1>Alpha</h1><p>Cash & inventory — em dash, ampersand.</p>' },
  { slug: 'beta',  html: '<h1>Beta</h1><p>Unicode: ₱1,241,476 · 66.58%</p>' },
];

const dir = mkdtempSync(join(tmpdir(), 'libtest-'));
const src = join(dir, 'payload.html');
writeFileSync(src, pages.map(p => `<!--SLUG:${p.slug}-->\n${p.html}`).join(DELIM), 'utf8');

const out = execFileSync('node', ['tools/encrypt-deck.mjs', PASS, src], { encoding: 'utf8' });
const { salt, iv, ct } = JSON.parse(out);

const b = (s) => Uint8Array.from(Buffer.from(s, 'base64'));
const base = await crypto.subtle.importKey(
  'raw', new TextEncoder().encode(PASS), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt: b(salt), iterations: 250000, hash: 'SHA-256' },
  base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
const plain = new TextDecoder().decode(
  await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b(iv) }, key, b(ct)));

const parts = plain.split(DELIM);
assert.strictEqual(parts.length, 2, 'payload must split into 2 pages');
assert.ok(parts[0].includes('<!--SLUG:alpha-->'), 'page 1 keeps its slug marker');
assert.ok(parts[1].includes('₱1,241,476 · 66.58%'), 'unicode survives the round trip');

// A wrong passphrase must throw, not return garbage.
const wrongBase = await crypto.subtle.importKey(
  'raw', new TextEncoder().encode('wrong'), 'PBKDF2', false, ['deriveKey']);
const wrongKey = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt: b(salt), iterations: 250000, hash: 'SHA-256' },
  wrongBase, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
await assert.rejects(
  crypto.subtle.decrypt({ name: 'AES-GCM', iv: b(iv) }, wrongKey, b(ct)),
  'wrong passphrase must throw'
);

console.log('OK: payload round-trip, delimiter split, unicode, wrong-key rejection');
```

- [x] **Step 2: Run it and watch it fail**

```bash
node tools/test-lib-roundtrip.mjs
```

Expected: FAIL — the delimiter/slug convention isn't established yet, or `encrypt-deck.mjs`
output shape differs. Read the actual error before changing anything.

- [x] **Step 3: Make it pass**

`tools/encrypt-deck.mjs` should need **no changes** — it encrypts an arbitrary file.
If the test fails, the fault is in the test's assumptions, not the tool. Fix the test.

- [x] **Step 4: Run it green**

```bash
node tools/test-lib-roundtrip.mjs
```

Expected: `OK: payload round-trip, delimiter split, unicode, wrong-key rejection`

- [x] **Step 5: Commit**

```bash
git add tools/test-lib-roundtrip.mjs
git commit -m "test: library payload round-trip, delimiter split and wrong-key rejection"
```

---

### Task 4: The library shell — gate, hub, hash router

**Files:**
- Create: `w/lib/index.html`

- [x] **Step 1: Build the gate**

Lift `unlock()` from `in/mapping/index.html:355-368` verbatim — same PBKDF2 iterations,
same AES-GCM, same throw-on-wrong-key. Change only the fetch target to `./lib.enc.json`.

- [x] **Step 2: Add the payload splitter and hash router**

```javascript
const DELIM = '\n<!--PAGE-->\n';
let PAGES = new Map();          // slug -> html

function loadPayload(plain) {
  PAGES = new Map(plain.split(DELIM).map(chunk => {
    const m = chunk.match(/^<!--SLUG:([a-z0-9-]+)-->\n?/);
    return [m ? m[1] : 'unknown', chunk.slice(m ? m[0].length : 0)];
  }));
}

function route() {
  const slug = location.hash.replace(/^#/, '') || 'index';
  if (slug === 'index') return renderHub();
  const html = PAGES.get(slug);
  if (!html) return renderHub();          // unknown slug falls back, never blanks
  renderPage(slug, html);
  window.scrollTo(0, 0);                  // hash nav must not keep the old scroll
}
window.addEventListener('hashchange', route);
```

- [x] **Step 3: Persist the unlock for the session, guarded**

Per playbook §2 failure mode 4 — Safari in private/lockdown mode **throws** on storage,
and an unguarded access at module top level killed an entire deck. Every access wrapped:

```javascript
let memPass = null;
const passGet = () => { try { return sessionStorage.getItem('libPass') || memPass; } catch { return memPass; } };
const passSet = (v) => { memPass = v; try { sessionStorage.setItem('libPass', v); } catch {} };
```

- [x] **Step 4: Make failure legible**

The gate must say which thing went wrong — wrong passphrase, payload failed to load,
or no network. Silent failure is the documented worst case from the AIOS build.

- [x] **Step 5: Commit**

```bash
git add w/lib/index.html
git commit -m "feat: library gate, payload splitter and hash router"
```

---

### Task 5: Prove the gate against a dummy payload — on the deployed URL

**Files:** none created; this is verification.

- [x] **Step 1: Encrypt a two-page dummy payload**

```bash
node tools/encrypt-deck.mjs "temporary-dummy-pass" tools/lib-src/_dummy.html > w/lib/lib.enc.json
git add w/lib/lib.enc.json && git commit -m "chore: dummy library payload for gate testing"
git push
```

- [x] **Step 2: Wait for deploy, then load the real URL**

```bash
sleep 45 && curl -sS -o /dev/null -w "%{http_code}\n" https://post205.com/w/lib/
```

Expected: `200`

- [x] **Step 3: Confirm the ciphertext is genuinely opaque**

```bash
curl -sS https://post205.com/w/lib/lib.enc.json | head -c 300
```

Expected: base64 only. **If any English prose is visible, stop — the gate is not working.**

- [x] **Step 4: Exercise all four paths in a real browser, and look at each**

Open `https://post205.com/w/lib/` and verify by eye:
1. Wrong passphrase → a readable error, page still usable
2. Empty passphrase → handled, no console throw
3. Correct passphrase → hub renders
4. Reload after unlock → still unlocked (session persistence works)
5. `#nonexistent-slug` → falls back to the hub, does not blank

Screenshot the unlocked hub on a phone-width viewport and **view the image**. Numeric
fit is not evidence.

- [x] **Step 5: Commit any fixes, then remove the dummy**

```bash
git rm w/lib/lib.enc.json tools/lib-src/_dummy.html 2>/dev/null
git commit -m "chore: drop dummy payload, gate verified end to end"
```

---

## Phase 1 — The first concept page (THE REVIEW GATE)

Nothing else proceeds until Toffer approves this page. It sets the template, citation
style, depth and length for the other ten.

### Task 6: Firecrawl the primary sources for `seven-shapes`

**Files:**
- Create: `.firecrawl/` captures (gitignored)

- [ ] **Step 1: Get Hormozi's actual words, not a summary of them**

```bash
firecrawl scrape "https://www.youtube.com/watch?v=qsXxckCbci0" -o .firecrawl/hormozi-shapes-video.md
firecrawl scrape "https://www.acquisition.com/alexhormoziandtheoryofconstraints" -o .firecrawl/hormozi-toc.md
```

The Shortform summary and the Inc. article are already captured. The transcript is the
one that matters — every quote used on a slide must be traceable to it, not to a
third-party paraphrase.

- [ ] **Step 2: Confirm each of the three spec quotes appears in a primary source**

If a quote cannot be traced to the transcript or to Inc.'s direct quotation, **it does
not go on a slide.** Record which source carries each one.

- [ ] **Step 3: Commit nothing** (`.firecrawl/` is gitignored); note findings in the next task's briefing.

---

### Task 7: Write the `seven-shapes` page

**Files:**
- Create: `tools/lib-src/seven-shapes.html`, `tools/lib-src/_manifest.json`

- [ ] **Step 1: Read the copy rules first, not after**

Read `docs/writing-style.md` and `context/anti-slop-log.md` **before** drafting a
sentence. Per playbook §8, writing first and auditing second produced a full rewrite
last time. Watch for: negative parallelism ("Not X. Y."), quotable one-liner drops,
three-short-declarative triplets, and polishing Toffer's phrasing into something
cleverer and more American than how he speaks.

- [ ] **Step 2: Write the page**

Content: the map of seven shapes · how to place yourself · the 182-patterns finding as
the reason the number is small · the Product renaming, labelled as ours · a pointer to
each shape's own page.

Every claim carries one of three tier markers:

```html
<p class="c-sourced">… <a class="cite" href="URL">Springer, Electronic Markets (2018)</a></p>
<p class="c-hormozi">…</p>
<p class="c-ours">…</p>
```

`.c-ours` must be **visually distinct** from `.c-sourced`. The failure mode of this whole
project is Hormozi's authority silently stretching over claims he never made.

- [ ] **Step 3: Design the page**

Site pattern per spec: dark masthead over a light reading field, accent `#0e9a9d`,
`system-ui` display and `ui-monospace` labels, no web fonts. Body copy gets
`text-wrap: pretty`, headlines `text-wrap: balance` — six headlines dropped a runt word
before this was fixed on the last deck.

- [ ] **Step 4: Build and deploy**

```bash
node tools/encrypt-deck.mjs "$WORKSHOP_PASS" tools/lib-src/_payload.html > w/lib/lib.enc.json
git add w/lib/lib.enc.json && git commit -m "feat: seven-shapes concept page" && git push
```

- [ ] **Step 5: Verify every citation resolves**

```bash
# For each href in the page:
curl -sS -o /dev/null -w "%{http_code} %{url_effective}\n" -L "<each citation URL>"
```

Expected: `200` for every one. **A paid research asset with a dead footnote is worse
than one with no footnote.** Any 404 → replace the source or drop the claim.

- [ ] **Step 6: Load it and look at it**

Open `https://post205.com/w/lib/#seven-shapes` on a phone. Screenshot it. **View the
screenshot.** Read the whole page top to bottom on the real device.

- [ ] **Step 7: Hand to Toffer and STOP**

Report: the live URL, what was verified and how, which claims are sourced vs. ours, and
anything that came out weaker than hoped. Do not start Task 8.

---

## Phase 2 — The remaining ten pages

**Gated on Task 7 approval.** Six require storm research; four are firecrawl-only.

### Task 8: Storm the research-heavy pages

**Revised 2026-08-31.** With the framework re-derived from primary sources, nothing
borrows authority any more, so these runs are load-bearing rather than reinforcing.
Five of the seven shapes currently have a reasoned constraint and no citation:
Service, Info/Education, Software, Asset/Rental and Brokerage. Those come first.

**Files:**
- Create: `storm-reports/{shape-service,shape-info,shape-software,shape-asset,shape-brokerage,base-rates,the-seam}-briefing.html`

- [ ] **Step 1: Run storm per page, one at a time**

Use the `storm-research` skill for each. Highest risk first, because a bad result here
changes the taxonomy:

1. `shape-brokerage` — will be read by actual insurance and real-estate agents
2. `shape-asset` — the utilization-vs-inventory distinction must hold up
3. `shape-manufacturing` — throughput/TOC
4. `base-rates` — our own argument. Do NOT dress it in a named cognitive bias: self-blame is not the fundamental attribution error (see spec §2)
5. `constraints` — Goldratt directly, not blogs about Goldratt
6. `the-seam` — POST205's own argument, so it needs the most adversarial review
7. `shape-product` — cash conversion cycle mechanics

- [ ] **Step 2: Commit each briefing as it completes**

```bash
git add storm-reports/<slug>-briefing.html
git commit -m "research: storm briefing for <slug>"
```

- [ ] **Step 3: Report contradictions rather than smoothing them**

Per spec §2, `shape-info` and `shape-software` carry US-market assumptions that may not
survive Philippine context, and the three POST205 shapes have no borrowed authority. **If
the research contradicts the taxonomy, say so and stop** — that is a spec change, not a
writing problem.

---

### Task 9: Write the ten remaining pages

**Files:**
- Create: `tools/lib-src/{shape-product,shape-service,shape-info,shape-software,shape-asset,shape-brokerage,shape-manufacturing,base-rates,constraints,the-seam}.html`

- [ ] **Step 1–10: One page per step, each from its briefing, not from memory**

Follow the template approved in Task 7 exactly. After each page: rebuild the payload,
deploy, verify every citation returns 200, load it on a phone, view the screenshot.

- [ ] **Step 11: Commit per page**

```bash
git add w/lib/lib.enc.json && git commit -m "feat: <slug> concept page"
```

---

## Phase 3 — The deck

### Task 10: Copy the shell and strip the payload

**Files:**
- Create: `w/shape/index.html`, `w/shape/r/index.html`, `w/shape/script/index.html`

- [ ] **Step 1: Copy, don't rebuild**

```bash
mkdir -p w/shape/img
cp aios/course/index.html w/shape/index.html
cp aios/course/r/index.html w/shape/r/index.html
cp aios/course/script/index.html w/shape/script/index.html
```

- [ ] **Step 2: Strip slides, keep everything else**

Remove the `<section class="slide">` blocks (`aios/course/index.html:410`–~1080). Keep
the shell, all CSS, the remote client, the pip bar, the decoding counter, the `.rise`
stagger, the logo lattice, and the `window.onerror` reporter.

- [ ] **Step 3: Confirm the run sheet's relative fetch still resolves**

`w/shape/script/index.html:82` fetches `../index.html` → `/w/shape/index.html`. Same
relative depth as the source, so it should need no change. Verify by loading it.

- [ ] **Step 4: Change the room-code prefix**

`aios/course/index.html:1390` uses `'deck-' + code`. Change to `'wshape-' + code` in
**both** the deck and `r/index.html`, so a stale AIOS remote can never drive this deck.

- [ ] **Step 5: Commit**

```bash
git add w/shape/
git commit -m "chore: scaffold shape deck from the AIOS course shell"
```

---

### Task 11: Write the 19 slides and their notes

**Files:**
- Modify: `w/shape/index.html`

- [ ] **Step 1: Read the copy rules again before writing**

`docs/writing-style.md` + `context/anti-slop-log.md`. Non-negotiable, per playbook §8.

- [ ] **Step 2: Write headlines first — one spoken phrase each**

19 slides per spec §3. **The slide carries only the phrase said aloud.** The AIOS deck
went from ~2,800 on-screen words to 703. Every supporting sentence goes to the notes.

- [ ] **Step 3: Write the notes as a spoken script**

Per playbook §3, each `<template class="notes">` gets: a `<span class="cue">`, a
`<p class="lead">` first line (this is what the eye lands on mid-sentence — without it
you lose your place), body paragraphs in spoken register, `<strong>` on scan-words,
`<em>` for stage directions, and a closing `<em>Bridge: …</em>`.

**M3 carries nearly all its content in the notes** — seven shapes at two minutes each.
These notes matter more than anywhere else in the deck.

Keep any single note under ~540 characters or it runs past a breath.

- [ ] **Step 4: Mark attribution on-slide**

The four Hormozi shapes and the three POST205 shapes must be visually distinguished, per
spec §3.

- [ ] **Step 5: Set type sizes for a room, not a desk**

Display ≤124px, h2 ≤74px, body 20px. **Label floor is 14px, 16px if it carries meaning** —
11–13px labels were unreadable from three metres on the last build.

- [ ] **Step 6: Commit per movement**

```bash
git add w/shape/index.html && git commit -m "feat(deck): movement N — <name>"
```

---

### Task 12: Slide art

**Files:**
- Create: `w/shape/img/*.png`

- [ ] **Step 1: Generate only where a picture explains what words cannot**

gpt-image-1, transparent background, 1024×1024, quality high. Use the prompt spine from
playbook §5 verbatim. **Never write "no 3D render" into the prompt** — flat schematic
line art reads dead on a projector and cost a full regeneration cycle last time.

- [ ] **Step 2: Compress with alpha intact**

Use the Pillow snippet in playbook §5 (trim to alpha bbox, expand margin, thumbnail,
quantize). Target 50–90KB each.

- [ ] **Step 3: Check every alpha bounding box for edge contact**

Two images shipped cropped at the canvas edge last time and read as a rendering bug.

- [ ] **Step 4: Read each script line against its image**

The real test from playbook §5: does the picture explain the sentence, or does the room
think "that's the message, why is that the image?" Three images failed this on the AIOS
deck and were caught only by this pass.

- [ ] **Step 5: Review every image for people**

The model broke the no-people rule three times despite explicit bans. Look at all of them.

- [ ] **Step 6: Commit**

```bash
git add w/shape/img/ w/shape/index.html
git commit -m "feat(deck): slide art"
```

---

## Phase 4 — Verification and rehearsal

### Task 13: Playwright audit at four sizes

**Files:**
- Create: `tools/audit-shape-deck.py`

- [ ] **Step 1: Install Playwright properly**

```bash
pip3 install playwright && python3 -m playwright install chromium
```

Do not settle for raw headless Chrome — playbook §7 records two sessions lost to its quirks.

- [ ] **Step 2: Port the audit from the AIOS harness**

Per slide, at 1920×1080, 1600×900, 1366×768, 1024×768: frame overflow, right-edge
escape, text/art intersection, SVG label containment, dangling paths, headline runts
(last line under ~42% of longest), failed images, `pageerror`.

- [ ] **Step 3: Run it**

```bash
python3 tools/audit-shape-deck.py https://post205.com/w/shape/
```

- [ ] **Step 4: Re-check every finding on a settled fresh load before fixing it**

Playbook §7 traps, all of which produced false findings before: headless Chrome floors
its window at ~500px (use an iframe for narrow testing), `--virtual-time-budget` skips
real network waits, screenshots during slide transitions report false blanks and false
overflow, and **descender overflow ≤6px is not a defect.**

- [ ] **Step 5: Commit**

```bash
git add tools/audit-shape-deck.py && git commit -m "test: Playwright audit for the shape deck"
```

---

### Task 14: Prove the remote against the five known failure modes

- [ ] **Step 1: Pair from a phone to a second device, on a hotspot**

Not localhost. Not two tabs. A real phone driving a real second screen.

- [ ] **Step 2: Walk each documented failure mode from playbook §2**

1. Display has no keyboard → the pairing control is visible and tappable, not `P`-only
2. iOS discards background tabs → tap Remote, leave for 60s, return; deck rejoins silently
3. Phone asks once → open the remote *before* the deck; it must keep knocking and connect
4. Storage throws → test in Safari Private Browsing; **all 19 slides must still render**
5. Silent failure → unplug wifi mid-session; the remote must say what is wrong

- [ ] **Step 3: Confirm slide 1 renders with JavaScript disabled**

The CSS fallback `.slide.active, body:not(.ready) .slide:first-of-type { display: flex }`
(`aios/course/index.html:77`) must survive the copy.

- [ ] **Step 4: Test a Bluetooth clicker**

It pairs as a keyboard and sends PageDown/PageUp. Free offline fallback if the venue's
network fails.

---

### Task 15: Read it out loud, timed

- [ ] **Step 1: Open the run sheet and read every note aloud, with a stopwatch**

`https://post205.com/w/shape/script/`. This is the only test that finds notes which
fight the mouth.

- [ ] **Step 2: Check the time against the budget**

Target ~39 min of content landing at 50–55 in a room. **Hard ceiling is one hour.**

If long: merge Info and Software onto one slide — the two rarest shapes in a Philippine
SME room. **Never cut M4 (the reveal) or M5 (the seam).**

- [ ] **Step 3: Confirm M4 still lands**

Everything before it is setup. If M3 ran long in the read-aloud, the reveal has lost its
charge and M3 must be tightened regardless of total time.

- [ ] **Step 4: Commit any copy fixes**

```bash
git add w/shape/index.html && git commit -m "fix(deck): copy fixes from the read-aloud pass"
```

---

### Task 16: Final pass

- [ ] **Step 1: Confirm `/w/` is not indexable**

```bash
curl -sSI https://post205.com/w/shape/ | grep -i x-robots-tag
curl -sS https://post205.com/robots.txt | grep "/w/"
```

Expected: `X-Robots-Tag: noindex, nofollow` and `Disallow: /w/`.

- [ ] **Step 2: Confirm no authoring source leaked**

```bash
git ls-files | grep -c "tools/lib-src/"
curl -sS -o /dev/null -w "%{http_code}\n" https://post205.com/tools/lib-src/seven-shapes.html
```

Expected: `0` tracked files, and `404` from the deployed site.

- [ ] **Step 3: Confirm the QR resolves and the passphrase works from a cold device**

Scan the M6 QR on a phone that has never unlocked the library. Enter the spoken
passphrase. It must open.

- [ ] **Step 4: Update the spec's open items**

Close items 1–3 in spec §6, or record why they remain open.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "docs: close out shape-of-business section 1"
```

---

## Phase 0 completion note (2026-08-30)

Phase 0 done and verified live at `https://post205.com/w/lib/`.

Deviations from the plan, all deliberate:

- **No `build.mjs` written.** `tools/encrypt-deck.mjs` already did the job.
- **The dummy payload was never deployed.** The plan called for pushing it to
  production to test the gate; instead the shell shipped alone, which tests
  everything the live environment adds (Netlify headers, real URL) and exercises
  the missing-payload error path for real, without placeholder content on the
  live site. The dummy lives inside `tools/verify-lib-gate.py`.
- **Task 3 passed on the first run**, so it never acted as a red-green gate.
  Mutation testing then showed it was vacuous on the delimiter — writing and
  splitting with the same constant proved nothing about the browser. Both
  literals are now pinned and cross-checked against `w/lib/index.html`.
- **One visual bug the assertions missed**: hub card titles and blurbs were
  inline spans and ran together on one line. Caught only by viewing the render.

Verified live: `X-Robots-Tag: noindex, nofollow` on `/w/*`, `Disallow: /w/` in
robots.txt, `tools/lib-src/` unreachable (404) and untracked (0 files), no
plaintext in the deployed shell, and the missing-payload path reporting
"The library file did not load (404). Tell Toffer."

---

## Open decisions Toffer still owns

1. **The library passphrase.** Spoken aloud in M6, so it must be easy to say and hard to
   mistype. Blocks Task 7's real build (Tasks 1–5 can use a dummy).
2. **Whether `/w/shape/` or a less guessable slug.** The gate is the protection, not the
   URL (per `docs/MAPPING-DECK-HANDOFF.md:27`), so a readable path is defensible — but
   the deck itself is *not* encrypted, only the library is. A readable deck URL is
   world-readable. Decide before Task 10.
