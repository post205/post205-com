# context/ — POST205 working context

The settled stuff. Read it before you write, so we stop re-deciding things and
stop shipping AI slop we've already caught once.

## The iron rule (copy)

Before writing or editing ANY user-facing words — site copy, demo text, emails,
chat messages, SA pages, button labels — read **[../docs/writing-style.md](../docs/writing-style.md)**.
That file is the voice plus the hard bans (vocabulary and sentence patterns). Not optional.

**When you hand copy to a subagent, paste two things into its brief:**

1. The "Hard Bans" sections (vocabulary + sentence patterns) from `docs/writing-style.md`.
2. The recent entries in [anti-slop-log.md](anti-slop-log.md).

Almost every slop line this project has shipped came from a subagent that never saw the style guide. Pasting the bans into the brief is the single highest-leverage fix.

## Files

- **[anti-slop-log.md](anti-slop-log.md)** — real slop we actually shipped, the fix, and the rule it broke. The most useful file here. Add to it every time something gets flagged.
- **[decisions.md](decisions.md)** — settled product / design / stack / naming / compliance calls. Don't re-litigate these; if one is genuinely wrong, change it here.
- **[../docs/writing-style.md](../docs/writing-style.md)** — canonical voice + hard bans (lives in `docs/`, also referenced by the post205-answers skill).

## How to use it

- Writing copy → read `writing-style.md`, then skim `anti-slop-log.md`.
- Making a product / design / stack call → check `decisions.md` first.
- Got a new slop flag, or made a new decision → log it here in the same change. The folder is only useful if it stays current.
