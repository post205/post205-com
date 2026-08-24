# Playbook — building a presentation deck with a phone remote

Everything learned building the AIOS crash course (2026-08-12 → 08-15). Written so the
next deck can be built without rediscovering any of it.

**Reference implementation:** `aios/course/index.html` (deck), `aios/course/r/index.html`
(phone remote), `aios/course/script/index.html` (run sheet). One self-contained file each.
Copy them; do not start from scratch.

---

## 1. What a deck is here

A single HTML file. No build step, no framework. Slides are `<section class="slide">`,
one is `.active` at a time, and the whole thing is driven by one module script.

Lineage: this rebuilds the `/in/mapping` internal deck system on a dark field. Keep the
shared grammar — wheel/swipe/arrow nav, pip bar, decoding counter, `.rise` stagger entry,
stroke-draw diagrams, the 15x5 POST205 logo breathing inside a pixel lattice.

**Brand rules that are not negotiable** (see `DESIGN.md`):
- System fonts only. `system-ui` for display, `ui-monospace` for labels. No web fonts, ever.
- On a dark field, Teal Strike `#3BD1D3` is the ONLY accent. Ground `#071717`.
- Hardcode inks on dark surfaces; do not trust semantic variables there.

### Type sizes for a room, not a desk
A deck read from the back of a room needs roughly 60% more type than a web page.
Display up to 124px, h2 up to 74px, body 20px. **Labels are the trap:** eyebrows and tags
rendered at 11–13px on the first pass and were unreadable from three metres. Floor is 14px,
and 16px for anything that carries meaning.

### One rule that shapes everything
**The slide carries only the phrase spoken aloud. Every supporting sentence goes to the
phone.** The AIOS deck went from ~2,800 on-screen words to 703. If a sentence is not said
out loud verbatim, it belongs in the notes.

---

## 2. The phone remote

### Architecture
Both devices dial out to Supabase Realtime independently and meet in a room. They never
need to see each other on the network.

- Endpoint: `wss://<project>.supabase.co/realtime/v1/websocket?apikey=<anon>&vsn=1.0.0`
- Join: `{topic:"realtime:deck-<CODE>", event:"phx_join", payload:{config:{broadcast:{self:false}}}, ref:"1"}`
- Send: `{topic, event:"broadcast", payload:{type:"broadcast", event:"cmd", payload:{...}}}`
- Heartbeat every 20–25s: `{topic:"phoenix", event:"heartbeat", payload:{}, ref:n}`

Spoken over a plain WebSocket. **Do not vendor supabase-js** — it is ~60 lines by hand and
keeps the no-external-libraries rule intact. Ephemeral broadcast only: no table, no writes,
no RLS surface. The anon key is already public elsewhere on the site.

**Room code:** 4 chars from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no O/0/I/1).

### The five failure modes, all hit for real

1. **The display has no keyboard.** The pairing was behind a `P` key. The display is an
   iPad. Ship a visible, tappable control in the bar. Keep `P` as a bonus.
2. **iOS discards background tabs.** Toffer tapped Remote, walked to his phone, and iOS
   froze or threw away the deck tab. The socket died, the phone knocked on an empty room
   forever. Fix: persist the room code, rejoin silently on load, reconnect on `close` with
   backoff, and rejoin on `visibilitychange`.
3. **The phone asked once.** It sent `hello` on join and never again. If the deck was not
   there yet, nothing ever happened. Fix: knock every 2s until answered, and have the deck
   broadcast its state every 3s so a late joiner syncs without asking.
4. **Safari throws on storage.** Private browsing, Lockdown Mode and some content blockers
   make `sessionStorage` throw. That threw at module top level and killed the entire
   script, so **not one slide rendered**. This is the worst bug of the session. Fixes:
   guard every storage access with try/catch and an in-memory fallback, and move all
   remote startup to AFTER the first slide is on screen.
5. **Silent failure.** The phone sat on "waiting for the deck" with no explanation. Any
   remote must say what is wrong: "no deck yet", "reconnecting", "the deck is not
   answering — check the code is still on screen".

