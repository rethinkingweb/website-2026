/* ─────────────────────────────────────────────
   RETHINKINGWEB — About Us Page Scripts
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

  /* ══════════════════════════════
     6. COUNTER ANIMATION — stats
  ══════════════════════════════ */
  const statsData = [
    { value: 10,  suffix: '+' },
    { value: 98,  suffix: '%' },
    { value: 698, suffix: ''  },
    { value: 3,   suffix: ''  },
  ];

  function animateCounter(card, target, suffix) {
    const numEl    = card.querySelector('.stat-num');
    const duration = 1500;
    let startTime  = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - (1 - progress) * (1 - progress);
      const current  = Math.floor(eased * target);
      numEl.innerHTML = suffix
        ? `${current}<span class="stat-plus">${suffix}</span>`
        : `${current}`;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-card').forEach((card, i) => {
          const { value, suffix } = statsData[i] || { value: 0, suffix: '' };
          setTimeout(() => animateCounter(card, value, suffix), i * 150);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsGrid = document.querySelector('.stats-grid');
  if (statsGrid) statsObserver.observe(statsGrid);

  /* ══════════════════════════════
     7. CONTACT FORM
  ══════════════════════════════ */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', () => {
      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
    });
  }

  /* ══════════════════════════════
     8. STORY IMAGES — fade-in
  ══════════════════════════════ */
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        imgObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.story-img').forEach(img => {
    img.style.opacity    = '0';
    img.style.transform  = 'translateY(20px)';
    img.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    imgObserver.observe(img);
  });

  /* ══════════════════════════════
     9. NAV — highlight active page
  ══════════════════════════════ */
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav__link').forEach(link => {
    if (link.getAttribute('href') === currentPath) link.classList.add('active');
  });

});