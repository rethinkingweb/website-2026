/* ─────────────────────────────────────────────
   TRANSPORTATION LOGISTICS PAGE JS
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
  /* ── Reveal on scroll ── */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(function (el) { revealObs.observe(el); });

  /* ── Testimonial cards ── */
  var cardObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        cardObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".tl-testi-card").forEach(function (el) { cardObs.observe(el); });

  /* ── Stats counter animation ── */
  function animateCount(el) {
    var target = parseInt(el.dataset.target, 10);
    var suffix = el.dataset.suffix || "";
    var steps = 80;
    var interval = 18;
    var increment = target / steps;
    var current = 0;
    var timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current) + suffix;
    }, interval);
  }

  var statsObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.querySelectorAll(".tl-stat-num").forEach(function (el) { animateCount(el); });
        statsObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });

  var statsGrid = document.querySelector(".tl-stats-grid");
  if (statsGrid) statsObs.observe(statsGrid);

  /* ── Form validation ── */
  var submitBtn = document.getElementById("submitBtn");
  var toast = document.getElementById("toast");
  var toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 4000);
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function setError(id, hasError) {
    var fg = document.getElementById("fg-" + id);
    if (!fg) return !hasError;
    if (hasError) { fg.classList.add("error"); } else { fg.classList.remove("error"); }
    return !hasError;
  }

  function clearError(id) {
    var fg = document.getElementById("fg-" + id);
    if (fg) fg.classList.remove("error");
  }

  ["fname", "lname", "company", "email", "phone", "service"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener("input",  function () { clearError(id); });
      el.addEventListener("change", function () { clearError(id); });
    }
  });

  if (submitBtn) {
    submitBtn.addEventListener("click", function () {
      var fname   = document.getElementById("fname").value.trim();
      var lname   = document.getElementById("lname").value.trim();
      var company = document.getElementById("company").value.trim();
      var email   = document.getElementById("email").value.trim();
      var phone   = document.getElementById("phone").value.trim();
      var service = document.getElementById("service").value;

      var valid = true;
      if (!setError("fname",   fname.length === 0))   valid = false;
      if (!setError("lname",   lname.length === 0))   valid = false;
      if (!setError("company", company.length === 0)) valid = false;
      if (!setError("email",   !isValidEmail(email))) valid = false;
      if (!setError("phone",   phone.length < 7))     valid = false;
      if (!setError("service", service === ""))        valid = false;

      if (!valid) {
        showToast("Please fill in all required fields.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Submit &#8594;";
        document.getElementById("contactForm").querySelectorAll("input, select, textarea").forEach(function (el) {
          el.value = "";
        });
        showToast("Message sent! We will be in touch soon.");
      }, 1600);
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll("a[href^='#']").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      if (!href || href === "#") return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

});