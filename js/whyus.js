/* ─────────────────────────────────────────────
   WHY US PAGE — JavaScript
   Handles: Nav scroll, Mobile menu, Pillar
   animations, Counter animation, Form
   validation, Toast notification
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
     3. PILLAR CARDS — scroll reveal
  ══════════════════════════════ */
  const pillars = document.querySelectorAll('[data-animate], .pillar');

  if ('IntersectionObserver' in window) {
    const pillarObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger each card
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 120);
          pillarObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    pillars.forEach(el => pillarObserver.observe(el));
  } else {
    // Fallback for no IntersectionObserver
    pillars.forEach(el => el.classList.add('visible'));
  }


  /* ══════════════════════════════
     4. STAT COUNTERS — animate on scroll
  ══════════════════════════════ */
  const statNums = document.querySelectorAll('.stat-num');

  const animateCounter = (el) => {
    // Extract the numeric target from text (ignores + and %)
    const rawText = el.textContent;
    const target  = parseFloat(rawText.replace(/[^0-9.]/g, ''));
    const suffix  = el.querySelector('.stat-plus')?.textContent || '';
    const duration = 1800;
    const steps    = 60;
    const stepTime = duration / steps;
    let current    = 0;

    const timer = setInterval(() => {
      current += target / steps;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      // Keep existing child elements (stat-plus span), just update text node
      const textNode = [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
      if (textNode) {
        textNode.textContent = Number.isInteger(target)
          ? Math.round(current)
          : current.toFixed(0);
      }
    }, stepTime);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNums.forEach(el => counterObserver.observe(el));
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


  /* ══════════════════════════════
     6. SMOOTH SCROLL for anchor links
  ══════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = nav.offsetHeight + 20;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ══════════════════════════════
     7. CHECK ITEMS — stagger reveal
  ══════════════════════════════ */
  const checkItems = document.querySelectorAll('.check-item');

  if ('IntersectionObserver' in window) {
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
     8. PARTNER CARDS — stagger reveal
  ══════════════════════════════ */
//   const partnerCards = document.querySelectorAll('.partner-card');

//   if ('IntersectionObserver' in window) {
//     const partnerObserver = new IntersectionObserver((entries) => {
//       entries.forEach((entry, i) => {
//         if (entry.isIntersecting) {
//           setTimeout(() => {
//             entry.target.style.opacity = '1';
//             entry.target.style.transform = 'translateY(0)';
//           }, i * 80);
//           partnerObserver.unobserve(entry.target);
//         }
//       });
//     }, { threshold: 0.1 });

//     partnerCards.forEach(card => {
//       card.style.opacity = '0';
//       card.style.transform = 'translateY(20px)';
//       card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color var(--trans), box-shadow var(--trans)';
//       partnerObserver.observe(card);
//     });
//   }

});