### Never let the remote break the slides
- CSS fallback: `.slide.active, body:not(.ready) .slide:first-of-type { display: flex }`.
  Slide 1 shows even if the script never runs. Add `body.ready` only after `show()` succeeds.
- Import the animation library dynamically; on failure set the reduced-motion flag and
  present without motion.
- Ship a `window.onerror` reporter that prints the error into a bar on the page, so the
  device that is actually failing can report it. Debugging blind wastes hours.

### Offline fallback, free
A physical Bluetooth presentation clicker pairs as a keyboard and sends PageDown/PageUp/
arrows. If the deck listens for those, a clicker works with zero code and zero internet.
Web Bluetooth cannot connect two browsers, and iOS has no Web Bluetooth at all — do not
try to build browser-to-browser BT.

### Hotspot works fine
Phone hotspot → iPad is a good setup, often better than venue wifi (which isolates clients
and sometimes blocks WebSockets). The remote holds a screen wake lock, which keeps the
phone awake, which keeps the hotspot alive.

---

## 3. Notes as a spoken script

Notes live in `<template class="notes">` inside each slide and ride along with the state
broadcast. They never render on screen.

Structure per slide:
- `<span class="cue">` — where you are ("Lesson 7, the mechanism")
- **A lead line, first `<p class="lead">`** — larger and heavier. This is what the eye
  lands on when you glance down mid-sentence. Without it you lose your place.
- Body paragraphs in spoken register: contractions, short sentences, the connective tissue
  that makes one beat lead into the next.
- `<strong>` on scan-words so it can be ad-libbed instead of read. ~180 across 35 slides.
- `<em>` for stage directions: where to pause, what to ask the room, what to say twice.
- A closing `<em>Bridge: …</em>` where the logic jumps, so there is something to say while
  the slide changes.

**Write for the mouth.** Read it aloud. Anything over ~540 characters runs past a breath.

---

## 4. The run sheet

A third page at `/script/` showing every slide with its notes, for review without pairing
anything. **It fetches the deck HTML and parses it at load** rather than holding a copy,
so it can never drift out of sync. Prints clean. Same passcode gate as the rest.

---

## 5. 3D art that belongs on the field

**Never write "no 3D render" into a slide-art prompt.** Flat schematic line art reads dim
and lifeless on a projector. This cost a full regeneration cycle.

Generate with gpt-image-1: `"background":"transparent"`, `"output_format":"png"`,
1024x1024, quality high. Transparent PNGs float straight on the field — **no panel, no
mask, no blend mode**, just `filter: drop-shadow(0 22px 46px rgba(0,0,0,.55))`. Opaque art
needs masking and still shows a frame.

Prompt spine that worked:
> Playful 3D render in the style of a modern 3D app icon or Blender clay render. Matte clay
> materials in deep teal and dark slate, bright cyan-teal #3BD1D3 glowing on the key element,
> soft glossy highlights, gentle rim light. Rounded friendly chunky geometry, tactile and
> toy-like. Isolated object floating on a FULLY TRANSPARENT background: no backdrop, no floor,
> no scene, no vignette, no cast shadow. Centred, fills the frame with a generous margin,
> nothing touching any edge. ABSOLUTELY NO TEXT. STRICTLY NO PEOPLE, faces, heads or hands.

Compress with alpha intact (sips cannot do webp; JPEG kills alpha):
```python
im = Image.open(f).convert('RGBA')
im = im.crop(im.split()[3].getbbox())                      # trim to object
im = ImageOps.expand(im, border=max(im.size)//14, fill=(0,0,0,0))  # give it margin
im.thumbnail((1000,1000), Image.LANCZOS)
im.quantize(colors=255, method=Image.FASTOCTREE).save(out, optimize=True)
```
~50–90KB each. Twenty images fit in 1.4MB.

**Always check the alpha bounding box** for edge contact. Two images shipped cropped at the
canvas edge and it read as a rendering bug on the slide.

**The model breaks the no-people rule.** It produced human faces twice and a head-and-
shoulders silhouette once, all despite explicit bans. Review every single image.

