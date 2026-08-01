/* ─────────────────────────────────────────────
   TESTIMONIALS PAGE JS
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════
     1. NAV — scroll behaviour
  ══════════════════════════════ */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════════════════════════
     2. MOBILE NAV
  ══════════════════════════════ */
  const burger    = document.getElementById('navBurger');
  const mobileNav = document.getElementById('mobileNav');
  const closeBtn  = document.getElementById('mobileClose');
  const overlay   = document.getElementById('navOverlay');

  if (burger && mobileNav) {
    const openNav = () => {
      mobileNav.classList.add('open');
      if (overlay) overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      burger.setAttribute('aria-expanded', 'true');
      mobileNav.setAttribute('aria-hidden', 'false');
    };
    const closeNav = () => {
      mobileNav.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
      burger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    };

    burger.addEventListener('click', openNav);
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    if (overlay)  overlay.addEventListener('click', closeNav);

    // Close on plain anchor links only (not accordion buttons)
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
  }

  /* ══════════════════════════════
     3. MOBILE ACCORDION
  ══════════════════════════════ */
  document.querySelectorAll('.mob-accordion__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const accordion = btn.closest('.mob-accordion');
      const panel     = accordion.querySelector('.mob-accordion__panel');
      const isOpen    = accordion.classList.contains('open');

      // Close all first
      document.querySelectorAll('.mob-accordion').forEach(a => {
        a.classList.remove('open');
        a.querySelector('.mob-accordion__btn').setAttribute('aria-expanded', 'false');
        const p = a.querySelector('.mob-accordion__panel');
        if (p) p.style.maxHeight = null;
      });

      // Toggle clicked one
      if (!isOpen) {
        accordion.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ══════════════════════════════
     4. DESKTOP DROPDOWNS
  ══════════════════════════════ */
  document.querySelectorAll('.nav__dropdown').forEach(dd => {
    let leaveTimer = null;

    dd.addEventListener('mouseenter', () => {
      if (window.innerWidth > 1024) {
        clearTimeout(leaveTimer);
        document.querySelectorAll('.nav__dropdown').forEach(o => o !== dd && o.classList.remove('active'));
        dd.classList.add('active');
      }
    });
    dd.addEventListener('mouseleave', () => {
      if (window.innerWidth > 1024) {
        leaveTimer = setTimeout(() => dd.classList.remove('active'), 180);
      }
    });

        dd.querySelector('.nav__link')?.addEventListener('click', e => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        const isOpen = dd.classList.contains('active');
        document.querySelectorAll('.nav__dropdown').forEach(o => o.classList.remove('active'));
        if (!isOpen) dd.classList.add('active');
      }
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.nav__dropdown')) {
      document.querySelectorAll('.nav__dropdown').forEach(dd => dd.classList.remove('active'));
    }
  });
  /* ── Intersection Observer: animate testimonial cards ── */
  var cardObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".testimonial-card").forEach(function (el) {
    cardObserver.observe(el);
  });

  /* ── Stats counter animation ── */
  function animateCount(el) {
    var target = parseFloat(el.dataset.target);
    var suffix = el.dataset.suffix || "";
    var duration = 1400;
    var interval = 16;
    var steps = duration / interval;
    var increment = target / steps;
    var current = 0;
    var isFloat = el.dataset.target.indexOf(".") !== -1;

    var timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    }, interval);
  }

  var statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".stat-item__num").forEach(function (el) {
          animateCount(el);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  var statsBand = document.querySelector(".stats-band");
  if (statsBand) {
    statsObserver.observe(statsBand);
  }

   /* ══════════════════════════════
     7. CONTACT FORM
  ══════════════════════════════ */
(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return; // no contact form on this page → do nothing

  const btnText       = document.getElementById('btnText');
  const btnLoader     = document.getElementById('btnLoader');
  const submitBtn     = document.getElementById('submitBtn');
  const btnNext       = document.getElementById('btnNext');
  const btnBack       = document.getElementById('btnBack');
  const formSuccess   = document.getElementById('formSuccess');
  const progressFill  = document.getElementById('progressFill');
  const stepCurrentEl = document.getElementById('stepCurrent');
  const stepTotalEl   = document.getElementById('stepTotal');

  const EMAILJS_SERVICE_ID  = 'service_je1sqvd';
  const EMAILJS_TEMPLATE_ID = 'template_51rsawi';
  const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwPu2NxwLReS8WOyddezixEbnXWEsFNSd5qvLAJtulaCJ8IJ61K0Jyb6irBktfFsy7H/exec';
  const RECAPTCHA_SITE_KEY = '6LclLGktAAAAAPfi8Y1FG-CtGUINZ_Q3nTo2lp99';
  const RECAPTCHA_ACTION   = 'contact_form_submit';

  function getRecaptchaToken() {
    return new Promise((resolve, reject) => {
      if (typeof grecaptcha === 'undefined') {
        reject(new Error('reCAPTCHA script did not load.'));
        return;
      }
      grecaptcha.ready(() => {
        grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: RECAPTCHA_ACTION })
          .then(resolve)
          .catch(reject);
      });
    });
  }

  const AVAILABLE_TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  const steps = Array.from(form.querySelectorAll('.form-step'));
  let current = 0;
  if (stepTotalEl) stepTotalEl.textContent = steps.length;

  const dateInput  = document.getElementById('preferredDate');
  const timeSelect = document.getElementById('preferredTime');
  let fp = null;

  if (dateInput && window.flatpickr) {
    fp = flatpickr(dateInput, {
      minDate: 'today',
      maxDate: new Date().fp_incr(60),
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'F j, Y (l)',
      disable: [date => (date.getDay() === 0 || date.getDay() === 6)],
      onChange: () => { validateField(dateInput); populateTimes(); }
    });
  }

  function populateTimes() {
    if (!timeSelect) return;
    timeSelect.innerHTML = '<option value="">Select a time</option>';
    AVAILABLE_TIMES.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      const [h, m] = t.split(':');
      const hour12 = ((+h % 12) || 12);
      const ampm = +h < 12 ? 'AM' : 'PM';
      opt.textContent = `${hour12}:${m} ${ampm}`;
      timeSelect.appendChild(opt);
    });
  }

  function validateField(input) {
    const group = input.closest('.form-group');
    if (!group) return true;
    const isValid = input.checkValidity();
    group.classList.toggle('error', !isValid);
    group.classList.toggle('valid', isValid && input.value.trim() !== '');
    let errEl = group.querySelector('.field-error');
    if (!isValid) {
      if (!errEl) { errEl = document.createElement('span'); errEl.className = 'field-error'; group.appendChild(errEl); }
      errEl.textContent = input.validationMessage || 'This field is required.';
    } else if (errEl) { errEl.remove(); }
    return isValid;
  }

  const errorStyle = document.createElement('style');
  errorStyle.textContent = `
    .form-group.error input, .form-group.error select, .form-group.error textarea { border-color: #ef4444 !important; background: #fff5f5 !important; }
    .form-group.valid input, .form-group.valid select, .form-group.valid textarea { border-color: #22c55e !important; }
    .field-error { font-size: 0.78rem; color: #ef4444; margin-top: 0.2rem; font-weight: 500; }
  `;
  document.head.appendChild(errorStyle);

  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => { if (input.closest('.form-group')?.classList.contains('error')) validateField(input); });
    input.addEventListener('change', () => { if (input.closest('.form-group')?.classList.contains('error')) validateField(input); });
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && input.tagName !== 'TEXTAREA') { e.preventDefault(); goNext(); } });
  });

  function validateStep(index) {
    const fields = steps[index].querySelectorAll('input[required], select[required], textarea[required]');
    let allValid = true;
    fields.forEach(f => { if (!validateField(f)) allValid = false; });
    return allValid;
  }

  function showStep(index, shouldScroll = true) {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === index));
    current = index;
    if (progressFill)  progressFill.style.width = `${((index + 1) / steps.length) * 100}%`;
    if (stepCurrentEl) stepCurrentEl.textContent = index + 1;
    btnBack.style.visibility = index === 0 ? 'hidden' : 'visible';
    const isLast = index === steps.length - 1;
    btnNext.style.display   = isLast ? 'none' : 'inline-flex';
    submitBtn.style.display = isLast ? 'inline-flex' : 'none';
    const firstField = steps[index].querySelector('input, select, textarea');
    if (firstField) firstField.focus({ preventScroll: true });
    if (shouldScroll) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function goNext() { if (!validateStep(current)) return; if (current < steps.length - 1) showStep(current + 1); }
  function goBack() { if (current > 0) showStep(current - 1); }

  btnNext.addEventListener('click', goNext);
  btnBack.addEventListener('click', goBack);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateStep(current)) return;

    const privacy = document.getElementById('privacy');
    if (privacy && !privacy.checked) {
      const group = privacy.closest('.form-group');
      let errEl = group?.querySelector('.field-error');
      if (group && !errEl) { errEl = document.createElement('span'); errEl.className = 'field-error'; group.appendChild(errEl); }
      if (errEl) errEl.textContent = 'Please accept the Privacy Policy to continue.';
      return;
    }

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    const data = new FormData(form);
    const payload = {
      first_name: data.get('first_name') || '',
      last_name: data.get('last_name') || '',
      email: data.get('email') || '',
      phone: data.get('phone') || '',
      company: data.get('company') || '',
      service: data.get('service') || '',
      message: data.get('message') || '',
      preferred_date: data.get('preferred_date') || '',
      preferred_time: data.get('preferred_time') || '',
      submitted_at: new Date().toISOString(),
      recaptcha_token: '',
      recaptcha_action: RECAPTCHA_ACTION ,
      page_url: window.location.href
    };

    try {
      const token = await getRecaptchaToken();
      payload.recaptcha_token = token;
      const tokenField = document.getElementById('gRecaptchaToken');
      if (tokenField) tokenField.value = token;

      let verification = { success: true };
      if (GOOGLE_SHEET_WEBHOOK_URL && !GOOGLE_SHEET_WEBHOOK_URL.startsWith('PASTE_')) {
        const sheetRes = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        verification = await sheetRes.json();
      }

      if (!verification.success) {
        console.error('Verification failed:', verification);
        if (verification.reason === 'server_error') {
          alert('Something went wrong saving your message on our end (' + (verification.message || 'unknown error') + '). Please email us directly at info@rethinkingweb.com.');
        } else {
          alert('We could not verify your submission as human. Please try again.');
        }
        return;
      }

      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);

      form.reset();
      form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error', 'valid'));
      form.querySelectorAll('.field-error').forEach(el => el.remove());
      if (fp) fp.clear();
      populateTimes();
      showStep(0, false);

      formSuccess.classList.add('show');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => formSuccess.classList.remove('show'), 6000);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Something went wrong sending your message. Please try again or email us directly at info@rethinkingweb.com.');
    } finally {
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
      submitBtn.disabled = false;
    }
  });

  populateTimes();
  showStep(0, false);
})();
  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll("a[href^='#']").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      if (href === "#") return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

});