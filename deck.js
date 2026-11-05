/* The Everything Educator: PRESENT MODE deck engine. Vanilla, no library, no network.
   window.EEDeck = { mount(el, deck, opts), render(slide, deck, opts), icons, types }
   deck = { slug, name, theme:{canvas,accent,accent2,motif}, slides:[...], images:{slot:{w480,w960,w1920,focal,treat,alt}}, credits:[...] }
   opts = { mini, static, autoplay:ms, start:n, keys, onExit, onFullscreen, onChange }.
   The stage is 1920x1080 and is scaled to fit, so a mini is the same render, smaller. The teacher's narrative lives in
   slide.notes (the N drawer). Pair with deck.css.
   Icons below are from Lucide (https://lucide.dev), ISC licence: Copyright (c) for portions of Lucide are held by
   Cole Bemis 2013-2022 as part of Feather (MIT), all other copyright (c) for Lucide are held by Lucide Contributors 2022.
   Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby
   granted, provided that the above copyright notice and this permission notice appear in all copies.
   To add an icon: copy its shapes from lucide.dev (the svg children, no wrapper) into ICONS below under its Lucide name. */
(function () {
  'use strict';
  var d = typeof document !== 'undefined' ? document : null;
  var W = 1920, H = 1080;
  var ICONS = {
    "medal": "<path d=\"M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15\"/><path d=\"M11 12 5.12 2.2\"/><path d=\"m13 12 5.88-9.8\"/><path d=\"M8 7h8\"/><circle cx=\"12\" cy=\"17\" r=\"5\"/><path d=\"M12 18v-2h-.5\"/>",
    "flag": "<path d=\"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528\"/>",
    "briefcase": "<path d=\"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\"/><rect width=\"20\" height=\"14\" x=\"2\" y=\"6\" rx=\"2\"/>",
    "map": "<path d=\"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z\"/><path d=\"M15 5.764v15\"/><path d=\"M9 3.236v15\"/>",
    "house": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>",
    "flame": "<path d=\"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4\"/>",
    "flower": "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5\"/><path d=\"M12 7.5V9\"/><path d=\"M7.5 12H9\"/><path d=\"M16.5 12H15\"/><path d=\"M12 16.5V15\"/><path d=\"m8 8 1.88 1.88\"/><path d=\"M14.12 9.88 16 8\"/><path d=\"m8 16 1.88-1.88\"/><path d=\"M14.12 14.12 16 16\"/>",
    "glass-water": "<path d=\"M5.116 4.104A1 1 0 0 1 6.11 3h11.78a1 1 0 0 1 .994 1.105L17.19 20.21A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.79z\"/><path d=\"M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0\"/>",
    "utensils": "<path d=\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\"/><path d=\"M7 2v20\"/><path d=\"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7\"/>",
    "image": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/>",
    "wheat": "<path d=\"M2 22 16 8\"/><path d=\"M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z\"/><path d=\"M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z\"/><path d=\"M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z\"/><path d=\"M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z\"/><path d=\"M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z\"/><path d=\"M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z\"/><path d=\"M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z\"/>",
    "coffee": "<path d=\"M10 2v2\"/><path d=\"M14 2v2\"/><path d=\"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1\"/><path d=\"M6 2v2\"/>",
    "heart": "<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\"/>",
    "radio": "<path d=\"M16.247 7.761a6 6 0 0 1 0 8.478\"/><path d=\"M19.075 4.933a10 10 0 0 1 0 14.134\"/><path d=\"M4.925 19.067a10 10 0 0 1 0-14.134\"/><path d=\"M7.753 16.239a6 6 0 0 1 0-8.478\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>",
    "door-open": "<path d=\"M11 20H2\"/><path d=\"M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z\"/><path d=\"M11 4H8a2 2 0 0 0-2 2v14\"/><path d=\"M14 12h.01\"/><path d=\"M22 20h-3\"/>",
    "check": "<path d=\"M20 6 9 17l-5-5\"/>",
    "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>",
    "vote": "<path d=\"m9 12 2 2 4-4\"/><path d=\"M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z\"/><path d=\"M22 19H2\"/>",
    "globe": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/>",
    "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><path d=\"M16 3.128a4 4 0 0 1 0 7.744\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/>",
    "pencil": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/><path d=\"m15 5 4 4\"/>",
    "book-open": "<path d=\"M12 7v14\"/><path d=\"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z\"/>",
    "lightbulb": "<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\"/><path d=\"M9 18h6\"/><path d=\"M10 22h4\"/>",
    "landmark": "<path d=\"M10 18v-7\"/><path d=\"M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z\"/><path d=\"M14 18v-7\"/><path d=\"M18 18v-7\"/><path d=\"M3 22h18\"/><path d=\"M6 18v-7\"/>",
    "calendar": "<path d=\"M8 2v4\"/><path d=\"M16 2v4\"/><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"/><path d=\"M3 10h18\"/>"
  };
  var TYPES = ['cover', 'hook', 'bignum', 'timeline', 'compare', 'quiz', 'task', 'statement', 'cards', 'sort', 'frames', 'exit', 'credits', 'board', 'fact'];
  var MOTIFS = ['poppies', 'papel-picado', 'snow', 'leaves', 'confetti', 'candle-glow', 'sparkle', 'grid', 'none'];

    // small helpers
  function h(tag, cls, text) { var n = d.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  // headings are divs with a role: the page's own h1 to h3 and p styles must never reach the slides
  function hd(lv, cls, text) { var n = h('div', cls, text); n.setAttribute('role', 'heading'); n.setAttribute('aria-level', lv); return n; }
  function E(n, i) { n.classList.add('dk-e'); n.style.setProperty('--i', i || 0); return n; }
  function fs(len, tbl) { for (var i = 0; i < tbl.length; i++) if (len <= tbl[i][0]) return tbl[i][1]; return tbl[tbl.length - 1][1]; }
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
  function nb(t) { return String(t).replace(/(\d) (a\.m\.|p\.m\.)/g, '$1 $2'); }
  function words(parent, text, i0) {
    var parts = nb(text).split(/[ \t\n]+/).filter(Boolean);
    parts.forEach(function (w, k) {
      var s = h('span', 'dk-w', w); s.style.setProperty('--i', (i0 || 0) + k); parent.appendChild(s);
      if (k < parts.length - 1) parent.appendChild(d.createTextNode(' '));
    });
    return parent;
  }
  function ic(name, cls, draw) {
    var body = ICONS[name] || '<circle cx="12" cy="12" r="9"/>';
    if (draw) body = body.replace(/<(path|circle|rect|line|polyline|ellipse|polygon)\b/g, '<$1 pathLength="1"');
    var w = h('span'); w.innerHTML = '<svg class="dk-ic' + (draw ? ' dk-draw' : '') + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
    return w.firstChild;
  }

    // colour
  function hex(c) { c = String(c || '#000').replace('#', ''); if (c.length === 3) c = c.replace(/./g, '$&$&'); return [parseInt(c.slice(0, 2), 16) || 0, parseInt(c.slice(2, 4), 16) || 0, parseInt(c.slice(4, 6), 16) || 0]; }
  function lum(c) { var a = c.map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; }
  function cr(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  function toHex(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function toward(c, t, k) { return c.map(function (v, i) { return v + (t[i] - v) * k; }); }
  function readable(c, bg, min) { var t = lum(bg) < .4 ? [255, 255, 255] : [0, 0, 0], k = 0, o = c; while (cr(o, bg) < min && k < 1) { k += .06; o = toward(c, t, k); } return toHex(o); }
  function onFill(c) { return cr(c, [255, 255, 255]) >= cr(c, [14, 16, 20]) ? '#FFFFFF' : '#0E1014'; }
  function theme(el, t) {
    var cv = hex(t.canvas || '#111318'), ac = hex(t.accent || '#FFD43B'), a2 = hex(t.accent2 || t.accent || '#E2412F'), dark = lum(cv) < .4;
    var fg = dark ? '#F7F3EA' : '#15171C', v = {
      '--cv': toHex(cv), '--cvc': cv.join(','), '--ac': toHex(ac), '--acc': ac.join(','), '--act': readable(ac, dark ? toward(cv, [255, 255, 255], .16) : cv, 4.5), '--a2': toHex(a2), '--a2c': a2.join(','),
      '--a2t': readable(a2, cv, 4.5), '--fg': fg, '--fg2': dark ? 'rgba(247,243,234,.8)' : 'rgba(21,23,28,.8)', '--glass': dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.05)',
      '--line': dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.18)', '--onac': onFill(ac), '--ona2': onFill(a2)
    };
    for (var k in v) el.style.setProperty(k, v[k]);
  }

    // photos
  // A slot with no files is not an error: the wrapper keeps its theme gradient (and the motif sits on top).
  function ph(C, slot, o) {
    o = o || {};
    var im = slot && C.deck.images && C.deck.images[slot], box = h('div', 'dk-ph' + (o.cls ? ' ' + o.cls : ''));
    if (im && im.w960) {
      var img = new Image(), f = im.focal || [.5, .5];
      img.alt = o.bg ? '' : (im.alt || '');
      img.decoding = 'async';
      img.draggable = false;
      img.setAttribute('data-fr', o.fr || 1);
      img.sizes = Math.ceil((o.fr || 1) * W * C.scale) + 'px';
      img.srcset = (im.w480 ? im.w480 + ' 480w, ' : '') + im.w960 + ' 960w' + (im.w1920 ? ', ' + im.w1920 + ' 1920w' : '');
      img.src = im.w960;
      img.style.objectPosition = (f[0] * 100) + '% ' + (f[1] * 100) + '%';
      img.style.transformOrigin = (f[0] * 100) + '% ' + (f[1] * 100) + '%';
      if (o.kb) img.className = 'dk-kb';
      img.onerror = function () { img.remove(); box.classList.add('dk-miss'); };
      if (im.treat === 'archival' || o.arch) box.classList.add('dk-arch');
      box.appendChild(img);
    } else box.classList.add('dk-miss');
    box.appendChild(h('i', 'dk-grain'));
    return box;
  }

    // motifs
  function picado(t) {
    var cols = [t.accent, t.accent2, '#19B6A6', '#8B5CF6'], n = 9, fw = 150, svg = '<svg class="dk-pic" viewBox="0 0 1920 340" aria-hidden="true">';
    svg += '<path d="M-20 22Q960 96 1940 22" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="3"/>';
    function ring(cx, cy, r) { return 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0z'; }
    function dia(cx, cy, r) { return 'M' + cx + ' ' + (cy - r) + 'l' + r + ' ' + r + 'l' + (-r) + ' ' + r + 'l' + (-r) + ' ' + (-r) + 'z'; }
    for (var i = 0; i < n; i++) {
      var s = (i + .5) / n, x = -20 + 1960 * s, y = 22 * (1 - s) * (1 - s) + 2 * 96 * s * (1 - s) + 22 * s * s, c = cols[i % 4], k = i % 3;
      var body = 'M0 0H' + fw + 'V178L' + (fw * .833) + ' 204L' + (fw * .667) + ' 178L' + (fw * .5) + ' 204L' + (fw * .333) + ' 178L' + (fw * .167) + ' 204L0 178Z', cut;
      if (k === 0) cut = ring(75, 92, 30) + ring(75, 92, 14) + dia(28, 44, 10) + dia(122, 44, 10) + ring(40, 150, 5) + ring(75, 150, 5) + ring(110, 150, 5);
      else if (k === 1) cut = dia(75, 90, 36) + dia(75, 90, 16) + ring(26, 130, 7) + ring(124, 130, 7) + ring(30, 52, 6) + ring(120, 52, 6);
      else cut = ring(75, 70, 13) + ring(75, 114, 13) + ring(53, 92, 13) + ring(97, 92, 13) + ring(75, 92, 7) + dia(24, 150, 8) + dia(126, 150, 8);
      svg += '<g class="dk-fl2" style="--i:' + i + ';transform-origin:' + x.toFixed(1) + 'px ' + y.toFixed(1) + 'px"><g transform="translate(' + (x - fw / 2).toFixed(1) + ' ' + y.toFixed(1) + ')">' +
        '<path d="' + body + cut + '" fill-rule="evenodd" fill="' + c + '" fill-opacity=".94"/><path d="M0 0H' + fw + 'V14H0Z" fill="rgba(0,0,0,.18)"/></g></g>';
    }
    return svg + '</svg>';
  }
  var PARTS = {
    poppies: { n: 11, s: [46, 96], t: [20, 34], sw: [4, 7], svg: function (r, t) { var c = t.accent; return '<svg viewBox="0 0 60 80"><path d="M30 2C56 20 60 54 30 78C0 54 4 20 30 2Z" fill="' + c + '" fill-opacity=".55"/><path d="M30 14C30 34 30 54 30 70" stroke="#fff" stroke-opacity=".25" fill="none" stroke-width="2.5"/></svg>'; } },
    leaves: { n: 14, s: [44, 86], t: [16, 28], sw: [4, 7], svg: function (r, t) { var c = [t.accent, t.accent2, '#C2410C', '#B45309'][Math.floor(r() * 4)]; return '<svg viewBox="0 0 60 80"><path d="M30 2C58 18 58 62 30 78C2 62 2 18 30 2Z" fill="' + c + '" fill-opacity=".72"/><path d="M30 10V76" stroke="#000" stroke-opacity=".22" fill="none" stroke-width="2"/></svg>'; } },
    snow: { n: 46, s: [10, 26], t: [12, 24], sw: [3, 6], svg: function () { return '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#fff" fill-opacity=".72"/></svg>'; } },
    confetti: { n: 30, s: [14, 26], t: [8, 14], sw: [1.6, 2.6], svg: function (r, t) { var c = [t.accent, t.accent2, '#F7F3EA', '#19B6A6'][Math.floor(r() * 4)]; return '<svg viewBox="0 0 12 20"><rect width="12" height="20" rx="2" fill="' + c + '"/></svg>'; } },
    sparkle: { n: 16, s: [24, 60], t: [2.6, 5], sw: [1, 1], svg: function (r, t) { return '<svg viewBox="0 0 24 24"><path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="' + (r() > .5 ? t.accent2 : '#fff') + '"/></svg>'; } }
  };
  function motif(kind, C, full) {
    if (!kind || kind === 'none' || (kind === 'papel-picado' && !full)) return d.createDocumentFragment();
    var m = h('div', 'dk-mo dk-mo-' + kind), t = C.theme, r = rng(C.seed * 7919 + kind.length * 131);
    m.setAttribute('aria-hidden', 'true');
    if (kind === 'papel-picado') { m.innerHTML = picado(t); return m; }
    if (kind === 'candle-glow') {
      for (var g = 0; g < 6; g++) { var gl = h('i', 'dk-glow'); gl.style.cssText = '--x:' + Math.round(r() * 1920) + 'px;--y:' + Math.round(180 + r() * 800) + 'px;--s:' + Math.round(520 + r() * 520) + 'px;--t:' + (1.6 + r() * 2.2).toFixed(2) + 's;--d:-' + (r() * 3).toFixed(2) + 's'; m.appendChild(gl); }
      return m;
    }
    var P = PARTS[kind];
    if (P) for (var i = 0; i < P.n; i++) {
      var p = h('div', 'dk-p'), pi = h('span', 'dk-pi'), dur = P.t[0] + r() * (P.t[1] - P.t[0]);
      p.style.cssText = '--x:' + (r() * 100).toFixed(1) + '%;--y:' + Math.round(r() * 1000) + 'px;--t:' + dur.toFixed(1) + 's;--d:-' + (r() * dur).toFixed(1) + 's;--sw:' + (P.sw[0] + r() * (P.sw[1] - P.sw[0])).toFixed(1) + 's;--s:' + Math.round(P.s[0] + r() * (P.s[1] - P.s[0]));
      pi.innerHTML = P.svg(r, t); p.appendChild(pi); m.appendChild(p);
    }
    return m;
  }

    // pieces used by several slide types
  function label(text, i, pos) { var n = h('div', 'dk-label' + (pos ? ' dk-lab' : ''), text); return E(n, i || 0); }
  function clockSvg(value) {
    var m = String(value).match(/(\d{1,2}):(\d{2})/), hh = m ? +m[1] : 11, mm = m ? +m[2] : 0, tk = '';
    for (var i = 0; i < 60; i++) {
      var maj = i % 5 === 0, a = i * Math.PI / 30, r1 = maj ? 150 : 168, r2 = 180, sn = Math.sin(a), cs = Math.cos(a);
      tk += '<line class="tk" x1="' + (200 + r1 * sn).toFixed(1) + '" y1="' + (200 - r1 * cs).toFixed(1) + '" x2="' + (200 + r2 * sn).toFixed(1) + '" y2="' + (200 - r2 * cs).toFixed(1) + '" stroke-width="' + (maj ? 6 : 2.4) + '"/>';
    }
    var w = h('span');
    w.innerHTML = '<svg class="dk-clock" viewBox="0 0 400 400" aria-hidden="true"><circle class="cf" cx="200" cy="200" r="194"/>' + tk +
      '<g class="dk-hand" style="--to:' + (((hh % 12) + mm / 60) * 30).toFixed(1) + 'deg;--from:0deg;--k:0"><line class="hh" x1="200" y1="224" x2="200" y2="112" stroke-width="12"/></g>' +
      '<g class="dk-hand" style="--to:' + (mm * 6) + 'deg;--from:-720deg;--k:1"><line class="hh" x1="200" y1="226" x2="200" y2="50" stroke-width="7"/></g>' +
      '<g class="dk-hand" style="--to:0deg;--from:-1800deg;--k:2"><g class="dk-sec"><line class="hs" x1="200" y1="244" x2="200" y2="38" stroke-width="3.6"/><circle class="hs" cx="200" cy="200" r="8" fill="var(--ac)"/></g></g>' +
      '<circle cx="200" cy="200" r="6" fill="#0E1014"/></svg>';
    return w.firstChild;
  }
  function slideEl(type) { return h('section', 'dk-slide dk-t-' + type); }

    // the slide types. Each returns { el, n:builds, set
  var T = {};
  T.cover = function (s, C) {
    var el = slideEl('cover');
    el.appendChild(ph(C, s.img, { bg: 1, kb: 1 }));
    el.appendChild(h('div', 'dk-scr dk-scr-b'));
    el.appendChild(motif(C.theme.motif, C, 1));
    var box = h('div', 'dk-cov'), tt = hd(1, 'dk-h');
    if (s.kicker) box.appendChild(E(h('div', 'dk-pill', s.kicker), 0));
    words(tt, s.title || '', 1);
    tt.style.fontSize = fs((s.title || '').length, [[10, 284], [14, 240], [20, 196], [30, 158], [999, 128]]) + 'px';
    box.appendChild(tt);
    if (s.sub) box.appendChild(E(h('div', 'dk-sub', s.sub), 8));
    el.appendChild(box);
    return { el: el, n: 0 };
  };
  T.hook = function (s, C) {
    var el = slideEl('hook'), chips = s.chips || [], n = chips.length, icons = s.chipIcons, has = !!s.img, hk = h('div', 'dk-hk');
    if (has) {
      var pw = h('div', 'dk-hook-ph'); pw.appendChild(ph(C, s.img, { kb: 1, fr: .45 })); el.appendChild(pw); el.classList.add('dk-hook-p');
    } else el.appendChild(motif(C.theme.motif, C, 1));
    hk.appendChild(label(s.label, 0));
    var cols = has ? (n === 4 ? 2 : Math.min(n, 3)) : Math.min(n, 4), avail = has ? 906 : 1640, rows = Math.ceil(n / cols), tw = (avail - (cols - 1) * 28) / cols;
    var grid = h('div', 'dk-tiles');
    grid.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
    grid.style.setProperty('--th', (icons ? (rows > 1 ? 256 : 320) : (rows > 1 ? 250 : 340)) + 'px');
    chips.forEach(function (c, k) {
      var tile = h('div', 'dk-tile'), tin = h('div', 'dk-tile-in'), f0 = h('div', 'dk-face dk-f0'), f1 = h('div', 'dk-face dk-f1'), tx = h('div', 'dk-chip-t dk-fr', c);
      tx.style.setProperty('--tf', (icons ? 40 : (tw >= 480 ? 96 : 60)) + 'px');
      if (icons && icons[k]) { f1.appendChild(ic(icons[k])); f1.firstChild.style.setProperty('--ti', (rows > 1 ? 80 : 104) + 'px'); }
      f1.appendChild(tx); tin.appendChild(f0); tin.appendChild(f1); tile.appendChild(tin);
      tile.setAttribute('data-b', k + 1); E(tile, k + 1); grid.appendChild(tile);
    });
    hk.appendChild(grid);
    var q = h('div', 'dk-hq dk-fr dk-b', s.prompt || ''); q.setAttribute('data-b', n + 1); hk.appendChild(q);
    el.appendChild(hk);
    return { el: el, n: n + 1 };
  };
  T.bignum = function (s, C) {
    var el = slideEl('bignum'), clock = !!s.clock, v = String(s.value || '');
    el.appendChild(ph(C, s.img, { bg: 1, kb: 1, arch: 1 }));
    el.appendChild(h('div', 'dk-scr dk-scr-a'));
    if (s.label) el.appendChild(label(s.label, 0, 1));
    var wrap = h('div', 'dk-bn' + (clock ? '' : ' dk-bn-solo')), r = h('div', 'dk-bn-r'), num = h('div', 'dk-num dk-fr', nb(v)), ln = h('div', 'dk-bnl');
    if (clock) wrap.appendChild(clockSvg(v));
    num.style.fontSize = (clock ? Math.min(400, Math.floor(950 / (Math.max(v.length, 2) * .54))) : Math.min(480, Math.floor(1500 / (Math.max(v.length, 2) * .54)))) + 'px';
    if (!clock) { num.style.animationDelay = '.5s'; }
    r.appendChild(num);
    if (clock) r.appendChild(h('i', 'dk-bn-rule'));
    if (s.line) { words(ln, s.line, 0); ln.style.setProperty('--ld', clock ? '2.9s' : '1.2s'); r.appendChild(ln); }
    wrap.appendChild(r); el.appendChild(wrap);
    return { el: el, n: 0 };
  };
  T.timeline = function (s, C) {
    var el = slideEl('timeline'), items = s.items || [], N = items.length, x0 = 110, x1 = 1810, cxs = [], tl = h('div', 'dk-tl'), nodes = [];
    if (s.label) el.appendChild(label(s.label, 0, 1));
    var svg = d.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'dk-tl-svg'); svg.setAttribute('viewBox', '0 0 1920 1080'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<path class="dk-tl-g" d="M' + x0 + ' 560H' + x1 + '"/><path class="dk-tl-l" pathLength="1" d="M' + x0 + ' 560H' + x1 + '"/>';
    tl.appendChild(svg);
    var line = svg.querySelector('.dk-tl-l'), slot = 1600 / Math.max(N, 1);
    items.forEach(function (it, k) {
      var cx = 160 + (k + .5) * slot, nd = h('div', 'dk-node'), nin = h('div', 'dk-nin'), yr = h('div', 'dk-yr dk-fr', it.year), tx = h('div', 'dk-yt', it.text);
      cxs.push(cx);
      nd.style.setProperty('--cx', cx + 'px'); nd.style.setProperty('--nw', (slot - 14) + 'px');
      nd.style.setProperty('--yf', (N <= 4 ? 124 : N === 5 ? 100 : 84) + 'px'); nd.style.setProperty('--tf2', (N <= 4 ? 40 : 34) + 'px');
      nd.setAttribute('data-b', k + 1);
      nin.appendChild(yr);
      if (it.img) { var c = h('div', 'dk-ncirc'); c.appendChild(ph(C, it.img, { fr: .13 })); nin.appendChild(c); } else nin.appendChild(h('div', 'dk-ndot'));
      nin.appendChild(tx); nd.appendChild(nin); tl.appendChild(nd); nodes.push(nd);
    });
    el.appendChild(tl);
    return { el: el, n: N, set: function (step) { line.style.setProperty('--o', step < 1 ? 1 : (1 - (cxs[step - 1] - x0) / (x1 - x0)).toFixed(4)); } };
  };
  function ccard(c, C, side) {
    var card = h('div', 'dk-cc dk-b ' + side), top = h('div', 'dk-cph'), body = h('div', 'dk-cbody');
    top.appendChild(ph(C, c.img, { fr: .4 }));
    if (c.icon) { var b = h('div', 'dk-cbadge'); b.appendChild(ic(c.icon)); top.appendChild(b); }
    card.appendChild(top);
    body.appendChild(hd(3, 'dk-ct dk-h', c.title || ''));
    if (c.when) body.appendChild(h('div', 'dk-pill dk-p2', c.when));
    if (c.sub) body.appendChild(h('div', 'dk-cs', c.sub));
    card.appendChild(body);
    return card;
  }
  T.compare = function (s, C) {
    var el = slideEl('compare'), box = h('div', 'dk-cmp'), row = h('div', 'dk-crow'), n = 0, rev = s.reveal || [];
    box.appendChild(label(s.label, 0, 1));
    [[s.left, 'dk-fl'], [s.right, 'dk-fr2']].forEach(function (p, k) {
      var slot = h('div', 'dk-slot'), card = ccard(p[0] || {}, C, p[1]);
      card.setAttribute('data-b', ++n); slot.appendChild(card); row.appendChild(slot);
    });
    box.appendChild(row);
    if (s.prompt) { var q = h('div', 'dk-cpr dk-fr dk-b', s.prompt); q.setAttribute('data-b', ++n); box.appendChild(q); }
    if (rev.length) {
      var rw = h('div', 'dk-rev');
      rev.forEach(function (t) { var c = h('div', 'dk-rv dk-b', t); c.setAttribute('data-b', ++n); rw.appendChild(c); });
      box.appendChild(rw);
    }
    el.appendChild(box);
    return { el: el, n: n };
  };
  function confetti(el, target, C) {
    if (!el.animate || C.reduced) return;
    var layer = h('div', 'dk-conf'), r = target.getBoundingClientRect(), sr = el.getBoundingClientRect(), sc = C.scale || 1;
    var cx = (r.left + r.width / 2 - sr.left) / sc, cy = (r.top + r.height / 2 - sr.top) / sc, cols = [C.theme.accent, C.theme.accent2, '#F7F3EA', '#19B6A6'];
    layer.setAttribute('aria-hidden', 'true'); el.appendChild(layer);
    for (var i = 0; i < 56; i++) {
      var p = h('i'), a = Math.random() * Math.PI * 2, dist = 240 + Math.random() * 620, T = 900 + Math.random() * 400;
      p.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;background:' + cols[i % 4];
      layer.appendChild(p);
      p.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: 'translate(' + Math.cos(a) * dist + 'px,' + (Math.sin(a) * dist * .8 + 260) + 'px) rotate(' + (Math.random() * 900 - 450) + 'deg)' }], { duration: T, easing: 'cubic-bezier(.15,.8,.3,1)', fill: 'forwards' });
      p.animate([{ opacity: 1 }, { opacity: 1, offset: .7 }, { opacity: 0 }], { duration: T, fill: 'forwards' });
    }
    setTimeout(function () { layer.remove(); }, 1500);
  }
  T.quiz = function (s, C) {
    var el = slideEl('quiz'), box = h('div', 'dk-qz'), opts = s.options || [], n = opts.length, long = opts.some(function (o) { return o.length > 28; }), tiles = [];
    box.appendChild(label(s.label, 0, 1));
    box.appendChild(E(hd(2, 'dk-q dk-h', s.q || ''), 1));
    var grid = h('div', 'dk-opts');
    grid.style.gridTemplateColumns = 'repeat(' + (n === 2 ? (long ? 1 : 2) : n === 3 ? (long ? 1 : 3) : n === 4 ? 2 : 1) + ',1fr)';
    opts.forEach(function (o, k) {
      var t = h('div', 'dk-opt' + (k === s.answer ? ' dk-ok' : '')), b = h('div', 'dk-ob', String.fromCharCode(65 + k)), tx = h('div', 'dk-ot dk-fr', o);
      b.insertAdjacentHTML('beforeend', '<svg class="dk-ck" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M5 12.5L10 17.5L19.5 7"/></svg>');
      tx.style.fontSize = Math.round((o.length > 40 ? 52 : o.length > 22 ? 60 : 72) * (n >= 3 ? .86 : 1)) + 'px';
      t.appendChild(b); t.appendChild(tx); E(t, k + 2); grid.appendChild(t); tiles.push(t);
    });
    box.appendChild(grid);
    var why = h('div', 'dk-why dk-b', s.why || ''); why.setAttribute('data-b', 1); box.appendChild(why);
    el.appendChild(box);
    return { el: el, n: 1, set: function (step, prev, instant) {
      el.classList.toggle('dk-revealed', step >= 1);
      if (step >= 1 && !prev && !instant && tiles[s.answer]) confetti(el, tiles[s.answer], C);
    } };
  };
  T.task = function (s, C) {
    var el = slideEl('task'), box = h('div', 'dk-tk'), st = s.steps || [], g = h('div', 'dk-steps');
    box.appendChild(label(s.label, 0, 1));
    box.appendChild(E(hd(2, 'dk-tt dk-h', s.title || ''), 1));
    g.style.setProperty('--n', st.length || 1);
    st.forEach(function (p, k) {
      var c = h('div', 'dk-step'), i = ic(p.icon, 'dk-sic', 1), tx = h('div', 'dk-stx dk-fr', p.text);
      i.style.setProperty('--i', k);
      c.appendChild(h('div', 'dk-sn', String(k + 1))); c.appendChild(i); c.appendChild(tx); E(c, k + 2); g.appendChild(c);
    });
    box.appendChild(g); el.appendChild(box);
    return { el: el, n: 0 };
  };
  T.statement = function (s, C) {
    var el = slideEl('statement'), box = h('div', 'dk-st'), t = hd(2, 'dk-sm dk-h'), len = (s.text || '').length;
    el.appendChild(ph(C, s.img, { bg: 1, kb: 1 }));
    el.appendChild(h('div', 'dk-scr dk-scr-c'));
    el.appendChild(motif(C.theme.motif, C));
    t.style.setProperty('--sf', fs(len, [[30, 176], [56, 148], [90, 120], [999, 98]]) + 'px');
    box.appendChild(E(h('i', 'dk-srule'), 0)); words(t, s.text || '', 1); box.appendChild(t); el.appendChild(box);
    return { el: el, n: 0 };
  };
  T.cards = function (s, C) {
    var el = slideEl('cards'), box = h('div', 'dk-cd'), it = s.items || [], n = it.length, cols = n <= 4 ? Math.max(n, 1) : n <= 6 ? 3 : 4, rows = Math.ceil(n / cols), grid = h('div', 'dk-grid');
    box.appendChild(label(s.label, 0, 1));
    var cw = (1720 - (cols - 1) * 28) / cols, ch = Math.min(rows === 1 ? 520 : 400, Math.floor((780 - (rows - 1) * 28) / rows));
    grid.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)'; grid.style.gridTemplateRows = 'repeat(' + rows + ',' + ch + 'px)';
    it.forEach(function (c, k) {
      var col = k % cols, row = Math.floor(k / cols), b = h('button', 'dk-card'), inn = h('span', 'dk-card-in'), f = h('span', 'dk-fc dk-fc-f'), bk = h('span', 'dk-fc dk-fc-b'), cf = h('span', 'dk-cf');
      var dx = ((cols - 1) / 2 - col) * (cw + 28), dy = ((rows - 1) / 2 - row) * (ch + 28), dist = Math.abs(col - (cols - 1) / 2) + Math.abs(row - (rows - 1) / 2);
      b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', c.front + (c.sub ? ', ' + c.sub : '') + '. Press to flip.');
      b.style.setProperty('--dx', dx.toFixed(0) + 'px'); b.style.setProperty('--dy', dy.toFixed(0) + 'px'); b.style.setProperty('--dl', dist.toFixed(2)); b.style.setProperty('--rz', ((k % 2 ? 1 : -1) * (6 + k % 3 * 4)) + 'deg');
      f.appendChild(ph(C, c.img, { fr: .22 })); f.appendChild(h('span', 'dk-scr'));
      var fr = h('span', 'dk-fr', c.front); fr.style.setProperty('--cfs', (c.front.length > 16 ? 44 : 52) + 'px'); cf.appendChild(fr);
      if (c.sub) cf.appendChild(h('span', 'dk-cs2', c.sub));
      f.appendChild(cf);
      var bt = h('span', 'dk-fr', c.back || ''); bt.style.setProperty('--cbs', ((c.back || '').length > 56 ? 38 : 42) + 'px');
      bk.appendChild(h('span', 'dk-cs2', c.front)); bk.firstChild.style.cssText = 'font-size:32px;font-weight:650;letter-spacing:.1em;text-transform:uppercase;color:var(--act)'; bk.appendChild(bt);
      inn.appendChild(f); inn.appendChild(bk); b.appendChild(inn);
      b.addEventListener('click', function () { var on = b.classList.toggle('is-flip'); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      grid.appendChild(b);
    });
    box.appendChild(grid); el.appendChild(box);
    return { el: el, n: 0 };
  };
  T.sort = function (s, C) {
    var el = slideEl('sort'), it = s.items || [], g = s.groups || ['', ''], n = it.length, r = rng(C.seed + 11), field = h('div', 'dk-so');
    field.appendChild(label(s.label, 0, 1));
    if (s.sub) { var sb = h('div', 'dk-pill dk-p2 dk-sosub', s.sub); field.appendChild(E(sb, 1)); }
    var colX = [130, 1010], cols = n <= 4 ? 2 : n <= 9 ? 3 : 4, rows = Math.ceil(n / cols), cw = 1680 / cols, rh = 640 / rows, cell = [], i;
    for (i = 0; i < n; i++) cell.push(i);
    for (i = n - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), tmp = cell[i]; cell[i] = cell[j]; cell[j] = tmp; }
    g.forEach(function (name, k) { var gh = hd(2, 'dk-gh dk-h', name); gh.style.left = (colX[k] + 6) + 'px'; field.appendChild(E(gh, k + 2)); var p = h('i', 'dk-colp'); p.style.left = colX[k] + 'px'; field.appendChild(p); });
    var count = [0, 0], tot = [0, 0], step, mx;
    it.forEach(function (c) { tot[c.group === 1 ? 1 : 0]++; });
    mx = Math.max(tot[0], tot[1], 1); step = Math.min(126, Math.floor(680 / mx));
    field.style.setProperty('--chh', Math.min(112, step - 14) + 'px'); field.style.setProperty('--mw', Math.min(540, Math.floor(cw - 24)) + 'px');
    it.forEach(function (c, k) {
      var gi = c.group === 1 ? 1 : 0, chip = h('div', 'dk-chip'), inn = h('div', 'dk-ci'), cx = 120 + (cell[k] % cols) * cw + (r() * 50 - 15), cy = 330 + Math.floor(cell[k] / cols) * rh + (r() * Math.max(rh - 130, 10));
      inn.appendChild(ic(c.icon)); inn.appendChild(h('span', '', c.text));
      chip.appendChild(inn);
      chip.style.cssText = '--k:' + k + ';--cx:' + cx.toFixed(0) + 'px;--cy:' + cy.toFixed(0) + 'px;--r:' + ((r() * 6 - 3).toFixed(1)) + 'deg;--sx:' + (colX[gi] + 28) + 'px;--sy:' + (326 + count[gi]++ * step) + 'px;--bt:' + (3 + r() * 1.6).toFixed(1) + 's';
      field.appendChild(chip);
    });
    el.appendChild(field);
    return { el: el, n: 1, set: function (step) { el.classList.toggle('dk-sorted', step >= 1); } };
  };
  T.frames = function (s, C) {
    var el = slideEl('frames'), box = h('div', 'dk-fm'), ls = h('div', 'dk-fls'), lines = s.lines || [], mx = 0;
    box.appendChild(label(s.label, 0, 1));
    lines.forEach(function (t, k) {
      mx = Math.max(mx, t.length);
      var p = h('div', 'dk-fln dk-fr dk-b'), parts = t.split(/_{3,}/);
      parts.forEach(function (x, i) { if (x) p.appendChild(d.createTextNode(x)); if (i < parts.length - 1) p.appendChild(h('span', 'dk-bl')); });
      p.setAttribute('data-b', k + 1); ls.appendChild(p);
    });
    ls.style.setProperty('--ff', fs(mx, [[22, 132], [44, 116], [999, 96]]) + 'px');
    box.appendChild(ls); el.appendChild(box);
    return { el: el, n: lines.length };
  };
  T.exit = function (s, C) {
    var el = slideEl('exit'), box = h('div', 'dk-ex'), l = h('div', 'dk-ex-l'), p = hd(2, 'dk-ep dk-h', s.prompt || ''), icw = h('div', 'dk-ex-ic'), i = ic(s.icon || 'door-open', '', 1);
    el.appendChild(motif(C.theme.motif, C));
    p.style.setProperty('--ef', fs((s.prompt || '').length, [[40, 136], [80, 112], [999, 90]]) + 'px');
    l.appendChild(label(s.label, 0, 1)); l.appendChild(E(p, 1)); box.appendChild(l);
    i.style.setProperty('--db', '.9s'); icw.appendChild(i); box.appendChild(icw); el.appendChild(box);
    return { el: el, n: 0 };
  };
  T.credits = function (s, C) {
    var el = slideEl('credits'), box = h('div', 'dk-cr'), list = C.deck.credits || [], per = 8, pages = Math.max(1, Math.ceil(list.length / per)), pg = [], host = h('div', 'dk-crg');
    box.appendChild(label('Picture credits', 0, 1));
    function link(a, u) { if (/^https?:[/][/]/i.test(u || '')) { a.href = u; a.target = '_blank'; a.rel = 'noopener'; } }
    function host2(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return 'source'; } }
    for (var p = 0; p < pages; p++) {
      var pgEl = h('div', 'dk-cp' + (p === 0 ? ' dk-on' : ''));
      list.slice(p * per, p * per + per).forEach(function (c) {
        var row = h('div', 'dk-cre'), th = h('div', 'dk-cth'), tx = h('div', 'dk-ctx'), a1 = h('a'), a2 = h('a'), l3 = h('span');
        var im = C.deck.images && C.deck.images[c.slot];
        th.appendChild(ph(C, c.slot, { bg: 1, fr: .1 }));
        tx.appendChild(h('span', 'dk-ctt', c.title || c.slot));
        tx.appendChild(h('span', 'dk-ctc', 'by ' + (c.creator || 'unknown')));
        a1.textContent = c.license || 'licence'; link(a1, c.licenseUrl);
        a2.textContent = host2(c.page || c.source || ''); link(a2, c.page || c.source);
        l3.appendChild(a1); l3.appendChild(d.createTextNode('  ·  ')); l3.appendChild(a2); tx.appendChild(l3);
        row.appendChild(th); row.appendChild(tx); pgEl.appendChild(row);
      });
      pg.push(pgEl); host.appendChild(pgEl);
    }
    if (!list.length) host.appendChild(h('div', 'dk-sub', 'No pictures are used in this lesson.'));
    box.appendChild(host);
    el.appendChild(box);
    return { el: el, n: pages - 1, fin: 0, set: function (step) { pg.forEach(function (x, j) { x.classList.toggle('dk-on', j === step); }); } };
  };
  T.board = function (s, C) {
    var el = slideEl('board'), box = h('div', 'dk-bd'), t = h('div', 'dk-bdt'), p = h('div', 'dk-bdx dk-fr'), text = s.text || '';
    el.appendChild(ph(C, s.img || 'cover', { bg: 1, cls: 'dk-blur' }));
    el.appendChild(h('div', 'dk-scr dk-scr-c'));
    el.appendChild(motif(C.theme.motif, C));
    p.textContent = nb(text); p.style.setProperty('--bf', fs(text.length, [[50, 150], [100, 120], [160, 96], [240, 78], [400, 64], [600, 54], [99999, 44]]) + 'px');
    box.appendChild(label(s.label, 0, 1)); t.appendChild(E(p, 1)); box.appendChild(t); el.appendChild(box);
    return { el: el, n: 0 };
  };
  T.fact = function (s, C) {
    var el = slideEl('fact'), box = h('div', 'dk-ft'), b = h('div', 'dk-ftb'), num = String(s.num == null ? '' : s.num), text = s.text || '';
    el.appendChild(ph(C, s.img || 'cover', { bg: 1, cls: 'dk-blur' }));
    el.appendChild(h('div', 'dk-scr dk-scr-c'));
    el.appendChild(motif(C.theme.motif, C));
    var nm = h('div', 'dk-fnum dk-h', num);
    nm.style.setProperty('--nf', fs(num.length, [[5, 300], [10, 200], [16, 150], [999, 110]]) + 'px');
    var tx = h('div', 'dk-ftx dk-fr', nb(text)); tx.style.setProperty('--tx', fs(text.length, [[60, 92], [120, 78], [200, 64], [99999, 52]]) + 'px');
    box.appendChild(label(s.label, 0, 1)); b.appendChild(E(nm, 1)); b.appendChild(E(tx, 2)); box.appendChild(b); el.appendChild(box);
    return { el: el, n: 0 };
  };

    // the player
  function slots(s) {
    var o = [];
    function add(x) { if (x) o.push(x); }
    add(s.img); if (s.left) add(s.left.img); if (s.right) add(s.right.img); (s.items || []).forEach(function (i) { add(i.img); });
    if (s.type === 'board' || s.type === 'fact') o.push('cover');
    return o;
  }
  function mount(host, deck, opts) {
    opts = opts || {};
    var stat = !!opts.static, mini = !!opts.mini, ui = !mini, slides = deck.slides || [], N = slides.length, th = deck.theme || {};
    var reduced = !!(typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var root = h('div', 'dk' + (mini ? ' dk-mini' : '') + (stat ? ' dk-static' : '')), stage = h('div', 'dk-stage');
    var S = { i: -1, step: 0, cur: null, timers: {}, scale: mini ? .22 : 1, notes: false, alive: true }, CR = 2 * Math.PI * 54, ctl = {}, idleT = 0, tickIv = 0, swiped = false, sx = 0, sy = 0, apT = 0, outs = [], seen = {};
    theme(root, th);
    root.setAttribute('role', 'region'); root.setAttribute('aria-roledescription', 'presentation'); root.setAttribute('aria-label', deck.name || 'Lesson slides');
    if (opts.keys) root.tabIndex = -1;
    root.appendChild(stage);
    var live = h('div', 'dk-sr'); live.setAttribute('aria-live', 'polite'); live.setAttribute('role', 'status'); root.appendChild(live);

    function C(i) { return { deck: deck, theme: th, scale: S.scale, seed: i + 1, reduced: reduced }; }
    function build(i) {
      var s = slides[i], fn = T[s.type] || T.board, b;
      if (!T[s.type]) s = { type: 'board', label: s.label || s.type, text: s.title || s.prompt || s.text || '' };
      b = fn(s, C(i)); b.slide = s; b.idx = i;
      b.el.setAttribute('aria-label', (i + 1) + ' of ' + N);
      if (slides[i].timer) { b.el.classList.add('dk-tm'); b.el.appendChild(ring(i)); }
      return b;
    }
    function apply(b, step, prev, instant) {
      Array.prototype.forEach.call(b.el.querySelectorAll('[data-b]'), function (n) {
        var on = +n.getAttribute('data-b') <= step; n.classList.toggle('dk-on', on);
        if (on) n.removeAttribute('aria-hidden'); else n.setAttribute('aria-hidden', 'true');
      });
      if (b.set) b.set(step, prev, instant);
    }

    // timer ring
    function ring(i) {
      var t = timer(i), b = h('button', 'dk-ring');
      b.type = 'button'; b.style.setProperty('--c', CR.toFixed(1));
      b.innerHTML = '<svg viewBox="0 0 128 128" aria-hidden="true"><circle class="dk-rt" cx="64" cy="64" r="54"/><circle class="dk-rp" cx="64" cy="64" r="54"/></svg><span class="dk-rx" aria-hidden="true"></span>';
      b.addEventListener('click', function (e) { e.stopPropagation(); toggleTimer(); });
      t.ring = b; paint(t);
      return b;
    }
    function timer(i) { var s = slides[i]; return s && s.timer ? (S.timers[i] || (S.timers[i] = { total: s.timer, left: s.timer, run: false, end: 0, ring: null })) : null; }
    function paint(t) {
      if (!t || !t.ring) return;
      t.ring.querySelector('.dk-rx').textContent = fmt(t.left);
      t.ring.style.setProperty('--o', t.left === 0 ? 0 : (CR * (1 - t.left / t.total)).toFixed(1));
      t.ring.classList.toggle('is-run', t.run); t.ring.classList.toggle('is-low', t.run && t.left > 0 && t.left <= 10); t.ring.classList.toggle('is-done', t.left === 0);
      t.ring.setAttribute('aria-label', 'Timer ' + fmt(t.left) + (t.left === 0 ? ', time is up' : t.run ? ', running. Press T to pause.' : '. Press T to start.'));
    }
    function stopT(t) { if (!t) return; if (t.run) t.left = Math.max(0, Math.ceil((t.end - Date.now()) / 1000)); t.run = false; paint(t); }
    function tick() {
      var t = S.cur && timer(S.i); if (!t || !t.run) return;
      t.left = Math.max(0, Math.ceil((t.end - Date.now()) / 1000));
      if (t.left === 0) { t.run = false; live.textContent = 'Time is up.'; }
      paint(t);
    }
    function toggleTimer() {
      var t = S.cur && timer(S.i); if (!t || t.left === 0) return;
      if (t.run) stopT(t); else { t.run = true; t.end = Date.now() + t.left * 1000; paint(t); }
    }
    function resetTimer() { var t = S.cur && timer(S.i); if (!t) return; t.run = false; t.left = t.total; paint(t); }

    // notes
    function notesText() { var s = slides[S.i]; return (s && s.notes) || 'No notes for this slide.'; }
    function toggleNotes(on) {
      if (!ctl.notes) return;
      S.notes = on == null ? !S.notes : !!on;
      ctl.notes.classList.toggle('is-open', S.notes); root.classList.toggle('dk-notes-open', S.notes); ctl.notes.setAttribute('aria-hidden', S.notes ? 'false' : 'true');
      if (ctl.nbtn) ctl.nbtn.setAttribute('aria-expanded', S.notes ? 'true' : 'false');
    }

    // moving
    function sizes() {
      Array.prototype.forEach.call(root.querySelectorAll('img[data-fr]'), function (im) { im.sizes = Math.ceil(+im.getAttribute('data-fr') * W * S.scale) + 'px'; });
    }
    function fit() {
      var w = root.clientWidth, hh = root.clientHeight; if (!w || !hh) return;
      var sc = Math.min(w / W, hh / H);
      stage.style.transform = 'translate(' + ((w - W * sc) / 2) + 'px,' + ((hh - H * sc) / 2) + 'px) scale(' + sc + ')';
      if (Math.abs(sc - S.scale) > .001) { S.scale = sc; sizes(); }
    }
    function preload(i) {
      for (var k = i + 1; k <= i + 2 && k < N; k++) slots(slides[k]).forEach(function (slot) {
        var im = deck.images && deck.images[slot], u = im && (mini ? im.w480 : S.scale > .55 ? im.w1920 : im.w960);
        if (u && !seen[u]) { seen[u] = 1; new Image().src = u; }
      });
    }
    function chrome() {
      var b = S.cur, last = S.i === N - 1 && S.step >= b.n;
      if (ctl.count) ctl.count.textContent = (S.i + 1) + ' of ' + N;
      if (ctl.back) ctl.back.disabled = S.i === 0 && S.step === 0;
      if (ctl.next) ctl.next.disabled = last;
      if (ctl.nt) ctl.nt.textContent = notesText();
      if (ctl.prog) ctl.prog.style.setProperty('--p', N > 1 ? ((S.i + (b.n ? S.step / (b.n + 1) : 0)) / (N - 1)).toFixed(4) : 1);
    }
    function show(i, dir) {
      if (i < 0 || i >= N) return;
      var old = S.cur, back = dir < 0, b, step, first = !old;
      stopT(old && timer(S.i));
      b = build(i);
      step = stat ? (b.fin != null ? b.fin : b.n) : (back ? b.n : 0);
      if (!stat && !back) b.el.classList.add('dk-live');
      if (!stat && !first) b.el.classList.add('dk-pre');
      apply(b, step, null, true);
      stage.appendChild(b.el);
      if (old) {
        old.el.classList.add('dk-out'); old.el.style.pointerEvents = 'none';
        var oe = old.el; outs.push(oe); setTimeout(function () { oe.remove(); outs = outs.filter(function (x) { return x !== oe; }); }, stat ? 0 : 520);
      }
      if (b.el.classList.contains('dk-pre')) { void b.el.offsetWidth; requestAnimationFrame(function () { b.el.classList.remove('dk-pre'); }); }
      S.cur = b; S.i = i; S.step = step;
      var s = slides[i], t = timer(i);
      if (t) { t.ring = b.el.querySelector('.dk-ring'); paint(t); }
      live.textContent = 'Slide ' + (i + 1) + ' of ' + N + '. ' + (s.title || s.label || s.q || s.prompt || s.text || s.type || '');
      sizes(); preload(i); chrome();
      if (opts.onChange) opts.onChange(i, N);
    }
    function setStep(n) {
      var b = S.cur, prev = S.step; S.step = n; apply(b, n, prev, false); chrome();
    }
    function next() { if (!S.cur) return; if (S.step < S.cur.n) setStep(S.step + 1); else if (S.i < N - 1) show(S.i + 1, 1); }
    function prev() { if (!S.cur) return; if (S.step > 0) setStep(S.step - 1); else if (S.i > 0) show(S.i - 1, -1); }
    function go(i) { show(Math.max(0, Math.min(N - 1, i)), i < S.i ? -1 : 1); }

    // chrome (controls, progress, notes)
    if (ui) {
      ctl.prog = h('div', 'dk-prog'); ctl.prog.appendChild(h('i')); ctl.prog.setAttribute('aria-hidden', 'true'); root.appendChild(ctl.prog);
      var bar = h('div', 'dk-ctl'), mk = function (t, a, cls) { var b = h('button', 'dk-cb' + (cls ? ' ' + cls : ''), t); b.type = 'button'; if (a) b.setAttribute('aria-label', a); return b; };
      ctl.back = mk('Back', 'Previous'); ctl.count = h('span', 'dk-cn', ''); ctl.next = mk('Next', 'Next', 'dk-go');
      ctl.nbtn = mk('Notes', 'Notes (N)'); ctl.nbtn.setAttribute('aria-expanded', 'false');
      bar.appendChild(ctl.back); bar.appendChild(ctl.count); bar.appendChild(ctl.next); bar.appendChild(h('i', 'dk-sep'));
      bar.appendChild(ctl.nbtn);
      if (opts.onExit) { ctl.exit = mk('Exit', 'Exit present mode'); bar.appendChild(ctl.exit); ctl.exit.addEventListener('click', function () { opts.onExit(); }); }
      root.appendChild(bar);
      ctl.notes = h('div', 'dk-notes'); ctl.notes.setAttribute('aria-hidden', 'true'); ctl.notes.setAttribute('role', 'region'); ctl.notes.setAttribute('aria-label', 'Teacher notes');
      var nh = h('div', 'dk-nh'), cl = h('button', '', 'Close (N)'); cl.type = 'button';
      nh.appendChild(h('span', '', 'Teacher notes')); nh.appendChild(cl); ctl.nt = h('div', 'dk-nt'); ctl.notes.appendChild(nh); ctl.notes.appendChild(ctl.nt); root.appendChild(ctl.notes);
      ctl.back.addEventListener('click', function () { prev(); focusRoot(); });
      ctl.next.addEventListener('click', function () { next(); focusRoot(); });
      ctl.nbtn.addEventListener('click', function () { toggleNotes(); });
      cl.addEventListener('click', function () { toggleNotes(false); focusRoot(); });
    }
    function focusRoot() { if (opts.keys) root.focus(); }
    function wake() {
      root.classList.remove('dk-idle'); clearTimeout(idleT);
      idleT = setTimeout(function () { if (!root.contains(d.activeElement) || d.activeElement === root || !d.activeElement.closest('.dk-ctl')) root.classList.add('dk-idle'); }, 2500);
    }
    if (ui) {
      root.addEventListener('pointermove', wake); root.addEventListener('pointerdown', wake); wake();
      root.addEventListener('click', function (e) {
        if (swiped || (e.target.closest && e.target.closest('a,button,.dk-ctl,.dk-notes'))) return;
        var r = root.getBoundingClientRect(); ((e.clientX - r.left) / r.width < 1 / 3) ? prev() : next();
      });
      root.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { passive: true });
      root.addEventListener('touchend', function (e) {
        var t = e.changedTouches && e.changedTouches[0]; if (!t || (e.target.closest && e.target.closest('a,button'))) return;
        var dx = t.clientX - sx, dy = t.clientY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; setTimeout(function () { swiped = false; }, 450); dx < 0 ? next() : prev(); }
      }, { passive: true });
    }

    function fullscreen() {
      if (opts.onFullscreen) return opts.onFullscreen();
      try { if (d.fullscreenElement) d.exitFullscreen(); else if (host.requestFullscreen) host.requestFullscreen(); } catch (e) { /* not allowed */ }
    }
    function onKey(e) {
      if (!S.alive) return;
      e.stopPropagation();   // the page's own shortcuts (/ and Ctrl+K search) stay out of the room
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key, t = e.target, onBtn = t && (t.tagName === 'BUTTON' || t.tagName === 'A') && (k === 'Enter' || k === ' ');
      if (k === 'Escape') { e.preventDefault(); if (S.notes) { toggleNotes(false); } else if (opts.onExit) opts.onExit(); }
      else if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !onBtn)) { e.preventDefault(); next(); }
      else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); prev(); }
      else if (k === 'Home') { e.preventDefault(); go(0); }
      else if (k === 'End') { e.preventDefault(); go(N - 1); }
      else if (k === 't' || k === 'T') { e.preventDefault(); toggleTimer(); }
      else if (k === 'r' || k === 'R') { e.preventDefault(); resetTimer(); }
      else if (k === 'n' || k === 'N') { e.preventDefault(); toggleNotes(); }
      else if (k === 'f' || k === 'F') { e.preventDefault(); fullscreen(); }
      else if (k === 'Tab' && opts.trap) {
        var f = Array.prototype.filter.call(root.querySelectorAll('button,a[href]'), function (x) { return !x.disabled && x.getClientRects().length && getComputedStyle(x).visibility !== 'hidden'; });
        if (!f.length) { e.preventDefault(); return; }
        var a = d.activeElement;
        if (e.shiftKey && (a === f[0] || a === root)) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }
    if (opts.keys) d.addEventListener('keydown', onKey, true);

    host.appendChild(root);
    fit();
    var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(root); else window.addEventListener('resize', fit);
    if (!mini) tickIv = setInterval(tick, 250);
    show(Math.max(0, Math.min(N - 1, opts.start || 0)), 1);
    if (opts.keys) root.focus();

    if (opts.autoplay && !reduced && N > 1) {
      var auto = function () {
        apT = setTimeout(function () {
          if (!S.alive) return;
          if (d.hidden) return auto();
          if (S.step < S.cur.n) { setStep(S.step + 1); apT = setTimeout(auto, 900); } else show((S.i + 1) % N, 1), auto();
        }, S.step < S.cur.n ? 900 : opts.autoplay);
      };
      auto();
    }
    return {
      el: root, next: next, prev: prev, goto: go, toggleNotes: toggleNotes, toggleTimer: toggleTimer, resetTimer: resetTimer,
      get index() { return S.i; }, get step() { return S.step; }, get builds() { return S.cur.n; },
      setStep: function (n) { setStep(Math.max(0, Math.min(S.cur.n, n))); },
      destroy: function () {
        S.alive = false; clearInterval(tickIv); clearTimeout(apT); clearTimeout(idleT);
        if (opts.keys) d.removeEventListener('keydown', onKey, true);
        if (ro) ro.disconnect(); else window.removeEventListener('resize', fit);
        root.remove();
      }
    };
  }
  function render(slide, deck, opts) {
    var host = h('div'), o = {}, k;
    for (k in (opts || {})) o[k] = opts[k];
    o.mini = o.mini !== false; o.static = true;
    var one = {}; for (k in deck) one[k] = deck[k]; one.slides = [slide];
    mount(host, one, o);
    return host.firstChild;
  }
  window.EEDeck = { mount: mount, render: render, icons: Object.keys(ICONS), types: TYPES, motifs: MOTIFS };
}());
