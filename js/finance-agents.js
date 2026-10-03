/* finance-agents.js
   1. receipt print on view   2. invoice pipeline stepper   3. collections reply simulator
   4. expanding panels        5. audit log stream + filters  6. CTA drifting rows */
(function () {
  'use strict';

  var page = document.querySelector('.fa-page');
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
  function whenVisible(el, cb, threshold) {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); cb(); }
    }, { threshold: threshold || 0.3 });
    io.observe(el);
  }

  /* ───────── 1. receipt prints when it scrolls into view ───────── */
  var printer = $('#faiPrinter');
  if (printer) whenVisible(printer, function () { printer.classList.add('is-on'); }, 0.35);

  /* ───────── 2. invoice pipeline stepper ───────── */
  (function () {
    var track = $('#fafTrack'), card = $('#fafCard'), fill = $('#fafFill'), doc = $('#fafDoc');
    var playBtn = $('#fafPlay'), over = $('#fafOver');
    if (!track) return;

    function stages(isOver) {
      return [
        { k: 'Capture', icon: 'fa-inbox', who: 'agent', title: 'The invoice arrives',
          text: 'The agent picks up the PDF from the accounts mailbox, names it and files it in the right folder.', status: 'Invoice_2291.pdf received' },
        { k: 'Extract', icon: 'fa-magnifying-glass', who: 'agent', title: 'The agent reads it',
          text: 'It reads the vendor, amount, due date and line items. Each field carries a confidence score.', status: '6 fields read, confidence 96%' },
        { k: 'Match', icon: 'fa-link', who: 'agent', title: 'It checks the purchase order',
          text: 'The invoice is compared with the purchase order and what was received. Differences and duplicates are flagged.', status: 'PO 88213 matched, difference 0.00' },
        isOver
          ? { k: 'Approve', icon: 'fa-user-check', who: 'person', title: 'A person approves',
              text: 'The amount is above the limit you set, so the agent sends it to your approver with the match attached and waits.', status: 'Waiting for the finance lead' }
          : { k: 'Approve', icon: 'fa-user-check', who: 'agent', title: 'Within your limit',
              text: 'The amount is inside the limit you set, so no approval is needed and the agent carries on.', status: 'Auto-approved by your rules' },
        { k: 'Post', icon: 'fa-book', who: 'agent', title: 'It posts the bill',
          text: isOver ? 'Once approved, the agent creates the bill in your accounting system and files the PDF.' : 'The agent creates the bill in your accounting system and files the PDF.', status: 'Bill created' },
        { k: 'Pay', icon: 'fa-calendar-check', who: 'agent', title: 'Payment is scheduled',
          text: 'It schedules payment for the due date, ready for your next payment run.', status: 'Scheduled for 15 Oct' }
      ];
    }

    var idx = 0, timer = null, list = stages(false);

    function build() {
      track.innerHTML = list.map(function (s, i) {
        return '<li><button type="button" class="faf-stage" data-i="' + i + '">' +
          '<span class="faf-node"><i class="fas ' + s.icon + '"></i></span><span>' + esc(s.k) + '</span></button></li>';
      }).join('');
    }

    function render() {
      var n = list.length;
      $$('.faf-stage', track).forEach(function (b, i) {
        b.classList.toggle('is-now', i === idx);
        b.classList.toggle('is-past', i < idx);
        b.classList.toggle('is-person', list[i].who === 'person');
        if (i === idx) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      var p = idx / (n - 1);
      fill.style.width = (p * 100) + '%';
      doc.style.left = (p * 100) + '%';
      var s = list[idx];
      card.innerHTML =
        '<h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p>' +
        '<div class="faf-meta"><span class="faf-chip ' + (s.who === 'person' ? 'is-person' : 'is-agent') + '"><i class="fas ' + (s.who === 'person' ? 'fa-user' : 'fa-robot') + '"></i> ' + (s.who === 'person' ? 'Your team' : 'Agent') + '</span>' +
        '<span class="faf-chip"><i class="fas fa-circle-info"></i> ' + esc(s.status) + '</span></div>';
      card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap');
    }

    function go(i) { idx = i; render(); }
    function stop() {
      clearInterval(timer); timer = null;
      playBtn.setAttribute('aria-pressed', 'false');
      playBtn.innerHTML = '<i class="fas fa-play"></i> <span>Play</span>';
    }
    function start() {
      if (reduce) return;
      if (idx >= list.length - 1) go(0);
      playBtn.setAttribute('aria-pressed', 'true');
      playBtn.innerHTML = '<i class="fas fa-pause"></i> <span>Pause</span>';
      timer = setInterval(function () {
        if (idx >= list.length - 1) { stop(); return; }
        go(idx + 1);
      }, 2200);
    }

    track.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (!b) return;
      stop(); go(+b.getAttribute('data-i'));
    });
    playBtn.addEventListener('click', function () { timer ? stop() : start(); });
    over.addEventListener('change', function () {
      list = stages(over.checked); build(); render();
    });

    build(); render();
    var board = $('.faf-board');
    if (board && !reduce) whenVisible(board, start, 0.5);
  })();

  /* ───────── 3. collections reply simulator ───────── */
  (function () {
    var pick = $('#facPick'), out = $('#facOut');
    if (!pick) return;
    var S = [
      { reply: 'Hi, I paid this last week. Can you check?',
        acts: ['Looked up the bank feed and found a matching payment on 3 Oct', 'Marked invoice 1187 as paid', 'Stopped further reminders and sent a thank-you note'],
        end: 'auto', endText: 'Handled by the agent' },
      { reply: 'Sorry for the delay, we will pay on Friday.',
        acts: ['Recorded the promise to pay on the invoice', 'Paused reminders until Friday', 'Set a check on Saturday morning to confirm the payment arrived'],
        end: 'auto', endText: 'Handled by the agent' },
      { reply: 'The amount is wrong. We never ordered the second item.',
        acts: ['Paused all reminders on the invoice', 'Attached the invoice, purchase order and delivery note', 'Assigned the case to the finance lead with a short summary'],
        end: 'human', endText: 'Sent to your finance lead' },
      { reply: null, quiet: 'No reply after two reminders.',
        acts: ['Day 3: sent a friendly reminder', 'Day 10: sent a firmer reminder with the payment details', 'Day 21: flagged the account to the finance lead for a call'],
        end: 'human', endText: 'Escalated at day 21' }
    ];
    var tabs = $$('.fac-opt', pick);

    function show(i) {
      var s = S[i];
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
      });
      out.innerHTML =
        '<div class="fac-msg is-agent"><small>Agent, reminder sent</small>Hi, a reminder that invoice 1187 is 14 days overdue. Could you confirm when payment will be made?</div>' +
        (s.reply
          ? '<div class="fac-msg is-cust"><small>Customer</small>' + esc(s.reply) + '</div>'
          : '<div class="fac-msg is-cust"><small>Customer</small><em>' + esc(s.quiet) + '</em></div>') +
        '<ul class="fac-acts">' + s.acts.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' +
        '<span class="fac-end is-' + s.end + '"><i class="fas ' + (s.end === 'auto' ? 'fa-circle-check' : 'fa-user') + '"></i> ' + esc(s.endText) + '</span>';
      out.classList.remove('is-swap'); void out.offsetWidth; out.classList.add('is-swap');
    }

    pick.addEventListener('click', function (e) {
      var b = e.target.closest('.fac-opt');
      if (b) show(+b.getAttribute('data-s'));
    });
    pick.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement), n = tabs.length, nx = null;
      if (i < 0) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nx = (i + 1) % n;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') nx = (i - 1 + n) % n;
      if (nx !== null) { e.preventDefault(); show(nx); tabs[nx].focus(); }
    });
    show(0);
  })();

  /* ───────── 4. expanding panels ───────── */
  (function () {
    var row = $('#fawRow');
    if (!row) return;
    var panels = $$('.faw-panel', row);
    function open(p) {
      panels.forEach(function (x) {
        var on = x === p;
        x.classList.toggle('is-active', on);
        $('.faw-rail', x).setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    }
    var canHover = window.matchMedia('(hover: hover) and (min-width: 900px)').matches;
    panels.forEach(function (p) {
      var rail = $('.faw-rail', p);
      rail.addEventListener('click', function () { open(p); });
      rail.addEventListener('focus', function () { open(p); });
      if (canHover) p.addEventListener('mouseenter', function () { open(p); });
    });
  })();

  /* ───────── 5. audit log stream + filters ───────── */
  (function () {
    var log = $('#fakLog'), filters = $('#fakFilters'), replay = $('#fakReplay');
    if (!log) return;
    var L = [
      ['09:02', 'agent', 'Agent', 'Read Invoice_2291.pdf from the accounts inbox'],
      ['09:02', 'agent', 'Agent', 'Extracted 6 fields, confidence 96%'],
      ['09:03', 'agent', 'Agent', 'Matched PO 88213, difference 0.00'],
      ['09:03', 'agent', 'Agent', 'Within limit, posted bill to the accounting system'],
      ['09:41', 'flag', 'Held back', 'Invoice_2304 is above the approval limit, sent to approver'],
      ['09:58', 'person', 'Person', 'Finance lead approved Invoice_2304'],
      ['10:15', 'agent', 'Agent', 'Sent reminder for invoice 1187, 14 days overdue'],
      ['10:22', 'agent', 'Agent', 'Logged customer reply: promise to pay on Friday'],
      ['10:50', 'flag', 'Held back', 'Possible duplicate of Invoice_2291, held for review'],
      ['10:52', 'person', 'Person', 'AP clerk confirmed the duplicate and rejected it']
    ];
    var gen = 0, current = 'all';

    function apply() {
      $$('.fak-line', log).forEach(function (li) {
        li.hidden = !(current === 'all' || li.classList.contains('is-' + current));
      });
    }
    async function play() {
      var my = ++gen;
      log.innerHTML = '';
      for (var i = 0; i < L.length; i++) {
        if (my !== gen) return;
        var r = L[i], li = document.createElement('li');
        li.className = 'fak-line is-' + r[1];
        li.innerHTML = '<span class="fak-time">' + r[0] + '</span><span class="fak-tag">' + esc(r[2]) + '</span><span>' + esc(r[3]) + '</span>';
        li.hidden = !(current === 'all' || current === r[1]);
        log.appendChild(li);
        log.scrollTop = log.scrollHeight;
        await wait(700);
      }
    }

    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-f]');
      if (!b) return;
      current = b.getAttribute('data-f');
      $$('button', filters).forEach(function (x) {
        var on = x === b;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      apply();
    });
    replay.addEventListener('click', play);

    if (reduce) {
      L.forEach(function (r) {
        var li = document.createElement('li');
        li.className = 'fak-line is-' + r[1];
        li.innerHTML = '<span class="fak-time">' + r[0] + '</span><span class="fak-tag">' + esc(r[2]) + '</span><span>' + esc(r[3]) + '</span>';
        log.appendChild(li);
      });
    } else {
      whenVisible($('.fak-term'), play, 0.4);
    }
  })();

  /* ───────── 6. CTA drifting rows (content doubled for a seamless loop) ───────── */
  $$('.fax-row').forEach(function (row) {
    var words = (row.getAttribute('data-w') || '').split(',').filter(Boolean);
    var html = words.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('');
    row.innerHTML = html + html;
  });
})();