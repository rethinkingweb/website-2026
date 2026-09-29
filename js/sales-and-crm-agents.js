/* sales-and-crm-agents.js — behaviour for sales-and-crm-agents.html
   Hero video + FAQ come from agent.js. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); };

  // Run fn once when el scrolls into view
  function onView(el, fn, threshold) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    new IntersectionObserver(function (en, ob) {
      if (en[0].isIntersecting) { ob.disconnect(); fn(); }
    }, { threshold: threshold || 0.3 }).observe(el);
  }

  /* ───── 2. CRM record that fills itself ───── */
  (function () {
    var rec = $('#sciRecord'); if (!rec) return;
    var fields = $$('dd', rec), done = $('#sciDone'), replay = $('#sciReplay'), token = 0;

    async function run() {
      var t = ++token;
      done.classList.remove('is-on');
      fields.forEach(function (d) { d.textContent = ''; d.classList.remove('is-hot', 'is-typing'); });
      await sleep(500);
      for (var i = 0; i < fields.length; i++) {
        var d = fields[i], v = d.dataset.v;
        d.classList.add('is-typing');
        for (var k = 1; k <= v.length; k++) {
          if (t !== token) return;
          d.textContent = v.slice(0, k);
          await sleep(22);
        }
        d.classList.remove('is-typing');
        if (d.dataset.tone === 'hot') d.classList.add('is-hot');
        d.parentNode.classList.remove('is-flash'); void d.parentNode.offsetWidth; d.parentNode.classList.add('is-flash');
        await sleep(260);
      }
      if (t === token) done.classList.add('is-on');
    }
    replay.addEventListener('click', run);
    onView(rec, run, 0.4);
  })();

  /* ───── 3. Pipeline board ───── */
  (function () {
    var board = $('#scpBoard'), log = $('#scpLog'), replay = $('#scpReplay');
    if (!board || !log) return;
    var cols = $$('.scp-col', board);

    var LEADS = {
      a: ['Northwind Logistics', 'Pricing page form'],
      b: ['Acme Dental Group', 'Webinar sign-up'],
      c: ['Brightline Retail', 'Partner referral'],
      d: ['Kestrel Solar', 'Contact form'],
      e: ['Kestrel Solar', 'Contact form, duplicate']
    };
    var EVENTS = [
      { m: 'a', to: 1, t: 'Northwind Logistics enriched and sent a tailored follow-up, 2 minutes after the form.' },
      { m: 'b', to: 1, t: 'Acme Dental sent the webinar recap with a booking link.' },
      { x: 'e', t: 'Duplicate Kestrel Solar record found and merged into one contact.' },
      { m: 'a', to: 2, t: 'Northwind replied. Budget, timeline and decision maker saved to the CRM.' },
      { m: 'd', to: 1, t: 'Kestrel Solar first follow-up sent, reminder set for day 3.' },
      { m: 'a', to: 3, t: 'Discovery call booked on the rep\'s calendar for Thursday 11:00.' },
      { h: 'b', t: 'Acme Dental asked for custom pricing. Handed to a rep with the full thread.' },
      { m: 'c', to: 1, t: 'Brightline Retail referral acknowledged and intro email sent.' }
    ];
    var token = 0;

    function counts() {
      cols.forEach(function (c) { $('h3 b', c).textContent = $$('.scp-card:not(.is-merging)', c).length; });
    }
    function reset() {
      cols.forEach(function (c) { $('.scp-list', c).innerHTML = ''; });
      Object.keys(LEADS).forEach(function (id) {
        var li = document.createElement('li');
        li.className = 'scp-card'; li.dataset.id = id;
        li.innerHTML = '<b>' + LEADS[id][0] + '</b><small>' + LEADS[id][1] + '</small>';
        $('.scp-list', cols[0]).appendChild(li);
      });
      log.innerHTML = ''; counts();
    }
    function addLog(text, cls, n) {
      var li = document.createElement('li');
      if (cls) li.className = cls;
      var mins = 2 + n * 3;
      li.innerHTML = '<time>09:' + (mins < 10 ? '0' : '') + mins + '</time><span>' + text + '</span>';
      log.insertBefore(li, log.firstChild);
    }
    // FLIP: move the card, then animate it from its old spot to the new one
    function move(card, col) {
      var first = card.getBoundingClientRect();
      $('.scp-list', cols[col]).appendChild(card);
      if (reduce) return;
      var last = card.getBoundingClientRect();
      card.classList.add('is-moving');
      card.style.transition = 'none';
      card.style.transform = 'translate(' + (first.left - last.left) + 'px,' + (first.top - last.top) + 'px)';
      void card.offsetWidth;
      card.style.transition = 'transform .7s cubic-bezier(.22,.8,.3,1)';
      card.style.transform = '';
      setTimeout(function () { card.classList.remove('is-moving'); card.style.transition = ''; }, 750);
    }

    async function run() {
      var t = ++token;
      reset();
      await sleep(700);
      for (var i = 0; i < EVENTS.length; i++) {
        if (t !== token) return;
        var e = EVENTS[i];
        if (e.m) { move($('[data-id="' + e.m + '"]', board), e.to); addLog(e.t, '', i); }
        else if (e.x) {
          var dup = $('[data-id="' + e.x + '"]', board);
          dup.classList.add('is-merging'); addLog(e.t, '', i);
          setTimeout(function (el) { return function () { el.remove(); counts(); }; }(dup), reduce ? 0 : 520);
        }
        else if (e.h) { $('[data-id="' + e.h + '"]', board).classList.add('is-human'); addLog(e.t, 'is-human', i); }
        counts();
        await sleep(1500);
      }
      if (t !== token) return;
      addLog('Pipeline up to date. Every touch logged against the contact.', 'is-final', EVENTS.length);
    }

    reset();
    replay.addEventListener('click', run);
    onView(board, run, 0.3);
  })();

  /* ───── 4. Lead score playground ───── */
  (function () {
    var inputs = $$('.scs-sliders input'); if (!inputs.length) return;
    var fill = $('#scsFill'), num = $('#scsNum'), dec = $('#scsDecision'), tiers = $$('#scsTiers li');
    var TEXT = [
      'Nurture: the agent adds this lead to a helpful email sequence and keeps watching for new signals.',
      'Follow up: the agent sends a tailored email, answers questions and tracks every reply.',
      'Route to a rep: the agent sends a meeting link and alerts the owner with a short brief.'
    ];
    var shown = 0, raf = null;

    function update() {
      var score = 0;
      inputs.forEach(function (i) {
        var v = +i.value;
        score += v * parseFloat(i.dataset.w);
        i.style.setProperty('--v', v + '%');
        document.getElementById(i.getAttribute('aria-describedby')).textContent = v;
      });
      score = Math.round(score);
      fill.style.strokeDashoffset = 100 - score;
      var tier = score >= 70 ? 2 : score >= 40 ? 1 : 0;
      tiers.forEach(function (li, k) { li.classList.toggle('is-on', k === tier); });
      dec.textContent = TEXT[tier];
      animateNum(score);
    }
    function animateNum(target) {
      if (reduce) { num.textContent = target; shown = target; return; }
      cancelAnimationFrame(raf);
      (function step() {
        shown += (target - shown) * 0.2;
        if (Math.abs(target - shown) < 0.5) shown = target;
        num.textContent = Math.round(shown);
        if (shown !== target) raf = requestAnimationFrame(step);
      })();
    }
    inputs.forEach(function (i) { i.addEventListener('input', update); });
    // Start the gauge at 0 and sweep up when the section is seen
    fill.style.strokeDashoffset = 100;
    onView($('#sc-score'), update, 0.35);
  })();

  /* ───── 5. Flip cards (click / tap / keyboard) ───── */
  $$('.scf-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var on = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', on);
    });
  });

  /* ───── 6. Scroll timeline ───── */
  (function () {
    var line = $('#sctLine'), fill = $('#sctFill'); if (!line) return;
    var items = $$('.sct-item', line), ticking = false;
    function update() {
      ticking = false;
      var r = line.getBoundingClientRect(), mark = window.innerHeight * 0.6;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (mark - r.top) / r.height));
      fill.style.setProperty('--p', (p * 100) + '%');
      items.forEach(function (it) {
        var ir = it.getBoundingClientRect();
        it.classList.toggle('is-on', reduce || ir.top + ir.height / 2 < mark);
      });
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
  })();
})();