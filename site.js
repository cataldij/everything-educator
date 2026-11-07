/* teach-core: the ONE date function and the ONE lesson-card markup for The Everything Educator.
 *
 * It runs in two places from this single file: the build (node, through require) orders and groups
 * the lessons and writes the "Teach this week" cards for the day of the build, and the browser (this
 * file is placed ahead of site.js in the built site.js) re-picks the same cards for the visitor's
 * own day. Nothing here touches the network or the clock; every function takes the date it works on
 * as an ISO string (YYYY-MM-DD), so the two sides cannot disagree about a rule.
 *
 * The four `when` rules (content/teach/<slug>.json):
 *   fixed        { rule, month, day, endDay? }       a date, or a span inside one month
 *   nth-weekday  { rule, month, n, weekday }         weekday 0 = Sunday, n = -1 means the last one
 *   yearly       { rule, dates: { "2026": {start, end}, ... } }   dates that move
 *   month        { rule, month }                     a whole-month observance
 *
 * Plain ES5 on purpose (no template literals, no modules): the same text is served to browsers.
 */
var EETeach = (function () {
  'use strict';
  var MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAY = 86400000;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
  function parts(s) { var p = String(s).split('-'); return { y: +p[0], m: +p[1], d: +p[2] }; }
  function ms(s) { var p = parts(s); return Date.UTC(p.y, p.m - 1, p.d); }
  function fromMs(t) { var d = new Date(t); return iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()); }
  function addDays(s, n) { return fromMs(ms(s) + n * DAY); }
  function weekday(s) { return new Date(ms(s)).getUTCDay(); }
  function daysIn(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /** The nth (1 to 5) or last (-1) given weekday of a month, as an ISO date, or null when there is no such day. */
  function nth(y, m, n, wd) {
    if (n === -1) {
      var last = iso(y, m, daysIn(y, m));
      return addDays(last, -((weekday(last) - wd + 7) % 7));
    }
    var first = iso(y, m, 1);
    var day = 1 + ((wd - weekday(first) + 7) % 7) + (n - 1) * 7;
    return day > daysIn(y, m) ? null : iso(y, m, day);
  }

  /** The window {start, end} a rule gives in a year, or null (no such date that year, or the yearly table has no entry). */
  function windowFor(when, y) {
    if (!when) return null;
    if (when.rule === 'fixed') {
      var s = iso(y, when.month, when.day);
      return { start: s, end: when.endDay ? iso(y, when.month, when.endDay) : s };
    }
    if (when.rule === 'nth-weekday') {
      var t = nth(y, when.month, when.n, when.weekday);
      return t ? { start: t, end: t } : null;
    }
    if (when.rule === 'yearly') {
      var r = when.dates && when.dates[String(y)];
      return r ? { start: r.start, end: r.end } : null;
    }
    if (when.rule === 'month') return { start: iso(y, when.month, 1), end: iso(y, when.month, daysIn(y, when.month)) };
    return null;
  }

  /** Every occurrence from the year before `ref` to the year after it, soonest first. */
  function occurrences(when, ref) {
    var y = parts(ref).y, out = [];
    for (var k = y - 1; k <= y + 1; k++) {
      var w = windowFor(when, k);
      if (w) out.push(w);
    }
    out.sort(function (a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : 0; });
    return out;
  }

  /** { live, next, last } for a lesson on a day. live: the day is inside [start - surfaceDays, end]. next: the soonest start after the day. */
  function state(l, ref) {
    var occ = occurrences(l.when, ref), live = null, next = null, last = null;
    for (var i = 0; i < occ.length; i++) {
      var o = occ[i];
      if (!live && addDays(o.start, -(l.surfaceDays || 0)) <= ref && ref <= o.end) live = o;
      else if (o.start > ref && !next) next = o;
      if (o.end < ref) last = o;
    }
    return { live: live, next: next, last: last };
  }

  /** The occurrence a lesson is filed under for a day: the live one, else the next, else the last that passed. */
  function primary(l, ref) {
    var s = state(l, ref);
    return s.live || s.next || s.last;
  }

  /**
   * The week the home page speaks of. Monday to Sunday. On a Saturday or Sunday it is the week that is
   * about to start, because that is the week a teacher is planning. `ref` is the first day of the week
   * that has not passed yet (today on a school day, the coming Monday on a weekend).
   */
  function week(today) {
    var dow = weekday(today);
    var monday = dow === 6 ? addDays(today, 2) : dow === 0 ? addDays(today, 1) : addDays(today, 1 - dow);
    return { start: monday, end: addDays(monday, 6), ref: (dow === 6 || dow === 0) ? monday : today };
  }

  function dayLabel(s) { var p = parts(s); return MONTH[p.m - 1] + ' ' + p.d; }
  /** "November 2 to 8", or "October 28 to November 3" when the span crosses a month. */
  function rangeLabel(a, b) {
    var p = parts(a), q = parts(b);
    if (a === b) return dayLabel(a);
    return p.m === q.m && p.y === q.y ? MONTH[p.m - 1] + ' ' + p.d + ' to ' + q.d : dayLabel(a) + ' to ' + dayLabel(b);
  }

  /**
   * Lessons to show for a day: the ones whose window is open (soonest start first, at most `max`),
   * filled up to `min` with the next upcoming lessons when fewer are open.
   * Returns [{ lesson, occ, live }].
   */
  function pick(lessons, ref, max, min) {
    max = max || 4; min = min || 3;
    var live = [], soon = [];
    for (var i = 0; i < lessons.length; i++) {
      var st = state(lessons[i], ref);
      if (st.live) live.push({ lesson: lessons[i], occ: st.live, live: true });
      else if (st.next) soon.push({ lesson: lessons[i], occ: st.next, live: false });
    }
    function byStart(a, b) {
      return a.occ.start < b.occ.start ? -1 : a.occ.start > b.occ.start ? 1 : (a.lesson.slug < b.lesson.slug ? -1 : 1);
    }
    live.sort(byStart); soon.sort(byStart);
    var out = live.slice(0, max);
    for (var k = 0; out.length < min && k < soon.length; k++) out.push(soon[k]);
    return out;
  }

  /** Date-tile text for an occurrence: { big, mon, sub }. A whole-month lesson shows the month and "All month". */
  function tile(l, occ) {
    var p = parts(occ.start), q = parts(occ.end);
    if (l.when && l.when.rule === 'month') return { big: SHORT[p.m - 1], mon: 'All month', sub: '' };
    var sub = '';
    if (occ.end !== occ.start) sub = p.m === q.m ? 'to ' + q.d : 'to ' + SHORT[q.m - 1] + ' ' + q.d;
    return { big: String(p.d), mon: SHORT[p.m - 1], sub: sub };
  }

  /** The month a rule belongs to when it has no date to show: a yearly table's first entry, else the rule's month. */
  function monthHint(when) {
    if (!when) return 0;
    if (when.rule === 'yearly') {
      var ks = Object.keys(when.dates || {}).sort();
      return ks.length ? +when.dates[ks[0]].start.slice(5, 7) : 0;
    }
    return when.month || 0;
  }

  /**
   * The date a reader sees for a lesson on a day: "November 3", "December 4 to 12", "All November".
   * A yearly lesson with no date left for the visitor's year shows its month name instead of a stale date.
   */
  function dateText(l, ref) {
    var w = l.when || {};
    if (w.rule === 'month') return 'All ' + MONTH[w.month - 1];
    var s = state(l, ref), occ = s.live || s.next;
    if (!occ && w.rule !== 'yearly') occ = s.last;
    if (!occ) { var m = monthHint(w); return m ? MONTH[m - 1] : ''; }
    return rangeLabel(occ.start, occ.end);
  }

  /* ── lesson markup shared by the build and the browser ─────────────────────────────────────────── */
  var PLAY = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="7 4 20 12 7 20 7 4"/></svg>';

  /** "Nov 11", "Dec 4 to 12", "Oct 28 to Nov 3": the short date a card chip shows. */
  function shortRange(a, b) {
    var p = parts(a), q = parts(b);
    if (a === b) return SHORT[p.m - 1] + ' ' + p.d;
    return p.m === q.m && p.y === q.y ? SHORT[p.m - 1] + ' ' + p.d + ' to ' + q.d : SHORT[p.m - 1] + ' ' + p.d + ' to ' + SHORT[q.m - 1] + ' ' + q.d;
  }
  function occShort(l, occ) {
    if (l.when && l.when.rule === 'month') return 'All ' + MONTH[l.when.month - 1];
    return shortRange(occ.start, occ.end);
  }
  /** dateText, with the short month names (the card chip). */
  function dateShort(l, ref) {
    var w = l.when || {};
    if (w.rule === 'month') return 'All ' + MONTH[w.month - 1];
    var s = state(l, ref), occ = s.live || s.next;
    if (!occ && w.rule !== 'yearly') occ = s.last;
    if (!occ) { var m = monthHint(w); return m ? SHORT[m - 1] : ''; }
    return shortRange(occ.start, occ.end);
  }

  /** The lesson's cover as markup: a photo when the lesson has one, else the theme colour and a soft accent glow. */
  function coverMedia(l, up, o) {
    o = o || {};
    var c = l.cover || {};
    var vars = ' style="--lc-bg:' + esc(c.bg || '#1C2230') + ';--lc-ac:' + esc(c.ac || '#FFD43B') + '"';
    var cls = 'lc-media' + (c.h ? ' has-img' : ' no-img') + (c.t ? ' is-archival' : '');
    var img = '';
    if (c.h) {
      var base = esc(up) + 'img/teach/' + esc(l.slug) + '/cover-';
      var pos = Math.round((c.x == null ? .5 : c.x) * 100) + '% ' + Math.round((c.y == null ? .5 : c.y) * 100) + '%';
      img = '<img class="lc-img" src="' + base + '960.webp" srcset="' + base + '480.webp 480w, ' + base + '960.webp 960w, ' + base + '1920.webp 1920w"'
        + ' sizes="' + esc(o.sizes || '(min-width:1024px) 33vw, 80vw') + '" alt="" width="960" height="600" decoding="async"'
        + (o.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' style="object-position:' + pos + '">';
    }
    return '<span class="' + cls + '"' + vars + '>' + img + '<span class="lc-glow" aria-hidden="true"></span></span>';
  }

  /** The home hero: the featured lesson as a screen, with its name and the Teach it now button under it. */
  function heroHtml(l, up) {
    var cover = coverMedia(l, up, { sizes: '(min-width:1080px) 560px, 92vw', eager: true });
    var ttl = esc(l.title);
    return '<div class="hs-frame" data-hero-frame data-slug="' + esc(l.slug) + '">' + cover + '<span class="hs-fall" aria-hidden="true">' + ttl + '</span></div>'
      + '<div class="hs-cap"><div class="hs-t"><span class="hs-k">Featured lesson</span><b class="hs-name">' + ttl + '</b>'
      + '<span class="hs-meta">' + esc(l.min) + ' min<i aria-hidden="true">\u00b7</i>' + (l.noPrep ? 'No prep' : 'Light prep') + '</span></div>'
      + '<a class="btn primary big hs-go" href="' + esc(up) + 'teach/' + esc(l.slug) + '/" data-present-link aria-label="Teach it now: ' + ttl + '"><span class="play">' + PLAY + '</span>Teach it now</a></div>';
  }

  /** One lesson card, image first. l: { slug, title, line, min, noPrep, when, cover }. occ: the occurrence it is filed under. up: path to the site root. */
  function cardHtml(l, occ, up, o) {
    o = o || {};
    return '<a class="lcard' + (o.big ? ' lcard-big' : '') + '" href="' + esc(up) + 'teach/' + esc(l.slug) + '/">'
      + '<span class="lc-top">' + coverMedia(l, up, o)
      + (l.when ? '<span class="lc-date" data-lesson-date="short" data-slug="' + esc(l.slug) + '">' + esc(occShort(l, occ)) + '</span></span>'
        : '<span class="lc-date">' + esc(l.band || '') + '</span></span>')   // a topic lesson (no `when`) shows its grade band, and the browser never rewrites it
      + '<span class="lc-b"><span class="lc-t">' + esc(l.title) + '</span>'
      + (l.line ? '<span class="lc-l">' + esc(l.line) + '</span>' : '')
      + '<span class="lc-meta"><span>' + esc(l.min) + ' min</span><i aria-hidden="true">\u00b7</i><span>' + (l.noPrep ? 'No prep' : 'Light prep') + '</span></span></span></a>';
  }

  return {
    MONTH: MONTH, SHORT: SHORT, iso: iso, addDays: addDays, weekday: weekday, nth: nth, windowFor: windowFor,
    occurrences: occurrences, state: state, primary: primary, week: week, rangeLabel: rangeLabel, dayLabel: dayLabel,
    pick: pick, tile: tile, cardHtml: cardHtml, esc: esc,
    monthHint: monthHint, dateText: dateText, dateShort: dateShort, occShort: occShort, heroHtml: heroHtml, coverMedia: coverMedia,
  };
}());
if (typeof module !== 'undefined' && module.exports) module.exports = EETeach;

/* The Everything Educator: site script. Menu, search, the month picker, the home's week and month swaps, and the Copy button on article templates. Vanilla, no dependency.
   Every control it drives is hidden until this file has run (html.js), so a page with scripts off
   shows no dead buttons. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var up = (d.body && d.body.getAttribute('data-up')) || '';
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  // ── menu (phones) ──────────────────────────────────────────────────────────
  var bar = $('.topbar'), mb = $('.menu-btn');
  function setMenu(open) {
    if (!bar || !mb) return;
    bar.classList.toggle('open', open);
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (mb && bar) {
    mb.addEventListener('click', function () { setMenu(!bar.classList.contains('open')); });
    d.addEventListener('click', function (e) { if (bar.classList.contains('open') && !bar.contains(e.target)) setMenu(false); });
  }

  // ── header: paper at the top, translucent glass once the page has moved ──────
  if (bar) {
    var stuck = false;
    var onScroll = function () {
      var y = window.pageYOffset || root.scrollTop || 0;
      if ((y > 8) !== stuck) { stuck = y > 8; bar.classList.toggle('is-stuck', stuck); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── search ─────────────────────────────────────────────────────────────────
  var IDX = null, waiting = [];
  function loadIndex(cb) {
    if (IDX) { cb(); return; }
    waiting.push(cb);
    if (waiting.length > 1) return;
    var done = function () { IDX = window.__EE_IDX || []; var q = waiting; waiting = []; q.forEach(function (f) { f(); }); };
    if (window.__EE_IDX) { done(); return; }
    var s = d.createElement('script');
    s.src = up + 'search-index.js';
    s.onload = done; s.onerror = done;
    d.head.appendChild(s);
  }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  var ORDER = { 'Lesson': 0, 'Tool': 1, 'Free file': 2, 'Teacher to Teacher': 3, 'This month': 4, 'Page': 5 };
  function search(q, max) {
    var toks = norm(q).split(/[^a-z0-9$]+/).filter(Boolean);
    if (!toks.length) return [];
    var out = [];
    (IDX || []).forEach(function (e) {
      var t = norm(e.t), x = norm(e.x), y = norm(e.y), score = 0, ok = true;
      for (var i = 0; i < toks.length; i++) {
        var k = toks[i];
        if (new RegExp('(^|[^a-z0-9])' + k.replace(/[$]/g, '\\$')).test(t)) score += 6;
        else if (t.indexOf(k) > -1) score += 3;
        else if (new RegExp('(^|[^a-z0-9])' + k.replace(/[$]/g, '\\$')).test(x)) score += 2;
        else if (x.indexOf(k) > -1) score += 1;
        else if (y.indexOf(k) > -1) score += 1;
        else { ok = false; break; }
      }
      if (ok) out.push({ e: e, s: score });
    });
    out.sort(function (a, b) { return (b.s - a.s) || ((ORDER[a.e.y] || 9) - (ORDER[b.e.y] || 9)) || a.e.t.localeCompare(b.e.t); });
    return out.slice(0, max).map(function (o) { return o.e; });
  }
  function render(list, ul, q) {
    ul.textContent = '';
    if (!q) { ul.hidden = true; return; }
    if (!list.length) {
      var li0 = d.createElement('li'); li0.className = 'sr-none';
      li0.textContent = 'Nothing matched "' + q + '". Try a shorter word, like game or report card.';
      ul.appendChild(li0); ul.hidden = false; return;
    }
    list.forEach(function (e) {
      var li = d.createElement('li'), a = d.createElement('a');
      a.href = up + e.u;
      var ty = d.createElement('span'); ty.className = 'sr-ty'; ty.textContent = e.y;
      var b = d.createElement('b'); b.textContent = e.t;
      var p = d.createElement('span'); p.className = 'sr-tx'; p.textContent = e.x;
      a.appendChild(ty); a.appendChild(b); a.appendChild(p);
      li.appendChild(a); ul.appendChild(li);
    });
    ul.hidden = false;
  }
  function arrowNav(e, ul, input) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    var links = $$('a', ul);
    if (!links.length) return;
    var i = links.indexOf(d.activeElement);
    e.preventDefault();
    if (e.key === 'ArrowDown') links[Math.min(links.length - 1, i + 1)].focus();
    else if (i <= 0) input.focus();
    else links[i - 1].focus();
  }

  // overlay
  var ov = $('#search-overlay');
  if (ov) {
    var oi = $('#sov-q', ov), ol = $('#sov-list', ov), opener = null;
    var openOv = function (q) {
      opener = d.activeElement;
      ov.hidden = false;
      root.classList.add('sov-lock');
      setMenu(false);
      oi.value = q || '';
      loadIndex(function () { render(search(oi.value, 12), ol, oi.value.trim()); });
      oi.focus();
    };
    var closeOv = function () {
      ov.hidden = true;
      root.classList.remove('sov-lock');
      if (opener && opener.focus) opener.focus();
    };
    var sf = $('.sov-form', ov);
    if (sf) sf.addEventListener('submit', function (e) { e.preventDefault(); });
    $$('[data-search-open]').forEach(function (b) { b.addEventListener('click', function () { openOv(''); }); });
    $$('[data-search-close]', ov).forEach(function (b) { b.addEventListener('click', closeOv); });
    ov.addEventListener('click', function (e) { if (e.target === ov) closeOv(); });
    oi.addEventListener('input', function () {
      var v = oi.value.trim();
      loadIndex(function () { render(search(v, 12), ol, v); });
    });
    oi.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { arrowNav(e, ol, oi); }
      if (e.key === 'Enter') { var a = $('a', ol); if (a) { e.preventDefault(); location.href = a.href; } }
    });
    ol.addEventListener('keydown', function (e) { arrowNav(e, ol, oi); });
    d.addEventListener('keydown', function (e) {
      if (!ov.hidden) {
        if (e.key === 'Escape') { e.preventDefault(); closeOv(); return; }
        if (e.key === 'Tab') {
          var f = $$('input,button,a[href]', ov).filter(function (n) { return n.offsetParent !== null; });
          if (!f.length) return;
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
        }
        return;
      }
      var tg = (d.activeElement && d.activeElement.tagName) || '';
      var typing = /INPUT|TEXTAREA|SELECT/.test(tg) || (d.activeElement && d.activeElement.isContentEditable);
      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); openOv(''); }
    });
    // the home search box: live results under the box, Enter opens the full overlay
    var hf = $('[data-home-search]');
    if (hf) {
      var hi = $('input', hf), hl = $('.hs-list', hf);
      hi.addEventListener('input', function () {
        var v = hi.value.trim();
        loadIndex(function () { render(search(v, 6), hl, v); });
      });
      hi.addEventListener('keydown', function (e) { arrowNav(e, hl, hi); });
      hl.addEventListener('keydown', function (e) { arrowNav(e, hl, hi); });
      hf.addEventListener('submit', function (e) { e.preventDefault(); var a = $('a', hl); if (a) { location.href = a.href; } else { openOv(hi.value); } });
      d.addEventListener('click', function (e) { if (!hf.contains(e.target)) hl.hidden = true; });
      hi.addEventListener('focus', function () { loadIndex(function () {}); });
    }
  }

  // ── the month ──────────────────────────────────────────────────────────────
  function nyMonth() {
    try { return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'numeric' }).format(new Date())); }
    catch (e) { return new Date().getMonth() + 1; }
  }
  var cur = nyMonth();

  // the hub: show one month at a time
  var mths = $('[data-mths]');
  if (mths) {
    var chips = $$('.mchips a');
    var show = function (m, push) {
      $$('.mth', mths).forEach(function (n) { n.classList.toggle('is-cur', Number(n.getAttribute('data-month')) === m); });
      chips.forEach(function (c) {
        if (Number(c.getAttribute('data-m')) === m) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current');
      });
      var on = $('.mchips a[aria-current]');
      var row = $('.mc-row');
      if (on && row) row.scrollLeft = Math.max(0, on.offsetLeft - (row.clientWidth - on.offsetWidth) / 2);
      if (push && history.replaceState) { try { history.replaceState(null, '', '#m-' + m); } catch (e) { /* file:// */ } }
    };
    var hm = /^#m-(\d+)$/.exec(location.hash);
    show(hm && $('#m-' + hm[1]) ? Number(hm[1]) : cur, false);
    chips.forEach(function (c) {
      c.addEventListener('click', function (e) { e.preventDefault(); show(Number(c.getAttribute('data-m')), true); });
    });
  }

  // lessons: the date function runs again for the visitor's own day (the build wrote the dates for the day of the
  // build). EETeach (teach-core.cjs) is placed ahead of this file. Every lesson date on a page (the chips on the cards,
  // the lesson page) is recomputed for the visitor's year, and the home re-picks "Teach this week" and the hero.
  var lessonsEl = $('#ee-lessons');
  var bySlug = {}, todayIso = '';
  var loadDeckAssets = function (cb) {
    if (window.EEDeck) { cb(true); return; }
    if (!loadDeckAssets.q) {
      loadDeckAssets.q = [];
      var css = d.createElement('link'); css.rel = 'stylesheet'; css.href = up + 'deck.css'; d.head.appendChild(css);
      var sc = d.createElement('script'); sc.src = up + 'deck.js'; sc.async = true;
      sc.onload = function () { var q = loadDeckAssets.q; loadDeckAssets.q = null; q.forEach(function (f) { f(!!window.EEDeck); }); };
      sc.onerror = function () { var q = loadDeckAssets.q; loadDeckAssets.q = null; q.forEach(function (f) { f(false); }); };
      d.head.appendChild(sc);
    }
    loadDeckAssets.q.push(cb);
  };
  if (lessonsEl && window.EETeach) {
    var L = null;
    try { L = JSON.parse(lessonsEl.textContent); } catch (e) { L = null; }
    if (L) {
      var t0 = new Date();
      var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
      todayIso = t0.getFullYear() + '-' + pad2(t0.getMonth() + 1) + '-' + pad2(t0.getDate());
      L.forEach(function (l) { bySlug[l.slug] = l; });
      $$('[data-lesson-date]').forEach(function (n) {
        var l = bySlug[n.getAttribute('data-slug')];
        var t = l ? (n.getAttribute('data-lesson-date') === 'short' ? EETeach.dateShort(l, todayIso) : EETeach.dateText(l, todayIso)) : '';
        if (t && n.textContent !== t) n.textContent = t;
      });
      var tw = $('[data-teach-week]');
      if (tw) {
        var wk = EETeach.week(todayIso);
        if (wk.ref !== tw.getAttribute('data-ref')) {
          var picks = EETeach.pick(L, wk.ref, 4, 3);
          $$('[data-week-range]').forEach(function (n) { n.textContent = EETeach.rangeLabel(wk.start, wk.end); });
          var lg = $('[data-lesson-grid]', tw);
          if (lg) {
            lg.className = 'lgrid n' + picks.length;
            lg.innerHTML = picks.map(function (p, i) {
              return EETeach.cardHtml(p.lesson, p.occ, up, { big: i === 0, sizes: i === 0 ? '(min-width:1024px) 560px, (min-width:640px) 90vw, 78vw' : '(min-width:1024px) 280px, (min-width:640px) 45vw, 78vw' });
            }).join('');
          }
          var hb = $('[data-hero-board]');
          if (hb && picks.length) hb.innerHTML = EETeach.heroHtml(picks[0].lesson, up);
          tw.setAttribute('data-ref', wk.ref);
        }
      }
    }
  }

  // the home hero: a lesson with a deck plays a few of its slides in the screen; the others keep their cover photo.
  var heroDecks = null;
  var hdEl = $('#ee-hero-decks');
  if (hdEl) { try { heroDecks = JSON.parse(hdEl.textContent); } catch (e) { heroDecks = null; } }
  var mountHero = function () {
    var frame = $('[data-hero-frame]');
    if (!frame || !heroDecks || frame.classList.contains('is-deck')) return;
    var deck = heroDecks[frame.getAttribute('data-slug')];
    if (!deck) return;
    loadDeckAssets(function (ok) {
      if (!ok || !window.EEDeck || !EEDeck.mount || frame.classList.contains('is-deck')) return;
      try {
        var host = d.createElement('div');
        host.className = 'hs-deck';
        host.setAttribute('inert', '');
        frame.appendChild(host);
        EEDeck.mount(host, deck, { mini: true, autoplay: 3500 });
        frame.classList.add('is-deck');
      } catch (e) { /* the cover photo stays */ }
    });
  };
  if (heroDecks) {
    var startHero = function () { setTimeout(mountHero, 250); };
    if (d.readyState === 'complete') startHero(); else window.addEventListener('load', startHero);
  }

  // the home: the month's questions (articles whose frontmatter names the month) and the newest of the rest
  var asks = $('[data-asks]'), asksEl = $('#ee-asks');
  if (asks && asksEl) {
    var A = null;
    try { A = JSON.parse(asksEl.textContent); } catch (e) { A = null; }
    if (A && A.a && A.a[cur] && Number(asks.getAttribute('data-month')) !== cur) {
      var gc = function (slug) {
        var g = A.g[slug];
        return g ? '<a class="gcard" href="' + up + 'teacher-to-teacher/' + slug + '/"><h3>' + EETeach.esc(g.title) + '</h3><p>' + EETeach.esc(g.line) + '</p><span class="more">Read it</span></a>' : '';
      };
      var ak = function (slug) {
        var g = A.g[slug];
        return g ? '<li><a class="ask" href="' + up + 'teacher-to-teacher/' + slug + '/"><span class="ask-b"><b>' + EETeach.esc(g.title) + '</b><span>' + EETeach.esc(g.line) + '</span></span></a></li>' : '';
      };
      var ag = $('[data-asks-grid]', asks), eg = $('[data-t2t-grid]');
      if (ag) { ag.className = 'asklist n' + A.a[cur].d.length; ag.innerHTML = A.a[cur].d.map(ak).join(''); }
      if (eg) eg.innerHTML = A.a[cur].e.map(gc).join('');
      asks.setAttribute('data-month', String(cur));
    }
  }

  // ── the lesson page ───────────────────────────────────────────────────────────
  // "Teach it now" on the home goes to the lesson with #present on the end (the static link stays a plain page link).
  d.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('[data-present-link]') : null;
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    location.href = a.getAttribute('href') + '#present';
  });
  // The buttons in the side card and the dock stand in for the ones in the hero: they press those.
  $$('[data-present-proxy]').forEach(function (b) {
    b.addEventListener('click', function () { var m = $('[data-present]'); if (m) m.click(); });
  });
  $$('[data-print-proxy]').forEach(function (b) {
    b.addEventListener('click', function () { var m = $('[data-print]'); if (m) m.click(); else window.print(); });
  });
  // a lesson link that ends in #present (or #present=3) opens present mode as soon as the page and the player are ready
  var ph = /^#present(?:=(\d+))?$/.exec(location.hash || '');
  if (ph && $('[data-present]')) {
    window.addEventListener('load', function () {
      var b = $('[data-present]');
      if (!b) return;
      if (ph[1]) b.setAttribute('data-start', ph[1]);
      setTimeout(function () { b.click(); }, 120);
    });
  }
  // the dock (phones): Teach it now stays in reach once the hero has scrolled away
  var dock = $('[data-dock]'), heroCta = $('.l-hero .l-cta');
  if (dock && heroCta && 'IntersectionObserver' in window) {
    dock.hidden = false;
    new IntersectionObserver(function (es) { dock.classList.toggle('is-on', !es[0].isIntersecting && es[0].boundingClientRect.top < 0); }, { threshold: 0 }).observe(heroCta);
  }
  // "What your class will see": the slides as a filmstrip. Click one to open present mode at that slide. When the deck
  // player is not there the section is hidden. The press asks present mode for the slide through a cancelable
  // "ee:present" event ({ slide: n }); when nothing answers, it presses Teach it now.
  var film = $('[data-film]');
  if (film) {
    var pdEl = $('#present-data'), PD = null;
    try { PD = pdEl ? JSON.parse(pdEl.textContent) : null; } catch (e) { PD = null; }
    var press = function (n) {
      var btn = $('[data-present]');
      if (btn) btn.setAttribute('data-start', String(n));
      var ev;
      try { ev = new CustomEvent('ee:present', { detail: { slide: n }, cancelable: true }); } catch (e) { ev = null; }
      if (!ev || d.dispatchEvent(ev)) { if (btn) btn.click(); }
    };
    $$('.film-slide', film).forEach(function (b) { b.addEventListener('click', function () { press(Number(b.getAttribute('data-n'))); }); });
    var mountThumb = function (b) {
      var fr = $('.film-frame', b);
      if (!fr || fr.getAttribute('data-ready')) return;
      fr.setAttribute('data-ready', '1');
      fr.setAttribute('inert', '');
      try { EEDeck.mount(fr, PD, { mini: true, static: true, start: Number(b.getAttribute('data-n')) }); b.classList.add('is-ready'); } catch (e) { /* the empty frame stays */ }
    };
    loadDeckAssets(function (ok) {
      if (!ok || !PD || !window.EEDeck) { film.hidden = true; return; }
      var thumbs = $$('.film-slide', film);
      if ('IntersectionObserver' in window) {
        var tio = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { tio.unobserve(e.target); mountThumb(e.target); } });
        }, { root: null, rootMargin: '0px 600px 0px 600px' });
        thumbs.forEach(function (b) { tio.observe(b); });
      } else thumbs.forEach(mountThumb);
    });
  }

  // ── scroll reveal: fade and a 16px rise, once, 60ms apart. Only what starts below the fold; never the first screen. ──
  if ('IntersectionObserver' in window) {
    var targets = $$('.sec-head, .lcard, .pcard, .gcard, .ask, .ttile, .l-sec, .l-step, .l-card, .fu-uses li, .t-month .t-mh').filter(function (n) {
      return !n.closest('.hero3, .l-hero, .pshelf, .film-track') && n.getBoundingClientRect().top > window.innerHeight * 0.9;
    });
    if (targets.length) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      var lastTop = -1, k = 0;
      targets.forEach(function (n) {
        var top = Math.round(n.getBoundingClientRect().top / 40);
        k = top === lastTop ? k + 1 : 0; lastTop = top;
        n.style.setProperty('--i', String(Math.min(k, 5)));
        n.classList.add('rv');
        io.observe(n);
      });
    }
  }

  // template boxes in the articles: Copy puts the plain text on the clipboard
  $$('.tpl-copy').forEach(function (btn) {
    var box = btn.closest ? btn.closest('.tpl') : btn.parentNode.parentNode;
    var pre = box && $('.tpl-b', box);
    var timer = null;
    btn.addEventListener('click', function () {
      if (!pre) return;
      var text = pre.textContent;
      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('is-done');
        clearTimeout(timer);
        timer = setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('is-done'); }, 2200);
      };
      var fallback = function () {
        var ta = d.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px';
        d.body.appendChild(ta); ta.select();
        try { d.execCommand('copy'); done(); } catch (e) { /* nothing more to try */ }
        d.body.removeChild(ta);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    });
  });
}());
