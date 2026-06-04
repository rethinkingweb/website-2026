/* ─────────────────────────────────────────────
   RETHINKINGWEB — Enterprise Airtable Managed Services JS
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


  /* ═══ UNIVERSAL REVEAL OBSERVER ═══ */
 const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.value-card').forEach(card => revealObserver.observe(card));

  /* ═══ STAT COUNTER ANIMATION ═══ */
  const statsSection = document.querySelector('.cs-stats');
  if (statsSection) {
    const counterObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { runCounters(); counterObserver.disconnect(); }
    }, { threshold: 0.3 });
    counterObserver.observe(statsSection);
  }

  function runCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
      const rawText  = el.childNodes[0]?.textContent?.trim() || '';
      const match    = rawText.match(/^(\d+)/);
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

  /* ═══ AIRTABLE VIEW CYCLE ═══ */
  const views = document.querySelectorAll('.at-view');
  if (views.length) {
    let activeIdx = 0;
    setInterval(() => {
      views.forEach(v => v.classList.remove('av--active'));
      activeIdx = (activeIdx + 1) % views.length;
      views[activeIdx].classList.add('av--active');
    }, 2000);
  }

  /* ═══ AIRTABLE ROW STATUS CYCLE ═══ */
  const tagConfigs = [
    { el: document.getElementById('tag1'), states: ['✓ Done', '⏳ Active', '◎ Review'], classes: ['', 'yellow', 'blue'] },
    { el: document.getElementById('tag2'), states: ['⏳ Active', '◎ Review', '✓ Done'], classes: ['yellow', 'blue', ''] },
    { el: document.getElementById('tag3'), states: ['◎ Review', '✓ Done', '⏳ Active'], classes: ['blue', '', 'yellow'] },
    { el: document.getElementById('tag4'), states: ['✓ Done', '⏳ Active', '◎ Review'], classes: ['', 'yellow', 'blue'] },
  ];
  let tagIdx = 0;
  setInterval(() => {
    tagIdx = (tagIdx + 1) % 3;
    tagConfigs.forEach(cfg => {
      if (!cfg.el) return;
      cfg.el.textContent = cfg.states[tagIdx];
      cfg.el.className = 'at-cell at-cell--tag ' + cfg.classes[tagIdx];
    });
  }, 2800);

  /* ═══ TESTIMONIALS SCROLL NAV ═══ */
  const track   = document.getElementById('testiTrack');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  if (track && prevBtn && nextBtn) {
    const cardW = () => (track.querySelector('.testi-card')?.offsetWidth ?? 400) + 24;
    prevBtn.addEventListener('click', () => track.scrollBy({ left: -cardW(), behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => track.scrollBy({ left:  cardW(), behavior: 'smooth' }));
  }

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

  /* ═══ FOCUS CHECKLIST ANIMATION ═══ */
  const checklistObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.cs-focus__check').forEach((item, i) => {
          item.style.opacity = '0';
          item.style.transform = 'translateX(-12px)';
          item.style.transition = `opacity 0.4s ease ${i * 0.1}s, transform 0.4s ease ${i * 0.1}s`;
          setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'translateX(0)'; }, 100 + i * 100);
        });
        checklistObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const focusCta = document.querySelector('.cs-focus__cta');
  if (focusCta) checklistObserver.observe(focusCta);

  /* ═══ CLIENT LOGOS STAGGER ═══ */
  document.querySelectorAll('.client-logo').forEach((logo, i) => {
    logo.style.transitionDelay = `${i * 0.06}s`;
  });
 /* ══════════════════════════════
     7. CONTACT FORM
  ══════════════════════════════ */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn      = contactForm.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent      = '✓ Message Sent!';
      btn.style.background = '#10b981';
      btn.disabled         = true;
      setTimeout(() => {
        btn.textContent      = original;
        btn.style.background = '';
        btn.disabled         = false;
        contactForm.reset();
      }, 3000);
    });
  }

});