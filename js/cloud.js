(function(){
  'use strict';
  const CLOUD_VERSION = 'V4.2 Cloud Menu Likes Feedback';
  const CONFIG = {
    supabaseUrl: 'https://fkanccgigogbxodiljqt.supabase.co',
    supabaseKey: 'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7',
    oneSignalAppId: '22243a1f-c8e7-46a5-ae77-2f7135e9f701'
  };
  const $ = (s,r=document)=>r.querySelector(s);
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

  window.LangarCloud = {
    client,
    CONFIG,
    syncInbox,
    getSession,
    upsertProfile,
    initOneSignal,
    deleteCloudMessage,
    markCloudMessageRead
  };

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
    const localProfile = readLS('langar_profile', {}) || {};

    // If this phone/user already exists in Cloud, restore it instead of creating a second customer
    // or overwriting the original profile with another name from another device.
    let existing = null;
    try{
      const { data } = await client
        .from('profiles')
        .select('id,phone,email,first_name,last_name,birthday,app_language,customer_level,langar_credit,referral_code,created_at')
        .eq('id', user.id)
        .maybeSingle();
      existing = data || null;
    }catch(e){ console.warn('Profile lookup failed:', e.message); }

    const firstName = existing?.first_name || extra.first_name || localProfile.firstName || '';
    const lastName = existing?.last_name || extra.last_name || localProfile.lastName || '';
    const birthDate = existing?.birthday || extra.birthday || localProfile.birthDate || null;
    const referralCode = existing?.referral_code || localProfile.referralCode || ('REF-' + String(user.id).slice(0,6).toUpperCase());

    const payload = {
      id: user.id,
      phone: existing?.phone || phone || null,
      phone_verified: true,
      email: existing?.email || email,
      first_name: firstName || null,
      last_name: lastName || null,
      birthday: birthDate || null,
      app_language: lang()==='hr'?'hr':'en',
      referral_code: referralCode,
      push_opt_in: true,
      marketing_opt_in: true,
      terms_accepted_at: existing?.created_at ? undefined : new Date().toISOString(),
      privacy_accepted_at: existing?.created_at ? undefined : new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      onesignal_external_id: user.id
    };
    Object.keys(payload).forEach(k=>payload[k]===undefined && delete payload[k]);

    const { error } = await client.from('profiles').upsert(payload, { onConflict: 'id' });
    if(error){
      console.warn('Profile cloud upsert error:', error.message);
      if(String(error.message||'').toLowerCase().includes('duplicate') || String(error.message||'').toLowerCase().includes('phone')){
        alert(t('Ovaj broj je već registriran. Prijavite se istim brojem da se profil vrati.','This phone number is already registered. Please log in with the same number to restore the existing profile.'));
      }
    }

    writeLS('langar_profile', {
      ...localProfile,
      id: user.id,
      cloudId: user.id,
      phone: existing?.phone || phone || localProfile.phone || '',
      email: existing?.email || email || localProfile.email || '',
      firstName,
      lastName,
      birthDate: birthDate || '',
      referralCodeInput: extra.referralCode || localProfile.referralCodeInput || '',
      referredBy: extra.referralCode || localProfile.referredBy || '',
      qr: localProfile.qr || ('LNG-' + String(user.id).slice(0,6).toUpperCase()),
      referralCode,
      credit: Number(existing?.langar_credit ?? localProfile.credit ?? 0),
      customerLevel: existing?.customer_level || localProfile.customerLevel || 'bronze',
      orders: localProfile.orders || 0,
      visits: localProfile.visits || 0,
      referrals: localProfile.referrals || 0,
      cloudReady: true,
      returningMember: !!existing,
      createdAt: existing?.created_at || localProfile.createdAt || new Date().toISOString()
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
      .club-rule{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.club-rule b::after{content: ':'}
      .cloud-member-card{border:1px solid rgba(238,211,139,.35);background:linear-gradient(145deg,rgba(22,66,50,.86),rgba(7,18,14,.92));border-radius:26px;padding:18px;margin:16px 0;box-shadow:0 18px 40px rgba(0,0,0,.25)}
      .cloud-member-card h3{margin-top:0}.cloud-member-id{font-size:12px;color:var(--muted);word-break:break-all;background:rgba(0,0,0,.18);border:1px solid rgba(238,211,139,.22);border-radius:14px;padding:10px;margin:10px 0}.cloud-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.cloud-row>*{flex:1}.cloud-mini{font-size:12px;opacity:.78;line-height:1.5}.otp-modal label{display:block;text-align:left;margin:12px 0}.otp-modal input{width:100%;border:1px solid rgba(238,211,139,.35);border-radius:16px;background:#07120e;color:#fff;padding:14px;font-size:1.1rem;text-align:center;letter-spacing:.12em}.otp-modal .otp-icon{width:64px;height:64px;margin:0 auto 10px;display:grid;place-items:center;border-radius:22px;background:radial-gradient(circle at 30% 25%,#fff3c4,var(--gold) 42%,#72551b 100%);color:#111;font-size:2rem;box-shadow:0 14px 24px rgba(0,0,0,.28)}
    `;
    document.head.appendChild(style);
  }

  function ensureWelcomeRewards(){
    try{
      const cards = readLS('langar_cards', []);
      let welcomeCard = cards.find(c=>c.type==='welcome');
      if(!welcomeCard){
        const code = 'FREE-' + Math.floor(100000+Math.random()*900000);
        welcomeCard = {
          id:'welcome-' + Date.now(),
          type:'welcome',
          title:'Free Espresso Card',
          body:'One-time free espresso welcome gift. Show this card and let staff scan it.',
          code,
          status:'active',
          unread:true,
          createdAt:new Date().toISOString()
        };
        cards.unshift(welcomeCard);
        writeLS('langar_cards', cards);
      }
      const inbox = readLS('langar_inbox', []).filter(m=>!m.cloudWelcomeLocal);
      // The card itself appears in Inbox because active reward cards are listed there.
      // Old text-only welcome messages are removed so tapping the Inbox item opens the actual QR/code card.
      writeLS('langar_inbox', inbox);
    }catch(e){ console.warn('Welcome reward local sync failed', e); }
  }

  function setClubRegisteredView(session){
    const form = $('#clubForm');
    const rule = document.querySelector('#club .club-rule');
    const success = $('#clubSuccess');
    if(form) form.classList.add('hidden');
    if(rule) rule.classList.add('hidden');
    if(success){
      const local = readLS('langar_profile', {}) || {};
      const fullName = [local.firstName, local.lastName].filter(Boolean).join(' ') || t('Langar član','Langar member');
      success.className = 'cloud-member-card';
      success.innerHTML = `
        <h3>${t('Vaša registracija je aktivna','Your registration is active')}</h3>
        <p>${t('Vaš Langar Club profil je spremljen u Cloudu. Ako obrišete aplikaciju i ponovno se prijavite istim brojem, podaci se mogu vratiti.','Your Langar Club profile is saved in Cloud. If you delete the app and log in again with the same phone, your data can be restored.')}</p>
        <p><b>${safe(fullName)}</b><br><small>${safe(local.phone || session?.user?.phone || '')}</small></p>
        <div class="cloud-member-id"><b>User ID</b><br>${safe(session?.user?.id || local.cloudId || local.id || '')}</div>
        <div class="cloud-row"><button id="syncCloudInbox" class="secondary">${t('Sinkroniziraj Inbox','Sync Inbox')}</button><button id="cloudSignOut" class="danger">${t('Odjava','Sign out')}</button></div>
      `;
      $('#syncCloudInbox')?.addEventListener('click', async()=>{ const r=await syncInbox(); alert(r.ok ? t('Cloud Inbox je sinkroniziran.','Cloud Inbox synced.') : (r.error?.message || r.reason || 'Error')); });
      $('#cloudSignOut')?.addEventListener('click', async()=>{ await client.auth.signOut(); localStorage.removeItem('langar_profile'); location.reload(); });
    }
  }

  function setClubRegisterView(){
    const form = $('#clubForm');
    const rule = document.querySelector('#club .club-rule');
    const success = $('#clubSuccess');
    if(form) form.classList.remove('hidden');
    if(rule) rule.classList.remove('hidden');
    if(success){ success.className = 'success-card hidden'; success.innerHTML = ''; }
  }

  function showOtpModal(phone, registration){
    const modal = $('#modal');
    const body = $('#modalBody');
    if(!modal || !body) return;
    body.innerHTML = `
      <div class="otp-modal">
        <div class="otp-icon">🔐</div>
        <h2>${t('Unesite sigurnosni kod','Enter security code')}</h2>
        <p>${t('Kod je poslan na','Code was sent to')} <b>${safe(phone)}</b>.</p>
        <label>${t('OTP kod','OTP code')}<input id="clubOtpCode" inputmode="numeric" autocomplete="one-time-code" placeholder="123456"></label>
        <button id="clubVerifyOtp" class="primary full">${t('Potvrdi registraciju','Verify registration')}</button>
        <button id="clubChangePhone" class="secondary full">${t('Promijeni broj','Change number')}</button>
        <p id="clubOtpMsg" class="cloud-mini"></p>
      </div>
    `;
    modal.classList.remove('hidden');
    setTimeout(()=>$('#clubOtpCode')?.focus(), 120);
    $('#clubChangePhone')?.addEventListener('click',()=>{ modal.classList.add('hidden'); });
    $('#clubVerifyOtp')?.addEventListener('click', async()=>{
      const code = ($('#clubOtpCode')?.value || '').trim();
      const msg = $('#clubOtpMsg');
      if(!code){ msg.textContent = t('Unesite kod.','Enter the code.'); return; }
      msg.textContent = t('Provjeravamo kod...','Verifying code...');
      const { data, error } = await client.auth.verifyOtp({ phone, token: code, type:'sms' });
      if(error){ msg.textContent = error.message; return; }
      await upsertProfile(data.user, registration);
      await initOneSignal(data.user.id);
      await syncInbox();
      ensureWelcomeRewards();
      modal.classList.add('hidden');
      setClubRegisteredView(data.session || await getSession());
      if(typeof window.renderAll === 'function') window.renderAll();
      if(typeof window.renderInboxBadge === 'function') window.renderInboxBadge();
    });
  }

  function wireClubRegistrationOtp(){
    const form = $('#clubForm');
    if(!form || form.dataset.cloudOtpWired === '1') return;
    form.dataset.cloudOtpWired = '1';
    form.addEventListener('submit', async(e)=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      const fd = new FormData(form);
      const registration = {
        first_name: String(fd.get('firstName')||'').trim(),
        last_name: String(fd.get('lastName')||'').trim(),
        phone: e164(fd.get('phone')),
        email: String(fd.get('email')||'').trim() || null,
        birthday: String(fd.get('birthDate')||'').trim() || null,
        referralCode: String(fd.get('referralCode')||'').trim() || localStorage.langar_pending_referral || ''
      };
      if(!registration.first_name){ alert(t('Unesite ime.','Enter first name.')); return; }
      if(!registration.phone){ alert(t('Unesite broj telefona.','Enter phone number.')); return; }
      const btn = form.querySelector('button[type="submit"], button.primary, button');
      const oldText = btn ? btn.textContent : '';
      if(btn){ btn.disabled = true; btn.textContent = t('Šaljemo kod...','Sending code...'); }
      const { error } = await client.auth.signInWithOtp({ phone: registration.phone });
      if(btn){ btn.disabled = false; btn.textContent = oldText; }
      if(error){ alert(error.message); return; }
      showOtpModal(registration.phone, registration);
    }, true);
  }

  async function boot(){
    injectStyles();
    wireClubRegistrationOtp();
    const session = await getSession();
    if(session){
      await upsertProfile(session.user, { phone: session.user.phone });
      await initOneSignal(session.user.id);
      await syncInbox();
      setClubRegisteredView(session);
    } else {
      setClubRegisterView();
    }
    client.auth.onAuthStateChange(async(_event, session)=>{
      if(session){
        await upsertProfile(session.user,{phone:session.user.phone});
        await initOneSignal(session.user.id);
        await syncInbox();
        setClubRegisteredView(session);
      } else {
        setClubRegisterView();
      }
    });
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

// =============================
// V4.2 — Cloud Menu + Likes + Feedback
// =============================
(function(){
  'use strict';
  const wait = (ms)=>new Promise(r=>setTimeout(r,ms));
  const safeText = v=>String(v||'').trim();
  const money = n => `€${Number(n||0).toFixed(2)}`;
  const appLang = ()=>localStorage.langar_lang || document.documentElement.lang || 'hr';
  const LS2 = { get(k,d){ try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d} }, set(k,v){ localStorage.setItem(k, JSON.stringify(v)); } };
  let originalGetMenu = null;
  let originalToggleLike = null;
  let originalRenderPublicFeedback = null;
  let booted = false;

  function client(){ return window.LangarCloud?.client || null; }
  function mapCloudMenu(cats=[], items=[]){
    return cats.map(cat=>{
      const catItems = items.filter(i=>i.category_id===cat.id).map(i=>({
        id:i.id,
        sku:i.sku || i.id,
        cloudId:i.id,
        name:{en:i.name_en||'', hr:i.name_hr||i.name_en||''},
        desc:{en:i.description_en||'', hr:i.description_hr||i.description_en||''},
        ingredients:{en:i.ingredients_en||i.description_en||'', hr:i.ingredients_hr||i.ingredients_en||''},
        price: money(i.price),
        icon:i.icon || cat.icon || '✦',
        available:i.active!==false && i.available_in_menu!==false,
        orderable:i.allow_online_order!==false,
        isNew:!!i.is_new,
        isFeatured:!!i.is_featured,
        isSushiPreorder:!!i.is_sushi_preorder,
        allergens:Array.isArray(i.allergens) && i.allergens.length ? i.allergens.join(', ') : 'ask staff',
        rewardEligible:true
      }));
      return {
        id:cat.slug,
        cloudId:cat.id,
        icon:cat.icon || '✦',
        title:{en:cat.title_en||cat.slug, hr:cat.title_hr||cat.title_en||cat.slug},
        description:{en:cat.description_en||'', hr:cat.description_hr||cat.description_en||''},
        active:cat.active!==false,
        sort:cat.sort_order||0,
        items:catItems
      };
    }).filter(c=>c.active!==false).sort((a,b)=>(a.sort||0)-(b.sort||0));
  }
  async function loadCloudMenu(){
    const c = client(); if(!c) return false;
    const catsRes = await c.from('menu_categories').select('id,slug,title_en,title_hr,description_en,description_hr,icon,sort_order,active').eq('active',true).order('sort_order',{ascending:true});
    const itemsRes = await c.from('menu_items').select('id,category_id,sku,name_en,name_hr,description_en,description_hr,ingredients_en,ingredients_hr,allergens,price,icon,sort_order,active,available_in_menu,allow_online_order,is_new,is_featured,is_sushi_preorder').eq('active',true).eq('available_in_menu',true).order('sort_order',{ascending:true});
    if(catsRes.error || itemsRes.error){ console.warn('Cloud menu load error', catsRes.error?.message || itemsRes.error?.message); return false; }
    if(!catsRes.data?.length || !itemsRes.data?.length){
      window.LangarCloudMenuLoaded = false;
      return false;
    }
    const mapped = mapCloudMenu(catsRes.data, itemsRes.data);
    if(mapped.length){
      LS2.set('langar_cloud_menu_cache', mapped);
      window.LangarCloudMenuLoaded = true;
      window.LangarCloudMenuCache = mapped;
      return true;
    }
    return false;
  }
  async function loadCloudStats(){
    const c=client(); if(!c) return;
    const {data,error}=await c.from('v_menu_item_stats').select('item_id,likes_count,positive_comments_count,online_sales_count,manual_sales_count,popular_score,best_seller_score');
    if(error){ console.warn('Cloud stats error', error.message); return; }
    const likes={}, comments={}, sales={}, scores={};
    (data||[]).forEach(r=>{ likes[r.item_id]=+r.likes_count||0; comments[r.item_id]=+r.positive_comments_count||0; sales[r.item_id]=(+r.online_sales_count||0)+(+r.manual_sales_count||0); scores[r.item_id]=+r.popular_score||0; });
    LS2.set('langar_cloud_like_counts', likes);
    LS2.set('langar_cloud_comment_counts', comments);
    LS2.set('langar_pos_sales', sales);
    LS2.set('langar_cloud_popular_scores', scores);
  }
  async function loadOwnLikes(){
    const c=client(); if(!c) return;
    const {data:sessionData}=await c.auth.getSession();
    const user=sessionData?.session?.user; if(!user) return;
    const {data,error}=await c.from('menu_item_likes').select('item_id').eq('user_id', user.id);
    if(error){ console.warn('Cloud likes error', error.message); return; }
    const map={}; (data||[]).forEach(r=>{ map[r.item_id]=true; });
    LS2.set('langar_item_likes', map);
  }
  async function loadPublicFeedback(){
    const c=client(); if(!c) return;
    const {data,error}=await c.from('v_public_feedback').select('id,rating,message,display_name,created_at').order('created_at',{ascending:false}).limit(30);
    if(error){ console.warn('Public feedback load error', error.message); return; }
    const mapped=(data||[]).map(f=>({id:f.id,rating:f.rating,message:f.message,name:f.display_name,createdAt:f.created_at,status:'public'}));
    if(mapped.length) LS2.set('langar_feedback', mapped);
  }
  async function cloudToggleLike(item){
    const c=client(); if(!c || !item?.cloudId){ if(originalToggleLike) return originalToggleLike(item); return; }
    const {data:sessionData}=await c.auth.getSession();
    const user=sessionData?.session?.user;
    if(!user){ alert(appLang()==='hr'?'Prijavite se u Langar Club kako bi se lajk spremio u Cloud.':'Please join/login to Langar Club so your like can be saved in Cloud.'); return; }
    const current = LS2.get('langar_item_likes',{});
    if(current[item.id]){
      const {error}=await c.from('menu_item_likes').delete().eq('user_id', user.id).eq('item_id', item.cloudId || item.id);
      if(error){ alert('Cloud like error: '+error.message); return; }
      delete current[item.id];
    } else {
      const {error}=await c.from('menu_item_likes').insert({user_id:user.id,item_id:item.cloudId || item.id});
      if(error && !String(error.message||'').includes('duplicate')){ alert('Cloud like error: '+error.message); return; }
      current[item.id]=true;
    }
    LS2.set('langar_item_likes', current);
    await loadCloudStats();
    if(typeof renderMenu==='function') renderMenu();
    if(typeof renderOrderMenu==='function') renderOrderMenu();
    if(typeof renderHomeMarketing==='function') renderHomeMarketing();
  }
  function overrideGetMenu(){
    if(!originalGetMenu && typeof getMenu==='function') originalGetMenu=getMenu;
    if(originalGetMenu && !getMenu.__cloudV42){
      getMenu = function(){
        const cloud = window.LangarCloudMenuCache || LS2.get('langar_cloud_menu_cache', null);
        if(Array.isArray(cloud) && cloud.length) return cloud;
        return originalGetMenu();
      };
      getMenu.__cloudV42 = true;
    }
  }
  function overrideLike(){
    if(!originalToggleLike && typeof toggleLike==='function') originalToggleLike=toggleLike;
    if(originalToggleLike && !toggleLike.__cloudV42){
      toggleLike = function(item){ return cloudToggleLike(item); };
      toggleLike.__cloudV42 = true;
    }
  }
  function overridePublicFeedback(){
    if(!originalRenderPublicFeedback && typeof renderPublicFeedback==='function') originalRenderPublicFeedback=renderPublicFeedback;
    if(originalRenderPublicFeedback && !renderPublicFeedback.__cloudV42){
      renderPublicFeedback = function(){ originalRenderPublicFeedback(); };
      renderPublicFeedback.__cloudV42 = true;
    }
  }
  function setupFeedbackForm(){
    const form=document.querySelector('#feedbackForm'); if(!form || form.dataset.cloudV42) return;
    form.dataset.cloudV42='1';
    form.onsubmit=async e=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(form).entries());
      const c=client();
      const rating=+data.rating;
      if(c){
        const {data:sessionData}=await c.auth.getSession();
        const user=sessionData?.session?.user;
        if(user){
          const {error}=await c.from('feedback').insert({
            user_id:user.id,
            rating,
            message:data.message||'',
            customer_name:data.name||'',
            is_public:rating>=4,
            status:rating>=4?'public':'admin_only'
          });
          if(error){ alert('Cloud feedback error: '+error.message); return; }
          form.reset();
          await loadPublicFeedback();
          if(typeof renderPublicFeedback==='function') renderPublicFeedback();
          if(typeof renderHomeMarketing==='function') renderHomeMarketing();
          if(typeof maybeGoogleReviewPrompt==='function') maybeGoogleReviewPrompt(rating);
          return;
        }
      }
      const list=LS2.get('langar_feedback',[]);
      list.unshift({id:'FB-'+Date.now(),createdAt:new Date().toISOString(),status:rating>=4?'public':'admin_only',...data});
      LS2.set('langar_feedback',list);
      form.reset();
      if(typeof renderPublicFeedback==='function') renderPublicFeedback();
      if(typeof renderHomeMarketing==='function') renderHomeMarketing();
      if(typeof maybeGoogleReviewPrompt==='function') maybeGoogleReviewPrompt(rating);
    };
  }
  async function refreshCloudData(){
    overrideGetMenu(); overrideLike(); overridePublicFeedback(); setupFeedbackForm();
    await loadCloudMenu();
    await Promise.allSettled([loadCloudStats(), loadOwnLikes(), loadPublicFeedback()]);
    overrideGetMenu();
    if(typeof renderAll==='function') renderAll();
  }
  async function boot(){
    if(booted) return; booted=true;
    for(let i=0;i<20 && !window.LangarCloud;i++) await wait(150);
    await refreshCloudData();
    window.LangarCloudV42 = { refreshCloudData, loadCloudMenu, loadCloudStats, loadOwnLikes, loadPublicFeedback };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
