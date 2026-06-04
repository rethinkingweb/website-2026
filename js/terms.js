/* ─────────────────────────────────────────────
   TERMS & CONDITIONS PAGE JS
───────────────────────────────────────────── */

(function () {
  "use strict";

  /* ── Nav scroll effect ── */
  var nav = document.getElementById("nav");

  function onScroll() {
    if (window.scrollY > 40) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
    updateActiveTOC();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── Mobile Nav ── */
  var burgerBtn  = document.getElementById("burgerBtn");
  var mobileNav  = document.getElementById("mobileNav");
  var mobileClose = document.getElementById("mobileClose");

  if (burgerBtn) {
    burgerBtn.addEventListener("click", function () {
      mobileNav.classList.add("open");
    });
  }
  if (mobileClose) {
    mobileClose.addEventListener("click", function () {
      mobileNav.classList.remove("open");
    });
  }
  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("open");
      });
    });
  }

  /* ── TOC active link on scroll ── */
  var sections = document.querySelectorAll(".terms-block");
  var tocLinks = document.querySelectorAll(".toc-link");

  function updateActiveTOC() {
    var scrollPos = window.scrollY + 120;
    var current = "";

    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) {
        current = sec.id;
      }
    });

    tocLinks.forEach(function (link) {
      link.classList.remove("active");
      var href = link.getAttribute("href");
      if (href === "#" + current) {
        link.classList.add("active");
      }
    });
  }

  /* ── Smooth scroll for TOC links ── */
  tocLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || href === "#") return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ── Fade-in blocks on scroll ── */
  var blockObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        blockObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".terms-block").forEach(function (el, i) {
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition = "opacity 0.5s ease " + (i * 0.05) + "s, transform 0.5s ease " + (i * 0.05) + "s";
    blockObserver.observe(el);
  });

  /* ── Also fade in the CTA ── */
  var cta = document.querySelector(".terms-cta");
  if (cta) {
    cta.style.opacity = "0";
    cta.style.transform = "translateY(18px)";
    cta.style.transition = "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s";
    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          ctaObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    ctaObserver.observe(cta);
  }

}());