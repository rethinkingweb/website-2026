/* ─────────────────────────────────────────────
   contact.js — RethinkingWeb Contact Page
───────────────────────────────────────────── */

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


/* ═══ REVEAL ON SCROLL ═══ */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ═══ CONTACT FORM ═══ */
const form      = document.getElementById('contactForm');
const btnText   = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

/* Live validation helper */
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

/* Add inline error styles dynamically */
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

/* Validate on blur */
form.querySelectorAll('input, select, textarea').forEach(input => {
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => {
    if (input.closest('.form-group')?.classList.contains('error')) {
      validateField(input);
    }
  });
});

/* Submit */
form.addEventListener('submit', async e => {
  e.preventDefault();

  /* Validate all required fields */
  const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
  let allValid = true;
  fields.forEach(f => { if (!validateField(f)) allValid = false; });

  /* Check privacy checkbox */
  const privacy = document.getElementById('privacy');
  if (!privacy.checked) {
    allValid = false;
    let errEl = privacy.closest('.form-group')?.querySelector('.field-error');
    const group = privacy.closest('.form-group');
    if (group && !errEl) {
      errEl = document.createElement('span');
      errEl.className = 'field-error';
      group.appendChild(errEl);
    }
    if (errEl) errEl.textContent = 'Please accept the Privacy Policy to continue.';
  }

  if (!allValid) return;

  /* Simulate submit (replace with real endpoint) */
  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline';

  await new Promise(r => setTimeout(r, 1800)); /* simulated delay */

  btnText.style.display = 'inline';
  btnLoader.style.display = 'none';
  submitBtn.disabled = false;

  form.reset();
  form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error', 'valid'));
  form.querySelectorAll('.field-error').forEach(e => e.remove());

  formSuccess.classList.add('show');
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  setTimeout(() => formSuccess.classList.remove('show'), 6000);
});

/* ═══ SMOOTH SCROLL FOR ANCHOR LINKS ═══ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});