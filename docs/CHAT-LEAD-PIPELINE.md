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

## Resolved wiring (2026-06-18)

**Ops ingest target = the existing `register-lead` edge function** (no new build
needed). It's ACTIVE on the shared Supabase project, `verify_jwt:false`,
Bearer-secret auth, inserts into `public.leads`.

- `OPS_LEAD_ENDPOINT` = `https://dikuhcaaxxsadlwepblf.supabase.co/functions/v1/register-lead`
- `OPS_LEAD_SECRET`   = the `REGISTER_LEAD_SECRET` value set on the ops Supabase function
- `submit-lead.js` maps the chat lead onto register-lead's schema:
  `{ name, company:business||name, email, source:'post205.com', status:'new', notes:"Pain/Timeline/Source" }`

**Telegram** is sent directly from `submit-lead.js` (register-lead does NOT ping
Telegram itself), so set `TELEGRAM_BOT_TOKEN` + `TELEGRAM_OPS_CHAT_ID` on the
post205.com Netlify site (reuse the sign.post205.com bot/chat or a dedicated
leads channel).

### To turn it on (set in post205.com Netlify → Site settings → Env vars)

| Var | Value |
|---|---|
| `OPS_LEAD_ENDPOINT` | the register-lead URL above |
| `OPS_LEAD_SECRET` | = `REGISTER_LEAD_SECRET` on the ops Supabase |
| `TELEGRAM_BOT_TOKEN` | the bot token |
| `TELEGRAM_OPS_CHAT_ID` | the chat/channel id for lead pings |
| `RESEND_API_KEY` | (optional) email fallback |

Each channel is independently env-gated, so the function stays inert until its
vars exist. No browser-side anon INSERT is introduced — the privileged write
happens inside register-lead (service role), per `CLAUDE.md`.

### Caveat — register-lead dedupes on `name`

`register-lead` is idempotent on `name` (built for SA creation, where client
names are unique). Two website leads with the same first name would collapse to
one `leads` row. The **Telegram ping fires regardless**, so no lead notification
is missed; only the ops table row may dedupe. If website volume makes this a
problem, switch the dedupe key to email (or add a `source`-scoped check) in
`post205-ops/supabase/functions/register-lead/index.ts`.

## Files

- `netlify/functions/submit-lead.js` — the fan-out function (ported from
  `post205-sign/netlify/functions/request-change.js`)
- `netlify.toml` — `[functions]` dir + `/api/*` redirect
- `index-v2.html` — chat submit calls both Netlify Forms and `/api/submit-lead`
