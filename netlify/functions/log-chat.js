// log-chat — forwards chat-capture batches from the site to the ops receiver.
// The browser calls /api/log-chat with no secret; this function adds it.
// Reuses the register-lead endpoint's URL/secret (same ops project, sibling fn).
//
// Env (already set for submit-lead):
//   OPS_LEAD_ENDPOINT   .../functions/v1/register-lead  → rewritten to /log-chat
//   OPS_LEAD_SECRET     shared bearer secret

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const opsUrl = process.env.OPS_LEAD_ENDPOINT, secret = process.env.OPS_LEAD_SECRET;
  if (!opsUrl || !secret) {
    console.error('OPS_LEAD_ENDPOINT / OPS_LEAD_SECRET not set — chat capture skipped');
    return { statusCode: 200, body: '{"ok":false}' };
  }

  // cheap guards: size cap + JSON shape (a chat batch is small)
  if ((event.body || '').length > 60000) return { statusCode: 413, body: 'Too large' };
  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: 'Invalid JSON' }; }
  if (!payload.session_key || !payload.source) return { statusCode: 400, body: 'Missing fields' };

  payload.ua = event.headers['user-agent'] || '';

  try {
    const res = await fetch(opsUrl.replace('register-lead', 'log-chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error('ops log-chat forward failed', res.status, await res.text().catch(() => ''));
  } catch (e) {
    console.error('ops log-chat forward error', e.message);
  }
  // always 200 to the browser — capture must never break the chat
  return { statusCode: 200, body: '{"ok":true}' };
};
