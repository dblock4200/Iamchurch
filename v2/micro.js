/* ══════════════════════════════════════════════════════════════════════════
   I AM — MICRO-INTERACTION ENGINE (shared)

   Layers the JS-driven half of the micro-interaction system on top of every
   page. Defensive by design: it targets classes the pages already use, never
   rebinds their component handlers, and no-ops when a target is absent.

     · Scroll progress hairline            (all pages, always)
     · Nav condense on scroll              (sticky navs only)
     · Magnetic pull on filled CTAs        (fine pointer, motion-ok)
     · Cursor-aware card shadow            (fine pointer, motion-ok)
     · Hero word-reveal                    (one lead H1 per non-home page)

   Reduced motion disables everything below the progress bar / nav grounding.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine   = window.matchMedia('(pointer:fine)').matches;

  /* ── Scroll progress + nav grounding ─────────────────────────────────── */
  var bar = document.createElement('div');
  bar.className = 'mi-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  // Only ground navs that actually stick to the top; a hero-overlay nav (absolute)
  // scrolls away and shouldn't flash a background.
  var stickyNavs = [].slice.call(document.querySelectorAll('.topnav'))
    .filter(function (n) { return getComputedStyle(n).position === 'sticky'; });

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.width = (Math.min(1, Math.max(0, p)) * 100).toFixed(2) + '%';
      var grounded = window.scrollY > 8;
      stickyNavs.forEach(function (n) { n.classList.toggle('mi-nav-scrolled', grounded); });
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  if (reduce) return; // nothing below is essential; keep it still for reduced motion

  /* ── Magnetic filled CTAs ────────────────────────────────────────────── */
  if (fine) {
    [].slice.call(document.querySelectorAll('.abtn')).forEach(function (el) {
      // "Primary" = a filled button. Detect a non-transparent background so
      // outline/ghost buttons are left alone.
      var m = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/);
      if (!m) return;
      var parts = m[1].split(',').map(parseFloat);
      var alpha = parts.length > 3 ? parts[3] : 1;
      if (!(alpha > 0.05)) return;

      el.classList.add('mi-magnetic');
      var STRENGTH = 0.25, MAX = 6;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
        var dy = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
        dx = Math.max(-MAX, Math.min(MAX, dx));
        dy = Math.max(-MAX, Math.min(MAX, dy));
        el.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ── Cursor-aware cards (shadow leans opposite the pointer) ───────────── */
  if (fine) {
    [].slice.call(document.querySelectorAll('.lift')).forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        card.style.setProperty('--mi-sx', (-x * 0.6).toFixed(3));
        card.style.setProperty('--mi-sy', (-y * 0.4).toFixed(3));
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--mi-sx', 0);
        card.style.setProperty('--mi-sy', 0);
      });
    });
  }

  /* ── Hero word-reveal ────────────────────────────────────────────────── */
  // Skip the homepage (its hero has bespoke cinematic choreography).
  if (!document.querySelector('[data-hero]')) {
    var h1 = document.querySelector('h1');
    if (h1 && !h1.dataset.miReveal && h1.children.length === 0 && h1.textContent.trim()) {
      h1.dataset.miReveal = '1';
      var words = h1.textContent.split(/(\s+)/);
      h1.textContent = '';
      h1.classList.add('mi-reveal');
      var i = 0;
      words.forEach(function (w) {
        if (/^\s+$/.test(w)) { h1.appendChild(document.createTextNode(w)); return; }
        var s = document.createElement('span');
        s.className = 'mi-reveal-w';
        s.style.setProperty('--mi-i', i++);
        s.textContent = w;
        h1.appendChild(s);
      });
    }
  }
})();
