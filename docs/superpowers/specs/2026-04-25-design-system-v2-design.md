# POST 205 Design System v2

**Date:** 2026-04-25  
**Status:** Approved  
**Scope:** post205.com — typography and color token redesign

---

## What This Is

A full replacement of the post205.com design tokens and font stack. Inspired by Netlify's color system philosophy: teal surfaces that make the accent feel at home, not floating. Both light and dark modes are redesigned. Accent color `#3BD1D3` is locked and unchanged.

---

## Typography

**Remove:** All Google Fonts (`Lora`, `DM Sans`, `JetBrains Mono`). Delete the three `<link>` tags in `<head>`.

**Replace with system fonts — no network request, no font flash:**

| Role | Stack | Weight |
|---|---|---|
| Headers, hero h1 | `system-ui, -apple-system, sans-serif` | 800 |
| Body text, paragraphs | `system-ui, -apple-system, sans-serif` | 400 |
| Mono labels, eyebrows, nav links, badges | `ui-monospace, monospace` | 400 |

Every reference to `'DM Sans'`, `'Lora'`, `'JetBrains Mono'`, and `Syne` in the CSS is replaced with the appropriate stack above.

---

## Color System

### Principle

Both modes derive all surfaces and muted text from the same hue as the accent (`#3BD1D3`, hue ~181°). This means borders, muted text, and section backgrounds all feel like they belong to the same family as the accent — the Netlify approach.

### Dark Mode Tokens

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

### Light Mode Tokens

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

### New Token: `--surface-deep`

Used for full-bleed section backgrounds that create visual rhythm — the core Netlify design move. In dark mode it's `#0D2828` (deep teal). In light mode it's `#024A4B` (inverted — very dark teal with light text on top). Sections using `--surface-deep` always use `--text` and `--text-2` from the *dark* token set regardless of mode, since the background is always very dark.

---

## Files Affected

- `index.html` — primary target, all tokens and font references inline in `<style>`
- `p/index.html` — check for any duplicate token definitions or font references

---

## What Does Not Change

- Accent `#3BD1D3` in dark mode — unchanged
- `--green: #2ecc71` and `--red: #ff4d4d` — unchanged
- Page structure, HTML, layout, spacing — no structural changes
- Dark mode base background `#18181A` — unchanged
- Theme toggle logic and system preference detection — unchanged
