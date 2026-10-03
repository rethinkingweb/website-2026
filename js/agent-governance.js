(function () {
  'use strict';

  var page = document.querySelector('.gv-page');
  if (!page) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || page).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || page).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ───────── 1. boundary field: agents bounce off the edge of their permissions ───────── */
  (function () {
    var zone = $('#gviZone'), field = $('#gviField');
    if (!zone) return;
    var N = 6, D = 14, dots = [], running = false, last = 0, lastFlash = 0;

    function size() { return { w: zone.clientWidth, h: zone.clientHeight }; }

    function init() {
      var s = size();
      for (var i = 0; i < N; i++) {
        var el = document.createElement('span');
        el.className = 'gvi-dot';
        zone.appendChild(el);
        var a = Math.random() * Math.PI * 2, sp = 38 + Math.random() * 34;
        dots.push({ el: el, x: 20 + Math.random() * (s.w - 40), y: 36 + Math.random() * (s.h - 56), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
      }
      draw();
    }
    function draw() {
      dots.forEach(function (d) { d.el.style.transform = 'translate(' + d.x.toFixed(1) + 'px,' + d.y.toFixed(1) + 'px)'; });
    }
    function flash(x, y) {
      var now = performance.now();
      if (now - lastFlash < 1400) return;
      lastFlash = now;
      zone.classList.add('is-hit');
      setTimeout(function () { zone.classList.remove('is-hit'); }, 260);
      var t = document.createElement('span');
      t.className = 'gvi-x';
      t.textContent = 'Blocked and logged';
      var s = size();
      t.style.left = clamp(x - 40, 4, s.w - 130) + 'px';
      t.style.top = clamp(y - 26, 28, s.h - 24) + 'px';
      zone.appendChild(t);
      setTimeout(function () { t.remove(); }, 1000);
    }
    function tick(t) {
      if (!running) return;
      var dt = Math.min((t - last) / 1000, 0.05); last = t;
      var s = size();
      dots.forEach(function (d) {
        d.x += d.vx * dt; d.y += d.vy * dt;
        var hit = false;
        if (d.x < 0) { d.x = 0; d.vx = Math.abs(d.vx); hit = true; }
        if (d.x > s.w - D) { d.x = s.w - D; d.vx = -Math.abs(d.vx); hit = true; }
        if (d.y < 30) { d.y = 30; d.vy = Math.abs(d.vy); hit = true; }
        if (d.y > s.h - D) { d.y = s.h - D; d.vy = -Math.abs(d.vy); hit = true; }
        if (hit && Math.random() < 0.35) flash(d.x, d.y);
      });
      draw();
      requestAnimationFrame(tick);
    }
    function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(tick); }
    function stop() { running = false; }

    init();
    if (reduce || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }, { threshold: 0.2 }).observe(field);
  })();

  /* ───────── 2. layer rings ───────── */
  (function () {
    var tabs = $$('#gvlTabs .gvl-tab'), rings = $$('#gvlStage .gvl-ring'), detail = $('#gvlDetail');
    if (!detail) return;
    var L = [
      { t: 'Permissions: what the agent can reach',
        p: 'Each agent gets its own access to specific systems, records and fields. Anything outside that scope is simply out of reach, however the agent is asked.',
        b: ['Separate access for each agent and each tool', 'Read-only by default, write access only where the job needs it', 'Sensitive fields can be masked'] },
      { t: 'Guardrails: what it can say and do',
        p: 'Instructions, limits and checks shape every reply and action before it leaves the agent, so it stays within your policies and tone.',
        b: ['Answers drawn from approved sources', 'Output validated before it is sent', 'Action limits and a list of things it must never do'] },
      { t: 'Approvals: a person decides what matters',
        p: 'You choose which actions need sign-off. The agent pauses with the full context and carries on only after a decision.',
        b: ['Limits by amount, customer, vendor or topic', 'The approver sees the agent\'s work and suggested action', 'Anything uncertain goes to a person, not a guess'] },
      { t: 'Audit trail: a record of every run',
        p: 'Each run is logged with what the agent saw, decided, called and changed, and who approved it. Nothing happens off the record.',
        b: ['Searchable by agent, record and date', 'Errors traced to a cause and fixed', 'Evidence for your own reviews and audits'] }
    ];

    function show(k, focus) {
      tabs.forEach(function (t, i) {
        var on = i === k;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
        if (on && focus) t.focus();
      });
      rings.forEach(function (r) { r.classList.toggle('is-on', +r.getAttribute('data-k') === k); });
      var d = L[k];
      detail.innerHTML = '<h3>' + esc(d.t) + '</h3><p>' + esc(d.p) + '</p><ul>' + d.b.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
      detail.classList.remove('is-swap'); void detail.offsetWidth; detail.classList.add('is-swap');
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, nx = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nx = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nx = (i - 1 + n) % n;
        if (nx !== null) { e.preventDefault(); show(nx, true); }
      });
    });
    rings.forEach(function (r) {
      r.style.cursor = 'pointer';
      r.addEventListener('click', function () { show(+r.getAttribute('data-k')); });
    });
    show(0);
  })();

  /* ───────── 3. permission matrix ───────── */
  (function () {
    var table = $('#gvpTable'), sum = $('#gvpSum');
    if (!table) return;
    var tools = ['Read records', 'Update tickets', 'Send messages', 'Issue refunds', 'Post to ledger'];
    var rows = [
      { n: 'Frontline Agent',   s: [2, 2, 2, 1, 0] },
      { n: 'Scheduling Agent',  s: [2, 2, 1, 0, 0] },
      { n: 'Accounts Agent',    s: [2, 1, 2, 1, 1] },
      { n: 'Signals Agent',     s: [2, 0, 1, 0, 0] }
    ];
    var NAMES = ['Blocked', 'Needs approval', 'Allowed'], ICON = ['fa-ban', 'fa-user-check', 'fa-check'];

    table.innerHTML =
      '<thead><tr><th scope="col">Agent</th>' + tools.map(function (t) { return '<th scope="col">' + esc(t) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r, ri) {
        return '<tr><th scope="row">' + esc(r.n) + '</th>' + r.s.map(function (_, ci) {
          return '<td><button type="button" class="gvp-cell" data-r="' + ri + '" data-c="' + ci + '"></button></td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody>';

    function paint(b) {
      var r = +b.getAttribute('data-r'), c = +b.getAttribute('data-c'), v = rows[r].s[c];
      b.className = 'gvp-cell s' + v;
      b.innerHTML = '<i class="fas ' + ICON[v] + '"></i> ' + NAMES[v];
      b.setAttribute('aria-label', rows[r].n + ', ' + tools[c] + ': ' + NAMES[v] + '. Select to change.');
    }
    function total() {
      var n = [0, 0, 0], all = 0;
      rows.forEach(function (r) { r.s.forEach(function (v) { n[v]++; all++; }); });
      sum.innerHTML = '<b>' + n[2] + '</b> of ' + all + ' permissions are allowed, <b>' + n[1] + '</b> need approval and <b>' + n[0] + '</b> are blocked.';
    }
    $$('.gvp-cell', table).forEach(paint);
    total();
    table.addEventListener('click', function (e) {
      var b = e.target.closest('.gvp-cell');
      if (!b) return;
      var r = +b.getAttribute('data-r'), c = +b.getAttribute('data-c');
      rows[r].s[c] = (rows[r].s[c] + 1) % 3;
      paint(b); total();
    });
  })();

  /* ───────── 4. stamp test ───────── */
  (function () {
    var prompts = $('#gvgPrompts'), list = $('#gvgChecks'), why = $('#gvgWhy'), stamp = $('#gvgStamp');
    if (!prompts) return;
    var LAYERS = ['Permissions', 'Guardrails', 'Approvals', 'Audit trail'];
    var S = [
      { stop: -1, v: 'ok',   word: 'Answered', why: 'The answer comes from the approved knowledge base, so the agent replies straight away and logs the conversation.' },
      { stop: 2,  v: 'wait', word: 'Needs approval', why: 'The amount is above the refund limit, so the agent pauses and sends your finance lead the order history and a suggested action.' },
      { stop: 0,  v: 'stop', word: 'Blocked', why: 'This agent has no access to other customers\' records. The request is refused and the attempt is logged.' },
      { stop: 1,  v: 'stop', word: 'Blocked', why: 'Instructions inside a customer message cannot change the agent\'s rules. The request is refused and flagged for review.' }
    ];
    var token = 0, btns = $$('.gvg-p', prompts);

    function row(i, state, icon) {
      var li = list.children[i];
      li.className = state;
      $('i', li).className = 'fas ' + icon;
    }
    async function run(k) {
      var my = ++token, s = S[k];
      list.innerHTML = LAYERS.map(function (n) { return '<li><i class="fas fa-circle"></i> ' + n + '</li>'; }).join('');
      why.textContent = ''; stamp.hidden = true;
      await wait(350);
      for (var i = 0; i < 3; i++) {
        if (my !== token) return;
        row(i, 'is-run', 'fa-spinner fa-spin-pulse');
        await wait(650);
        if (my !== token) return;
        if (i === s.stop) {
          row(i, s.v === 'wait' ? 'is-wait' : 'is-stop', s.v === 'wait' ? 'fa-user-clock' : 'fa-xmark');
          for (var j = i + 1; j < 3; j++) row(j, 'is-skip', 'fa-minus');
          break;
        }
        row(i, 'is-pass', 'fa-check');
      }
      if (my !== token) return;
      row(3, 'is-run', 'fa-spinner fa-spin-pulse');
      await wait(450);
      if (my !== token) return;
      row(3, 'is-pass', 'fa-check');
      why.textContent = s.why;
      stamp.className = 'gvg-stamp is-' + s.v;
      stamp.textContent = s.word;
      stamp.hidden = false;
    }

    prompts.addEventListener('click', function (e) {
      var b = e.target.closest('.gvg-p');
      if (!b) return;
      btns.forEach(function (x) {
        var on = x === b;
        x.classList.toggle('is-active', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      run(+b.getAttribute('data-s'));
    });

    var desk = $('.gvg-desk');
    if (reduce || !('IntersectionObserver' in window)) run(0);
    else {
      var once = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { once.disconnect(); run(0); }
      }, { threshold: 0.4 });
      once.observe(desk);
    }
  })();

  /* ───────── 5. lifecycle timeline fills as you scroll ───────── */
  (function () {
    var line = $('#gvtLine'), fill = $('#gvtFill');
    if (!line) return;
    var items = $$('.gvt-item', line), ticking = false;

    function update() {
      ticking = false;
      var r = line.getBoundingClientRect(), vh = window.innerHeight;
      var h = reduce ? r.height : clamp(vh * 0.6 - r.top, 0, r.height);
      fill.style.height = h + 'px';
      items.forEach(function (li) {
        li.classList.toggle('is-on', reduce || li.offsetTop + 8 <= h);
      });
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
  })();
})();