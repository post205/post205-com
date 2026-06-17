# Homepage chat → lead pipeline (post205.com)

Status: **staged, not deployed.** Lives in the v2 homepage draft (`index-v2.html`).
The live `index.html` is unchanged.

## Flow

```
visitor finishes chat (hero CTA / sticky bar / inline)
  → cheap guards: honeypot + min-fill-time (3s) + per-session dedupe
  → 1. Netlify Forms  (POST /)            dashboard record + backstop  [works today]
  → 2. /api/submit-lead (Netlify Function) fans out to:                [inert until env set]
        a. ops.post205.com   (OPS_LEAD_ENDPOINT + OPS_LEAD_SECRET)
        b. Telegram          (TELEGRAM_BOT_TOKEN + TELEGRAM_OPS_CHAT_ID)
        c. email fallback    (RESEND_API_KEY, optional)
```

Each channel in the function is gated on its own env vars, so the function ships
inert and harms nothing until configured. No browser-side anonymous Supabase
INSERT is introduced — the service-role/secret work happens inside the function,
which is the secure-submission pattern from `CLAUDE.md`.

## Env vars (set in the post205.com Netlify site — none committed)

| Var | Purpose |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (same bot as sign.post205.com can be reused) |
| `TELEGRAM_OPS_CHAT_ID` | chat/channel that receives lead pings |
| `OPS_LEAD_ENDPOINT` | ops receiver URL that ingests the lead |
| `OPS_LEAD_SECRET` | shared bearer secret the ops receiver validates |
| `RESEND_API_KEY` | (optional) email fallback to toffer@post205.com |

## Open questions before this can go live

1. **Ops ingest target.** Does ops.post205.com already have a leads table +
   receiver endpoint, or do we build a `receive-lead` edge function + `leads`
   table on the ops Supabase project? (Pattern exists: see
   `post205-ops/temp/ops-integration-brief.md` `receive-piandre-error`.)
2. **Telegram chat.** Reuse `TELEGRAM_OPS_CHAT_ID` from sign.post205.com, or a
   dedicated leads channel?
3. The post205.com Netlify site needs the env vars above (sign.post205.com is a
   separate Netlify site, so its vars don't carry over).

## Files

- `netlify/functions/submit-lead.js` — the fan-out function (ported from
  `post205-sign/netlify/functions/request-change.js`)
- `netlify.toml` — `[functions]` dir + `/api/*` redirect
- `index-v2.html` — chat submit calls both Netlify Forms and `/api/submit-lead`
