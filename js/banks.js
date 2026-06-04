/* ─────────────────────────────────────────────
   BANKS & INSURANCE PAGE – main.js
───────────────────────────────────────────── */

// ── Sticky Nav ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Mobile Nav ──
const burgerBtn   = document.getElementById('burgerBtn');
const mobileNav   = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');

burgerBtn.addEventListener('click', () => mobileNav.classList.add('open'));
mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileNav.classList.remove('open'));
});

// ── Scroll Reveal (.reveal elements) ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Testimonial Card Reveal ──
const testiObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      testiObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.tl-testi-card').forEach(el => testiObserver.observe(el));

// ── Form Submit ──
const submitBtn = document.getElementById('submitBtn');
const toast     = document.getElementById('toast');

submitBtn.addEventListener('click', () => {
  const fname   = document.getElementById('fname').value.trim();
  const email   = document.getElementById('email').value.trim();
  const service = document.getElementById('service').value;

  if (!fname)                         { shakeField('fname');   return; }
  if (!email || !email.includes('@')) { shakeField('email');   return; }
  if (!service)                       { shakeField('service'); return; }

  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.textContent = '✓ Submitted!';
    showToast('🎉 Thanks! We\'ll be in touch shortly.');
    setTimeout(() => {
      document.getElementById('contactForm')
        .querySelectorAll('input, select, textarea')
        .forEach(el => el.value = '');
      submitBtn.textContent = 'Submit →';
      submitBtn.disabled = false;
    }, 2500);
  }, 1200);
});

function shakeField(id) {
  const el = document.getElementById(id);
  el.style.borderColor = '#ef4444';
  el.focus();
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => { el.style.borderColor = ''; el.style.animation = ''; }, 1800);
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Inject shake keyframe ──
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(6px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}`;
document.head.appendChild(style);

// ── Smooth anchor scroll ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});