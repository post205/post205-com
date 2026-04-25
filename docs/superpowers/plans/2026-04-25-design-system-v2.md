# Design System v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the post205.com font stack (Google Fonts → system-ui) and color tokens (warm cream / neutral gray → Netlify-inspired cool teal) across both `index.html` and `p/index.html`.

**Architecture:** All styles are inline `<style>` blocks inside each HTML file — no external CSS files. Changes are pure find-and-replace on CSS values; no HTML structure changes needed. `--surface-deep` is a new token introduced in this update.

**Tech Stack:** Vanilla HTML/CSS. No build tools, no frameworks. Edit files directly.

**Spec:** `docs/superpowers/specs/2026-04-25-design-system-v2-design.md`

---

## File Map

| File | What changes |
|---|---|
| `index.html` lines 13–15 | Remove 3 Google Fonts `<link>` tags |
| `index.html` lines 17–176 | All font-family declarations + color token blocks |
| `p/index.html` lines 10–52 | Remove Syne/DM Sans/JetBrains Mono font link, update font-family declarations |

---

### Task 1: Remove Google Fonts from `index.html`

**Files:**
- Modify: `index.html` lines 13–15

- [ ] **Step 1: Delete the three font link tags**

Remove these three lines from `<head>`:
```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@1,400;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Verify in browser**

Open `index.html` in Chrome. Open DevTools → Network tab → filter by "Font". Reload. Confirm zero requests to `fonts.googleapis.com`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Remove Google Fonts link tags from index.html"
```

---

### Task 2: Replace JetBrains Mono in `index.html`

**Files:**
- Modify: `index.html` (27 occurrences across the `<style>` block)

- [ ] **Step 1: Global replace**

Using your editor's find-and-replace (or the Edit tool with `replace_all: true`):

Find: `'JetBrains Mono', monospace`  
Replace: `ui-monospace, monospace`

All 27 occurrences should update in one pass.

- [ ] **Step 2: Verify no Lora or JetBrains remain**

```bash
grep "JetBrains\|Lora\|DM Sans\|Syne" index.html | grep -v "<!--"
```

