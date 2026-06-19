// faq-answer — the FAQ page chat. A visitor asks a question in natural language;
// we answer it grounded ONLY in the POST205 FAQ knowledge base below.
//
// Env vars (set in the post205.com Netlify site, not committed):
//   ANTHROPIC_API_KEY   (required to go live) Anthropic API key for the Messages API
//   TURNSTILE_SECRET    (optional) Cloudflare Turnstile secret. If set, the
//                       function verifies a `turnstileToken` field on each
//                       request against Cloudflare siteverify and rejects on
//                       failure. If NOT set, Turnstile is skipped entirely so
//                       nothing breaks today.
//
// Ships INERT and safe: if ANTHROPIC_API_KEY is missing we return a friendly
// canned answer (200, inert:true) so there is no error and no cost. The feature
// goes live the moment the key is set in Netlify.
//
// ABUSE / COST GUARDS (all active regardless of the key):
//   1. Origin/Referer allowlist — only post205.com, *.netlify.app deploy
//      previews, and localhost/127.0.0.1 (dev) may call this. Others get 403.
//   2. Best-effort IP rate limit — ~10 requests / 60s per IP. Over that, 429.
//      Per-warm-instance only (resets on cold start); a cheap throttle, not a
//      hard guarantee.
//   3. Bounded cost — max_tokens stays modest and the question length is capped.
//
// TO FULLY LOCK IT DOWN LATER: set TURNSTILE_SECRET in Netlify AND add the
// Cloudflare Turnstile widget to faq.html (the widget posts a token the client
// then sends as `turnstileToken`). Don't add the widget now — the hook stays
// inert until the secret is present.
//
// NOTE: the FAQ_KB below is copied verbatim from faq.html. If you edit the FAQ
// copy on the page, update FAQ_KB here too so the chat stays in sync.

// All 11 question -> answer pairs, copied verbatim from faq.html.
const FAQ_KB = `
Q: What do you actually build?
A: Custom web systems your team logs into and runs the business from. Booking, inventory, billing, client portals, internal dashboards. Built for one company and how it works, not rented from a template made for everyone.

Q: What's your tech stack? Do you use a specific language or framework?
A: We pick the tools per project and keep the build lean, so it stays fast and cheap to run. We don't add technology to sound impressive. What you probably want to know is whether it works, whether it lasts, and what it costs. Those answers are below.

Q: Why custom instead of an off-the-shelf app?
A: Off-the-shelf software is built for the average business, usually in another country. Filipino teams don't run on averages. A custom system fits how your business already runs, down to peso pricing and the payment rails you use here. You stop bending your business to fit the software.

Q: Is it secure?
A: Your data sits in an encrypted database, protected in transit and at rest, with access limited to people who need it. We build to the Data Privacy Act of 2012 (RA 10173) from the first line, not as an afterthought before launch.

Q: Do I own the code and the data?
A: Yes. The code is yours and the accounts are yours. When the project ends, you hold the keys and the system keeps running. You're buying an asset, not renting access to one.

Q: What if something happens to POST205?
A: We build on standard, widely-used infrastructure, not a private platform only we understand. Any competent developer can read the code and take it over. You're never locked to us to keep your own business running.

Q: Will it handle growth?
A: Yes. We run systems that handle real booking and inventory volume every day. The database and hosting grow with you. The system doesn't need a rebuild every time your numbers go up.

Q: What will it cost to run each month?
A: We build so running costs stay low. Most systems cost very little to operate until you reach serious scale. You also stop paying a monthly per-user fee to a foreign software company for seats you may not use.

Q: How long does a build take?
A: Weeks for most systems, not years. We work lean, ship a version you can use, then refine it with you once it's live.

Q: Can it connect to my payments, email, and existing tools?
A: Yes. Online payments, email, calendars, and data you already keep can all plug in. We build around how you work now instead of forcing your team to switch everything at once.

Q: Do you use AI to build?
A: Yes, and we're not shy about it. AI is how we ship custom systems in weeks instead of months. A person designs the system, makes the calls, and reviews every line. AI does the heavy typing. It doesn't do the thinking.
`.trim();

const SYSTEM_PREAMBLE =
  `You are the FAQ assistant for POST205, a company that builds custom web systems for Philippine businesses. ` +
  `Answer ONLY using the knowledge provided below (the public FAQs plus any extra notes). Be concise, plain, and warm, in POST205's voice. ` +
  `Do not use marketing words. Do not use em dashes. ` +
  `If the question is not covered, say you are not sure and tell them to tap Let's talk to reach a human. ` +
  `Never invent facts, especially prices or specifics that are not in the knowledge. ` +
  `Keep answers short: two short paragraphs at most, ideally less.`;

