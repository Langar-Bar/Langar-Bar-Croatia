(() => {
'use strict';

const SUPABASE_URL = 'https://fkanccgigogbxodiljqt.supabase.co';
const CONFIG_URL = `${SUPABASE_URL}/functions/v1/public-native-config`;
const DELETE_URL = `${SUPABASE_URL}/functions/v1/delete-account`;
const isNative = () => Boolean(window.Capacitor?.isNativePlatform?.());
const platform = () => window.Capacitor?.getPlatform?.() || 'web';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function plugin(name) {
  return window.Capacitor?.Plugins?.[name] || window.plugins?.[name] || null;
}

async function haptic(style = 'LIGHT') {
  try {
    const Haptics = plugin('Haptics');
    if (Haptics?.impact) await Haptics.impact({ style });
  } catch (_) {}
}

function getSupabaseClient() {
  return window.langarCloud?.client || window.LangarCloud?.client || window.supabaseClient || window._supabase || null;
}

function moreContainer() {
  return document.querySelector('#more .more-grid, #more .cards, #more');
}

function addStaffAccess() {
  const more = moreContainer();
  if (!more || document.getElementById('nativeStaffAccess')) return;
  const card = document.createElement('article');
  card.id = 'nativeStaffAccess';
  card.className = 'more-card native-staff-access';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.innerHTML = '<span>🔐</span><div><h3>Staff / Admin</h3><p>Secure staff login for orders, reservations, menu, rewards and reports.</p></div>';
  const open = async () => {
    await haptic('MEDIUM');
    location.href = 'admin.html?native=1';
  };
  card.addEventListener('click', open);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
  more.append(card);
}

function ensureDeleteCard() {
  const more = moreContainer();
  if (!more || document.getElementById('nativeDeleteAccount')) return;
  const card = document.createElement('article');
  card.id = 'nativeDeleteAccount';
  card.className = 'more-card native-delete-account';
  card.style.display = 'none';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.innerHTML = '<span>🗑️</span><div><h3>Delete my account</h3><p>Permanently delete your Langar Club account and personal profile. Legally required transaction records are anonymized.</p></div>';
  const remove = async () => {
    await haptic('MEDIUM');
    const first = confirm('Delete your Langar Club account permanently? This cannot be undone.');
    if (!first) return;
    const second = confirm('Final confirmation: delete your account and personal profile now?');
    if (!second) return;

    const client = getSupabaseClient();
    try {
      const { data } = await client.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) throw new Error('Please log in before deleting your account.');
      const response = await fetch(DELETE_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: '{}'
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Account deletion failed.');
      try { await client.auth.signOut(); } catch (_) {}
      try { await (window.plugins?.OneSignal || plugin('OneSignal'))?.logout?.(); } catch (_) {}
      const language = localStorage.getItem('langar_lang');
      localStorage.clear();
      if (language) localStorage.setItem('langar_lang', language);
      alert('Your Langar Club account has been deleted.');
      location.href = 'index.html';
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Account deletion failed. Please try again.');
    }
  };
  card.addEventListener('click', remove);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') remove(); });
  more.append(card);
}

async function syncDeleteVisibility() {
  const card = document.getElementById('nativeDeleteAccount');
  const client = getSupabaseClient();
  if (!card || !client?.auth?.getSession) return;
  try {
    const { data } = await client.auth.getSession();
    card.style.display = data?.session?.user ? '' : 'none';
  } catch (_) { card.style.display = 'none'; }
}

function enhanceNativeUI() {
  document.documentElement.classList.add('langar-native-app', `langar-native-${platform()}`);
  document.querySelectorAll('.app-install-card').forEach(el => { el.style.display = 'none'; });
  addStaffAccess();
  ensureDeleteCard();
  syncDeleteVisibility();
  setInterval(syncDeleteVisibility, 2500);

  document.addEventListener('click', event => {
    if (event.target.closest('button,.more-card,.menu-item,.cat-tab,.promo-card,.reward-card')) haptic('LIGHT');
  }, { passive: true });
}

async function initNativePush() {
  if (!isNative()) return;
  let OneSignal = window.plugins?.OneSignal || plugin('OneSignal');
  if (!OneSignal) {
    for (let i = 0; i < 15 && !OneSignal; i += 1) {
      await sleep(300);
      OneSignal = window.plugins?.OneSignal || plugin('OneSignal');
    }
  }
  if (!OneSignal?.initialize) {
    console.warn('[Native Push] OneSignal native plugin not available');
    return;
  }

  try {
    const response = await fetch(CONFIG_URL, { cache: 'no-store' });
    const cfg = response.ok ? await response.json() : null;
    if (!cfg?.native_push_enabled || !cfg?.onesignal_app_id) return;
    OneSignal.initialize(cfg.onesignal_app_id);
  } catch (error) {
    console.warn('[Native Push] Config/initialization failed', error);
    return;
  }

  let lastExternalId = null;
  const syncIdentity = async () => {
    const client = getSupabaseClient();
    if (!client?.auth?.getSession) return;
    try {
      const { data } = await client.auth.getSession();
      const userId = data?.session?.user?.id || null;
      if (userId && userId !== lastExternalId) {
        await OneSignal.login?.(userId);
        lastExternalId = userId;
        try {
          const permission = OneSignal.Notifications?.permission;
          if (permission !== true) await OneSignal.Notifications?.requestPermission?.(true);
        } catch (_) {}
      } else if (!userId && lastExternalId) {
        await OneSignal.logout?.();
        lastExternalId = null;
      }
    } catch (_) {}
  };

  setInterval(syncIdentity, 2500);
  syncIdentity();
}

function wireNativeBackButton() {
  if (!isNative()) return;
  try {
    const App = plugin('App');
    App?.addListener?.('backButton', ({ canGoBack }) => {
      const openOverlay = document.querySelector('.modal:not(.hidden),.drawer:not(.hidden)');
      if (openOverlay) {
        openOverlay.querySelector('.close')?.click();
        return;
      }
      if (canGoBack || history.length > 1) history.back();
      else App.exitApp?.();
    });
  } catch (_) {}
}

function init() {
  if (!isNative()) return;
  enhanceNativeUI();
  wireNativeBackButton();
  initNativePush();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
})();
