/* chat-log — capture layer for every site chat (homepage, FAQ, mapping).
   Watches #chat-log via MutationObserver, so the chat engines are never touched.
   Batches turns to /api/log-chat every few seconds and on page-hide (sendBeacon).
   Bot bubbles that type in character-by-character are sent only once their text
   has stabilized between two ticks. Capture must never break the chat: every
   path swallows its own errors. */
(function () {
  'use strict';
  var log = document.getElementById('chat-log');
  if (!log || !window.fetch) return;

  var SOURCE = 'post205.com' + (location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '');
  var KEY;
  try {
    KEY = sessionStorage.getItem('p205_chatlog_key');
    if (!KEY) {
      KEY = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : 'ck_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem('p205_chatlog_key', KEY);
    }
  } catch (e) {
    KEY = 'ck_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  var tracked = [];   // { el, side, last, sent }
  var seq = 0;
  var queue = [];
  var engaged = false; // only ship once the visitor has said something

  function bubbleText(el) {
    if (el.classList.contains('chat-cost')) return el.textContent.replace(/\s+/g, ' ').trim();
    var b = el.querySelector('.chat-bubble');
    return b ? b.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  function track(el) {
    if (el.nodeType !== 1) return;
    if (el.classList.contains('chat-typing') || el.classList.contains('chat-chips')) return;
    if (el.classList.contains('chat-msg') || el.classList.contains('chat-cost')) {
      var side = el.classList.contains('user') ? 'user' : 'bot';
      if (side === 'user') engaged = true;
      tracked.push({ el: el, side: side, last: null, sent: false, seq: seq++ });
    }
  }
  Array.prototype.forEach.call(log.children, track);
  new MutationObserver(function (muts) {
    muts.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, track); });
  }).observe(log, { childList: true });

  function converted() {
    try {
      return sessionStorage.getItem('p205_done') === '1' ||
             sessionStorage.getItem('p205_faq_lead_sent') === '1';
    } catch (e) { return false; }
  }

  function harvest(force) {
    tracked.forEach(function (t) {
      if (t.sent) return;
      var txt = bubbleText(t.el);
      if (!txt) return;
      if (force || txt === t.last) {  // stable between two ticks → final; on
        t.sent = true;                // page-hide take whatever is there — it's
        queue.push({ seq: t.seq, side: t.side, text: txt.slice(0, 2000) }); // the last chance
      } else {
        t.last = txt;
      }
    });
  }

  function payload() {
    return JSON.stringify({
      session_key: KEY,
      source: SOURCE,
      turns: queue.splice(0, queue.length),
      converted: converted()
    });
  }

  var lastConverted = false;
  function flush(useBeacon) {
    harvest(useBeacon);
    var conv = converted();
    if (!engaged) return;                       // nothing shipped until they engage
    if (!queue.length && conv === lastConverted) return;
    lastConverted = conv;
    var body = payload();
    try {
      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon('/api/log-chat', new Blob([body], { type: 'application/json' }));
      } else {
        fetch('/api/log-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
          keepalive: true
        }).catch(function () {});
      }
    } catch (e) { /* capture never breaks the chat */ }
  }

  setInterval(function () { flush(false); }, 5000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush(true);
  });
  window.addEventListener('pagehide', function () { flush(true); });
})();
