(() => {
  'use strict';

  const VERSION = '6.0.7';
  const SUPABASE_URL = 'https://fkanccgigogbxodiljqt.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7';
  const OPENING_RPC_URL = `${SUPABASE_URL}/rest/v1/rpc/get_opening_public_v606`;

  let countdownTimer = null;
  let versionCheckBusy = false;
  let tapasPatched = false;

  const language = () => {
    const value = String(
      localStorage.getItem('langar_lang') ||
      document.documentElement.lang ||
      'hr'
    ).toLowerCase();
    return value.startsWith('en') ? 'en' : 'hr';
  };

  function statusText(status, lang = language()) {
    const labels = {
      opening_soon: { en: 'Opening Soon', hr: 'Uskoro otvaramo' },
      soft_opening: { en: 'Soft Opening', hr: 'Probno otvorenje' },
      grand_opening: { en: 'Grand Opening', hr: 'Svečano otvorenje' },
      open_now: { en: 'Open Now', hr: 'Otvoreno' }
    };
    return (labels[status] || labels.opening_soon)[lang];
  }

  function removeOldOpeningBlocks() {
    document.querySelectorAll(
      '#langarOpeningV600,#langarOpeningV601,#langarOpeningV602,#langarOpeningV605,#langarOpeningV606,.opening-v606'
    ).forEach((node) => node.remove());
  }

  function heroNodes() {
    const hero = document.querySelector('#home .hero-v3');
    if (!hero) return {};
    const copy = hero.querySelector('.hero-copy');
    return {
      hero,
      copy,
      topStatus: document.querySelector('.topbar .brand span'),
      eyebrow: hero.querySelector('.eyebrow'),
      title: hero.querySelector('h1'),
      description: hero.querySelector('.hero-copy > p')
    };
  }

  function ensureHeroOpeningElements() {
    removeOldOpeningBlocks();

    const nodes = heroNodes();
    if (!nodes.copy) return null;

    let announcement = document.getElementById('heroOpeningAnnouncementV607');
    if (!announcement) {
      announcement = document.createElement('p');
      announcement.id = 'heroOpeningAnnouncementV607';
      announcement.className = 'hero-opening-announcement-v607';
      nodes.description?.insertAdjacentElement('afterend', announcement);
    }

    let countdown = document.getElementById('heroOpeningCountdownV607');
    if (!countdown) {
      countdown = document.createElement('div');
      countdown.id = 'heroOpeningCountdownV607';
      countdown.className = 'hero-opening-countdown-v607';
      announcement.insertAdjacentElement('afterend', countdown);
    }

    return { ...nodes, announcement, countdown };
  }

  function restoreDefaultOpening() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }

    removeOldOpeningBlocks();

    const nodes = heroNodes();
    const lang = language();

    if (nodes.topStatus) {
      nodes.topStatus.textContent = 'Opening Soon';
      nodes.topStatus.dataset.en = 'Opening Soon';
      nodes.topStatus.dataset.hr = 'Opening Soon';
    }

    if (nodes.eyebrow) {
      nodes.eyebrow.textContent = lang === 'hr' ? 'USKORO OTVARAMO' : 'OPENING SOON';
      nodes.eyebrow.dataset.en = 'OPENING SOON';
      nodes.eyebrow.dataset.hr = 'USKORO OTVARAMO';
    }

    document.getElementById('heroOpeningAnnouncementV607')?.remove();
    document.getElementById('heroOpeningCountdownV607')?.remove();
  }

  function renderOpening(settings) {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }

    if (!settings || settings.enabled === false) {
      restoreDefaultOpening();
      try {
        localStorage.removeItem('langar_opening_cache_v607');
      } catch (_) {}
      window.__langarOpeningV607 = null;
      return;
    }

    const nodes = ensureHeroOpeningElements();
    if (!nodes) return;

    const lang = language();
    const status = String(settings.status || 'opening_soon');
    const statusLabel = statusText(status, lang);
    const headline = lang === 'hr'
      ? String(settings.headline_hr || statusLabel)
      : String(settings.headline_en || statusLabel);
    const announcement = lang === 'hr'
      ? String(settings.announcement_hr || '')
      : String(settings.announcement_en || '');

    window.__langarOpeningV607 = settings;

    try {
      localStorage.setItem('langar_opening_cache_v607', JSON.stringify(settings));
    } catch (_) {}

    if (nodes.topStatus) {
      nodes.topStatus.textContent = headline;
      nodes.topStatus.dataset.en = String(settings.headline_en || statusText(status, 'en'));
      nodes.topStatus.dataset.hr = String(settings.headline_hr || statusText(status, 'hr'));
    }

    if (nodes.eyebrow) {
      nodes.eyebrow.textContent = headline.toUpperCase();
      nodes.eyebrow.dataset.en = String(
        settings.headline_en || statusText(status, 'en')
      ).toUpperCase();
      nodes.eyebrow.dataset.hr = String(
        settings.headline_hr || statusText(status, 'hr')
      ).toUpperCase();
    }

    nodes.announcement.textContent = announcement;
    nodes.announcement.hidden = !announcement;
    nodes.countdown.innerHTML = '';

    if (!settings.opening_at || status === 'open_now') {
      nodes.countdown.innerHTML = status === 'open_now'
        ? `<div class="hero-opening-live-v607">${statusText('open_now', lang)}</div>`
        : '';
      return;
    }

    const target = new Date(settings.opening_at).getTime();
    if (!Number.isFinite(target)) return;

    const draw = () => {
      const output = document.getElementById('heroOpeningCountdownV607');
      if (!output) return;

      const difference = target - Date.now();

      if (difference <= 0) {
        output.innerHTML = `<div class="hero-opening-live-v607">${statusText('open_now', language())}</div>`;
        if (countdownTimer) clearInterval(countdownTimer);
        countdownTimer = null;
        return;
      }

      const currentLang = language();
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
      ].map(([number, label]) => `
        <div class="hero-opening-time-v607">
          <b>${number}</b>
          <span>${label}</span>
        </div>
      `).join('');
    };

    draw();
    countdownTimer = window.setInterval(draw, 1000);
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
        throw new Error(`Opening request failed with ${response.status}`);
      }

      const payload = await response.json();
      const settings = Array.isArray(payload) ? payload[0] : payload;

      if (!settings || typeof settings !== 'object') {
        throw new Error('Opening response was empty.');
      }

      renderOpening(settings);
    } catch (error) {
      console.warn('[Langar Opening V607]', error);
      try {
        const cached = JSON.parse(
          localStorage.getItem('langar_opening_cache_v607') || 'null'
        );
        if (cached) renderOpening(cached);
      } catch (_) {}
    }
  }

  function clone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return value;
    }
  }

  function patchDynamicTapas() {
    if (tapasPatched || typeof window.langarFixMenuV458 !== 'function') return;
    tapasPatched = true;

    const originalFix = window.langarFixMenuV458;

    const improvedFix = function improvedLangarFixMenuV607(menu) {
      const source = Array.isArray(menu) ? clone(menu) : [];
      const sourceTapas = source.find((category) =>
        String(category?.id || '').toLowerCase() === 'tapas'
      );

      const fixed = originalFix(source);

      if (!sourceTapas || !Array.isArray(sourceTapas.items) || !sourceTapas.items.length) {
        return fixed;
      }

      const normalizedTapas = {
        ...sourceTapas,
        id: 'tapas',
        active: sourceTapas.active !== false,
        title: sourceTapas.title || {
          en: sourceTapas.title_en || 'Tapas',
          hr: sourceTapas.title_hr || sourceTapas.title_en || 'Tapas'
        },
        description: sourceTapas.description || {
          en: sourceTapas.description_en || '',
          hr: sourceTapas.description_hr || sourceTapas.description_en || ''
        },
        items: sourceTapas.items.map((item) => ({
          ...item,
          name: item.name || {
            en: item.name_en || '',
            hr: item.name_hr || item.name_en || ''
          },
          desc: item.desc || {
            en: item.description_en || '',
            hr: item.description_hr || item.description_en || ''
          },
          ingredients: item.ingredients || {
            en: item.ingredients_en || item.description_en || '',
            hr: item.ingredients_hr || item.ingredients_en || item.description_hr || ''
          },
          available: item.available !== false,
          orderable: item.orderable !== false
        }))
      };

      const index = fixed.findIndex((category) =>
        String(category?.id || '').toLowerCase() === 'tapas'
      );

      if (index >= 0) {
        fixed[index] = {
          ...fixed[index],
          ...normalizedTapas,
          items: normalizedTapas.items
        };
      } else {
        fixed.push(normalizedTapas);
      }

      return fixed;
    };

    window.langarFixMenuV458 = improvedFix;
    try {
      langarFixMenuV458 = improvedFix;
    } catch (_) {}

    setTimeout(() => {
      try {
        window.renderMenu?.();
        window.renderOrderMenu?.();
      } catch (_) {}
    }, 250);
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

    const lang = language();
    const overlay = document.createElement('div');
    overlay.id = 'langarUpdateV607';
    overlay.className = 'update-v607-overlay';
    overlay.innerHTML = `
      <div class="update-v607-card">
        <h2>${lang === 'hr' ? 'Dostupna je nova verzija' : 'A new version is available'}</h2>
        <p>${lang === 'hr'
          ? 'Ažurirajte aplikaciju kako biste dobili najnovija poboljšanja.'
          : 'Update the app to receive the latest improvements.'}</p>
        <button id="langarUpdateNowV607" type="button">
          ${lang === 'hr' ? 'Ažuriraj sada' : 'Update now'}
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#langarUpdateNowV607')?.addEventListener('click', async () => {
      const button = overlay.querySelector('#langarUpdateNowV607');
      if (button) {
        button.disabled = true;
        button.textContent = lang === 'hr' ? 'Ažuriranje…' : 'Updating…';
      }

      try {
        localStorage.setItem('langar_applied_version', remoteVersion);
        sessionStorage.setItem('langar_update_v607_done', String(Date.now()));

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
          const names = await caches.keys();
          await Promise.all(names.map((name) => caches.delete(name)));
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
      const response = await fetch(`./app-version.json?_=${Date.now()}`, {
        cache: 'no-store'
      });
      if (!response.ok) return;

      const manifest = await response.json();
      const remoteVersion = String(manifest.version || '');

      if (remoteVersion && compareVersions(remoteVersion, VERSION) > 0) {
        const recentUpdate = Number(
          sessionStorage.getItem('langar_update_v607_done') || 0
        );
        if (!recentUpdate || Date.now() - recentUpdate > 120000) {
          showUpdateDialog(remoteVersion);
        }
      } else {
        removeUpdateDialog();
        localStorage.setItem('langar_applied_version', remoteVersion || VERSION);
      }
    } catch (error) {
      console.warn('[Langar Update V607]', error);
    } finally {
      versionCheckBusy = false;
    }
  }

  function refreshLanguage() {
    if (window.__langarOpeningV607) renderOpening(window.__langarOpeningV607);
  }

  function init() {
    patchDynamicTapas();

    try {
      const cached = JSON.parse(
        localStorage.getItem('langar_opening_cache_v607') || 'null'
      );
      if (cached) renderOpening(cached);
    } catch (_) {}

    fetchOpening();
    checkVersion();

    document.addEventListener('click', (event) => {
      if (event.target.closest('#langBtn,[data-language],[data-lang]')) {
        window.setTimeout(refreshLanguage, 100);
      }
    }, true);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        patchDynamicTapas();
        fetchOpening();
        checkVersion();
      }
    });

    window.addEventListener('online', fetchOpening);

    window.setInterval(fetchOpening, 15000);
    window.setInterval(checkVersion, 180000);
    window.setInterval(patchDynamicTapas, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();