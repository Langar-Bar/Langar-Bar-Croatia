(() => {
'use strict';

const SUPABASE_URL = 'https://fkanccgigogbxodiljqt.supabase.co';
const CONFIG_URL = `${SUPABASE_URL}/functions/v1/public-native-config`;
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

function enhanceNativeUI() {
  document.documentElement.classList.add('langar-native-app', `langar-native-${platform()}`);
  document.querySelectorAll('.app-install-card').forEach(el => { el.style.display = 'none'; });

  const more = document.querySelector('#more .more-grid, #more .cards, #more');
  if (more && !document.getElementById('nativeStaffAccess')) {
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

  document.addEventListener('click', event => {
    if (event.target.closest('button,.more-card,.menu-item,.cat-tab,.promo-card,.reward-card')) haptic('LIGHT');
  }, { passive: true });
}

function getSupabaseClient() {
  return window.langarCloud?.client || window.LangarCloud?.client || window.supabaseClient || window._supabase || null;
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
