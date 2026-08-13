/* ─────────────────────────────────────────────
   RETHINKINGWEB — Software Development Page JS
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

  /* ══════════════════════════════
     5. SCROLL REVEAL — value cards
  ══════════════════════════════ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  /* ═══ STAT COUNTER ANIMATION ═══ */
  const statsSection = document.querySelector('.sap-stats');
  if (statsSection) {
    const counterObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        runCounters();
        counterObserver.disconnect();
      }
    }, { threshold: 0.3 });
    counterObserver.observe(statsSection);
  }

  function runCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
      const rawText = el.childNodes[0]?.textContent?.trim() || '';
      const match   = rawText.match(/^(\d+)/);
      if (!match) return;
      const target   = parseInt(match[1]);
      const suffix   = rawText.replace(match[0], '');
      let   current  = 0;
      const duration = 1800;
      const step     = 16;
      const inc      = target / (duration / step);
      const timer = setInterval(() => {
        current = Math.min(current + inc, target);
        el.childNodes[0].textContent = Math.floor(current) + suffix;
        if (current >= target) clearInterval(timer);
      }, step);
    });
  }

  /* ═══ CODE EDITOR ANIMATION ═══ */
  // Cycle through tech stack labels in the code editor
  const techOptions = [
    { tech: "'React'",      backend: "'Node.js'",   db: "'PostgreSQL'" },
    { tech: "'Vue.js'",     backend: "'Python'",    db: "'MongoDB'" },
    { tech: "'Angular'",    backend: "'Java'",      db: "'MySQL'" },
    { tech: "'Next.js'",    backend: "'Go'",        db: "'Redis'" },
  ];
  const codeLines = document.querySelectorAll('.code-indent .code-str');
  if (codeLines.length >= 3) {
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % techOptions.length;
      const opts = techOptions[idx];
      codeLines[0].textContent = opts.tech;
      codeLines[1].textContent = opts.backend;
      codeLines[2].textContent = opts.db;
    }, 3000);
  }

  /* ═══ TESTIMONIALS SCROLL NAV ═══ */
  const track   = document.getElementById('testiTrack');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');

  if (track && prevBtn && nextBtn) {
    const cardW = () => (track.querySelector('.testi-card')?.offsetWidth ?? 400) + 24;
    prevBtn.addEventListener('click', () => track.scrollBy({ left: -cardW(), behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => track.scrollBy({ left:  cardW(), behavior: 'smooth' }));
  }

/* ═══════════════════════════════════════════
   CONTACT FORM — 2-STEP WIZARD + CALENDAR + reCAPTCHA v3
   (merged in from contact.js so integration pages
   don't need a separate contact.js — avoids the
   duplicate mobile-accordion listener conflict)
═══════════════════════════════════════════ */
(function () {
  'use strict';

  const cfForm = document.getElementById('contactForm');
  if (!cfForm) return; // no contact form on this page

  const cfBtnText       = document.getElementById('btnText');
  const cfBtnLoader     = document.getElementById('btnLoader');
  const cfSubmitBtn     = document.getElementById('submitBtn');
  const cfBtnNext       = document.getElementById('btnNext');
  const cfBtnBack       = document.getElementById('btnBack');
  const cfFormSuccess   = document.getElementById('formSuccess');
  const cfProgressFill  = document.getElementById('progressFill');
  const cfStepCurrentEl = document.getElementById('stepCurrent');
  const cfStepTotalEl   = document.getElementById('stepTotal');

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
  const cfSteps = Array.from(cfForm.querySelectorAll('.form-step'));
  let cfCurrent = 0;
  if (cfStepTotalEl) cfStepTotalEl.textContent = cfSteps.length;

  const cfDateInput  = document.getElementById('preferredDate');
  const cfTimeSelect = document.getElementById('preferredTime');
  let cfFp = null;

  if (cfDateInput && window.flatpickr) {
    cfFp = flatpickr(cfDateInput, {
      minDate: 'today',
      maxDate: new Date().fp_incr(60),
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'F j, Y (l)',
      disable: [date => (date.getDay() === 0 || date.getDay() === 6)],
      onChange: () => { validateCfField(cfDateInput); populateCfTimes(); }
    });
  }

  function populateCfTimes() {
    if (!cfTimeSelect) return;
    cfTimeSelect.innerHTML = '<option value="">Select a time</option>';
    AVAILABLE_TIMES.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      const [h, m] = t.split(':');
      const hour12 = ((+h % 12) || 12);
      const ampm = +h < 12 ? 'AM' : 'PM';
      opt.textContent = `${hour12}:${m} ${ampm}`;
      cfTimeSelect.appendChild(opt);
    });
  }

  function validateCfField(input) {
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

  const cfErrorStyle = document.createElement('style');
  cfErrorStyle.textContent = `
    .form-group.error input, .form-group.error select, .form-group.error textarea { border-color: #ef4444 !important; background: #fff5f5 !important; }
    .form-group.valid input, .form-group.valid select, .form-group.valid textarea { border-color: #22c55e !important; }
    .field-error { font-size: 0.78rem; color: #ef4444; margin-top: 0.2rem; font-weight: 500; }
  `;
  document.head.appendChild(cfErrorStyle);

  cfForm.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => validateCfField(input));
    input.addEventListener('input', () => { if (input.closest('.form-group')?.classList.contains('error')) validateCfField(input); });
    input.addEventListener('change', () => { if (input.closest('.form-group')?.classList.contains('error')) validateCfField(input); });
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && input.tagName !== 'TEXTAREA') { e.preventDefault(); goCfNext(); } });
  });

  function validateCfStep(index) {
    const fields = cfSteps[index].querySelectorAll('input[required], select[required], textarea[required]');
    let allValid = true;
    fields.forEach(f => { if (!validateCfField(f)) allValid = false; });
    return allValid;
  }

  function showCfStep(index, shouldScroll = true) {
    cfSteps.forEach((s, i) => s.classList.toggle('is-active', i === index));
    cfCurrent = index;
    if (cfProgressFill)  cfProgressFill.style.width = `${((index + 1) / cfSteps.length) * 100}%`;
    if (cfStepCurrentEl) cfStepCurrentEl.textContent = index + 1;
    cfBtnBack.style.visibility = index === 0 ? 'hidden' : 'visible';
    const isLast = index === cfSteps.length - 1;
    cfBtnNext.style.display   = isLast ? 'none' : 'inline-flex';
    cfSubmitBtn.style.display = isLast ? 'inline-flex' : 'none';
    const firstField = cfSteps[index].querySelector('input, select, textarea');
    if (firstField) firstField.focus({ preventScroll: true });
    if (shouldScroll) cfForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function goCfNext() { if (!validateCfStep(cfCurrent)) return; if (cfCurrent < cfSteps.length - 1) showCfStep(cfCurrent + 1); }
  function goCfBack() { if (cfCurrent > 0) showCfStep(cfCurrent - 1); }

  cfBtnNext.addEventListener('click', goCfNext);
  cfBtnBack.addEventListener('click', goCfBack);

  cfForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateCfStep(cfCurrent)) return;

    const privacy = document.getElementById('privacy');
    if (privacy && !privacy.checked) {
      const group = privacy.closest('.form-group');
      let errEl = group?.querySelector('.field-error');
      if (group && !errEl) { errEl = document.createElement('span'); errEl.className = 'field-error'; group.appendChild(errEl); }
      if (errEl) errEl.textContent = 'Please accept the Privacy Policy to continue.';
      return;
    }

    cfSubmitBtn.disabled = true;
    cfBtnText.style.display = 'none';
    cfBtnLoader.style.display = 'inline';

    const data = new FormData(cfForm);
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
      recaptcha_action: RECAPTCHA_ACTION,
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

      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, cfForm);

      cfFormSuccess.classList.add('show');
      cfFormSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => cfFormSuccess.classList.remove('show'), 6000);

      try {
        if (cfFp) cfFp.clear();
        cfForm.reset();
        cfForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('error', 'valid'));
        cfForm.querySelectorAll('.field-error').forEach(el => el.remove());
        populateCfTimes();
        showCfStep(0, false);
      } catch (cleanupErr) {
        console.warn('Post-submit UI reset error (message was still sent):', cleanupErr);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Something went wrong sending your message. Please try again or email us directly at info@rethinkingweb.com.');
    } finally {
      cfBtnText.style.display = 'inline';
      cfBtnLoader.style.display = 'none';
      cfSubmitBtn.disabled = false;
    }
  });

  populateCfTimes();
  showCfStep(0, false);
})();
  /* ═══ TOAST ═══ */
  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  /* ═══ SMOOTH ANCHOR SCROLL ═══ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id     = anchor.getAttribute('href');
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ═══ ACTIVE NAV HIGHLIGHT ═══ */
  document.querySelectorAll('.nav__link').forEach(link => {
    if (link.textContent.trim().startsWith('Solutions')) {
      link.style.color = 'var(--orange)';
    }
  });

  /* ═══ ICON CARDS — hover tilt micro-effect ═══ */
  document.querySelectorAll('.sd-icon-card').forEach(card => {
    card.addEventListener('mouseenter', () => { card.style.transition = 'all 0.2s ease'; });
    card.addEventListener('mouseleave', () => { card.style.transition = 'all 0.3s ease'; });
  });

  /* ═══ FOCUS CHECKLIST — animate in ═══ */
  const checklistObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.sd-focus__check').forEach((item, i) => {
          item.style.opacity = '0';
          item.style.transform = 'translateX(-12px)';
          item.style.transition = `opacity 0.4s ease ${i * 0.1}s, transform 0.4s ease ${i * 0.1}s`;
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, 100 + i * 100);
        });
        checklistObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const focusCta = document.querySelector('.sd-focus__cta');
  if (focusCta) checklistObserver.observe(focusCta);

  /* ═══ CLIENT LOGOS — stagger ═══ */
  document.querySelectorAll('.client-logo').forEach((logo, i) => {
    logo.style.transitionDelay = `${i * 0.06}s`;
  });

});
/* ── FAQ accordion (pillar page) ── */
document.querySelectorAll('.sap-faq__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.sap-faq__item');
    const open = item.classList.contains('open');
    document.querySelectorAll('.sap-faq__item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.sap-faq__q').setAttribute('aria-expanded', 'false');
    });
    if (!open) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});
