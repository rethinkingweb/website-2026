/* operations-agents.js — behaviour for operations-agents.html
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
  // 9.5 -> "9:30"
  function clock(h) {
    var hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    if (mm === 60) { hh += 1; mm = 0; }
    return hh + ':' + (mm < 10 ? '0' : '') + mm;
  }

  /* ───── 2. Without / with toggle ───── */
  (function () {
    var box = $('#opiFlip'); if (!box) return;
    var opts = $$('.opi-opt', box), count = $('#opiCount'), touched = false;
    function set(after) {
      box.classList.toggle('is-after', after);
      opts.forEach(function (o) { var on = (+o.dataset.v === 1) === after; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', on); });
      count.textContent = after ? '0 problems, 5 fixed' : '5 problems';
    }
    opts.forEach(function (o) { o.addEventListener('click', function () { touched = true; set(o.dataset.v === '1'); }); });
    // Flip to the "with agent" view once, shortly after it scrolls into view
    onView(box, function () { setTimeout(function () { if (!touched) set(true); }, reduce ? 0 : 1400); }, 0.5);
  })();

  /* ───── 3. Dispatch map ───── */
  (function () {
    var svg = $('#opmSvg'), tabs = $('#opmTabs'); if (!svg || !tabs) return;
    var techEls = $$('.opm-tech', svg), jobEl = $('#opmJob'), route = $('#opmRoute');
    var cands = $('#opmCands'), result = $('#opmResult'), title = $('#opmTitle'), need = $('#opmNeed');
    var NOW = 11 + 55 / 60; // 11:55

    var TECHS = [
      { n: 'Anil', i: 'AN', x: 110, y: 80,  skills: ['hvac', 'plumbing'] },
      { n: 'Sara', i: 'SA', x: 480, y: 70,  skills: ['electrical', 'hvac'] },
      { n: 'Dev',  i: 'DE', x: 300, y: 270, skills: ['plumbing'], busyUntil: '14:00' },
      { n: 'Mia',  i: 'MI', x: 530, y: 300, skills: ['plumbing', 'electrical'] }
    ];
    var JOBS = [
      { t: 'Burst pipe, urgent', skill: 'plumbing', x: 350, y: 330, window: 1 },
      { t: 'AC not cooling', skill: 'hvac', x: 400, y: 150, window: 2 },
      { t: 'Tripped circuit, office', skill: 'electrical', x: 170, y: 230, window: 2 }
    ];
    var LABEL = { plumbing: 'plumbing', hvac: 'HVAC', electrical: 'electrical' };
    var cur = 0, token = 0;

    TECHS.forEach(function (t, k) {
      techEls[k].setAttribute('transform', 'translate(' + t.x + ' ' + t.y + ')');
      techEls[k].classList.toggle('is-busy', !!t.busyUntil);
    });

    async function run(n) {
      var t = ++token, job = JOBS[n];
      cands.innerHTML = ''; result.hidden = true;
      route.classList.remove('is-drawn'); route.setAttribute('d', 'M0 0');
      techEls.forEach(function (el) { el.classList.remove('is-picked', 'is-out'); });
      jobEl.setAttribute('transform', 'translate(' + job.x + ' ' + job.y + ')');
      title.textContent = job.t;
      need.textContent = 'Needs: ' + LABEL[job.skill] + ' skill' + (job.window === 1 ? ', within the hour' : ', today') + '. Checking ' + TECHS.length + ' technicians.';

      // Score every technician: skill, availability, then travel time on the road grid
      var rows = TECHS.map(function (tech, k) {
        var dist = Math.abs(tech.x - job.x) + Math.abs(tech.y - job.y);
        var r = { k: k, tech: tech, dist: dist, eta: Math.max(8, Math.round(dist / 7)) };
        if (tech.skills.indexOf(job.skill) < 0) { r.out = 'No ' + LABEL[job.skill] + ' skill'; r.em = 'Skipped'; }
        else if (tech.busyUntil) { r.out = 'On a job until ' + tech.busyUntil; r.em = 'Busy'; }
        else { r.em = r.eta + ' min away'; }
        return r;
      });
      var ok = rows.filter(function (r) { return !r.out; }).sort(function (a, b) { return a.eta - b.eta; });
      var no = rows.filter(function (r) { return r.out; }).sort(function (a, b) { return a.dist - b.dist; });
      var best = ok[0];

      await sleep(300);
      var list = ok.concat(no);
      for (var i = 0; i < list.length; i++) {
        if (t !== token) return;
        var r = list[i], li = document.createElement('li');
        if (r.out) { li.className = 'is-out'; techEls[r.k].classList.add('is-out'); }
        li.innerHTML = '<b>' + r.tech.i + '</b><span>' + r.tech.n + '<small>' +
          (r.out || 'Has ' + LABEL[job.skill] + ' skill, available now') + '</small></span><em>' + r.em + '</em>';
        cands.appendChild(li);
        await sleep(380);
      }
      if (t !== token || !best) return;
      await sleep(250);
      cands.children[0].classList.add('is-best');
      techEls[best.k].classList.add('is-picked');

      route.setAttribute('d', 'M' + best.tech.x + ' ' + best.tech.y + ' H' + job.x + ' V' + job.y);
      void route.getBoundingClientRect();
      route.classList.add('is-drawn');

      var start = NOW + best.eta / 60, note = '';
      var closer = no.filter(function (r) { return r.dist < best.dist && r.tech.skills.indexOf(job.skill) > -1; })[0];
      if (closer) note = ' ' + closer.tech.n + ' was closer but is ' + closer.out.toLowerCase() + ', so the agent skipped them.';
      await sleep(700);
      if (t !== token) return;
      result.innerHTML = '<p><strong>' + best.tech.n + ' dispatched.</strong> Customer sent an arrival window of ' +
        clock(start) + ' to ' + clock(start + 0.5) + ', and the job is on ' + best.tech.n + '\'s route.' + note + '</p>';
      result.hidden = false;
    }

    function select(n, focus) {
      cur = n;
      $$('.opm-tab', tabs).forEach(function (b, i) {
        var on = i === n;
        b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      run(n);
    }
    tabs.addEventListener('click', function (e) { var b = e.target.closest('.opm-tab'); if (b) select(+b.dataset.j); });
    tabs.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); select((cur + d + JOBS.length) % JOBS.length, true); }
    });
    onView($('#op-dispatch'), function () { run(0); }, 0.3);
  })();

  /* ───── 4. Re-plan simulator ───── */
  (function () {
    var track = $('#opdTrack'), feed = $('#opdFeed'), events = $('#opdEvents');
    if (!track || !feed) return;
    var C = { hvac: '#3B6FD8', plumb: '#0E9F8E', elec: '#8A5CF6', out: '#D97706' };
    // r = technician row, s = start (hours after 8:00), d = duration in hours
    var BASE = {
      j1: { t: 'Boiler service', c: C.hvac, r: 0, s: 0, d: 2 },
      j2: { t: 'Leak check', c: C.plumb, r: 0, s: 3, d: 1.5 },
      j3: { t: 'AC install', c: C.hvac, r: 1, s: 0.5, d: 3 },
      j4: { t: 'Socket rewire', c: C.elec, r: 1, s: 4.5, d: 1.5 },
      j5: { t: 'Pipe repair', c: C.plumb, r: 2, s: 1, d: 2 },
      j6: { t: 'Job #219 valve swap', c: C.plumb, r: 2, s: 4.5, d: 2 },
      j7: { t: 'Panel upgrade', c: C.elec, r: 3, s: 0, d: 2.5 },
      j8: { t: 'Pump service', c: C.plumb, r: 3, s: 3.5, d: 2 },
      j9: { t: 'Roof AC unit check', c: C.out, r: 3, s: 7, d: 1.5 }
    };
    var EV = {
      sick: {
        off: 0,
        move: { j1: { r: 1, s: 6 }, j2: { r: 2, s: 3 } },
        feed: [
          'Anil marked unavailable at 7:52 from his message to the dispatch line.',
          'Boiler service moved to Sara at 14:00, her first free slot with HVAC skills. Customer sent the new window.',
          'Leak check moved to Dev at 11:00, same morning window kept, so no customer message was needed.',
          'No jobs cancelled. Dispatcher gets a summary of both changes.'
        ]
      },
      part: {
        move: { j6: { gone: true }, j8: { r: 2, s: 4.5 } },
        feed: [
          'Supplier update: the valve for job #219 now arrives tomorrow.',
          'Job #219 moved to Tuesday 9:00 and the customer notified with the reason.',
          'Dev\'s free afternoon filled with the pump service from Mia\'s list, same window kept.',
          'Mia now has an open slot from 11:30 for same-day requests.'
        ]
      },
      storm: {
        move: { j9: { r: 3, s: 2.5 }, j8: { r: 3, s: 4.5 } },
        feed: [
          'Weather alert: storm expected from 15:00. Roof AC unit check flagged as outdoor work.',
          'Roof check brought forward to 10:30, before the storm. Customer asked to confirm access.',
          'Pump service (indoor) shifted to 12:30 to make room. Customer sent the new window.',
          'Mia\'s route updated. No overtime added.'
        ]
      }
    };
    var bars = {}, token = 0;

    Object.keys(BASE).forEach(function (id) {
      var b = document.createElement('div');
      b.className = 'opd-bar'; b.style.setProperty('--c', BASE[id].c);
      track.appendChild(b); bars[id] = b;
    });
    function apply(ev) {
      Object.keys(BASE).forEach(function (id) {
        var base = BASE[id], m = (ev && ev.move[id]) || {}, b = bars[id];
        var r = m.r != null ? m.r : base.r, s = m.s != null ? m.s : base.s, d = base.d;
        b.style.setProperty('--r', r); b.style.setProperty('--s', s); b.style.setProperty('--d', d);
        b.innerHTML = base.t + '<small>' + clock(8 + s) + ' to ' + clock(8 + s + d) + '</small>';
        b.classList.toggle('is-gone', !!m.gone);
        b.classList.toggle('is-moved', !m.gone && (r !== base.r || s !== base.s));
      });
      $$('.opd-names span').forEach(function (n) { n.classList.toggle('is-off', !!ev && ev.off === +n.dataset.r); });
    }
    async function pick(key) {
      var t = ++token, ev = EV[key];
      $$('.opd-ev', events).forEach(function (b) { b.classList.toggle('is-active', b.dataset.e === key); });
      feed.innerHTML = '';
      apply(null);
      await sleep(250);
      if (t !== token) return;
      apply(ev);
      for (var i = 0; i < ev.feed.length; i++) {
        if (t !== token) return;
        var li = document.createElement('li'); li.textContent = ev.feed[i]; feed.appendChild(li);
        await sleep(650);
      }
    }
    function reset() {
      token++;
      $$('.opd-ev', events).forEach(function (b) { b.classList.remove('is-active'); });
      apply(null);
      feed.innerHTML = '<li class="opd-empty">Pick a disruption above.</li>';
    }
    events.addEventListener('click', function (e) {
      var b = e.target.closest('.opd-ev'); if (b) pick(b.dataset.e);
    });
    $('#opdReset').addEventListener('click', reset);
    apply(null);
  })();

  /* ───── 5. Expanding panels ───── */
  (function () {
    var wrap = $('#opwPanels'); if (!wrap) return;
    var panels = $$('.opw-panel', wrap);
    var hover = window.matchMedia('(hover: hover)').matches;
    function open(p) { panels.forEach(function (x) { x.classList.toggle('is-open', x === p); }); }
    panels.forEach(function (p) {
      p.addEventListener('click', function () { open(p); });
      p.addEventListener('focus', function () { open(p); });
      if (hover) p.addEventListener('mouseenter', function () { open(p); });
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(p); } });
    });
  })();

  /* ───── 6. A day on the clock ───── */
  (function () {
    var hand = $('#opcHand'); if (!hand) return;
    var ticks = $('#opcTicks'), marks = $('#opcMarks'), chips = $('#opcChips'), card = $('#opcCard');
    var tTitle = $('#opcEvTitle'), tText = $('#opcEvText'), tTime = $('#opcTime');
    var NS = 'http://www.w3.org/2000/svg';
    var EVENTS = [
      { h: 6, t: 'Day plan built', d: 'The agent checks open jobs, technician availability, skills, parts and travel, then publishes each person\'s route before anyone logs in.' },
      { h: 7.75, t: 'Morning briefings sent', d: 'Each technician gets their job list with customer notes, access details and the parts to pick up on the way out.' },
      { h: 9.33, t: 'Delay caught early', d: 'A job runs long. The agent pushes the next stop back, sends the customer a new arrival window and checks the rest of the route still works.' },
      { h: 12.17, t: 'Parts request raised', d: 'A technician logs low stock. The agent drafts a purchase request in your ERP and sends it for approval before tomorrow\'s jobs are blocked.' },
      { h: 15.5, t: 'Jobs closed out', d: 'Photos, notes and customer sign-off are checked. Complete jobs are closed and billing details passed to accounts. Missing items go back to the technician.' },
      { h: 18, t: 'Tomorrow prepared', d: 'Unscheduled jobs are slotted into tomorrow, conflicts are flagged for the operations manager, and customers get their confirmations.' }
    ];
    var angle = 0, idx = -1, timer = null;
    function pt(h, r) { var a = h / 24 * 2 * Math.PI; return [160 + r * Math.sin(a), 160 - r * Math.cos(a)]; }

    for (var h = 0; h < 24; h++) {
      var a = pt(h, 134), b = pt(h, h % 6 ? 128 : 122), l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]);
      l.setAttribute('class', 'opc-tick' + (h % 6 ? '' : ' is-major'));
      ticks.appendChild(l);
    }
    EVENTS.forEach(function (ev, i) {
      var p = pt(ev.h, 122), c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); c.setAttribute('r', 8); c.setAttribute('class', 'opc-mark');
      c.addEventListener('click', function () { stop(); show(i); });
      marks.appendChild(c);
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'opc-chip'; btn.textContent = clock(ev.h).padStart(5, '0');
      btn.addEventListener('click', function () { stop(); show(i); });
      chips.appendChild(btn);
    });
    var markEls = $$('.opc-mark', marks), chipEls = $$('.opc-chip', chips);

    function show(i) {
      if (i === idx) return;
      idx = i;
      var target = EVENTS[i].h / 24 * 360;
      while (target < angle) target += 360; // always turn forward
      angle = target;
      hand.style.transform = 'rotate(' + angle + 'deg)';
      markEls.forEach(function (m, k) { m.classList.toggle('is-on', k === i); });
      chipEls.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
      tTime.textContent = clock(EVENTS[i].h).padStart(5, '0');
      tTitle.textContent = EVENTS[i].t; tText.textContent = EVENTS[i].d;
      card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap');
    }
    function stop() { clearInterval(timer); timer = null; }
    show(0);
    onView($('#op-day'), function () {
      if (reduce) return;
      timer = setInterval(function () { show((idx + 1) % EVENTS.length); }, 3800);
    }, 0.4);
  })();
})();