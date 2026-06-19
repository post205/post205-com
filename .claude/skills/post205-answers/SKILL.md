---
name: post205-answers
description: Use when writing or editing any answer to a prospect or customer question in POST205's voice — on-page FAQs, the FAQ chat knowledge base (faq_kb), the FAQ chat system prompt, objection handling, sales replies, reassurance/trust copy. Encodes HOW POST205 answers a question. Pair with docs/writing-style.md (sentence craft) and the positioning (custom software for Filipino business owners; ownership / fit / ease).
---

# Answering as POST205 — "Hand control back to the owner"

The method behind every good POST205 answer to a prospect or customer.

`docs/writing-style.md` governs how the sentences SOUND (blunt diagnosis, colon
pivot, negative-space, the vocabulary bans). This skill governs what the answer
DOES. Use both together. Positioning anchor: *custom software for Filipino
business owners* — fit (built around how your business runs) + ease (the whole
team uses it without training).

## The principle

**Every answer hands control back to the business owner.** Whatever they ask,
they should come away feeling more in control of their business, their data,
their money, and their future — not more dependent on us.

## The five moves

1. **Answer the worry under the question, not the literal question.** Find the
   real fear or want and speak to that.
   > "What's your tech stack?" → "We pick the tools per project and keep the
   > build lean. What you probably want to know is whether it works, whether it
   > lasts, and what it costs."

2. **Land on ownership / control / fit.** Route the answer back to: you own the
   code and the data, it's built around how you already work, you're not locked in.
   > "Do I own the code and data?" → "Yes. The code is yours and the accounts are
   > yours. You're buying an asset, not renting access to one."

3. **Name the foil.** Quietly position against the thing they'd otherwise settle
   for. The foils: off-the-shelf / template apps built for the average business;
   foreign software priced per seat; vendor lock-in; tech chosen to impress.
   > "Why custom?" → "Off-the-shelf software is built for the average business,
   > usually in another country. You stop bending your business to fit the software."

4. **Meet the fear head-on.** Security, "what if POST205 disappears?", growth,
   running cost — answer each by handing control back, not by hand-waving.
   > "What if something happens to POST205?" → "We build on standard, widely-used
   > infrastructure. Any competent developer can take it over. You're never locked
   > to us to keep your own business running."

5. **Concede honestly to earn trust.** Admit the real thing; don't overclaim. The
   concession is what makes the rest believable.
   > "Do you use AI to build?" → "Yes, and we're not shy about it. AI does the
   > heavy typing. It doesn't do the thinking."

## What to avoid

- Answering only the literal question (a spec dump with no reassurance).
- Marketing words / hype — see the vocabulary bans in `docs/writing-style.md`.
- Over-promising. Concede honestly instead.
- Negative-list phrasing ("No X, no Y, no Z"). State one positive claim. (Toffer
  flags these as AI slop. "No lock-in" as a single idiomatic badge is the only
  tolerated exception.)
- No em dashes in customer-facing copy. POST205, no space.

## Checklist (before shipping an answer)

- [ ] Does it answer the real worry, not just the literal question?
- [ ] Does the owner end up more in control (ownership / fit / no lock-in)?
- [ ] Is there a foil it quietly positions against?
- [ ] If there's a fear in the question, is it met head-on?
- [ ] Is there an honest concession that earns trust?
- [ ] Voice + bans per `docs/writing-style.md`? As short as the question allows?

## Where this applies

- `faq_kb` entries — apply this through the `faq-kb` skill when adding/editing.
- The FAQ chat system prompt — `netlify/functions/faq-answer.mjs` (SYSTEM_PREAMBLE
  carries a compressed version so the live AI answers this way).
- On-page FAQs in `faq.html` (keep in sync with `FAQ_KB` in the function).
- Proposals, sales replies, and objection handling generally.
