/*
 * Google Analytics (GA4) for the band site.
 *
 * - Sends data to the "Acoustic Underground Site" property, the same one the
 *   Wix site uses, so visitor history stays in one place.
 * - Runs only on the real domain. GitHub Pages previews and local copies are
 *   not counted, so band members testing the site don't inflate the numbers.
 * - Records named clicks so GA shows them by name (Admin > Events):
 *     listen_click     Listen buttons and streaming links (song = which song)
 *     watch_click      "Watch the video" links (song = which song)
 *     email_click      any email link, including song requests
 *     shows_click      Bandsintown links
 *     social_click     Instagram, Facebook, YouTube channel
 */
(function () {
  var MEASUREMENT_ID = 'G-ZWLXTYFKYJ';
  var LIVE_HOSTS = ['acousticundergroundrva.com', 'www.acousticundergroundrva.com'];

  var params = new URLSearchParams(location.search);
  var forced = params.get('ga') === 'on'; // ?ga=on tests tracking from a preview (GA DebugView)
  if (LIVE_HOSTS.indexOf(location.hostname) === -1 && !forced) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID, forced ? { debug_mode: true } : {});

  function songFor(el) {
    var card = el.closest('article, .song__card, li');
    var h = card && card.querySelector('h2, h3, h4');
    return h ? h.textContent.trim() : '';
  }

  function classify(a) {
    var href = a.getAttribute('href') || '';
    var text = (a.textContent || '').trim().toLowerCase();
    if (href.indexOf('mailto:') === 0) {
      return ['email_click', { request: /subject=song/i.test(href) ? 'song request' : 'contact' }];
    }
    if (text.indexOf('watch') === 0) return ['watch_click', { song: songFor(a) }];
    if (text === 'listen' || /distrokid|spotify|music\.apple|music\.youtube|amazon\.com\/music|pandora/i.test(href)) {
      return ['listen_click', { song: songFor(a), service: text === 'listen' ? 'all' : text }];
    }
    if (/bandsintown/i.test(href)) return ['shows_click', {}];
    if (/instagram|facebook|youtube\.com\/(channel|@)/i.test(href)) {
      return ['social_click', { network: a.hostname.replace(/^(www|m)\./, '').split('.')[0] }];
    }
    return null;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.getAttribute('aria-disabled') === 'true') return;
    var ev = classify(a);
    if (!ev) return;
    ev[1].link_url = a.href;
    ev[1].transport_type = 'beacon';
    gtag('event', ev[0], ev[1]);
  }, true);
})();
