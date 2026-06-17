---
name: POST205
description: Custom systems for Philippine businesses, built from scratch since 2015.
colors:
  accent-teal: "#0e9a9d"        # body accent on the light field
  accent-bright: "#3BD1D3"      # masthead / on-dark contexts only
  page-bg: "#e7efee"            # light teal field (single theme)
  surface: "#f7fcfc"
  surface-2: "#dce8e7"
  surface-deep: "#0D2828"       # stays dark: masthead, mockup chrome, high-contrast blocks
  border: "#c7d9d7"
  border-2: "#b1c8c5"
  text-primary: "#0b1b1b"
  text-secondary: "#41585a"
  text-tertiary: "#5a7473"
  on-accent: "#ffffff"
  masthead-bg: "#141416"        # dark header over the light body
  nav-ink: "#7aacac"            # nav links on the dark masthead
  status-green: "#198a4c"
  status-red: "#c0392b"
typography:
  display:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "clamp(44px, 8vw, 88px)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "clamp(28px, 4vw, 48px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 400
    letterSpacing: "0.09em"
rounded:
  sm: "4px"
  md: "7px"
  lg: "8px"
components:
  button-nav:
    backgroundColor: "{colors.accent-teal}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  promise-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "32px"
  section-label:
    textColor: "{colors.text-tertiary}"
    backgroundColor: "transparent"
  promise-badge:
    textColor: "{colors.text-secondary}"
    backgroundColor: "transparent"
    rounded: "3px"
    padding: "3px 7px"
---

# Design System: POST205

## 1. Overview

**Creative North Star: "The Shop Floor"**

Filipino craftwork: precise, unpretentious, built to last. This is not a showroom. There is no gallery lighting, no polished chrome, no glass surfaces that exist only to reflect themselves. The POST205 aesthetic is what you find when someone has been doing the work for eleven years and has nothing left to prove about it. Every element justifies its place or doesn't appear.

The flagship surface is a light teal field under a dark masthead, a single committed theme with no toggle. A founder evaluating the page reads it in daylight on a phone as often as at night; the cool off-white field stays legible on mid-range Android screens without the glare of pure white, and the dark masthead anchors the brand at the top. Every neutral is tinted toward the same teal hue. The accent appears only where it matters; its scarcity is the point.

System fonts make the same argument. No external typeface was imported, no variable font loaded. The 800-weight system-ui renders sharp and native on whatever screen the user has. The monospace labels carry the technical credibility. Together they say: we write code, we don't dress it up.

**Key Characteristics:**
- Single theme, no toggle: dark masthead (`#141416` + bright-teal underline) over a light teal field
- Two accents from one family: `#0e9a9d` on the light body, `#3BD1D3` reserved for on-dark contexts (masthead, deep blocks)
- All surfaces are field, not figure; the accent is never a large fill
- System-ui headers (weight 800) paired with ui-monospace labels; no external fonts
- Flat surfaces with tonal depth; no decorative shadows
- Uppercase monospace for every label, eyebrow, badge, and nav element
- Mockup frames render in surface colors, never white

## 2. Colors: The Teal Field

One accent. Everything else is the field it stands on.

### Primary
- **Body Teal** (`#0e9a9d`): The accent on the light field. Active state indicators, icon highlights in promise cards, link colors, and badge text. Never a large surface fill. Darker than the bright teal on purpose, for contrast against the off-white body.
- **Teal Strike** (`#3BD1D3`): The bright accent, reserved for on-dark contexts only: the masthead underline, the nav CTA, and anything sitting on `--surface-deep`. Too light to read as an accent on the body field.

### Neutral
- **Field Off-White** (`#e7efee`): Page background (`--black`, legacy token name). Cool off-white tinted teal, never pure white.
- **Surface** (`#f7fcfc`): Elevated cards, promise card backgrounds (`--surface`).
- **Surface 2** (`#dce8e7`): Secondary elevation — nested cards, chat bubbles in mockups (`--surface-2`).
- **Deep Teal** (`#0D2828`): The dark anchor — masthead, mockup browser chrome, and any full-bleed high-contrast block (`--surface-deep`). Always paired with hardcoded light text; do not use semantic text variables on this background.
- **Border** (`#c7d9d7`): Primary border, card outlines, dividers (`--border`).
- **Border 2** (`#b1c8c5`): Secondary borders for tabs, inputs, nested elements (`--border-2`).
- **Text Primary** (`#0b1b1b`): Headings and primary copy on the light field.
- **Text Secondary** (`#41585a`): Body copy, descriptors, secondary content.
- **Text Tertiary** (`#5a7473`): Labels, section eyebrows, muted metadata.
- **On Accent** (`#ffffff`): Text on the body-teal accent. (On the bright `#3BD1D3` masthead CTA, use near-black `#021616`.)
- **Nav Ink** (`#7aacac`): Nav links on the dark masthead; hover lifts to `#f0f0f2`.

### Status (mockup/data use only)
- **Signal Green** (`#198a4c`): Positive status indicators in client mockups.
- **Signal Red** (`#c0392b`): Error or alert states in client mockups.

### Named Rules

**The Economy Rule.** The accent appears on at most 10% of any given screen surface. Its scarcity is the signal. A layout with three teal elements is already too much.

**The Tinted Field Rule.** Every neutral surface derives from the accent hue (approximately hue 181°, chroma 0.03–0.12). No pure gray neutrals. No warm cream. No slate. The field and the figure come from the same hue family; the figure is simply brighter.

**The Hardcoded Deep Rule.** Sections using `--surface-deep` as a background must use hardcoded color values for text and borders, not semantic variables. `--surface-deep` is always very dark in both light and dark modes; semantic variables can't be trusted to remain readable across themes.

## 3. Typography

**Display / Body Font:** `system-ui, -apple-system, sans-serif`
**Label / Badge / Nav Font:** `ui-monospace, monospace`

No external typeface is loaded. No Google Fonts, no variable font. The operating system's system font renders at 800 weight with tighter letterform density than most display fonts, and it loads in zero milliseconds. The monospace stack signals precision; the system-ui stack signals directness. Together they perform without performing.

### Hierarchy

- **Display** (800, `clamp(44px, 8vw, 88px)`, lh 1.05, ls -0.01em): Hero headline only. One per page. Never italic.
- **Headline** (800, `clamp(28px, 4vw, 48px)`, lh 1.1, ls -0.01em): Section h2 titles. "What makes it yours." "Filipinos don't march. We sway."
- **Title** (700, `17px`, lh 1.2, ls -0.01em): Promise card h4 headings. Mockup section headings within the case study tabs.
- **Body** (400, `14–16px`, lh 1.7): All prose. Promise card body, about section paragraphs, case study resolution lines. Max line length 68ch.
- **Label** (400–700, `9–11px`, monospace, ls 0.06–0.14em, uppercase): Section eyebrows (`section-label`), badge chips, nav CTA, promise badge tooltips, tab labels. The entire monospace vocabulary lives here.

### Named Rules

**The Weight Gap Rule.** Body is 400. Titles jump to 700. Headlines jump to 800. There are no 500 or 600 weight elements in the system. The gap creates the hierarchy. Intermediate weights look like hedging.

**The No-External-Font Rule.** Syne is permanently banned. Lora, DM Sans, Inter, JetBrains Mono — all removed. System fonts only. Running `/impeccable document` will find no `@import` or `<link rel="stylesheet">` for fonts; that is correct and intentional.

## 4. Elevation

This system is flat. There are no `box-shadow` declarations used decoratively. Depth is created entirely through tonal layering: `--black` (page) → `--surface` (card level) → `--surface-2` (nested element level) → borders as separators. `--surface-deep` is a reverse step: a darker block used for full-bleed sections that need contrast against the standard page background.

Shadows do not appear on hover or focus. State changes use opacity shifts (`opacity: 0.85`) or color transitions, never elevation changes.

### Named Rules

**The Flat-Field Rule.** Surfaces are flat at rest. Borders separate. Tint creates depth. No shadow ever appears as decoration. If you are about to write `box-shadow`, ask whether a border or background tint achieves the same separation; it almost always does.

## 5. Components

### Nav CTA Button
Precise and code-like. Not a hero CTA — this is a utility action in a technical nav.
- **Shape:** Gently squared (4px radius)
- **Primary:** Teal Strike background (`#3BD1D3`), On Accent text (`#021616`), 8px 14px padding
- **Typography:** Monospace, 10px, 0.06em tracking, uppercase, weight 500
- **Hover:** `opacity: 0.85`, 0.15s transition. No scale, no shadow.

### Promise Cards
Three cards forming a horizontal strip (desktop) that stacks vertically on mobile. The strip reads as a unified panel, not three separate cards.
- **Shape:** First card 7px radius on left; last card 7px radius on right; interior edges flush (desktop). All four corners rounded on mobile.
- **Background:** `--surface` (`#1a2424`)
- **Border:** `1px solid --border`, gap-as-border between cards
- **Internal Padding:** 32px (desktop), 24px 20px (mobile)
- **Anatomy:** Icon (24px, teal stroke) + h4 title (700, 17px) + body paragraph (400, 14px, lh 1.7) + badge chips

### Promise Badges
Small monospace chips below promise card body text. Tooltip appears on hover.
- **Shape:** 3px radius
- **Border:** `1px solid rgba(59, 209, 211, 0.25)` — semi-transparent teal
- **Typography:** Monospace, 8px, uppercase, 0.1em tracking
- **Text:** `--text-secondary` by default; teal (`--accent-text`) on key or active badges

### Section Labels
Monospace eyebrows that appear above every section h2. They name the zone before the headline arrives.
- **Typography:** Monospace, 9–11px, uppercase, 0.14em tracking, `--text-3` color
- **Spacing:** 12–16px margin-bottom before the h2
- **Format:** Plain text, no border, no background. The type carries it.

### Mockup Frames
Browser and mobile device shells used in the case study section. These are editorial devices, not UI components.
- **Background:** `--surface` — never white, never transparent
- **Border:** `1px solid --border-2`
- **Radius:** 8px (browser frames), 20px+ (mobile frames)
- **Rule:** Mockup content uses real data-like copy. No "Lorem ipsum." No generic placeholder names.

### Theme Toggle (deprecated — single theme is canonical)
**The toggle is being retired. The canonical direction is one committed theme: dark masthead over a light teal field, no toggle.** This is live on the flagship `index.html` (2026-06-17). Do not add the toggle to new pages.

**Migration status:** legacy pages (`faq.html`, `privacy.html`, `aios.html`, `cpd/index.html`) still carry the old dark-first toggle pending a site-wide cutover. `admin/` may stay dark indefinitely (back-office tool, not a brand surface). When migrating a legacy page, strip all four toggle pieces and fold the light-teal palette into a single `:root` — see `index.html` as the reference implementation.

**To retire the toggle on a page (what `index.html` did):**
1. Delete the **pre-paint init** `<script>` in `<head>`.
2. Delete the **`.theme-toggle` CSS** and every `[data-theme=...]` selector.
3. Delete the **`[data-theme="system"]` light-vars block** and the `[data-theme="light"]` block; fold the light-teal values into a single `:root`.
4. Delete the **button markup** in `<nav>`, the inline click handler, and any `<script src="/js/theme-toggle.js">` include.
5. Keep the **masthead dark**: hardcode nav background `#141416`-ish + a 2px `#3BD1D3` underline, and give nav links their own on-dark ink tokens (`--nav-ink` / `--nav-ink-hi`) since `--text` is now dark.

`/js/theme-toggle.js` remains only for not-yet-migrated legacy pages; do not use it on new work.

## 6. Do's and Don'ts

### Do
- **Do** use `#3BD1D3` only for interactive elements, active states, and the nav CTA. It is a signal, not a palette.
- **Do** tint every neutral toward hue 181°. No gray. No warm cream. No slate.
- **Do** use monospace type for every label, badge, eyebrow, nav element, and technical metadata.
- **Do** use 800 weight for display and headline, 700 for titles, 400 for body. Skip everything between.
- **Do** keep body line-height at 1.7 and max-width at 68ch. Cramped prose loses the founder mid-scroll.
- **Do** use border or background tint to create separation before reaching for a shadow.
- **Do** use `--surface-deep` with hardcoded text colors, not semantic variables.
- **Do** design for a Philippine founder on Android mid-range on LTE — not a MacBook on fiber in BGC.

### Don't
- **Don't** use Syne, Lora, DM Sans, Inter, or any Google Font. System fonts only. Permanently.
- **Don't** use em dashes anywhere in visible copy. Commas, colons, semicolons, and periods handle every case.
- **Don't** use gradient text (`background-clip: text` with a gradient). Single solid color for all text, always.
- **Don't** use `box-shadow` decoratively. Flat field, tonal layering, border separation.
- **Don't** use `border-left` or `border-right` thicker than 1px as a colored accent stripe on cards or callouts.
- **Don't** introduce warm or neutral-gray surfaces. Every background derives from hue 181°.
- **Don't** use glassmorphism (`backdrop-filter: blur`) as a default aesthetic. Rare and purposeful, or nothing.
- **Don't** build identical card grids — same card, icon + heading + paragraph, repeated. Vary structure.
- **Don't** use the hero-metric template (big number, small label, gradient accent). SaaS cliché.
- **Don't** use "unlock," "seamless," "world-class," "elevate," or any landing-page filler word in copy or UI labels.
- **Don't** use escape-fantasy framing ("run your business while you sleep," "4-hour workweek"). Founders want to be involved. The system strengthens them.
- **Don't** design for a Silicon Valley audience. Nothing about this site should signal it was built for someone else.
