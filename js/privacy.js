/* ═══════════════════════════════════════════
   privacy.js — RethinkingWeb Privacy Policy
═══════════════════════════════════════════ */

/* ── Nav scroll effect ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ── Mobile nav elements ── */
const burger    = document.getElementById('navBurger');
const mobileNav = document.getElementById('mobileNav');
const overlay   = document.getElementById('navOverlay');
const closeBtn  = document.getElementById('mobileClose');

function openNav() {
  burger.classList.add('is-open');
  burger.setAttribute('aria-expanded', 'true');
  mobileNav.classList.add('open');
  mobileNav.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeNav() {
  burger.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

burger.addEventListener('click', () => {
  mobileNav.classList.contains('open') ? closeNav() : openNav();
});
closeBtn.addEventListener('click', closeNav);
overlay.addEventListener('click', closeNav);

/* Close on Escape key */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNav();
});

/* ── Mobile accordion (Solutions / Company) ── */
document.querySelectorAll('.mob-accordion__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel  = btn.nextElementSibling;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    /* Close all first */
    document.querySelectorAll('.mob-accordion__btn').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('is-open');
    });

    /* Toggle the clicked one */
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
    }
  });
});

/* ── TOC active highlight on scroll ── */
const sections = document.querySelectorAll('.pp-section[id], .pp-intro-card[id]');
const tocLinks = document.querySelectorAll('.pp-toc nav a');

if (sections.length && tocLinks.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`.pp-toc nav a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px' });

  sections.forEach(s => io.observe(s));
}