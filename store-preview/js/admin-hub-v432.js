// Langar Admin V4.3.2 — stable clean admin hub: menu-style module cards + mobile-safe pages
(function(){
  'use strict';
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
  const modules = [
    {id:'quickPricePanel', icon:'💶', title:'Quick Price Update', note:'Fast price edit'},
    {id:'menuPanel', icon:'📋', title:'Menu Manager', note:'Items, ingredients, availability'},
    {id:'ordersPanel', icon:'🧾', title:'Orders / Delivery', note:'Online order workflow'},
    {id:'reservationsPanel', icon:'📅', title:'Reservations', note:'Table and time requests'},
    {id:'customersPanel', icon:'👥', title:'Customers & Rewards', note:'Profiles, credit, cards, history'},
    {id:'referralsPanel', icon:'🔗', title:'Referral Rewards', note:'Invite rules and rewards'},
    {id:'notificationsPanel', icon:'✉️', title:'Notifications / Inbox', note:'Messages and campaigns'},
    {id:'experiencePanel', icon:'✨', title:'Experience Tools', note:'Surprise, polls, sales stats'},
    {id:'eventsPanel', icon:'🎟️', title:'Event Manager', note:'Events and interests'},
    {id:'sushiPanel', icon:'🍣', title:'Sushi Pre-orders', note:'Confirm, ready message, reject'},
    {id:'baristaPanel', icon:'☕', title:'Barista Questions', note:'Coffee questions and answers'},
    {id:'feedbackPanel', icon:'⭐', title:'Feedback / Reviews', note:'Public positives, admin-only negatives'},
    {id:'galleryPanel', icon:'🖼️', title:'Gallery Manager', note:'Photos and categories'},
    {id:'settingsPanel', icon:'⚙️', title:'Settings / Remaris', note:'Rules and future POS integration'}
  ];
  let current = 'dashboardPanel';
  let backStack = [];
  let forwardStack = [];

  function titleFor(id){ return id==='dashboardPanel' ? 'Dashboard' : (modules.find(m=>m.id===id)?.title || 'Module'); }
  function iconFor(id){ return modules.find(m=>m.id===id)?.icon || '▫️'; }
  function esc(v){ return String(v??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function unlocked(){ return document.body.classList.contains('admin-unlocked'); }

  function injectStyles(){
    if($('#adminHub432Styles')) return;
    const st=document.createElement('style');
    st.id='adminHub432Styles';
    st.textContent=`
      /* V4.3.2 stable admin hub */
      body.admin-unlocked .admin-grid{display:block!important;grid-template-columns:1fr!important;max-width:1180px;margin:0 auto;}
      body.admin-unlocked .side{display:none!important;}
      body.admin-unlocked main{width:100%!important;min-width:0!important;}
      body.admin-unlocked .panel.hidden{display:none!important;}
      body.admin-unlocked .panel{width:100%!important;min-width:0!important;max-width:100%!important;overflow:hidden!important;}
      .admin-hub432{width:100%;}
      .admin-hub432-head{border:1px solid rgba(238,211,139,.22);background:linear-gradient(145deg,rgba(238,211,139,.10),rgba(20,66,51,.32));border-radius:26px;padding:20px;margin-bottom:16px;}
      .admin-hub432-head h2{margin:0 0 6px;font-size:clamp(1.65rem,4vw,2.4rem);}
      .admin-hub432-head p{margin:0;color:var(--muted);line-height:1.45;}
      .admin-hub432-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;width:100%;}
      .admin-hub432-card{border:1px solid rgba(238,211,139,.24);background:linear-gradient(145deg,rgba(238,211,139,.14),rgba(20,66,51,.48));color:var(--cream);border-radius:24px;min-height:150px;padding:16px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;box-shadow:0 16px 32px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08);cursor:pointer;transition:transform .16s ease, border-color .16s ease, filter .16s ease;}
      .admin-hub432-card:hover,.admin-hub432-card:active{transform:translateY(-2px);border-color:rgba(238,211,139,.6);filter:brightness(1.06);}
      .admin-hub432-icon{width:54px;height:54px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#f6d46f,#83642b);font-size:1.7rem;box-shadow:0 10px 18px rgba(0,0,0,.25);}
      .admin-hub432-card b{font-size:1.02rem;line-height:1.16;display:block;}
      .admin-hub432-card small{font-size:.82rem;line-height:1.28;color:var(--muted);display:block;max-width:100%;}
      .admin432-topnav{display:flex;gap:7px;align-items:center;flex-wrap:wrap;}
      .admin432-topnav button{border:1px solid rgba(238,211,139,.22);background:rgba(255,255,255,.055);color:var(--cream);border-radius:14px;padding:9px 12px;}
      .admin432-topnav button:disabled{opacity:.35;}
      .admin432-current{color:var(--muted);font-size:.9rem;}
      .admin432-subbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 14px;padding:10px;border:1px solid rgba(238,211,139,.16);border-radius:18px;background:rgba(255,255,255,.025);}
      .admin432-subbar button{border:1px solid rgba(238,211,139,.22);background:rgba(255,255,255,.055);color:var(--cream);border-radius:14px;padding:9px 12px;}
      .admin432-title{display:flex;align-items:center;gap:10px;min-width:0;}
      .admin432-title .admin-hub432-icon{width:42px;height:42px;font-size:1.35rem;flex:0 0 auto;}
      .admin432-title span:last-child{overflow-wrap:anywhere;}
      .pull-refresh-hint{position:fixed;left:50%;top:12px;transform:translateX(-50%) translateY(-20px);background:rgba(7,18,14,.96);border:1px solid rgba(238,211,139,.35);color:var(--cream);padding:8px 13px;border-radius:999px;opacity:0;pointer-events:none;z-index:99999;transition:.18s ease;box-shadow:0 12px 26px rgba(0,0,0,.35);}
      .pull-refresh-hint.show{opacity:1;transform:translateX(-50%) translateY(0);}
      @media(max-width:980px){.admin-hub432-grid{grid-template-columns:repeat(3,minmax(0,1fr));}}
      @media(max-width:720px){
        html,body{max-width:100%!important;overflow-x:hidden!important;}
        .admin{padding:10px!important;width:100%!important;max-width:100%!important;}
        .topbar{position:sticky!important;top:0!important;z-index:100!important;background:rgba(7,18,14,.98)!important;border-radius:0 0 20px 20px!important;margin:-10px -10px 12px!important;padding:10px!important;gap:8px!important;}
        .brand img{width:46px!important;height:46px!important;}.brand b{font-size:1rem!important}.brand span{font-size:.72rem!important}
        .admin-actions{display:grid!important;grid-template-columns:1fr 1fr!important;width:100%!important;gap:8px!important;}
        .admin-actions > a,.admin-actions > button{width:100%!important;min-height:40px!important;text-align:center!important;justify-content:center!important;}
        .admin432-topnav{grid-column:1/-1;display:grid!important;grid-template-columns:1fr 1fr 1fr!important;width:100%!important;gap:7px!important;}
        .admin432-current{grid-column:1/-1;text-align:center;}
        .admin-hub432-head{padding:14px;border-radius:22px;margin-bottom:12px;}
        .admin-hub432-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
        .admin-hub432-card{min-height:128px;padding:12px;border-radius:21px;}
        .admin-hub432-icon{width:45px;height:45px;font-size:1.35rem;border-radius:15px;}
        .admin-hub432-card b{font-size:.93rem;}.admin-hub432-card small{font-size:.76rem;}
        .panel{padding:12px!important;border-radius:22px!important;margin:0 0 12px!important;max-width:100%!important;overflow:hidden!important;}
        .section-head h2{font-size:1.24rem!important;}
        .section-head p,.legal-block,.muted{overflow-wrap:anywhere!important;}
        .admin432-subbar{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:7px!important;}
        .admin432-subbar button{width:100%!important;font-size:.84rem!important;}
        .edit-grid,.quick-price,.quick-grid,.customer-cloud-stats,.customer-mini-stats{display:grid!important;grid-template-columns:1fr!important;gap:10px!important;max-width:100%!important;}
        .toolbar{display:grid!important;grid-template-columns:1fr!important;gap:9px!important;width:100%!important;}
        input,textarea,select,button,.secondary,.primary,.danger{max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;}
        .table-wrap{width:100%!important;max-width:100%!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-x pan-y!important;border-radius:16px!important;}
        .table{min-width:620px!important;max-width:none!important;table-layout:auto!important;}
        .table th,.table td{font-size:.88rem!important;line-height:1.25!important;white-space:normal!important;overflow-wrap:anywhere!important;}
        #menuAdmin .table{min-width:680px!important;}
        #eventsAdmin .table{min-width:620px!important;}
        .customer-detail-card,.form-card,.legal-block{max-width:100%!important;overflow:hidden!important;}
        .customer-detail-card *{overflow-wrap:anywhere!important;}
      }
      @media(max-width:390px){.admin-hub432-grid{grid-template-columns:1fr;}.table{min-width:560px!important;}#menuAdmin .table{min-width:640px!important;}}
    `;
    document.head.appendChild(st);
  }

  function installTopNav(){
    const actions=$('.admin-actions'); if(!actions || $('#admin432TopNav')) return;
    const nav=document.createElement('div'); nav.id='admin432TopNav'; nav.className='admin432-topnav';
    nav.innerHTML='<button id="admin432Back" type="button">‹ Back</button><button id="admin432Home" type="button">⌂ Home</button><button id="admin432Forward" type="button">Forward ›</button><span id="admin432Current" class="admin432-current">Dashboard</span>';
    actions.prepend(nav);
    $('#admin432Back').onclick=goBack; $('#admin432Home').onclick=()=>openPanel('dashboardPanel'); $('#admin432Forward').onclick=goForward;
    updateNav();
  }
  function updateNav(){
    $('#admin432Back')?.toggleAttribute('disabled', backStack.length===0);
    $('#admin432Forward')?.toggleAttribute('disabled', forwardStack.length===0);
    const c=$('#admin432Current'); if(c) c.textContent=titleFor(current);
  }

  function renderDashboard(){
    const p=$('#dashboardPanel'); if(!p) return;
    p.classList.remove('hidden');
    p.innerHTML=`<div class="admin-hub432"><div class="admin-hub432-head"><h2>Admin Dashboard</h2><p>Choose a module. Each module opens its own clean page with Back, Home and Forward navigation.</p></div><div class="admin-hub432-grid">${modules.map(m=>`<button type="button" class="admin-hub432-card" data-admin432-open="${m.id}"><span class="admin-hub432-icon">${m.icon}</span><b>${esc(m.title)}</b><small>${esc(m.note)}</small></button>`).join('')}</div></div>`;
    $$('[data-admin432-open]', p).forEach(b=>b.onclick=()=>openPanel(b.dataset.admin432Open));
  }

  function decoratePanel(id){
    if(id==='dashboardPanel') return;
    const p=document.getElementById(id); if(!p) return;
    if(!p.dataset.admin432Decorated){
      p.dataset.admin432Decorated='1';
      const bar=document.createElement('div'); bar.className='admin432-subbar';
      bar.innerHTML='<button type="button" data-admin432-back>‹ Back</button><button type="button" data-admin432-home>⌂ Dashboard</button><button type="button" data-admin432-forward>Forward ›</button>';
      p.insertBefore(bar, p.firstChild);
      bar.querySelector('[data-admin432-back]').onclick=goBack;
      bar.querySelector('[data-admin432-home]').onclick=()=>openPanel('dashboardPanel');
      bar.querySelector('[data-admin432-forward]').onclick=goForward;
      const h=p.querySelector('.section-head h2');
      if(h && !h.dataset.admin432Title){ h.dataset.admin432Title='1'; h.innerHTML=`<span class="admin432-title"><span class="admin-hub432-icon">${iconFor(id)}</span><span>${esc(h.textContent)}</span></span>`; }
    }
  }

  function showOnly(id){
    $$('.panel').forEach(p=>{ if(p.id==='cloudAdminGate') return; p.classList.toggle('hidden', p.id!==id); });
    current=id; updateNav(); decoratePanel(id);
    if(id==='dashboardPanel') renderDashboard();
    try{ if(id==='customersPanel' && typeof window.renderCustomers==='function') setTimeout(()=>window.renderCustomers(true),80); }catch(e){}
    try{ if(id==='sushiPanel' && typeof window.renderSushiAdmin==='function') setTimeout(()=>window.renderSushiAdmin(),80); }catch(e){}
    const el=document.getElementById(id); if(el) setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),20);
  }
  function openPanel(id){ if(!id || !document.getElementById(id)) return; if(id!==current){ backStack.push(current); forwardStack=[]; } showOnly(id); }
  function goBack(){ if(!backStack.length) return; const prev=backStack.pop(); forwardStack.push(current); showOnly(prev); }
  function goForward(){ if(!forwardStack.length) return; const next=forwardStack.pop(); backStack.push(current); showOnly(next); }
  function step(dir){ const order=['dashboardPanel',...modules.map(m=>m.id)]; const idx=Math.max(0, order.indexOf(current)); openPanel(order[(idx+dir+order.length)%order.length]); }

  function installPullRefresh(){
    if(window.__adminPullRefresh432) return; window.__adminPullRefresh432=true;
    let startY=0, active=false; const hint=document.createElement('div'); hint.className='pull-refresh-hint'; hint.textContent='Release to refresh'; document.body.appendChild(hint);
    document.addEventListener('touchstart',e=>{ if(window.scrollY<=2){ active=true; startY=e.touches[0].clientY; } },{passive:true});
    document.addEventListener('touchmove',e=>{ if(!active) return; const dy=e.touches[0].clientY-startY; hint.classList.toggle('show', dy>80); },{passive:true});
    document.addEventListener('touchend',e=>{ if(!active) return; const dy=(e.changedTouches[0]?.clientY||0)-startY; active=false; hint.classList.remove('show'); if(dy>105 && window.scrollY<=10) location.reload(); },{passive:true});
  }
  function installSwipe(){
    if(window.__adminSwipe432) return; window.__adminSwipe432=true;
    let sx=0, sy=0;
    document.addEventListener('touchstart',e=>{ const t=e.touches[0]; sx=t.clientX; sy=t.clientY; },{passive:true});
    document.addEventListener('touchend',e=>{ const t=e.changedTouches[0]; if(!t) return; if(e.target.closest?.('.table-wrap,.table,input,textarea,select,button,a,.form-card,.legal-block,.customer-detail-card')) return; const dx=t.clientX-sx, dy=t.clientY-sy; if(Math.abs(dx)>115 && Math.abs(dx)>Math.abs(dy)*1.8){ dx<0 ? step(1) : step(-1); } },{passive:true});
  }

  function activateHub(){
    if(!unlocked()) return;
    installTopNav();
    window.showPanel = openPanel;
    showOnly('dashboardPanel');
  }
  function install(){
    injectStyles(); installPullRefresh(); installSwipe();
    // Override any previous unstable admin layout after all older scripts finish.
    setTimeout(activateHub, 650);
    setTimeout(activateHub, 1500);
    setTimeout(activateHub, 2600);
    new MutationObserver(()=>{ if(unlocked()) setTimeout(activateHub,80); }).observe(document.body,{attributes:true,attributeFilter:['class']});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install); else install();
})();
