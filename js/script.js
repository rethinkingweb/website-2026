/* ─────────────────────────────────────────────
   RethinkingWeb — script.js  (fixed)
───────────────────────────────────────────── */

// ── Counter Animation ──
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current);
  }, 16);
}

// ── Intersection Observer for animations ──
const observerOptions = { threshold: 0.15 };

// Counter observer
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

const statsEl = document.querySelector('.hero__stats');
if (statsEl) counterObserver.observe(statsEl);

// Pillar fade-in observer
const pillarObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
      pillarObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.pillar').forEach(p => pillarObserver.observe(p));

// Generic fade-in for cards
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.solution-card, .case-card, .industry-card, .testi-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ${i * 0.06}s ease, transform 0.5s ${i * 0.06}s ease`;
  fadeObserver.observe(el);
});

// ── Contact form ──
// The homepage contact form is now the 2-step wizard handled by js/home-contact.js
// (calendar booking + reCAPTCHA v3 + EmailJS + Google Sheet). The old placeholder
// submit handler was removed from here so it doesn't clash with the real one.

// ── Smooth scroll for anchors ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Cursor glow effect (desktop) ──
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9999;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    top: 0; left: 0;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });
}

// ── Solutions dropdown ──
const solutionsToggle = document.getElementById('solutionsToggle');
const solutionsDropdown = document.getElementById('solutionsDropdown');

if (solutionsToggle && solutionsDropdown) {
  solutionsToggle.addEventListener('click', function (e) {
    e.preventDefault();
    solutionsDropdown.classList.toggle('active');
  });

  document.addEventListener('click', function (e) {
    if (
      !solutionsDropdown.contains(e.target) &&
      !solutionsToggle.contains(e.target)
    ) {
      solutionsDropdown.classList.remove('active');
    }
  });
}
// ── Nav dropdowns — hover with leave-delay + mobile click ──
const dropdowns = document.querySelectorAll('.nav__dropdown');
dropdowns.forEach(dropdown => {
  let leaveTimer = null;

  dropdown.addEventListener('mouseenter', () => {
    if (window.innerWidth > 1024) {
      clearTimeout(leaveTimer);
      dropdowns.forEach(d => d !== dropdown && d.classList.remove('active'));
      dropdown.classList.add('active');
    }
  });
  dropdown.addEventListener('mouseleave', () => {
    if (window.innerWidth > 1024) {
      leaveTimer = setTimeout(() => dropdown.classList.remove('active'), 180);
    }
  });

  const toggle = dropdown.querySelector('.nav__link');
  if (!toggle) return;
  toggle.addEventListener('click', function (e) {
    if (window.innerWidth <= 1024) {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('active');
      dropdowns.forEach(d => d.classList.remove('active'));
      if (!isOpen) dropdown.classList.add('active');
    }
  });
});
document.addEventListener('click', function (e) {
  dropdowns.forEach(dropdown => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove('active');
  });
});

// ── Clients & Reviews section ──
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initScrollReveal() {
    const cards = document.querySelectorAll('.review-card[data-aos]');
    if (!cards.length) return;
    if (prefersReducedMotion) { cards.forEach(card => card.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Array.from(cards).indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('is-visible'), index * 120);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    cards.forEach(card => observer.observe(card));
  }

  function initCountUp() {
    const statEls = document.querySelectorAll('.count-up');
    if (!statEls.length || prefersReducedMotion) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCount(entry.target); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    statEls.forEach(el => {
      el.dataset.target = el.textContent.trim();
      el.textContent = '0';
      observer.observe(el);
    });
  }

  function animateCount(el) {
    const target  = parseFloat(el.dataset.target);
    const isFloat = el.dataset.target.includes('.');
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = eased * target;
      el.textContent = isFloat ? current.toFixed(1) : Math.floor(current).toString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = isFloat ? target.toFixed(1) : target.toString();
    }
    requestAnimationFrame(step);
  }

  function initTickerTouch() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;
    track.addEventListener('touchstart', () => {
      track.style.animationPlayState = 'paused';
    }, { passive: true });
    track.addEventListener('touchend', () => {
      setTimeout(() => { track.style.animationPlayState = 'running'; }, 1200);
    }, { passive: true });
  }

  function initStatTilt() {
    if (prefersReducedMotion) return;
    document.querySelectorAll('.review-stat').forEach(stat => {
      stat.addEventListener('mousemove', (e) => {
        const rect    = stat.getBoundingClientRect();
        const rotateX = ((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * -6;
        const rotateY = ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) *  6;
        stat.style.transform = `translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      stat.addEventListener('mouseleave', () => { stat.style.transform = ''; });
    });
  }

  function init() {
    initScrollReveal();
    initCountUp();
    initTickerTouch();
    initStatTilt();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

// ── Testimonials: clone cards for seamless loop ──
document.addEventListener('DOMContentLoaded', function () {
  const track = document.getElementById('testiTrack');
  if (!track) return;

  const cards = Array.from(track.children);
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  if (cards[0]) {
    const cardWidth  = cards[0].offsetWidth;
    const gap        = 20;
    const totalWidth = (cardWidth + gap) * cards.length;
    track.style.setProperty('--scroll-width', totalWidth + 'px');
  }
});

// ── 3D Tilt on hover ──
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ── Staggered fade-in for client cards ──
document.querySelectorAll('.client-card').forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease, box-shadow 0.4s, border-color 0.3s';
});
setTimeout(() => {
  document.querySelectorAll('.client-card').forEach((el, i) => {
    setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, i * 80);
  });
}, 100);

