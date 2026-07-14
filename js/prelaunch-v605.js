(() => {
'use strict';

const VERSION = '6.0.8';
const SUPABASE_URL = 'https://fkanccgigogbxodiljqt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7';
const TABLE_URL = `${SUPABASE_URL}/rest/v1/opening_management?id=eq.1&select=*`;
const RPC_URL = `${SUPABASE_URL}/rest/v1/rpc/get_opening_public_v608`;

let timer = null;
let lastSignature = '';

const getLang = () => {
  const value = String(localStorage.getItem('langar_lang') || document.documentElement.lang || 'hr').toLowerCase();
  return value.startsWith('en') ? 'en' : 'hr';
};

const labels = {
  opening_soon: { en: 'Opening Soon', hr: 'Uskoro otvaramo' },
  soft_opening: { en: 'Soft Opening', hr: 'Probno otvorenje' },
  grand_opening: { en: 'Grand Opening', hr: 'Svečano otvorenje' },
  open_now: { en: 'Open Now', hr: 'Otvoreno' }
};

function statusLabel(status, lang = getLang()) {
  return (labels[status] || labels.opening_soon)[lang];
}

function heroElements() {
  const hero = document.querySelector('#home .hero-v3');
  const copy = hero?.querySelector('.hero-copy');
  return {
    hero,
    copy,
    topStatus: document.querySelector('.topbar .brand span'),
    eyebrow: hero?.querySelector('.eyebrow'),
    description: copy?.querySelector(':scope > p')
  };
}

function removeLegacyBlocks() {
  document.querySelectorAll(
    '#langarOpeningV600,#langarOpeningV601,#langarOpeningV602,#langarOpeningV605,#langarOpeningV606,#langarOpeningV607,.opening-v606'
  ).forEach((node) => node.remove());
}

function ensureHeroExtras() {
  removeLegacyBlocks();
  const nodes = heroElements();
  if (!nodes.copy) return null;

  let announcement = document.getElementById('heroOpeningAnnouncementV608');
  if (!announcement) {
    announcement = document.createElement('p');
    announcement.id = 'heroOpeningAnnouncementV608';
    announcement.className = 'hero-opening-announcement-v608';
    nodes.description?.insertAdjacentElement('afterend', announcement);
  }

  let countdown = document.getElementById('heroOpeningCountdownV608');
  if (!countdown) {
    countdown = document.createElement('div');
    countdown.id = 'heroOpeningCountdownV608';
    countdown.className = 'hero-opening-countdown-v608';
    announcement.insertAdjacentElement('afterend', countdown);
  }

  return { ...nodes, announcement, countdown };
}

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function restoreDefault() {
  clearTimer();
  removeLegacyBlocks();
  const lang = getLang();
  const nodes = heroElements();

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

  document.getElementById('heroOpeningAnnouncementV608')?.remove();
  document.getElementById('heroOpeningCountdownV608')?.remove();
}

function render(settings, force = false) {
  if (!settings || settings.enabled === false) {
    lastSignature = '';
    restoreDefault();
    localStorage.removeItem('langar_opening_cache_v608');
    window.__langarOpeningV608 = null;
    return;
  }

  const signature = JSON.stringify([
    settings.enabled,
    settings.status,
    settings.opening_at,
    settings.headline_en,
    settings.headline_hr,
    settings.announcement_en,
    settings.announcement_hr,
    settings.updated_at
  ]);

  if (!force && signature === lastSignature) return;
  lastSignature = signature;
  clearTimer();

  const nodes = ensureHeroExtras();
  if (!nodes) return;

  const lang = getLang();
  const status = settings.status || 'opening_soon';
  const headlineEn = settings.headline_en || statusLabel(status, 'en');
  const headlineHr = settings.headline_hr || statusLabel(status, 'hr');
  const headline = lang === 'hr' ? headlineHr : headlineEn;
  const announcement = lang === 'hr'
    ? (settings.announcement_hr || '')
    : (settings.announcement_en || '');

  window.__langarOpeningV608 = settings;
  localStorage.setItem('langar_opening_cache_v608', JSON.stringify(settings));

  if (nodes.topStatus) {
    nodes.topStatus.textContent = headline;
    nodes.topStatus.dataset.en = headlineEn;
    nodes.topStatus.dataset.hr = headlineHr;
  }

  if (nodes.eyebrow) {
    nodes.eyebrow.textContent = headline.toUpperCase();
    nodes.eyebrow.dataset.en = headlineEn.toUpperCase();
    nodes.eyebrow.dataset.hr = headlineHr.toUpperCase();
  }

  nodes.announcement.textContent = announcement;
  nodes.announcement.hidden = !announcement;
  nodes.countdown.innerHTML = '';

  if (!settings.opening_at || status === 'open_now') {
    if (status === 'open_now') {
      nodes.countdown.innerHTML = `<div class="hero-opening-live-v608">${statusLabel('open_now', lang)}</div>`;
    }
    return;
  }

  const target = new Date(settings.opening_at).getTime();
  if (!Number.isFinite(target)) return;

  const draw = () => {
    const output = document.getElementById('heroOpeningCountdownV608');
    if (!output) return;

    const remaining = target - Date.now();
    if (remaining <= 0) {
      output.innerHTML = `<div class="hero-opening-live-v608">${statusLabel('open_now', getLang())}</div>`;
      clearTimer();
      return;
    }

    const currentLang = getLang();
    const units = currentLang === 'hr'
      ? ['dana', 'sati', 'min', 'sek']
      : ['days', 'hours', 'min', 'sec'];

    const values = [
      Math.floor(remaining / 86400000),
      Math.floor((remaining % 86400000) / 3600000),
      Math.floor((remaining % 3600000) / 60000),
      Math.floor((remaining % 60000) / 1000)
    ];

    output.innerHTML = values.map((value, index) => `
      <div class="hero-opening-time-v608">
        <b>${value}</b>
        <span>${units[index]}</span>
      </div>
    `).join('');
  };

  draw();
  timer = setInterval(draw, 1000);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`, {
    cache: 'no-store',
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchOpening() {
  let settings = null;

  try {
    const rows = await fetchJson(TABLE_URL);
    settings = Array.isArray(rows) ? rows[0] : rows;
  } catch (tableError) {
    try {
      const result = await fetchJson(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      settings = Array.isArray(result) ? result[0] : result;
    } catch (rpcError) {
      console.warn('[Opening V608] Both Cloud reads failed', tableError, rpcError);
    }
  }

  if (settings && typeof settings === 'object') {
    render(settings);
    return;
  }

  try {
    const cached = JSON.parse(localStorage.getItem('langar_opening_cache_v608') || 'null');
    if (cached) render(cached);
  } catch (_) {}
}

function compareVersions(a, b) {
  const left = String(a).split('.').map(Number);
  const right = String(b).split('.').map(Number);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const x = left[i] || 0;
    const y = right[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

async function checkUpdate() {
  try {
    const response = await fetch(`./app-version.json?_=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return;
    const info = await response.json();
    if (compareVersions(info.version, VERSION) <= 0) return;
    // Existing update modal logic from previous versions can handle future updates.
  } catch (_) {}
}

function init() {
  try {
    const cached = JSON.parse(localStorage.getItem('langar_opening_cache_v608') || 'null');
    if (cached) render(cached, true);
  } catch (_) {}

  fetchOpening();
  checkUpdate();

  document.addEventListener('click', (event) => {
    if (event.target.closest('#langBtn,[data-language],[data-lang]')) {
      setTimeout(() => {
        if (window.__langarOpeningV608) render(window.__langarOpeningV608, true);
      }, 120);
    }
  }, true);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) fetchOpening();
  });

  window.addEventListener('focus', fetchOpening);
  window.addEventListener('online', fetchOpening);
  setInterval(fetchOpening, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
})();