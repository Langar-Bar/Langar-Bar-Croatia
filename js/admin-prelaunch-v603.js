(() => {
'use strict';

const cloud = () =>
  window.LangarAdminCloud?.client ||
  window.LangarCloud?.client ||
  window.langarSupabase ||
  window.supabaseClient ||
  window.sb ||
  null;

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));

const field = (root, name) => root?.querySelector(`[name="${name}"]`);

async function waitForCloud(maxMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const client = cloud();
    if (client) return client;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return null;
}

function formData() {
  const form = document.getElementById('openingFormV608');
  const rawDate = field(form, 'opening_at')?.value || '';
  return {
    enabled: field(form, 'enabled')?.value === 'true',
    status: field(form, 'status')?.value || 'opening_soon',
    opening_at: rawDate ? new Date(rawDate).toISOString() : null,
    headline_en: (field(form, 'headline_en')?.value || '').trim(),
    headline_hr: (field(form, 'headline_hr')?.value || '').trim(),
    announcement_en: (field(form, 'announcement_en')?.value || '').trim(),
    announcement_hr: (field(form, 'announcement_hr')?.value || '').trim(),
    hero_image_url: (field(form, 'hero_image_url')?.value || '').trim() || null
  };
}

function populate(settings) {
  const form = document.getElementById('openingFormV608');
  if (!form || !settings) return;

  field(form, 'enabled').value = String(settings.enabled !== false);
  field(form, 'status').value = settings.status || 'opening_soon';

  if (settings.opening_at) {
    const date = new Date(settings.opening_at);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    field(form, 'opening_at').value = local.toISOString().slice(0, 16);
  } else {
    field(form, 'opening_at').value = '';
  }

  ['headline_en', 'headline_hr', 'announcement_en', 'announcement_hr', 'hero_image_url']
    .forEach((key) => {
      const input = field(form, key);
      if (input) input.value = settings[key] || '';
    });

  preview(settings);
}

function preview(settings = formData()) {
  const box = document.getElementById('openingPreviewBoxV608');
  if (!box) return;

  box.hidden = false;
  box.innerHTML = `
    <b>${esc(String(settings.status || 'opening_soon').replaceAll('_', ' '))}</b>
    <h3>${esc(settings.headline_en || 'Opening Soon')}</h3>
    <p>${esc(settings.announcement_en || 'The exact date will be announced soon.')}</p>
    <small>${settings.opening_at
      ? new Date(settings.opening_at).toLocaleString()
      : 'No countdown date set'}</small>
  `;
}

async function readCloud() {
  const client = await waitForCloud();
  if (!client) return { data: null, error: new Error('Cloud unavailable') };

  let result;
  try {
    result = await client.rpc('get_opening_public_v608');
  } catch (error) {
    result = { data: null, error };
  }

  if (result.error || !result.data) {
    try {
      result = await client
        .from('opening_management')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
    } catch (error) {
      result = { data: null, error };
    }
  }

  return {
    data: Array.isArray(result.data) ? result.data[0] : result.data,
    error: result.error
  };
}

async function save(event) {
  event.preventDefault();

  const status = document.getElementById('openingStatusV608');
  const payload = formData();
  if (status) status.textContent = 'Saving to Cloud…';

  const client = await waitForCloud();
  if (!client) {
    if (status) status.textContent = 'Cloud connection unavailable.';
    return;
  }

  let session = null;
  try {
    session = (await client.auth.getSession()).data?.session || null;
  } catch (_) {}

  if (!session) {
    if (status) status.textContent = 'Admin session expired. Please sign in again.';
    return;
  }

  let result;
  try {
    result = await client.rpc('admin_save_opening_v608', {
      p_enabled: payload.enabled,
      p_status: payload.status,
      p_opening_at: payload.opening_at,
      p_headline_en: payload.headline_en,
      p_headline_hr: payload.headline_hr,
      p_announcement_en: payload.announcement_en,
      p_announcement_hr: payload.announcement_hr,
      p_hero_image_url: payload.hero_image_url
    });
  } catch (error) {
    result = { data: null, error };
  }

  if (result.error) {
    if (status) status.textContent = `Save error: ${result.error.message || result.error}`;
    return;
  }

  const saved = Array.isArray(result.data) ? result.data[0] : result.data;
  populate(saved || payload);

  if (status) {
    status.textContent = saved?.enabled === false
      ? 'Saved. Opening display is currently hidden.'
      : 'Saved and published. Customer app will update within 5 seconds.';
  }

  try {
    const channel = new BroadcastChannel('langar-opening');
    channel.postMessage(saved || payload);
    channel.close();
  } catch (_) {}
}

function ensureSection() {
  const panel = document.getElementById('settingsPanel');
  if (!panel) return;

  document.querySelectorAll(
    '#openingManagementV600,#openingManagementV601,#openingManagementV602,#openingManagementV603'
  ).forEach((node) => node.remove());

  if (document.getElementById('openingManagementV608')) return;

  const section = document.createElement('div');
  section.id = 'openingManagementV608';
  section.className = 'opening-admin-v608';
  section.innerHTML = `
    <div class="section-head">
      <h3>Opening Management</h3>
      <p>Change the Home opening status and countdown for every customer.</p>
    </div>
    <form id="openingFormV608" class="form-card">
      <label>Show opening section
        <select name="enabled">
          <option value="true">Enabled</option>
          <option value="false">Hidden</option>
        </select>
      </label>
      <label>Opening status
        <select name="status">
          <option value="opening_soon">Opening Soon</option>
          <option value="soft_opening">Soft Opening</option>
          <option value="grand_opening">Grand Opening</option>
          <option value="open_now">Open Now</option>
        </select>
      </label>
      <label>Opening date and time
        <input type="datetime-local" name="opening_at">
        <small>Leave empty until the exact date is known.</small>
      </label>
      <div class="edit-grid">
        <label>Headline EN<input name="headline_en" maxlength="120"></label>
        <label>Headline HR<input name="headline_hr" maxlength="120"></label>
      </div>
      <div class="edit-grid">
        <label>Announcement EN<textarea name="announcement_en" maxlength="500"></textarea></label>
        <label>Announcement HR<textarea name="announcement_hr" maxlength="500"></textarea></label>
      </div>
      <label>Hero image URL (optional)
        <input name="hero_image_url" placeholder="https://...">
      </label>
      <div class="toolbar">
        <button class="primary" type="submit">Save & publish</button>
        <button class="secondary opening-action-v608" type="button" id="openingPreviewV608">Preview</button>
        <button class="secondary opening-action-v608" type="button" id="openingClearDateV608">Clear date</button>
      </div>
      <p id="openingStatusV608" class="admin-login-status"></p>
    </form>
    <div id="openingPreviewBoxV608" class="opening-preview-admin-v608" hidden></div>
  `;

  panel.prepend(section);

  const form = section.querySelector('form');
  form.addEventListener('submit', save);
  section.querySelector('#openingPreviewV608').addEventListener('click', () => preview());
  section.querySelector('#openingClearDateV608').addEventListener('click', () => {
    field(form, 'opening_at').value = '';
    preview();
  });

  readCloud().then(({ data }) => {
    if (data) populate(data);
  });
}

function init() {
  ensureSection();

  new MutationObserver(() => {
    if (document.getElementById('settingsPanel')) ensureSection();
  }).observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
setTimeout(init, 1000);
})();