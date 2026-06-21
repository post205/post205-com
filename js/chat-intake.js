/* ─────────────────────────────────────────────────────────────
   POST205 · hero chat-intake — conversational lead capture.

   A scripted "chat" that asks one question at a time and submits to
   the SAME destinations as the static contact form:
     (a) Netlify Forms  — url-encoded POST to '/' (form-name=contact)
     (b) Ops + Telegram — JSON POST to '/api/submit-lead'

   Engine (step-machine + botSay → typing → stream → chips/input)
   ported from piandre-www/js/chat-intake.js. Vanilla, no deps.
   The flow + copy come from docs/CHAT-FLOW-POST205.md (em dashes
   stripped per DESIGN.md — replaced with a comma or a period).
   ───────────────────────────────────────────────────────────── */
(function () {
  const log       = document.getElementById('chat-log');
  const announcer = document.getElementById('chat-announcer');
  if (!log) return;
  // Typed answers mount in a PINNED composer; chip steps render in the log.
  const composer = document.getElementById('chat-composer') || log;

  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Collected answers → map 1:1 to the contact form fields. */
  const state = { business: '', pain_point: '', timeline: '', name: '', email: '' };

  /* ── DOM helpers ─────────────────────────────────────────── */
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'className') n.className = attrs[k];
      else if (k === 'style') n.setAttribute('style', attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    kids.forEach(c => n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return n;
  }
  // Smart auto-scroll: follow new content only when near the bottom.
  const NEAR_BOTTOM = 90;
  const isNearBottom = () => (log.scrollHeight - log.scrollTop - log.clientHeight) < NEAR_BOTTOM;
  const scroll = () => { if (isNearBottom()) log.scrollTop = log.scrollHeight; updateJump(); };
  const scrollToLatest = () => { if (log.scrollTo) log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' }); else log.scrollTop = log.scrollHeight; };

  // Jump-to-latest pill — floats just above the composer, shown when scrolled up.
  let jumpBtn = null;
  function ensureJump() {
    if (jumpBtn) return;
    const host = document.getElementById('chat-widget');
    if (!host) return;
    jumpBtn = el('button', { type: 'button', className: 'chat-jump', 'aria-label': 'Jump to latest' });
    jumpBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>';
    jumpBtn.appendChild(document.createTextNode('Latest'));
    jumpBtn.addEventListener('click', scrollToLatest);
    host.appendChild(jumpBtn);
  }
  function updateJump() {
    ensureJump();
    if (!jumpBtn) return;
    const show = !isNearBottom();
    jumpBtn.style.bottom = ((composer && composer !== log ? composer.offsetHeight : 0) + 12) + 'px';
    jumpBtn.classList.toggle('show', show);
  }
  log.addEventListener('scroll', updateJump, { passive: true });

  // When options appear, keep the QUESTION in view at the top.
  function anchorQuestion() {
    requestAnimationFrame(() => {
      const bots = log.querySelectorAll('.chat-msg.bot');
      const q = bots[bots.length - 1];
      const target = q ? Math.max(0, q.offsetTop - 14) : log.scrollHeight;
      if (log.scrollTo) log.scrollTo({ top: target, behavior: 'smooth' });
      else log.scrollTop = target;
    });
  }
  const announce = (t) => { if (announcer) announcer.textContent = t; };
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  /* ── Streaming text into a bubble (char-by-char) ─────────── */
  function streamText(bubble, text) {
    if (REDUCE) { bubble.appendChild(document.createTextNode(text)); scroll(); return Promise.resolve(); }
    const cursor = el('span', { className: 'chat-cursor', 'aria-hidden': 'true' });
    bubble.appendChild(cursor);
    return new Promise(res => {
      let i = 0;
      (function step() {
        if (i >= text.length) { cursor.remove(); res(); return; }
        const ch = text[i++];
        cursor.insertAdjacentText('beforebegin', ch);
        scroll();
        const delay = ch === ' ' ? 6 : 20 + (Math.random() * 14 - 4);
        setTimeout(step, Math.max(8, delay));
      })();
    });
  }

  function botShell() {
    const msg = el('div', { className: 'chat-msg bot' });
    msg.appendChild(el('span', { className: 'chat-avatar-mini', 'aria-hidden': 'true' }, '205'));
    const bubble = el('span', { className: 'chat-bubble' });
    msg.appendChild(bubble);
    log.appendChild(msg); scroll();
    return bubble;
  }

  async function botSay(text, delay) {
    // typing indicator
    const typing = el('div', { className: 'chat-typing' });
    typing.appendChild(el('span', { className: 'chat-avatar-mini', 'aria-hidden': 'true' }, '205'));
    const tb = el('span', { className: 'chat-typing-bubble' });
    tb.appendChild(el('span', { className: 'chat-typing-dot' }));
    tb.appendChild(el('span', { className: 'chat-typing-dot' }));
    tb.appendChild(el('span', { className: 'chat-typing-dot' }));
    typing.appendChild(tb);
    log.appendChild(typing); scroll();

    await wait(REDUCE ? 120 : (delay || 480));
    typing.remove();

    const bubble = botShell();
    await streamText(bubble, text);
    announce(text);
  }

  function userMsg(text) {
    const msg = el('div', { className: 'chat-msg user' });
    msg.appendChild(el('span', { className: 'chat-bubble' }, text));
    log.appendChild(msg); scroll();
  }

  /* ── Single-select chips ─────────────────────────────────── */
  function askChips(options, onPick, hintText, nudge) {
    const wrap = el('div', { className: 'chat-chips' });
    if (hintText) {
      const hint = el('div', { className: 'chat-hint' });
      hint.appendChild(el('span', { className: 'pip', 'aria-hidden': 'true' }));
      hint.appendChild(document.createTextNode(hintText));
      wrap.appendChild(hint);
    }

    let pingTimer = null;
    const stopPing = () => { if (pingTimer) { clearInterval(pingTimer); pingTimer = null; } };

    options.forEach((opt, i) => {
      const btn = el('button', { type: 'button', className: 'chat-chip' }, opt.label);
      btn.style.setProperty('--chip-i', i);
      btn.addEventListener('click', () => {
        stopPing();
        userMsg(opt.label);
        wrap.remove();
        onPick(opt.val, opt.label);
      });
      wrap.appendChild(btn);
    });
    log.appendChild(wrap); anchorQuestion();

    // Idle attention: ping a random chip on a loop until one is tapped.
    if (nudge && !REDUCE) {
      const chips = () => Array.from(wrap.querySelectorAll('.chat-chip'));
      const ping = () => {
        const c = chips();
        if (!c.length) return;
        const pick = c[Math.floor(Math.random() * c.length)];
        pick.classList.add('ping');
        setTimeout(() => pick.classList.remove('ping'), 1000);
      };
      pingTimer = setInterval(ping, 1600);
      setTimeout(ping, 1400);
    }
  }

  /* ── Free-text / typed input (pinned composer) ───────────── */
  function askInput(type, placeholder, onSubmit, opts) {
    opts = opts || {};
    const wrap = el('div', { className: 'chat-input-wrap' });
    const input = type === 'textarea'
      ? el('textarea', { className: 'chat-input', rows: '1', placeholder })
      : el('input', { type, className: 'chat-input', placeholder, autocomplete: opts.autocomplete || 'off' });
    // Auto-grow the textarea: start one line, grow to its CSS max, then scroll.
    if (type === 'textarea') {
      const grow = () => { input.style.height = 'auto'; input.style.height = input.scrollHeight + 'px'; updateJump(); };
      input.addEventListener('input', grow);
      setTimeout(grow, 0);
    }
    const actions = el('div', { className: 'chat-input-actions' });
    const send = el('button', { type: 'button', className: 'chat-input-send' }, 'Send');
    actions.appendChild(send);
    let skip = null;
    if (opts.skip) { skip = el('button', { type: 'button', className: 'chat-input-skip' }, opts.skipLabel || 'Skip'); actions.appendChild(skip); }
    wrap.appendChild(input); wrap.appendChild(actions);
    composer.appendChild(wrap); scroll();   // pinned bottom bar
    // preventScroll: the composer is already pinned in view — never jump the page to it.
    setTimeout(() => { try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); } }, 80);

    // Shared across this step's re-renders so the cap counts CONSECUTIVE asides.
    const aside = opts.asideState || (opts.asideState = { n: 0 });
    const fire = async () => {
      const val = (input.value || '').trim();
      if (!val) return;
      userMsg(opts.echo ? opts.echo(val) : val);
      wrap.remove();
      // AI detour: if the visitor typed a question/aside (and this step opted
      // in via opts.reAsk), answer it and re-ask instead of storing it.
      if (opts.reAsk && looksLikeAside(val)) {
        if (aside.n < 3) { aside.n++; await aiAside(val); }
        await opts.reAsk();
        return;
      }
      // Ambiguous free-text at a content step: let the AI judge nonsense vs a real answer.
      if (opts.judgeField && aside.n < 3) {
        const wasAside = await aiJudge(opts.judgeField, val);
        if (wasAside) { aside.n++; await opts.reAsk(); return; }
      }
      aside.n = 0;            // a real answer clears the consecutive-aside count
      onSubmit(val);
    };
    send.addEventListener('click', fire);
    // Enter sends; Shift+Enter is a newline (textarea only).
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fire(); } });
    if (skip) skip.addEventListener('click', () => { userMsg('Skip'); wrap.remove(); onSubmit(''); });
  }

  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());

  /* ── AI detour for off-script free-text (curveballs / questions) ──
     The hero chat is a guided intake, not a Q&A. When a visitor TYPES a
     question or a clear aside ("do you do Shopify?", "are you AI?") at a
     free-text step, route it to the same KB-grounded brain the FAQ uses,
     answer it, then gently re-ask the current step. Normal answers (names,
     a kind of business, a pain in their own words) pass straight through. */

  // CONSERVATIVE: true only when the text clearly reads as a question/aside.
  const ASIDE_LEAD = /^(do|does|did|can|could|what|how|why|where|when|who|whom|which|should|would|will|is|are|am|was|were|may|might|pwede ba|pwede|ano|anong|paano|saan|magkano|bakit|kaya|meron|may)\b/i;
  function looksLikeAside(text) {
    const t = String(text || '').trim();
    if (!t) return false;
    if (t.endsWith('?')) return true;
    if (t.indexOf('?') !== -1) return true;
    if (ASIDE_LEAD.test(t)) return true;
    return false;
  }

  // Hit the FAQ brain. Streams plain text, or shows .answer when inert (JSON).
  async function aiAside(question) {
    // Reuse the engine's typing indicator while we wait for the first byte.
    const typing = el('div', { className: 'chat-typing' });
    typing.appendChild(el('span', { className: 'chat-avatar-mini', 'aria-hidden': 'true' }, '205'));
    const tb = el('span', { className: 'chat-typing-bubble' });
    tb.appendChild(el('span', { className: 'chat-typing-dot' }));
    tb.appendChild(el('span', { className: 'chat-typing-dot' }));
    tb.appendChild(el('span', { className: 'chat-typing-dot' }));
    typing.appendChild(tb);
    log.appendChild(typing); scroll();

    let typingGone = false;
    const dropTyping = () => { if (!typingGone) { typing.remove(); typingGone = true; } };

    try {
      // DIRECT path: the /api/* rewrite breaks streaming (documented gotcha).
      // log:false keeps homepage asides out of the faq_questions log.
      const res = await fetch('/.netlify/functions/faq-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, log: false }),
      });
      if (!res.ok) throw new Error('faq-answer ' + res.status);

      const ctype = res.headers.get('content-type') || '';
      if (ctype.indexOf('application/json') !== -1) {
        // Inert fallback: function returns { answer }.
        const data = await res.json();
        dropTyping();
        const bubble = botShell();
        await streamText(bubble, (data && data.answer) ? data.answer : "Good question. Let me get back to you on that.");
        announce(bubble.textContent);
        return;
      }

      // Streaming plain text: append chunks to a live bot bubble.
      dropTyping();
      const bubble = botShell();
      if (!res.body || !res.body.getReader) {
        const txt = await res.text();
        await streamText(bubble, txt);
        announce(bubble.textContent);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        if (chunk) { bubble.appendChild(document.createTextNode(chunk)); scroll(); }
      }
      announce(bubble.textContent);
    } catch (_) {
      dropTyping();
      const bubble = botShell();
      await streamText(bubble, "Sorry, my brain hiccuped. Anyway,");
      announce(bubble.textContent);
    }
  }

  // Ask the AI to JUDGE ambiguous free-text at a content step: nonsense vs a
  // real answer. Returns true if it was an off-topic aside (and the funny reply
  // has already been shown → caller should re-ask). Returns false on a genuine
  // answer OR on any error (never block the intake).
  async function aiJudge(field, answer) {
    // Reuse the engine's typing indicator while we wait.
    const typing = el('div', { className: 'chat-typing' });
    typing.appendChild(el('span', { className: 'chat-avatar-mini', 'aria-hidden': 'true' }, '205'));
    const tb = el('span', { className: 'chat-typing-bubble' });
    tb.appendChild(el('span', { className: 'chat-typing-dot' }));
    tb.appendChild(el('span', { className: 'chat-typing-dot' }));
    tb.appendChild(el('span', { className: 'chat-typing-dot' }));
    typing.appendChild(tb);
    log.appendChild(typing); scroll();

    let typingGone = false;
    const dropTyping = () => { if (!typingGone) { typing.remove(); typingGone = true; } };

    try {
      const res = await fetch('/.netlify/functions/faq-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'judge', field, answer, log: false }),
      });
      if (!res.ok) { dropTyping(); return false; }
      const data = await res.json();
      dropTyping();
      if (data && data.aside) {
        const bubble = botShell();
        await streamText(bubble, (data.reply) || "Haha. Anyway,");
        announce(bubble.textContent);
        return true;
      }
      return false;
    } catch (_) {
      dropTyping();
      return false;
    }
  }

  /* ── The conversation — an explicit step machine (handoff §3) ── */
  let flowActive = false;
  let stepI = 0;
  const checkpoints = [];                       // checkpoints[i] = { marker, snap }
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const STEPS = [
    { key: 'pain',     ask: askPain },
    { key: 'business', ask: askBusiness },
    { key: 'timeline', ask: askTimeline },
    { key: 'name',     ask: askName },
    { key: 'email',    ask: askEmail },
  ];

  const applicable = (i) => i >= 0 && i < STEPS.length && (!STEPS[i].when || STEPS[i].when());
  function firstApplicable(from) { let i = from; while (i < STEPS.length && !applicable(i)) i++; return i; }
  function prevApplicable(from) { let i = from - 1; while (i >= 0 && !applicable(i)) i--; return i; }
  function canGoBack() { return flowActive && prevApplicable(stepI) >= 0; }

  async function go(i) {
    i = firstApplicable(i);
    stepI = i;
    if (i >= STEPS.length) { await submit(); return; }
    checkpoints[i] = { marker: log.childElementCount, snap: clone(state) };
    await STEPS[i].ask();
    refreshUndo();
  }
  const next = () => go(stepI + 1);

  // Pop to the previous applicable step: restore snapshot, trim the log, re-ask.
  function back() {
    const p = prevApplicable(stepI);
    if (p < 0 || !checkpoints[p]) return;
    const cp = checkpoints[p];
    Object.keys(state).forEach((k) => { delete state[k]; });
    Object.assign(state, cp.snap);
    while (log.childElementCount > cp.marker) log.removeChild(log.lastElementChild);
    if (composer !== log) composer.innerHTML = '';
    go(p);
  }

  // The undo affordance lives ON the visitor's most recent message (handoff §7).
  let undoEl = null;
  function clearUndo() {
    if (undoEl && undoEl.parentNode) undoEl.parentNode.removeChild(undoEl);
    undoEl = null;
  }
  function refreshUndo() {
    clearUndo();
    if (!flowActive || !canGoBack()) return;
    const users = log.querySelectorAll('.chat-msg.user');
    const lastUser = users[users.length - 1];
    if (!lastUser) return;
    const b = el('button', { type: 'button', className: 'chat-undo', title: 'Change this answer', 'aria-label': 'Go back and change this answer' });
    b.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-1"/></svg>';
    b.addEventListener('click', () => { b.disabled = true; back(); });
    lastUser.appendChild(b);
    undoEl = b;
  }

  /* ── The 5 questions (CHAT-FLOW-POST205.md, em dashes removed) ── */
  async function askPain() {
    await botSay("'Musta? What's the biggest headache in your business right now?", 700);
    askChips([
      { val: 'Chasing payments',       label: 'Chasing payments' },
      { val: 'Encoding by hand',       label: 'Encoding by hand' },
      { val: 'Bookings and schedules', label: 'Bookings and schedules' },
      { val: 'Reports and compliance', label: 'Reports and compliance' },
      { val: '__other',                label: 'Something else' },
    ], (v) => {
      if (v === '__other') {
        botSay("Tell me more about it.", 360).then(() => {
          const as = { n: 0 };
          const reAsk = () => botSay("Anyway, tell me more about that headache.", 360)
            .then(() => askInput('text', 'In your own words', (t) => { state.pain_point = t; next(); }, { reAsk, asideState: as, judgeField: 'their biggest business headache' }));
          askInput('text', 'In your own words', (t) => { state.pain_point = t; next(); }, { reAsk, asideState: as, judgeField: 'their biggest business headache' });
        });
        return;
      }
      state.pain_point = v; next();
    }, 'tap one', true);
  }
  async function askBusiness() {
    await botSay("Got it. What kind of business?", 480);
    askChips([
      { val: 'Clinic · Spa',      label: 'Clinic · Spa' },
      { val: 'Retail · Store',    label: 'Retail · Store' },
      { val: 'Events · Venue',    label: 'Events · Venue' },
      { val: 'Professional firm', label: 'Professional firm' },
      { val: '__other',           label: 'Something else' },
    ], (v) => {
      if (v === '__other') {
        botSay("What kind? Type it in.", 360).then(() => {
          const as = { n: 0 };
          const reAsk = () => botSay("Anyway, what kind of business is it?", 360)
            .then(() => askInput('text', 'Your kind of business', (t) => { state.business = t; next(); }, { reAsk, asideState: as, judgeField: 'what kind of business they run' }));
          askInput('text', 'Your kind of business', (t) => { state.business = t; next(); }, { reAsk, asideState: as, judgeField: 'what kind of business they run' });
        });
        return;
      }
      state.business = v; next();
    }, 'tap one', true);
  }
  async function askTimeline() {
    await botSay("When do you need this sorted?", 460);
    askChips([
      { val: 'ASAP',            label: 'ASAP' },
      { val: 'In a few months', label: 'In a few months' },
      { val: 'Just exploring',  label: 'Just exploring' },
    ], (v) => { state.timeline = v; next(); }, 'tap one', true);
  }
  async function askName() {
    await botSay("Sige. What's your name?", 440);
    const as = { n: 0 };
    const reAsk = () => botSay("Anyway, what's your name?", 360)
      .then(() => askInput('text', 'Your name', (v) => { state.name = v; next(); }, { autocomplete: 'name', reAsk, asideState: as }));
    askInput('text', 'Your name', (v) => { state.name = v; next(); }, { autocomplete: 'name', reAsk, asideState: as });
  }
  async function askEmail() {
    const first = (state.name || '').split(' ')[0];
    await botSay(`And your email, ${first}? I'll show you how we'd fix it.`, 480);
    // Email handles its own ordering: valid email wins; otherwise an aside gets
    // the AI detour, and a plain non-email gets the existing nudge. (We do NOT
    // pass opts.reAsk here, so the generic aside-intercept stays out of it.)
    let asideCount = 0;
    askInput('email', 'you@email.com', async function handle(email) {
      if (isEmail(email)) { state.email = email; next(); return; }   // next() past the end → submit()
      if (looksLikeAside(email)) {
        if (asideCount < 3) { asideCount++; await aiAside(email); }
        await botSay("Anyway, what's the best email for you?", 360);
        askInput('email', 'you@email.com', handle, { autocomplete: 'email' });
        return;
      }
      await botSay("Hmm, that doesn't look like an email. Mind checking it?", 440);
      askInput('email', 'you@email.com', handle, { autocomplete: 'email' });
    }, { autocomplete: 'email' });
  }

  /* ── Submit → DUAL: Netlify Forms + ops/Telegram pipeline ── */
  async function submit() {
    flowActive = false;
    clearUndo();
    await botSay("Sending...", 360);

    // Anti-abuse (handoff §9): honeypot + min-fill-time + dedupe. No-op the
    // write on a trip, but still show success.
    const hp = (document.getElementById('hp-chat')?.value || '').trim();
    const fp = JSON.stringify([state.email, state.business, state.pain_point]);
    let dupe = false; try { dupe = sessionStorage.getItem('p205_last') === fp; } catch (_) {}
    if (hp || performance.now() < 4000 || dupe) { await finishOk(); return; }
    try { sessionStorage.setItem('p205_last', fp); } catch (_) {}

    // (a) Netlify Forms: url-encoded POST to '/' with form-name=contact.
    const netlifyBody = new URLSearchParams({
      'form-name': 'contact',
      'bot-field': hp,
      name: state.name,
      email: state.email,
      business: state.business,
      pain_point: state.pain_point,
      timeline: state.timeline,
    }).toString();

    // (b) Ops + Telegram pipeline: JSON POST to /api/submit-lead.
    const leadBody = JSON.stringify({
      source: 'post205.com',
      business: state.business,
      pain: state.pain_point,
      timeline: state.timeline,
      name: state.name,
      email: state.email,
    });

    try {
      const netlify = fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: netlifyBody });
      // Fire-and-forget the ops pipeline (inert until the function is deployed).
      fetch('/api/submit-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: leadBody }).catch(() => {});
      const res = await netlify;
      if (!res.ok) throw new Error('netlify ' + res.status);
      await finishOk();
    } catch (_) {
      await botSay("Something went wrong on our end. You can email us directly at hello@post205.com.", 480);
    }
  }

  async function finishOk() {
    const first = (state.name || '').split(' ')[0];
    await botSay(`Salamat, ${first}! I'll be in touch within a day.`, 600);
    const restart = el('div', { className: 'chat-restart-link' });
    restart.appendChild(el('a', { href: '#', id: 'chat-restart-link' }, 'Start over'));
    log.appendChild(restart); scroll();
    document.getElementById('chat-restart-link').addEventListener('click', (e) => {
      e.preventDefault();
      try { sessionStorage.removeItem('p205_done'); sessionStorage.removeItem('p205_last'); } catch (_) {}
      location.reload();
    });
    // Retire the persistent CTA (chat-cta.js).
    try { window.P205Chat && window.P205Chat.complete && window.P205Chat.complete(); } catch (_) {}
  }

  /* ── Boot ── */
  async function init() {
    flowActive = true;
    await go(0);
  }
  setTimeout(init, REDUCE ? 200 : 550);
})();
