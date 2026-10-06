/* ─────────────────────────────────────────────
   CAREERS PAGE
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

    // Close on link click
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
        const b = a.querySelector('.mob-accordion__btn');
        if (b) b.setAttribute('aria-expanded', 'false');
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

  /* ══════════════════════════════
     5. BENEFIT CARDS — stagger reveal
  ══════════════════════════════ */
  const benefitCards = document.querySelectorAll('.benefit-card[data-animate]');

  if ('IntersectionObserver' in window && benefitCards.length) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 100);
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    benefitCards.forEach(card => cardObserver.observe(card));
  } else {
    benefitCards.forEach(card => card.classList.add('visible'));
  }

  /* ══════════════════════════════
     6. POSITION FILTER TABS
  ══════════════════════════════ */
  const filterBtns    = document.querySelectorAll('.filter-btn');
  const positionCards = document.querySelectorAll('.position-card');
  const emptyState    = document.getElementById('positionsEmpty');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      positionCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
        if (match) visibleCount++;
      });

      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    });
  });

  /* ══════════════════════════════
     7. CHECK ITEMS — stagger reveal
  ══════════════════════════════ */
  const checkItems = document.querySelectorAll('.check-item');

  if ('IntersectionObserver' in window && checkItems.length) {
    const checkObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
          }, i * 100);
          checkObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    checkItems.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-16px)';
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color var(--trans), box-shadow var(--trans)';
      checkObserver.observe(item);
    });
  }

  /* ══════════════════════════════
     8. APPLICATION FORM
        4 steps · reCAPTCHA v3 · Google Sheet + Drive (CV) · EmailJS
  ══════════════════════════════ */
  (function () {
    'use strict';

    const form = document.getElementById('contactForm');
    if (!form) return;

    const btnText       = document.getElementById('btnText');
    const btnLoader     = document.getElementById('btnLoader');
    const submitBtn     = document.getElementById('submitBtn');
    const btnNext       = document.getElementById('btnNext');
    const btnBack       = document.getElementById('btnBack');
    const formSuccess   = document.getElementById('formSuccess');
    const progressFill  = document.getElementById('progressFill');
    const stepCurrentEl = document.getElementById('stepCurrent');
    const stepTotalEl   = document.getElementById('stepTotal');

    const EMAILJS_SERVICE_ID       = 'service_je1sqvd';
    const EMAILJS_TEMPLATE_ID      = 'template_51rsawi';
    const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwPu2NxwLReS8WOyddezixEbnXWEsFNSd5qvLAJtulaCJ8IJ61K0Jyb6irBktfFsy7H/exec';
    const RECAPTCHA_SITE_KEY       = '6LclLGktAAAAAPfi8Y1FG-CtGUINZ_Q3nTo2lp99';
    const RECAPTCHA_ACTION         = 'contact_form_submit';

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

    const steps = Array.from(form.querySelectorAll('.form-step'));
    let current = 0;
    if (stepTotalEl) stepTotalEl.textContent = steps.length;

    /* ── Validation ── */
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
      .form-group.error input, .form-group.error select, .form-group.error textarea { border-color: #ef4444 !important; background: #fff5f5 !important; }
      .form-group.valid input, .form-group.valid select, .form-group.valid textarea { border-color: #22c55e !important; }
      .field-error { font-size: 0.78rem; color: #ef4444; margin-top: 0.2rem; font-weight: 500; }
    `;
    document.head.appendChild(errorStyle);

    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('blur',   () => validateField(input));
      input.addEventListener('input',  () => { if (input.closest('.form-group')?.classList.contains('error')) validateField(input); });
      input.addEventListener('change', () => { if (input.closest('.form-group')?.classList.contains('error')) validateField(input); });
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

    /* ── Step navigation ── */
    function showStep(index, userAction = true) {
      steps.forEach((s, i) => s.classList.toggle('is-active', i === index));
      current = index;

      if (progressFill)  progressFill.style.width = `${((index + 1) / steps.length) * 100}%`;
      if (stepCurrentEl) stepCurrentEl.textContent = index + 1;

      btnBack.style.visibility = index === 0 ? 'hidden' : 'visible';

      const isLast = index === steps.length - 1;
      btnNext.style.display   = isLast ? 'none' : 'inline-flex';
      submitBtn.style.display = isLast ? 'inline-flex' : 'none';

      // Only focus / scroll when the user moves between steps, never on page load
      if (userAction) {
        const firstField = steps[index].querySelector('input, select, textarea');
        if (firstField) firstField.focus({ preventScroll: true });
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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

    /* ── Reset UI after success ── */
    function resetFormUI() {
      form.reset();
      form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error', 'valid'));
      form.querySelectorAll('.field-error').forEach(el => el.remove());

      const dz = document.getElementById('dropzone');
      const dt = document.getElementById('dropzoneText');
      const fm = document.getElementById('fileMsg');
      if (dz) dz.classList.remove('has-file');
      if (dt) dt.innerHTML = 'Drop your CV here or <strong>browse</strong>';
      if (fm) fm.textContent = '';

      showStep(0, false);

      formSuccess.classList.add('show');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => formSuccess.classList.remove('show'), 6000);
    }

    /* ── Submit ── */
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

      const data = new FormData(form);

      // Honeypot: bots fill this field. Fake success and send nothing anywhere.
      if (data.get('fax_number')) { resetFormUI(); return; }

      submitBtn.disabled = true;
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline';

      const payload = {
        form_type: 'career',
        first_name: data.get('first_name') || '',
        last_name: data.get('last_name') || '',
        email: data.get('email') || '',
        phone: data.get('phone') || '',
        service: data.get('service') || '',               // Position
        work_type: data.get('work_type') || '',
        currently_employed: data.get('currently_employed') || '',
        notice_period: data.get('notice_period') || '',
        current_ctc: data.get('current_ctc') || '',
        expected_ctc: data.get('expected_ctc') || '',
        linkedin: data.get('linkedin') || '',
        website: '',
        submitted_at: new Date().toISOString(),
        recaptcha_token: '',
        recaptcha_action: RECAPTCHA_ACTION,
        page_url: window.location.href
      };

      const resumeInput = document.getElementById('resumeInput');
      const resumeLink  = document.getElementById('resumeLink');
      let saved = false;

      try {
        // 1) reCAPTCHA
        const token = await getRecaptchaToken();
        payload.recaptcha_token = token;
        const tokenField = document.getElementById('gRecaptchaToken');
        if (tokenField) tokenField.value = token;

        // 2) Read CV as base64 (sent to Apps Script, saved in Google Drive)
        const file = resumeInput && resumeInput.files[0];
        if (file) {
          payload.resume_name   = file.name;
          payload.resume_mime   = file.type || 'application/octet-stream';
          payload.resume_base64 = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload  = () => res(r.result.split(',')[1]);
            r.onerror = () => rej(new Error('Could not read the CV file.'));
            r.readAsDataURL(file);
          });
        }

        // 3) Google Sheet (Career tab) + Drive
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
            alert('Something went wrong saving your application on our end (' + (verification.message || 'unknown error') + '). Please email us directly at info@rethinkingweb.com.');
          } else {
            alert('We could not verify your submission as human. Please try again.');
          }
          return;
        }
        saved = true; // application is stored from this point on

               // 4) Notification email: small explicit params only (no file, no base64)
        try {
          const mailParams = {
            first_name:         payload.first_name,
            last_name:          payload.last_name,
            email:              payload.email,
            phone:              payload.phone,
            service:            payload.service,
            work_type:          payload.work_type,
            currently_employed: payload.currently_employed,
            notice_period:      payload.notice_period,
            current_ctc:        payload.current_ctc,
            expected_ctc:       payload.expected_ctc,
            linkedin:           payload.linkedin,
            resume_link:        verification.resume_url || '',
            page_url:           payload.page_url,
            submitted_at:       payload.submitted_at
          };
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, mailParams);
        } catch (mailErr) {
          console.error('EmailJS failed (application WAS saved):', mailErr, mailErr && mailErr.status, mailErr && mailErr.text);
        }

        resetFormUI();

      } catch (err) {
        console.error('Submission error:', err);
        alert(saved
          ? 'Your application was received, but we hit a display error. No need to resubmit.'
          : 'Something went wrong sending your application. Please try again or email us directly at info@rethinkingweb.com.');
      } finally {
        if (resumeInput) resumeInput.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
      }
    });

    showStep(0, false);
  })();

  /* ══════════════════════════════
     9. CV DROPZONE (name, size & type check, drag state)
  ══════════════════════════════ */
  (function () {
    const input = document.getElementById('resumeInput');
    const zone  = document.getElementById('dropzone');
    const text  = document.getElementById('dropzoneText');
    const msg   = document.getElementById('fileMsg');
    if (!input || !zone || !text || !msg) return;

    const original = text.innerHTML;

    function check() {
      msg.textContent = '';
      const f = input.files[0];
      if (!f) {
        zone.classList.remove('has-file');
        text.innerHTML = original;
        return;
      }
      const okType = /\.(pdf|doc|docx)$/i.test(f.name);
      if (!okType || f.size > 4 * 1024 * 1024) {
        msg.textContent = !okType ? 'Please attach a PDF, DOC or DOCX file.' : 'File is larger than 4 MB.';
        input.value = '';
        zone.classList.remove('has-file');
        text.innerHTML = original;
        return;
      }
      zone.classList.add('has-file');
      text.textContent = f.name + ' (' + (f.size / 1024 / 1024).toFixed(2) + ' MB)';
    }

    input.addEventListener('change', check);
    ['dragenter', 'dragover'].forEach(ev => zone.addEventListener(ev, () => zone.classList.add('is-drag')));
    ['dragleave', 'drop'].forEach(ev => zone.addEventListener(ev, () => zone.classList.remove('is-drag')));
  })();

  /* ══════════════════════════════
     10. "APPLY NOW" PRESELECTS THE POSITION
  ══════════════════════════════ */
  document.querySelectorAll('.position-card .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.closest('.position-card')?.querySelector('.position-card__title')?.textContent.trim();
      const sel = document.querySelector('#contactForm select[name="service"]');
      if (!title || !sel) return;
      const opt = Array.from(sel.options).find(o => o.text.trim() === title);
      if (opt) sel.value = opt.value;
    });
  });

  /* ══════════════════════════════
     11. SMOOTH SCROLL for anchor links
  ══════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = (nav?.offsetHeight || 80) + 20;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ══════════════════════════════
     12. POSITION CARDS — slide in on scroll
  ══════════════════════════════ */
  const positionCardsAll = document.querySelectorAll('.position-card');

  if ('IntersectionObserver' in window && positionCardsAll.length) {
    const posObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
          }, i * 80);
          posObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    positionCardsAll.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateX(-20px)';
      card.style.transition = 'opacity 0.45s ease, transform 0.45s ease, border-color var(--trans), box-shadow var(--trans)';
      posObserver.observe(card);
    });
  }

});




