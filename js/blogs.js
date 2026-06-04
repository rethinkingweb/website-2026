/**
 * blogs.js — RethinkingWeb Blog Page
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────
     1. STICKY NAV
  ───────────────────────────────────── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─────────────────────────────────────
     2. MOBILE NAV
  ───────────────────────────────────── */
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

  /* ─────────────────────────────────────
     3. MOBILE ACCORDION
  ───────────────────────────────────── */
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

  /* ─────────────────────────────────────
     4. DESKTOP DROPDOWNS
  ───────────────────────────────────── */
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

  /* ─────────────────────────────────────
     5. SCROLL REVEAL — Blog Cards
  ───────────────────────────────────── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = document.querySelectorAll('.bp-card');

  if (cards.length) {
    if (reducedMotion) {
      cards.forEach(c => c.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const card        = entry.target;
            const visibleList = Array.from(cards).filter(c => c.style.display !== 'none');
            const index       = visibleList.indexOf(card);
            setTimeout(() => card.classList.add('is-visible'), Math.max(0, index * 90));
            revealObserver.unobserve(card);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
      cards.forEach(c => revealObserver.observe(c));
    }
  }

  /* ─────────────────────────────────────
     6. CATEGORY FILTER
  ───────────────────────────────────── */
  const pills      = document.querySelectorAll('.filter-pill');
  const featured   = document.querySelector('.featured-post');
  const emptyState = document.getElementById('blogsEmpty');
  const countEl    = document.getElementById('articleCount');
  const showAllBtn = document.getElementById('showAllBtn');

  if (pills.length && cards.length) {
    function filterCards(category) {
      pills.forEach(p => p.classList.toggle('filter-pill--active', p.dataset.filter === category));

      let visible = 0;
      cards.forEach(card => {
        const match = category === 'all' || card.dataset.category === category;
        if (match) {
          card.style.display = '';
          if (!reducedMotion) {
            card.classList.remove('is-visible');
            setTimeout(() => card.classList.add('is-visible'), 50 * visible);
          }
          visible++;
        } else {
          card.style.display = 'none';
        }
      });

      if (featured) {
        const featMatch = category === 'all' || featured.dataset.category === category;
        featured.style.display = featMatch ? '' : 'none';
        if (featMatch) visible++;
      }

      if (countEl)    countEl.textContent      = visible === 1 ? '1 article' : `${visible} articles`;
      if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
    }

    pills.forEach(pill => pill.addEventListener('click', () => filterCards(pill.dataset.filter)));
    if (showAllBtn) showAllBtn.addEventListener('click', () => filterCards('all'));
    filterCards('all');

    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const hashPill = document.querySelector(`.filter-pill[data-filter="${hash}"]`);
      if (hashPill) setTimeout(() => hashPill.click(), 200);
    }
  }

  /* ─────────────────────────────────────
     7. WHOLE CARD CLICK
  ───────────────────────────────────── */
  cards.forEach(card => {
    const link = card.querySelector('.bp-card__link');
    if (!link) return;
    card.addEventListener('click', e => {
      if (e.target.closest('.bp-card__link')) return;
      window.location.href = link.href;
    });
  });

  if (featured) {
    const featLink = featured.querySelector('.btn');
    if (featLink) {
      featured.style.cursor = 'pointer';
      featured.addEventListener('click', e => {
        if (e.target.closest('.btn')) return;
        window.location.href = featLink.href;
      });
    }
  }

  /* ─────────────────────────────────────
     8. NEWSLETTER
  ───────────────────────────────────── */
  const nlEmail  = document.getElementById('nlEmail');
  const nlSubmit = document.getElementById('nlSubmit');

  if (nlEmail && nlSubmit) {
    const submitNewsletter = () => {
      const email = nlEmail.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nlEmail.style.borderColor = '#ef4444';
        nlEmail.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.15)';
        nlEmail.focus();
        setTimeout(() => { nlEmail.style.borderColor = ''; nlEmail.style.boxShadow = ''; }, 2500);
        return;
      }
      nlSubmit.textContent       = '✓ Subscribed!';
      nlSubmit.style.background  = '#16a34a';
      nlSubmit.style.borderColor = '#16a34a';
      nlSubmit.disabled          = true;
      nlEmail.disabled           = true;
      nlEmail.value              = '';
      nlEmail.placeholder        = "You're on the list 🎉";
      setTimeout(() => {
        nlSubmit.textContent       = 'Subscribe';
        nlSubmit.style.background  = '';
        nlSubmit.style.borderColor = '';
        nlSubmit.disabled          = false;
        nlEmail.disabled           = false;
        nlEmail.placeholder        = 'your@email.com';
      }, 4000);
    };
    nlSubmit.addEventListener('click', submitNewsletter);
    nlEmail.addEventListener('keydown', e => { if (e.key === 'Enter') submitNewsletter(); });
  }

  /* ─────────────────────────────────────
     9. CONTACT FORM
  ───────────────────────────────────── */
  const submitBtn   = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      submitBtn.textContent   = 'Sending…';
      submitBtn.disabled      = true;
      submitBtn.style.opacity = '0.7';
      setTimeout(() => {
        submitBtn.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';
        setTimeout(() => {
          submitBtn.style.display = '';
          submitBtn.style.opacity = '';
          submitBtn.disabled      = false;
          submitBtn.textContent   = 'Submit';
          if (formSuccess) formSuccess.style.display = 'none';
          const form = document.getElementById('contactForm');
          if (form) form.querySelectorAll('input, select, textarea').forEach(i => (i.value = ''));
        }, 5000);
      }, 1200);
    });
  }

  /* ─────────────────────────────────────
     10. THEME TOGGLE
  ───────────────────────────────────── */
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    const saved = localStorage.getItem('rtw-theme');
    if (saved === 'dark') { document.body.classList.add('dark'); themeBtn.textContent = '☀️'; }
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      themeBtn.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('rtw-theme', isDark ? 'dark' : 'light');
    });
  }

  /* ─────────────────────────────────────
     11. SMOOTH SCROLL
  ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

});