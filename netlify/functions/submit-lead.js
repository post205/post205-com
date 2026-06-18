// submit-lead — a visitor finishes the homepage chat.
// Fans the lead out to: (1) ops.post205.com, (2) Telegram, (3) optional email.
// Each channel is gated on its own env vars, so this ships INERT until configured.
// Mirrors the post205-sign request-change.js pattern.
//
// Env vars (set in the post205.com Netlify site, none committed):
//   TELEGRAM_BOT_TOKEN      Telegram bot token
//   TELEGRAM_OPS_CHAT_ID    chat/channel id that should get lead pings
//   OPS_LEAD_ENDPOINT       ops receiver URL (e.g. https://<ops>.supabase.co/functions/v1/receive-lead)
//   OPS_LEAD_SECRET         shared bearer secret the ops receiver validates
//   RESEND_API_KEY          (optional) email fallback to toffer@post205.com

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: 'Bad request' }; }

  const clean = (s, max = 2000) => String(s ?? '').trim().slice(0, max);
  const lead = {
    source:   clean(body.source || 'post205.com', 60),
    business: clean(body.business, 120),
    pain:     clean(body.pain, 2000),
    timeline: clean(body.timeline, 120),
    name:     clean(body.name, 120),
    email:    clean(body.email, 160),
  };

  // Server-side guard: a real lead has a name and a plausible email.
  if (!lead.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) {
    return { statusCode: 422, body: JSON.stringify({ ok: false, error: 'invalid lead' }) };
  }

  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const sends = [];

  // 1) Forward to ops.post205.com — the register-lead edge function inserts into
  //    public.leads. Map our chat fields onto that function's schema.
  const opsUrl = process.env.OPS_LEAD_ENDPOINT, opsSecret = process.env.OPS_LEAD_SECRET;
  if (opsUrl) {
    const notes = [
      lead.pain ? `Pain: ${lead.pain}` : '',
      lead.timeline ? `Timeline: ${lead.timeline}` : '',
      'Source: post205.com homepage chat',
    ].filter(Boolean).join('\n');
    sends.push(fetch(opsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(opsSecret ? { Authorization: `Bearer ${opsSecret}` } : {}),
      },
      body: JSON.stringify({
        name:    lead.name,
        company: lead.business || lead.name,
        email:   lead.email,
        source:  'post205.com',
        status:  'new',
        notes,
      }),
    }).catch((e) => console.error('Ops forward failed:', e)));
  } else {
    console.error('OPS_LEAD_ENDPOINT not set — ops forward skipped');
  }

  // 2) Telegram ping
  const tgToken = process.env.TELEGRAM_BOT_TOKEN, tgChat = process.env.TELEGRAM_OPS_CHAT_ID;
  if (tgToken && tgChat) {
    const text =
      `🟢 *New lead — post205.com*\n\n` +
      `*${lead.name}*  ·  ${lead.email}\n` +
      (lead.business ? `Business: ${lead.business}\n` : '') +
      (lead.timeline ? `Timeline: ${lead.timeline}\n` : '') +
      (lead.pain ? `\n${lead.pain}\n` : '');
    sends.push(fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: tgChat, text, parse_mode: 'Markdown', disable_web_page_preview: true }),
    }).catch((e) => console.error('Telegram failed:', e)));
  } else {
    console.error('TELEGRAM_BOT_TOKEN / TELEGRAM_OPS_CHAT_ID not set — Telegram skipped');
  }

  // 3) Optional email fallback
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
        <h1 style="font-size:20px;font-weight:700;margin-bottom:8px">New lead from post205.com</h1>
        <div style="background:#f5f5f5;border-radius:6px;padding:20px 24px;margin-top:16px">
          <p style="margin:0 0 6px"><strong>${esc(lead.name)}</strong> · ${esc(lead.email)}</p>
          ${lead.business ? `<p style="font-size:14px;color:#555;margin:0 0 4px"><strong>Business:</strong> ${esc(lead.business)}</p>` : ''}
          ${lead.timeline ? `<p style="font-size:14px;color:#555;margin:0 0 4px"><strong>Timeline:</strong> ${esc(lead.timeline)}</p>` : ''}
          ${lead.pain ? `<p style="font-size:14px;color:#1a1a1a;white-space:pre-wrap;margin:8px 0 0"><strong>Pain:</strong><br>${esc(lead.pain)}</p>` : ''}
        </div>
      </div>`;
    sends.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'POST205 <hello@post205.com>', to: ['toffer@post205.com'], reply_to: lead.email, subject: `New lead: ${lead.name}`, html }),
    }).catch((e) => console.error('Resend failed:', e)));
  }

  await Promise.allSettled(sends);
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
