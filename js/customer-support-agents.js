/* customer-support-agents.js — behaviour for customer-support-agents.html */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───── 3. Live ticket demo ───── */
  (function () {
    var tabs = $('#cslTabs'), msgs = $('#cslMsgs'), stepsEl = $('#cslSteps'),
        result = $('#cslResult'), replay = $('#cslReplay');
    if (!tabs || !msgs) return;

    var S = [
      { steps: ['Read the request and spot the order number', 'Look up order #4821 in the order system', 'Check carrier tracking', 'Reply and log it on the ticket'],
        ev: [
          { c: 'Hi, where is my order #4821? It was meant to arrive Friday.' },
          { s: 0 }, { s: 1 }, { s: 2 },
          { a: 'Your order shipped on Wednesday and is out for delivery today. Tracking: 1Z 84X 2210. Expect it by 6 pm.' },
          { s: 3 }
        ],
        res: 'Resolved by the agent in under a minute. Ticket closed, reply logged.' },
      { steps: ['Read the request and check the order', 'Confirm the return window and photo evidence', 'Refund is above the agent limit', 'Hand over to a person with a summary'],
        ev: [
          { c: 'My blender arrived cracked. I want a refund.' },
          { s: 0 }, { s: 1 },
          { a: 'Sorry about that. It is inside your 30-day window. Could you send a photo of the damage?' },
          { c: 'Sure, sent.' },
          { s: 2 },
          { a: 'Thanks. A refund of this size needs a team member to approve it. I am passing you over now with everything so far.' },
          { s: 3, h: 1 },
          { p: 'Hi, I have the photo and the order details. I have approved your refund. It will reach you in 3 to 5 days.' }
        ],
        res: 'Handed over with full context. The customer never repeated themselves.' },
      { steps: ['Read the request', 'Search the approved help articles', 'Walk the customer through the fix', 'Log the steps on the ticket'],
        ev: [
          { c: 'I keep getting "wrong password" but I know it is right.' },
          { s: 0 }, { s: 1 },
          { a: 'This usually happens when the account is locked after several attempts. I have sent a reset link to the email on your account.' },
          { s: 2 },
          { c: 'Got it, I am in now. Thanks!' },
          { a: 'Glad that worked. Anything else I can help with?' },
          { s: 3 }
        ],
        res: 'Resolved by the agent. Steps and outcome written to the helpdesk.' }
    ];

    var cur = 0, token = 0;
    var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); };
    var lastActive = null;

    function setActive(i, human) {
      var lis = $$('li', stepsEl);
      if (lastActive !== null && lis[lastActive]) { lis[lastActive].classList.remove('is-active'); lis[lastActive].classList.add('is-done'); }
      if (lis[i]) { lis[i].classList.add('is-active'); if (human) lis[i].classList.add('is-human'); }
      lastActive = i;
    }
    function bubble(cls, who, text) {
      var d = document.createElement('div');
      d.className = 'csl-m ' + cls;
      d.innerHTML = (who ? '<small>' + who + '</small>' : '') + text;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
      return d;
    }
    async function run(n) {
      var t = ++token, sc = S[n];
      msgs.innerHTML = ''; result.hidden = true; lastActive = null;
      stepsEl.innerHTML = sc.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('');
      await sleep(500);
      for (var k = 0; k < sc.ev.length; k++) {
        if (t !== token) return;
        var e = sc.ev[k];
        if (e.c) { bubble('c', '', e.c); await sleep(800); }
        else if (e.a) {
          var ty = bubble('typing', '', '<i></i><i></i><i></i>'); await sleep(900);
          if (t !== token) return;
          ty.remove(); bubble('a', 'Support agent', e.a); await sleep(700);
        }
        else if (e.p) { bubble('p', 'Team member', e.p); await sleep(700); }
        else if (typeof e.s === 'number') {
          if (e.h) { $$('li', stepsEl)[e.s].classList.add('is-human'); }
          setActive(e.s, e.h); await sleep(1000);
        }
      }
      if (t !== token) return;
      $$('li', stepsEl).forEach(function (li) { li.classList.remove('is-active'); li.classList.add('is-done'); });
      result.textContent = sc.res; result.hidden = false;
    }
    function select(n, focus) {
      cur = n;
      $$('.csl-tab', tabs).forEach(function (b, i) {
        var on = i === n;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on);
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      run(n);
    }
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('.csl-tab'); if (b) select(+b.dataset.s);
    });
    tabs.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); select((cur + d + S.length) % S.length, true); }
    });
    replay.addEventListener('click', function () { run(cur); });

    // Start when the section scrolls into view
    var started = false, sec = $('#cs-live');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en, ob) {
        if (en[0].isIntersecting && !started) { started = true; run(0); ob.disconnect(); }
      }, { threshold: 0.25 }).observe(sec);
    } else { run(0); }
  })();

  /* ───── 4. Channel hub ───── */
  (function () {
    var map = $('#cscMap'), svg = $('#cscSvg'), hub = $('#cscHub');
    if (!map || !svg || !hub) return;
    var pairs = [];
    var NS = 'http://www.w3.org/2000/svg';

    function draw() {
      svg.innerHTML = ''; pairs = [];
      if (getComputedStyle(svg).display === 'none') return;
      var m = map.getBoundingClientRect(), h = hub.getBoundingClientRect();
      var hx = { in: h.left - m.left + 8, out: h.right - m.left - 8 }, hy = h.top - m.top + h.height / 2;
      $$('.csc-col', map).forEach(function (col) {
        var side = col.dataset.side;
        $$('.csc-node', col).forEach(function (n) {
          var r = n.getBoundingClientRect();
          var x1 = side === 'in' ? r.right - m.left : r.left - m.left, y1 = r.top - m.top + r.height / 2;
          var x2 = hx[side], mid = (x1 + x2) / 2;
          var p = document.createElementNS(NS, 'path');
          p.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + mid + ' ' + y1 + ' ' + mid + ' ' + hy + ' ' + x2 + ' ' + hy);
          p.setAttribute('class', 'csc-line');
          svg.appendChild(p);
          pairs.push({ n: n, p: p });
        });
      });
    }
    function focusOn(nodes) {
      map.classList.toggle('has-focus', !!nodes.length);
      pairs.forEach(function (o) {
        var on = nodes.indexOf(o.n) > -1;
        o.p.classList.toggle('is-on', on); o.n.classList.toggle('is-on', on);
      });
    }
    // Bind once on the nodes; paths are looked up by node so redraws are safe
    $$('.csc-node', map).forEach(function (n) {
      ['mouseenter', 'focus'].forEach(function (ev) { n.addEventListener(ev, function () { focusOn([n]); }); });
      ['mouseleave', 'blur'].forEach(function (ev) { n.addEventListener(ev, function () { focusOn([]); }); });
    });
    hub.addEventListener('mouseenter', function () { focusOn($$('.csc-node', map)); });
    hub.addEventListener('mouseleave', function () { focusOn([]); });

    window.addEventListener('resize', draw);
    window.addEventListener('load', draw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    draw();
  })();

  /* ───── 6. Escalation rules sorter ───── */
  (function () {
    var box = $('#csrRules'); if (!box) return;
    var listA = $('#csrAgent'), listP = $('#csrHuman'), nA = $('#csrA'), nP = $('#csrP');
    var LABEL = { refund: 'Refund', upset: 'Upset customer', vip: 'VIP', privacy: 'Privacy / legal' };
    var REQ = [
      { t: 'Where is my order #4821?' },
      { t: 'Refund for a cracked blender', r: 'refund' },
      { t: 'Third email about the same delay', r: 'upset' },
      { t: 'How do I reset my password?' },
      { t: 'Invoice copy for March' },
      { t: 'Please delete all my personal data', r: 'privacy' },
      { t: 'Wrong size, from a VIP account', r: 'vip' },
      { t: 'How do I pair the device?' },
      { t: 'Charged twice, refund please', r: 'refund' },
      { t: 'This is unacceptable. Cancel everything.', r: 'upset' }
    ];
    function render() {
      var on = {};
      $$('input', box).forEach(function (i) { on[i.dataset.r] = i.checked; });
      var a = [], p = [];
      REQ.forEach(function (q) { (q.r && on[q.r] ? p : a).push(q); });
      listA.innerHTML = a.map(function (q) { return '<li>' + q.t + '</li>'; }).join('') ||
        '<li class="csr-empty">Nothing left for the agent</li>';
      listP.innerHTML = p.map(function (q) { return '<li>' + q.t + '<em>' + LABEL[q.r] + '</em></li>'; }).join('') ||
        '<li class="csr-empty">Nothing escalated. Switch a rule on.</li>';
      nA.textContent = a.length; nP.textContent = p.length;
    }
    box.addEventListener('change', render);
    render();
  })();

  /* ───── 7. CTA spotlight ───── */
  (function () {
    var s = $('#cs-cta'); if (!s || reduce) return;
    s.addEventListener('pointermove', function (e) {
      var r = s.getBoundingClientRect();
      s.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      s.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  })();
})();