(function () {
  'use strict';

  var page = document.querySelector('.wa-page');
  if (!page) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || page).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || page).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ───────── 1. intro map draws when it scrolls into view ───────── */
  var map = $('#waiMap');
  if (map) {
    if (reduce || !('IntersectionObserver' in window)) map.classList.add('is-on');
    else {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { io.disconnect(); map.classList.add('is-on'); }
      }, { threshold: 0.35 });
      io.observe(map);
    }
  }

  /* ───────── 2. value × feasibility chart ───────── */
  (function () {
    var chart = $('#wasChart'), card = $('#wasCard'), list = $('#wasList'), filters = $('#wasFilters');
    if (!chart) return;

    var DEPT = { Support: 'd-support', Finance: 'd-finance', Sales: 'd-sales', Operations: 'd-ops' };
    var W = [
      { n: 'Inbound order questions',   d: 'Support',    v: 8, f: 9, s: 'Start now',        t: 'go',  why: 'High volume, and the answers already sit in your order system.' },
      { n: 'Overdue invoice follow-up', d: 'Finance',    v: 8, f: 8, s: 'Start now',        t: 'go',  why: 'Clear rules, a fixed schedule and an outcome you can measure.' },
      { n: 'Lead follow-up',            d: 'Sales',      v: 7, f: 8, s: 'Start now',        t: 'go',  why: 'Repeatable steps, with the data already held in your CRM.' },
      { n: 'After-hours calls',         d: 'Support',    v: 6, f: 7, s: 'Pilot next',       t: 'go',  why: 'Valuable where calls go unanswered, and workable once booking rules are written down.' },
      { n: 'Schedule changes',          d: 'Operations', v: 7, f: 6, s: 'Pilot next',       t: 'go',  why: 'Worth doing, but it depends on clean availability and location data.' },
      { n: 'Month-end reconciliation',  d: 'Finance',    v: 7, f: 4, s: 'Prepare first',    t: 'mid', why: 'Matching rules and ledger codes need tidying before an agent can follow them.' },
      { n: 'Contract review',           d: 'Operations', v: 8, f: 2, s: 'Prepare first',    t: 'mid', why: 'High value, but judgment-heavy. An agent can flag clauses while a person decides.' },
      { n: 'Custom pricing quotes',     d: 'Sales',      v: 4, f: 3, s: 'Not yet',          t: 'no',  why: 'The pricing rules live in people\'s heads, so they need writing down first.' },
      { n: 'Complex complaints',        d: 'Support',    v: 3, f: 2, s: 'Keep with people', t: 'no',  why: 'Needs empathy and judgment. An agent can summarise the history for the person handling it.' },
      { n: 'Meeting note summaries',    d: 'Operations', v: 3, f: 8, s: 'Nice to have',     t: 'mid', why: 'Easy to do, but saves little time compared with other workflows.' }
    ];
    W.sort(function (a, b) { return (b.v + b.f) - (a.v + a.f) || b.v - a.v; });
    W.forEach(function (w, i) { w.r = i + 1; });

    var active = 0, dept = 'all';

    chart.insertAdjacentHTML('beforeend', W.map(function (w, i) {
      var left = clamp(w.f * 10, 6, 94), bottom = clamp(w.v * 10, 7, 93);
      return '<button type="button" class="was-b ' + DEPT[w.d] + '" data-i="' + i + '" style="left:' + left + '%;bottom:' + bottom + '%" aria-label="Rank ' + w.r + ': ' + esc(w.n) + ', value ' + w.v + ', feasibility ' + w.f + '">' + w.r + '</button>';
    }).join(''));

    list.innerHTML = W.map(function (w, i) {
      return '<li><button type="button" class="was-item" data-i="' + i + '"><span class="was-num ' + DEPT[w.d] + '">' + w.r + '</span><span>' + esc(w.n) + '</span><span class="was-step">' + esc(w.s) + '</span></button></li>';
    }).join('');

    function show(i) {
      active = i;
      var w = W[i];
      $$('.was-b, .was-item').forEach(function (b) { b.classList.toggle('is-active', +b.getAttribute('data-i') === i); });
      card.innerHTML =
        '<h3>' + w.r + '. ' + esc(w.n) + '</h3>' +
        '<div class="was-meta"><span class="was-chip"><i class="was-k ' + DEPT[w.d] + '"></i> ' + esc(w.d) + '</span><span class="was-chip ' + w.t + '">' + esc(w.s) + '</span></div>' +
        '<p>' + esc(w.why) + '</p>' +
        '<div class="was-bars"><div><span>Value</span><i style="--v:' + (w.v * 10) + '%"></i><b>' + w.v + '/10</b></div><div><span>Feasibility</span><i style="--v:' + (w.f * 10) + '%"></i><b>' + w.f + '/10</b></div></div>';
      card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap');
    }

    function applyFilter() {
      $$('.was-b, .was-item').forEach(function (b) {
        var w = W[+b.getAttribute('data-i')];
        b.classList.toggle('is-dim', !(dept === 'all' || w.d === dept));
      });
    }

    function onPick(e) {
      var b = e.target.closest('[data-i]');
      if (b) show(+b.getAttribute('data-i'));
    }
    chart.addEventListener('click', onPick);
    list.addEventListener('click', onPick);
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-d]');
      if (!b) return;
      dept = b.getAttribute('data-d');
      $$('button', filters).forEach(function (x) {
        var on = x === b;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      applyFilter();
    });
    show(0);
  })();

  /* ───────── 3. process carousel ───────── */
  (function () {
    var track = $('#wapTrack'), bar = $('#wapBar'), prev = $('#wapPrev'), next = $('#wapNext');
    if (!track) return;
    function step() {
      var c = $('.wap-card', track);
      return c ? c.getBoundingClientRect().width + 20 : 340;
    }
    function progress() {
      var max = track.scrollWidth - track.clientWidth;
      var ratio = track.clientWidth / track.scrollWidth;
      var pos = max > 0 ? track.scrollLeft / max : 0;
      bar.style.width = (ratio * 100) + '%';
      bar.style.marginLeft = (pos * (1 - ratio) * 100) + '%';
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', function () { requestAnimationFrame(progress); }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    window.addEventListener('resize', progress);
    progress();
  })();

  /* ───────── 4. time-at-stake estimator ───────── */
  (function () {
    var vol = $('#warVol'), min = $('#warMin'), share = $('#warShare');
    if (!vol) return;
    var out = {
      vol: $('#warVolO'), min: $('#warMinO'), share: $('#warShareO'),
      week: $('#warWeek'), free: $('#warFree'), year: $('#warYear'), keep: $('#warKeep'), bar: $('#warBarA')
    };
    var fmt = function (n) { return Math.round(n).toLocaleString(); };
    var shown = 0, raf = null;

    function tween(to) {
      cancelAnimationFrame(raf);
      if (reduce) { shown = to; out.week.textContent = fmt(to); return; }
      var from = shown, t0 = performance.now();
      (function step(t) {
        var p = Math.min((t - t0) / 400, 1), e = 1 - Math.pow(1 - p, 3);
        shown = from + (to - from) * e;
        out.week.textContent = fmt(shown);
        if (p < 1) raf = requestAnimationFrame(step);
      })(t0);
    }
    function update() {
      var v = +vol.value, m = +min.value, s = +share.value;
      out.vol.textContent = v.toLocaleString();
      out.min.textContent = m;
      out.share.textContent = s + '%';
      var week = v * m / 60, free = week * s / 100;
      tween(week);
      out.free.textContent = fmt(free);
      out.year.textContent = fmt(free * 52);
      out.keep.textContent = fmt(week - free);
      out.bar.style.width = s + '%';
    }
    [vol, min, share].forEach(function (el) { el.addEventListener('input', update); });
    update();
  })();

  /* ───────── 5. kickoff checklist ───────── */
  (function () {
    var list = $('#waxList'), prog = $('#waxProg'), count = $('#waxCount'), note = $('#waxNote');
    if (!list) return;
    var boxes = $$('input', list), C = 163.4;
    var base = note.textContent;
    function update() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      prog.style.strokeDashoffset = C * (1 - n / boxes.length);
      count.textContent = n + '/' + boxes.length;
      note.textContent = n === boxes.length ? 'That is everything we need for a first call.' : base;
    }
    boxes.forEach(function (b) { b.addEventListener('change', update); });
    update();
  })();
})();