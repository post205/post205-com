(function () {
  if (localStorage.getItem('cookie-ok')) return;

  const style = document.createElement('style');
  style.textContent = `
    #cookie-banner {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(120px);
      z-index: 999;
      display: flex;
      align-items: center;
      gap: 14px;
      background: var(--surface-2);
      border: 1px solid var(--border-2);
      border-radius: 40px;
      padding: 12px 16px 12px 20px;
      font-size: 13px;
      color: var(--text-2);
      white-space: nowrap;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      backdrop-filter: blur(12px);
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
      opacity: 0;
    }
    #cookie-banner.cookie-visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    #cookie-banner.cookie-hiding {
      transform: translateX(-50%) translateY(120px);
      opacity: 0;
    }
    .cookie-icon { font-size: 18px; flex-shrink: 0; }
    .cookie-text { white-space: normal; line-height: 1.4; }
    .cookie-text a { color: var(--accent); text-decoration: none; }
    .cookie-text a:hover { text-decoration: underline; }
    .cookie-btn {
      flex-shrink: 0;
      background: var(--accent);
      color: var(--on-accent, #021616);
      border: none;
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: 0.03em;
      transition: opacity 0.15s;
    }
    .cookie-btn:hover { opacity: 0.85; }
    @media (max-width: 600px) {
      #cookie-banner {
        bottom: 16px;
        left: 16px;
        right: 16px;
        transform: translateY(120px);
        border-radius: 16px;
        padding: 14px 16px;
        flex-wrap: wrap;
        white-space: normal;
        gap: 10px;
      }
      #cookie-banner.cookie-visible { transform: translateY(0); }
      #cookie-banner.cookie-hiding { transform: translateY(120px); }
    }
  `;
  document.head.appendChild(style);

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = `
    <span class="cookie-icon" aria-hidden="true">🍪</span>
    <span class="cookie-text">This site saves your theme preference. That's the only thing stored in your browser. <a href="/privacy.html">Privacy policy</a></span>
    <button class="cookie-btn" id="cookie-ok-btn">Got it</button>
  `;
  document.body.appendChild(banner);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => banner.classList.add('cookie-visible'));
  });

  document.getElementById('cookie-ok-btn').addEventListener('click', function () {
    banner.classList.remove('cookie-visible');
    banner.classList.add('cookie-hiding');
    setTimeout(() => banner.remove(), 400);
    localStorage.setItem('cookie-ok', '1');
  });
})();
