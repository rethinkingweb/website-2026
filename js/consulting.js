/* ─────────────────────────────────────────────
   it-consulting.js
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
});
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

/* ═══ NAV DROPDOWNS ═══ */
const dropdowns = document.querySelectorAll('.nav__dropdown');
dropdowns.forEach(drop => {
  const link = drop.querySelector('.nav__link');
  link.addEventListener('click', e => {
    e.preventDefault();
    dropdowns.forEach(d => { if (d !== drop) d.classList.remove('active'); });
    drop.classList.toggle('active');
  });
});
document.addEventListener('click', e => {
  if (!e.target.closest('.nav__dropdown'))
    dropdowns.forEach(d => d.classList.remove('active'));
});

/* ═══ COUNTER ANIMATION ═══ */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step     = target / (duration / 16);
  let current    = 0;
  const timer    = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, 16);
}

/* ═══ INTERSECTION OBSERVER — REVEAL ═══ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ═══ PROCESS STEPS STAGGER ═══ */
const processObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.itc-process__step').forEach((step, i) => {
        setTimeout(() => step.classList.add('visible'), i * 120);
      });
      processObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

const processEl = document.querySelector('.itc-process');
if (processEl) processObserver.observe(processEl);

/* ═══ COUNTER TRIGGER ═══ */
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

const statsEl = document.querySelector('.itc-stats');
if (statsEl) statsObserver.observe(statsEl);

/* ═══ TESTI CARD FADE ═══ */
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.testi-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ${i * 0.08}s ease, transform 0.5s ${i * 0.08}s ease`;
  fadeObserver.observe(el);
});

/* ═══ ACCORDION ═══ */
document.querySelectorAll('.itc-acc-item').forEach(item => {
  const header = item.querySelector('.itc-acc-header');
  header.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // close all
    document.querySelectorAll('.itc-acc-item').forEach(i => i.classList.remove('open'));
    // open clicked if it was closed
    if (!isOpen) item.classList.add('open');
  });
});

/* Open first item by default */
const firstItem = document.querySelector('.itc-acc-item');
if (firstItem) firstItem.classList.add('open');

/* ═══ TESTIMONIALS CAROUSEL ═══ */
const track   = document.getElementById('testimonialsTrack');
const prevBtn = document.getElementById('testiPrev');
const nextBtn = document.getElementById('testiNext');

if (track && prevBtn && nextBtn) {
  const cardWidth = () => (track.querySelector('.testi-card')?.offsetWidth || 400) + 24;
  nextBtn.addEventListener('click', () => track.scrollBy({ left: cardWidth(), behavior: 'smooth' }));
  prevBtn.addEventListener('click', () => track.scrollBy({ left: -cardWidth(), behavior: 'smooth' }));
}

/* ═══ CONTACT FORM ═══ */
const form        = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

if (form) {
  /* Inline error styles */
  const errorStyle = document.createElement('style');
  errorStyle.textContent = `
    .form-group.error input,
    .form-group.error select,
    .form-group.error textarea { border-color: #ef4444 !important; }
    .form-group.valid input,
    .form-group.valid select,
    .form-group.valid textarea { border-color: #22c55e !important; }
    .field-error { font-size: 0.78rem; color: #ef4444; margin-top: 0.2rem; font-weight: 500; }
  `;
  document.head.appendChild(errorStyle);

  function validateField(input) {
    const group   = input.closest('.form-group');
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

  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.form-group')?.classList.contains('error')) validateField(input);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let allValid = true;
    form.querySelectorAll('input[required], select[required], textarea[required]')
      .forEach(f => { if (!validateField(f)) allValid = false; });

    const privacy = document.getElementById('privacy');
    if (privacy && !privacy.checked) {
      allValid = false;
      const group = privacy.closest('.form-group');
      let errEl   = group?.querySelector('.field-error');
      if (group && !errEl) { errEl = document.createElement('span'); errEl.className = 'field-error'; group.appendChild(errEl); }
      if (errEl) errEl.textContent = 'Please accept the Privacy Policy.';
    }

    if (!allValid) return;

    submitBtn.disabled   = true;
    submitBtn.textContent = 'Sending…';

    await new Promise(r => setTimeout(r, 1600));

    submitBtn.textContent = 'Submit →';
    submitBtn.disabled   = false;
    form.reset();
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error', 'valid'));
    form.querySelectorAll('.field-error').forEach(e => e.remove());

    formSuccess.classList.add('show');
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => formSuccess.classList.remove('show'), 6000);
  });
}

/* ═══ SMOOTH SCROLL ═══ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 80,
        behavior: 'smooth'
      });
    }
  });
});