/* ─────────────────────────────────────────────────────────────
   POST205 · hero chat — persistent CTA layer (form-chat pattern).
   Three presentations of the SAME #chat-widget, viewport-chosen:
     • inline       (rest, every width) — the hero conversation
     • dock (≥769)  — detaches to a fixed bottom-right panel once the
                      hero scrolls away; returns home when it's back;
                      a minimize chevron tucks it into a launcher bubble
     • focus + bar (≤768) — a bottom-sheet that raises over the keyboard
                      + a sticky "Talk about your project" bar once the
                      inline chat scrolls off

   Pure node-relocation + event-delegation from the outside — the
   engine (chat-intake.js) is never touched. One clean breakpoint:
   ≤768 = phone, ≥769 = desktop (handoff gotcha 4).
   ───────────────────────────────────────────────────────────── */
(function () {
  var chat = document.getElementById('chat-widget');
  var hero = document.getElementById('hero');
  var bar  = document.getElementById('p205-reserve');
  if (!chat || !hero) return;

  var DOCK_MQ  = window.matchMedia('(min-width: 769px)');
  var FOCUS_MQ = window.matchMedia('(max-width: 768px)');

  // Capture the chat's true home so we can restore it EXACTLY (gotcha 1).
  var home = chat.parentNode, homeNext = chat.nextSibling;

  // Minimize chevron — shown inside the sheet and the dock.
  var minBtn = document.createElement('button');
  minBtn.type = 'button';
  minBtn.className = 'chat-sheet-min';
  minBtn.setAttribute('aria-label', 'Minimize chat');
  minBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  chat.appendChild(minBtn);

  function activeInput() { return chat.querySelector('.chat-input'); }
  function isDone() {
    if (document.documentElement.classList.contains('p205-done')) return true;
    try { return sessionStorage.getItem('p205_done') === '1'; } catch (e) { return false; }
  }
  function inFocus()  { return chat.classList.contains('is-focus'); }
  function isDocked() { return chat.classList.contains('is-docked'); }

  /* ── Mobile focus sheet ──────────────────────────────────── */
  function enterFocus() {
    if (!FOCUS_MQ.matches || inFocus()) return;
    // Move the chat to <body> BEFORE going fixed so the sheet is relative to the
    // viewport, not a transformed hero ancestor (gotcha 1).
    if (chat.parentNode !== document.body) document.body.appendChild(chat);
    chat.classList.add('is-focus');
    document.documentElement.classList.add('chat-locked');
  }
  function exitFocus() {
    if (!inFocus()) return;
    chat.classList.remove('is-focus');
    document.documentElement.classList.remove('chat-locked');
    if (home && chat.parentNode === document.body && !isDocked())
      home.insertBefore(chat, homeNext);
    syncKeyboard();
  }

  // Glue the focus sheet just above the soft keyboard (iOS) via VisualViewport.
  function syncKeyboard() {
    var vv = window.visualViewport;
    var kb = (inFocus() && vv) ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
    document.documentElement.style.setProperty('--kb', kb + 'px');
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncKeyboard);
    window.visualViewport.addEventListener('scroll', syncKeyboard);
  }

  // On mobile, ANY tap in the inline chat (a pill, the field, send, undo) snaps it
  // into the full-screen focus sheet; the conversation then continues there.
  chat.addEventListener('click', function (e) {
    if (inFocus() || !FOCUS_MQ.matches) return;
    var hit = e.target && e.target.closest && e.target.closest('.chat-chip, .chat-input, .chat-send, .chat-chip-done, .chat-undo');
    if (!hit) return;
    enterFocus();
    var input = hit.closest('.chat-input');
    if (input) { try { input.focus({ preventScroll: true }); } catch (_) { try { input.focus(); } catch (e) {} } }
  });
  minBtn.addEventListener('click', function () {
    if (isDocked()) { minimizeDock(); return; }   // desktop: tuck into the launcher
    var a = activeInput(); if (a) a.blur();        // mobile: drop the keyboard first
    exitFocus();
  });
  // Tap the dimmed page behind the sheet to lower it.
  document.addEventListener('click', function (e) {
    if (!inFocus()) return;
    // GOTCHA 2: an in-chat control that removes itself on click (Send, a chip)
    // leaves e.target DETACHED by the time this click bubbles to document. A
    // detached target is NOT a backdrop tap — ignore it, or the sheet would close
    // the instant the visitor answers. (Fires on tap only.)
    if (e.target && e.target.isConnected === false) return;
    if (chat.contains(e.target)) return;
    var a = activeInput(); if (a) a.blur();
    exitFocus();
  });
  if (FOCUS_MQ.addEventListener) FOCUS_MQ.addEventListener('change', function (e) { if (!e.matches) exitFocus(); });

  /* ── Desktop dock (≥769) ─────────────────────────────────── */
  function dock() {
    if (isDocked() || !DOCK_MQ.matches || inFocus() || isDone()) return;
    if (chat.parentNode !== document.body) document.body.appendChild(chat); // gotcha 1
    chat.classList.add('is-docked');
  }
  function undock() {
    if (!isDocked()) return;
    chat.classList.remove('is-docked');
    if (home && chat.parentNode === document.body && !inFocus())
      home.insertBefore(chat, homeNext);
  }

  /* ── Collapsed launcher (desktop) ── */
  var launch = document.createElement('button');
  launch.type = 'button';
  launch.className = 'p205-launch';
  launch.setAttribute('aria-label', 'Open the chat');
  launch.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  document.body.appendChild(launch);

  var minimized = false;
  function showLaunch() { launch.classList.add('show'); }
  function hideLaunch() { launch.classList.remove('show'); }
  function minimizeDock() { minimized = true; refreshDock(); }
  // gotcha 5: don't let the launcher tap bubble into the document close handler.
  launch.addEventListener('click', function (e) { e.stopPropagation(); minimized = false; refreshDock(); });

  // Single source of truth for the desktop dock/launcher (≥769).
  function refreshDock() {
    if (!DOCK_MQ.matches || !heroAway || isDone()) { hideLaunch(); undock(); return; }
    if (minimized) { undock(); showLaunch(); }
    else { hideLaunch(); dock(); }
  }

  /* ── Hero observer drives dock + bar lifecycle ───────────── */
  var heroAway = false;
  new IntersectionObserver(function (es) {
    heroAway = !es[0].isIntersecting;
    refreshDock();
    refreshBar();
  }, { threshold: 0 }).observe(hero);

  /* ── Mobile sticky bar (≤768) ────────────────────────────── */
  function refreshBar() {
    if (!bar) return;
    bar.classList.toggle('show', FOCUS_MQ.matches && heroAway && !inFocus() && !isDone());
  }
  if (bar) {
    bar.addEventListener('click', function (e) {
      e.stopPropagation();           // gotcha 5
      window.P205Chat.open();
    });
  }
  new MutationObserver(refreshBar).observe(chat, { attributes: true, attributeFilter: ['class'] });

  /* ── Mode switch on resize (keep the two relocate modes disjoint) ── */
  if (DOCK_MQ.addEventListener) DOCK_MQ.addEventListener('change', function () {
    if (DOCK_MQ.matches) { exitFocus(); refreshDock(); }
    else { undock(); hideLaunch(); }
    refreshBar();
  });

  /* ── Public hook ── */
  window.P205Chat = {
    open: function () {
      enterFocus();
      var a = activeInput();
      if (a) try { a.focus({ preventScroll: true }); } catch (_) { try { a.focus(); } catch (e) {} }
    },
    close: exitFocus,
    isOpen: inFocus,
    // Retire the CTA after a successful submit (gotcha 6). Set the flag BEFORE
    // dropping the sheet — exitFocus toggles the class the bar watches.
    complete: function () {
      document.documentElement.classList.add('p205-done');
      try { sessionStorage.setItem('p205_done', '1'); } catch (_) {}
      exitFocus();
      hideLaunch();
      refreshBar();
    }
  };

  refreshBar();
})();
