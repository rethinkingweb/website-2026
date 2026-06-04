/* ─────────────────────────────────────────────
   form-handler.js — Universal consultation form
   Uses EmailJS — no server required
───────────────────────────────────────────── */

(function () {

  const SERVICE_ID  = 'service_je1sqvd';
  const TEMPLATE_ID = 'template_51rsawi';
  const PUBLIC_KEY  = '5A5LhPvEmbexDOWIK';

  document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('contactForm');
    if (!form) return;

    form.removeAttribute('action');
    form.removeAttribute('method');

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      let valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      if (!valid) return;

      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      // Use sendForm — reads name attributes directly from the form
      emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form, PUBLIC_KEY)
        .then(function () {
          form.reset();
          submitBtn.disabled    = false;
          submitBtn.textContent = originalText;
          showBanner('✓ Thank you! We\'ve received your message and will be in touch shortly.', '#10b981');
        })
        .catch(function (err) {
          submitBtn.disabled    = false;
          submitBtn.textContent = originalText;
          console.error('EmailJS error:', JSON.stringify(err));
          const detail = err && err.text ? ' (' + err.text + ')' : '';
          showBanner('✗ Something went wrong' + detail + '. Please email us at info@rethinkingweb.com', '#ef4444');
        });
    });

    function showBanner(message, color) {
      const existing = document.getElementById('rtw-form-banner');
      if (existing) existing.remove();

      const banner = document.createElement('div');
      banner.id = 'rtw-form-banner';
      banner.style.cssText = [
        'position:fixed', 'top:90px', 'left:50%', 'transform:translateX(-50%)',
        'z-index:99999', 'background:' + color, 'color:#fff',
        'padding:1rem 2rem', 'border-radius:10px', 'font-weight:600',
        'font-size:1rem', 'box-shadow:0 6px 24px rgba(0,0,0,0.18)',
        'text-align:center', 'max-width:90vw'
      ].join(';');
      banner.textContent = message;
      document.body.appendChild(banner);
      setTimeout(function () { banner.remove(); }, 6000);
    }

  });

})();
