# Handoff — changing The Shift (Question · Cut · Build)

**Written 2026-08-15. Nothing below has been built yet.** Everything currently live
still teaches the old three-move framework and all surfaces agree with each other.
Do all six surfaces in one pass or none — a half-migration recreates the exact
contradiction we spent 2026-08-12 removing.

---

## The decision (research done, Toffer to confirm)

**Do NOT replace The Shift with Ferriss's DEAL.**

Three reasons:

1. **Wrong altitude.** DEAL is lifestyle design — its subject is your working life, and
   Liberation literally means location independence. The Shift's subject is one task on
   your desk. Toffer's room is PH SME owners trying to stop being the bottleneck, not
   people trying to become nomads.
2. **It repeats the Nate Herk problem.** DEAL is Ferriss's, from *The 4-Hour Workweek*
   (2007). `/aios-notion` says "Both are frameworks by **Toffer Lorenzana**." That line
   cannot survive adopting DEAL. We removed Nate's 3Ms for exactly this reason.
3. **Three of four moves already exist.** Definition≈Question, Elimination≈Cut,
   Automation≈Build. Only Liberation is new, and in the AIOS it is already The Stack's
   Initiative layer.

**Worth keeping from the research:** Ferriss says entrepreneurs run D-E-A-L and employees
run D-E-L-A, because *entrepreneurs struggle with Automation (giving up control) while
employees struggle with Liberation (taking control)*. That maps onto Lesson 1's two doors
and is worth a line in the notes. Toffer raised the DELA ordering himself and was right.

### What is actually wrong

Not the system — one word. **Cut** and **Build** are verbs you can act on. **Question**
is a vague noun sitting between them. That is the confusion Toffer reported.

### Recommended change

- **Rename "Question"** to a concrete verb. Not yet chosen — needs Toffer.
- **Add a fourth move: Verify.** It has no home today, yet it is Lesson 6, the one he
  calls the most important thing for anyone building agents. Own material, not borrowed.

### Laws to import (from the David Epstein "11 Laws of the Universe" reel Toffer sent)

- **Chesterton's Fence guards Cut.** "Eliminate before you automate" is dangerous alone —
  do not remove the process until you know why it is there. Makes Cut safe to teach.
- **Goodhart's Law guards Verify.** When a measure becomes a target it stops being a good
  measure. Directly relevant to evals and to scoring your own AIOS out of 100.
- **Pareto (80/20) and Parkinson's Law under Cut.** Ferriss's Elimination chapter is built
  on both — credit him there without adopting his framework.

---

## The six surfaces that must change together

| # | File | What changes |
|---|---|---|
| 1 | `aios/course/index.html` slide 28 | Shift move list + the funnel SVG, which currently draws three stages |
| 2 | `aios/course/index.html` slide 22 | The Shift card in "compressed into two" |
| 3 | `aios/course/index.html` notes | Slides 22, 28 and the Lesson 6 slides must point at each other |
| 4 | `~/Documents/claude-aios-starter/references/the-shift.md` | The framework doc itself |
| 5 | same repo: `README.md`, `CLAUDE.md`, `.claude/skills/level-up/SKILL.md` | All three walk through three moves |
| 6 | `aios-notion.html` | The Shift card |

Also check `/aios` — it does not name the moves today, but confirm.

## Verify after

- `grep -rn "Question · Cut · Build"` across post205 and claude-aios-starter → 0 hits
- Playwright pass over all 35 slides at 1920x1080, 1600x900, 1366x768, 1024x768:
  no frame overflow, no h-overflow, no runt headlines, no SVG label crossing a stroke
- Slide 28's diagram is paced via `data-pace`; if the element count changes, retime it.
  At 900ms with 19 elements it never finished — 420ms was the fix.
- `/aios/course/script` reads the deck live, so it updates itself. Just confirm it renders.

## Context worth having

- Deck architecture, presenter remote and house rules: `~/.claude/.../memory/aios-course-deck.md`
- Anti-slop rules are non-negotiable: `docs/writing-style.md` + `context/anti-slop-log.md`.
  Read both BEFORE writing any copy, not after.
- The starter repo is still ~33% Nate Herk's prose in `onboard`, `EXPANSIONS` and
  `aios-intake`. Unrelated to this change but still open, and the deck sends people there.
