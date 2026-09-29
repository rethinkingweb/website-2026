(function () {
  var page = document.querySelector('.vg-page');
  if (!page) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  page.classList.add('vg-js');

  /* ───────── sound-wave bars ───────── */
  [].slice.call(page.querySelectorAll('[data-bars]')).forEach(function (box) {
    var n = parseInt(box.getAttribute('data-bars'), 10) || 20;
    for (var i = 0; i < n; i++) {
      var b = document.createElement('i');
      b.style.setProperty('--i', i);
      b.style.setProperty('--h', (25 + Math.random() * 75).toFixed(0) + '%');
      box.appendChild(b);
    }
  });

  /* ───────── scroll reveal + call-flow line ───────── */
  var reveal = [].slice.call(page.querySelectorAll('.vg-rise, #vgpList'));
  if (reduce || !('IntersectionObserver' in window)) {
    reveal.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    reveal.forEach(function (el, i) {
      el.style.transitionDelay = el.classList.contains('vgu-card') ? (i % 3) * 80 + 'ms' : '';
      io.observe(el);
    });
  }

  /* ───────── live call demo ───────── */
  var S = [
    { m: [['caller', 'Hi, I need to book a service visit for Thursday.'],
          ['agent',  'Happy to help. I can see your account. Would 10:30 or 2:00 work on Thursday?'],
          ['caller', '10:30 please.'],
          ['agent',  'Booked for Thursday at 10:30. I have sent a confirmation text to your phone.']],
      a: ['Calendar: slot booked', 'CRM: call logged', 'SMS: confirmation sent'] },
    { m: [['caller', 'Where is my order 4821?'],
          ['agent',  'Order 4821 shipped yesterday and is due on Friday. Would you like the tracking link by text?'],
          ['caller', 'Yes please.'],
          ['agent',  'Sent. Is there anything else I can help with?']],
      a: ['Order system: status checked', 'SMS: tracking sent', 'Ticket: closed'] },
    { m: [['agent',  'Hello, this is a reminder that invoice 1093 is now seven days overdue. Would you like a payment link?'],
          ['caller', 'I thought that was already paid.'],
          ['agent',  'I cannot see a payment yet. I will pass this to our accounts team with your note, and they will call you back today.']],
      a: ['Note logged', 'Escalated to finance', 'Callback scheduled'] }
  ];

  var body = page.querySelector('#vgdBody'), acts = page.querySelector('#vgdActs');
  var tabs = [].slice.call(page.querySelectorAll('.vgd-tab'));
  var run = 0, started = false;
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function chip(t) {
    var c = document.createElement('span');
    c.className = 'vgd-chip'; c.textContent = t; acts.appendChild(c);
  }

  async function play(i) {
    var id = ++run, s = S[i];
    body.innerHTML = ''; acts.innerHTML = '';
    for (var k = 0; k < s.m.length; k++) {
      var el = document.createElement('div');
      el.className = 'vgd-msg is-' + s.m[k][0];
      body.appendChild(el);
      if (!reduce) {
        el.classList.add('is-typing');
        el.innerHTML = '<span></span><span></span><span></span>';
        await sleep(800); if (id !== run) return;
        el.classList.remove('is-typing');
      }
      el.textContent = s.m[k][1];
      if (!reduce) { await sleep(1000); if (id !== run) return; }
    }
    for (var j = 0; j < s.a.length; j++) {
      chip(s.a[j]);
      if (!reduce) { await sleep(350); if (id !== run) return; }
    }
  }

  if (body && tabs.length) {
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o) {
          var on = o === t;
          o.classList.toggle('is-active', on);
          o.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        started = true; play(i);
      });
    });
    var demo = page.querySelector('#vg-demo');
    if ('IntersectionObserver' in window && demo) {
      var dio = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting && !started) { started = true; play(0); dio.disconnect(); }
      }, { threshold: 0.35 });
      dio.observe(demo);
    } else { play(0); }
  }

  /* ───────── FAQPage schema built from the visible FAQ ───────── */
  var qa = [].slice.call(page.querySelectorAll('.agf-item')).map(function (d) {
    return {
      '@type': 'Question',
      name: d.querySelector('summary').textContent.trim(),
      acceptedAnswer: { '@type': 'Answer', text: d.querySelector('p').textContent.trim() }
    };
  });
  if (qa.length) {
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qa });
    document.head.appendChild(ld);
  }
})();