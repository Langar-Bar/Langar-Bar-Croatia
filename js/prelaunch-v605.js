(() => {
  'use strict';

  const VERSION = '6.0.6';
  const SUPABASE_URL = 'https://fkanccgigogbxodiljqt.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7';
  const OPENING_RPC_URL = `${SUPABASE_URL}/rest/v1/rpc/get_opening_public_v606`;

  let countdownTimer = null;
  let versionCheckBusy = false;

  const lang = () => {
    const value = (localStorage.getItem('langar_lang') || document.documentElement.lang || 'hr').toLowerCase();
    return value.startsWith('en') ? 'en' : 'hr';
  };

  const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));

  function statusLabel(status) {
    const labels = {
      opening_soon: { en: 'Opening Soon', hr: 'Uskoro otvaramo' },
      soft_opening: { en: 'Soft Opening', hr: 'Probno otvorenje' },
      grand_opening: { en: 'Grand Opening', hr: 'Svečano otvorenje' },
      open_now: { en: 'Open Now', hr: 'Otvoreno' }
    };
    return (labels[status] || labels.opening_soon)[lang()];
  }

  function ensureOpeningHost() {
    let host = document.getElementById('langarOpeningV606');
    if (host) return host;

    document.querySelectorAll(
      '#langarOpeningV600,#langarOpeningV601,#langarOpeningV602,#langarOpeningV605'
    ).forEach((node) => node.remove());

    const home = document.getElementById('home');
    if (!home) return null;

    host = document.createElement('section');
    host.id = 'langarOpeningV606';
    host.className = 'opening-v606';

    const hero = home.querySelector('.hero-v3, .hero, .home-hero') || home.firstElementChild;
    if (hero) hero.insertAdjacentElement('afterend', host);
    else home.prepend(host);

    return host;
  }

  function renderOpening(settings) {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }

    const host = ensureOpeningHost();
    if (!host) return;

    if (!settings || settings.enabled === false) {
      host.hidden = true;
      return;
    }

    host.hidden = false;
    window.__langarOpeningV606 = settings;

    try {
      localStorage.setItem('langar_opening_cache_v606', JSON.stringify(settings));
    } catch (_) {}

    const currentLang = lang();
    const label = statusLabel(settings.status);
    const headline = currentLang === 'hr'
      ? (settings.headline_hr || label)
      : (settings.headline_en || label);
    const announcement = currentLang === 'hr'
      ? (settings.announcement_hr || '')
      : (settings.announcement_en || '');

    const heroImage = settings.hero_image_url
      ? `<img class="opening-v606-image" src="${escapeHtml(settings.hero_image_url)}" alt="${escapeHtml(headline)}">`
      : '';

    host.innerHTML = `
      ${heroImage}
      <div class="opening-v606-content">
        <span class="opening-v606-status">${escapeHtml(label)}</span>
        <h2>${escapeHtml(headline)}</h2>
        ${announcement ? `<p>${escapeHtml(announcement)}</p>` : ''}
        <div id="openingCountdownV606" class="opening-v606-countdown"></div>
      </div>
    `;

    const countdown = document.getElementById('openingCountdownV606');

    if (!settings.opening_at || settings.status === 'open_now') {
      if (countdown) {
        countdown.innerHTML = settings.status === 'open_now'
          ? `<strong>${escapeHtml(statusLabel('open_now'))}</strong>`
          : `<span>${currentLang === 'hr'
              ? 'Točan datum objavit ćemo uskoro.'
              : 'The exact date will be announced soon.'}</span>`;
      }
      return;
    }

    const target = new Date(settings.opening_at).getTime();
    if (!Number.isFinite(target)) {
      if (countdown) countdown.textContent = currentLang === 'hr'
        ? 'Datum otvorenja nije ispravan.'
        : 'The opening date is invalid.';
      return;
    }

    const draw = () => {
      const output = document.getElementById('openingCountdownV606');
      if (!output) return;

      const difference = target - Date.now();
      if (difference <= 0) {
        output.innerHTML = `<strong>${escapeHtml(statusLabel('open_now'))}</strong>`;
        clearInterval(countdownTimer);
        countdownTimer = null;
        return;
      }

      const days = Math.floor(difference / 86400000);
      const hours = Math.floor((difference % 86400000) / 3600000);
      const minutes = Math.floor((difference % 3600000) / 60000);
      const seconds = Math.floor((difference % 60000) / 1000);
      const labels = currentLang === 'hr'
        ? ['dana', 'sati', 'min', 'sek']
        : ['days', 'hours', 'min', 'sec'];

      output.innerHTML = [
        [days, labels[0]],
        [hours, labels[1]],
        [minutes, labels[2]],
        [seconds, labels[3]]
      ].map(([number, unit]) => `
        <div class="opening-v606-time">
          <b>${number}</b>
          <span>${unit}</span>
        </div>
      `).join('');
    };

    draw();
    countdownTimer = setInterval(draw, 1000);
  }

  async function fetchOpening() {
    try {
      const response = await fetch(`${OPENING_RPC_URL}?_=${Date.now()}`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: '{}'
      });

      if (!response.ok) {
        throw new Error(`Opening request failed: ${response.status}`);
      }

      const data = await response.json();
      const settings = Array.isArray(data) ? data[0] : data;

      if (settings && typeof settings === 'object') {
        renderOpening(settings);
        return;
      }

      throw new Error('Opening response was empty.');
    } catch (error) {
      console.warn('[Langar Opening] Cloud read failed:', error);
      try {
        const cached = JSON.parse(localStorage.getItem('langar_opening_cache_v606') || 'null');
        if (cached) renderOpening(cached);
      } catch (_) {}
    }
  }

  function compareVersions(left, right) {
    const a = String(left).split('.').map((item) => Number(item) || 0);
    const b = String(right).split('.').map((item) => Number(item) || 0);
    const length = Math.max(a.length, b.length);

    for (let index = 0; index < length; index += 1) {
      if ((a[index] || 0) > (b[index] || 0)) return 1;
      if ((a[index] || 0) < (b[index] || 0)) return -1;
    }
    return 0;
  }

  function removeUpdateDialog() {
    document.querySelectorAll('[id^="langarUpdateV60"]').forEach((node) => node.remove());
  }

  function showUpdateDialog(remoteVersion) {
    removeUpdateDialog();

    const currentLang = lang();
    const overlay = document.createElement('div');
    overlay.id = 'langarUpdateV606';
    overlay.className = 'update-v606-overlay';
    overlay.innerHTML = `
      <div class="update-v606-card">
        <h2>${currentLang === 'hr' ? 'Dostupna je nova verzija' : 'A new version is available'}</h2>
        <p>${currentLang === 'hr'
          ? 'Ažurirajte aplikaciju kako biste dobili najnovija poboljšanja.'
          : 'Update the app to receive the latest improvements.'}</p>
        <button id="langarUpdateNowV606" type="button">
          ${currentLang === 'hr' ? 'Ažuriraj sada' : 'Update now'}
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#langarUpdateNowV606').addEventListener('click', async () => {
      const button = overlay.querySelector('#langarUpdateNowV606');
      button.disabled = true;
      button.textContent = currentLang === 'hr' ? 'Ažuriranje…' : 'Updating…';

      try {
        localStorage.setItem('langar_applied_version', remoteVersion);
        sessionStorage.setItem('langar_update_v606_done', String(Date.now()));

        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            try {
              await registration.update();
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            } catch (_) {}
          }
        }

        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
        }
      } finally {
        removeUpdateDialog();
        const url = new URL(window.location.href);
        url.searchParams.set('v', remoteVersion.replace(/\./g, ''));
        url.searchParams.set('_refresh', String(Date.now()));
        window.location.replace(url.toString());
      }
    });
  }

  async function checkVersion() {
    if (versionCheckBusy) return;
    versionCheckBusy = true;

    try {
      const response = await fetch(`./app-version.json?_=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return;

      const manifest = await response.json();
      const remoteVersion = String(manifest.version || '');

      if (remoteVersion && compareVersions(remoteVersion, VERSION) > 0) {
        const updatedAt = Number(sessionStorage.getItem('langar_update_v606_done') || 0);
        if (!updatedAt || Date.now() - updatedAt > 120000) {
          showUpdateDialog(remoteVersion);
        }
      } else {
        removeUpdateDialog();
        localStorage.setItem('langar_applied_version', remoteVersion || VERSION);
      }
    } catch (error) {
      console.warn('[Langar Update] Version check failed:', error);
    } finally {
      versionCheckBusy = false;
    }
  }

  function refreshLanguage() {
    if (window.__langarOpeningV606) renderOpening(window.__langarOpeningV606);
  }

  function init() {
    try {
      const cached = JSON.parse(localStorage.getItem('langar_opening_cache_v606') || 'null');
      if (cached) renderOpening(cached);
    } catch (_) {}

    fetchOpening();
    checkVersion();

    document.addEventListener('click', (event) => {
      if (event.target.closest('#langBtn,[data-language],[data-lang]')) {
        setTimeout(refreshLanguage, 100);
      }
    }, true);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        fetchOpening();
        checkVersion();
      }
    });

    window.addEventListener('online', fetchOpening);
    setInterval(fetchOpening, 60000);
    setInterval(checkVersion, 180000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();