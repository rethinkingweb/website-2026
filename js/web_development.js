/* ─────────────────────────────────────────────
   RETHINKINGWEB — Web Development Page JS
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
  document.querySelectorAll('.value-card').forEach(card => revealObserver.observe(card));

  /* ═══ CARD REVEAL — solution/check/stat cards ═══ */
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.solution-card, .check-item, .stat-card, .client-logo').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
    cardObserver.observe(el);
  });

  /* ═══ STAT COUNTER ANIMATION ═══ */
  const statsEl = document.querySelector('.hero__stats');
  if (statsEl) {
    const counterObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animateCounters();
        counterObserver.disconnect();
      }
    }, { threshold: 0.3 });
    counterObserver.observe(statsEl);
  }

  function animateCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
      const raw     = el.textContent.trim();
      const match   = raw.match(/^(\d+)/);
      if (!match) return;

      const target  = parseInt(match[1]);
      const suffix  = el.innerHTML.replace(match[0], '').trim();
      let current   = 0;
      const step    = 16;
      const inc     = target / (1600 / step);

      const timer = setInterval(() => {
        current = Math.min(current + inc, target);
        el.innerHTML = Math.floor(current) + (suffix || '');
        if (current >= target) clearInterval(timer);
      }, step);
    });
  }

  /* ═══ BROWSER GRAPHIC — line shimmer stagger ═══ */
  document.querySelectorAll('.browser-line').forEach((line, i) => {
    line.style.animationDelay = `${i * 0.3}s`;
  });

  /* ═══ TESTIMONIALS SCROLL NAV ═══ */
  const track   = document.getElementById('testiTrack');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');

  if (track && prevBtn && nextBtn) {
    const cardW = () => (track.querySelector('.testi-card')?.offsetWidth ?? 400) + 24;
    prevBtn.addEventListener('click', () => track.scrollBy({ left: -cardW(), behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => track.scrollBy({ left:  cardW(), behavior: 'smooth' }));
  }

  /* ═══ FORM SUBMIT ═══ */
  const submitBtn = document.getElementById('submitBtn');
  const form      = document.getElementById('contactForm');

  submitBtn?.addEventListener('click', () => {
    const firstName = form.querySelector('input[placeholder="John"]');
    const email     = form.querySelector('input[type="email"]');
    const service   = form.querySelector('select');
    let valid = true;

    [firstName, email, service].forEach(el => {
      if (el) el.style.borderColor = '';
    });

    if (!firstName?.value.trim()) { if (firstName) { firstName.style.borderColor = '#ef4444'; valid = false; } }
    if (!email?.value.trim())     { if (email)     { email.style.borderColor     = '#ef4444'; valid = false; } }
    if (!service?.value)          { if (service)   { service.style.borderColor   = '#ef4444'; valid = false; } }

    if (!valid) { showToast('Please fill in the required fields.'); return; }

    submitBtn.textContent = 'Sending…';
    submitBtn.disabled    = true;

    setTimeout(() => {
      submitBtn.textContent    = '✓ Submitted Successfully';
      submitBtn.style.background = '#22c55e';
      showToast('Thank you! We will be in touch shortly.');

      setTimeout(() => {
        submitBtn.textContent    = 'Submit';
        submitBtn.disabled       = false;
        submitBtn.style.background = '';
        form.querySelectorAll('input, textarea').forEach(el => { el.value = ''; el.style.borderColor = ''; });
        if (service) { service.selectedIndex = 0; service.style.borderColor = ''; }
      }, 4000);
    }, 1200);
  });

  /* ═══ TOAST ═══ */
  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  /* ═══ SMOOTH ANCHOR SCROLL ═══ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ═══ HERO BADGE PULSE ═══ */
  // Pulse dot is handled by CSS animation — nothing extra needed

  /* ═══ ACTIVE NAV LINK ═══ */
  // Highlight "Solutions" as active since this is a solutions sub-page
  document.querySelectorAll('.nav__link').forEach(link => {
    if (link.textContent.trim().startsWith('Solutions')) {
      link.style.color = 'var(--orange)';
    }
  });

});