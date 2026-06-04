/* ─────────────────────────────────────────────
   theme.js — Universal dark / light toggle
   Works on every page independently.
   Load AFTER script.js (or alone if no script.js)
───────────────────────────────────────────── */

(function () {
  const STORAGE_KEY = 'rtw-theme';

  /* ── Apply saved theme instantly (no flash) ── */
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark') {
    document.body.classList.add('dark');
  }

  /* ── Wait for DOM before touching the button ── */
  /* ── Show success banner after form submission ── */
  if (window.location.search.includes('submitted=1')) {
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:9999;background:#10b981;color:#fff;padding:1rem 2rem;border-radius:8px;font-weight:600;font-size:1rem;box-shadow:0 4px 20px rgba(0,0,0,0.15);text-align:center;';
    banner.textContent = '✓ Thank you! Your message has been sent. We\'ll be in touch shortly.';
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 6000);
    history.replaceState(null, '', window.location.pathname);
  }

  document.addEventListener('DOMContentLoaded', function () {

    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return; // safety guard

    /* Set correct emoji based on current state */
    function syncIcon() {
      toggleBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
      toggleBtn.setAttribute('aria-label',
        document.body.classList.contains('dark') ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }

    syncIcon(); // set on page load

    /* ── Toggle on click ── */
    toggleBtn.addEventListener('click', function () {
      document.body.classList.toggle('dark');

      if (document.body.classList.contains('dark')) {
        localStorage.setItem(STORAGE_KEY, 'dark');
      } else {
        localStorage.setItem(STORAGE_KEY, 'light');
      }

      syncIcon();
    });

    /* ── Also hook any extra toggle buttons (mobile nav, etc.) ── */
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggleBtn.click(); // delegate to main button
      });
    });

  });

})();