// Langar Admin V4.2.8 — clean category-style admin hub
(function(){
  'use strict';
  const CONFIG={supabaseUrl:'https://fkanccgigogbxodiljqt.supabase.co',supabaseKey:'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7'};
  const client=window.supabase?.createClient?window.supabase.createClient(CONFIG.supabaseUrl,CONFIG.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true}}):null;
  const $=s=>document.querySelector(s); const $$=s=>Array.from(document.querySelectorAll(s));
  const safe=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const modules=[
    {id:'dashboardPanel', icon:'🏠', title:'Dashboard', note:'Overview and admin home'},
    {id:'quickPricePanel', icon:'💶', title:'Quick Price Update', note:'Fast price edit'},
    {id:'menuPanel', icon:'📋', title:'Menu Manager', note:'Items, ingredients, availability'},
    {id:'ordersPanel', icon:'🧾', title:'Orders / Delivery', note:'Online orders and status'},
    {id:'reservationsPanel', icon:'📅', title:'Reservations', note:'Table and time requests'},
    {id:'customersPanel', icon:'👥', title:'Customers & Rewards', note:'Profiles, cards, credit, history'},
    {id:'referralsPanel', icon:'🔗', title:'Referral Rewards', note:'Invite rules and rewards'},
    {id:'notificationsPanel', icon:'✉️', title:'Notifications / Inbox', note:'Messages and campaigns'},
    {id:'experiencePanel', icon:'✨', title:'Experience Tools', note:'Surprises, polls, sales stats'},
    {id:'eventsPanel', icon:'🎟️', title:'Event Manager', note:'Events and interests'},
    {id:'sushiPanel', icon:'🍣', title:'Sushi Pre-orders', note:'Confirm, notify, demand'},
    {id:'baristaPanel', icon:'☕', title:'Barista Questions', note:'Coffee questions'},
    {id:'feedbackPanel', icon:'⭐', title:'Feedback / Reviews', note:'Reviews and complaints'},
    {id:'galleryPanel', icon:'🖼️', title:'Gallery Manager', note:'Photos and categories'},
    {id:'settingsPanel', icon:'⚙️', title:'Settings / Remaris', note:'Rules and integrations'}
  ];
  let current='dashboardPanel'; let backStack=[]; let forwardStack=[];

  function injectStyles(){
    if($('#adminLayout428Styles')) return;
    const st=document.createElement('style'); st.id='adminLayout428Styles'; st.textContent=`
      body.admin-unlocked .admin-grid{display:block!important;grid-template-columns:1fr!important}.side{display:none!important}main{width:100%}.panel{max-width:1180px;margin:0 auto 18px}.topbar{z-index:80}.admin-actions{gap:8px}.admin-nav-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.admin-nav-btn{border:1px solid rgba(238,211,139,.28);background:rgba(255,255,255,.055);color:var(--cream);border-radius:14px;padding:9px 12px;cursor:pointer}.admin-nav-btn:disabled{opacity:.35;cursor:not-allowed}.admin-current{color:var(--gold);font-weight:800}.admin-clean-hub{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:14px}.admin-clean-card{border:1px solid rgba(238,211,139,.25);background:linear-gradient(145deg,rgba(238,211,139,.14),rgba(17,67,50,.48));border-radius:24px;color:var(--cream);padding:16px;min-height:132px;text-align:left;cursor:pointer;box-shadow:0 18px 36px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.08);transition:transform .16s ease,border-color .16s ease,filter .16s ease}.admin-clean-card:hover,.admin-clean-card:focus{transform:translateY(-2px);border-color:rgba(238,211,139,.58);filter:brightness(1.08)}.admin-clean-icon{display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:18px;background:linear-gradient(145deg,rgba(238,211,139,.32),rgba(255,255,255,.08));font-size:1.65rem;margin-bottom:12px;animation:adminSoftPulse 3.2s ease-in-out infinite}.admin-clean-card b{font-size:1.02rem;line-height:1.1;display:block}.admin-clean-card small{display:block;color:var(--muted);margin-top:6px;line-height:1.35}.admin-overview{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:12px 0}.admin-overview-card{border:1px solid rgba(238,211,139,.20);border-radius:20px;background:rgba(255,255,255,.035);padding:13px}.admin-overview-card span{font-size:1.2rem}.admin-overview-card b{display:block;font-size:1.55rem;margin-top:4px}.admin-overview-card small{color:var(--muted)}.admin-home-text{border:1px solid rgba(238,211,139,.18);background:rgba(238,211,139,.06);border-radius:22px;padding:14px;margin:10px 0}.admin-subbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 12px}.admin-subbar .secondary{padding:9px 12px}.admin-module-title{display:flex;align-items:center;gap:10px}.admin-module-title .admin-clean-icon{width:42px;height:42px;font-size:1.35rem;margin:0;animation:none}.admin-toast-stack{position:fixed;right:14px;bottom:14px;z-index:99999;display:flex;flex-direction:column;gap:8px}.admin-toast{border:1px solid rgba(238,211,139,.25);background:rgba(7,18,14,.96);color:var(--cream);border-radius:16px;padding:12px 14px;max-width:360px;box-shadow:0 18px 40px rgba(0,0,0,.4)}@keyframes adminSoftPulse{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.06);filter:brightness(1.25)}}
      @media(max-width:900px){.admin-clean-hub{grid-template-columns:repeat(3,minmax(0,1fr))}.admin-overview{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:650px){.admin{padding:10px}.topbar{position:sticky;top:0;background:rgba(7,18,14,.97);border-radius:0 0 20px 20px;margin:-10px -10px 10px;padding:10px}.admin-actions{width:100%;justify-content:space-between}.admin-nav-actions{width:100%;display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px}.admin-current{grid-column:1/-1;text-align:center;font-size:.85rem}.admin-clean-hub{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.admin-clean-card{min-height:122px;padding:13px;border-radius:22px}.admin-clean-icon{width:44px;height:44px;font-size:1.4rem}.panel{border-radius:24px;padding:12px;scroll-margin-top:120px}.admin-subbar{display:grid;grid-template-columns:1fr 1fr 1fr}.admin-subbar .secondary{width:100%;font-size:.86rem}.admin-toast-stack{left:10px;right:10px;bottom:10px}.admin-toast{max-width:none}.table-wrap{overflow-x:auto}.table{min-width:760px}}
    `; document.head.appendChild(st);
  }

  function toast(msg,type='ok'){
    let stack=$('.admin-toast-stack'); if(!stack){stack=document.createElement('div'); stack.className='admin-toast-stack'; document.body.appendChild(stack);}
    const el=document.createElement('div'); el.className='admin-toast '+type; el.textContent=String(msg||'Done.'); stack.appendChild(el);
    try{const logs=JSON.parse(localStorage.getItem('langar_admin_action_log')||'[]'); logs.unshift({message:String(msg||'Done'),type,createdAt:new Date().toISOString()}); localStorage.setItem('langar_admin_action_log',JSON.stringify(logs.slice(0,30)));}catch(e){}
    setTimeout(()=>{el.style.opacity='0'; setTimeout(()=>el.remove(),250);},3000);
  }
  window.adminNotify=toast;
  window.alert=function(msg){toast(msg,'ok'); console.log('Admin notice:',msg);};

  function titleFor(id){return modules.find(m=>m.id===id)?.title||id;}
  function iconFor(id){return modules.find(m=>m.id===id)?.icon||'▫️';}
  function updateNav(){
    $('#adminBackBtn')?.toggleAttribute('disabled',backStack.length===0);
    $('#adminForwardBtn')?.toggleAttribute('disabled',forwardStack.length===0);
    const lbl=$('#adminCurrentPanelLabel'); if(lbl) lbl.textContent=titleFor(current);
  }
  function decoratePanel(id){
    if(id==='dashboardPanel') return;
    const panel=document.getElementById(id); if(!panel || panel.dataset.decorated428==='1') return;
    panel.dataset.decorated428='1';
    const head=panel.querySelector('.section-head');
    const sub=document.createElement('div'); sub.className='admin-subbar'; sub.innerHTML=`<button class="secondary" data-admin-back-local>‹ Back</button><button class="secondary" data-admin-home-local>⌂ Dashboard</button><button class="secondary" data-admin-forward-local>Forward ›</button>`;
    panel.insertBefore(sub,panel.firstChild);
    sub.querySelector('[data-admin-back-local]').onclick=goBack;
    sub.querySelector('[data-admin-home-local]').onclick=()=>openPanel('dashboardPanel');
    sub.querySelector('[data-admin-forward-local]').onclick=goForward;
    if(head && !head.querySelector('.admin-module-title')){
      const h=head.querySelector('h2'); if(h){ h.innerHTML=`<span class="admin-module-title"><span class="admin-clean-icon">${iconFor(id)}</span><span>${h.textContent}</span></span>`; }
    }
  }
  function showOnly(id){
    $$('.panel').forEach(p=>p.classList.toggle('hidden',p.id!==id));
    current=id; decoratePanel(id); updateNav();
    if(id==='dashboardPanel') renderHub();
    const el=document.getElementById(id); if(el) setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }
  function openPanel(id){ if(!id) return; if(id!==current){backStack.push(current); forwardStack=[];} showOnly(id); }
  function goBack(){ if(!backStack.length) return; const prev=backStack.pop(); forwardStack.push(current); showOnly(prev); }
  function goForward(){ if(!forwardStack.length) return; const next=forwardStack.pop(); backStack.push(current); showOnly(next); }
  function nextPanel(dir){ const i=modules.findIndex(m=>m.id===current); const next=modules[(i+dir+modules.length)%modules.length]; openPanel(next.id); }

  async function counts(){
    if(!client) return {customers:'-',inbox:'-',sushi:'-',cards:'-'};
    try{
      const [p,i,s,c]=await Promise.all([
        client.rpc('admin_list_customers').then(r=>({count:Array.isArray(r.data)?r.data.length:0,error:r.error})).catch(()=>client.from('profiles').select('id',{count:'exact',head:true})),
        client.from('inbox_messages').select('id',{count:'exact',head:true}),
        client.from('sushi_preorders').select('id',{count:'exact',head:true}),
        client.from('reward_cards').select('id',{count:'exact',head:true})
      ]);
      return {customers:p.count||0,inbox:i.count||0,sushi:s.count||0,cards:c.count||0};
    }catch(e){return {customers:'-',inbox:'-',sushi:'-',cards:'-'};}
  }
  async function renderHub(){
    const d=$('#adminDashboard'); if(!d) return;
    const c=await counts();
    d.className='';
    d.innerHTML=`
      <div class="admin-home-text"><b>Admin Home</b><p class="muted">این صفحه مثل منوی اصلی اپ است: اول دسته‌بندی‌های ادمین را می‌بینی، بعد با کلیک وارد همان بخش می‌شوی. برای برگشت از Back / Dashboard / Forward استفاده کن یا روی موبایل چپ و راست بکش.</p></div>
      <div class="admin-overview">
        <button class="admin-overview-card" data-admin-go="customersPanel"><span>👥</span><b>${c.customers}</b><small>Cloud Customers</small></button>
        <button class="admin-overview-card" data-admin-go="notificationsPanel"><span>✉️</span><b>${c.inbox}</b><small>Cloud Inbox</small></button>
        <button class="admin-overview-card" data-admin-go="sushiPanel"><span>🍣</span><b>${c.sushi}</b><small>Sushi Pre-orders</small></button>
        <button class="admin-overview-card" data-admin-go="customersPanel"><span>🎁</span><b>${c.cards}</b><small>Reward Cards</small></button>
      </div>
      <div class="section-head"><h2>Admin Modules</h2><p>Choose one module to open its page.</p></div>
      <div class="admin-clean-hub">
        ${modules.filter(m=>m.id!=='dashboardPanel').map(m=>`<button class="admin-clean-card" data-admin-go="${m.id}"><span class="admin-clean-icon">${m.icon}</span><b>${safe(m.title)}</b><small>${safe(m.note)}</small></button>`).join('')}
      </div>`;
    $$('[data-admin-go]').forEach(b=>b.onclick=()=>openPanel(b.dataset.adminGo));
  }

  function installTopNav(){
    const actions=$('.admin-actions'); if(!actions || $('#adminBackBtn')) return;
    const nav=document.createElement('div'); nav.className='admin-nav-actions';
    nav.innerHTML=`<button id="adminBackBtn" class="admin-nav-btn" type="button">‹ Back</button><button id="adminHomeBtn" class="admin-nav-btn" type="button">⌂ Dashboard</button><button id="adminForwardBtn" class="admin-nav-btn" type="button">Forward ›</button><span id="adminCurrentPanelLabel" class="admin-current">Dashboard</span>`;
    actions.prepend(nav);
    $('#adminBackBtn').onclick=goBack; $('#adminForwardBtn').onclick=goForward; $('#adminHomeBtn').onclick=()=>openPanel('dashboardPanel'); updateNav();
  }
  function installSwipe(){
    if(window.__adminSwipe428) return; window.__adminSwipe428=true;
    let sx=0,sy=0; document.querySelector('main')?.addEventListener('touchstart',e=>{const t=e.touches[0]; sx=t.clientX; sy=t.clientY;},{passive:true});
    document.querySelector('main')?.addEventListener('touchend',e=>{const t=e.changedTouches[0]; const dx=t.clientX-sx, dy=t.clientY-sy; if(Math.abs(dx)>75 && Math.abs(dx)>Math.abs(dy)*1.4){ if(dx<0) nextPanel(1); else nextPanel(-1); }},{passive:true});
  }
  function install(){
    injectStyles(); installTopNav(); installSwipe();
    window.showPanel=openPanel;
    document.addEventListener('click',e=>{const go=e.target.closest?.('[data-admin-go]'); if(go) openPanel(go.dataset.adminGo);});
    setTimeout(()=>{showOnly('dashboardPanel'); renderHub();},600);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install); else install();
})();