// --- Extra knowledge base (private Supabase table, read server-side) ----------
// Reads public.faq_kb via the service role. The table is RLS-locked (no anon
// access), so this content is NOT public or indexable; only this function can
// read it. Cached ~5 min per warm instance. If SUPABASE_URL /
// SUPABASE_SERVICE_ROLE_KEY are absent or the fetch fails, we silently fall back
// to just the on-page FAQs, so nothing breaks.
let KB_CACHE = { at: 0, text: '' };
async function loadExtraKB() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return '';
  if (Date.now() - KB_CACHE.at < 5 * 60 * 1000) return KB_CACHE.text;
  try {
    const r = await fetch(`${url}/rest/v1/faq_kb?select=topic,content&enabled=eq.true`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!r.ok) { console.error('faq_kb fetch status', r.status); return KB_CACHE.text || ''; }
    const rows = await r.json();
    const text = (Array.isArray(rows) ? rows : [])
      .map((x) => `Topic: ${x.topic}\n${x.content}`).join('\n\n');
    KB_CACHE = { at: Date.now(), text };
    return text;
  } catch (e) { console.error('faq_kb load failed:', e); return KB_CACHE.text || ''; }
}

const FALLBACK = `I can't answer that one right now. Browse the FAQs below, or tap Let's talk and a human will reply within a day.`;

const json = (statusCode, obj) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(obj),
});

// --- Origin/Referer allowlist -------------------------------------------------
// Browser fetches always send Origin on cross-origin POSTs, so we can reject
// other sites and casual scripts. We allow post205.com (any subdomain),
// *.netlify.app deploy previews, and localhost/127.0.0.1 for local dev. If both
// Origin and Referer are entirely absent we allow it (same-origin server cases);
// browsers never strip Origin on a cross-origin call, so this is safe.
function hostFromHeader(value) {
  if (!value) return null;
  try { return new URL(value).hostname.toLowerCase(); } catch { return null; }
}
function isAllowedHost(host) {
  if (!host) return false;
  return (
    host === 'post205.com' ||
    host.endsWith('.post205.com') ||
    host.endsWith('.netlify.app') ||
    host === 'localhost' ||
    host === '127.0.0.1'
  );
}
function originAllowed(headers) {
  // Netlify lowercases header keys, but normalize defensively.
  const h = {};
  for (const k in headers) h[k.toLowerCase()] = headers[k];
  const origin = h['origin'];
  const referer = h['referer'] || h['referrer'];
  // No Origin and no Referer: treat as same-origin/server call, allow.
  if (!origin && !referer) return true;
  const oHost = hostFromHeader(origin);
  if (oHost) return isAllowedHost(oHost);
  // Fall back to Referer if Origin was unparseable/missing.
  const rHost = hostFromHeader(referer);
  return isAllowedHost(rHost);
}

// --- Best-effort IP rate limit ------------------------------------------------
// Module-scoped Map of IP -> recent request timestamps. Allows ~10 requests per
// 60s per IP. This is per-warm-instance and resets on cold start, so it's a
// cheap throttle to blunt abuse and runaway cost, not a hard guarantee.
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 10;
const hits = new Map();
function clientIp(headers) {
  const h = {};
  for (const k in headers) h[k.toLowerCase()] = headers[k];
  const fwd = h['x-forwarded-for'];
  return (
    h['x-nf-client-connection-ip'] ||
    (fwd ? fwd.split(',')[0].trim() : '') ||
    'unknown'
  );
}
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

// --- Optional Turnstile verification (env-gated, inert without the secret) -----
async function turnstilePassed(token, ip) {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true; // not configured: skip entirely so nothing breaks today
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, ...(ip && ip !== 'unknown' ? { remoteip: ip } : {}) }),
    });
    const data = await res.json().catch(() => ({}));
    return data && data.success === true;
  } catch (e) {
    console.error('Turnstile verify failed:', e);
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const headers = event.headers || {};

  // Guard 1: only our own pages (and dev/preview hosts) may call this.
  if (!originAllowed(headers)) {
    return json(403, { error: 'forbidden' });
  }

  // Guard 2: cheap per-IP throttle.
  const ip = clientIp(headers);
  if (rateLimited(ip)) {
    return json(429, { error: 'rate_limited', answer: 'Give me a sec — too many questions at once. Try again shortly.' });
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'bad request' }); }

  const question = String(body.question ?? '').trim();
  if (!question || question.length > 600) {
    return json(400, { error: 'invalid question' });
  }

  // Guard 3 (optional): Turnstile. Inert unless TURNSTILE_SECRET is set.
  if (!(await turnstilePassed(body.turnstileToken, ip))) {
    return json(403, { error: 'verification_failed', answer: "I couldn't verify that request. Refresh the page and try again." });
  }

  // Inert until the key is set in Netlify: no error, no cost.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        answer: "I can't answer live just yet. Browse the FAQs below, or tap Let's talk and a human will reply within a day.",
        inert: true,
      }),
    };
  }

  try {
    const extraKB = await loadExtraKB();
    const system = SYSTEM_PREAMBLE +
      `\n\nPublic FAQs:\n${FAQ_KB}` +
      (extraKB ? `\n\nExtra knowledge (not published on the page, use it to answer):\n${extraKB}` : '');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system,
        messages: [{ role: 'user', content: question }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Anthropic API error:', res.status, detail);
      return { statusCode: 200, body: JSON.stringify({ answer: FALLBACK }) };
    }

    const data = await res.json();
    const answer = Array.isArray(data.content)
      ? data.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim()
      : '';

    return { statusCode: 200, body: JSON.stringify({ answer: answer || FALLBACK }) };
  } catch (e) {
    console.error('faq-answer failed:', e);
    return { statusCode: 200, body: JSON.stringify({ answer: FALLBACK }) };
  }
};
