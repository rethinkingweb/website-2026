/* ═══════════════════════════════════════════════
   RETHINKINGWEB — Solutions Page JS
═══════════════════════════════════════════════ */

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

  /* ─────────────────────────────────
     3. SOLUTION CARDS — Scroll-in animation
  ───────────────────────────────── */
  const solCards = document.querySelectorAll('.sol-card');

  if (solCards.length > 0 && 'IntersectionObserver' in window) {
    const cardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          // Staggered delay per card
          const index = Array.from(solCards).indexOf(entry.target);
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, index * 80);
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    solCards.forEach(function (card) {
      cardObserver.observe(card);
    });
  } else {
    // Fallback: show all immediately if no IntersectionObserver
    solCards.forEach(function (card) {
      card.classList.add('visible');
    });
  }


  /* ─────────────────────────────────
     4. WHY CARDS — Scroll-in animation
  ───────────────────────────────── */
  const whyCards = document.querySelectorAll('.why-card');

  if (whyCards.length > 0 && 'IntersectionObserver' in window) {
    const whyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const index = Array.from(whyCards).indexOf(entry.target);
          setTimeout(function () {
            entry.target.style.opacity    = '1';
            entry.target.style.transform  = 'translateY(0)';
          }, index * 80);
          whyObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    whyCards.forEach(function (card) {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition= 'opacity 0.6s ease, transform 0.6s ease';
      whyObserver.observe(card);
    });
  }


  /* ─────────────────────────────────
     5. INTRO POINTS — Scroll-in animation
  ───────────────────────────────── */
  const introPoints = document.querySelectorAll('.intro__point');

  if (introPoints.length > 0 && 'IntersectionObserver' in window) {
    const pointObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const index = Array.from(introPoints).indexOf(entry.target);
          setTimeout(function () {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateX(0)';
          }, index * 100);
          pointObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    introPoints.forEach(function (point) {
      point.style.opacity   = '0';
      point.style.transform = 'translateX(20px)';
      point.style.transition= 'opacity 0.5s ease, transform 0.5s ease';
      pointObserver.observe(point);
    });
  }


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

  /* ─────────────────────────────────
     7. SMOOTH SCROLL for anchor links
  ───────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height offset
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });


  /* ─────────────────────────────────
     8. NAV active link highlight
     (highlights current section while scrolling)
  ───────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (sections.length > 0) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id ||
                link.getAttribute('href').includes(id)) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

}); // end 


