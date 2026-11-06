/* The Everything Educator: PRESENT MODE deck engine. Vanilla, no library, no network.
   window.EEDeck = { mount(el, deck, opts), render(slide, deck, opts), icons, types }
   deck = { slug, name, theme:{canvas,accent,accent2,motif}, slides:[...], images:{slot:{w480,w960,w1920,focal,treat,alt}}, credits:[...], maps:{name:url} }
   Deck v2 (Nov 2026) adds slide types vote, mc, spot, map, count, spinner, turntalk, a drag sort, `doodles:[{kind,target,at}]` on any
   slide and `canvas:"paper"` (see the "v2" blocks below).
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
  var d = typeof document !== 'undefined' ? document : null, SRC = d && d.currentScript ? d.currentScript.src : '', dq = [];
  function needDraw(cb) {
    if (window.EEDraw) return cb(window.EEDraw);
    dq.push(cb); if (!SRC || needDraw.l) return; needDraw.l = 1;
    var e = d.createElement('script'); e.async = true; e.src = SRC.replace(/deck\.js(\?.*)?$/, 'deck-draw.js'); e.onload = function () { dq.splice(0).forEach(function (f) { f(window.EEDraw); }); }; d.head.appendChild(e);
  }
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
    "calendar": "<path d=\"M8 2v4\"/><path d=\"M16 2v4\"/><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"/><path d=\"M3 10h18\"/>",
    "x": "<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>",
    "map-pin": "<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>",
    "message-circle": "<path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\"/>",
    "languages": "<path d=\"m5 8 6 6\"/><path d=\"m4 14 6-6 2-3\"/><path d=\"M2 5h12\"/><path d=\"M7 2h1\"/><path d=\"m22 22-5-10-5 10\"/><path d=\"M14 18h6\"/>",
    "scale": "<path d=\"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z\"/><path d=\"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z\"/><path d=\"M7 21h10\"/><path d=\"M12 3v18\"/><path d=\"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2\"/>"
  };
  var TYPES = ['cover', 'hook', 'bignum', 'timeline', 'compare', 'quiz', 'task', 'statement', 'cards', 'sort', 'frames', 'exit', 'credits', 'board', 'fact', 'vote', 'mc', 'spot', 'map', 'count', 'spinner', 'turntalk'];
  var MOTIFS = ['poppies', 'papel-picado', 'snow', 'leaves', 'confetti', 'candle-glow', 'sparkle', 'grid', 'none'];

  function h(tag, cls, text) { var n = d.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
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

  function ph(C, slot, o) {
    o = o || {};
    var im = slot && C.deck.images && C.deck.images[slot], box = h('div', 'dk-ph' + (o.cls ? ' ' + o.cls : ''));
    box.setAttribute('data-slot', slot || '');
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

  var CR2 = 2 * Math.PI * 54;
  function sv(html) { var w = h('span'); w.innerHTML = html; return w.firstChild; }
  function f1(v) { return v.toFixed(1); }
  function pt(q) { return f1(q[0]) + ' ' + f1(q[1]); }
  function poly(p) { return 'M' + pt(p[0]) + p.slice(1).map(function (q) { return 'L' + pt(q); }).join(''); }
  function smooth(p) { var s = 'M' + pt(p[0]), i; for (i = 1; i < p.length - 1; i++) s += 'Q' + pt(p[i]) + ' ' + pt([(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2]); return s + 'L' + pt(p[p.length - 1]); }
  function wob(r, a, b, k, amp) {
    var p = [], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, i, t, o;
    for (i = 0; i <= k; i++) { t = i / k; o = i && i < k ? (r() - .5) * 2 * (amp || 4) : 0; p.push([a[0] + dx * t - dy / L * o, a[1] + dy * t + dx / L * o]); }
    return smooth(p);
  }
  var DOODLE = {
    circle: function (r, R, U) {
      var cx = U.w / 2, cy = U.h / 2, rx = U.w / 2 * 1.04 + 26, ry = U.h / 2 + 6, a0 = r() * 6.28, n = 36, p = [], k, a, q;
      for (k = 0; k <= n + 3; k++) { a = a0 + k / n * 6.2832; q = 1 - k / (n * 22) + (r() - .5) * .05; p.push([cx + rx * q * Math.cos(a), cy + ry * q * Math.sin(a)]); }
      return [smooth(p)];
    },
    underline: function (r, R) {
      return R.map(function (q) { var y = q.y + q.h * .88; return wob(r, [q.x - 4, y + r() * 4], [q.x + q.w + 6, y + r() * 4], 6, 2.5) + wob(r, [q.x + q.w * .1, y + q.h * .07], [q.x + q.w * .66, y + q.h * .08 + r() * 3], 4, 1.5); });
    },
    box: function (r, R, U) {
      var j = function () { return (r() - .5) * 10; }, a = [-14 + j(), -12 + j()], b = [U.w + 14 + j(), -10 + j()], c = [U.w + 12 + j(), U.h + 12 + j()], e = [-12 + j(), U.h + 10 + j()];
      return [wob(r, a, b, 5, 3) + wob(r, b, c, 4, 3) + wob(r, c, e, 5, 3) + wob(r, e, [a[0] + 6, a[1] + 12], 4, 3), wob(r, [a[0] + 5, a[1] + 6], [b[0] - 4, b[1] + 8], 4, 3)];
    },
    arrow: function (r, R, U, o) {
      var dir = o.dir || 'r', w = U.w, g = U.h, T, S, m, ux, uy, L, hl = 40;
      if (dir === 'l') { T = [-14, g / 2]; S = [-190, g / 2 + 110]; } else if (dir === 't') { T = [w / 2, -14]; S = [w / 2 + 120, -170]; } else if (dir === 'b') { T = [w / 2, g + 14]; S = [w / 2 + 120, g + 170]; } else { T = [w + 14, g / 2]; S = [w + 190, g / 2 + 110]; }
      m = [(S[0] + T[0]) / 2 + (S[1] - T[1]) * .18, (S[1] + T[1]) / 2 - (S[0] - T[0]) * .18];
      L = Math.hypot(T[0] - m[0], T[1] - m[1]) || 1; ux = (T[0] - m[0]) / L; uy = (T[1] - m[1]) / L;
      var wing = function (a) { var c = Math.cos(a), s = Math.sin(a); return [T[0] - hl * (ux * c - uy * s), T[1] - hl * (ux * s + uy * c)]; };
      return ['M' + pt(S) + 'Q' + pt(m) + ' ' + pt(T), 'M' + pt(wing(.5)) + 'L' + pt(T) + 'L' + pt(wing(-.5))];
    },
    star: function (r, R, U) {
      var rr = Math.max(34, Math.min(U.h * .45, 70)), cx = U.w + rr * .55, cy = -rr * .1, p = [], k, a, q;
      for (k = 0; k <= 10; k++) { a = -Math.PI / 2 + k * Math.PI / 5; q = (k % 2 ? .46 : 1) * rr * (1 + (r() - .5) * .08); p.push([cx + q * Math.cos(a), cy + q * Math.sin(a)]); }
      return [poly(p)];
    },
    check: function (r, R, U) {
      var z = Math.max(54, Math.min(U.h * .9, 120)), x = U.w + 26, y = U.h / 2 - z * .5;
      return ['M' + pt([x, y + z * .5]) + 'Q' + pt([x + z * .18, y + z * .78]) + ' ' + pt([x + z * .4, y + z]) + 'Q' + pt([x + z * .7, y + z * .4]) + ' ' + pt([x + z * 1.2, y])];
    }
  };
  var FIELD = { title: '.dk-cov .dk-h,.dk-tt,.dk-ct', label: '.dk-label', sub: '.dk-sub', q: '.dk-q', prompt: '.dk-hq,.dk-cpr,.dk-ep,.dk-tp,.dk-sp,.dk-sq', text: '.dk-sm,.dk-bdx,.dk-ftx,.dk-vs,.dk-sd', num: '.dk-fnum', value: '.dk-num', line: '.dk-bnl,.dk-cnl,.dk-fln', why: '.dk-why' };
  var PAPER = ['hook', 'compare', 'quiz', 'mc', 'task', 'cards', 'sort', 'frames', 'exit', 'vote', 'map', 'count', 'spinner', 'turntalk', 'timeline'];
  function textRects(host, a, b) {
    var tw = d.createTreeWalker(host, 4), i = 0, re = /\S+/g, rg = d.createRange(), n, m, got = 0, hr = host.getBoundingClientRect(), k = host.offsetWidth ? hr.width / host.offsetWidth : 1, lines = [];
    while ((n = tw.nextNode())) { re.lastIndex = 0; while ((m = re.exec(n.nodeValue))) { i++; if (i >= a && i <= b) { if (!got) rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length); got = 1; } } }
    if (!got) return [];
    Array.prototype.slice.call(rg.getClientRects()).filter(function (q) { return q.width > 1; }).sort(function (p, q) { return p.top - q.top; }).forEach(function (q) {
      var l = lines[lines.length - 1];
      if (l && q.top < l.top + l.height * .6) { l.left = Math.min(l.left, q.left); l.right = Math.max(l.right, q.right); l.bottom = Math.max(l.bottom, q.bottom); } else lines.push({ left: q.left, right: q.right, top: q.top, bottom: q.bottom, height: q.height });
    });
    return lines.map(function (l) { return { x: (l.left - hr.left) / k, y: (l.top - hr.top) / k, w: (l.right - l.left) / k, h: (l.bottom - l.top) / k }; });
  }
  function placeDoodles(b, step) {
    var ds = b.slide.doodles, sl = b.el, live;
    if (!ds || !ds.length) return;
    live = sl.classList.contains('dk-live'); if (live) sl.classList.remove('dk-live'); void sl.offsetWidth;
    ds.forEach(function (o, k) {
      var r = rng((b.idx + 3) * 7919 + k * 131), tg = o.target, host = sl, R, U, m, L, at = o.at | 0, fn = DOODLE[o.kind], bw = W, bh = H, svg, x0, y1;
      if (!fn) return;
      if (Array.isArray(tg)) { U = { x: tg[0] / 100 * W, y: tg[1] / 100 * H, w: tg[2] / 100 * W, h: tg[3] / 100 * H }; R = [{ x: 0, y: 0, w: U.w, h: U.h }]; }
      else {
        m = /^(\w+)(?::(\d+)(?:-(\d+))?)?$/.exec(tg || ''); host = m && FIELD[m[1]] && sl.querySelector(FIELD[m[1]]);
        if (!host || !host.offsetWidth) return;
        bw = host.offsetWidth; bh = host.offsetHeight;
        L = textRects(host, m[2] ? +m[2] : 1, m[2] ? +(m[3] || m[2]) : 1e9); if (!L.length) return;
        x0 = Math.min.apply(null, L.map(function (q) { return q.x; })); y1 = Math.min.apply(null, L.map(function (q) { return q.y; }));
        U = { x: x0, y: y1, w: Math.max.apply(null, L.map(function (q) { return q.x + q.w; })) - x0, h: Math.max.apply(null, L.map(function (q) { return q.y + q.h; })) - y1 };
        R = L.map(function (q) { return { x: q.x - U.x, y: q.y - U.y, w: q.w, h: q.h }; });
      }
      svg = sv('<svg class="dk-dd' + (at ? '' : ' dk-d0') + '" data-b="' + at + '" aria-hidden="true" viewBox="0 0 ' + f1(U.w) + ' ' + f1(U.h) + '" preserveAspectRatio="none" style="left:' + (U.x / bw * 100).toFixed(3) + '%;top:' + (U.y / bh * 100).toFixed(3) + '%;width:' + (U.w / bw * 100).toFixed(3) + '%;height:' + (U.h / bh * 100).toFixed(3) + '%">' +
        fn(r, R, { w: U.w, h: U.h }, o).map(function (p, j) { return '<path pathLength="1" style="--j:' + j + '" d="' + p + '"/>'; }).join('') + '</svg>');
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.appendChild(svg);
      if (at <= step) svg.classList.add('dk-on');
    });
    if (live) sl.classList.add('dk-live');
  }

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
      var tile = h('div', 'dk-tile'), tin = h('div', 'dk-tile-in'), f0 = h('div', 'dk-face dk-f0', '?'), f1 = h('div', 'dk-face dk-f1'), tx = h('div', 'dk-chip-t dk-fr', c);
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
      var gh = h('div', 'dk-tgh'); gh.setAttribute('aria-hidden', 'true'); gh.appendChild(h('div', 'dk-yr dk-fr', it.year)); gh.appendChild(h('div', 'dk-ndot')); nd.appendChild(gh);
    });
    el.appendChild(tl);
    return { el: el, n: N, set: function (step) { line.style.setProperty('--o', step < 1 ? 1 : (1 - (cxs[step - 1] - x0) / (x1 - x0)).toFixed(4)); } };
  };
  function ccard(c, C, side) {
    var card = h('div', 'dk-cc dk-b ' + side), top = h('div', 'dk-cph'), body = h('div', 'dk-cbody');
    top.appendChild(ph(C, c.img, { fr: .4, kb: 1 }));
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
    var mc = s.type === 'mc', sec = mc && s.seconds !== 0 ? (s.seconds || 20) : 0, last = sec ? 2 : 1, el = slideEl('quiz'), box = h('div', 'dk-qz' + (s.img ? ' dk-qimg' : '')), opts = s.options || [], n = opts.length;
    var long = opts.some(function (o) { return o.length > 28; }), tiles = [], ringEl = null, iv = 0, t0 = 0, pick = -1;
    if (mc) el.classList.add('dk-mc');
    if (s.img) { var pw = h('div', 'dk-qph'); pw.appendChild(ph(C, s.img, { kb: 1, fr: .32 })); el.appendChild(pw); }
    box.appendChild(label(s.label, 0, 1));
    box.appendChild(E(hd(2, 'dk-q dk-h', s.q || ''), 1));
    var grid = h('div', 'dk-opts');
    grid.style.gridTemplateColumns = 'repeat(' + (s.img ? (n === 4 ? 2 : 1) : n === 2 ? (long ? 1 : 2) : n === 3 ? (long ? 1 : 3) : n === 4 ? 2 : 1) + ',1fr)';
    opts.forEach(function (o, k) {
      var t = h(mc ? 'button' : 'div', 'dk-opt' + (k === s.answer ? ' dk-ok' : '') + (mc ? ' dk-c' + (k % 4) + ' dk-x' : '')), b = h('div', 'dk-ob', String.fromCharCode(65 + k)), tx = h('div', 'dk-ot dk-fr', o);
      b.insertAdjacentHTML('beforeend', '<svg class="dk-ck" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M5 12.5L10 17.5L19.5 7"/></svg>');
      tx.style.fontSize = Math.round((o.length > 40 ? 52 : o.length > 22 ? 60 : 72) * (n >= 3 ? .86 : 1) * (s.img ? .8 : 1)) + 'px';
      t.appendChild(b); t.appendChild(tx); E(t, k + 2); grid.appendChild(t); tiles.push(t);
      if (mc) {
        t.type = 'button'; t.setAttribute('aria-pressed', 'false');
        t.addEventListener('click', function () { if (el.classList.contains('dk-revealed')) return; pick = pick === k ? -1 : k; tiles.forEach(function (x, j) { x.classList.toggle('is-pick', j === pick); x.setAttribute('aria-pressed', j === pick ? 'true' : 'false'); }); });
      }
    });
    box.appendChild(grid);
    var why = h('div', 'dk-why dk-b', s.why || ''); why.setAttribute('data-b', last); box.appendChild(why);
    el.appendChild(box);
    function paint(left) { ringEl.style.setProperty('--o', (CR2 * (1 - left / sec)).toFixed(1)); ringEl.querySelector('.dk-rx').textContent = fmt(left); ringEl.classList.toggle('is-low', iv && left > 0 && left <= 5); ringEl.classList.toggle('is-done', left === 0); }
    function stop() { clearInterval(iv); iv = 0; }
    if (sec) {
      ringEl = h('div', 'dk-ring dk-mr'); ringEl.style.setProperty('--c', CR2.toFixed(1)); ringEl.setAttribute('aria-hidden', 'true');
      ringEl.innerHTML = '<svg viewBox="0 0 128 128"><circle class="dk-rt" cx="64" cy="64" r="54"/><circle class="dk-rp" cx="64" cy="64" r="54"/></svg><span class="dk-rx"></span>';
      el.appendChild(ringEl); paint(sec);
    }
    return { el: el, n: last, set: function (step, prev, instant) {
      var rev = step >= last;
      el.classList.toggle('dk-revealed', rev);
      if (ringEl) {
        stop(); ringEl.classList.toggle('dk-hide', rev);
        if (!rev && step === 1) { t0 = Date.now(); paint(sec); iv = setInterval(function () { var left = Math.max(0, Math.ceil((t0 + sec * 1000 - Date.now()) / 1000)); if (!el.isConnected) return stop(); paint(left); if (!left) stop(); }, 250); }
        else if (!rev) paint(sec);
      }
      if (rev && prev != null && prev < last && !instant && tiles[s.answer]) confetti(el, tiles[s.answer], C);
    } };
  };
  T.mc = T.quiz;
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
    el.appendChild(h('div', 'dk-scr dk-scr-' + (s.scrim === 'side' ? 'a' : 'c')));
    if (s.scrim === 'side') el.classList.add('dk-sside');
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
    var el = slideEl('sort'), it = s.items || [], g = s.groups || ['', ''], n = it.length, r = rng(C.seed + 11), field = h('div', 'dk-so'), chips = [], bins = [[], []], stack = [], order = [];
    var BX = [130, 1010], BW = 780, BT = 500, BB = 1036, ROW = 74, pos = [], i;
    field.appendChild(label(s.label, 0, 1));
    if (s.sub) field.appendChild(E(h('div', 'dk-pill dk-p2 dk-sosub', s.sub), 1));
    var binEls = g.map(function (name, q) {
      var b = h('div', 'dk-bin'); b.style.cssText = 'left:' + BX[q] + 'px;top:' + BT + 'px;width:' + BW + 'px;height:' + (BB - BT) + 'px';
      b.appendChild(hd(2, 'dk-gh dk-h', name)); field.appendChild(E(b, q + 2)); return b;
    });
    var rows = [], row = null, x, wd, y0 = 200, bh = 66;
    it.forEach(function (c, q) {
      wd = 118 + c.text.length * 14.8;
      if (!row || row.w + wd + 24 > 1680) { row = { w: 0, items: [] }; rows.push(row); }
      row.items.push({ q: q, w: wd }); row.w += wd + 24;
    });
    var step = rows.length > 1 ? Math.min(bh + 18, (424 - y0) / (rows.length - 1)) : 0;
    rows.forEach(function (rw, ri) {
      x = 120 + (1680 - rw.w + 24) / 2;
      rw.items.forEach(function (o) { pos[o.q] = { x: x + (r() * 14 - 7), y: y0 + ri * step + (r() * 10 - 5), r: r() * 5 - 2.5 }; x += o.w + 24; });
    });
    it.forEach(function (c, q) {
      var chip = h('div', 'dk-chip dk-x'), inn = h('div', 'dk-ci'), ob = { el: chip, g: c.group === 1 ? 1 : 0, q: q, placed: false, px: pos[q].x, py: pos[q].y, pr: pos[q].r };
      inn.appendChild(ic(c.icon)); inn.appendChild(h('span', '', c.text)); chip.appendChild(inn);
      chip.style.cssText = '--k:' + q + ';--bt:' + (3 + r() * 1.6).toFixed(1) + 's;translate:' + ob.px.toFixed(0) + 'px ' + ob.py.toFixed(0) + 'px;rotate:' + ob.pr.toFixed(1) + 'deg';
      chips.push(ob); field.appendChild(chip);
    });
    var a0 = chips.filter(function (c) { return !c.g; }), a1 = chips.filter(function (c) { return c.g; });
    for (i = 0; i < Math.max(a0.length, a1.length); i++) { if (a0[i]) order.push(a0[i]); if (a1[i]) order.push(a1[i]); }
    function lay(q) { bins[q].forEach(function (c, p) { c.el.style.translate = (BX[q] + 28) + 'px ' + (BT + 112 + p * ROW) + 'px'; c.el.style.rotate = '0deg'; }); }
    function put(c) { c.placed = true; c.el.classList.add('is-in'); bins[c.g].push(c); stack.push(c); lay(c.g); }
    function out(c) { c.placed = false; c.el.classList.remove('is-in'); bins[c.g].splice(bins[c.g].indexOf(c), 1); stack.splice(stack.indexOf(c), 1); lay(c.g); c.el.style.translate = c.px.toFixed(0) + 'px ' + c.py.toFixed(0) + 'px'; c.el.style.rotate = c.pr.toFixed(1) + 'deg'; }
    function home(c) { c.el.style.translate = c.px.toFixed(0) + 'px ' + c.py.toFixed(0) + 'px'; c.el.style.rotate = c.pr.toFixed(1) + 'deg'; }
    chips.forEach(function (c) {
      var e0 = null, sc = 1, bx, by;
      c.el.addEventListener('click', function (e) { e.stopPropagation(); });
      c.el.addEventListener('pointerdown', function (e) {
        if (c.placed || (e.button != null && e.button > 0)) return;
        var rr = el.getBoundingClientRect(); sc = rr.width / W || 1; e0 = e; bx = c.px; by = c.py;
        c.el.setPointerCapture(e.pointerId); c.el.classList.add('is-drag'); e.preventDefault();
      });
      c.el.addEventListener('pointermove', function (e) {
        if (!e0) return;
        var rr = el.getBoundingClientRect(), nx = bx + (e.clientX - e0.clientX) / sc, ny = by + (e.clientY - e0.clientY) / sc, px = (e.clientX - rr.left) / sc, py = (e.clientY - rr.top) / sc;
        c.el.style.translate = nx.toFixed(0) + 'px ' + ny.toFixed(0) + 'px'; c.el.style.rotate = '0deg';
        binEls.forEach(function (b, q) { b.classList.toggle('is-over', px > BX[q] && px < BX[q] + BW && py > BT && py < BB); });
      });
      function end(e) {
        if (!e0) return;
        var rr = el.getBoundingClientRect(), px = (e.clientX - rr.left) / sc, py = (e.clientY - rr.top) / sc, q = px > BX[0] && px < BX[0] + BW ? 0 : px > BX[1] && px < BX[1] + BW ? 1 : -1;
        e0 = null; c.el.classList.remove('is-drag'); binEls.forEach(function (b) { b.classList.remove('is-over'); });
        if (q >= 0 && py > BT && py < BB) {
          if (q === c.g) { put(c); C.go(Math.max(stack.length, 0)); }
          else { c.el.classList.remove('is-no'); void c.el.offsetWidth; c.el.classList.add('is-no'); home(c); }
        } else home(c);
      }
      c.el.addEventListener('pointerup', end); c.el.addEventListener('pointercancel', end);
    });
    if (s.done) field.appendChild(h('div', 'dk-sd dk-fr', s.done));
    el.appendChild(field);
    return { el: el, n: n, set: function (step) {
      while (stack.length < step) { var nx = order.filter(function (c) { return !c.placed; })[0]; if (!nx) break; put(nx); }
      while (stack.length > step) out(stack[stack.length - 1]);
      el.classList.toggle('dk-sorted', stack.length >= n);
    } };
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
        if (c.slot) th.appendChild(ph(C, c.slot, { bg: 1, fr: .1 })); else { th.classList.add('dk-cth-i'); th.appendChild(ic('map-pin')); }
        tx.appendChild(h('span', 'dk-ctt', c.title || c.slot));
        tx.appendChild(h('span', 'dk-ctc', 'by ' + (c.creator || 'unknown')));
        if (c.sketch) tx.appendChild(h('span', 'dk-ctc', c.sketch === 2 ? 'Sketch adapted from this photo, shared under the same licence' : c.sketch === 3 ? 'Sketch adapted from this photo' : 'Line drawing traced from the photo'));
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

  T.vote = function (s, C) {
    var el = slideEl('vote'), box = h('div', 'dk-vt'), cards = s.cards || [], N = cards.length, lab = s.labels || (s.mode === 'agree' ? ['Agree', 'Disagree'] : ['True', 'False']);
    var grid = s.layout ? s.layout === 'grid' : N > 3, cols = grid ? (N <= 2 ? N : N <= 4 ? 2 : 3) : 1, rows = Math.ceil(N / cols), vg = h('div', 'dk-vg' + (grid ? ' dk-vgrid' : '')), els = [], cnt = [], total = grid ? 2 * N : 3 * N - 1;
    box.appendChild(label(s.label, 0, 1));
    vg.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)'; vg.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
    cards.forEach(function (c, k) {
      var cd = h('div', 'dk-vc'), pw = h('div', 'dk-vpw'), pn = h('div', 'dk-vp'), an = h('div', 'dk-va'), has = typeof c.answer === 'boolean', st = h('div', 'dk-vs dk-fr', c.text), bar = h('div', 'dk-vbar');
      st.style.fontSize = (grid ? fs(c.text.length, [[44, 44], [80, 38], [999, 34]]) : fs(c.text.length, [[60, 104], [100, 88], [999, 72]])) + 'px';
      cnt[k] = [0, 0];
      lab.forEach(function (name, j) {
        var b = h('button', 'dk-vb dk-x dk-vb' + j), l = h('span', 'dk-vl', name), nn = h('span', 'dk-vn', '0');
        b.type = 'button'; b.appendChild(l); b.appendChild(nn);
        b.addEventListener('click', function () { if (!cd.classList.contains('is-open')) return; cnt[k][j]++; nn.textContent = cnt[k][j]; tally(k); });
        pn.appendChild(b);
      });
      bar.innerHTML = '<i class="dk-bt0"></i><i class="dk-bt1"></i>';
      an.innerHTML = has ? '<svg class="dk-mk ' + (c.answer ? 'dk-yes' : 'dk-no') + '" viewBox="0 0 100 100" aria-hidden="true">' + (c.answer ? '<path pathLength="1" d="M12 56Q24 66 38 82Q58 42 92 16"/>' : '<path pathLength="1" d="M18 18Q50 48 84 84"/><path pathLength="1" d="M84 16Q50 52 16 84"/>') + '</svg>' : '';
      var tx = h('div', 'dk-vtx'); if (has) tx.appendChild(h('div', 'dk-vv', c.answer ? lab[0] : lab[1])); tx.appendChild(h('div', 'dk-vw', c.why || '')); an.appendChild(tx);
      pw.appendChild(pn); pw.appendChild(an); cd.appendChild(st); cd.appendChild(pw); cd.appendChild(bar); vg.appendChild(cd); els.push(cd);
    });
    function tally(k) {
      var t = cnt[k][0] + cnt[k][1], b = els[k].querySelector('.dk-vbar');
      b.style.setProperty('--w0', t ? cnt[k][0] : 1); b.style.setProperty('--w1', t ? cnt[k][1] : 1); b.classList.toggle('is-on', t > 0);
    }
    function phase(step) {
      var p = [], k, ci, q;
      if (grid) for (k = 0; k < N; k++) p[k] = Math.max(0, Math.min(2, step - 2 * k));
      else { ci = step <= 2 ? 0 : 1 + Math.floor((step - 3) / 3); q = step <= 2 ? step : (step - 3) % 3; for (k = 0; k < N; k++) p[k] = k === ci ? q : -1; }
      return p;
    }
    box.appendChild(vg); el.appendChild(box);
    return { el: el, n: total, set: function (step, prev, instant) {
      var p = phase(step), q = phase(prev == null ? step : prev), act = grid ? p.findIndex(function (v) { return v < 2; }) : p.findIndex(function (v) { return v >= 0; });
      if (grid && act < 0) act = N - 1;
      els.forEach(function (cd, k) {
        var was = cd.classList.contains('is-rev');
        cd.classList.toggle('dk-vh', p[k] < 0); cd.classList.toggle('is-open', p[k] === 1); cd.classList.toggle('is-rev', p[k] === 2); cd.classList.toggle('is-act', grid && k === act);
        if (p[k] === 2 && !was && prev != null && !instant) {
          var t = cnt[k][0] + cnt[k][1], ok = cards[k].answer === true ? cnt[k][0] : cnt[k][1];
          if (typeof cards[k].answer === 'boolean' && t && ok > t / 2) confetti(el, cd, C);
        }
      });
    } };
  };

  T.count = function (s, C) {
    var el = slideEl('count'), box = h('div', 'dk-cu'), v = +s.value || 0, per = s.per || Math.max(1, Math.ceil(v / 600)), dots = Math.max(1, Math.ceil(v / per)), AW = 1640, AH = 380, cols = Math.max(1, Math.ceil(Math.sqrt(dots * AW / AH))), rows = Math.ceil(dots / cols), cell = Math.min(AW / cols, AH / rows), i, svg = '';
    for (i = 0; i < dots; i++) svg += '<circle style="--i:' + i + '" cx="' + ((i % cols + .5) * cell).toFixed(1) + '" cy="' + ((Math.floor(i / cols) + .5) * cell).toFixed(1) + '" r="' + (cell * .34).toFixed(1) + '"/>';
    box.appendChild(label(s.label, 0, 1));
    var mid = h('div', 'dk-cm'), num = h('div', 'dk-cn2 dk-fr'), cv = h('span', 'dk-cv', v.toLocaleString('en-US'));
    if (s.pre) mid.appendChild(E(h('div', 'dk-pill', s.pre), 1));
    num.appendChild(cv); if (s.plus) num.appendChild(h('span', 'dk-cpl', '+'));
    mid.appendChild(E(num, 2));
    if (s.line) mid.appendChild(E(h('div', 'dk-cnl', s.line), 4));
    box.appendChild(mid);
    var pg = sv('<svg class="dk-pg" width="' + (cols * cell).toFixed(0) + '" height="' + (rows * cell).toFixed(0) + '" viewBox="0 0 ' + (cols * cell).toFixed(0) + ' ' + (rows * cell).toFixed(0) + '" aria-hidden="true">' + svg + '</svg>');
    box.appendChild(pg);
    if (s.per > 1) box.appendChild(h('div', 'dk-cpr2', 'Each dot is ' + s.per));
    el.appendChild(box);
    if (!C.static && !C.reduced && v > 0) {
      cv.textContent = '0';
      setTimeout(function () {
        var t0 = Date.now(), D = 2200;
        (function f() { var p = Math.min(1, (Date.now() - t0) / D); cv.textContent = Math.round(v * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US'); if (p < 1 && el.isConnected) requestAnimationFrame(f); }());
      }, 500);
    }
    return { el: el, n: 0 };
  };

  T.spot = function (s, C) {
    var el = slideEl('spot'), hs = s.hotspots || [], N = hs.length, im = C.deck.images && C.deck.images[s.img], Z = s.zoom || 1.5, focal = (im && im.focal) || [.5, .5];
    var zoom = h('div', 'dk-sz'), world = h('div', 'dk-sw'), photo = ph(C, s.img, { bg: 1 }), spl = h('div', 'dk-spl'), ab = sv('<svg class="dk-sab" viewBox="0 0 1920 1080" aria-hidden="true"></svg>'), lb = h('div', 'dk-slb'), rec = h('div', 'dk-srl'), pr = h('div', 'dk-sp dk-fr', s.prompt || 'What do you notice?'), G = null, cur = 0, hg = [];
    world.style.transformOrigin = (focal[0] * 100) + '% ' + (focal[1] * 100) + '%';
    world.appendChild(photo); zoom.appendChild(world); el.appendChild(zoom); el.appendChild(h('div', 'dk-scr dk-scr-t')); el.appendChild(spl); el.appendChild(ab);
    if (s.label) el.appendChild(label(s.label, 0, 1));
    lb.appendChild(h('span', 'dk-sn2')); lb.appendChild(h('span', 'dk-sl2')); el.appendChild(lb);
    hs.forEach(function (o, k) {
      var c = h('span', 'dk-sc2'), b = h('button', 'dk-hot dk-x'), nb2 = h('span', 'dk-sn2', String(k + 1)), g = h('div', 'dk-hg'), rc = h('button', 'dk-rc dk-x'); // g: hotspot ring, number, tap target
      b.type = 'button'; b.setAttribute('aria-label', o.label); b.addEventListener('click', function () { C.go(k + 1); });
      g.appendChild(c); g.appendChild(nb2); g.appendChild(b); world.appendChild(g); hg.push({ g: g, c: c });
      rc.type = 'button'; rc.appendChild(h('span', 'dk-sn2', String(k + 1))); rc.appendChild(h('span', '', o.label)); rc.addEventListener('click', function () { C.go(k + 1); }); rec.appendChild(rc);
    });
    el.appendChild(rec); el.appendChild(pr);
    function lay() {
      var img = photo.querySelector('img'), nw = img && img.naturalWidth || 16, nh = img && img.naturalHeight || 9, sc = Math.max(W / nw, H / nh), sw = nw * sc, sh = nh * sc, ox = (W - sw) * focal[0], oy = (H - sh) * focal[1];
      G = hs.map(function (o) {
        var px = ox + o.x / 100 * sw, py = oy + o.y / 100 * sh, rr = o.r / 100 * sw, tx = Math.max(W - Z * W, Math.min(0, W * .5 - Z * px)), ty = Math.max(H - Z * H, Math.min(0, H * .48 - Z * py));
        return { px: px, py: py, r: rr, tx: tx, ty: ty, fx: Z * px + tx, fy: Z * py + ty };
      });
      hs.forEach(function (o, k) {
        var q = G[k], d0 = Math.max(40, q.r * 2 - 56), rg = rng(C.seed * 31 + k * 17);
        hg[k].g.style.cssText = 'left:' + (q.px - q.r) + 'px;top:' + (q.py - q.r) + 'px;width:' + (q.r * 2) + 'px;height:' + (q.r * 2) + 'px';
        hg[k].c.innerHTML = '<svg viewBox="' + (-(q.r * 2 - d0) / 2) + ' ' + (-(q.r * 2 - d0) / 2) + ' ' + (q.r * 2) + ' ' + (q.r * 2) + '" aria-hidden="true"><path pathLength="1" d="' + DOODLE.circle(rg, [], { w: d0, h: d0 })[0] + '"/></svg>';
      });
      view(cur);
    }
    function view(step) {
      var k = step - 1, all = step > N, q = G && G[k];
      cur = step;
      el.classList.toggle('dk-sf', k >= 0 && !all); el.classList.toggle('dk-sa', all); el.classList.toggle('dk-s0', step === 0);
      hg.forEach(function (o, j) { o.g.classList.toggle('on', all || j === k); });
      if (!G) return;
      if (k >= 0 && !all) {
        var R = q.r * Z, right = q.fx < W * .56, lx = right ? q.fx + R + 70 : q.fx - R - 70, low = (right ? W - lx : lx) < 620;
        if (low) { right = true; lx = 90; }
        zoom.style.transform = 'translate(' + q.tx.toFixed(1) + 'px,' + q.ty.toFixed(1) + 'px) scale(' + Z + ')';
        spl.style.translate = q.fx.toFixed(0) + 'px ' + q.fy.toFixed(0) + 'px'; spl.style.scale = (R * 1.4 / 500).toFixed(3);
        lb.classList.toggle('dk-sl-l', !right); lb.style.left = right ? lx + 'px' : 'auto'; lb.style.right = right ? 'auto' : (W - lx) + 'px'; lb.style.top = (low ? H - 190 : q.fy - 44) + 'px';
        lb.querySelector('.dk-sn2').textContent = k + 1; lb.querySelector('.dk-sl2').textContent = hs[k].label;
        var S = [lx + (right ? -10 : 10), q.fy - 6], T = [q.fx + (right ? R + 14 : -R - 14), q.fy], M = [(S[0] + T[0]) / 2, (S[1] + T[1]) / 2 - 36], L = Math.hypot(T[0] - M[0], T[1] - M[1]) || 1, ux = (T[0] - M[0]) / L, uy = (T[1] - M[1]) / L;
        var wg = function (a) { var c = Math.cos(a), s2 = Math.sin(a); return [T[0] - 38 * (ux * c - uy * s2), T[1] - 38 * (ux * s2 + uy * c)]; };
        ab.innerHTML = low ? '' : '<path pathLength="1" d="M' + pt(S) + 'Q' + pt(M) + ' ' + pt(T) + '"/><path pathLength="1" d="M' + pt(wg(.5)) + 'L' + pt(T) + 'L' + pt(wg(-.5)) + '"/>';
      } else { zoom.style.transform = 'none'; ab.innerHTML = ''; }
    }
    var img0 = photo.querySelector('img');
    if (img0 && !(img0.complete && img0.naturalWidth)) img0.addEventListener('load', lay); else lay();
    return { el: el, n: N + 1, set: function (step) { view(step); } };
  };

  T.map = function (s, C) {
    var el = slideEl('map'), pins = s.pins || [], mw = h('div', 'dk-mw'), cs = h('div', 'dk-mcs'), url = C.deck.maps && C.deck.maps[s.map], ch = Math.min(150, Math.floor((800 - (pins.length - 1) * 14) / Math.max(pins.length, 1)));
    el.appendChild(label(s.label, 0, 1));
    pins.forEach(function (p, k) {
      var pin = h('div', 'dk-pin' + ((p.side ? p.side === 'l' : p.x > 66) ? ' dk-l' : '')), pc = h('div', 'dk-pc dk-b dk-fr2'), th = h('div', 'dk-pth'), tx = h('div', 'dk-ptx');
      pin.style.left = p.x + '%'; pin.style.top = p.y + '%'; pin.setAttribute('data-b', k + 1);
      pin.innerHTML = '<svg class="dk-pn" viewBox="0 0 24 34" aria-hidden="true"><path d="M12 33C5 24 1 18 1 12a11 11 0 0 1 22 0c0 6-4 12-11 21z"/><circle cx="12" cy="12" r="4.5"/></svg><span class="dk-pl"></span>';
      pin.lastChild.textContent = p.label; mw.appendChild(pin);
      pc.setAttribute('data-b', k + 1); pc.style.height = ch + 'px';
      if (p.img) { th.appendChild(ph(C, p.img, { fr: .08, kb: 1 })); pc.appendChild(th); }
      tx.appendChild(h('span', 'dk-pnm', p.label)); if (p.sub) tx.appendChild(h('span', 'dk-psb', p.sub));
      pc.appendChild(tx); cs.appendChild(pc);
    });
    el.appendChild(mw); el.appendChild(cs);
    if (url && typeof fetch !== 'undefined') fetch(url).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
      var w = h('span'), svg, p, q; if (!t) return; w.innerHTML = t; svg = w.querySelector('svg'); p = svg && svg.querySelector('path'); if (!p) return;
      svg.setAttribute('class', 'dk-ms'); svg.setAttribute('aria-hidden', 'true'); svg.removeAttribute('width'); svg.removeAttribute('height');
      q = p.cloneNode(); p.setAttribute('class', 'f'); q.setAttribute('class', 'l'); q.setAttribute('pathLength', '1'); svg.appendChild(q);
      mw.insertBefore(svg, mw.firstChild); el.dkP = [q]; el.dispatchEvent(new CustomEvent('dk-art'));
    }).catch(function () { /* the pins still show on the empty map */ });
    return { el: el, n: pins.length };
  };

  T.spinner = function (s, C) {
    var el = slideEl('spinner'), it = s.items || [], N = it.length, seg = 360 / N, cols = [C.theme.accent, C.theme.accent2, '#19B6A6', '#8B5CF6'], rot = 0, win = -1, tm = 0, svg = '', i;
    function pos(a, r) { var t = a * Math.PI / 180; return [(400 + r * Math.sin(t)).toFixed(1), (400 - r * Math.cos(t)).toFixed(1)]; }
    for (i = 0; i < N; i++) {
      var c = cols[(i === N - 1 && N % 4 === 1) ? 2 : i % 4], p0 = pos(i * seg, 380), p1 = pos((i + 1) * seg, 380), mid = (i + .5) * seg, left = mid > 180, words = String(it[i].short || it[i].text).split(' '), half = Math.ceil(words.length / 2), ln = words.length > 2 ? [words.slice(0, half).join(' '), words.slice(half).join(' ')] : [words.join(' ')];
      svg += '<g class="dk-wg" data-i="' + i + '"><path d="M400 400L' + p0.join(' ') + 'A380 380 0 0 1 ' + p1.join(' ') + 'Z" fill="' + c + '"/><g transform="rotate(' + (left ? mid + 90 : mid - 90) + ' 400 400)"><text x="' + (left ? 150 : 650) + '" y="400" text-anchor="middle" fill="' + onFill(hex(c)) + '" font-size="' + (Math.max.apply(null, ln.map(function (x) { return x.length; })) > 12 ? 32 : 36) + '">' +
        ln.map(function (x, j) { return '<tspan x="' + (left ? 150 : 650) + '" dy="' + (j ? 40 : (ln.length > 1 ? -8 : 12)) + '">' + x.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</tspan>'; }).join('') + '</text></g></g>';
    }
    var w = sv('<svg class="dk-wsv" viewBox="0 -50 800 850" aria-hidden="true"><g class="dk-wh">' + svg + '</g><circle cx="400" cy="400" r="68" class="dk-hub"/><text x="400" y="412" text-anchor="middle" class="dk-hubt">SPIN</text><path class="dk-ptr" d="M400 40L366 -22Q400 -50 434 -22Z"/></svg>');
    var wheel = w.querySelector('.dk-wh'), cs = 0;
    var box = h('div', 'dk-sps'), res = h('div', 'dk-sr2'), rl = h('div', 'dk-sq dk-fr', s.prompt || 'Spin the wheel.'), rt = h('div', 'dk-srt dk-fr');
    el.appendChild(label(s.label, 0, 1));
    var wb = h('button', 'dk-wb dk-x'); wb.type = 'button'; wb.setAttribute('aria-label', 'Spin the wheel'); wb.appendChild(w); wb.addEventListener('click', function () { if (cs < 1) C.go(1); else spin(); });
    res.appendChild(rl); res.appendChild(rt); box.appendChild(wb); box.appendChild(res); el.appendChild(box);
    function show(k) {
      win = k; Array.prototype.forEach.call(w.querySelectorAll('.dk-wg'), function (g, j) { g.classList.toggle('is-win', j === k); });
      el.classList.toggle('dk-picked', k >= 0); el.classList.remove('dk-spinning');
      if (k >= 0) { var t = it[k].text || it[k].short; rt.textContent = t; rt.style.fontSize = fs(t.length, [[30, 120], [60, 92], [999, 72]]) + 'px'; }
    }
    function spin(tgt, instant) {
      var k = tgt == null ? Math.floor(Math.random() * N) : tgt, base = -(k + .5) * seg + (Math.random() - .5) * seg * .5, delta = (((base - rot) % 360) + 360) % 360, quick = instant || C.reduced;
      clearTimeout(tm); show(-1);
      rot += (quick ? 0 : 360 * (5 + Math.floor(Math.random() * 2))) + delta;
      wheel.style.transition = quick ? 'none' : ''; wheel.style.transform = 'rotate(' + rot + 'deg)';
      if (quick) show(k); else { el.classList.add('dk-spinning'); tm = setTimeout(function () { show(k); }, 4400); }
    }
    return { el: el, n: 1, set: function (step, prev, instant) {
      cs = step;
      if (step >= 1) { if (prev == null || prev < 1) spin(C.static || instant ? (s.land != null ? s.land : (C.seed * 5) % N) : null, C.static || instant); }
      else { clearTimeout(tm); rot = 0; wheel.style.transition = 'none'; wheel.style.transform = 'none'; show(-1); }
    } };
  };

  T.turntalk = function (s, C) {
    var el = slideEl('turntalk'), box = h('div', 'dk-tt2'), st = s.starters || [], tm = !!s.timer, n = st.length + (tm ? 1 : 0), row = h('div', 'dk-scs');
    box.appendChild(label(s.label || 'Turn and talk', 0, 1));
    var p = E(hd(2, 'dk-tp dk-h', s.prompt || ''), 1); p.style.fontSize = fs((s.prompt || '').length, [[40, 104], [80, 88], [999, 72]]) + 'px'; box.appendChild(p);
    st.forEach(function (t, k) { var c = h('div', 'dk-sc3 dk-b', t); c.setAttribute('data-b', k + 1); row.appendChild(c); });
    box.appendChild(row); el.appendChild(box);
    var person = function (x, cls, nm) {
      return '<g class="' + cls + '" transform="translate(' + x + ' 0)"><g class="dk-bg"><path class="dk-bub" d="M-110 14h220a26 26 0 0 1 26 26v62a26 26 0 0 1-26 26h-96l-34 38-4-38h-86a26 26 0 0 1-26-26V40a26 26 0 0 1 26-26z"/><circle class="dk-bd1" cx="-34" cy="71" r="9"/><circle class="dk-bd2" cx="0" cy="71" r="9"/><circle class="dk-bd3" cx="34" cy="71" r="9"/></g>' +
        '<circle class="dk-hd2" cx="0" cy="278" r="66"/><path class="dk-fc2" d="M-26 268v6M26 268v6M-24 298q24 22 48 0"/><path class="dk-bo" d="M-124 500q0-124 124-124t124 124z"/><text x="0" y="556" text-anchor="middle" class="dk-pt">' + nm + '</text></g>';
    };
    el.appendChild(sv('<svg class="dk-pr2" viewBox="0 0 800 580" aria-hidden="true">' + person(190, 'dk-pa', 'Partner A') + person(610, 'dk-pb', 'Partner B') + '</svg>'));
    return { el: el, n: n, set: function (step, prev, instant) { if (tm && step === n && prev != null && prev < n && !instant) C.startTimer(); } };
  };

  function slots(s) {
    var o = [];
    function add(x) { if (x) o.push(x); }
    add(s.img); (s.cards || []).forEach(function (c) { add(c.img); }); if (s.left) add(s.left.img); if (s.right) add(s.right.img); (s.items || []).forEach(function (i) { add(i.img); }); (s.pins || []).forEach(function (i) { add(i.img); });
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

    function C(i) { return { deck: deck, theme: th, scale: S.scale, seed: i + 1, reduced: reduced, static: stat, go: function (n) { if (S.cur) setStep(Math.max(0, Math.min(S.cur.n, n))); }, startTimer: function () { var t = S.cur && timer(S.i); if (t && !t.run && t.left > 0) toggleTimer(); } }; }
    function build(i) {
      var s = slides[i], fn = T[s.type] || T.board, b;
      if (!T[s.type]) s = { type: 'board', label: s.label || s.type, text: s.title || s.prompt || s.text || '' };
      b = fn(s, C(i)); b.slide = s; b.idx = i;
      b.el.setAttribute('aria-label', (i + 1) + ' of ' + N);
      if (s.canvas === 'paper' && PAPER.indexOf(s.type) > -1) { theme(b.el, { canvas: '#F4EDDC', accent: th.accent, accent2: th.accent2 }); b.el.classList.add('dk-paper'); b.el.appendChild(h('i', 'dk-grain')); }
      if (s.doodles && s.doodles.length) b.n = Math.max(b.n || 0, Math.max.apply(null, s.doodles.map(function (o) { return o.at | 0; })));
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

    function notesText() { var s = slides[S.i]; return (s && s.notes) || 'No notes for this slide.'; }
    function toggleNotes(on) {
      if (!ctl.notes) return;
      S.notes = on == null ? !S.notes : !!on;
      ctl.notes.classList.toggle('is-open', S.notes); root.classList.toggle('dk-notes-open', S.notes); ctl.notes.setAttribute('aria-hidden', S.notes ? 'false' : 'true');
      if (ctl.nbtn) ctl.nbtn.setAttribute('aria-expanded', S.notes ? 'true' : 'false');
    }

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
      for (var k = i + 1; k <= i + 1 && k < N; k++) slots(slides[k]).forEach(function (slot) {
        var im = deck.images && deck.images[slot], u = im && (mini ? im.w480 : im.w960);
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
      stopT(old && timer(S.i)); if (old && old.dw) old.dw.stop();
      stage.classList.toggle('dk-bk', back);
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
      if (b.slide.doodles) { if (d.fonts && d.fonts.status === 'loading') d.fonts.ready.then(function () { if (S.cur === b) placeDoodles(b, S.step); }); else placeDoodles(b, step); }
      var ent = deck.drawn && b.el.classList.contains('dk-live') && !mini && !reduced, im0 = deck.images && s.img && deck.images[s.img], pb = ent && s.sketch !== false && im0 && (im0.sketch || im0.portrait) && b.el.querySelector('.dk-ph[data-slot="' + s.img + '"]');
      if (pb) { pb.classList.add('dk-sk0'); setTimeout(function () { pb.classList.remove('dk-sk0'); }, 4500); }
      if (ent) { b.el.classList.add('dk-pw'); setTimeout(function () { b.el.classList.remove('dk-pw'); }, 4500); }
      if (deck.drawn) needDraw(function (D) { if (S.cur === b) b.dw = D.enter(b, { ent: ent, deck: deck, i: i, step: S.step, root: root, stage: stage, mini: mini, reduced: reduced }); });
      if (opts.onChange) opts.onChange(i, N);
    }
    function setStep(n) {
      var b = S.cur, prev = S.step; S.step = n; apply(b, n, prev, false); if (b.dw) b.dw.step(n, prev); chrome();
    }
    function next() { if (!S.cur) return; if (S.cur.dw && S.cur.dw.busy()) return S.cur.dw.finish(); if (S.step < S.cur.n) setStep(S.step + 1); else if (S.i < N - 1) show(S.i + 1, 1); }
    function prev() { if (!S.cur) return; if (S.cur.dw && S.cur.dw.busy()) return S.cur.dw.finish(); if (S.step > 0) setStep(S.step - 1); else if (S.i > 0) show(S.i - 1, -1); }
    function go(i) { show(Math.max(0, Math.min(N - 1, i)), i < S.i ? -1 : 1); }

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
        if (swiped || (e.target.closest && e.target.closest('a,button,.dk-x,.dk-ctl,.dk-notes'))) return;
        var r = root.getBoundingClientRect(); ((e.clientX - r.left) / r.width < 1 / 3) ? prev() : next();
      });
      root.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { passive: true });
      root.addEventListener('touchend', function (e) {
        var t = e.changedTouches && e.changedTouches[0]; if (!t || (e.target.closest && e.target.closest('a,button,.dk-x'))) return;
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
  window.EEDeck = { x: { tr: textRects, F: FIELD, rng: rng, sm: smooth, I: ICONS, W: W, H: H, o: DOODLE, ph: ph }, mount: mount, render: render, icons: Object.keys(ICONS), types: TYPES, motifs: MOTIFS, fields: Object.keys(FIELD), doodles: Object.keys(DOODLE), paper: PAPER };
}());
