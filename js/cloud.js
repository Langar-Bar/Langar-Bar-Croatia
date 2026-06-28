(function(){
  'use strict';
  const CLOUD_VERSION = 'V4.5.4 ETA + Cancellation Fix';
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
  const money = n => `€${Number(n||0).toFixed(2)}`;

  if(!window.supabase || !window.supabase.createClient){
    console.warn('Supabase SDK not loaded. Cloud mode disabled. Local fallback will remain available.');
    return;
  }

  const client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey:'langar_bar_supabase_auth_v442' }
  });

  window.LangarCloud = {
    client,
    CONFIG,
    version:CLOUD_VERSION,
    syncInbox,
    syncRewardCards,
    getSession,
    upsertProfile,
    initOneSignal,
    deleteCloudMessage,
    markCloudMessageRead,
    cloudStatus
  };

  function e164(raw){
    let s = String(raw||'').trim().replace(/[\s\-().]/g,'');
    if(!s) return '';
    if(s.startsWith('00')) s = '+' + s.slice(2);
    if(s.startsWith('0')) s = '+385' + s.slice(1);
    if(!s.startsWith('+')) s = '+385' + s;
    return s;
  }
  async function getSession(){ const { data } = await client.auth.getSession(); return data.session || null; }
  function localNonCloudCards(){ return (readLS('langar_cards',[])||[]).filter(c=>!c.cloudId); }
  function mapCloudCard(row){
    const title = lang()==='hr' ? (row.title_hr || row.title_en || row.reward_type || 'Langar reward') : (row.title_en || row.title_hr || row.reward_type || 'Langar reward');
    const body = lang()==='hr' ? (row.description_hr || row.description_en || '') : (row.description_en || row.description_hr || '');
    return {
      id:'cloud-card-' + row.id,
      cloudId:row.id,
      type: row.reward_type==='welcome_espresso' ? 'welcome' : (row.reward_type || 'reward'),
      title,
      body,
      code: row.qr_code || String(row.id||'').slice(0,8).toUpperCase(),
      status: row.status || 'active',
      validUntil: row.valid_until || null,
      createdAt: row.created_at || new Date().toISOString()
    };
  }

  async function upsertProfile(user, extra={}){
    if(!user) return;
    const phone = user.phone || extra.phone || '';
    const email = user.email || extra.email || null;
    const localProfile = readLS('langar_profile', {}) || {};
    let existing = null;
    try{
      const { data } = await client
        .from('profiles')
        .select('id,phone,email,first_name,last_name,birthday,app_language,customer_level,langar_credit,referral_code,created_at')
        .eq('id', user.id)
        .maybeSingle();
      existing = data || null;
    }catch(e){ console.warn('Profile lookup failed:', e.message); }

    const firstName = existing?.first_name || extra.first_name || user.user_metadata?.first_name || localProfile.firstName || '';
    const lastName = existing?.last_name || extra.last_name || user.user_metadata?.last_name || localProfile.lastName || '';
    const birthDate = existing?.birthday || extra.birthday || user.user_metadata?.birthday || localProfile.birthDate || null;
    const referralCode = existing?.referral_code || localProfile.referralCode || ('REF-' + String(user.id).slice(0,6).toUpperCase());

    const payload = {
      id: user.id,
      phone: existing?.phone || phone || extra.phone || null,
      phone_verified: !!(existing?.phone || phone || extra.phone),
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
      alert(t('Profil se nije mogao spremiti u Cloud: ','Profile could not be saved to Cloud: ') + error.message);
    }

    writeLS('langar_profile', {
      ...localProfile,
      id: user.id,
      cloudId: user.id,
      phone: existing?.phone || phone || extra.phone || localProfile.phone || '',
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
      cloudReady: !error,
      returningMember: !!existing,
      cloudLoginMethod: user.email ? 'email_password' : 'phone_otp',
      createdAt: existing?.created_at || localProfile.createdAt || new Date().toISOString()
    });
  }

  async function initOneSignal(userId){
    try{
      if(!window.OneSignalDeferred) return;
      window.OneSignalDeferred.push(async function(OneSignal){
        await OneSignal.init({ appId: CONFIG.oneSignalAppId, allowLocalhostAsSecureOrigin: true });
        if(userId && OneSignal.login) await OneSignal.login(userId);
        if(OneSignal.User && OneSignal.User.addTags){ await OneSignal.User.addTags({ app_language: lang(), app: 'langar_bar' }); }
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

  async function markCloudMessageRead(cloudId){ if(cloudId) await client.from('inbox_messages').update({ is_read:true, read_at:new Date().toISOString() }).eq('id', cloudId); }
  async function deleteCloudMessage(cloudId){ if(cloudId) await client.from('inbox_messages').update({ is_deleted:true, deleted_at:new Date().toISOString() }).eq('id', cloudId); }

  async function syncRewardCards(){
    const session = await getSession();
    if(!session) return { ok:false, reason:'not_logged_in' };
    try{
      const { data, error } = await client.from('reward_cards')
        .select('id,reward_type,title_en,title_hr,description_en,description_hr,qr_code,status,valid_until,created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending:false })
        .limit(100);
      if(error) throw error;
      const cloudCards = (data||[]).map(mapCloudCard);
      writeLS('langar_cards', [...cloudCards, ...localNonCloudCards()].slice(0,120));
      return { ok:true, count:cloudCards.length };
    }catch(error){ console.warn('Cloud reward sync failed:', error.message); return { ok:false, error }; }
  }

  async function ensureWelcomeRewards(){
    const session = await getSession();
    if(session){
      try{
        const { data, error } = await client.from('reward_cards')
          .select('id,status')
          .eq('user_id', session.user.id)
          .eq('reward_type', 'welcome_espresso')
          .limit(1);
        if(error) throw error;
        if(!data || !data.length){
          const qr = 'FREE-' + Math.floor(100000+Math.random()*900000);
          const { error: insertError } = await client.from('reward_cards').insert({
            user_id: session.user.id,
            reward_type:'welcome_espresso',
            title_en:'Free Espresso Card',
            title_hr:'Besplatni espresso',
            description_en:'One-time free espresso welcome gift. Show this card and let staff scan it.',
            description_hr:'Jednokratni poklon dobrodošlice: besplatni espresso. Pokažite karticu osoblju za skeniranje.',
            qr_code:qr,
            status:'active'
          });
          if(insertError && !String(insertError.message||'').toLowerCase().includes('duplicate')) throw insertError;
          await client.from('inbox_messages').insert({
            user_id: session.user.id,
            type:'reward',
            title_en:'Free Espresso Card',
            body_en:'Your one-time welcome espresso card is ready in Rewards.',
            title_hr:'Besplatni espresso',
            body_hr:'Vaša jednokratna espresso kartica je spremna u Rewards.',
            data:{campaign_key:'welcome_espresso', reward_type:'welcome_espresso', qr_code:qr}
          }).then(()=>{});
        }
        await syncRewardCards();
        return;
      }catch(e){ console.warn('Cloud welcome reward failed; using local fallback:', e.message); }
    }
    try{
      const cards = readLS('langar_cards', []);
      let welcomeCard = cards.find(c=>c.type==='welcome');
      if(!welcomeCard){
        const code = 'FREE-' + Math.floor(100000+Math.random()*900000);
        welcomeCard = { id:'welcome-' + Date.now(), type:'welcome', title:'Free Espresso Card', body:'One-time free espresso welcome gift. Show this card and let staff scan it.', code, status:'active', unread:true, createdAt:new Date().toISOString() };
        cards.unshift(welcomeCard); writeLS('langar_cards', cards);
      }
      const inbox = readLS('langar_inbox', []).filter(m=>!m.cloudWelcomeLocal); writeLS('langar_inbox', inbox);
    }catch(e){ console.warn('Welcome reward local sync failed', e); }
  }

  function injectStyles(){
    if($('#cloudStyles')) return;
    const style=document.createElement('style');
    style.id='cloudStyles';
    style.textContent = `
      .club-rule{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.club-rule b::after{content: ':'}
      .club-auth-box{display:block}.club-auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0 16px}.club-auth-tabs button{border:1px solid rgba(238,211,139,.28);background:rgba(255,255,255,.05);color:var(--cream);border-radius:18px;padding:13px;font-weight:900;cursor:pointer}.club-auth-tabs button.active{background:linear-gradient(135deg,#f6d98b,#d8a33d);color:#17130a;box-shadow:0 10px 24px rgba(0,0,0,.22)}.club-auth-panel.hidden,.club-rule.hidden{display:none!important}.club-auth-panel h3{margin-top:0}.or-divider{display:flex;align-items:center;gap:10px;margin:12px 0;color:var(--muted);font-size:.82rem;text-transform:uppercase}.or-divider:before,.or-divider:after{content:'';height:1px;background:rgba(238,211,139,.22);flex:1}.checkline{display:flex!important;align-items:flex-start;gap:10px}.checkline input{width:auto!important;margin-top:4px}
      .cloud-member-card{border:1px solid rgba(238,211,139,.35);background:linear-gradient(145deg,rgba(22,66,50,.86),rgba(7,18,14,.92));border-radius:26px;padding:18px;margin:16px 0;box-shadow:0 18px 40px rgba(0,0,0,.25)}
      .cloud-member-card h3{margin-top:0}.cloud-member-id{font-size:12px;color:var(--muted);word-break:break-all;background:rgba(0,0,0,.18);border:1px solid rgba(238,211,139,.22);border-radius:14px;padding:10px;margin:10px 0}.cloud-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.cloud-row>*{flex:1}.cloud-mini{font-size:12px;opacity:.78;line-height:1.5}.cloud-ok{color:#bff3ce}.cloud-warn{color:#ffd58a}
      .otp-modal label{display:block;text-align:left;margin:12px 0}.otp-modal input{width:100%;border:1px solid rgba(238,211,139,.35);border-radius:16px;background:#07120e;color:#fff;padding:14px;font-size:1.1rem;text-align:center;letter-spacing:.12em}.otp-modal .otp-icon{width:64px;height:64px;margin:0 auto 10px;display:grid;place-items:center;border-radius:22px;background:radial-gradient(circle at 30% 25%,#fff3c4,var(--gold) 42%,#72551b 100%);color:#111;font-size:2rem;box-shadow:0 14px 24px rgba(0,0,0,.28)}
    `;
    document.head.appendChild(style);
  }

  async function cloudStatus(){
    const session = await getSession();
    const p = readLS('langar_profile', null);
    const cards = readLS('langar_cards', []);
    return { loggedIn:!!session, userId:session?.user?.id||null, email:session?.user?.email||p?.email||'', localProfile:!!p, cloudReady:!!p?.cloudReady, localCards:cards.length, version:CLOUD_VERSION };
  }

  function ensureClubMarkup(){
    const club = document.getElementById('club');
    if(!club) return;
    const hasRequired = document.getElementById('clubAuthBox') && document.getElementById('clubLoginForm') && document.getElementById('clubForm') && document.querySelector('[name="birthDate"]');
    const oldLocalOnly = /save profile/i.test(club.textContent || '') && !document.getElementById('clubLoginForm');
    if(hasRequired && !oldLocalOnly){
      const bd=document.querySelector('#clubForm [name="birthDate"]'); if(bd) bd.required=true;
      const loginForm=document.getElementById('clubLoginForm');
      if(loginForm && !loginForm.querySelector('[name="loginPhone"]')){
        const pass=loginForm.querySelector('[name="loginPassword"]')?.closest('label');
        if(pass) pass.insertAdjacentHTML('afterend', `<div class="or-divider"><span>${t('ili','or')}</span></div><label>${t('Telefon za SMS kod','Phone for SMS code')}<input name="loginPhone" autocomplete="tel" placeholder="+385..."></label>`);
        const email=loginForm.querySelector('[name="loginEmail"]'); if(email) email.required=false;
        const pw=loginForm.querySelector('[name="loginPassword"]'); if(pw) pw.required=false;
      }
      return;
    }
    club.innerHTML = `
      <section class="section-head"><h2>Langar Club</h2><p>${t('Registrirajte se u Cloud kako biste zaštitili kredit, kartice i rođendanske pogodnosti.','Register in Cloud to protect your credit, cards and birthday rewards.')}</p></section>
      <div class="club-rule"><b>${t('Poklon dobrodošlice','Welcome Gift')}</b><span>${t('Besplatan espresso za nove članove — jednokratna digitalna kartica','Free espresso for new members — one-time digital card')}</span></div>
      <div id="clubAuthBox" class="club-auth-box form-card">
        <div class="club-auth-tabs" role="tablist"><button type="button" id="clubLoginTab" class="active">${t('Prijava','Login')}</button><button type="button" id="clubSignupTab">${t('Registracija','Register')}</button></div>
        <form id="clubLoginForm" class="club-auth-panel"><h3>${t('Prijava člana','Member login')}</h3><p class="muted">${t('Prijavite se emailom i lozinkom ili telefonom kroz SMS kod.','Log in with email/password or phone SMS code.')}</p><label>Email / Login ID<input type="email" name="loginEmail" autocomplete="email" placeholder="name@example.com"></label><label>${t('Lozinka','Password')}<input type="password" name="loginPassword" autocomplete="current-password" minlength="6"></label><div class="or-divider"><span>${t('ili','or')}</span></div><label>${t('Telefon za SMS kod','Phone for SMS code')}<input name="loginPhone" autocomplete="tel" placeholder="+385..."></label><button class="primary full">${t('Prijavi se','Login')}</button><p class="legal mini">${t('Ako ste već član, nemojte se ponovno registrirati. Samo se prijavite istim emailom ili telefonom.','If you are already a member, do not register again. Log in with the same email or phone.')}</p></form>
        <form id="clubForm" class="club-auth-panel hidden"><h3>${t('Nova registracija','New registration')}</h3><label>${t('Ime','First name')}<input required name="firstName" autocomplete="given-name"></label><label>${t('Prezime','Last name')}<input name="lastName" autocomplete="family-name"></label><label>${t('Telefon','Phone')}<input required name="phone" autocomplete="tel" placeholder="+385..."></label><label>Email / Login ID<input type="email" name="email" autocomplete="email" required placeholder="name@example.com"></label><label>${t('Lozinka','Password')}<input type="password" name="password" autocomplete="new-password" minlength="6" required></label><label>${t('Ponovite lozinku','Repeat password')}<input type="password" name="passwordConfirm" autocomplete="new-password" minlength="6" required></label><label>${t('Datum rođenja','Birth date')}<input type="date" name="birthDate" required></label><label>${t('Referral code','Referral code')}<input name="referralCode" placeholder="Optional"></label><label class="checkline"><input type="checkbox" name="terms" required> <span>${t('Prihvaćam Langar Club uvjete i spremanje profila u Cloud.','I accept Langar Club terms and Cloud profile storage.')}</span></label><button class="primary full">${t('Registriraj se','Register')}</button><p class="legal mini">${t('Email i telefon koriste se za zaštitu od duplih profila. Ako je email potvrda uključena, potvrdite email prije prve prijave.','Email and phone protect against duplicate profiles. If email confirmation is enabled, confirm your email before first login.')}</p></form>
      </div><div id="clubSuccess" class="success-card hidden"></div><div id="clubResult" class="qr-card hidden"></div>`;
  }

  function setClubRegisteredView(session){
    const authBox = $('#clubAuthBox'); const form = $('#clubForm'); const loginForm = $('#clubLoginForm'); const rule = document.querySelector('#club .club-rule'); const success = $('#clubSuccess');
    if(authBox) authBox.classList.add('hidden'); if(form) form.classList.add('hidden'); if(loginForm) loginForm.classList.add('hidden'); if(rule) rule.classList.add('hidden');
    if(success){
      const local = readLS('langar_profile', {}) || {};
      const fullName = [local.firstName, local.lastName].filter(Boolean).join(' ') || t('Langar član','Langar member');
      const email = local.email || session?.user?.email || '';
      const cloudReady = local.cloudReady ? `<span class="cloud-ok">${t('Cloud spremljeno','Cloud saved')}</span>` : `<span class="cloud-warn">${t('Lokalno spremljeno — provjerite Cloud','Local only — check Cloud')}</span>`;
      success.className = 'cloud-member-card';
      success.innerHTML = `
        <h3>${t('Vaše članstvo je aktivno','Your membership is active')}</h3>
        <p>${t('Vaš Langar Club profil, kredit i digitalne kartice spremaju se u Cloud kada ste prijavljeni. Ako obrišete aplikaciju, ponovno se prijavite istim emailom i lozinkom.','Your Langar Club profile, credit and digital cards are saved in Cloud when you are logged in. If you delete the app, log in again with the same email and password.')}</p>
        <p><b>${safe(fullName)}</b><br><small>${safe(email || local.phone || '')}</small><br><small>${cloudReady}</small></p>
        <div class="cloud-member-id"><b>Cloud Member ID</b><br>${safe(session?.user?.id || local.cloudId || local.id || '')}</div>
        <div class="cloud-row"><button id="syncCloudProfile" class="secondary">${t('Sinkroniziraj profil','Sync profile')}</button><button id="syncCloudInbox" class="secondary">${t('Sinkroniziraj Inbox','Sync Inbox')}</button><button id="cloudSignOut" class="danger">${t('Odjava','Sign out')}</button></div>
      `;
      $('#syncCloudInbox')?.addEventListener('click', async()=>{ const r=await syncInbox(); const c=await syncRewardCards(); alert(r.ok ? t('Cloud Inbox je sinkroniziran.','Cloud Inbox synced.') : (r.error?.message || r.reason || 'Error')); if(typeof window.renderAll==='function') window.renderAll(); });
      $('#syncCloudProfile')?.addEventListener('click', async()=>{ const s=await getSession(); if(s){ await upsertProfile(s.user,{email:s.user.email, phone:s.user.phone}); await syncRewardCards(); await syncInbox(); setClubRegisteredView(s); if(typeof window.renderAll==='function') window.renderAll(); alert(t('Profil je sinkroniziran.','Profile synced.')); } });
      $('#cloudSignOut')?.addEventListener('click', async()=>{ await client.auth.signOut(); localStorage.removeItem('langar_profile'); location.reload(); });
    }
  }

  function showClubMode(mode){
    const login = $('#clubLoginForm'), signup = $('#clubForm'), rule = document.querySelector('#club .club-rule'), loginTab = $('#clubLoginTab'), signupTab = $('#clubSignupTab');
    const isSignup = mode === 'signup';
    if(login) login.classList.toggle('hidden', isSignup);
    if(signup) signup.classList.toggle('hidden', !isSignup);
    if(rule) rule.classList.toggle('hidden', !isSignup);
    if(loginTab) loginTab.classList.toggle('active', !isSignup);
    if(signupTab) signupTab.classList.toggle('active', isSignup);
  }
  function setClubRegisterView(){ ensureClubMarkup(); const authBox=$('#clubAuthBox'), success=$('#clubSuccess'), result=$('#clubResult'); if(authBox) authBox.classList.remove('hidden'); showClubMode('login'); if(success){ success.className='success-card hidden'; success.innerHTML=''; } if(result){ result.className='qr-card hidden'; result.innerHTML=''; } }

  function showOtpModal(phone, registration, mode="signup"){
    const modal = $('#modal'), body = $('#modalBody'); if(!modal || !body) return;
    body.innerHTML = `<div class="otp-modal"><div class="otp-icon">🔐</div><h2>${t('Unesite sigurnosni kod','Enter security code')}</h2><p>${t('Kod je poslan na','Code was sent to')} <b>${safe(phone)}</b>.</p><label>${t('OTP kod','OTP code')}<input id="clubOtpCode" inputmode="numeric" autocomplete="one-time-code" placeholder="123456"></label><button id="clubVerifyOtp" class="primary full">${mode==='login' ? t('Potvrdi prijavu','Verify login') : t('Potvrdi registraciju','Verify registration')}</button><button id="clubChangePhone" class="secondary full">${t('Promijeni broj','Change number')}</button><p id="clubOtpMsg" class="cloud-mini"></p></div>`;
    modal.classList.remove('hidden'); setTimeout(()=>$('#clubOtpCode')?.focus(), 120); $('#clubChangePhone')?.addEventListener('click',()=>{ modal.classList.add('hidden'); });
    $('#clubVerifyOtp')?.addEventListener('click', async()=>{
      const code = ($('#clubOtpCode')?.value || '').trim(); const msg = $('#clubOtpMsg'); if(!code){ msg.textContent = t('Unesite kod.','Enter the code.'); return; }
      msg.textContent = t('Provjeravamo kod...','Verifying code...');
      const { data, error } = await client.auth.verifyOtp({ phone, token: code, type:'sms' });
      if(error){ msg.textContent = error.message; return; }
      await upsertProfile(data.user, registration || { phone }); await initOneSignal(data.user.id); await ensureWelcomeRewards(); await syncInbox(); await syncRewardCards();
      modal.classList.add('hidden'); setClubRegisteredView(data.session || await getSession()); if(typeof window.renderAll === 'function') window.renderAll(); if(typeof window.renderInboxBadge === 'function') window.renderInboxBadge();
    });
  }

  function wireClubRegistrationOtp(){
    ensureClubMarkup();
    const form = $('#clubForm'); const loginForm = $('#clubLoginForm');
    $('#clubLoginTab')?.addEventListener('click',()=>showClubMode('login')); $('#clubSignupTab')?.addEventListener('click',()=>showClubMode('signup'));
    if(loginForm && loginForm.dataset.cloudLoginWired !== '1'){
      loginForm.dataset.cloudLoginWired = '1';
      loginForm.addEventListener('submit', async(e)=>{
        e.preventDefault(); e.stopImmediatePropagation();
        const fd = new FormData(loginForm); const email = String(fd.get('loginEmail')||'').trim(); const password = String(fd.get('loginPassword')||''); const phone = e164(fd.get('loginPhone'));
        const btn = loginForm.querySelector('button[type="submit"], button.primary, button'); const oldText = btn ? btn.textContent : ''; if(btn){ btn.disabled=true; btn.textContent=t('Prijavljujemo...','Logging in...'); }
        try{
          let data, error;
          if(email && password){ ({data,error}=await client.auth.signInWithPassword({ email, password })); }
          else if(phone){ ({error}=await client.auth.signInWithOtp({ phone })); if(error) throw error; showOtpModal(phone, { phone }, 'login'); return; }
          else { alert(t('Unesite email i lozinku.','Enter email and password.')); return; }
          if(error) throw error; const session = data.session || await getSession(); if(!session) throw new Error(t('Prijava treba potvrdu emaila. Provjerite email i pokušajte ponovno.','Login may require email confirmation. Check your email and try again.'));
          await upsertProfile(session.user,{email:session.user.email, phone:session.user.phone}); await initOneSignal(session.user.id); await ensureWelcomeRewards(); await syncInbox(); await syncRewardCards(); setClubRegisteredView(session); if(typeof window.renderAll==='function') window.renderAll();
        }catch(err){ alert((err && err.message) ? err.message : String(err)); }
        finally{ if(btn){ btn.disabled=false; btn.textContent=oldText; } }
      }, true);
    }
    if(!form || form.dataset.cloudOtpWired === '1') return;
    form.dataset.cloudOtpWired = '1';
    form.addEventListener('submit', async(e)=>{
      e.preventDefault(); e.stopImmediatePropagation();
      const fd = new FormData(form);
      const registration = { first_name:String(fd.get('firstName')||'').trim(), last_name:String(fd.get('lastName')||'').trim(), phone:e164(fd.get('phone')), email:String(fd.get('email')||'').trim() || null, birthday:String(fd.get('birthDate')||'').trim() || null, referralCode:String(fd.get('referralCode')||'').trim() || localStorage.langar_pending_referral || '' };
      const password = String(fd.get('password')||''); const passwordConfirm = String(fd.get('passwordConfirm')||'');
      if(!registration.first_name){ alert(t('Unesite ime.','Enter first name.')); return; }
      if(!registration.phone){ alert(t('Unesite broj telefona.','Enter phone number.')); return; }
      if(!registration.email){ alert(t('Unesite email.','Enter email.')); return; }
      if(password.length<6){ alert(t('Lozinka mora imati najmanje 6 znakova.','Password must be at least 6 characters.')); return; }
      if(password !== passwordConfirm){ alert(t('Lozinke se ne podudaraju.','Passwords do not match.')); return; }
      const btn = form.querySelector('button[type="submit"], button.primary, button'); const oldText = btn ? btn.textContent : ''; if(btn){ btn.disabled=true; btn.textContent=t('Registriramo...','Registering...'); }
      try{
        const { data, error } = await client.auth.signUp({
          email: registration.email,
          password,
          options:{ data:{ first_name:registration.first_name, last_name:registration.last_name, phone:registration.phone, birthday:registration.birthday, referralCode:registration.referralCode } }
        });
        if(error) throw error;
        let session = data.session || await getSession();
        if(!session && data.user){
          alert(t('Registracija je primljena. Provjerite email za potvrdu, zatim se prijavite. Telefon ostaje vezan uz ovaj profil nakon Cloud potvrde.','Registration received. Check your email for confirmation, then log in. The phone remains attached to this profile after Cloud confirmation.'));
          showClubMode('login'); return;
        }
        if(!session) throw new Error(t('Registracija nije vratila sesiju. Pokušajte se prijaviti.','Registration did not return a session. Try logging in.'));
        await upsertProfile(session.user, registration); await initOneSignal(session.user.id); await ensureWelcomeRewards(); await syncInbox(); await syncRewardCards(); form.reset(); setClubRegisteredView(session); if(typeof window.renderAll==='function') window.renderAll(); if(typeof window.renderInboxBadge==='function') window.renderInboxBadge();
        alert(t('Registracija je završena. Profil je spremljen u Cloud.','Registration completed. Profile is saved in Cloud.'));
      }catch(err){ alert((err && err.message) ? err.message : String(err)); }
      finally{ if(btn){ btn.disabled=false; btn.textContent=oldText; } }
    }, true);
  }

  function overrideRedeemCard(){
    if(typeof window.redeemCard === 'function' || typeof redeemCard === 'function'){
      const original = (typeof redeemCard === 'function') ? redeemCard : window.redeemCard;
      if(original && !original.__cloudV442){
        const patched = async function(id){
          const card = (readLS('langar_cards',[])||[]).find(c=>c.id===id);
          if(card?.cloudId){
            try{ await client.from('reward_cards').update({status:'redeemed', redeemed_at:new Date().toISOString()}).eq('id', card.cloudId); }catch(e){ console.warn('Cloud card redeem sync failed', e.message); }
          }
          const result = original(id);
          await syncRewardCards();
          if(typeof window.renderRewards==='function') window.renderRewards();
          return result;
        };
        patched.__cloudV442 = true;
        try{ redeemCard = patched; }catch(e){ window.redeemCard = patched; }
      }
    }
  }

  async function boot(){
    injectStyles(); ensureClubMarkup(); wireClubRegistrationOtp(); overrideRedeemCard();
    window.LangarCloudAuth = { renderClub: async()=>{ ensureClubMarkup(); wireClubRegistrationOtp(); const s=await getSession(); if(s) setClubRegisteredView(s); else setClubRegisterView(); }, showLogin:()=>showClubMode('login'), showSignup:()=>showClubMode('signup') };
    window.renderClubState = window.LangarCloudAuth.renderClub;
    const session = await getSession();
    if(session){ await upsertProfile(session.user, { phone:session.user.phone, email:session.user.email }); await initOneSignal(session.user.id); await ensureWelcomeRewards(); await syncInbox(); await syncRewardCards(); setClubRegisteredView(session); }
    else { setClubRegisterView(); }
    client.auth.onAuthStateChange(async(_event, session)=>{
      if(session){ await upsertProfile(session.user,{phone:session.user.phone,email:session.user.email}); await initOneSignal(session.user.id); await ensureWelcomeRewards(); await syncInbox(); await syncRewardCards(); setClubRegisteredView(session); if(typeof window.renderAll==='function') window.renderAll(); }
      else { setClubRegisterView(); }
    });
    document.addEventListener('click', async(e)=>{ const item=e.target.closest?.('.inbox-item'); if(!item) return; const text=item.textContent||''; const cloudMsgs=readLS('langar_inbox',[]).filter(m=>m.cloudId); const match=cloudMsgs.find(m=>text.includes(m.title)); if(match && !match.__readSynced){ await markCloudMessageRead(match.cloudId); match.__readSynced=true; } }, true);
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


// =============================
// V4.4.5 — Customer orders to Cloud Admin tablet
// =============================
(function(){
  'use strict';
  const CONFIG = { supabaseUrl:'https://fkanccgigogbxodiljqt.supabase.co', supabaseKey:'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7' };
  if(!window.supabase?.createClient) return;
  const client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, storageKey:'langar_bar_supabase_auth_v442' } });
  const priceNum = p=>{ const m=String(p||'0').replace(',','.').match(/[0-9]+(\.[0-9]+)?/); return m?Number(m[0]):0; };
  function cleanItem(it){ return { id:it.id, qty:+it.qty||1, name_en:it.nameSnapshot||it.name?.en||it.name||'', name_hr:it.nameSnapshotHr||it.name?.hr||it.nameSnapshot||it.name||'', price:priceNum(it.price), line_total:+(priceNum(it.price)*(+it.qty||1)).toFixed(2), note:it.note||'', category_id:it.categoryId||'' }; }
  async function submitOrder(order){
    const { data:sessionData } = await client.auth.getSession();
    const user = sessionData?.session?.user || null;
    const payload = {
      user_id: user?.id || null,
      fulfillment_type: order.type || 'dine_in',
      table_number: order.tableNumber || null,
      customer_name: order.name || null,
      customer_phone: order.phone || null,
      delivery_address: order.address || null,
      note: order.note || null,
      items: (order.items||[]).map(cleanItem),
      total: Number(order.total || 0),
      currency: 'EUR',
      status: 'new',
      paid: false,
      app_version: 'v454'
    };

    // V4.5.4: submit through a single JSON RPC. This is the reliable path for guest orders.
    // Do not silently fallback to direct table insert, because that can hit RLS and confuse staff.
    let data=null, error=null;
    let r = await client.rpc('submit_customer_order_payload', { p_order: payload });
    data = r.data; error = r.error;

    // Compatibility path only for projects that already installed V4.4.9 SQL but not V4.5.4 yet.
    if(error && String(error.message||'').toLowerCase().includes('submit_customer_order_payload')){
      r = await client.rpc('submit_customer_order', {
        p_user_id: payload.user_id,
        p_fulfillment_type: payload.fulfillment_type,
        p_table_number: payload.table_number,
        p_customer_name: payload.customer_name,
        p_customer_phone: payload.customer_phone,
        p_delivery_address: payload.delivery_address,
        p_note: payload.note,
        p_items: payload.items,
        p_total: payload.total
      });
      data = r.data; error = r.error;
    }

    if(error){
      const msg = [error.message, error.details, error.hint, error.code].filter(Boolean).join(' | ');
      if(String(msg).includes('submit_customer_order_payload') || String(msg).includes('submit_customer_order')){
        throw new Error('Order Cloud SQL is not installed or schema cache is old. Run langar_bar_v454_eta_cancel_refresh_fix.sql in Supabase SQL Editor, then refresh the app. Details: ' + msg);
      }
      throw new Error(msg || 'Unknown Supabase order submit error');
    }
    const row = Array.isArray(data) ? data[0] : data;
    if(!row?.order_token){ throw new Error('Order was submitted but Cloud did not return an order tracking token. Run V4.5.4 SQL again.'); }
    return { ok:true, id:row.id, order_number:row.order_number, order_token:row.order_token, status:row.status || 'new', created_at:row.created_at };
  }
  async function getOrderByToken(token){
    if(!token) return null;
    const {data,error}=await client.rpc('get_customer_order_by_token',{p_token:token});
    if(error) throw error;
    return Array.isArray(data)?data[0]:data;
  }
  async function requestOrderCancellation(token, reason=''){
    if(!token) throw new Error('Missing order tracking token.');
    const {data,error}=await client.rpc('request_order_cancellation_by_token',{p_token:token, p_reason:reason||null});
    if(error) throw error;
    return Array.isArray(data)?data[0]:data;
  }
  window.LangarOrderCloud = { submitOrder, getOrderByToken, requestOrderCancellation, client };
})();
