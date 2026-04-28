(function () {
  if (localStorage.getItem('cookie-ok')) return;

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = `
    <span class="cookie-icon">🍪</span>
    <span class="cookie-text">We store one thing locally: your theme preference. No tracking. No ads. <a href="/privacy.html">Full story</a></span>
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