// ── Fade-in on scroll ──
const scrollFadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
      scrollFadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

// ── Sticky Nav ──
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// ── Mobile Nav ──
const burger    = document.getElementById('navBurger');
const mobileNav = document.getElementById('mobileNav');
const overlay   = document.getElementById('navOverlay');
const closeBtn  = document.getElementById('mobileClose');

if (burger && mobileNav && overlay && closeBtn) {
  function openMobileNav() {
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    overlay.classList.add('active');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('active');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', () => {
    mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  closeBtn.addEventListener('click', closeMobileNav);
  overlay.addEventListener('click', closeMobileNav);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileNav(); });
}

// ── Mobile accordion ──
const accordionBtns = document.querySelectorAll('.mob-accordion__btn');
accordionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const panel  = btn.nextElementSibling;
    if (!panel) return;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    accordionBtns.forEach(b => b.setAttribute('aria-expanded', 'false'));
    document.querySelectorAll('.mob-accordion__panel').forEach(p => {
      p.classList.remove('is-open');
      p.style.maxHeight = null;
    });

    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// ── Stat pill counter ──
function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const sup    = el.querySelector('sup') ? el.querySelector('sup').outerHTML : '';
  let current  = 0;
  const inc    = Math.ceil(target / 55);
  const timer  = setInterval(() => {
    current = Math.min(current + inc, target);
    el.innerHTML = current + sup;
    if (current >= target) clearInterval(timer);
  }, 28);
}

const statsObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.stat-pill__num').forEach(countUp);
      statsObs.disconnect();
    }
  });
}, { threshold: 0.4 });

const heroPillStats = document.querySelector('.hero__stats');
if (heroPillStats) statsObs.observe(heroPillStats);

