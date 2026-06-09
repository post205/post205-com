// Shared theme toggle for all POST205 pages.
// Pairs with the inline pre-paint init in <head> and the #themeToggle button in <nav>.
// Cycle: dark → light → system. Persists to localStorage('post205-theme').
//
// To add the toggle to a page:
//   1. <head> init (prevents flash):
//        <script>(function(){var t=localStorage.getItem('post205-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();</script>
//   2. The .theme-toggle button markup in <nav> (3 SVG icons: dark/light/system).
//   3. The .theme-toggle CSS + the [data-theme="system"] light-vars media block.
//   4. This script before </body>: <script src="/js/theme-toggle.js"></script>
// See DESIGN.md → "Theme toggle (standard on every page)".

(function () {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  var labels = { dark: 'Dark', light: 'Light', system: 'System' };
  var setTitle = function (t) { btn.title = 'Theme: ' + (labels[t] || 'System') + ' — click to change'; };
  setTitle(document.documentElement.getAttribute('data-theme') || 'dark');
  btn.addEventListener('click', function () {
    var cycle = { dark: 'light', light: 'system', system: 'dark' };
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = cycle[current] || 'system';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('post205-theme', next);
    setTitle(next);
  });
})();
