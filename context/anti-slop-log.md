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

### 2026-08-31 · workshop library, seven-shapes page (`w/lib`, encrypted payload)

Written *after* reading the style guide and this log, and it still shipped nine
slop shapes. Reading the guide first is necessary and not sufficient.

| Shipped | Why it's slop | Fixed to | Rule it broke |
|---|---|---|---|
| "Not by industry, and not by what it says on the permit. By the answer to one question." | Textbook negative parallelism, double negation into a reveal. Written the same day the ban was re-read. | "Industry is the wrong axis here, because two businesses in the same trade often get different constraints." | Hard Bans → negative parallelism |
| "The reason is not a failure of intelligence. It is that you cannot see inside anyone else's business." | "Not X. It is Y." | "Owners usually know something is capping them, and naming which thing is the harder part, because you cannot see inside anyone else's business." | Hard Bans → negative parallelism |
| "They are not slumps, and they are not evidence that the owner lost their touch." | Negation stacked twice to make a point that has a positive form. | "They arrive on schedule for the model, whoever happens to be running it." | Hard Bans → negative parallelism |
| "A dead month is a property of the model and not a verdict on the person." | Negative parallelism *and* a quotable drop in one sentence. | "A month with no closings looks identical from the inside whether you worked it hard or not." | negative parallelism; cut quotables |
| "Work on the wrong link and you have spent money and time buying nothing." | Aphorism standing in for the mechanism. The source says something more concrete and more useful. | "Work anywhere else and you add weight to the chain without adding strength." | cut quotables; say the working sentence |
| "The flat opening is the whole risk." / "The only explanation within reach is about you." | One-liner drops closing a paragraph for drama. | "That opening stretch carries most of the risk in the model." / "That leaves your own judgement as the only explanation available." | cut quotables |
| "Hiring takes months, training takes longer, and someone leaving takes capacity with them." | Three-item list, written while re-reading the three-item-list ban. | "Both move slowly, because hiring takes months and the person who leaves takes their capacity with them." | three-item-list tell |
| "a good month can leave you with less cash than a **quiet** one" / "It also settles a **quieter** question" / "What is **actually** missing here" | Banned intensifiers, three of them, in copy written to a brief that named them. | "a slow one" / "a question sitting underneath that one" / "What is missing here" | banned intensifiers: land / kind / actually / quiet(ly) |
| "The difficulty is the price of the model, and it was in the price when you picked it." | Sentimental closer with a neat echo. Ends on the feeling rather than the fact. | "All seven shapes come with a difficulty, and this is the one that came with yours." | sentimental closers; end on the real point |
| "a room full of owners comparing notes supplies one faster than any framework does." | Comparative flourish that is quietly a pitch for the workshop, inside a research page. | "a room of owners comparing notes supplies one." | don't sell inside the argument |

**Two process findings, both worth more than the individual fixes:**

- **The regex scan came back completely clean** after the first pass. Every one of
  the shapes above was caught only by dumping the page to plain prose and reading it
  end to end. Pattern-matching for banned words finds banned words; it does not find
  negative parallelism, drops, or a triplet wearing different punctuation.
- **The first fix pass introduced a new defect** — "strengthening any other link"
  repeated in consecutive sentences — and a duplicated argument about industry being
  the wrong axis appeared in two separate sections. This log already records that
  fixing one slop shape can introduce another; it happened again. Re-read the whole
  thing after fixing, not just the lines you touched.

### 2026-07-30 · internal mapping deck (`in/mapping`, encrypted payload)

| Shipped | Why it's slop | Fixed to | Rule it broke |
|---|---|---|---|
| "A diamond is a question, not a stage." (slide headline) | "X, not Y" negative parallelism in a headline. Got a pass because it came from the approved spec; spec copy isn't exempt. | "Every diamond is a question." | Hard Bans → negative parallelism |
| "One head can't be handed over. A wall can." (bold standalone) | Too poetic, one-liner drop. Parallel aphorism standing in for an actual explanation. Toffer wants brevity AND clarity; a quotable that needs decoding is neither. | "The point of mapping is to move the process out of the owner's head and onto a wall, because a wall is something the next person can read." | cut quotables; say the working sentence |
| "Hindi kasama diyan ang Chocolate Kiss: that handover worked…" | Compressed aside that assumes context the reader never got. Summarizing without setup reads as a non sequitur. | Expanded: "Chocolate Kiss is the example everyone reaches for, and it's the wrong one: …" | clarity over compression; give the setup |
| "These aren't rivals. They're all correct. The question is what the client is complaining about." | Staccato triplet again, opened with a negation of a rivalry nobody proposed. | "All five are standard tools, and the client's complaint tells you which one to reach for." | three-short-declaratives ban; state the positive |
| "A hundred years of people worked on this before us. We didn't invent it. We borrowed it, and…" / "…use it well: walk in with a marker and ask what actually happens." | "Didn't invent / borrowed" is negation-then-replacement in short dramatic beats; the marker line is a quotable drop. | (interim fix was itself flagged, next row) | negative parallelism; cut quotables |
| "We took their work and made it simple enough that a small team can use it on a Monday morning." | "Monday morning" is manufactured folksy detail; "made it simple enough" is self-congratulation. Tone drift: the fix for one slop shape introduced another. | "The method is about a hundred years old. It started with the Gilbreths' process charts in the 1920s, and everything in this deck came from the people who kept refining it." | tone drift; state facts, don't perform them |
| "The failures in the study are quieter: …" | "Quiet(ly)" is on the banned-intensifier list (writing-deck rules + batman firewall) and still shipped. Prestige adjective gesturing at meaning instead of stating it. | "The failures in the study are harder to see: …" | banned intensifiers: land / kind / actually / quiet(ly) |
| "That's kapwa: the map has to belong to…" / "Hiya is real: …" / "Wag tao lang. Tao ka — kaya mo 'to." | Naming the value is preaching it. The behavior teaches; the label lectures. (Toffer's call, 2026-07-31: embody values, never name them. Exception: a term whose meaning doesn't exist in English, e.g. "Ang paraan, may daan.") | Kept the behaviors, cut the labels: "a map only works if everyone in the room can read it"; "nobody wants to point out what the mapper missed, so silence isn't agreement." | not preachy; embody, don't name |


| Shipped | Why it's slop | Fixed to | Rule it broke |
|---|---|---|---|
| "Four shapes. One whiteboard. Forty-five minutes." (and the closing echo "Four shapes. One marker. The nerve to ask what actually happens.") | Three varied short declaratives for drama — the staccato-triplet AI cadence. | "It fits on one whiteboard and takes about forty-five minutes." / "walk in with a marker and ask what actually happens." | three-short-declaratives ban; three-item-list tell |
| "Four shapes on one whiteboard, forty-five minutes, and the process is out of their head and on the wall." (the first "fix" of the line above) | Same triad wearing commas. Reformatting a three-item list is not removing it — the enumeration is the slop, not the periods. | Dropped the enumeration and said the thing: "It fits on one whiteboard and takes about forty-five minutes." | three-item-list tell — applies to any punctuation |


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
