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
    if (meta) meta.setAttribute('content', dark ? '#17130f' : '#fffaf6');
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

  /* ---------------- Analytics ---------------- */
  if (ANALYTICS) {
    var a = document.createElement('script');
    a.async = true;
    a.src = 'https://gc.zgo.at/count.js';
    a.setAttribute('data-goatcounter', ANALYTICS);
    document.head.appendChild(a);
  }
})();
