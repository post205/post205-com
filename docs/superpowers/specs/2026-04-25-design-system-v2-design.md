# POST 205 Design System v2

**Date:** 2026-04-25  
**Status:** Approved  
**Scope:** post205.com — typography and color token redesign

---

## What This Is

A full replacement of the post205.com design tokens and font stack. Inspired by Netlify's color system philosophy: teal surfaces that make the accent feel at home, not floating. Both light and dark modes are redesigned. Accent color `#3BD1D3` is locked and unchanged.

---

## Typography

**Remove:** All Google Fonts (`Lora`, `DM Sans`, `JetBrains Mono`). Delete the three `<link rel="preconnect">` and `<link href="fonts.googleapis.com...">` tags in `<head>`.

**Replace with system fonts — no network request, no font flash:**

| Role | Stack | Weight | Style |
|---|---|---|---|
| Headers, hero h1 | `system-ui, -apple-system, sans-serif` | 800 | normal (not italic) |
| Body text, paragraphs | `system-ui, -apple-system, sans-serif` | 400 | normal |
| Mono labels, eyebrows, nav links, badges | `ui-monospace, monospace` | 400 | normal |

Every reference to `'DM Sans'`, `'Lora'`, `'JetBrains Mono'`, and `Syne` in the CSS is replaced with the appropriate stack above. Any `font-style: italic` declarations that came from Lora usage are also removed — the h1 design intent shifts from italic serif character to weight-800 system sans impact.

---

## Color System

### Principle

Both modes derive all surfaces and muted text from the same hue as the accent (`#3BD1D3`, hue ~181°). This means borders, muted text, and section backgrounds all feel like they belong to the same family as the accent — the Netlify approach.

### Three Token Blocks to Update

There are **three places** in `index.html` where color tokens are defined. All three must be updated:

1. `:root` — dark mode defaults
2. `[data-theme="light"]` — explicit light mode
3. `@media (prefers-color-scheme: light) { [data-theme="system"] }` — system preference light mode

Blocks 2 and 3 receive identical light mode token values.

### Dark Mode Tokens (`:root`)

Base background stays the same. Surfaces and text shift from neutral gray to teal-tinted.

| Token | Value | Notes |
|---|---|---|
| `--black` | `#18181A` | Unchanged — page background |
| `--surface` | `#1a2424` | Was `#1e1e21` — teal-tinted |
| `--surface-2` | `#252f2f` | Was `#26262a` — teal-tinted |
| `--surface-deep` | `#0D2828` | **New** — deep teal section backgrounds |
| `--border` | `#1f3535` | Was `#2e2e33` |
| `--border-2` | `#2a4040` | Was `#3a3a40` |
| `--text` | `#f0f0f2` | Unchanged |
| `--text-2` | `#7aacac` | Was `#8e8e96` — teal-tinted muted |
| `--text-3` | `#3d6868` | Was `#54545c` — teal-tinted dim |
| `--accent` | `#3BD1D3` | Unchanged |
| `--accent-dim` | `rgba(59, 209, 211, 0.12)` | Unchanged |
| `--on-accent` | `#021616` | Was `#0d0d0f` — cool near-black |
| `--nav-bg` | `rgba(24, 24, 26, 0.96)` | Unchanged |
| `--logo-filter` | `saturate(0) brightness(8)` | Unchanged |
| `--logo-blend` | `screen` | Unchanged |
| `--promise-bg` | `#1a2424` | Was `#f0f0f2` — use `--surface` value |

### Light Mode Tokens (`[data-theme="light"]` and system media query)

Replace warm cream entirely. White base, teal tints for surfaces, new deep teal token for rich section backgrounds.

| Token | Value | Notes |
|---|---|---|
| `--black` | `#ffffff` | Was `#faf9f4` — pure white |
| `--surface` | `#f4fefe` | Was `#f0ede4` — barely tinted |
| `--surface-2` | `#e0fffe` | Was `#e5e2d9` — cool mint |
| `--surface-deep` | `#024A4B` | **New** — deep teal, Netlify's `#014847` equivalent |
| `--border` | `#c8eeed` | Was `#d0cdc4` — teal-tinted |
| `--border-2` | `#b0e0df` | Was `#c0bdb4` — teal-tinted |
| `--text` | `#0a1a1a` | Was `#13120f` — cool near-black |
| `--text-2` | `#4a6262` | Was `#5a5850` — teal-tinted muted |
| `--text-3` | `#8aaaaa` | Was `#9a9890` — teal-tinted dim |
| `--accent` | `#2db8ba` | Unchanged — darkened for contrast on white |
| `--accent-dim` | `rgba(45, 184, 186, 0.12)` | Unchanged |
| `--on-accent` | `#021616` | Was `#0d0c0a` |
| `--nav-bg` | `rgba(255, 255, 255, 0.96)` | Was `rgba(250, 249, 244, 0.96)` |
| `--logo-filter` | `none` | Unchanged |
| `--logo-blend` | `darken` | Unchanged |
| `--promise-bg` | `#e0fffe` | Was `#e5e2d9` — use `--surface-2` value |

### New Token: `--surface-deep`

Used for full-bleed section backgrounds that create visual rhythm — the core Netlify design move. In dark mode it's `#0D2828`. In light mode it's `#024A4B` (very dark, so text reads as light).

Any element using `background: var(--surface-deep)` must use these hardcoded text colors — do not use the mode-variable `--text`/`--text-2` tokens, since `--surface-deep` is always very dark in both modes:

- Primary text on `--surface-deep`: `#f0f0f2`
- Muted text on `--surface-deep`: `#7aacac`
- Borders on `--surface-deep`: `rgba(59, 209, 211, 0.18)` — light teal, visible on both dark and light-mode deep backgrounds

---

## Files Affected

- `index.html` — primary target. All tokens and font references are inline in the `<style>` block.
- `p/index.html` — scan for any `:root`, `[data-theme]`, or font-family declarations. If found, apply the same token and font updates. If none found, no action needed.

---

## What Does Not Change

- Accent `#3BD1D3` in dark mode — unchanged
- `--green: #2ecc71` and `--red: #ff4d4d` — unchanged
- Page structure, HTML, layout, spacing — no structural changes
- Dark mode base background `#18181A` — unchanged
- Theme toggle logic and system preference detection — unchanged
