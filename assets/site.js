/* Theme toggle, search, and analytics.
   Plain JavaScript, no dependencies, no build step. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     ANALYTICS

     Off until you paste your own counter URL below. To switch it on:

       1. Sign up (free) at https://www.goatcounter.com — pick a code,
          for example "nivedhgovil".
       2. Put your counter URL here:
            var ANALYTICS = 'https://nivedhgovil.goatcounter.com/count';
       3. Commit and push.

     GoatCounter sets no cookies and collects no personal data, so the
     site needs no cookie banner. Leave the string empty to keep it off —
     nothing is loaded and no request is made.
     ------------------------------------------------------------------ */
  var ANALYTICS = '';

  var script = document.currentScript;
  var base = (script && script.getAttribute('data-base')) || '';

  /* ---------------- Theme ---------------- */
  var root = document.documentElement;

  function apply(theme) {
    if (theme) root.setAttribute('data-theme', theme);
    else root.removeAttribute('data-theme');
    var dark = theme === 'dark' ||
      (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      b.setAttribute('aria-pressed', String(dark));
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0b0b0a' : '#ffffff');
  }

  var stored = null;
  try { stored = localStorage.getItem('theme'); } catch (e) {}
  if (stored) apply(stored); else apply(null);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.theme-toggle');
    if (!btn) return;
    var isDark = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    apply(next);
  });

  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';

  /* ---------------- Search ---------------- */
  var overlay, input, results, index = null, active = -1;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="search-box" role="dialog" aria-modal="true" aria-label="Search">' +
        '<div class="search-field">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
               'stroke-linecap="round" aria-hidden="true">' +
            '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
          '<input type="search" placeholder="Search writing, builds and books…" ' +
                 'aria-label="Search the site" autocomplete="off">' +
          '<button type="button" class="search-close" aria-label="Close search">Esc</button>' +
        '</div>' +
        '<div class="search-results" role="listbox"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    input = overlay.querySelector('input');
    results = overlay.querySelector('.search-results');

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.closest('.search-close')) close();
    });
    input.addEventListener('input', run);
    input.addEventListener('keydown', function (e) {
      var items = results.querySelectorAll('a');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!items.length) return;
        active += e.key === 'ArrowDown' ? 1 : -1;
        if (active < 0) active = items.length - 1;
        if (active >= items.length) active = 0;
        items.forEach(function (a, i) { a.classList.toggle('on', i === active); });
        items[active].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && active > -1 && items[active]) {
        items[active].click();
      }
    });
  }

  function open() {
    if (!overlay) build();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    input.focus();
    if (index === null) {
      if (window.SEARCH_INDEX) {
        index = window.SEARCH_INDEX;
      } else {
        /* Fallback for anyone loading the page without the index script. */
        index = [];
        fetch(base + 'assets/search-index.json')
          .then(function (r) { return r.json(); })
          .then(function (d) { index = d; run(); })
          .catch(function () {
            results.innerHTML = '<p class="search-empty">Search is unavailable.</p>';
          });
      }
    }
  }

  function close() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    input.value = '';
    results.innerHTML = '';
    active = -1;
  }

  function run() {
    var q = input.value.trim().toLowerCase();
    active = -1;
    if (!q) { results.innerHTML = '<p class="search-empty">Type to search.</p>'; return; }
    var words = q.split(/\s+/);
    var hits = index.map(function (r) {
      var hay = (r.title + ' ' + r.kind + ' ' + r.section + ' ' + r.meta + ' ' + r.text).toLowerCase();
      var score = 0;
      for (var i = 0; i < words.length; i++) {
        if (hay.indexOf(words[i]) === -1) return null;
        if (r.title.toLowerCase().indexOf(words[i]) > -1) score += 3;
        score += 1;
      }
      return { r: r, score: score };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 12);

    if (!hits.length) {
      results.innerHTML = '<p class="search-empty">Nothing found for &ldquo;' +
        input.value.replace(/[<>&]/g, '') + '&rdquo;.</p>';
      return;
    }
    results.innerHTML = hits.map(function (h) {
      var r = h.r;
      /* Index URLs are relative to the site root; base lifts us out of pieces/. */
      return '<a href="' + base + r.url + '" role="option">' +
               '<span class="s-kind">' + r.kind + '</span>' +
               '<span class="s-title">' + r.title + '</span>' +
               '<span class="s-text">' + r.text + '</span>' +
             '</a>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('.search-open')) { e.preventDefault(); open(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && !overlay.hidden) close();
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) &&
        !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); open();
    }
  });

  /* ---------------- Contact form ----------------
     There is no server behind a static site, so the form opens a pre-filled
     email addressed to the owner. To use a real form service instead, give the
     form an action and a method — see the README — and this handler stands
     aside automatically. */
  var form = document.querySelector('.contact-form[data-mailto]');
  if (form && !form.getAttribute('action')) {
    var note = form.querySelector('.form-note');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var phone = form.phone.value.trim();
      var message = form.message.value.trim();

      [form.name, form.email, form.message].forEach(function (f) { f.classList.remove('invalid'); });
      var missing = [];
      if (!name) { missing.push(form.name); }
      if (!email || email.indexOf('@') < 1) { missing.push(form.email); }
      if (!message) { missing.push(form.message); }
      if (missing.length) {
        missing.forEach(function (f) { f.classList.add('invalid'); });
        note.textContent = 'Please fill in your name, a valid email, and a message.';
        note.className = 'form-note error';
        missing[0].focus();
        return;
      }

      var body = message + '\n\n---\nFrom: ' + name + '\nEmail: ' + email +
                 (phone ? '\nPhone: ' + phone : '');
      var href = 'mailto:' + form.getAttribute('data-mailto') +
                 '?subject=' + encodeURIComponent('Message from ' + name + ' via your website') +
                 '&body=' + encodeURIComponent(body);

      note.className = 'form-note ok';
      note.textContent = 'Opening your email app with the message ready to send…';
      window.location.href = href;
    });

    form.addEventListener('input', function (e) { e.target.classList.remove('invalid'); });
  }

  /* ---------------- Reading progress ----------------
     On a piece it tracks the article, so it reads 100% exactly when the
     last line clears rather than at the foot of the page. Everywhere else
     it tracks the document, and only when there is enough of it that "how
     much is left" is a real question. */
  (function () {
    var piece = document.querySelector('article.prose');
    var tall = document.documentElement.scrollHeight > window.innerHeight * 2.2;
    if (!piece && !tall) return;
    if (piece && piece.offsetHeight <= window.innerHeight * 1.6 && !tall) return;

    var bar = document.createElement('div');
    bar.className = 'read-progress';
    document.body.appendChild(bar);

    var tick = false;
    function drawBar() {
      var done;
      if (piece && piece.offsetHeight > 0) {
        var seen = window.scrollY + window.innerHeight - piece.offsetTop;
        done = seen / piece.offsetHeight;
      } else {
        var room = document.documentElement.scrollHeight - window.innerHeight;
        done = room > 0 ? window.scrollY / room : 1;
      }
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, done)) + ')';
      tick = false;
    }
    addEventListener('scroll', function () {
      if (!tick) { tick = true; requestAnimationFrame(drawBar); }
    }, { passive: true });
    addEventListener('resize', drawBar);
    drawBar();
  })();

  /* ---------------- The menu on small screens ----------------
     Above the breakpoint the nav is a row and this does nothing. Below it
     the row becomes a panel behind a button: the button owns aria-expanded,
     Escape and a click outside close it, and focus is kept inside while it
     is open so a keyboard cannot wander behind it. */
  (function () {
    var header = document.querySelector('.site-header');
    var nav = header && header.querySelector('nav.main-nav');
    var tools = header && header.querySelector('.header-tools');
    if (!nav || !tools) return;

    var navId = nav.id || (nav.id = 'site-menu');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-btn nav-toggle';
    btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', navId);
    btn.innerHTML = '<span class="nav-bars" aria-hidden="true"></span>';
    tools.appendChild(btn);

    var wide = window.matchMedia('(min-width: 861px)');

    function setOpen(on) {
      header.classList.toggle('nav-open', on);
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Close menu' : 'Menu');
    }

    btn.addEventListener('click', function () {
      var on = !header.classList.contains('nav-open');
      setOpen(on);
      if (on) {
        var first = nav.querySelector('a');
        if (first) first.focus();
      }
    });

    // Following a link navigates, so the panel should not be left open
    // behind the new page in the back/forward cache.
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !header.classList.contains('nav-open')) return;
      setOpen(false);
      btn.focus();
    });

    document.addEventListener('click', function (e) {
      if (!header.classList.contains('nav-open')) return;
      if (header.contains(e.target)) return;
      setOpen(false);
    });

    // Tab must not reach the page behind an open panel.
    header.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !header.classList.contains('nav-open')) return;
      var stops = [btn].concat([].slice.call(nav.querySelectorAll('a')));
      var i = stops.indexOf(document.activeElement);
      if (i === -1) return;
      var next = e.shiftKey ? i - 1 : i + 1;
      if (next < 0) next = stops.length - 1;
      if (next >= stops.length) next = 0;
      e.preventDefault();
      stops[next].focus();
    });

    // Growing past the breakpoint turns the panel back into a row, and an
    // open panel would otherwise leave the page scroll-locked.
    wide.addEventListener('change', function (e) { if (e.matches) setOpen(false); });
  })();

  /* ---------------- Copy the email ----------------
     Saves selecting a long address by hand. The tick is the only
     confirmation, so it holds long enough to be read. */
  var mail = document.querySelector('.detail a[href^="mailto:"], .d-value a[href^="mailto:"]');
  if (mail && navigator.clipboard) {
    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'copy-btn';
    copy.setAttribute('aria-label', 'Copy the email address');
    copy.innerHTML =
      '<svg class="clip" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="9" y="9" width="11" height="11" rx="2"/>' +
        '<path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>' +
      '<svg class="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M4 12.5 9 17.5 20 6.5"/></svg>';
    mail.after(copy);
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(mail.textContent.trim()).then(function () {
        copy.classList.add('done');
        copy.setAttribute('aria-label', 'Email address copied');
        setTimeout(function () {
          copy.classList.remove('done');
          copy.setAttribute('aria-label', 'Copy the email address');
        }, 1800);
      }).catch(function () {});
    });
  }

  /* ---------------- MathCanvas, in the browser ----------------
     A small re-implementation of the three modes the real MathCanvas
     has, so the Software page can show what the project does instead of
     only describing it. The project itself is a Streamlit app in Python;
     this is not it, and the panel says so in its own first line.

     Everything here is plain arithmetic drawn into an SVG: no library,
     no canvas, nothing to download. It only runs on a page that has the
     panel, so every other page pays nothing for it. */
  (function () {
    var root = document.querySelector('[data-mc]');
    if (!root) return;

    var NS = 'http://www.w3.org/2000/svg';
    function el(name, attrs) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    }
    function clear(svg) { while (svg.firstChild) svg.removeChild(svg.firstChild); }
    /* Trailing zeros make a readout jitter as a slider moves, so numbers
       are shown to at most `dp` places and then tidied. */
    function num(v, dp) {
      if (!isFinite(v)) return '—';
      var s = v.toFixed(dp === undefined ? 2 : dp);
      return s.replace(/\.?0+$/, '') || '0';
    }

    /* ---- tabs ---- */
    var tabs = [].slice.call(root.querySelectorAll('[data-mc-tab]'));
    var panels = {};
    [].forEach.call(root.querySelectorAll('[data-mc-panel]'), function (p) {
      panels[p.getAttribute('data-mc-panel')] = p;
    });

    function show(name, focus) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-mc-tab') === name;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      for (var k in panels) panels[k].hidden = k !== name;
      if (name === 'fn') drawFn();
      if (name === 'stats') drawStats();
      if (name === 'proj') drawProj();
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(t.getAttribute('data-mc-tab')); });
      t.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1
              : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
        if (j < 0 && e.key !== 'Home') return;
        e.preventDefault();
        j = (j + tabs.length) % tabs.length;
        show(tabs[j].getAttribute('data-mc-tab'), true);
      });
    });

    /* ---- shared plotting frame ----
       One mapping from maths coordinates to the SVG box, and one set of
       axes, used by the function plot and the trajectory alike. */
    function frame(svg, box, xmin, xmax, ymin, ymax, opts) {
      var pad = { l: 34, r: 10, t: 10, b: 26 };
      var w = box.w - pad.l - pad.r, h = box.h - pad.t - pad.b;
      var X = function (x) { return pad.l + (x - xmin) / (xmax - xmin) * w; };
      var Y = function (y) { return pad.t + (1 - (y - ymin) / (ymax - ymin)) * h; };

      var g = el('g', {});
      var stepX = (xmax - xmin) / (opts && opts.xdiv || 8);
      var stepY = (ymax - ymin) / (opts && opts.ydiv || 6);
      var i;
      for (i = 0; i <= (opts && opts.xdiv || 8); i++) {
        var gx = X(xmin + i * stepX);
        g.appendChild(el('line', { x1: gx, y1: pad.t, x2: gx, y2: pad.t + h, class: 'mc-grid' }));
      }
      for (i = 0; i <= (opts && opts.ydiv || 6); i++) {
        var gy = Y(ymin + i * stepY);
        g.appendChild(el('line', { x1: pad.l, y1: gy, x2: pad.l + w, y2: gy, class: 'mc-grid' }));
      }
      /* The axes are drawn only where zero is actually inside the view. */
      if (ymin < 0 && ymax > 0) g.appendChild(el('line', { x1: pad.l, y1: Y(0), x2: pad.l + w, y2: Y(0), class: 'mc-axis' }));
      if (xmin < 0 && xmax > 0) g.appendChild(el('line', { x1: X(0), y1: pad.t, x2: X(0), y2: pad.t + h, class: 'mc-axis' }));

      var t1 = el('text', { x: pad.l + w, y: box.h - 8, class: 'mc-tick', 'text-anchor': 'end' });
      t1.textContent = num(xmax, 1) + (opts && opts.xunit || '');
      var t2 = el('text', { x: pad.l - 6, y: Y(ymax) + 9, class: 'mc-tick', 'text-anchor': 'end' });
      t2.textContent = num(ymax, 1);
      var t3 = el('text', { x: pad.l - 6, y: Y(ymin), class: 'mc-tick', 'text-anchor': 'end' });
      t3.textContent = num(ymin, 1);
      g.appendChild(t1); g.appendChild(t2); g.appendChild(t3);
      svg.appendChild(g);
      return { X: X, Y: Y, pad: pad, w: w, h: h };
    }

    /* ---- functions ---- */
    var curve = root.querySelector('[data-mc-curve]');
    var fnSvg = root.querySelector('[data-mc-fnplot]');
    var fnCap = root.querySelector('[data-mc-fncaption]');
    var ins = {}, outs = {};
    [].forEach.call(root.querySelectorAll('[data-mc-in]'), function (i) { ins[i.getAttribute('data-mc-in')] = i; });
    [].forEach.call(root.querySelectorAll('[data-mc-out]'), function (o) { outs[o.getAttribute('data-mc-out')] = o; });

    /* Which coefficients each curve uses, and how it reads as an
       equation. Only the coefficients in `uses` are shown. */
    /* An equation is written the way it would be written by hand: a
       coefficient of 1 is not printed, a term of 0 is dropped, and a
       negative term becomes a minus rather than "+ -3". */
    function coef(v, term) {
      if (v === 0) return '';
      if (term && Math.abs(v) === 1) return (v < 0 ? '−' : '') + term;
      return (v < 0 ? '−' : '') + num(Math.abs(v)) + term;
    }
    /* sin, cos and tan: a coefficient of 1 in front of the function is
       not written either, so "1 sin(x)" reads as "sin(x)". */
    function trig(a, name, b) {
      var lead = Math.abs(a) === 1 ? (a < 0 ? '−' : '') : coef(a, '') + ' ';
      return lead + name + '(' + coef(b, 'x') + ')';
    }

    function join(parts) {
      var out = '';
      parts.forEach(function (p) {
        if (!p) return;
        if (!out) { out = p; return; }
        out += p.charAt(0) === '−' ? ' − ' + p.slice(1) : ' + ' + p;
      });
      return out || '0';
    }

    var CURVES = {
      constant:  { uses: ['c'],           f: function (x, a, b, c) { return c; },
                   eq: function (a, b, c) { return 'y = ' + (c < 0 ? '−' : '') + num(Math.abs(c)); } },
      linear:    { uses: ['a', 'b'],      f: function (x, a, b) { return a * x + b; },
                   eq: function (a, b) { return 'y = ' + join([coef(a, 'x'), coef(b, '')]); } },
      quadratic: { uses: ['a', 'b', 'c'], f: function (x, a, b, c) { return a * x * x + b * x + c; },
                   eq: function (a, b, c) { return 'y = ' + join([coef(a, 'x²'), coef(b, 'x'), coef(c, '')]); } },
      sine:      { uses: ['a', 'b'],      f: function (x, a, b) { return a * Math.sin(b * x); },
                   eq: function (a, b) { return 'y = ' + (a === 0 ? '0' : trig(a, 'sin', b)); } },
      cosine:    { uses: ['a', 'b'],      f: function (x, a, b) { return a * Math.cos(b * x); },
                   eq: function (a, b) { return 'y = ' + (a === 0 ? '0' : trig(a, 'cos', b)); } },
      tangent:   { uses: ['a', 'b'],      f: function (x, a, b) { return a * Math.tan(b * x); },
                   eq: function (a, b) { return 'y = ' + (a === 0 ? '0' : trig(a, 'tan', b)); } }
    };

    function drawFn() {
      var kind = curve.value, spec = CURVES[kind];
      var a = parseFloat(ins.a.value), b = parseFloat(ins.b.value), c = parseFloat(ins.c.value);
      ['a', 'b', 'c'].forEach(function (k) {
        var field = root.querySelector('[data-mc-coef="' + k + '"]');
        if (field) field.hidden = spec.uses.indexOf(k) < 0;
        if (outs[k]) outs[k].textContent = num({ a: a, b: b, c: c }[k]);
      });

      clear(fnSvg);
      var xmin = -10, xmax = 10, ymin = -10, ymax = 10;
      var fr = frame(fnSvg, { w: 340, h: 220 }, xmin, xmax, ymin, ymax);

      /* The path is broken wherever the curve leaves the view, which is
         what keeps tangent from drawing a vertical line through each of
         its asymptotes. */
      var d = '', pen = false, N = 900, prev = null;
      for (var i = 0; i <= N; i++) {
        var x = xmin + (xmax - xmin) * i / N;
        var y = spec.f(x, a, b, c);
        var ok = isFinite(y) && y >= ymin && y <= ymax;
        /* A jump larger than the whole view between two neighbouring
           samples is an asymptote, not a line worth drawing. */
        if (ok && prev !== null && Math.abs(y - prev) > (ymax - ymin)) ok = false;
        if (ok) { d += (pen ? 'L' : 'M') + fr.X(x).toFixed(2) + ' ' + fr.Y(y).toFixed(2) + ' '; pen = true; }
        else { pen = false; }
        prev = isFinite(y) ? y : null;
      }
      if (d) fnSvg.appendChild(el('path', { d: d, class: 'mc-curve' }));
      fnCap.textContent = spec.eq(a, b, c) + ', plotted from x = −10 to 10.';
    }

    curve.addEventListener('change', drawFn);
    ['a', 'b', 'c'].forEach(function (k) { ins[k].addEventListener('input', drawFn); });

    /* ---- statistics ---- */
    var valuesIn = root.querySelector('[data-mc-values]');
    var statsEl = root.querySelector('[data-mc-stats]');
    var barsSvg = root.querySelector('[data-mc-bars]');
    var barsCap = root.querySelector('[data-mc-barscaption]');
    var vErr = root.querySelector('[data-mc-verr]');

    function parseValues(s) {
      var parts = s.split(',').map(function (p) { return p.trim(); }).filter(function (p) { return p !== ''; });
      var out = [];
      for (var i = 0; i < parts.length; i++) {
        var v = Number(parts[i]);
        if (!isFinite(v)) return null;
        out.push(v);
      }
      return out;
    }

    function row(dl, term, value) {
      var dt = document.createElement('dt'); dt.textContent = term;
      var dd = document.createElement('dd'); dd.textContent = value;
      dl.appendChild(dt); dl.appendChild(dd);
    }

    function drawStats() {
      var v = parseValues(valuesIn.value);
      if (!v || !v.length) {
        vErr.textContent = v === null ? 'Numbers separated by commas, please.' : 'Enter at least one number.';
        return;
      }
      vErr.textContent = '';

      var n = v.length;
      var mean = v.reduce(function (s, x) { return s + x; }, 0) / n;
      var sorted = v.slice().sort(function (p, q) { return p - q; });
      var mid = Math.floor(n / 2);
      var median = n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      /* Population variance, the same one NumPy's var() returns by
         default: the mean of the squared deviations, divided by n. */
      var variance = v.reduce(function (s, x) { return s + (x - mean) * (x - mean); }, 0) / n;
      var sd = Math.sqrt(variance);
      var range = sorted[n - 1] - sorted[0];

      statsEl.innerHTML = '';
      row(statsEl, 'Mean', num(mean, 3));
      row(statsEl, 'Median', num(median, 3));
      row(statsEl, 'Standard deviation', num(sd, 3));
      row(statsEl, 'Variance', num(variance, 3));
      row(statsEl, 'Range', num(range, 3));

      clear(barsSvg);
      var W = 340, H = 180, pad = { l: 8, r: 8, t: 10, b: 24 };
      var innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
      var lo = Math.min(0, sorted[0]), hi = Math.max(0, sorted[n - 1]);
      if (hi === lo) hi = lo + 1;
      var zero = pad.t + (1 - (0 - lo) / (hi - lo)) * innerH;
      var gap = 6, bw = Math.max(2, (innerW - gap * (n - 1)) / n);

      barsSvg.appendChild(el('line', { x1: pad.l, y1: zero, x2: W - pad.r, y2: zero, class: 'mc-axis' }));
      var meanY = pad.t + (1 - (mean - lo) / (hi - lo)) * innerH;
      barsSvg.appendChild(el('line', { x1: pad.l, y1: meanY, x2: W - pad.r, y2: meanY, class: 'mc-mean' }));

      v.forEach(function (x, i) {
        var bx = pad.l + i * (bw + gap);
        var by = pad.t + (1 - (Math.max(x, 0) - lo) / (hi - lo)) * innerH;
        var bh = Math.abs(x) / (hi - lo) * innerH;
        barsSvg.appendChild(el('rect', { x: bx.toFixed(2), y: by.toFixed(2), width: bw.toFixed(2),
                                         height: Math.max(1, bh).toFixed(2), rx: 2, class: 'mc-bar' }));
      });

      var lbl = el('text', { x: W - pad.r, y: H - 7, class: 'mc-tick', 'text-anchor': 'end' });
      lbl.textContent = 'mean ' + num(mean, 2);
      barsSvg.appendChild(lbl);
      barsCap.textContent = n + (n === 1 ? ' observation' : ' observations') +
        ', each drawn as a bar, with the mean marked across them.';
    }

    valuesIn.addEventListener('input', drawStats);

    /* ---- projectile ---- */
    var projSvg = root.querySelector('[data-mc-proj]');
    var projCap = root.querySelector('[data-mc-projcaption]');
    var projStats = root.querySelector('[data-mc-projstats]');
    var G = 9.81;

    function drawProj() {
      var deg = parseFloat(ins.angle.value), u = parseFloat(ins.speed.value);
      outs.angle.textContent = deg + '°';
      outs.speed.textContent = u + ' m/s';

      var th = deg * Math.PI / 180;
      var flight = 2 * u * Math.sin(th) / G;          /* time of flight   */
      var range = u * u * Math.sin(2 * th) / G;        /* horizontal range */
      var peak = u * u * Math.sin(th) * Math.sin(th) / (2 * G);

      clear(projSvg);
      var xmax = Math.max(range, 1) * 1.08;
      var ymax = Math.max(peak, 1) * 1.25;
      var fr = frame(projSvg, { w: 340, h: 200 }, 0, xmax, 0, ymax, { xdiv: 6, ydiv: 4, xunit: ' m' });

      var d = '', N = 160;
      for (var i = 0; i <= N; i++) {
        var t = flight * i / N;
        var x = u * Math.cos(th) * t;
        var y = u * Math.sin(th) * t - 0.5 * G * t * t;
        d += (i ? 'L' : 'M') + fr.X(x).toFixed(2) + ' ' + fr.Y(Math.max(y, 0)).toFixed(2) + ' ';
      }
      projSvg.appendChild(el('path', { d: d, class: 'mc-curve' }));
      projSvg.appendChild(el('circle', { cx: fr.X(range / 2).toFixed(2), cy: fr.Y(peak).toFixed(2), r: 3.5, class: 'mc-dot' }));

      projStats.innerHTML = '';
      row(projStats, 'Range', num(range, 2) + ' m');
      row(projStats, 'Peak height', num(peak, 2) + ' m');
      row(projStats, 'Time of flight', num(flight, 2) + ' s');
      projCap.textContent = 'Launched at ' + deg + ' degrees and ' + u +
        ' metres per second: it travels ' + num(range, 1) + ' metres and reaches ' +
        num(peak, 1) + ' metres at the top.';
    }

    ['angle', 'speed'].forEach(function (k) { ins[k].addEventListener('input', drawProj); });

    drawFn();
    drawStats();
    drawProj();
  })();

  /* ---------------- Artwork lightbox ----------------
     A gallery you cannot look at closely is not much of a gallery. */
  /* Anything with a picture worth looking at closely: artwork, CAD models,
     schematics and photographs all behave the same way here. */
  var art = document.querySelectorAll(
    '.art-gallery .art-piece:has(img), figure.design:has(img), .achievement:has(.shot)');
  /* A placeholder tile is not worth opening. */
  art = [].filter.call(art, function (f) {
    var img = f.querySelector('img');
    return img && img.getAttribute('src') && !/placeholder/.test(img.getAttribute('src'));
  });
  if (art.length) {
    var box = null, at = 0;

    function buildBox() {
      box = document.createElement('div');
      box.className = 'lightbox';
      box.hidden = true;
      box.innerHTML =
        '<button type="button" class="lb-close" aria-label="Close">&times;</button>' +
        '<button type="button" class="lb-nav lb-prev" aria-label="Previous image">' + CHEV + '</button>' +
        '<button type="button" class="lb-nav lb-next" aria-label="Next image">' + CHEV + '</button>' +
        '<figure><img alt=""><figcaption><span class="lb-title"></span>' +
        '<span class="lb-count"></span></figcaption></figure>';
      document.body.appendChild(box);
      box.addEventListener('click', function (e) {
        if (e.target === box || e.target.closest('.lb-close')) closeBox();
        else if (e.target.closest('.lb-prev')) show(at - 1);
        else if (e.target.closest('.lb-next')) show(at + 1);
      });
    }

    function show(i) {
      at = (i + art.length) % art.length;
      var fig = art[at], img = fig.querySelector('img');
      var t = fig.querySelector('.art-title, .design-title, h3');
      var shot = box.querySelector('img');
      shot.src = img.currentSrc || img.src;
      shot.alt = img.alt || '';
      /* restart the enter animation on each change */
      shot.style.animation = 'none'; void shot.offsetWidth; shot.style.animation = '';
      box.querySelector('.lb-title').textContent = t ? t.textContent.trim() : '';
      box.querySelector('.lb-count').textContent = (at + 1) + ' of ' + art.length;
      box.querySelectorAll('.lb-nav').forEach(function (b) { b.hidden = art.length < 2; });
    }

    var lastFocus = null;
    function openBox(i) {
      if (!box) buildBox();
      lastFocus = document.activeElement;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      show(i);
      box.querySelector('.lb-close').focus();
    }
    function closeBox() {
      if (!box || box.hidden) return;
      box.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    art.forEach(function (fig, i) {
      fig.tabIndex = 0;
      fig.setAttribute('role', 'button');
      fig.setAttribute('aria-label', 'Open image ' + (i + 1) + ' of ' + art.length);
      fig.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;   /* follow the link instead */
        openBox(i);
      });
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBox(i); }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (!box || box.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); closeBox(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
    }, true);
  }

  /* ---------------- Back to top ----------------
     Appears only once there is a page worth climbing back up. */
  var top = document.createElement('button');
  top.type = 'button';
  top.className = 'to-top';
  top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(top);
  top.addEventListener('click', function () {
    var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
  });
  var topTick = false;
  addEventListener('scroll', function () {
    if (topTick) return;
    topTick = true;
    requestAnimationFrame(function () {
      top.classList.toggle('show', window.scrollY > window.innerHeight);
      topTick = false;
    });
  }, { passive: true });

  /* ---------------- Drawn lines, and arrival ----------------
     The two hero paths are measured rather than guessed, so the dash
     length matches whatever width the SVG ends up at. */
  var dual = document.querySelector('.duality');
  if (dual) {
    var setLen = function () {
      dual.querySelectorAll('path').forEach(function (path) {
        path.style.setProperty('--len', Math.ceil(path.getTotalLength()));
      });
    };
    setLen();
    addEventListener('resize', setLen);

    /* The signal runs once the two lines have finished drawing, and again
       whenever the reader points at the band. Restarting means taking the
       class off and letting the browser notice before putting it back. */
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var fire = function () {
        dual.classList.remove('pulse');
        void dual.offsetWidth;
        dual.classList.add('pulse');
      };
      setTimeout(fire, 1700);
      dual.addEventListener('pointerenter', fire);
    }
  }

  /* Cards and listings arrive as they come into view. The observer only
     adds a class; the animation itself runs on a fixed duration, so a
     slow scroll does not drag it out. Each item fires once. */
  var toReveal = document.querySelectorAll(
    'main.wrap > .cards > .card, main.wrap > .section .card, ' +
    '.featured-list > .piece, .art-gallery > .art-piece, ' +
    '.sw-grid > .sw-project, .achievements > .achievement, .qa-list > .qa, ' +
    '.ach-grid > .ach-item');
  if (toReveal.length && 'IntersectionObserver' in window) {
    toReveal.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.setProperty('--i', i % 4);
    });
    /* A figure that counts up to itself as its card arrives. The number
       in the markup is the real one and is what is left on screen; this
       only animates the way it gets there, and not at all for somebody
       who asked for less motion. */
    var calmCount = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function countUp(root) {
      if (calmCount) return;
      root.querySelectorAll('[data-count]').forEach(function (el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (!isFinite(target)) return;
        var started = null, span = 760;
        el.textContent = '0';
        (function step(now) {
          if (started === null) started = now;
          var t = Math.min(1, (now - started) / span);
          /* Decelerating, so the last few numbers are readable. */
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = String(target);
        })(performance.now());
      });
    }

    var watcher = new IntersectionObserver(function (rows) {
      rows.forEach(function (row) {
        if (!row.isIntersecting) return;
        row.target.classList.add('seen');
        countUp(row.target);
        watcher.unobserve(row.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    toReveal.forEach(function (el) { watcher.observe(el); });
  }

  /* ---------------- Terminal ----------------
     The site described as a filesystem, so it can be walked with cd and
     ls. Every node maps to a real page; nothing here is invented. */
  var TREE = {
    name: '~', type: 'dir', kids: [
      { name: 'home',        type: 'page', url: 'index.html',  desc: 'The front page.' },
      { name: 'literary',    type: 'dir',  url: 'literary.html',
        desc: 'Everything written: articles, poems, essays, short stories and books.',
        kids: [
          { name: 'articles.txt',      type: 'page', url: 'articles.html',      desc: 'Pieces thought all the way through.' },
          { name: 'essays.txt',        type: 'page', url: 'essays.html',        desc: 'Longer arguments, researched and cited.' },
          { name: 'research.txt',      type: 'page', url: 'research.html',      desc: 'Papers and the questions behind them.' },
          { name: 'poems.txt',         type: 'page', url: 'poems.html',         desc: 'Verse, written for sound as much as meaning.' },
          { name: 'short-stories.txt', type: 'page', url: 'short-stories.html', desc: 'Stories with somebody living in them.' },
          { name: 'books.txt',         type: 'page', url: 'books.html',         desc: 'Books worth handing to someone else.' },
          { name: 'highlights.txt',    type: 'page', url: 'literary.html#highlights',
            desc: 'Where the writing has been published, and the Greader\u2019s Club session on blogging.' }
        ] },
      { name: 'engineering', type: 'dir',  url: 'engineering.html',
        desc: 'Things built: Arduino, electronics and CAD.',
        kids: [
          { name: 'builds', type: 'dir', url: 'engineering.html',
            desc: 'Arduino builds, with the video from each bench.',
            kids: [
              { name: 'radar.txt',          type: 'page', url: 'engineering.html#radar',
                desc: 'Arduino Radar: an ultrasonic sensor on a servo, detecting objects at different angles.' },
              { name: 'radar-tutorial.txt', type: 'page', url: 'engineering.html#radar-tutorial',
                desc: 'A step-by-step demonstration of building the radar: components, wiring and setup.' },
              { name: 'crane-tutorial.txt', type: 'page', url: 'engineering.html#crane-tutorial',
                desc: 'Building an Arduino-controlled mini crane, assembly and connections.' },
              { name: 'tiranga.txt',        type: 'page', url: 'engineering.html#tiranga',
                desc: 'An RGB LED showing the flag\u2019s saffron, white and green.' }
            ] },
          { name: 'designs.txt',    type: 'page', url: 'designs.html',     desc: 'CAD models drawn before anything is built.' },
          { name: 'electrical.txt', type: 'page', url: 'electrical.html',  desc: 'Schematics, PCB layouts and circuit diagrams.' }
        ] },
      { name: 'art',      type: 'page', url: 'art.html',      desc: 'Drawings and paintings.' },
      { name: 'software', type: 'page', url: 'software.html', desc: 'Web pages, Python tools and small games, with code and demos.' },
      /* Each file opens the card it names, so `open checkpoint.txt`
         lands on that card rather than the top of the page. */
      { name: 'achievements', type: 'dir', url: 'achievements.html',
        desc: 'Marks, a rank, a certificate and a belt.',
        kids: [
          { name: 'checkpoint.txt', type: 'page', url: 'achievements.html#checkpoint',
            desc: 'Cambridge Lower Secondary Checkpoint: 50 in Maths, 50 in Science, 41 in English.' },
          { name: 'finance-olympiad.txt', type: 'page', url: 'achievements.html#finance',
            desc: 'National Finance Olympiad: All-India Rank 112.' },
          { name: 'homi-bhabha.txt', type: 'page', url: 'achievements.html#bhabha',
            desc: 'Homi Bhabha merit certificate, 2023.' },
          { name: 'taekwondo.txt', type: 'page', url: 'achievements.html#belt',
            desc: 'Green belt in Taekwondo.' }
        ] },
      { name: 'about',    type: 'page', url: 'about.html',    desc: 'School, interests, and how to get in touch.' }
    ]
  };

  var tEl, tBody, tInput, tWhere, cwd = [], hist = [], histAt = -1;

  function node(path) {
    var n = TREE;
    for (var i = 0; i < path.length; i++) {
      if (!n.kids) return null;
      n = n.kids.filter(function (k) { return k.name === path[i]; })[0];
      if (!n) return null;
    }
    return n;
  }
  function prompt() { return cwd.length ? '~/' + cwd.join('/') : '~'; }

  function say(text, cls) {
    var line = document.createElement('p');
    if (cls) line.className = cls;
    line.textContent = text;
    tBody.appendChild(line);
    tBody.scrollTop = tBody.scrollHeight;
    return line;
  }
  function sayHTML(html) {
    var line = document.createElement('p');
    line.innerHTML = html;
    tBody.appendChild(line);
    tBody.scrollTop = tBody.scrollHeight;
  }

  function here() { return node(cwd) || TREE; }
  function kidsHere() { return here().kids || []; }

  function go(url) {
    say('opening ' + url + ' ...', 'ok');
    setTimeout(function () { location.href = base + url; }, 220);
  }

  var HELP = [
    ['help',        'show this message'],
    ['ls',          'list what is here'],
    ['cd <name>',   'go into a section (.. to go up, ~ for the top)'],
    ['cat <name>',  'read what a section holds'],
    ['open <name>', 'open that page'],
    ['pwd',         'print the current path'],
    ['tree',        'show the whole site at once'],
    ['whoami',      'who this is'],
    ['clear',       'clear the screen'],
    ['exit',        'close the terminal (Esc)']
  ];

  /* The help used to be padded with spaces to a fixed column, which was
     doubling the gap it meant to leave and left the descriptions in a
     ragged stack. A two-column grid lines them up by measurement
     instead, and folds to one column when the terminal is narrow. */
  function sayHelp() {
    var dl = document.createElement('dl');
    dl.className = 'term-help';
    HELP.forEach(function (h) {
      var dt = document.createElement('dt');
      dt.textContent = h[0];
      var dd = document.createElement('dd');
      dd.textContent = h[1];
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
    tBody.appendChild(dl);
    tBody.scrollTop = tBody.scrollHeight;
  }

  function exec(raw) {
    var bits = raw.trim().split(/\s+/);
    var cmd = (bits.shift() || '').toLowerCase();
    var arg = bits.join(' ');
    if (!cmd) return;

    if (cmd === 'help') {
      say('Available commands:', 'head');
      sayHelp();
      say('Tab completes a name. Up and down walk your history.', 'dim');

    } else if (cmd === 'ls') {
      var ks = kidsHere();
      if (!ks.length) return say('nothing here', 'dim');
      ks.forEach(function (k) {
        sayHTML(k.type === 'dir'
          ? '<span class="dir">' + k.name + '/</span>'
          : '<span class="file">' + k.name + '</span>');
      });

    } else if (cmd === 'cd') {
      if (!arg || arg === '~' || arg === '/') { cwd = []; return paint(); }
      if (arg === '..') { cwd.pop(); return paint(); }
      var k = kidsHere().filter(function (x) { return x.name === arg || x.name === arg.replace(/\/$/, ''); })[0];
      if (!k) return say('cd: ' + arg + ': no such section', 'err');
      if (k.type === 'dir') { cwd = cwd.concat(k.name); paint(); }
      else go(k.url);

    } else if (cmd === 'cat') {
      var f = kidsHere().filter(function (x) { return x.name === arg; })[0];
      if (!f) return say('cat: ' + arg + ': no such file', 'err');
      say(f.name.replace(/\.txt$/, ''), 'head');
      say(f.desc, 'dim');
      say('open ' + f.name + '  to go there', 'dim');

    } else if (cmd === 'open') {
      var o = kidsHere().filter(function (x) { return x.name === arg; })[0];
      if (!o) return say('open: ' + arg + ': not here. try ls', 'err');
      go(o.url);

    } else if (cmd === 'pwd') {
      say(prompt());

    } else if (cmd === 'tree') {
      (function walk(n, pad) {
        (n.kids || []).forEach(function (k, i, all) {
          var edge = (i === all.length - 1 ? '└─ ' : '├─ ');
          sayHTML('<span class="dim">' + pad + edge + '</span>' +
            (k.type === 'dir' ? '<span class="dir">' + k.name + '/</span>'
                              : '<span class="file">' + k.name + '</span>'));
          if (k.kids) walk(k, pad + (i === all.length - 1 ? '   ' : '│  '));
        });
      })(TREE, '');

    } else if (cmd === 'whoami') {
      say('Nivedh Govil', 'head');
      say('Words on one side, circuits on the other.', 'dim');

    } else if (cmd === 'clear') {
      tBody.innerHTML = '';

    } else if (cmd === 'exit' || cmd === 'q') {
      closeTerm();

    } else {
      say('command not found: ' + cmd + '   (try help)', 'err');
    }
  }

  function paint() { tWhere.textContent = prompt(); }

  function complete() {
    var val = tInput.value;
    var bits = val.split(/\s+/);
    var part = bits[bits.length - 1] || '';
    var hits = kidsHere().filter(function (k) { return k.name.indexOf(part) === 0; });
    if (hits.length === 1) {
      bits[bits.length - 1] = hits[0].name;
      tInput.value = bits.join(' ');
    } else if (hits.length > 1) {
      say(prompt() + ' $ ' + val, 'cmd');
      hits.forEach(function (k) { say('  ' + k.name + (k.type === 'dir' ? '/' : ''), 'dim'); });
    }
  }

  function buildTerm() {
    tEl = document.createElement('div');
    tEl.className = 'term';
    tEl.hidden = true;
    tEl.innerHTML =
      '<div class="term-box" role="dialog" aria-modal="true" aria-label="Site terminal">' +
        '<div class="term-bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span>' +
          '<span class="where">~</span>' +
          '<button type="button" class="term-close" aria-label="Close terminal">esc</button></div>' +
        '<div class="term-body" aria-live="polite"></div>' +
        '<form class="term-line"><span class="ps1"><b class="where">~</b> $</span>' +
          '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" ' +
            'aria-label="Type a command"></form>' +
      '</div>';
    document.body.appendChild(tEl);
    tBody = tEl.querySelector('.term-body');
    tInput = tEl.querySelector('input');
    tWhere = tEl.querySelector('.term-line .where');

    say('Nivedh Govil', 'head');
    say('Words on one side, circuits on the other.', 'dim');
    say('');
    say('This site, as a filesystem. Type help, or ls to look around.', 'dim');

    tEl.addEventListener('click', function (e) {
      if (e.target === tEl || e.target.closest('.term-close')) return closeTerm();
      tInput.focus();
    });
    tEl.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var val = tInput.value;
      say(prompt() + ' $ ' + val, 'cmd');
      if (val.trim()) { hist.push(val); histAt = hist.length; }
      tInput.value = '';
      exec(val);
    });
    tInput.addEventListener('keydown', function (e) {
      /* Handled here because this listener stops the event going further,
         so the document-level Escape would otherwise never see it. */
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); return closeTerm(); }
      if (e.key === 'Tab') { e.preventDefault(); complete(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (histAt > 0) tInput.value = hist[--histAt]; }
      else if (e.key === 'ArrowDown') { e.preventDefault();
        if (histAt < hist.length - 1) tInput.value = hist[++histAt];
        else { histAt = hist.length; tInput.value = ''; } }
      e.stopPropagation();
    });
  }

  function openTerm() {
    if (!tEl) buildTerm();
    tEl.hidden = false;
    document.body.style.overflow = 'hidden';
    paint();
    tInput.focus();
  }
  function closeTerm() {
    if (!tEl || tEl.hidden) return;
    tEl.hidden = true;
    document.body.style.overflow = '';
  }

  /* A button beside search and the theme toggle, and a key from anywhere. */
  document.querySelectorAll('.header-tools').forEach(function (tools) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-btn term-open';
    btn.setAttribute('aria-label', 'Open the terminal');
    btn.title = 'Terminal  (press ` )';
    btn.textContent = '>_';
    tools.insertBefore(btn, tools.firstChild);
    btn.addEventListener('click', openTerm);
  });

  document.addEventListener('keydown', function (e) {
    if (tEl && !tEl.hidden && e.key === 'Escape') { e.preventDefault(); return closeTerm(); }
    if (e.key !== '`' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    e.preventDefault();
    openTerm();
  });

  /* ---------------- Pointer light on the section cards ----------------
     The cover art carries a soft highlight that follows the cursor. It is
     two custom properties and a CSS gradient; the work per frame is a
     style write, and it is skipped entirely on touch, where :hover sticks
     after a tap, and when the reader has asked for less motion. */
  (function () {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var cards = document.querySelectorAll('.card, .ach-item');
    if (!cards.length) return;

    cards.forEach(function (card) {
      var queued = false, mx = 50, my = 50;

      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width) * 100;
        my = ((e.clientY - r.top) / r.height) * 100;
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () {
          queued = false;
          card.style.setProperty('--mx', mx.toFixed(1) + '%');
          card.style.setProperty('--my', my.toFixed(1) + '%');
        });
      });

      card.addEventListener('pointerleave', function () {
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      });
    });
  })();

  /* ---------------- Carrying the cover between pages ----------------
     A section page names its masthead art "cover" in the stylesheet, so
     the browser morphs it across a navigation. The home page cannot do
     that in CSS, because a view-transition name may appear only once per
     document and there are several cards. So the name is handed to
     whichever card is being opened, a moment before the page leaves, and
     taken back if the reader comes back to this page from history. */
  (function () {
    if (!document.startViewTransition) return;

    document.addEventListener('click', function (e) {
      var card = e.target.closest ? e.target.closest('.card') : null;
      if (!card) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      var img = card.querySelector('.card-media');
      if (img) img.style.viewTransitionName = 'cover';
    });

    // Restored from the back/forward cache with the name still applied.
    window.addEventListener('pageshow', function () {
      document.querySelectorAll('.card-media').forEach(function (img) {
        img.style.removeProperty('view-transition-name');
      });
    });
  })();

  /* ---------------- The nav indicator ----------------
     A pill that rests behind the current section and follows the pointer
     across the other links. Built only where there is a real pointer: on
     a touch screen there is nothing to follow, and the plain .active
     background in the stylesheet already says where you are. */
  (function () {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var nav = document.querySelector('nav.main-nav');
    var list = nav && nav.querySelector('ul');
    if (!list) return;

    var links = [].slice.call(list.querySelectorAll('a'));
    var here = list.querySelector('a.active');
    if (links.length < 2) return;

    var glide = document.createElement('span');
    glide.className = 'nav-glide';
    list.appendChild(glide);
    nav.classList.add('has-glide');

    function moveTo(a, animate) {
      if (!a) { glide.classList.remove('on'); return; }
      if (!animate) {
        var keep = glide.style.transition;
        glide.style.transition = 'none';
        place(a);
        glide.offsetHeight;          // settle before transitions resume
        glide.style.transition = keep;
        return;
      }
      place(a);
    }

    function place(a) {
      glide.style.width = a.offsetWidth + 'px';
      glide.style.height = a.offsetHeight + 'px';
      glide.style.transform = 'translate(' + a.offsetLeft + 'px,' + a.offsetTop + 'px)';
      glide.classList.add('on');
    }

    // Rest on the current section, without animating in from the corner.
    moveTo(here, false);

    links.forEach(function (a) {
      a.addEventListener('pointerenter', function () { moveTo(a, true); });
      a.addEventListener('focus', function () { moveTo(a, true); });
    });

    nav.addEventListener('pointerleave', function () { moveTo(here, true); });
    nav.addEventListener('focusout', function (e) {
      if (!nav.contains(e.relatedTarget)) moveTo(here, true);
    });

    // The nav wraps to a second line on narrow screens, so the resting
    // place moves with the layout.
    var t;
    addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () { moveTo(here, false); }, 120);
    });

    // Web fonts land after first paint and change every link's width.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { moveTo(here, false); });
    }
  })();

  /* ---------------- Analytics ---------------- */
  if (ANALYTICS) {
    var a = document.createElement('script');
    a.async = true;
    a.src = 'https://gc.zgo.at/count.js';
    a.setAttribute('data-goatcounter', ANALYTICS);
    document.head.appendChild(a);
  }
})();
