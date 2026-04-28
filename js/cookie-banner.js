(function () {
  if (localStorage.getItem('cookie-ok')) return;

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = `
    <svg class="cookie-icon" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="11" cy="11" r="9" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.3"/>
      <circle cx="8"  cy="8.5" r="1.5" fill="var(--accent)"/>
      <circle cx="13.5" cy="8" r="1.1" fill="var(--accent)"/>
      <circle cx="14" cy="13" r="1.5" fill="var(--accent)"/>
      <circle cx="8"  cy="14" r="1.1" fill="var(--accent)"/>
      <circle cx="11" cy="11" r="1.1" fill="var(--accent)"/>
    </svg>
    <span class="cookie-text">This site saves your theme preference. That's the only thing stored in your browser. <a href="/privacy.html">Privacy policy</a></span>
    <button class="cookie-btn" id="cookie-ok-btn">Got it</button>
  `;
  document.body.appendChild(banner);

  // Trigger slide-in after paint
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
