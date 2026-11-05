/* The Everything Educator: PRESENT MODE for a lesson page. Vanilla, no library, no network.
   The deck comes from #present-data (built by site-teach.mjs presentData(): slides, notes, pictures, credits) and is
   played by deck.js (window.EEDeck). "Teach it now" opens it full screen over the page. Space, the arrow keys, a click
   or a swipe move; T starts the timer, N opens the teacher notes, F toggles full screen, Esc leaves and focus goes back
   to the button that opened it. This file also opens every answer for printing.
   Other scripts can open the deck at a slide: EEPresent.open(n), or a click on any [data-present][data-start="n"],
   or document.dispatchEvent(new CustomEvent('ee:present', { detail: { slide: n }, cancelable: true })). */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };

  // printing: every answer open, then put back the way the teacher had it
  var opened = [];
  window.addEventListener('beforeprint', function () {
    opened = [];
    Array.prototype.forEach.call(d.querySelectorAll('details'), function (x) { opened.push(x.open); x.open = true; });
  });
  window.addEventListener('afterprint', function () {
    Array.prototype.forEach.call(d.querySelectorAll('details'), function (x, i) { x.open = !!opened[i]; });
  });
  var printBtn = $('[data-print]');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  var openBtn = $('[data-present]'), dataEl = $('#present-data');
  if (!openBtn || !dataEl) return;
  var D;
  try { D = JSON.parse(dataEl.textContent); } catch (e) { return; }
  if (!D || !D.slides || !D.slides.length) return;

  var ov = null, deck = null, isOpen = false, opener = openBtn, softFs = false, inerted = [];

  function inFs() { return d.fullscreenElement || d.webkitFullscreenElement; }

  function toggleFs() {
    try {
      if (inFs()) {
        softFs = true;   // leaving full screen with F keeps the deck open; the browser's own Esc closes it
        var ef = d.exitFullscreen || d.webkitExitFullscreen;
        var p = ef && ef.call(d); if (p && p.catch) p.catch(function () { softFs = false; });
      } else if (ov) {
        var rf = ov.requestFullscreen || ov.webkitRequestFullscreen;
        var q = rf && rf.call(ov); if (q && q.catch) q.catch(function () { /* not allowed here: the overlay already fills the window */ });
      }
    } catch (e) { /* no full screen: the overlay already fills the window */ }
  }

  function open(start, from) {
    if (isOpen || !window.EEDeck) return;
    isOpen = true;
    opener = from && from.focus ? from : openBtn;
    ov = d.createElement('div');
    ov.className = 'dk-ov';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Present: ' + (D.title || D.name || 'lesson'));
    d.body.appendChild(ov);
    root.classList.add('dk-lock');
    // everything else on the page goes inert while the deck is up (whatever the page's own layout is called)
    inerted = Array.prototype.filter.call(d.body.children, function (n) { return n !== ov && !/^(SCRIPT|STYLE|LINK)$/.test(n.tagName) && !n.hasAttribute('inert'); });
    inerted.forEach(function (n) { n.setAttribute('inert', ''); });
    var dateEl = $('[data-lesson-date]');   // the date on the page (site.js has already worked it out for the visitor's year)
    if (D.auto && dateEl && dateEl.textContent) D.slides[0].kicker = dateEl.textContent;
    deck = window.EEDeck.mount(ov, D, { keys: true, trap: true, start: Math.max(0, Math.min(D.slides.length - 1, start | 0)), onExit: close, onFullscreen: toggleFs });
    toggleFs();
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    softFs = false;
    if (deck) deck.destroy();
    deck = null;
    if (ov) ov.remove();
    ov = null;
    root.classList.remove('dk-lock');
    inerted.forEach(function (n) { n.removeAttribute('inert'); });
    inerted = [];
    try {
      var ef = d.exitFullscreen || d.webkitExitFullscreen;
      if (inFs() && ef) { var p = ef.call(d); if (p && p.catch) p.catch(function () { /* already out */ }); }
    } catch (e) { /* already out */ }
    opener.focus();
  }

  // leaving full screen with the browser's own Esc leaves present mode too
  // (leaving full screen also drops focus on the page, so the button gets it back once the browser is done)
  function fsChanged() {
    if (inFs()) return;
    if (softFs) { softFs = false; return; }
    if (isOpen) close(); else opener.focus();
  }
  d.addEventListener('fullscreenchange', fsChanged);
  d.addEventListener('webkitfullscreenchange', fsChanged);

  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-present]');
    if (!b) return;
    e.preventDefault();
    open(parseInt(b.getAttribute('data-start') || '0', 10) || 0, b);
  });
  d.addEventListener('ee:present', function (e) {   // detail: { slide: n } (or { start: n }); handled events are cancelled so the sender does not also click the button
    var x = e.detail || {};
    if (!window.EEDeck) return;
    e.preventDefault();
    open(x.slide != null ? x.slide : x.start, x.from);
  });
  window.EEPresent = { open: function (n) { open(n | 0); }, close: close, get isOpen() { return isOpen; } };
}());
