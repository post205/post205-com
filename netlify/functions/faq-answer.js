// faq-answer — the FAQ page chat. A visitor asks a question in natural language;
// we answer it grounded ONLY in the POST205 FAQ knowledge base below.
//
// Env var (set in the post205.com Netlify site, not committed):
//   ANTHROPIC_API_KEY   Anthropic API key for the Messages API
//
// Ships INERT and safe: if ANTHROPIC_API_KEY is missing we return a friendly
// canned answer (200, inert:true) so there is no error and no cost. The feature
// goes live the moment the key is set in Netlify.
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

const SYSTEM_PROMPT =
  `You are the FAQ assistant for POST205, a company that builds custom web systems for Philippine businesses. ` +
  `Answer ONLY using the FAQs below. Be concise, plain, and warm, in POST205's voice. ` +
  `Do not use marketing words. Do not use em dashes. ` +
  `If the question is not covered by the FAQs, say you are not sure and tell them to tap Let's talk to reach a human. ` +
  `Never invent facts.\n\n` +
  `FAQs:\n${FAQ_KB}`;

const FALLBACK = `I can't answer that one right now. Browse the FAQs below, or tap Let's talk and a human will reply within a day.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: 'Bad request' }; }

  const question = String(body.question ?? '').trim();
  if (!question || question.length > 600) {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid question' }) };
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
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
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