// ── Scroll-reveal for service cards ──
const revealStyle = document.createElement('style');
revealStyle.textContent = `
  @keyframes cardReveal {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(revealStyle);

const svcCards = document.querySelectorAll('.svc-card:not(.svc-card--cta)');
const cardObs  = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.animation = `cardReveal 0.55s ${i * 0.07}s ease both`;
      cardObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
svcCards.forEach(c => { c.style.opacity = '0'; cardObs.observe(c); });

// ── EmailJS contact form ──  (kept: only binds if a #contact-form element exists)
const contactFormEmailJS = document.getElementById('contact-form');
if (contactFormEmailJS) {
  contactFormEmailJS.addEventListener('submit', function (e) {
    e.preventDefault();
    emailjs.sendForm('service_aeb042h', 'YOUR_TEMPLATE_ID', this)
      .then(() => {
        alert('Message sent successfully!');
      }, (error) => {
        alert('Failed to send message');
        console.log(error);
      });
  });
}


/* ════════════════════════════════════════════════════════════════
   RethinkingWeb — Homepage contact form
   2-step wizard + calendar booking + reCAPTCHA v3 + EmailJS + Google Sheet

   Self-contained IIFE: all variables are scoped locally, so this never
   collides with the top-level `const form` / `const nav` etc. in script.js.
   Drop this file in your /js folder next to script.js.
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return; // no wizard form on this page → do nothing

  const btnText       = document.getElementById('btnText');
  const btnLoader     = document.getElementById('btnLoader');
  const submitBtn     = document.getElementById('submitBtn');
  const btnNext       = document.getElementById('btnNext');
  const btnBack       = document.getElementById('btnBack');
  const formSuccess   = document.getElementById('formSuccess');
  const progressFill  = document.getElementById('progressFill');
  const stepCurrentEl = document.getElementById('stepCurrent');
  const stepTotalEl   = document.getElementById('stepTotal');

  /* ── EmailJS (same IDs as your contact page) ── */
  const EMAILJS_SERVICE_ID  = 'service_je1sqvd';
  const EMAILJS_TEMPLATE_ID = 'template_51rsawi';

  /* ── Google Sheet webhook (Apps Script Web App URL — same as contact page) ── */
  const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwPu2NxwLReS8WOyddezixEbnXWEsFNSd5qvLAJtulaCJ8IJ61K0Jyb6irBktfFsy7H/exec';

  /* ── reCAPTCHA v3 (invisible) ── */
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

  /* ── Business hours offered per day (24h format) ── */
  const AVAILABLE_TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  const steps = Array.from(form.querySelectorAll('.form-step'));
  let current = 0;
  if (stepTotalEl) stepTotalEl.textContent = steps.length;

  /* ── Calendar (Flatpickr) ── */
  const dateInput  = document.getElementById('preferredDate');
  const timeSelect = document.getElementById('preferredTime');
  let fp = null;

  if (dateInput && window.flatpickr) {
    fp = flatpickr(dateInput, {
      minDate: 'today',
      maxDate: new Date().fp_incr(60), // bookable up to 60 days out
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'F j, Y (l)',
      disable: [
        date => (date.getDay() === 0 || date.getDay() === 6) // no weekends
      ],
      onChange: () => {
        validateField(dateInput);
        populateTimes();
      }
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
      if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'field-error';
        group.appendChild(errEl);
      }
      errEl.textContent = input.validationMessage || 'This field is required.';
    } else if (errEl) {
      errEl.remove();
    }
    return isValid;
  }

  const errorStyle = document.createElement('style');
  errorStyle.textContent = `
    .form-group.error input,
    .form-group.error select,
    .form-group.error textarea {
      border-color: #ef4444 !important;
      background: #fff5f5 !important;
    }
    .form-group.valid input,
    .form-group.valid select,
    .form-group.valid textarea {
      border-color: #22c55e !important;
    }
    .field-error {
      font-size: 0.78rem;
      color: #ef4444;
      margin-top: 0.2rem;
      font-weight: 500;
    }
  `;
  document.head.appendChild(errorStyle);

  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.form-group')?.classList.contains('error')) validateField(input);
    });
    input.addEventListener('change', () => {
      if (input.closest('.form-group')?.classList.contains('error')) validateField(input);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && input.tagName !== 'TEXTAREA') {
        e.preventDefault();
        goNext();
      }
    });
  });

  function validateStep(index) {
    const fields = steps[index].querySelectorAll('input[required], select[required], textarea[required]');
    let allValid = true;
    fields.forEach(f => { if (!validateField(f)) allValid = false; });
    return allValid;
  }

  function showStep(index) {
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

    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function goNext() {
    if (!validateStep(current)) return;
    if (current < steps.length - 1) showStep(current + 1);
  }

  function goBack() {
    if (current > 0) showStep(current - 1);
  }

  btnNext.addEventListener('click', goNext);
  btnBack.addEventListener('click', goBack);

  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validateStep(current)) return;

    const privacy = document.getElementById('privacy');
    if (privacy && !privacy.checked) {
      const group = privacy.closest('.form-group');
      let errEl = group?.querySelector('.field-error');
      if (group && !errEl) {
        errEl = document.createElement('span');
        errEl.className = 'field-error';
        group.appendChild(errEl);
      }
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
      recaptcha_action: RECAPTCHA_ACTION
    };

    try {
      // 1) Fresh reCAPTCHA v3 token for this submission
      const token = await getRecaptchaToken();
      payload.recaptcha_token = token;
      const tokenField = document.getElementById('gRecaptchaToken');
      if (tokenField) tokenField.value = token;

      // 2) Send to Apps Script webhook FIRST — it verifies the token
      //    server-side, logs the row to your Sheet, and returns { success }.
      let verification = { success: true }; // default-open if no webhook set

      if (GOOGLE_SHEET_WEBHOOK_URL && !GOOGLE_SHEET_WEBHOOK_URL.startsWith('PASTE_')) {
        const sheetRes = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        verification = await sheetRes.json();
      }

      if (!verification.success) {
        alert('We could not verify your submission as human. Please try again.');
        return;
      }

      // 3) Verified → send the notification email via EmailJS
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);

      form.reset();
      form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error', 'valid'));
      form.querySelectorAll('.field-error').forEach(el => el.remove());
      if (fp) fp.clear();
      populateTimes();
      showStep(0);

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
  showStep(0);
})();