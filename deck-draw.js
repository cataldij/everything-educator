/* The Everything Educator: PRESENT MODE "drawn live" layer. Loaded by deck.js the first time a deck mounts (never on page load).
   One hand draws the whole deck: draw() is a stroke-dashoffset draw-on with a PEN TIP riding the active stroke, and everything
   below uses it: the pencil sketch that turns into the photo, headings that write on (then a marker swipe behind one word),
   the line illustration that blooms into a watercolour wash, doodles, and the outline map.
   Entrance budget: 2.5 s per slide, 1.2 s per build step. A Next or Back press while a slide is still drawing FINISHES the
   drawing and does not advance (deck.js asks ctl.busy()). Static frames, minis, print and reduced motion get the final state:
   no pen, no motion, and no stroke overlay left on a photo. Animated: stroke-dashoffset, opacity, transform, clip-path only.
   Sketch SVGs come from tools/_sketch-trace.py (assets/teach/<slug>/<slot>-sketch.svg) and are fetched per slide (the next one
   is fetched ahead). window.EEDraw = { enter(b, o) -> { busy, finish, step, stop } }. */
(function () {
  'use strict';
  var E = window.EEDeck, X = E && E.x, d = document;
  if (!X || !d) return;
  var W = X.W, H = X.H, NS = 'http://www.w3.org/2000/svg', TOTAL = 2.4, STEP = 1.1;
  var CSS = '.dk-pen{position:absolute;left:0;top:0;width:96px;height:96px;margin:-86px 0 0 -10px;pointer-events:none;z-index:60;opacity:0;transition:opacity .1s;will-change:transform}' +
    '.dk-pen svg{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 4px 5px rgba(0,0,0,.45))}' +
    '.dk-sks{position:absolute;overflow:visible;pointer-events:none;z-index:2}' +
    '.dk-sks path{fill:none;stroke:#F4F0E6;stroke-width:2.3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1}' +
    '.dk-paper .dk-sks path{stroke:#23201B}' +
    '.dk-art{position:absolute;pointer-events:none}.dk-art svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}' +
    '.dk-art path{fill:none;stroke:var(--act);stroke-opacity:.66;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:0}' +
    '.dk-wash{position:absolute;inset:-10%;border-radius:55% 45% 52% 48%/48% 56% 44% 52%;background-size:100% 100%;opacity:.2}' +
    '.dk-faint path{stroke-opacity:.36}.dk-faint .dk-wash{opacity:.12}' +
    '.dk-paper .dk-wash{opacity:.26;mix-blend-mode:multiply}.dk-paper .dk-faint .dk-wash{opacity:.14}' +
    '.dk-mk2{position:absolute;z-index:-1;pointer-events:none;background:rgba(var(--a2c),.58);border-radius:5px 15px 6px 13px;transform-origin:0 50%}' +
    '.dk-wo,.dk-wo .dk-w,.dk-wo.dk-e{animation:none!important}' +
    '.dk-ph.dk-vph{inset:150px 100px 100px auto;width:640px;border-radius:30px;border:2px solid var(--line);box-shadow:0 24px 60px rgba(0,0,0,.4)}.dk-vimg .dk-vg:not(.dk-vgrid){justify-items:start}.dk-vimg .dk-vg:not(.dk-vgrid) .dk-vc{width:1000px}' +
    '.dk-vr{flex:1;min-height:0;display:flex;gap:18px;align-items:center}.dk-vr .dk-vs{flex:1}.dk-vth{position:relative;flex:none;width:104px;height:80px;border-radius:14px;overflow:hidden}.dk-vth .dk-ph{border-radius:14px}' +
    '.dk-trow{display:flex;gap:40px;align-items:flex-start;justify-content:space-between}.dk-ph.dk-tph{position:relative;inset:auto;flex:none;width:600px;height:230px;border-radius:24px;border:2px solid var(--line);box-shadow:0 18px 44px rgba(0,0,0,.3)}' +
    '.dk-frm path{stroke-width:3.6}.dk-tag{position:absolute;z-index:3;opacity:0;white-space:nowrap;padding:8px 22px;font:650 36px/1.2 Archivo,system-ui,sans-serif;color:#F4F0E6}';
  var PEN = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 43L9.5 29L33 5.5Q36 3 39 6L42 9Q45 12 42.5 15L19 38.5Z" fill="#E9B949" stroke="#2B2118" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M5 43L9.5 29L19 38.5Z" fill="#F3D9B1" stroke="#2B2118" stroke-width="2" stroke-linejoin="round"/><path d="M5 43L6.8 37.5L10.5 41.2Z" fill="#3A3A3A"/><path d="M33 5.5L42.5 15" stroke="#2B2118" stroke-width="2"/></svg>';
  var HS = ['.dk-cov .dk-h', '.dk-q', '.dk-tt', '.dk-tp', '.dk-ep', '.dk-sm', '.dk-bdx', '.dk-ftx', '.dk-label'];
  var SK = {}, WB = {};
  // a watercolour blob: an ellipse of the accent colour, warped by feTurbulence and softened, drawn once into a small canvas
  function bake(rgb, seed) {
    var key = rgb + seed;
    if (!WB[key]) WB[key] = new Promise(function (ok) {
      var c = 'rgb(' + rgb + ')', svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><filter id="f" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="2" seed="' + seed + '" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="46" result="m"/><feGaussianBlur in="m" stdDeviation="3.5" result="b"/><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="' + (seed + 5) + '" result="t"/>' +
        '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.5" result="a"/><feComposite in="b" in2="a" operator="in"/></filter>' +
        '<radialGradient id="g"><stop offset="0" stop-color="' + c + '" stop-opacity=".95"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient></defs><ellipse cx="100" cy="100" rx="76" ry="68" fill="url(#g)" filter="url(#f)"/></svg>';
      var im = new Image(); im.onload = function () { var cv = d.createElement('canvas'); cv.width = cv.height = 200; cv.getContext('2d').drawImage(im, 0, 0); ok(cv.toDataURL('image/png')); }; im.onerror = function () { ok(''); };
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
    return WB[key];
  }
  var inited = 0;

  function init() {
    if (inited) return; inited = 1;
    var st = d.createElement('style'); st.textContent = CSS; d.head.appendChild(st);
  }
  function h(t, c) { var n = d.createElement(t); if (c) n.className = c; return n; }
  function sv(html) { var w = h('span'); w.innerHTML = html; return w.firstChild; }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return .5 - .5 * Math.cos(Math.PI * t); }
  function sketch(url) {
    if (!SK[url]) SK[url] = fetch(url).then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (t) {
      var vb = /viewBox="0 0 (\d+) (\d+)"/.exec(t), ps = [], re = /<path d="([^"]+)"/g, m;
      while ((m = re.exec(t))) ps.push(m[1]);
      return vb && ps.length ? { w: +vb[1], h: +vb[2], p: ps } : Promise.reject();
    });
    return SK[url];
  }

  // ── the draw primitive: stroke-dashoffset on a set of paths over `dur` seconds, a pen tip riding the lead stroke ──
  // Few strokes run one after another (long ones take longer). A busy sketch draws its first strokes alone, then the fine
  // detail in short parallel batches of up to 12 behind the lead.
  function strokes(paths, dur, penOn) {
    var ms = dur * 1000, n = paths.length, lens = [], plan = [], lead = n <= 12 ? n : 10, tot = 0, i, t = 0, rest = n - lead, nb = Math.ceil(rest / 12), bt = rest ? ms * .42 / nb : 0, ld = rest ? ms * .58 : ms;
    for (i = 0; i < n; i++) { lens[i] = paths[i].getTotalLength() || 1; paths[i].setAttribute('pathLength', '1'); paths[i].style.strokeDasharray = '1'; paths[i].style.strokeDashoffset = '1'; }
    for (i = 0; i < lead; i++) tot += Math.max(lens[i], 30);
    for (i = 0; i < lead; i++) { var sh = ld * Math.max(lens[i], 30) / tot; plan.push({ s: t, e: t + sh }); t += sh; }
    for (i = lead; i < n; i++) { var b = Math.floor((i - lead) / 12), j = (i - lead) % 12; plan.push({ s: ld + b * bt + j * bt * .03, e: ld + (b + 1) * bt }); }
    plan.forEach(function (p, k) { p.q = -1; p.el = paths[k]; p.len = lens[k]; });
    return {
      dur: ms, pen: penOn !== false,
      tick: function (p, me) {
        var tt = p * ms, lead2 = null;
        for (var k = 0; k < plan.length; k++) {
          var a = plan[k], q = clamp((tt - a.s) / (a.e - a.s));
          if (q !== a.q) { a.q = q; a.el.style.strokeDashoffset = (1 - ease(q)).toFixed(3); }
          if (q > 0 && q < 1 && (!lead2 || a.len > lead2.len)) lead2 = a;
        }
        if (lead2) me.penAt(lead2.el, lead2.len * ease(lead2.q), lead2);
      },
      end: function () { plan.forEach(function (a) { a.el.style.strokeDashoffset = '0'; }); }
    };
  }

  function Ctl(b, o) {
    this.b = b; this.o = o; this.el = b.el; this.q = []; this.cur = null; this.par = []; this.raf = 0; this.dead = 0; this.pen = null; this.k = 1; this.lastLead = null; this.liftT = 0;
    var me = this; this.loop = function () {
      me.raf = 0; if (me.dead) return;
      var n = performance.now(), rr = me.el.getBoundingClientRect(); me.k = rr.width / W || 1; me.r = rr;
      if (!me.cur && me.q.length) { me.cur = me.q.shift(); me.cur.t0 = n; if (me.cur.start) me.cur.start(me); }
      if (me.cur) { var p = clamp((n - me.cur.t0) / me.cur.dur); me.cur.tick(p, me); me.penOn(me.cur.pen); if (p >= 1) { me.cur.end && me.cur.end(me); me.cur = null; } }
      me.par = me.par.filter(function (t) { var p = clamp((n - t.t0) / t.dur); if (n >= t.t0) { t.tick(p, me); if (p >= 1) { t.end && t.end(me); return false; } } return true; });
      if (me.cur || me.q.length || me.par.length) me.raf = requestAnimationFrame(me.loop); else me.penOn(false);
    };
  }
  Ctl.prototype.go = function () { if (!this.raf && !this.dead) this.raf = requestAnimationFrame(this.loop); };
  Ctl.prototype.add = function (t) { this.q.push(t); this.go(); };
  Ctl.prototype.also = function (t, delay) { t.t0 = performance.now() + (delay || 0); this.par.push(t); this.go(); };
  Ctl.prototype.busy = function () { return !!(this.cur || this.q.length || this.par.length); };
  Ctl.prototype.finish = function () {
    var all = (this.cur ? [this.cur] : []).concat(this.q), me = this;
    all.forEach(function (t) { if (t !== me.cur && t.start) t.start(me); t.tick(1, me); t.end && t.end(me); });
    this.par.forEach(function (t) { t.tick(1, me); t.end && t.end(me); });
    this.cur = null; this.q = []; this.par = []; this.penOn(false);
  };
  Ctl.prototype.stop = function () { this.dead = 1; if (this.raf) cancelAnimationFrame(this.raf); if (this.pen) this.pen.remove(); };
  Ctl.prototype.penOn = function (on) {
    if (!this.pen) { if (!on) return; this.pen = h('div', 'dk-pen'); this.pen.innerHTML = PEN; this.el.appendChild(this.pen); }
    this.pen.style.opacity = on ? '.96' : '0';
  };
  // move the pen tip to a point on a stroke (path user units -> slide pixels); it lifts for a moment when the stroke changes
  Ctl.prototype.penAt = function (path, L, key) {
    var s = path.ownerSVGElement, pt = s.createSVGPoint(), m = path.getScreenCTM(), r = this.r || this.el.getBoundingClientRect(), p = path.getPointAtLength(L);
    pt.x = p.x; pt.y = p.y; pt = pt.matrixTransform(m);
    this.moveTo((pt.x - r.left) / this.k, (pt.y - r.top) / this.k, key);
  };
  Ctl.prototype.moveTo = function (x, y, key) {
    if (!this.pen) return;
    if (key !== this.lastLead) { this.lastLead = key; this.liftT = performance.now() + 70; }
    this.pen.style.opacity = performance.now() < this.liftT ? '.35' : '.96';
    this.pen.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
  };

  // ── tasks ──
  function seconds(t, k) { t.dur *= k; return t; }
  function fade(el, from, to, dur, key) { return { dur: dur * 1000, pen: false, tick: function (p) { el.style[key || 'opacity'] = (from + (to - from) * ease(p)).toFixed(3); }, end: function () { el.style[key || 'opacity'] = to === 1 ? '' : String(to); } }; }

  // heading writes on left to right, line by line (a clip-path wipe), the pen riding the baseline
  function wipe(host, dur) {
    var lines = [], tw = 0;
    return {
      dur: dur * 1000, pen: true,
      start: function (me) {
        lines = X.tr(host, 1, 1e9); lines.forEach(function (l) { tw += l.w; });
        host.classList.add('dk-wo'); me.hr = host.getBoundingClientRect();
      },
      tick: function (p, me) {
        if (!lines.length) { host.style.clipPath = ''; return; }
        var run = ease(p) * tw, k = 0, x = 0, hw = host.offsetWidth + 40, i, L, poly;
        for (i = 0; i < lines.length; i++) { if (run <= lines[i].w || i === lines.length - 1) { k = i; x = Math.min(run, lines[i].w); break; } run -= lines[i].w; }
        L = lines[k]; var top = k ? (lines[k - 1].y + lines[k - 1].h + L.y) / 2 : -40, bot = k < lines.length - 1 ? (L.y + L.h + lines[k + 1].y) / 2 : L.y + L.h + 40, xr = L.x + x;
        poly = 'polygon(-40px -40px,' + hw + 'px -40px,' + hw + 'px ' + top + 'px,' + xr + 'px ' + top + 'px,' + xr + 'px ' + bot + 'px,-40px ' + bot + 'px)';
        if (p >= 1) poly = 'none';
        host.style.clipPath = poly;
        var hr = host.getBoundingClientRect(), rr = me.r || me.el.getBoundingClientRect();
        me.moveTo((hr.left - rr.left) / me.k + xr, (hr.top - rr.top) / me.k + L.y + L.h * .86, 'w' + k);
      },
      end: function () { host.style.clipPath = ''; }
    };
  }
  // a marker swipe behind a word (or phrase) of the heading
  function marker(host, word, dur, final) {
    host.classList.add('dk-wo');   // no word-rise offset while we measure
    var ws = (host.textContent || '').split(/\s+/).filter(Boolean), q = String(word).toLowerCase().split(/\s+/), a = -1, i;
    var norm = function (s) { return s.toLowerCase().replace(/[^a-z0-9']/g, ''); };
    for (i = 0; i + q.length <= ws.length && a < 0; i++) { var ok = 1; for (var j = 0; j < q.length; j++) if (norm(ws[i + j]) !== norm(q[j])) ok = 0; if (ok) a = i + 1; }
    if (a < 0) return null;
    var rs = X.tr(host, a, a + q.length - 1); if (!rs.length) return null;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.style.zIndex = '0';
    var fs = parseFloat(getComputedStyle(host).fontSize) || 40;
    var els = rs.map(function (r) {
      var m = h('i', 'dk-mk2'), bl = r.y + r.h * .8; m.style.cssText = 'left:' + (r.x - fs * .08) + 'px;top:' + (bl - fs * .66) + 'px;width:' + (r.w + fs * .16) + 'px;height:' + (fs * .76) + 'px;transform:rotate(-1.2deg)' + (final ? '' : ' scaleX(0)');
      host.insertBefore(m, host.firstChild); return m;
    });
    if (final) return null;
    return { dur: dur * 1000, pen: true, tick: function (p, me) { els.forEach(function (m) { m.style.transform = 'rotate(-1.2deg) scaleX(' + ease(p).toFixed(3) + ')'; }); var r = rs[0], hr = host.getBoundingClientRect(), rr = me.r || me.el.getBoundingClientRect(); me.moveTo((hr.left - rr.left) / me.k + r.x + (r.w + 10) * ease(p), (hr.top - rr.top) / me.k + r.y + r.h * .8 - fs * .2, 'm'); }, end: function () { els.forEach(function (m) { m.style.transform = 'rotate(-1.2deg)'; }); } };
  }

  // a line illustration: a Lucide icon drawn large with a seeded hand wobble, then a watercolour wash blooms behind it
  function art(el, a, seed) {
    var S = a.size || 460, pos = a.pos || 'corner', box = h('div', 'dk-art'), body = X.I[a.icon], r = X.rng(seed), shapes, out = '';
    var sty = pos === 'top' ? 'right:56px;top:52px' : pos === 'right' ? 'right:70px;top:50%;margin-top:' + (-S / 2) + 'px' : pos === 'center' ? 'left:50%;top:50%;margin:' + (-S / 2) + 'px 0 0 ' + (-S / 2) + 'px' : 'right:56px;bottom:56px';
    box.style.cssText = 'width:' + S + 'px;height:' + S + 'px;' + sty;
    if (pos === 'center' || a.faint) box.className += ' dk-faint';
    if (!body) return null;
    var wash = h('i', 'dk-wash'); wash.style.borderRadius = (45 + r() * 15 | 0) + '% ' + (40 + r() * 15 | 0) + '% ' + (45 + r() * 12 | 0) + '% ' + (45 + r() * 15 | 0) + '%/' + (45 + r() * 12 | 0) + '% ' + (50 + r() * 10 | 0) + '% ' + (40 + r() * 15 | 0) + '% ' + (45 + r() * 12 | 0) + '%';
    var svg = sv('<svg viewBox="0 0 240 240" aria-hidden="true">' + body.replace(/<(path|circle|rect|line|polyline|ellipse|polygon)\b/g, '<$1 transform="scale(10)"') + '</svg>');
    box.appendChild(wash); box.appendChild(svg); el.insertBefore(box, el.firstChild);
    bake(getComputedStyle(el).getPropertyValue('--acc').trim() || '217,130,43', seed % 90 + 1).then(function (u) { if (u) wash.style.backgroundImage = 'url(' + u + ')'; });
    // wobble: sample each shape, push it sideways along its normal with a slow seeded wave, redraw it as a smooth path
    var sw = 6 * 240 / S;
    Array.prototype.slice.call(svg.children).forEach(function (sh) {
      var len = sh.getTotalLength(), n = Math.max(8, Math.min(120, Math.ceil(len / 1.2))), pts = [], f = 1.2 + r() * 1.6, ph = r() * 6.28, amp = 1.7, i, p, p2, nx, ny, w, L;
      var segs = [pts], step = len / n * 10;
      for (i = 0; i <= n; i++) {
        p = sh.getPointAtLength(len * i / n); p2 = sh.getPointAtLength(Math.min(len, len * (i + 1) / n + .01)); nx = -(p2.y - p.y); ny = p2.x - p.x; L = Math.hypot(nx, ny) || 1;
        w = amp * Math.sin(i / n * 6.28 * f + ph) + (r() - .5) * .5;
        var q = [p.x * 10 + nx / L * w, p.y * 10 + ny / L * w], last = pts[pts.length - 1];
        if (last && Math.hypot(q[0] - last[0], q[1] - last[1]) > Math.max(34, step * 3)) { pts = [q]; segs.push(pts); } else pts.push(q);
      }
      var np = d.createElementNS(NS, 'path'); np.setAttribute('d', segs.filter(function (g) { return g.length > 1; }).map(X.sm).join('')); np.setAttribute('pathLength', '1'); np.style.strokeWidth = sw; svg.replaceChild(np, sh);
    });
    return { box: box, wash: wash, paths: Array.prototype.slice.call(svg.querySelectorAll('path')) };
  }

  // photos for slides whose type has no picture slot of its own: vote (beside the card, or one small photo per card), count (behind the numbers), task (beside the title)
  function place(el, s, o) {
    var im = o.deck.images || {}, C = { deck: o.deck, scale: .5 }, ph = X.ph, b, k;
    if (s.type === 'vote') {
      if (s.img && im[s.img]) { b = ph(C, s.img, { kb: 1, fr: .33 }); b.classList.add('dk-vph'); el.classList.add('dk-vimg'); el.appendChild(b); }
      (s.cards || []).forEach(function (c, j) {
        var card = el.querySelectorAll('.dk-vc')[j], st = card && card.querySelector('.dk-vs'), row, w;
        if (!c.img || !im[c.img] || !st) return;
        row = h('div', 'dk-vr'); w = h('div', 'dk-vth'); w.appendChild(ph(C, c.img, { fr: .08 })); card.insertBefore(row, st); row.appendChild(w); row.appendChild(st);
      });
    } else if (s.type === 'count' && s.img && im[s.img]) {
      b = ph(C, s.img, { bg: 1, kb: 1 }); k = h('div', 'dk-scr dk-scr-c'); el.insertBefore(k, el.firstChild); el.insertBefore(b, el.firstChild);
    } else if (s.type === 'task' && s.img && im[s.img]) {
      var tt = el.querySelector('.dk-tt'), row2 = h('div', 'dk-trow'); b = ph(C, s.img, { kb: 1, fr: .3 }); b.classList.add('dk-tph');
      tt.parentNode.insertBefore(row2, tt); row2.appendChild(tt); row2.appendChild(b);
    }
  }
  // a photo of people is never traced: the pen draws a frame and a name tag (the source's own words) around it, then the photo fades in
  function frameTag(box, text) {
    var w = box.offsetWidth, hh = box.offsetHeight, i = 16, r = X.rng(11), j = function () { return (r() - .5) * 7; }, tw = Math.min(w - 60, 44 + text.length * 17), x = i + 18, y = hh - i - 74;
    var fr = 'M' + [[i + j(), i + j()], [w - i + j(), i + j() + 4], [w - i + j(), hh - i + j()], [i + j(), hh - i + j() - 5], [i + 1, i - 3]].map(function (p) { return p[0].toFixed(0) + ' ' + p[1].toFixed(0); }).join('L');
    var tg = 'M' + x + ' ' + y + 'h' + tw + 'v' + (58 + j()).toFixed(0) + 'h' + (-tw) + 'z';
    var svg = sv('<svg class="dk-sks dk-frm" viewBox="0 0 ' + w + ' ' + hh + '" style="left:0;top:0;width:' + w + 'px;height:' + hh + 'px" aria-hidden="true"><path d="' + fr + '"/><path d="' + tg + '"/></svg>'), tag = h('div', 'dk-tag');
    tag.textContent = text; tag.style.cssText = 'left:' + (x + 4) + 'px;top:' + (y + 4) + 'px';
    box.appendChild(svg); box.appendChild(tag);
    return { svg: svg, tag: tag, paths: Array.prototype.slice.call(svg.querySelectorAll('path')) };
  }

  function heading(el) { for (var i = 0; i < HS.length; i++) { var n = el.querySelector(HS[i]); if (n && n.offsetWidth) return n; } return null; }

  function enter(b, o) {
    init();
    var el = b.el, s = b.slide, ent = o.ent, me = new Ctl(b, o), tasks = [], im = o.deck.images && s.img && o.deck.images[s.img], P = im && im.portrait && s.sketch !== false, box;
    place(el, s, o);
    box = im && (im.sketch || P) && s.sketch !== false && el.querySelector('.dk-ph[data-slot="' + s.img + '"]');
    if (box && ent) box.classList.add('dk-sk0');
    var hd = heading(el), seed = (o.i + 2) * 7919, A = s.art && art(el, s.art, seed), k = 1, sk = null;
    el.classList.remove('dk-pw');
    // doodles at build 0 and the outline map: take them over from their CSS animation
    var dd = Array.prototype.slice.call(el.querySelectorAll('.dk-dd[data-b="0"]')), dp = [];
    dd.forEach(function (g) { dp = dp.concat(Array.prototype.slice.call(g.querySelectorAll('path'))); });
    var mp = el.dkP;
    function stage() {   // photo + sketch overlay
      var vw = sk.w, vh = sk.h, bw = box.offsetWidth, bh = box.offsetHeight, f = im.focal || [.5, .5], sc = Math.max(bw / vw, bh / vh), svg = sv('<svg class="dk-sks" viewBox="0 0 ' + vw + ' ' + vh + '" aria-hidden="true"></svg>');
      svg.style.cssText = 'left:' + ((bw - vw * sc) * f[0]) + 'px;top:' + ((bh - vh * sc) * f[1]) + 'px;width:' + (vw * sc) + 'px;height:' + (vh * sc) + 'px';
      sk.p.forEach(function (dd2) { var p = d.createElementNS(NS, 'path'); p.setAttribute('d', dd2); svg.appendChild(p); });
      box.appendChild(svg); return svg;
    }
    function done() { box && box.classList.remove('dk-sk0'); }
    if (!ent) {   // final state: the illustration and the marker, nothing else
      done(); if (A) { A.paths.forEach(function (p) { p.style.strokeDashoffset = '0'; }); }
      if (hd && s.mark) marker(hd, s.mark, 0, 1);
      return { busy: function () { return false; }, finish: function () {}, step: function () {}, stop: function () { me.stop(); } };
    }
    // the entrance, in order, one pen: photo sketch (or the heading first on a slide with no photo), heading, marker, illustration, doodles
    var pend = 1, skip = 0, wait = box && im.sketch ? sketch(im.sketch).then(function (v) { sk = v; }, function () { sk = null; }) : Promise.resolve();
    var timeout = new Promise(function (r) { setTimeout(r, 1300); });
    if (hd) hd.style.clipPath = 'inset(0 100% 0 0)';
    if (A) { A.wo = parseFloat(getComputedStyle(A.wash).opacity) || .2; A.paths.forEach(function (p) { p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; }); A.wash.style.opacity = '0'; }
    if (dp.length) dp.forEach(function (p) { p.style.animation = 'none'; p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; });
    if (mp) mp.forEach(function (p) { p.style.animation = 'none'; });
    Promise.race([wait, timeout]).then(function () {
      pend = 0; if (me.dead) return;
      var list = [], t = 0, mk = null;
      if (box && sk) {
        var svg = stage(), ps = Array.prototype.slice.call(svg.querySelectorAll('path')), tk = strokes(ps, 1.5), img = box.querySelector('img');
        var wi = { dur: 700, pen: false, tick: function (p) { if (img) img.style.opacity = ease(p).toFixed(3); svg.style.opacity = (1 - ease(p)).toFixed(3); }, end: function () { if (img) img.style.opacity = ''; svg.remove(); done(); } };
        tk.start = function (m) { wi.t0 = performance.now() + tk.dur * .55; m.par.push(wi); };
        list.push(tk);
      } else if (box && P) {
        var ft = frameTag(box, im.tag || (im.alt || '').split(/\s+/).slice(0, 5).join(' ')), t2 = strokes(ft.paths, 1.1), img2 = box.querySelector('img');
        var wi2 = { dur: 700, pen: false, tick: function (p) { if (img2) img2.style.opacity = ease(p).toFixed(3); ft.svg.style.opacity = ft.tag.style.opacity = (1 - ease(p)).toFixed(3); }, end: function () { if (img2) img2.style.opacity = ''; ft.svg.remove(); ft.tag.remove(); done(); } };
        t2.start = function (m) { m.also({ dur: 350, pen: false, tick: function (p) { ft.tag.style.opacity = ease(p).toFixed(3); } }, t2.dur * .65); wi2.t0 = performance.now() + t2.dur * .9; m.par.push(wi2); };
        list.push(t2);
      } else if (box) { done(); }
      if (hd) list.push(wipe(hd, .55));
      if (hd && s.mark) { mk = marker(hd, s.mark, .3); if (mk) list.push(mk); }
      if (A) { var as = strokes(A.paths, 1.2); list.push(as); as.start = function (m) { m.also(fade(A.wash, 0, A.wo, .9), 450); }; }
      if (mp && mp.length) list.push(strokes(mp, 1.7));
      if (dp.length) list.push(strokes(dp, .4));
      list.forEach(function (x) { t += x.dur; });
      k = Math.min(1, TOTAL * 1000 / t); list.forEach(function (x) { x.dur *= k; me.add(x); });
      el.style.setProperty('--eo', Math.round((box && sk ? 1500 : 0) * k * .8 + 350) + 'ms');
      if (skip) me.finish();
    }).catch(function () { pend = 0; me.q = []; me.par = []; me.cur = null; if (hd) { hd.style.clipPath = ''; hd.classList.add('dk-wo'); } done(); if (A) { A.paths.forEach(function (p) { p.style.strokeDashoffset = '0'; }); A.wash.style.opacity = ''; } dp.forEach(function (p) { p.style.strokeDashoffset = '0'; }); });
    var nx = o.deck.slides[o.i + 1], nim = nx && nx.img && o.deck.images && o.deck.images[nx.img]; if (nim && nim.sketch && nx.sketch !== false) sketch(nim.sketch).catch(function () {});
    // once this slide has finished drawing, bake the wash of the next slide that has art, while this one is idle. The first bake of a page is a single task of about 100 ms (380 ms at 4x throttle, the SVG filter warming up); every later bake is a few ms. Left to the art slide itself it lands inside that slide's reveal.
    if (o.ent && o.i > 0) setTimeout(function () {   // never from the first slide: a page load stays free of it (Lighthouse's blocking-time window); it starts once the teacher has moved on
      var j = o.i + 1, n = o.deck.slides.length;
      while (j < n && !o.deck.slides[j].art) j++;
      if (j < n && !me.dead) (window.requestIdleCallback || setTimeout)(function () { bake(getComputedStyle(el).getPropertyValue('--acc').trim() || '217,130,43', (j + 2) * 7919 % 90 + 1); });
    }, TOTAL * 1000 + 500);
    el.addEventListener('dk-art', function () { if (me.dead || !el.dkP) return; el.dkP.forEach(function (p) { p.style.animation = 'none'; }); me.add(strokes(el.dkP, 1.7)); });
    return {
      busy: function () { return pend || me.busy(); },
      finish: function () { if (pend) skip = 1; else me.finish(); },
      step: function (n, prev) {
        if (n <= prev) return;
        var g = el.querySelectorAll('.dk-dd[data-b="' + n + '"]'), ps = [];
        Array.prototype.forEach.call(g, function (x) { Array.prototype.forEach.call(x.querySelectorAll('path'), function (p) { p.style.animation = 'none'; ps.push(p); }); });
        if (ps.length) { var tk = strokes(ps, STEP * .6); me.add(tk); }
      },
      stop: function () { me.stop(); }
    };
  }
  window.EEDraw = { enter: enter, strokes: strokes };
}());