### The graphic must teach, not decorate
The real test: does the picture explain the sentence, or does the room think "that's the
message, why is that the image?" Three failed this and were caught only by reading each
script against its image:
- "Stop talking to it, start managing it" showed two blocks chatting — the opposite.
  Fixed: one arrow out, three bright arrows back, then finished work.
- "It is trained to please you" showed a plan being attacked — that is the fix, not the
  claim. Fixed: a cube facing a mirror, its reflection agreeing exactly.
- "Question · Cut · Build" was three labelled boxes restating the headline. Fixed: a
  funnel — six tasks, four struck out, one built.

---

## 6. Animation paced to speech

Fixed-timer animation always drifts from a live speaker. **Pace each diagram to the
sentence it sits under** via a `data-pace` attribute (ms per element), read in the
stroke-draw routine.

Tuned values: build order 800ms, two layers 1100ms (holds longest, it is the beat that
lands), seventy-percent 950ms, loop 900ms, funnel 420ms.

**Element count × pace must fit the spoken beat.** The funnel has 19 elements; at 900ms it
never finished, stalling at 15 of 19 after fourteen seconds. Always verify a paced diagram
actually settles.

Slide 2 replaces its image with a live reasoning stream — lines filling in the way a model
streams its thinking, looping. It runs only while that slide is up.

The 3D art fades and settles over ~1.5s so it arrives WITH the line, not ahead of it.

---

## 7. Verification harness

**Install Playwright properly** — `pip3 install playwright && python3 -m playwright install
chromium`. Do not settle for raw headless Chrome; two sessions were wasted on its quirks.

Per-slide audit, run at 1920x1080, 1600x900, 1366x768 and 1024x768:
- frame overflow (`scrollHeight - clientHeight`) — content cut below the fold
- any element right edge beyond the viewport
- text bounding boxes intersecting the art
- SVG text crossing a stroke — but only flag text NOT fully contained in its shape, or you
  get false positives on every label that correctly sits inside a box
- SVG paths with dangling endpoints touching neither a shape nor another path
- headline line lengths — flag a last line under ~42% of the longest (runt/widow)
- images that failed to load, and `pageerror` listeners

### Traps that produced false findings
- **Headless Chrome floors its window at ~500px.** Mobile screenshots were the harness
  cropping, not the page. Use an iframe of fixed width for true narrow-viewport testing.
- **`--virtual-time-budget` skips real network waits.** Any WebSocket or fetch test under
  it reports nothing happened. Use real time, and keep the browser alive with
  `--remote-debugging-port` while polling a result file.
- **Screenshots during slide transitions show false blanks and false overflow.** A slide
  mid-`translateX` reports as overflowing; slide 5 once captured completely black. Always
  re-check a suspicious finding on a settled, fresh load before chasing it.
- **Descender overflow of ≤6px is not a defect.** Large type with tight line-height
  reports a few px of frame overflow that is invisible and loses nothing.

---

## 8. Copy discipline

Read `docs/writing-style.md` AND `context/anti-slop-log.md` **before** writing, not after.
Writing first and auditing second produced a deck Toffer described as "a lot of ai slop",
and a full rewrite.

The shapes that keep slipping through: negative parallelism ("Not X. Y."), quotable
one-liner drops, three-short-declarative triplets, and tone drift — polishing his actual
words into something more clever and more American than how he talks. His dictated phrases
are usually already the best version. "Like a psychopath" beat "like a weirdo".

Headlines need `text-wrap: balance` and body copy `text-wrap: pretty`, or the browser
drops the last word onto its own line. Six headlines did this before it was fixed.

---

## 9. Build order for deck two

1. Copy `aios/course/` to the new path. It is three files plus an `img/` folder.
2. Strip the slide payload, keep the shell, the remote, the run sheet and all the CSS.
3. Write the slide headlines first — one spoken phrase each.
4. Write the notes as a script, with lead lines, bold scan-words and bridges.
5. Generate art only where a picture explains something the words do not.
6. Pace any narrative diagrams, then verify each one settles.
7. Run the full Playwright audit at four sizes before the first rehearsal.
8. Read it out loud. That is the only test that finds notes which fight the mouth.
