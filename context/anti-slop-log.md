# Anti-slop log

Real copy we shipped, got flagged, and fixed. Concrete beats abstract: when you
catch one of these shapes in your own draft, rewrite it. The general rules live in
[../docs/writing-style.md](../docs/writing-style.md); this is the running tally of
what actually slipped through anyway.

Add an entry every time copy gets flagged. Keep the "shipped" text verbatim so the
shape is recognizable next time.

---

## The shapes that keep slipping through

- **Negative parallelism / cutesy contrast** — "a few clicks, not a spreadsheet night", "isn't just X, it's Y", "forget X, focus on Y". Already banned in the style guide and still the #1 repeat offender. State the positive thing plainly and stop.
- **Folksy aphorism** — "X happens when the calendar lives in one person's head", "when Y lives in someone's head". Generic wisdom-sounding filler. Name the actual situation instead: who does what, by text and chat, and what breaks.
- **Subject pile-up** — three different subjects stacked into one sentence ("hours come from A, leave from B, and C comes off on its own"). Reads confusing. One subject, one clear flow.
- **Vague mechanism** — "comes off on their own", "the math in one place", "a few clicks", "all in one place". Says nothing concrete. Say what actually happens.
- **Fake process / theatrics** — rotating "thinking" words, loading drama before there is anything to load. Match the simplest proven pattern instead.
- **Tone drift** — "improving" copy into something more clever or more American than how Toffer actually talks. The plainer, Filipino-aware line is usually the right one.

---

## Log (newest first)

### 2026-06-23 · homepage demos (`index.html`)

| Shipped | Why it's slop | Fixed to | Rule it broke |
|---|---|---|---|
| "We keep the rates current and the math in one place, so a pay run is a few clicks, not a spreadsheet night." | Negative parallelism + cutesy ("not a spreadsheet night"); "math in one place" / "a few clicks" are vague. | "The SSS, PhilHealth, and Pag-IBIG rates change. We update them when they do, so the deductions stay right. You still see every payslip and approve the run before anyone gets paid." | Hard Bans → negative parallelism |
| "Hours come from the roster, leave from requests, and SSS, PhilHealth, and Pag-IBIG come off on their own. Payslips go out the same run." | Three subjects piled up = confusing; "come off on their own" is vague. | "Nothing to re-enter. The hours and leave are already counted, the SSS, PhilHealth, and Pag-IBIG come out, and each payslip is ready to send." | clarity over cleverness; one flow |
| "Double-bookings happen when the calendar lives in one person's head." | Overused folksy-aphorism mold. | "When bookings come in by text and chat, two people end up in the same slot." | name the real situation, not a maxim |

### 2026-06-21 · FAQ chat (`faq.html`)

| Shipped | Why it's slop | Fixed to | Rule it broke |
|---|---|---|---|
| Rotating "thinking" words (Thinking / Kinikilig / Nagdadasal …) shown on page load before any question was asked | Fake process / overthinking theatrics; pretends to think when nothing is happening. | Simple bouncing typing dots, same as the homepage. | don't fake activity; match the simpler proven pattern |

### Earlier (carried from project memory)

- "Too American" / over-clever chat pill options were replaced with the original simpler, Filipino-aware choices. Don't "improve" the tone away from how Toffer actually talks.
- Three-item lists, cause-effect chains, and solution lists are structural AI tells Toffer flags on sight.
