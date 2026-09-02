// Langar Admin V4.3.0 — clean mobile dashboard + English only + responsive panels
(function(){
  'use strict';
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const safe = v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  const modules = [
    {id:'quickPricePanel', icon:'💶', title:'Quick Price Update', note:'Fast price edit'},
    {id:'menuPanel', icon:'📋', title:'Menu Manager', note:'Items, ingredients, availability'},
    {id:'ordersPanel', icon:'🧾', title:'Orders / Delivery', note:'Online orders and status'},
    {id:'reservationsPanel', icon:'📅', title:'Reservations', note:'Table and time requests'},
    {id:'customersPanel', icon:'👥', title:'Customers & Rewards', note:'Profiles, credit, cards, history'},
    {id:'referralsPanel', icon:'🔗', title:'Referral Rewards', note:'Invites and rewards'},
    {id:'notificationsPanel', icon:'✉️', title:'Notifications / Inbox', note:'Messages and campaigns'},
    {id:'experiencePanel', icon:'✨', title:'Experience Tools', note:'Surprises, polls, sales stats'},
    {id:'eventsPanel', icon:'🎟️', title:'Event Manager', note:'Events and interests'},
    {id:'sushiPanel', icon:'🍣', title:'Sushi Pre-orders', note:'Confirm, notify, demand'},
    {id:'baristaPanel', icon:'☕', title:'Barista Questions', note:'Coffee questions'},
    {id:'feedbackPanel', icon:'⭐', title:'Feedback / Reviews', note:'Reviews and complaints'},
    {id:'galleryPanel', icon:'🖼️', title:'Gallery Manager', note:'Photos and categories'},
    {id:'settingsPanel', icon:'⚙️', title:'Settings / Remaris', note:'Rules and integrations'}
  ];
  let current = 'dashboardPanel';
  let backStack = [];
  let forwardStack = [];

  function injectStyles(){
    if($('#adminLayout430Styles')) return;
    const st=document.createElement('style'); st.id='adminLayout430Styles';
    st.textContent = `
      body.admin-unlocked .admin-grid{display:block!important;grid-template-columns:1fr!important}
      body.admin-unlocked .side{display:none!important}
      body.admin-locked .admin-grid{display:none!important}
      main{width:100%}.panel{max-width:1180px;margin:0 auto 18px}.panel.hidden{display:none!important}
      .admin-clean-dashboard{max-width:1180px;margin:0 auto}.admin-hub-header{border:1px solid rgba(238,211,139,.22);background:rgba(238,211,139,.07);border-radius:24px;padding:16px;margin:0 0 14px}.admin-hub-header h2{margin:0 0 6px}.admin-hub-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.admin-hub-card{border:1px solid rgba(238,211,139,.25);background:linear-gradient(145deg,rgba(238,211,139,.14),rgba(17,67,50,.48));color:var(--cream);border-radius:24px;padding:16px;min-height:132px;text-align:left;cursor:pointer;box-shadow:0 18px 36px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.08);transition:.16s ease}.admin-hub-card:hover,.admin-hub-card:focus{transform:translateY(-2px);filter:brightness(1.08);border-color:rgba(238,211,139,.58)}.admin-hub-icon{display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:18px;background:linear-gradient(145deg,rgba(238,211,139,.32),rgba(255,255,255,.08));font-size:1.6rem;margin-bottom:12px;animation:adminPulse429 3.4s ease-in-out infinite}.admin-hub-card b{font-size:1.02rem;line-height:1.1;display:block}.admin-hub-card small{display:block;color:var(--muted);margin-top:6px;line-height:1.35}.admin-top-nav{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.admin-top-nav button{border:1px solid rgba(238,211,139,.28);background:rgba(255,255,255,.055);color:var(--cream);border-radius:14px;padding:9px 12px;cursor:pointer}.admin-top-nav button:disabled{opacity:.35}.admin-current-label{color:var(--gold);font-weight:800}.admin-subbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 12px}.admin-subbar button{border:1px solid rgba(238,211,139,.28);background:rgba(255,255,255,.055);color:var(--cream);border-radius:14px;padding:9px 12px;cursor:pointer}.admin-module-title{display:flex;align-items:center;gap:10px}.admin-module-title .admin-hub-icon{width:42px;height:42px;font-size:1.3rem;margin:0;animation:none}.pull-refresh-hint{position:fixed;top:10px;left:50%;transform:translateX(-50%) translateY(-80px);z-index:99999;border:1px solid rgba(238,211,139,.35);background:rgba(7,18,14,.96);color:var(--cream);border-radius:999px;padding:10px 16px;box-shadow:0 18px 38px rgba(0,0,0,.35);transition:transform .18s ease}.pull-refresh-hint.show{transform:translateX(-50%) translateY(0)}@keyframes adminPulse429{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.06);filter:brightness(1.22)}}
      html,body{max-width:100%;overflow-x:hidden}.admin,.admin *{box-sizing:border-box}main{min-width:0}.panel{width:100%;min-width:0}.form-card input,.form-card select,.form-card textarea{max-width:100%;width:100%}.edit-grid{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.toolbar{flex-wrap:wrap}
      @media(max-width:650px){html,body{overflow-x:hidden}.admin{padding:10px!important;width:100%!important;max-width:100%!important}.topbar{position:sticky;top:0;background:rgba(7,18,14,.97);border-radius:0 0 20px 20px;margin:-10px -10px 10px;padding:10px;z-index:80}.brand img{width:48px!important;height:48px!important}.brand b{font-size:1rem}.brand span{font-size:.74rem}.admin-actions{width:100%!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}.admin-actions .secondary,.admin-actions button{width:100%!important;min-height:42px}.admin-top-nav{grid-column:1/-1!important;width:100%!important;display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:7px!important}.admin-current-label{grid-column:1/-1!important;text-align:center!important;font-size:.86rem!important;white-space:normal!important}.admin-clean-dashboard{width:100%;overflow:hidden}.admin-hub-header{padding:13px!important;border-radius:22px!important}.admin-hub-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}.admin-hub-card{min-height:116px!important;padding:12px!important;border-radius:22px!important}.admin-hub-card b{font-size:.94rem!important;overflow-wrap:anywhere}.admin-hub-card small{font-size:.78rem!important}.admin-hub-icon{width:42px!important;height:42px!important;font-size:1.35rem!important}.panel{width:100%!important;max-width:100%!important;border-radius:22px!important;padding:12px!important;margin:0 0 14px!important;overflow:hidden;scroll-margin-top:120px}.section-head h2{font-size:1.35rem!important}.section-head p{font-size:.94rem!important}.admin-subbar{display:grid!important;grid-template-columns:1fr 1fr 1fr!important}.admin-subbar button{width:100%!important;font-size:.84rem!important}.table-wrap{overflow-x:auto!important;-webkit-overflow-scrolling:touch}.table{min-width:720px}.edit-grid,.quick-price{display:grid!important;grid-template-columns:1fr!important}.quick-grid{grid-template-columns:1fr!important}.legal-block{overflow-wrap:anywhere}}

      @media(max-width:900px){.admin-hub-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:650px){.admin{padding:10px}.topbar{position:sticky;top:0;background:rgba(7,18,14,.97);border-radius:0 0 20px 20px;margin:-10px -10px 10px;padding:10px;z-index:80}.admin-actions{width:100%;justify-content:space-between}.admin-top-nav{width:100%;display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px}.admin-current-label{grid-column:1/-1;text-align:center;font-size:.86rem}.admin-hub-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.admin-hub-card{min-height:122px;padding:13px;border-radius:22px}.admin-hub-icon{width:44px;height:44px;font-size:1.4rem}.panel{border-radius:24px;padding:12px;scroll-margin-top:120px}.admin-subbar{display:grid;grid-template-columns:1fr 1fr 1fr}.admin-subbar button{width:100%;font-size:.86rem}.table-wrap{overflow-x:auto}.table{min-width:760px}}
    `;
    document.head.appendChild(st);
  }

  function panelTitle(id){
    if(id==='dashboardPanel') return 'Dashboard';
    return modules.find(m=>m.id===id)?.title || id;
  }
  function moduleIcon(id){ return modules.find(m=>m.id===id)?.icon || '▫️'; }

  function updateNav(){
    $('#admin429Back')?.toggleAttribute('disabled', backStack.length===0);
    $('#admin429Forward')?.toggleAttribute('disabled', forwardStack.length===0);
    const label=$('#admin429Current'); if(label) label.textContent=panelTitle(current);
  }

  function decoratePanel(id){
    if(id==='dashboardPanel') return;
    const panel=document.getElementById(id);
    if(!panel || panel.dataset.admin429Decorated==='1') return;
    panel.dataset.admin429Decorated='1';
    const bar=document.createElement('div');
    bar.className='admin-subbar';
    bar.innerHTML='<button type="button" data-a429-back>‹ Back</button><button type="button" data-a429-home>⌂ Dashboard</button><button type="button" data-a429-forward>Forward ›</button>';
    panel.insertBefore(bar,panel.firstChild);
    bar.querySelector('[data-a429-back]').onclick=goBack;
    bar.querySelector('[data-a429-home]').onclick=()=>openPanel('dashboardPanel');
    bar.querySelector('[data-a429-forward]').onclick=goForward;
    const h=panel.querySelector('.section-head h2');
    if(h && !h.dataset.admin429Title){ h.dataset.admin429Title='1'; h.innerHTML=`<span class="admin-module-title"><span class="admin-hub-icon">${moduleIcon(id)}</span><span>${safe(h.textContent)}</span></span>`; }
  }

  async function getCounts(){
    const client = window.supabase?.createClient ? window.supabase.createClient('https://fkanccgigogbxodiljqt.supabase.co','sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7',{auth:{persistSession:true,autoRefreshToken:true}}) : null;
    if(!client) return {};
    try{
      const [cust,inbox,sushi,cards]=await Promise.all([
        client.rpc('admin_list_customers').then(r=>Array.isArray(r.data)?r.data.length:0).catch(()=>0),
        client.from('inbox_messages').select('id',{count:'exact',head:true}).then(r=>r.count||0).catch(()=>0),
        client.from('sushi_preorders').select('id',{count:'exact',head:true}).then(r=>r.count||0).catch(()=>0),
        client.from('reward_cards').select('id',{count:'exact',head:true}).then(r=>r.count||0).catch(()=>0)
      ]);
      return {customers:cust,inbox,sushi,cards};
    }catch(e){return {};}
  }

  async function renderDashboard(){
    const p=$('#dashboardPanel'); if(!p) return;
    p.classList.remove('hidden');
    const c=await getCounts();
    p.innerHTML=`
      <div class="admin-clean-dashboard">
        <div class="admin-hub-header"><h2>Admin Dashboard</h2><p class="muted">All admin modules are organized like the app menu. Tap a card to open that module.</p></div>
        <div class="admin-hub-grid">
          <button class="admin-hub-card" data-admin429-go="customersPanel"><span class="admin-hub-icon">👥</span><b>Customers & Rewards</b><small>${c.customers??'-'} cloud customers · profiles, cards, credit, history</small></button>
          <button class="admin-hub-card" data-admin429-go="notificationsPanel"><span class="admin-hub-icon">✉️</span><b>Notifications / Inbox</b><small>${c.inbox??'-'} inbox messages · campaigns</small></button>
          <button class="admin-hub-card" data-admin429-go="sushiPanel"><span class="admin-hub-icon">🍣</span><b>Sushi Pre-orders</b><small>${c.sushi??'-'} pre-orders · confirm and notify</small></button>
          <button class="admin-hub-card" data-admin429-go="customersPanel"><span class="admin-hub-icon">🎁</span><b>Reward Cards</b><small>${c.cards??'-'} cards · espresso and birthday</small></button>
          ${modules.filter(m=>!['customersPanel','notificationsPanel','sushiPanel'].includes(m.id)).map(m=>`<button class="admin-hub-card" data-admin429-go="${m.id}"><span class="admin-hub-icon">${m.icon}</span><b>${safe(m.title)}</b><small>${safe(m.note)}</small></button>`).join('')}
        </div>
      </div>`;
    $$('[data-admin429-go]',p).forEach(b=>b.onclick=()=>openPanel(b.dataset.admin429Go));
  }

  function showOnly(id){
    $$('.panel').forEach(p=>{
      if(p.id==='cloudAdminGate') return;
      p.classList.toggle('hidden', p.id!==id);
    });
    current=id; decoratePanel(id); updateNav();
    if(id==='dashboardPanel') renderDashboard();
    const el=document.getElementById(id); if(el) setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),20);
    try{ if(id==='customersPanel' && typeof window.renderCustomers==='function') setTimeout(()=>window.renderCustomers(true),80); }catch(e){}
    try{ if(id==='sushiPanel' && typeof window.renderSushiAdmin==='function') setTimeout(()=>window.renderSushiAdmin(),80); }catch(e){}
  }
  function openPanel(id){ if(!id) return; if(id!==current){backStack.push(current); forwardStack=[];} showOnly(id); }
  function goBack(){ if(!backStack.length) return; const prev=backStack.pop(); forwardStack.push(current); showOnly(prev); }
  function goForward(){ if(!forwardStack.length) return; const next=forwardStack.pop(); backStack.push(current); showOnly(next); }
  function nextPanel(dir){ const order=['dashboardPanel',...modules.map(m=>m.id)]; const i=order.indexOf(current); const next=order[(Math.max(0,i)+dir+order.length)%order.length]; openPanel(next); }

  function installTopNav(){
    const actions=$('.admin-actions'); if(!actions || $('#admin429Nav')) return;
    const nav=document.createElement('div'); nav.id='admin429Nav'; nav.className='admin-top-nav';
    nav.innerHTML='<button id="admin429Back" type="button">‹ Back</button><button id="admin429Home" type="button">⌂ Home</button><button id="admin429Forward" type="button">Forward ›</button><span id="admin429Current" class="admin-current-label">Dashboard</span>';
    actions.prepend(nav);
    $('#admin429Back').onclick=goBack; $('#admin429Home').onclick=()=>openPanel('dashboardPanel'); $('#admin429Forward').onclick=goForward;
  }

  function installPullRefresh(){
    if(window.__adminPullRefresh429) return; window.__adminPullRefresh429=true;
    let startY=0, pulling=false;
    const hint=document.createElement('div'); hint.className='pull-refresh-hint'; hint.textContent='Release to refresh'; document.body.appendChild(hint);
    document.addEventListener('touchstart',e=>{ if(window.scrollY<=2){ startY=e.touches[0].clientY; pulling=true; } },{passive:true});
    document.addEventListener('touchmove',e=>{ if(!pulling) return; const dy=e.touches[0].clientY-startY; if(dy>80) hint.classList.add('show'); else hint.classList.remove('show'); },{passive:true});
    document.addEventListener('touchend',e=>{ if(!pulling) return; const dy=(e.changedTouches[0]?.clientY||0)-startY; pulling=false; hint.classList.remove('show'); if(dy>105 && window.scrollY<=10){ location.reload(); } },{passive:true});
  }

  function installSwipe(){
    if(window.__adminSwipe429) return; window.__adminSwipe429=true;
    let sx=0,sy=0;
    document.addEventListener('touchstart',e=>{const t=e.touches[0]; sx=t.clientX; sy=t.clientY;},{passive:true});
    document.addEventListener('touchend',e=>{const t=e.changedTouches[0]; if(!t) return; const dx=t.clientX-sx, dy=t.clientY-sy; if(Math.abs(dx)>80 && Math.abs(dx)>Math.abs(dy)*1.45){ if(dx<0) nextPanel(1); else nextPanel(-1); }},{passive:true});
  }

  function isUnlocked(){ return document.body.classList.contains('admin-unlocked'); }
  function ensureCleanDashboard(){ if(!isUnlocked()) return; installTopNav(); showOnly('dashboardPanel'); }

  function install(){
    injectStyles(); installTopNav(); installPullRefresh(); installSwipe();
    window.showPanel = openPanel;
    document.addEventListener('click',e=>{ const b=e.target.closest?.('[data-admin-go],[data-admin429-go]'); if(b){ e.preventDefault(); openPanel(b.dataset.adminGo||b.dataset.admin429Go); } });
    // Wait for Cloud Admin auth to finish. If a stored session is valid, open dashboard. If not, leave login gate visible.
    setTimeout(()=>{ if(isUnlocked()) ensureCleanDashboard(); },900);
    setTimeout(()=>{ if(isUnlocked()) ensureCleanDashboard(); },1800);
    const obs=new MutationObserver(()=>{ if(isUnlocked() && !window.__admin429Shown){ window.__admin429Shown=true; setTimeout(ensureCleanDashboard,80); } if(!isUnlocked()) window.__admin429Shown=false; });
    obs.observe(document.body,{attributes:true,attributeFilter:['class']});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install); else install();
})();