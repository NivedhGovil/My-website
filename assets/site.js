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

      note.className = 'form-note';
      note.textContent = 'Opening your email app with the message ready to send…';
      window.location.href = href;
    });

    form.addEventListener('input', function (e) { e.target.classList.remove('invalid'); });
  }

  /* ---------------- Art carousel ----------------
     The gallery strip scrolls one picture at a time. The arrows are built
     here rather than in the markup, so art.html stays a plain list of
     figures and still reads fine with JavaScript switched off. */
  var strip = document.querySelector('.gallery');
  if (strip && strip.children.length > 1) {
    var frame = document.createElement('div');
    frame.className = 'carousel';
    strip.parentNode.insertBefore(frame, strip);
    frame.appendChild(strip);

    strip.setAttribute('role', 'region');
    strip.setAttribute('aria-label', 'Artwork, use the left and right arrow keys');
    strip.tabIndex = 0;

    function arrow(dir) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-btn ' + dir;
      b.setAttribute('aria-label', dir === 'prev' ? 'Previous artwork' : 'Next artwork');
      b.innerHTML = CHEV;
      if (dir === 'next') b.style.transform = 'scaleX(-1)';
      b.addEventListener('click', function () { step(dir === 'prev' ? -1 : 1); });
      frame.appendChild(b);
      return b;
    }
    var prevBtn = arrow('prev'), nextBtn = arrow('next');

    function step(n) {
      var first = strip.children[0];
      if (!first) return;
      var gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
      /* Honour the same preference the stylesheet does: someone who has asked
         for reduced motion gets the jump, not the glide. */
      var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      strip.scrollBy({ left: n * (first.getBoundingClientRect().width + gap),
                       behavior: calm ? 'auto' : 'smooth' });
    }

    function sync() {
      var max = strip.scrollWidth - strip.clientWidth;
      prevBtn.disabled = strip.scrollLeft < 8;
      nextBtn.disabled = max < 8 || strip.scrollLeft > max - 8;
      hint.hidden = max < 8;
    }
    /* Tell people the keys exist, but only once there is somewhere to go. */
    var hint = document.createElement('p');
    hint.className = 'carousel-hint';
    hint.textContent = 'Use the arrow keys, or the buttons, to move through the gallery.';
    hint.hidden = true;
    frame.parentNode.insertBefore(hint, frame.nextSibling);

    strip.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);
    sync();

    /* Arrow keys drive the strip, but never while someone is typing or
       has the search overlay open. */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (overlay && !overlay.hidden) return;
      var lb = document.querySelector('.lightbox');
      if (lb && !lb.hidden) return;          /* the lightbox has the keys */
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      step(e.key === 'ArrowLeft' ? -1 : 1);
    });
  }

  /* ---------------- Reading progress ----------------
     Only on a piece. It answers "how much is left", which is a real
     question in a long story and no question at all on a listing page. */
  var piece = document.querySelector('article.prose');
  /* Nothing to track on a piece that already fits the window. */
  if (piece && piece.offsetHeight > window.innerHeight * 1.6) {
    var bar = document.createElement('div');
    bar.className = 'read-progress';
    document.body.appendChild(bar);
    var tick = false;
    function drawBar() {
      /* How much of the piece has passed the bottom of the window, so it
         reads 100% exactly when the last line clears — not at the page
         foot, which is below the footer. */
      var seen = window.scrollY + window.innerHeight - piece.offsetTop;
      var done = piece.offsetHeight > 0 ? seen / piece.offsetHeight : 1;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, done)) + ')';
      tick = false;
    }
    addEventListener('scroll', function () {
      if (!tick) { tick = true; requestAnimationFrame(drawBar); }
    }, { passive: true });
    addEventListener('resize', drawBar);
    drawBar();
  }

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

  /* ---------------- Artwork lightbox ----------------
     A gallery you cannot look at closely is not much of a gallery. */
  var art = document.querySelectorAll('.gallery .art-piece');
  if (art.length) {
    var box = null, at = 0;

    function buildBox() {
      box = document.createElement('div');
      box.className = 'lightbox';
      box.hidden = true;
      box.innerHTML =
        '<button type="button" class="lb-close" aria-label="Close">&times;</button>' +
        '<button type="button" class="lb-nav lb-prev" aria-label="Previous artwork">' + CHEV + '</button>' +
        '<button type="button" class="lb-nav lb-next" aria-label="Next artwork">' + CHEV + '</button>' +
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
      var t = fig.querySelector('.art-title');
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
      fig.setAttribute('aria-label', 'Open artwork ' + (i + 1) + ' of ' + art.length);
      fig.addEventListener('click', function () { openBox(i); });
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
  }

  /* Cards and listings arrive as they come into view. The observer only
     adds a class; the animation itself runs on a fixed duration, so a
     slow scroll does not drag it out. Each item fires once. */
  var toReveal = document.querySelectorAll(
    'main.wrap > .cards > .card, main.wrap > .section .card, .featured-list > .piece');
  if (toReveal.length && 'IntersectionObserver' in window) {
    toReveal.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.setProperty('--i', i % 4);
    });
    var watcher = new IntersectionObserver(function (rows) {
      rows.forEach(function (row) {
        if (!row.isIntersecting) return;
        row.target.classList.add('seen');
        watcher.unobserve(row.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    toReveal.forEach(function (el) { watcher.observe(el); });
  }

  /* ---------------- Analytics ---------------- */
  if (ANALYTICS) {
    var a = document.createElement('script');
    a.async = true;
    a.src = 'https://gc.zgo.at/count.js';
    a.setAttribute('data-goatcounter', ANALYTICS);
    document.head.appendChild(a);
  }
})();
