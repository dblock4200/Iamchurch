/* ══════════════════════════════════════════════════════════════════════════
   I AM — SANITY CONTENT (shared)

   Pulls live content from Sanity and renders it into the markup the pages
   already ship. Written to the same rules as micro.js: defensive, no build
   step, and a complete no-op when anything is missing.

     · Until PROJECT_ID is filled in, this file does nothing at all.
     · If a mount point isn't on the page, that section is skipped.
     · If the request fails, the hardcoded HTML already in the page stays
       exactly as it is. A network problem shows stale content, never an
       empty page.

   The cards below are built to match the hand-written markup in events.html
   and groups.html class-for-class, so the design system, the reveal
   animations and the filter chips all keep working untouched.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var PROJECT_ID  = 'xhz48loo';
  var DATASET     = 'production';
  var API_VERSION = 'v2026-08-31';

  // Not configured yet — leave every page exactly as authored.
  if (!PROJECT_ID || PROJECT_ID === 'REPLACE_WITH_PROJECT_ID') return;

  /* ── helpers ─────────────────────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // "image-ab12cd-1600x900-jpg" -> a cdn.sanity.io URL.
  //
  // Honours BOTH of the editor's framing controls, which are separate things
  // in Sanity: `crop` is the rectangle they dragged in the Studio, `hotspot`
  // is the focal point they marked inside it. Crop becomes a `rect` in source
  // pixels; the hotspot steers `fit=crop` when we also resize. Skipping crop
  // would mean an editor drags the handles, saves, and nothing changes.
  function imageUrl(img, w, h) {
    if (!img || !img.asset || !img.asset._ref) return null;
    var parts = img.asset._ref.split('-');           // image, id, WxH, ext
    if (parts.length < 4) return null;
    var base = 'https://cdn.sanity.io/images/' + PROJECT_ID + '/' + DATASET +
               '/' + parts[1] + '-' + parts[2] + '.' + parts[3];
    var q = ['auto=format', 'q=78'];

    var c = img.crop;
    if (c && (c.left || c.top || c.right || c.bottom)) {
      var dims = parts[2].split('x');
      var srcW = parseInt(dims[0], 10);
      var srcH = parseInt(dims[1], 10);
      if (srcW && srcH) {
        var left = Math.round(c.left * srcW);
        var top  = Math.round(c.top * srcH);
        var cw   = Math.round(srcW - left - c.right * srcW);
        var ch   = Math.round(srcH - top - c.bottom * srcH);
        if (cw > 0 && ch > 0) q.push('rect=' + left + ',' + top + ',' + cw + ',' + ch);
      }
    }

    if (w) q.push('w=' + w);
    if (h) q.push('h=' + h);
    if (w && h) {
      q.push('fit=crop');
      if (img.hotspot) {
        q.push('crop=focalpoint');
        q.push('fp-x=' + img.hotspot.x.toFixed(3));
        q.push('fp-y=' + img.hotspot.y.toFixed(3));
      }
    }
    return base + '?' + q.join('&');
  }

  // The pages use a gradient .img-slot as the placeholder when there's no
  // photo. Keep that exact behaviour so a photoless event still looks right.
  function plate(img, alt, w, h, extra) {
    var url = imageUrl(img, w, h);
    if (img && img.alt) alt = img.alt;
    var inner = url
      ? '<img src="' + esc(url) + '" alt="' + esc(alt) + '" loading="lazy" ' +
        'style="width:100%;height:100%;object-fit:cover;display:block">'
      : '<div class="img-slot ks" role="img" aria-label="' + esc(alt) + '">' +
        '<span>' + esc(alt) + '</span></div>';
    return '<div class="plate" style="aspect-ratio:16/10;border:none;overflow:hidden' +
           (extra || '') + '">' + inner + '</div>';
  }

  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function parseDate(s) {
    if (!s) return null;
    var d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // Event times are stored in UTC; show them as church (Arizona) time for
  // every visitor, not in whatever time zone their device happens to be in.
  var TZ = 'America/Phoenix';
  function local(d) {
    var out = {};
    try {
      new Intl.DateTimeFormat('en-US', {timeZone: TZ, year: 'numeric', month: 'numeric',
        day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true})
        .formatToParts(d).forEach(function (p) { out[p.type] = p.value; });
    } catch (e) {
      out = {year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(),
             hour: (d.getHours() % 12) || 12, minute: ('0' + d.getMinutes()).slice(-2),
             dayPeriod: d.getHours() >= 12 ? 'PM' : 'AM'};
    }
    return {day: +out.day, mon: MONTHS[+out.month - 1], year: +out.year,
            time: out.hour + ':' + out.minute + ' ' + String(out.dayPeriod).toUpperCase()};
  }
  function timeLabel(d) { return local(d).time; }

  // Still upcoming = hasn't started more than a few hours ago (no end times).
  function upcomingOnly(events) {
    var cutoff = Date.now() - 3 * 3600 * 1000;
    return (events || []).filter(function (ev) {
      var d = parseDate(ev.startsAt);
      return d && d.getTime() >= cutoff;
    });
  }

  function icon(paths) {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" ' +
           'stroke="var(--color-accent)" stroke-width="1.7" stroke-linecap="round" ' +
           'stroke-linejoin="round">' + paths + '</svg>';
  }

  var ICON_PIN   = '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>';
  var ICON_CLOCK = '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>';
  var ICON_USER  = '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>';

  function fetchContent() {
    var query = [
      '{',
      '"events": *[_type=="event"] | order(startsAt asc)[0...60]',
        '{_id,title,startsAt,location,ministry,tags,description,signupUrl,photo},',
      '"sermons": *[_type=="sermon"] | order(date desc)[0...24]',
        '{_id,title,speaker,date,videoUrl,scripture,description,photo},',
      '"groups": *[_type=="group"]',
        '{_id,title,description,category,tags,location,leader,status,signupUrl,photo},',
      '"albums": *[_type=="galleryAlbum"] | order(date desc)[0...24]',
        '{_id,title,date,photos},',
      '"settings": *[_id=="siteSettings"][0]',
        '{weekendKicker,weekendStatement,weekendLede,serviceTimes,',
         'announcementActive,announcementText,announcementLinkUrl,announcementLinkLabel}',
      '}'
    ].join('');

    var url = 'https://' + PROJECT_ID + '.apicdn.sanity.io/' + API_VERSION +
              '/data/query/' + DATASET + '?query=' + encodeURIComponent(query);

    return fetch(url, {mode: 'cors'})
      .then(function (r) {
        if (!r.ok) throw new Error('Sanity responded ' + r.status);
        return r.json();
      })
      .then(function (j) { return j.result || {}; });
  }

  /* ── renderers ───────────────────────────────────────────────────────── */

  // Mirrors the <article class="evcard rv evitem"> markup in events.html.
  function eventCard(ev) {
    var d = parseDate(ev.startsAt);
    var cats = (ev.tags && ev.tags.length ? ev.tags : ['event']).join(' ');
    var tagPills = (ev.tags || ['event']).map(function (t) {
      return '<span class="tag tag-outline">' + esc(t.charAt(0).toUpperCase() + t.slice(1)) + '</span>';
    }).join('');

    var meta = '';
    if (ev.location) {
      meta += '<span style="display:flex;gap:6px;align-items:center;justify-content:flex-end">' +
              icon(ICON_PIN) + esc(ev.location) + '</span>';
    }
    if (d) {
      meta += '<span style="display:flex;gap:6px;align-items:center;justify-content:flex-end">' +
              icon(ICON_CLOCK) + esc(timeLabel(d)) + '</span>';
    }

    var datestack = d
      ? '<div style="display:flex;align-items:baseline;gap:8px">' +
          '<span style="font-family:var(--font-heading);font-size:34px;line-height:.9;' +
          'color:var(--color-accent);font-variant-numeric:tabular-nums">' + local(d).day + '</span>' +
          '<span style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;' +
          'line-height:1.2;color:color-mix(in srgb,var(--color-text) 60%,transparent)">' +
          local(d).mon + '<br />' + local(d).year + '</span>' +
        '</div>'
      : '<div></div>';

    var body =
      '<div style="padding:20px 22px 24px;display:flex;flex-direction:column;flex:1">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px">' +
          datestack +
          '<div style="display:flex;flex-direction:column;gap:4px;text-align:right;font-size:12px;' +
          'color:color-mix(in srgb,var(--color-text) 60%,transparent)">' + meta + '</div>' +
        '</div>' +
        '<h3 class="evtitle" style="font-family:var(--font-heading);font-weight:400;font-size:23px;' +
        'line-height:1.12;margin:0 0 12px;transition:color .3s">' + esc((ev.title || '').trim()) + '</h3>' +
        '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px">' + tagPills + '</div>' +
        '<p style="font-size:13.5px;line-height:1.6;color:color-mix(in srgb,var(--color-text) 68%,transparent);' +
        'margin:0">' + esc(ev.description || '') + '</p>' +
        (ev.signupUrl
          ? '<a class="reg-btn" href="' + esc(ev.signupUrl) + '" target="_blank" rel="noopener">' +
            'Sign up <span class="arrow">→</span></a>'
          : '') +
      '</div>';

    return '<article class="evcard rv evitem" data-cats="' + esc(cats) + '" data-ministry="' +
           esc(ev.ministry || '') + '" style="display:flex;flex-direction:column;' +
           'border:1px solid var(--color-divider);border-radius:var(--radius-md);overflow:hidden;' +
           'background:var(--color-bg);cursor:pointer">' +
           plate(ev.photo, ev.title, 640, 400) + body + '</article>';
  }

  // Mirrors <article class="lift rv gcard"> in groups.html.
  function groupCard(g) {
    var pills = (g.tags || []).map(function (t) {
      return '<span class="tag tag-outline">' + esc(t) + '</span>';
    }).join('');

    var meta = '';
    if (g.location) {
      meta += '<span style="display:flex;gap:7px;align-items:center">' + icon(ICON_PIN) + esc(g.location) + '</span>';
    }
    if (g.leader) {
      meta += '<span style="display:flex;gap:7px;align-items:center">' + icon(ICON_USER) + esc(g.leader) + '</span>';
    }

    var badge = '<span class="tag tag-accent" style="position:absolute;top:12px;left:12px;' +
                'background:color-mix(in srgb,var(--color-bg) 92%,transparent);backdrop-filter:blur(4px)">' +
                esc(g.status || 'Open') + '</span>';

    return '<article class="lift rv gcard" data-cat="' + esc(g.category || '') + '" ' +
           'style="display:flex;flex-direction:column;border:1px solid var(--color-divider);' +
           'border-radius:var(--radius-md);overflow:hidden;cursor:pointer">' +
             plate(g.photo, g.title, 640, 400, ';position:relative').replace('</div>', badge + '</div>') +
             '<div style="padding:22px;display:flex;flex-direction:column;gap:10px;flex:1">' +
               '<div style="display:flex;gap:7px;flex-wrap:wrap">' + pills + '</div>' +
               '<h3 style="font-family:var(--font-heading);font-weight:400;font-size:23px;' +
               'line-height:1.12;margin:0">' + esc(g.title) + '</h3>' +
               '<p style="font-size:14px;line-height:1.6;color:color-mix(in srgb,var(--color-text) 70%,transparent);' +
               'margin:0;flex:1">' + esc(g.description || '') + '</p>' +
               '<div style="display:flex;gap:18px;flex-wrap:wrap;font-size:13px;' +
               'color:color-mix(in srgb,var(--color-text) 60%,transparent);margin-top:2px">' + meta + '</div>' +
               (g.signupUrl
                 ? '<a class="reg-btn" href="' + esc(g.signupUrl) + '" target="_blank" rel="noopener">' +
                   'Register <span class="arrow">→</span></a>'
                 : '') +
             '</div>' +
           '</article>';
  }

  function sermonCard(sm) {
    var d = parseDate(sm.date);
    var when = d ? MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() : '';
    var meta = [sm.speaker, sm.scripture, when].filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ');

    var inner =
      '<div style="padding:20px 22px 24px;display:flex;flex-direction:column;flex:1">' +
        '<h3 style="font-family:var(--font-heading);font-weight:400;font-size:23px;line-height:1.12;' +
        'margin:0 0 10px">' + esc(sm.title) + '</h3>' +
        '<div style="font-size:12px;letter-spacing:.02em;color:color-mix(in srgb,var(--color-text) 60%,transparent);' +
        'margin-bottom:12px">' + meta + '</div>' +
        '<p style="font-size:13.5px;line-height:1.6;color:color-mix(in srgb,var(--color-text) 68%,transparent);' +
        'margin:0;flex:1">' + esc(sm.description || '') + '</p>' +
      '</div>';

    var card = '<article class="evcard rv" style="display:flex;flex-direction:column;' +
               'border:1px solid var(--color-divider);border-radius:var(--radius-md);overflow:hidden;' +
               'background:var(--color-bg)">' + plate(sm.photo, sm.title, 640, 400) + inner + '</article>';

    return sm.videoUrl
      ? '<a href="' + esc(sm.videoUrl) + '" target="_blank" rel="noopener" ' +
        'style="text-decoration:none;color:inherit;display:flex">' + card + '</a>'
      : card;
  }

  function albumBlock(al) {
    var d = parseDate(al.date);
    var when = d ? MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() : '';
    var shots = (al.photos || []).map(function (p) {
      var full = imageUrl(p, 1600, null);
      var thumb = imageUrl(p, 560, 420);
      if (!thumb) return '';
      var img = '<img src="' + esc(thumb) + '" alt="' + esc(p.caption || al.title) + '" loading="lazy" ' +
                'style="width:100%;height:100%;object-fit:cover;display:block">';
      var cell = '<div class="plate" style="aspect-ratio:4/3;border:none;overflow:hidden">' + img + '</div>';
      return full
        ? '<a href="' + esc(full) + '" target="_blank" rel="noopener" style="display:block">' + cell + '</a>'
        : cell;
    }).join('');

    if (!shots) return '';

    return '<section class="rv" style="margin-bottom:clamp(40px,5vw,64px)">' +
             '<div style="display:flex;justify-content:space-between;align-items:end;gap:16px;' +
             'margin-bottom:18px;flex-wrap:wrap">' +
               '<h2 style="font-family:var(--font-heading);font-weight:400;font-size:clamp(26px,3vw,34px);' +
               'margin:0">' + esc(al.title) + '</h2>' +
               (when ? '<div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;' +
                       'color:color-mix(in srgb,var(--color-text) 55%,transparent)">' + esc(when) + '</div>' : '') +
             '</div>' +
             '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px">' +
               shots +
             '</div>' +
           '</section>';
  }

  /* ── mounting ────────────────────────────────────────────────────────── */

  function mount(name) { return document.querySelector('[data-sanity="' + name + '"]'); }

  // A successful response is authoritative: if the pastor deleted the last
  // event, the page must show none. Stale built-in markup only survives when
  // the request itself failed, which is handled in init()'s catch.
  function fill(el, html) {
    if (!el) return false;
    el.innerHTML = html;
    return true;
  }

  function renderEvents(events) {
    var el = mount('events');
    if (!el) return false;
    return fill(el, upcomingOnly(events).map(eventCard).join(''));
  }

  // Homepage "What's coming up": the next three events, as compact rows that
  // mirror the page's .event-row markup. Each links to the full calendar.
  function upcomingRow(ev) {
    var d = parseDate(ev.startsAt), t = local(d);
    var meta = [t.time, ev.location].filter(Boolean).map(function (x) { return esc(String(x).trim()); }).join(' · ');
    return '<a class="event-row" href="events.html" style="display:grid;grid-template-columns:96px 1fr auto;' +
             'gap:24px;align-items:center;padding:20px 0;border-top:1px solid var(--color-divider);' +
             'text-decoration:none;color:inherit">' +
             '<div style="text-align:center">' +
               '<div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--color-accent)">' + t.mon + '</div>' +
               '<div style="font-family:var(--font-heading);font-size:40px;line-height:1;font-variant-numeric:tabular-nums">' + t.day + '</div>' +
             '</div>' +
             '<div>' +
               '<h3 style="font-family:var(--font-heading);font-size:24px;font-weight:400;margin:0 0 4px">' + esc((ev.title || '').trim()) + '</h3>' +
               '<div style="font-size:13px;color:color-mix(in srgb,var(--color-text) 60%,transparent)">' + meta + '</div>' +
             '</div>' +
             (ev.ministry ? '<span class="tag tag-outline event-tag">' + esc(ev.ministry) + '</span>' : '<span></span>') +
           '</a>';
  }

  function renderUpcoming(events) {
    var el = mount('upcoming');
    if (!el) return false;
    var next = upcomingOnly(events).slice(0, 3);
    return fill(el, next.length
      ? next.map(upcomingRow).join('')
      : '<p style="margin:0;padding:20px 0;border-top:1px solid var(--color-divider);font-size:15px;' +
        'color:color-mix(in srgb,var(--color-text) 70%,transparent)">Nothing on the calendar right now — check back soon.</p>');
  }

  function renderGroups(groups)  { return fill(mount('groups'),  (groups  || []).map(groupCard).join('')); }
  function renderSermons(sermons){ return fill(mount('sermons'), (sermons || []).map(sermonCard).join('')); }
  function renderGallery(albums) { return fill(mount('gallery'), (albums  || []).map(albumBlock).join('')); }

  // An address as a tap-for-directions link: street on the first line,
  // "City, ST ZIP" underneath (split at the first comma).
  function addressLink(value) {
    var v = String(value || '').trim();
    var cut = v.indexOf(',');
    var street = cut > -1 ? v.slice(0, cut) : v;
    var rest = cut > -1 ? v.slice(cut + 1).trim() : '';
    return '<a class="weekend__addr" href="https://www.google.com/maps/search/?api=1&query=' +
             encodeURIComponent(v) + '" target="_blank" rel="noopener">' +
             '<span class="weekend__time-v">' + esc(street) + '</span>' +
             (rest ? '<span class="weekend__addr-sub">' + esc(rest) + '</span>' : '') +
             '<span class="weekend__addr-dir">Get directions <span class="arrow">→</span></span>' +
           '</a>';
  }

  function renderSettings(st) {
    if (!st) return false;
    var touched = false;

    var kicker = mount('weekend-kicker');
    if (kicker && st.weekendKicker) { kicker.textContent = st.weekendKicker; touched = true; }

    var statement = mount('weekend-statement');
    if (statement && st.weekendStatement) {
      statement.innerHTML = esc(st.weekendStatement).replace(/\n/g, '<br>');
      touched = true;
    }

    var lede = mount('weekend-lede');
    if (lede && st.weekendLede) { lede.textContent = st.weekendLede; touched = true; }

    var times = mount('service-times');
    if (times && st.serviceTimes && st.serviceTimes.length) {
      times.innerHTML = st.serviceTimes.map(function (t, i) {
        return '<div class="weekend__time cine-lyr" style="--d:' + (i * 0.08).toFixed(2) + '">' +
                 '<div class="weekend__time-k">' + esc(t.label) + '</div>' +
                 (/^(where|address|location)$/i.test(String(t.label || '').trim())
                   ? addressLink(t.value)
                   : '<div class="weekend__time-v">' + esc(t.value) + '</div>') +
               '</div>';
      }).join('');
      touched = true;
    }

    var bar = mount('announcement');
    if (bar) {
      // The homepage nav floats over the hero (position:absolute), so a bar
      // inserted at the top of the document would sit underneath it. Sticky
      // navs on the other pages already flow after the bar and need nothing.
      var pushOverlayNav = function (offset) {
        [].slice.call(document.querySelectorAll('.topnav')).forEach(function (n) {
          if (getComputedStyle(n).position === 'absolute') n.style.top = offset;
        });
      };
      if (st.announcementActive && st.announcementText) {
        var link = st.announcementLinkUrl
          ? ' <a href="' + esc(st.announcementLinkUrl) + '" style="color:inherit;text-decoration:underline;' +
            'white-space:nowrap">' + esc(st.announcementLinkLabel || 'Details') + '</a>'
          : '';
        bar.innerHTML = '<div style="max-width:1180px;margin:0 auto;padding:11px clamp(20px,5vw,44px);' +
                        'font-size:13.5px;line-height:1.5;color:#fff;text-align:center">' +
                        esc(st.announcementText) + link + '</div>';
        bar.style.display = '';
        bar.style.position = 'relative';
        bar.style.zIndex = '30';
        bar.style.background = 'var(--color-accent)';
        pushOverlayNav(bar.offsetHeight + 'px');
      } else {
        bar.style.display = 'none';
        pushOverlayNav('');
      }
      touched = true;
    }

    return touched;
  }

  /* ── go ──────────────────────────────────────────────────────────────── */

  function init() {
    fetchContent().then(function (data) {
      var changed = false;
      changed = renderEvents(data.events)     || changed;
      changed = renderUpcoming(data.events)   || changed;
      changed = renderGroups(data.groups)     || changed;
      changed = renderSermons(data.sermons)   || changed;
      changed = renderGallery(data.albums)    || changed;
      changed = renderSettings(data.settings) || changed;

      // Lets each page re-bind its reveal observer and filter chips over the
      // freshly rendered cards. Pages without a listener simply ignore it.
      if (changed) document.dispatchEvent(new CustomEvent('content:updated'));
    }).catch(function (err) {
      // Deliberately quiet on the page itself: the built-in HTML is still
      // showing, so a visitor sees a complete site either way.
      if (window.console && console.warn) console.warn('[sanity] content unavailable:', err.message);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
