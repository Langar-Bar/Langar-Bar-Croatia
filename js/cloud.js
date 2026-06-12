(function(){
  'use strict';
  const CLOUD_VERSION = 'V4.1 Cloud Auth Foundation';
  const CONFIG = {
    supabaseUrl: 'https://fkanccgigogbxodiljqt.supabase.co',
    supabaseKey: 'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7',
    oneSignalAppId: '22243a1f-c8e7-46a5-ae77-2f7135e9f701'
  };
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const readLS = (k,d)=>{ try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const writeLS = (k,v)=>localStorage.setItem(k, JSON.stringify(v));
  const lang = ()=>localStorage.langar_lang || document.documentElement.lang || 'hr';
  const t = (hr,en)=>lang()==='hr'?hr:en;
  const safe = (v)=>String(v||'').replace(/[&<>'"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c]));
  if(!window.supabase || !window.supabase.createClient){
    console.warn('Supabase SDK not loaded. Cloud mode disabled.');
    return;
  }
  const client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  window.LangarCloud = { client, CONFIG, syncInbox, getSession, upsertProfile, initOneSignal };

  function e164(raw){
    let s = String(raw||'').trim().replace(/[\s\-().]/g,'');
    if(!s) return '';
    if(s.startsWith('00')) s = '+' + s.slice(2);
    if(s.startsWith('0')) s = '+385' + s.slice(1);
    if(!s.startsWith('+')) s = '+385' + s;
    return s;
  }
  async function getSession(){
    const { data } = await client.auth.getSession();
    return data.session || null;
  }
  async function upsertProfile(user, extra={}){
    if(!user) return;
    const phone = user.phone || extra.phone || '';
    const email = user.email || extra.email || null;
    const payload = {
      id: user.id,
      phone: phone || null,
      email,
      first_name: extra.first_name || null,
      last_name: extra.last_name || null,
      app_language: lang()==='hr'?'hr':'en',
      push_opt_in: true,
      marketing_opt_in: true,
      updated_at: new Date().toISOString()
    };
    await client.from('profiles').upsert(payload, { onConflict: 'id' });
    const localProfile = readLS('langar_profile', {}) || {};
    writeLS('langar_profile', {
      ...localProfile,
      id: user.id,
      cloudId: user.id,
      phone: phone || localProfile.phone || '',
      email: email || localProfile.email || '',
      firstName: localProfile.firstName || extra.first_name || '',
      lastName: localProfile.lastName || extra.last_name || '',
      qr: localProfile.qr || ('LNG-' + String(user.id).slice(0,6).toUpperCase()),
      referralCode: localProfile.referralCode || ('REF-' + String(user.id).slice(0,6).toUpperCase()),
      credit: localProfile.credit || 0,
      cloudReady: true,
      createdAt: localProfile.createdAt || new Date().toISOString()
    });
  }
  async function initOneSignal(userId){
    try{
      if(!window.OneSignalDeferred) return;
      window.OneSignalDeferred.push(async function(OneSignal){
        await OneSignal.init({ appId: CONFIG.oneSignalAppId, allowLocalhostAsSecureOrigin: true });
        if(userId && OneSignal.login) await OneSignal.login(userId);
        if(OneSignal.User && OneSignal.User.addTags){
          await OneSignal.User.addTags({ app_language: lang(), app: 'langar_bar' });
        }
      });
    }catch(err){ console.warn('OneSignal init failed', err); }
  }
  async function syncInbox(){
    const session = await getSession();
    if(!session) return { ok:false, reason:'not_logged_in' };
    const { data, error } = await client
      .from('inbox_messages')
      .select('id,type,title_en,body_en,title_hr,body_hr,is_read,is_deleted,created_at,data')
      .eq('user_id', session.user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending:false })
      .limit(80);
    if(error) return { ok:false, error };
    const mapped = (data||[]).map(row=>({
      id: 'cloud-' + row.id,
      cloudId: row.id,
      type: row.type || 'message',
      title: lang()==='hr' ? (row.title_hr || row.title_en || 'Langar Bar') : (row.title_en || row.title_hr || 'Langar Bar'),
      body: lang()==='hr' ? (row.body_hr || row.body_en || '') : (row.body_en || row.body_hr || ''),
      unread: !row.is_read,
      createdAt: row.created_at,
      cloudData: row.data || {}
    }));
    const local = readLS('langar_inbox', []).filter(x=>!String(x.id||'').startsWith('cloud-'));
    writeLS('langar_inbox', [...mapped, ...local].slice(0,120));
    if(typeof window.renderInboxBadge === 'function') window.renderInboxBadge();
    return { ok:true, count:mapped.length };
  }
  async function markCloudMessageRead(cloudId){
    if(!cloudId) return;
    await client.from('inbox_messages').update({ is_read:true, read_at:new Date().toISOString() }).eq('id', cloudId);
  }
  async function deleteCloudMessage(cloudId){
    if(!cloudId) return;
    await client.from('inbox_messages').update({ is_deleted:true, deleted_at:new Date().toISOString() }).eq('id', cloudId);
  }
  function injectStyles(){
    if($('#cloudStyles')) return;
    const style=document.createElement('style');
    style.id='cloudStyles';
    style.textContent = `
      .cloud-card{border:1px solid rgba(238,211,139,.35);background:linear-gradient(145deg,rgba(22,66,50,.86),rgba(7,18,14,.92));border-radius:26px;padding:18px;margin:16px 0;box-shadow:0 18px 40px rgba(0,0,0,.25)}
      .cloud-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.cloud-row>*{flex:1}.cloud-status{display:inline-flex;gap:8px;align-items:center;border:1px solid rgba(238,211,139,.28);border-radius:999px;padding:8px 12px;color:#eed38b;background:rgba(0,0,0,.16)}
      .cloud-mini{font-size:12px;opacity:.78;line-height:1.5}.cloud-card input{width:100%;border:1px solid rgba(238,211,139,.35);border-radius:16px;background:#07120e;color:#fff;padding:13px}.cloud-card label{display:block;margin:10px 0}.cloud-card .primary,.cloud-card .secondary{min-height:46px}
    `;
    document.head.appendChild(style);
  }
  function renderAuthCard(session=null){
    const club = $('#club');
    if(!club) return;
    injectStyles();
    let card = $('#cloudAuthCard');
    if(!card){
      card = document.createElement('section');
      card.id = 'cloudAuthCard';
      card.className = 'cloud-card';
      const head = club.querySelector('.section-head');
      head ? head.insertAdjacentElement('afterend', card) : club.prepend(card);
    }
    if(session){
      const phone = session.user.phone || '';
      card.innerHTML = `
        <span class="cloud-status">☁️ ${safe(CLOUD_VERSION)}</span>
        <h3>${t('Cloud račun je aktivan','Cloud account is active')}</h3>
        <p class="cloud-mini">${t('Vaši podaci, Inbox i nagrade sada se mogu čuvati u Supabase Cloud sustavu. Ako obrišete aplikaciju i ponovno se prijavite istim brojem, podaci se mogu vratiti.','Your data, Inbox and rewards can now be stored in Supabase Cloud. If you delete the app and log in again with the same phone, data can be restored.')}</p>
        <p><b>User ID:</b><br><small>${safe(session.user.id)}</small></p>
        <div class="cloud-row"><button id="syncCloudInbox" class="secondary">${t('Sinkroniziraj Inbox','Sync Inbox')}</button><button id="cloudSignOut" class="danger">${t('Odjava','Sign out')}</button></div>
      `;
      $('#syncCloudInbox')?.addEventListener('click', async()=>{ const r=await syncInbox(); alert(r.ok ? t('Cloud Inbox je sinkroniziran.','Cloud Inbox synced.') : (r.error?.message || r.reason || 'Error')); });
      $('#cloudSignOut')?.addEventListener('click', async()=>{ await client.auth.signOut(); location.reload(); });
      return;
    }
    card.innerHTML = `
      <span class="cloud-status">☁️ ${safe(CLOUD_VERSION)}</span>
      <h3>${t('Ulaz s brojem telefona','Phone login')}</h3>
      <p class="cloud-mini">${t('Unesite broj mobitela. Poslat ćemo sigurnosni OTP kod. Koristite format +385...','Enter your mobile number. We will send a secure OTP code. Use +385... format.')}</p>
      <div id="phoneStep"><label>${t('Broj telefona','Phone number')}<input id="cloudPhone" placeholder="+38591..." inputmode="tel"></label><button id="sendOtpBtn" class="primary full">${t('Pošalji kod','Send code')}</button></div>
      <div id="codeStep" class="hidden"><label>${t('OTP kod','OTP code')}<input id="cloudOtp" placeholder="123456" inputmode="numeric"></label><button id="verifyOtpBtn" class="primary full">${t('Potvrdi kod','Verify code')}</button><button id="backPhoneBtn" class="secondary full">${t('Promijeni broj','Change number')}</button></div>
      <p id="cloudAuthMsg" class="cloud-mini"></p>
    `;
    const msg = $('#cloudAuthMsg');
    let pendingPhone = '';
    $('#sendOtpBtn')?.addEventListener('click', async()=>{
      pendingPhone = e164($('#cloudPhone')?.value);
      if(!pendingPhone) return msg.textContent = t('Unesite broj telefona.','Enter phone number.');
      msg.textContent = t('Šaljemo kod...','Sending code...');
      const { error } = await client.auth.signInWithOtp({ phone: pendingPhone });
      if(error){ msg.textContent = error.message; return; }
      $('#phoneStep').classList.add('hidden'); $('#codeStep').classList.remove('hidden');
      msg.textContent = t('Kod je poslan. Unesite ga ovdje.','Code sent. Enter it here.');
    });
    $('#backPhoneBtn')?.addEventListener('click',()=>{ $('#codeStep').classList.add('hidden'); $('#phoneStep').classList.remove('hidden'); msg.textContent=''; });
    $('#verifyOtpBtn')?.addEventListener('click', async()=>{
      const token = ($('#cloudOtp')?.value || '').trim();
      if(!pendingPhone || !token) return msg.textContent = t('Unesite kod.','Enter the code.');
      msg.textContent = t('Provjeravamo kod...','Verifying code...');
      const { data, error } = await client.auth.verifyOtp({ phone: pendingPhone, token, type:'sms' });
      if(error){ msg.textContent = error.message; return; }
      await upsertProfile(data.user, { phone: pendingPhone });
      await initOneSignal(data.user.id);
      await syncInbox();
      msg.textContent = t('Uspješno ste prijavljeni.','You are logged in successfully.');
      renderAuthCard(data.session || await getSession());
      if(typeof window.renderAll === 'function') window.renderAll();
    });
  }
  async function boot(){
    const session = await getSession();
    renderAuthCard(session);
    if(session){ await upsertProfile(session.user, { phone: session.user.phone }); await initOneSignal(session.user.id); await syncInbox(); }
    client.auth.onAuthStateChange(async(_event, session)=>{ renderAuthCard(session); if(session){ await upsertProfile(session.user,{phone:session.user.phone}); await initOneSignal(session.user.id); await syncInbox(); } });
    // Best-effort sync for cloud inbox item actions in the existing prototype UI.
    document.addEventListener('click', async(e)=>{
      const item = e.target.closest?.('.inbox-item');
      if(!item) return;
      const text=item.textContent||'';
      const cloudMsgs=readLS('langar_inbox',[]).filter(m=>m.cloudId);
      const match=cloudMsgs.find(m=>text.includes(m.title));
      if(match && !match.__readSynced){ await markCloudMessageRead(match.cloudId); match.__readSynced=true; }
    }, true);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
