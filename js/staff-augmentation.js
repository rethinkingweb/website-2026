/* ─────────────────────────────────────────────
   staff-augmentation.js
   Shared behaviour for all 5 Staff Augmentation
   service pages:
     • Specialist Staff Augmentation
     • Dedicated Expert Pods
     • SME-on-Demand
     • Fractional & Interim Leadership
     • Tool Experts

   Handles: nav scroll state, mobile drawer, mobile
   accordions, desktop dropdowns/mega-menus (incl. the
   new "Staff Augmentation" menu), scroll reveals,
   stat counters, hero icon stagger, smooth scroll.

   No form logic lives here — service pages send users
   to contact.html#form. Every block is guarded so the
   file is safe to load on any page.
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
     2. MOBILE NAV DRAWER
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

    // Close only on real anchor links, not accordion toggles
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', e => {
        // links that are accordion headers shouldn't close the drawer
        if (!a.classList.contains('mob-accordion__link')) closeNav();
      });
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
  }

  /* ══════════════════════════════
     3. MOBILE ACCORDION
  ══════════════════════════════ */
  document.querySelectorAll('.mob-accordion__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // let the header link navigate; the chevron/button area toggles
      const accordion = btn.closest('.mob-accordion');
      const panel     = accordion.querySelector('.mob-accordion__panel');
      const isOpen    = accordion.classList.contains('open');

      document.querySelectorAll('.mob-accordion').forEach(a => {
        a.classList.remove('open');
        const b = a.querySelector('.mob-accordion__btn');
        if (b) b.setAttribute('aria-expanded', 'false');
        const p = a.querySelector('.mob-accordion__panel');
        if (p) p.style.maxHeight = null;
      });

      if (!isOpen) {
        accordion.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ══════════════════════════════
     4. DESKTOP DROPDOWNS / MEGA-MENUS
        (Solutions, Staff Augmentation,
         Integrations, Company)
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
     5. SCROLL REVEAL
  ══════════════════════════════ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 90);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ══════════════════════════════
     6. HERO ICON CARDS — stagger in
  ══════════════════════════════ */
  const iconObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.sa-icon-card').forEach((card, i) => {
          setTimeout(() => card.classList.add('visible'), i * 80);
        });
        iconObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  const iconGrid = document.querySelector('.sa-hero__icon-grid');
  if (iconGrid) iconObserver.observe(iconGrid);

  /* ══════════════════════════════
     7. STAT COUNTERS
  ══════════════════════════════ */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const duration = 1800;
    const step     = target / (duration / 16);
    let current    = 0;
    const timer    = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current);
    }, 16);
  }

  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  const statsEl = document.querySelector('.sa-stats');
  if (statsEl) statsObserver.observe(statsEl);

  /* ══════════════════════════════
     8. SMOOTH SCROLL for in-page anchors
  ══════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      }
    });
  });

});