Expected: only Lora and DM Sans still present (those are handled in Tasks 3 and 4).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Replace JetBrains Mono with ui-monospace in index.html"
```

---

### Task 3: Replace DM Sans in `index.html`

**Files:**
- Modify: `index.html` (10 occurrences)

- [ ] **Step 1: Global replace**

Find: `'DM Sans', sans-serif`  
Replace: `system-ui, -apple-system, sans-serif`

- [ ] **Step 2: Update body font declaration**

The `body` rule at line ~65 has `font-family: 'DM Sans', sans-serif;` — this is already covered by the global replace above. Double-check it now reads:
```css
body {
  font-family: system-ui, -apple-system, sans-serif;
```

- [ ] **Step 3: Verify**

```bash
grep "DM Sans" index.html
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Replace DM Sans with system-ui in index.html"
```

---

### Task 4: Replace Lora (6 locations) in `index.html`

**Files:**
- Modify: `index.html` — `.hero h1`, `.cs-content h2`, `.benefits h2`, `.promises h2`, `.about h2`, `.cta h2`

Each Lora heading currently has three lines that need updating:
```css
font-family: 'Lora', serif;
font-style: italic;
font-weight: 600;
```

Replace with:
```css
font-family: system-ui, -apple-system, sans-serif;
font-weight: 800;
```

(`font-style: italic` is deleted — not replaced.)

- [ ] **Step 1: Update `.hero h1`** (line ~275)

Old:
```css
.hero h1 {
  font-family: 'Lora', serif;
  font-style: italic;
  font-size: clamp(68px, 10vw, 128px);
  font-weight: 600;
```

New:
```css
.hero h1 {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(68px, 10vw, 128px);
  font-weight: 800;
```

- [ ] **Step 2: Update `.cs-content h2`** (line ~359)

Old:
```css
.cs-content h2 {
  font-family: 'Lora', serif;
  font-style: italic;
  font-size: 30px;
  font-weight: 600;
```

New:
```css
.cs-content h2 {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 30px;
  font-weight: 800;
```

- [ ] **Step 3: Update `.benefits h2`** (line ~703)

Old:
```css
.benefits h2 {
  font-family: 'Lora', serif;
  font-style: italic;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 600;
```

New:
```css
.benefits h2 {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
```

- [ ] **Step 4: Update `.promises h2`** (line ~756)

Old:
```css
.promises h2 {
  font-family: 'Lora', serif;
  font-style: italic;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 600;
```

New:
```css
.promises h2 {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
```

- [ ] **Step 5: Update `.about h2`** (line ~832)

Old:
```css
.about h2 {
  font-family: 'Lora', serif;
  font-style: italic;
  font-size: 44px;
  font-weight: 600;
```

New:
```css
.about h2 {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 44px;
  font-weight: 800;
```

- [ ] **Step 6: Update `.cta h2`** (line ~935)

Old:
```css
.cta h2 {
  font-family: 'Lora', serif;
  font-style: italic;
  font-size: clamp(36px, 6vw, 64px);
  font-weight: 600;
```

New:
```css
.cta h2 {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(36px, 6vw, 64px);
  font-weight: 800;
```

- [ ] **Step 7: Verify no font references remain**

```bash
grep "Lora\|JetBrains\|DM Sans\|Syne\|font-style.*italic" index.html
```

Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "Replace Lora with system-ui 800, remove italic from all headings"
```

---

### Task 5: Update dark mode tokens in `index.html`

**Files:**
- Modify: `index.html` — `:root` block (lines ~20–39)

- [ ] **Step 1: Replace the full `:root` token block**

Old block:
```css
    :root {
      /* dark theme */
      --black:        #18181A;
      --surface:      #1e1e21;
      --surface-2:    #26262a;
      --border:       #2e2e33;
      --border-2:     #3a3a40;
      --text:         #f0f0f2;
      --text-2:       #8e8e96;
      --text-3:       #54545c;
      --accent:       #3BD1D3;
      --accent-dim:   rgba(59, 209, 211, 0.12);
      --on-accent:    #0d0d0f;
      --green:        #2ecc71;
      --red:          #ff4d4d;
      --nav-bg:       rgba(24, 24, 26, 0.96);
      --logo-filter:  saturate(0) brightness(8);
      --logo-blend:   screen;
      --promise-bg:   #f0f0f2;
    }
```

New block:
```css
    :root {
      /* dark theme — Netlify-inspired teal surfaces */
      --black:        #18181A;
      --surface:      #1a2424;
      --surface-2:    #252f2f;
      --surface-deep: #0D2828;
      --border:       #1f3535;
      --border-2:     #2a4040;
      --text:         #f0f0f2;
      --text-2:       #7aacac;
      --text-3:       #3d6868;
      --accent:       #3BD1D3;
      --accent-dim:   rgba(59, 209, 211, 0.12);
      --on-accent:    #021616;
      --green:        #2ecc71;
      --red:          #ff4d4d;
      --nav-bg:       rgba(24, 24, 26, 0.96);
      --logo-filter:  saturate(0) brightness(8);
      --logo-blend:   screen;
      --promise-bg:   #1a2424;
    }
```

- [ ] **Step 2: Quick browser check**

Open `index.html`. Confirm dark mode loads with teal-tinted surfaces (the page should feel slightly warmer/teal vs the previous pure neutral gray). No visual breakage.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Update dark mode color tokens to teal-tinted surfaces"
```

---

### Task 6: Update light mode tokens in `index.html`

**Files:**
- Modify: `index.html` — `[data-theme="light"]` block (lines ~41–58) and `@media (prefers-color-scheme: light) [data-theme="system"]` block (lines ~159–176)

- [ ] **Step 1: Replace `[data-theme="light"]` block**

Old:
```css
    [data-theme="light"] {
      /* light theme — warm cream */
      --black:        #faf9f4;
      --surface:      #f0ede4;
      --surface-2:    #e5e2d9;
      --border:       #d0cdc4;
      --border-2:     #c0bdb4;
      --text:         #13120f;
      --text-2:       #5a5850;
      --text-3:       #9a9890;
      --accent:       #2db8ba;
      --accent-dim:   rgba(45, 184, 186, 0.12);
      --on-accent:    #0d0c0a;
      --nav-bg:       rgba(250, 249, 244, 0.96);
      --logo-filter:  none;
      --logo-blend:   darken;
      --promise-bg:   #e5e2d9;
    }
```

New:
```css
    [data-theme="light"] {
      /* light theme — cool white + teal tints */
      --black:        #ffffff;
      --surface:      #f4fefe;
      --surface-2:    #e0fffe;
      --surface-deep: #024A4B;
      --border:       #c8eeed;
      --border-2:     #b0e0df;
      --text:         #0a1a1a;
      --text-2:       #4a6262;
      --text-3:       #8aaaaa;
      --accent:       #2db8ba;
      --accent-dim:   rgba(45, 184, 186, 0.12);
      --on-accent:    #021616;
      --nav-bg:       rgba(255, 255, 255, 0.96);
      --logo-filter:  none;
      --logo-blend:   darken;
      --promise-bg:   #e0fffe;
    }
```

- [ ] **Step 2: Replace the `@media (prefers-color-scheme: light)` block**

Old:
```css
    @media (prefers-color-scheme: light) {
      [data-theme="system"] {
        --black:      #faf9f4;
        --surface:    #f0ede4;
        --surface-2:  #e5e2d9;
        --border:     #d0cdc4;
        --border-2:   #c0bdb4;
        --text:       #13120f;
        --text-2:     #5a5850;
        --text-3:     #9a9890;
        --accent:     #2babac;
        --accent-dim: rgba(43, 171, 172, 0.12);
        --nav-bg:     rgba(250, 249, 244, 0.96);
        --logo-filter: none;
        --logo-blend: darken;
        --promise-bg: #e5e2d9;
      }
    }
```

New:
```css
    @media (prefers-color-scheme: light) {
      [data-theme="system"] {
        --black:        #ffffff;
        --surface:      #f4fefe;
        --surface-2:    #e0fffe;
        --surface-deep: #024A4B;
        --border:       #c8eeed;
        --border-2:     #b0e0df;
        --text:         #0a1a1a;
        --text-2:       #4a6262;
        --text-3:       #8aaaaa;
        --accent:       #2db8ba;
        --accent-dim:   rgba(45, 184, 186, 0.12);
        --on-accent:    #021616;
        --nav-bg:       rgba(255, 255, 255, 0.96);
        --logo-filter:  none;
        --logo-blend:   darken;
        --promise-bg:   #e0fffe;
      }
    }
```

- [ ] **Step 3: Visual QA — light mode**

Open `index.html` in browser. Click the theme toggle to switch to light mode. Verify:
- Background is white (not cream)
- Borders have a teal tint (not warm gray)
- Text is cool dark (`#0a1a1a`) not warm brown
- Accent teal `#2db8ba` is readable on white sections
- No visual breakage (clipped text, missing elements, etc.)

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Update light mode tokens to cool white + teal tints"
```

---

### Task 7: Update `p/index.html`

**Files:**
- Modify: `p/index.html` lines 10, 15, 29, 38, 52

- [ ] **Step 1: Remove the Google Fonts link tag** (line 10)

Delete:
```html
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace all font-family declarations**

There are 4 declarations to update:

| Line | Old | New |
|---|---|---|
| ~15 | `font-family: 'DM Sans', sans-serif;` | `font-family: system-ui, -apple-system, sans-serif;` |
| ~29 | `font-family: 'Syne', sans-serif;` | `font-family: system-ui, -apple-system, sans-serif;` |
| ~38 | `font-family: 'Syne', sans-serif;` | `font-family: system-ui, -apple-system, sans-serif;` |
| ~52 | `font-family: 'JetBrains Mono', monospace;` | `font-family: ui-monospace, monospace;` |

- [ ] **Step 3: Verify no font references remain**

```bash
grep "Syne\|JetBrains\|DM Sans\|Lora" p/index.html
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add p/index.html
git commit -m "Replace Google Fonts with system fonts in p/index.html"
```

---

### Task 8: Visual QA — both pages, both modes

No file changes. Verification only.

- [ ] **Step 1: index.html — dark mode**

Open in browser. Confirm:
- Page background is `#18181A` (very dark, not neutral gray)
- Surface elements (cards, panels) have a subtle teal tint (`#1a2424`)
- Hero h1 is bold, weight 800, no italic — reads strong
- Nav mono labels render in system monospace
- Accent `#3BD1D3` pops on dark teal surfaces
- Theme toggle works: dark → light → system

- [ ] **Step 2: index.html — light mode**

Toggle to light. Confirm:
- Background is white
- Surfaces are barely-tinted teal (`#f4fefe`)
- Section dividers have teal-tinted borders (`#c8eeed`)
- Headings are bold, weight 800, no italic
- Accent `#2db8ba` is visible on white (as CTA bg, eyebrow text)

- [ ] **Step 3: p/index.html — spot check**

Open `p/index.html` in browser. Confirm no web fonts loading, headings render in system-ui.

- [ ] **Step 4: Final commit if any last tweaks**

```bash
git add -p
git commit -m "QA fixes: design system v2"
```

---

## Done Criteria

- Zero requests to `fonts.googleapis.com` on either page
- `grep "Lora\|JetBrains\|DM Sans\|Syne" index.html p/index.html` returns nothing
- Dark mode: teal-tinted surfaces, unchanged base background
- Light mode: white base, teal-tinted borders and surfaces
- All headings: system-ui, weight 800, no italic
- Theme toggle cycles correctly through all three states
