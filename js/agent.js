(function () {
  var page = document.querySelector('.ag-page');
  if (!page) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── 1. Hero video (.agh) ───────── */
  var video = page.querySelector('.agh-video');
  if (video) {
    if (reduce) {
      video.removeAttribute('autoplay');
      video.pause();
    }
    video.addEventListener('error', function () { video.style.display = 'none'; });
  }
  /* ───────── 11. FAQ (.agf): one answer open at a time ───────── */
  var faqItems = [].slice.call(page.querySelectorAll('.agf-item'));
  faqItems.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqItems.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

/* ───────── 4. Agent hub (.agb): auto-scrolling marquee + pastel highlight ───────── */
  var track = page.querySelector('#agbTrack');
  if (track) {
    // clone all cards once so the loop is seamless (CSS animates -50%)
    if (!reduce) {
      [].slice.call(track.children).forEach(function (card) {
        var clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('tabindex', '-1');
        track.appendChild(clone);
      });
    }

    var hubCards = [].slice.call(track.querySelectorAll('.agb-card'));
    function clearHub() { hubCards.forEach(function (c) { c.classList.remove('is-on'); }); }
    hubCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () { clearHub(); card.classList.add('is-on'); });
      card.addEventListener('mouseleave', function () { card.classList.remove('is-on'); });
      card.addEventListener('focus',      function () { clearHub(); card.classList.add('is-on'); });
      card.addEventListener('blur',       function () { card.classList.remove('is-on'); });
      card.addEventListener('click',      function () { clearHub(); card.classList.add('is-on'); });
      card.addEventListener('touchstart', function () { clearHub(); card.classList.add('is-on'); }, { passive: true });
    });
  }
/* ───────── 5. SERVICES (ags) — ACCORDION ───────── */
(function () {
  var section = document.getElementById('ag-services');
  if (!section) return;
  var triggers = section.querySelectorAll('.ags-trigger');

  function setOpen(btn, open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.getElementById(btn.getAttribute('aria-controls')).classList.toggle('is-open', open);
  }

  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var willOpen = btn.getAttribute('aria-expanded') !== 'true';
      triggers.forEach(function (b) { setOpen(b, false); }); // close the others
      setOpen(btn, willOpen);
    });
  });
})();
  /* ───────── 3. Agent tabs (.age): Frontline / Scheduling / Accounts / Signals ───────── */
  var ent = page.querySelector('#agEnt');
  if (ent) {
    var tabs   = [].slice.call(ent.querySelectorAll('[role="tab"]'));
    var panels = [].slice.call(ent.querySelectorAll('[role="tabpanel"]'));
    var tabRow = ent.querySelector('.age-tabs');

    function selectTab(i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
      });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
      if (focus) tabs[i].focus();
      if (tabs[i].scrollIntoView && tabRow.scrollWidth > tabRow.clientWidth) {
        tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(i, false); });
      tab.addEventListener('keydown', function (e) {
        var n = tabs.length, next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % n;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + n) % n;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = n - 1;
        if (next !== null) { e.preventDefault(); selectTab(next, true); }
      });
    });
  }
})();