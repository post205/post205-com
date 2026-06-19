// faq-answer (v2, streaming) — the FAQ page chat. A visitor asks a question in
// natural language; we answer it grounded ONLY in the POST205 FAQ knowledge base
// (the on-page FAQs below + the private public.faq_kb table). The answer is
// STREAMED token-by-token to the browser so it starts appearing in ~1s instead
// of waiting for the whole completion.
//
// Env vars (set on the post205.com Netlify site, not committed):
//   ANTHROPIC_API_KEY            (required to go live) Anthropic Messages API key
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (read the private faq_kb table)
//   TURNSTILE_SECRET             (optional) Cloudflare Turnstile; verified if set
//
// Ships INERT and safe: without ANTHROPIC_API_KEY it returns a friendly canned
// JSON answer (200, inert:true). Success path streams text/plain; all guard
// rejections and the inert path return JSON. The client handles both.
//
// GUARDS (active regardless of the key): origin allowlist (403), best-effort
// per-IP rate limit (429), question length cap, optional Turnstile, bounded
// max_tokens.

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
  `Answer the worry under the question, not just the literal question, and leave the person feeling more in control of their business, their data, their money, and their future. Where it fits, point back to what they own (their code and data), how the system is built around how they already work, and that they are never locked in. Concede honestly rather than overclaim. ` +
  `Do not use marketing words. Do not use em dashes. ` +
  `If the question is not covered, or it needs a real quote or scoping (pricing, timelines, whether you can build something), say so plainly and offer to connect them with the team, for example "Want me to connect you with the team?". Never say "Let's talk" and never mention a button or link. ` +
  `Never invent facts, especially prices or specifics that are not in the knowledge. ` +
  `Keep answers as short as the question allows, usually one to three sentences. Only write more when the question genuinely needs the detail. Do not pad, do not restate the question.`;

const FALLBACK = `I can't answer that one right now. Browse the FAQs below, or I can connect you with the team.`;

const json = (status, obj) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

// --- Extra knowledge base (private Supabase table, read server-side) ----------
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

// --- Origin/Referer allowlist -------------------------------------------------
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
function originAllowed(origin, referer) {
  if (!origin && !referer) return true; // same-origin/server call
  const oHost = hostFromHeader(origin);
  if (oHost) return isAllowedHost(oHost);
  return isAllowedHost(hostFromHeader(referer));
}

// --- Best-effort per-IP rate limit (per warm instance) ------------------------
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 10;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) { hits.set(ip, recent); return true; }
  recent.push(now); hits.set(ip, recent); return false;
}

// --- Optional Turnstile (inert without the secret) ----------------------------
async function turnstilePassed(token, ip) {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, ...(ip && ip !== 'unknown' ? { remoteip: ip } : {}) }),
    });
    const data = await res.json().catch(() => ({}));
    return data && data.success === true;
  } catch (e) { console.error('Turnstile verify failed:', e); return false; }
}

// --- Question log (fire-and-forget insert into private public.faq_questions) --
// Records what people actually ask, to inform what to add to the KB. Anonymous
// (question text only). No-op until the table exists / keys are set.
function logQuestion(question, inert) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return Promise.resolve();
  return fetch(`${url}/rest/v1/faq_questions`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ question: String(question).slice(0, 600), inert: !!inert }),
  }).catch((e) => console.error('faq_questions log failed:', e));
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // Guard 1: only our own pages (and dev/preview hosts) may call this.
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer') || req.headers.get('referrer');
  if (!originAllowed(origin, referer)) return json(403, { error: 'forbidden' });

  // Guard 2: cheap per-IP throttle.
  const ip = req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return json(429, { answer: 'Give me a sec, too many questions at once. Try again shortly.' });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'bad request' }); }
  const question = String((body && body.question) ?? '').trim();
  if (!question || question.length > 600) return json(400, { error: 'invalid question' });

  // Guard 3 (optional): Turnstile.
  if (!(await turnstilePassed(body.turnstileToken, ip))) {
    return json(403, { answer: "I couldn't verify that request. Refresh the page and try again." });
  }

  // Inert until the key is set: no error, no cost.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    await logQuestion(question, true);
    return json(200, { answer: "I can't answer live just yet. Browse the FAQs below, or I can connect you with the team.", inert: true });
  }

  logQuestion(question, false); // fire-and-forget; runs while the model responds
  const extraKB = await loadExtraKB();
  const kbText = `Public FAQs:\n${FAQ_KB}` +
    (extraKB ? `\n\nExtra knowledge (not published on the page, use it to answer):\n${extraKB}` : '');
  // Cache the big static knowledge block so repeat questions skip re-processing
  // it (faster first token + cheaper). Falls back gracefully if under the cache
  // size threshold.
  const system = [
    { type: 'text', text: SYSTEM_PREAMBLE },
    { type: 'text', text: kbText, cache_control: { type: 'ephemeral' } },
  ];

  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 220,
        system,
        stream: true,
        messages: [{ role: 'user', content: question }],
      }),
    });
  } catch (e) {
    console.error('Anthropic request failed:', e);
    return json(200, { answer: FALLBACK });
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    console.error('Anthropic API error:', upstream.status, detail);
    return json(200, { answer: FALLBACK });
  }

  // Transform Anthropic's SSE into a plain-text token stream for the client.
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body.getReader();
      const dec = new TextDecoder();
      let buf = '', any = false;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl;
          while ((nl = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data || data === '[DONE]') continue;
            try {
              const ev = JSON.parse(data);
              if (ev.type === 'content_block_delta' && ev.delta && typeof ev.delta.text === 'string') {
                controller.enqueue(enc.encode(ev.delta.text));
                any = true;
              }
            } catch (_) { /* ignore keep-alives / partials */ }
          }
        }
      } catch (e) {
        console.error('stream relay failed:', e);
      } finally {
        if (!any) controller.enqueue(enc.encode(FALLBACK));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
};
