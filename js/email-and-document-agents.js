/* email-and-document-agents.js
   1. scroll reveal   2. inbox triage demo   3. flip cards (tap/keyboard)
   4. confidence slider   5. FAQPage JSON-LD generated from the visible FAQ */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('ed-js');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  };

  /* ───────── 1. scroll reveal ───────── */
  function initReveal() {
    var items = $$('.ed-rise');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    // stagger siblings inside the same grid
    $$('.edf-grid').forEach(function (grid) {
      $$('.ed-rise', grid).forEach(function (el, i) { el.style.setProperty('--rd', (i * 70) + 'ms'); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ───────── 2. inbox triage demo ───────── */
  var MESSAGES = [
    {
      id: 'invoice', from: 'Northwind Supplies', time: '9:12', subject: 'Invoice 2291 for September',
      snippet: 'Please find attached our invoice for the September order…',
      type: 'Supplier invoice', route: 'auto', confidence: 96,
      body: 'A PDF invoice arrives in the accounts mailbox.',
      steps: [
        'Classified as a supplier invoice',
        'Read the PDF and extracted vendor, amount, due date and PO number',
        'Matched PO 88213 in the ERP and found no price difference',
        'Created the bill and filed the PDF in the vendor folder'
      ],
      fields: [['Vendor', 'Northwind Supplies'], ['Amount', '4,280.00'], ['Due date', '15 Oct'], ['PO number', '88213']]
    },
    {
      id: 'po', from: 'Harbor Retail', time: '9:40', subject: 'New order, 40 units, delivery next week',
      snippet: 'Hi team, we would like to place the following order…',
      type: 'Purchase order', route: 'auto', confidence: 91,
      body: 'A customer sends an order as plain text in the email body, with a spreadsheet attached.',
      steps: [
        'Classified as a purchase order',
        'Read the email text and the spreadsheet, and matched items to your catalogue',
        'Created a sales order in the CRM against the customer account',
        'Sent a draft confirmation reply for approval'
      ],
      fields: [['Customer', 'Harbor Retail'], ['Items', '3 lines, 40 units'], ['Delivery', 'Next Friday'], ['Reply', 'Draft ready']]
    },
    {
      id: 'complaint', from: 'A. Fernandes', time: '10:05', subject: 'Second time my order arrived damaged',
      snippet: 'This is the second time this has happened and I want a refund…',
      type: 'Complaint with refund request', route: 'human', confidence: 62,
      body: 'A repeat complaint that mentions a refund. Your rules say these always go to a person.',
      steps: [
        'Classified as a complaint and flagged as high priority',
        'Found the two previous orders in the helpdesk',
        'Wrote a summary and a suggested reply',
        'Assigned the ticket to the support lead, without sending anything'
      ],
      fields: [['Sentiment', 'Frustrated'], ['Priority', 'High'], ['Topic', 'Damaged goods, refund'], ['Assigned to', 'Support lead']]
    },
    {
      id: 'contract', from: 'Legal, Ashford Ltd', time: '10:31', subject: 'Signed NDA and amendment',
      snippet: 'Attached are the signed NDA and the amendment to clause 7…',
      type: 'Contract', route: 'human', confidence: 74,
      body: 'Two contract files arrive together. One clause differs from your standard wording.',
      steps: [
        'Classified as an NDA with an amendment',
        'Extracted the parties, dates and term',
        'Flagged the changed clause 7 next to your standard text',
        'Sent the pair to legal review with the flag attached'
      ],
      fields: [['Parties', 'Ashford Ltd and you'], ['Term', '2 years'], ['Renewal', 'Automatic'], ['Flag', 'Clause 7 changed']]
    },
    {
      id: 'question', from: 'Priya Shah', time: '11:02', subject: 'Do you deliver to Pune?',
      snippet: 'Hello, can you tell me if delivery to Pune is possible…',
      type: 'General question', route: 'auto', confidence: 94,
      body: 'A routine question that your help pages already answer.',
      steps: [
        'Classified as a delivery question',
        'Found the answer in your delivery policy',
        'Sent a reply in your tone of voice',
        'Logged the message on the contact record in the CRM'
      ],
      fields: [['Topic', 'Delivery area'], ['Source', 'Delivery policy'], ['Reply', 'Sent'], ['CRM', 'Contact updated']]
    }
  ];

  function initTriage() {
    var inbox = $('#edtInbox');
    var detail = $('#edtDetail');
    if (!inbox || !detail) return;

    inbox.innerHTML = MESSAGES.map(function (m) {
      return '<button type="button" class="edt-item" role="listitem" data-id="' + m.id + '" aria-selected="false">' +
        '<span class="edt-from"><span>' + esc(m.from) + '</span><time>' + esc(m.time) + '</time></span>' +
        '<span class="edt-subj">' + esc(m.subject) + '</span>' +
        '<span class="edt-snip">' + esc(m.snippet) + '</span></button>';
    }).join('');

    function show(id, focus) {
      var m = MESSAGES.filter(function (x) { return x.id === id; })[0];
      if (!m) return;
      $$('.edt-item', inbox).forEach(function (b) {
        var on = b.getAttribute('data-id') === id;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on && focus) b.focus();
      });
      var human = m.route === 'human';
      detail.innerHTML =
        '<div class="edt-head"><h3>' + esc(m.type) + '</h3>' +
        '<span class="edt-tag ' + (human ? 'is-human' : 'is-auto') + '">' +
        (human ? 'Sent to your team' : 'Handled automatically') + '</span></div>' +
        '<p class="edt-body">' + esc(m.body) + '</p>' +
        '<ol class="edt-steps">' + m.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
        '<dl class="edt-fields">' + m.fields.map(function (f) {
          return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>';
        }).join('') + '</dl>' +
        '<div class="edt-meter"><span>Confidence ' + m.confidence + '%</span>' +
        '<span class="edt-bar"><i class="' + (human ? 'is-low' : '') + '" style="--c:0%"></i></span></div>';
      detail.classList.remove('is-swap');
      void detail.offsetWidth; // restart animation
      detail.classList.add('is-swap');
      var bar = $('.edt-bar i', detail);
      requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.setProperty('--c', m.confidence + '%'); }); });
    }

    inbox.addEventListener('click', function (e) {
      var b = e.target.closest('.edt-item');
      if (b) show(b.getAttribute('data-id'));
    });
    inbox.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var items = $$('.edt-item', inbox);
      var i = items.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var next = items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length];
      show(next.getAttribute('data-id'), true);
    });

    show(MESSAGES[0].id);
  }

  /* ───────── 3. flip cards: tap or Enter/Space on touch and keyboard ───────── */
  function initFlip() {
    $$('.edf-card').forEach(function (card) {
      card.addEventListener('click', function () { card.classList.toggle('is-flipped'); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('is-flipped'); }
      });
    });
  }

  /* ───────── 4. confidence slider ───────── */
  var EXTRACTIONS = [
    ['Invoice from Northwind Supplies', 97],
    ['Purchase order from Harbor Retail', 92],
    ['Delivery question from a customer', 94],
    ['Signed NDA with a changed clause', 76],
    ['Scanned claim form, handwritten', 68],
    ['Invoice in a new layout', 83],
    ['Complaint mentioning a refund', 62],
    ['Blurry photo of a receipt', 55]
  ];

  function initSlider() {
    var range = $('#edcRange');
    if (!range) return;
    var val = $('#edcVal'), auto = $('#edcAuto'), human = $('#edcHuman'), list = $('#edcList');

    list.innerHTML = EXTRACTIONS.map(function (x) {
      return '<li><span class="edc-name">' + esc(x[0]) + '</span><span class="edc-score">' + x[1] + '%</span><span class="edc-state"></span></li>';
    }).join('');
    var rows = $$('li', list);

    function update() {
      var t = +range.value, a = 0;
      val.textContent = t + '%';
      range.setAttribute('aria-valuetext', t + ' percent');
      range.style.setProperty('--fill', ((t - range.min) / (range.max - range.min) * 100) + '%');
      rows.forEach(function (li, i) {
        var ok = EXTRACTIONS[i][1] >= t;
        if (ok) a++;
        li.classList.toggle('is-auto', ok);
        li.classList.toggle('is-human', !ok);
        $('.edc-state', li).textContent = ok ? 'Handled automatically' : 'Sent to your team';
      });
      auto.textContent = a;
      human.textContent = rows.length - a;
    }
    range.addEventListener('input', update);
    update();
  }

  /* ───────── 5. FAQPage schema from the visible FAQ ───────── */
  function initFaqSchema() {
    var items = $$('#ed-faq .agf-item');
    if (!items.length || $('#edFaqSchema')) return;
    var entities = items.map(function (d) {
      var q = $('summary', d), a = $('p', d);
      if (!q || !a) return null;
      return {
        '@type': 'Question',
        name: q.textContent.replace(/\s+/g, ' ').trim(),
        acceptedAnswer: { '@type': 'Answer', text: a.textContent.replace(/\s+/g, ' ').trim() }
      };
    }).filter(Boolean);
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id = 'edFaqSchema';
    s.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities });
    document.head.appendChild(s);
  }

  function init() {
    initReveal();
    initTriage();
    initFlip();
    initSlider();
    initFaqSchema();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();