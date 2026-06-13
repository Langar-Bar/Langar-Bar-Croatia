// Langar Admin V4.3.3 — stable clean admin hub without swipe navigation
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const modules=[
    {id:'quickPricePanel',icon:'💶',title:'Quick Price Update',note:'Fast price edit'},
    {id:'menuPanel',icon:'📋',title:'Menu Manager',note:'Items, ingredients, availability'},
    {id:'ordersPanel',icon:'🧾',title:'Orders / Delivery',note:'Online orders'},
    {id:'reservationsPanel',icon:'📅',title:'Reservations',note:'Table and time requests'},
    {id:'customersPanel',icon:'👥',title:'Customers & Rewards',note:'Profiles, credit, cards, history'},
    {id:'referralsPanel',icon:'🔗',title:'Referral Rewards',note:'Invite rules and rewards'},
    {id:'notificationsPanel',icon:'✉️',title:'Notifications / Inbox',note:'Messages and campaigns'},
    {id:'experiencePanel',icon:'✨',title:'Experience Tools',note:'Surprise, polls, sales stats'},
    {id:'eventsPanel',icon:'🎟️',title:'Event Manager',note:'Events and interests'},
    {id:'sushiPanel',icon:'🍣',title:'Sushi Pre-orders',note:'Confirm, ready, reject'},
    {id:'baristaPanel',icon:'☕',title:'Barista Questions',note:'Coffee questions'},
    {id:'feedbackPanel',icon:'⭐',title:'Feedback / Reviews',note:'Reviews and replies'},
    {id:'galleryPanel',icon:'🖼️',title:'Gallery Manager',note:'Photos and categories'},
    {id:'settingsPanel',icon:'⚙️',title:'Settings / Remaris',note:'Rules and integrations'}
  ];
  const order=['dashboardPanel',...modules.map(m=>m.id)];
  let current='dashboardPanel';
  let backStack=[];
  let forwardStack=[];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isUnlocked=()=>document.body.classList.contains('admin-unlocked');
  const info=id=>id==='dashboardPanel'?{icon:'🏠',title:'Dashboard'}:(modules.find(m=>m.id===id)||{icon:'▫️',title:id});

  function styles(){
    if($('#adminStable433Styles')) return;
    const st=document.createElement('style'); st.id='adminStable433Styles';
    st.textContent=`
      body.admin-unlocked .admin-grid{display:block!important;max-width:1180px;margin:0 auto;}
      body.admin-unlocked .side{display:none!important;}
      body.admin-unlocked main{width:100%!important;min-width:0!important;}
      body.admin-unlocked .panel.hidden{display:none!important;}
      body.admin-unlocked .panel{width:100%!important;max-width:100%!important;min-width:0!important;overflow:hidden!important;}
      .admin433-topnav{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
      .admin433-topnav button{border:1px solid rgba(238,211,139,.24);background:rgba(255,255,255,.06);color:var(--cream);border-radius:14px;padding:9px 13px;}
      .admin433-topnav button:disabled{opacity:.35;}
      .admin433-current{color:var(--muted);font-size:.9rem;}
      .admin433-hub-head{border:1px solid rgba(238,211,139,.22);background:linear-gradient(145deg,rgba(238,211,139,.10),rgba(20,66,51,.34));border-radius:26px;padding:20px;margin-bottom:16px;}
      .admin433-hub-head h2{margin:0 0 6px;font-size:clamp(1.65rem,4vw,2.35rem);}
      .admin433-hub-head p{margin:0;color:var(--muted);line-height:1.45;}
      .admin433-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;width:100%;}
      .admin433-card{border:1px solid rgba(238,211,139,.24);background:linear-gradient(145deg,rgba(238,211,139,.14),rgba(20,66,51,.48));color:var(--cream);border-radius:24px;min-height:150px;padding:16px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;box-shadow:0 16px 32px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.08);cursor:pointer;}
      .admin433-card:active{transform:scale(.99);}
      .admin433-icon{width:54px;height:54px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#f6d46f,#83642b);font-size:1.7rem;box-shadow:0 10px 18px rgba(0,0,0,.25);}
      .admin433-card b{font-size:1.02rem;line-height:1.15;display:block;}
      .admin433-card small{font-size:.82rem;line-height:1.28;color:var(--muted);display:block;}
      .admin433-subbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 14px;padding:10px;border:1px solid rgba(238,211,139,.16);border-radius:18px;background:rgba(255,255,255,.025);}
      .admin433-subbar button{border:1px solid rgba(238,211,139,.24);background:rgba(255,255,255,.06);color:var(--cream);border-radius:14px;padding:9px 13px;}
      .admin433-subbar button:disabled{opacity:.35;}
      .admin433-module-title{display:flex;align-items:center;gap:10px;min-width:0;}
      .admin433-module-title .admin433-icon{width:42px;height:42px;font-size:1.25rem;border-radius:15px;flex:0 0 auto;}
      .admin433-module-title span:last-child{overflow-wrap:anywhere;}
      .admin-toast-stack{position:fixed;left:14px;right:14px;bottom:14px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;}
      .admin-toast{border:1px solid rgba(238,211,139,.25);background:rgba(7,18,14,.96);color:var(--cream);border-radius:16px;padding:12px 14px;box-shadow:0 18px 40px rgba(0,0,0,.4);}
      .pull-refresh-hint{position:fixed;left:50%;top:12px;transform:translateX(-50%) translateY(-20px);background:rgba(7,18,14,.96);border:1px solid rgba(238,211,139,.35);color:var(--cream);padding:8px 13px;border-radius:999px;opacity:0;pointer-events:none;z-index:99999;transition:.18s ease;box-shadow:0 12px 26px rgba(0,0,0,.35);}
      .pull-refresh-hint.show{opacity:1;transform:translateX(-50%) translateY(0);}
      @media(max-width:980px){.admin433-grid{grid-template-columns:repeat(3,minmax(0,1fr));}}
      @media(max-width:720px){
        html,body{max-width:100%!important;overflow-x:hidden!important;}
        .admin{width:100%!important;max-width:100%!important;padding:10px!important;}
        .topbar{position:sticky!important;top:0!important;z-index:100!important;background:rgba(7,18,14,.98)!important;border-radius:0 0 20px 20px!important;margin:-10px -10px 12px!important;padding:10px!important;gap:8px!important;}
        .brand img{width:46px!important;height:46px!important}.brand b{font-size:1rem!important}.brand span{font-size:.72rem!important;line-height:1.15!important;}
        .admin-actions{display:grid!important;grid-template-columns:1fr 1fr!important;width:100%!important;gap:8px!important;}
        .admin-actions > a,.admin-actions > button{width:100%!important;min-height:40px!important;text-align:center!important;justify-content:center!important;}
        .admin433-topnav{grid-column:1/-1;display:grid!important;grid-template-columns:1fr 1fr 1fr!important;width:100%!important;gap:7px!important;}
        .admin433-current{grid-column:1/-1;text-align:center;}
        .admin433-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
        .admin433-card{min-height:126px;padding:12px;border-radius:21px;}
        .admin433-icon{width:45px;height:45px;font-size:1.35rem;border-radius:15px;}
        .admin433-card b{font-size:.93rem}.admin433-card small{font-size:.76rem;}
        .admin433-hub-head{padding:14px;border-radius:22px;}
        .panel{padding:12px!important;border-radius:22px!important;margin:0 0 12px!important;max-width:100%!important;overflow:hidden!important;}
        .section-head h2{font-size:1.22rem!important;}
        .section-head p,.legal-block,.muted{overflow-wrap:anywhere!important;}
        .admin433-subbar{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:7px!important;}
        .admin433-subbar button{width:100%!important;font-size:.83rem!important;}
        .edit-grid,.quick-price,.quick-grid,.customer-cloud-stats,.customer-mini-stats{display:grid!important;grid-template-columns:1fr!important;gap:10px!important;max-width:100%!important;}
        .toolbar{display:grid!important;grid-template-columns:1fr!important;gap:9px!important;width:100%!important;}
        input,textarea,select,button,.secondary,.primary,.danger{max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;}
        .table-wrap{width:100%!important;max-width:100%!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-x pan-y!important;border-radius:16px!important;}
        .table{min-width:620px!important;max-width:none!important;table-layout:auto!important;}
        .table th,.table td{font-size:.88rem!important;line-height:1.25!important;white-space:normal!important;overflow-wrap:anywhere!important;}
        #menuAdmin .table{min-width:680px!important;} #eventsAdmin .table{min-width:620px!important;}
        .customer-detail-card,.form-card,.legal-block{max-width:100%!important;overflow:hidden!important;}
        .customer-detail-card *{overflow-wrap:anywhere!important;}
      }
      @media(max-width:390px){.admin433-grid{grid-template-columns:1fr}.table{min-width:560px!important}#menuAdmin .table{min-width:640px!important}}
    `;
    document.head.appendChild(st);
  }

  function toast(msg){
    let s=$('.admin-toast-stack');
    if(!s){s=document.createElement('div');s.className='admin-toast-stack';document.body.appendChild(s);}
    const el=document.createElement('div'); el.className='admin-toast'; el.textContent=String(msg||'Done'); s.appendChild(el);
    setTimeout(()=>el.remove(),2600);
  }
  window.adminNotify=toast;
  window.alert=function(msg){toast(msg); console.log('Admin notice:',msg);};

  function renderHub(){
    const p=$('#dashboardPanel'); if(!p) return;
    p.innerHTML=`<div class="admin433-hub"><div class="admin433-hub-head"><h2>Admin Dashboard</h2><p>Choose a module. Each module opens its own clean page. Use Back, Home and Forward buttons — swipe navigation is disabled for stability.</p></div><div class="admin433-grid">${modules.map(m=>`<button type="button" class="admin433-card" data-open-module="${m.id}"><span class="admin433-icon">${m.icon}</span><b>${esc(m.title)}</b><small>${esc(m.note)}</small></button>`).join('')}</div></div>`;
    $$('[data-open-module]',p).forEach(b=>b.onclick=()=>openPanel(b.dataset.openModule));
  }

  function installTopNav(){
    const actions=$('.admin-actions'); if(!actions) return;
    let nav=$('#admin433TopNav');
    if(!nav){
      nav=document.createElement('div'); nav.id='admin433TopNav'; nav.className='admin433-topnav';
      nav.innerHTML='<button id="admin433Back" type="button">‹ Back</button><button id="admin433Home" type="button">⌂ Home</button><button id="admin433Forward" type="button">Forward ›</button><span id="admin433Current" class="admin433-current">Dashboard</span>';
      actions.prepend(nav);
      $('#admin433Back').onclick=goBack; $('#admin433Home').onclick=()=>openPanel('dashboardPanel'); $('#admin433Forward').onclick=goForward;
    }
    updateNav();
  }

  function updateNav(){
    $('#admin433Back')?.toggleAttribute('disabled',backStack.length===0);
    $('#admin433Forward')?.toggleAttribute('disabled',forwardStack.length===0);
    const lbl=$('#admin433Current'); if(lbl) lbl.textContent=info(current).title;
  }

  function decorate(id){
    if(id==='dashboardPanel') return;
    const p=document.getElementById(id); if(!p || p.dataset.admin433Decorated) return;
    p.dataset.admin433Decorated='1';
    const bar=document.createElement('div'); bar.className='admin433-subbar';
    bar.innerHTML='<button type="button" data-back>‹ Back</button><button type="button" data-home>⌂ Dashboard</button><button type="button" data-forward>Forward ›</button>';
    p.insertBefore(bar,p.firstChild);
    bar.querySelector('[data-back]').onclick=goBack;
    bar.querySelector('[data-home]').onclick=()=>openPanel('dashboardPanel');
    bar.querySelector('[data-forward]').onclick=goForward;
    const h=p.querySelector('.section-head h2');
    if(h && !h.dataset.admin433Title){
      const x=info(id); h.dataset.admin433Title='1'; h.innerHTML=`<span class="admin433-module-title"><span class="admin433-icon">${x.icon}</span><span>${esc(h.textContent)}</span></span>`;
    }
  }

  function wrapTables(root=document){
    $$('.table',root).forEach(t=>{
      if(t.parentElement?.classList.contains('table-wrap')) return;
      const w=document.createElement('div'); w.className='table-wrap'; t.parentNode.insertBefore(w,t); w.appendChild(t);
    });
  }

  function refreshPanelData(id){
    try{ if(id==='quickPricePanel' && typeof window.renderQuickPrices==='function') window.renderQuickPrices(); }catch(e){}
    try{ if(id==='menuPanel' && typeof window.renderMenuAdmin==='function') window.renderMenuAdmin(); }catch(e){}
    try{ if(id==='ordersPanel' && typeof window.renderOrders==='function') window.renderOrders(); }catch(e){}
    try{ if(id==='reservationsPanel' && typeof window.renderReservations==='function') window.renderReservations(); }catch(e){}
    try{ if(id==='customersPanel' && typeof window.renderCustomers==='function') window.renderCustomers(true); }catch(e){}
    try{ if(id==='notificationsPanel' && typeof window.renderNotifications==='function') window.renderNotifications(); }catch(e){}
    try{ if(id==='feedbackPanel' && typeof window.renderFeedbackAdmin==='function') window.renderFeedbackAdmin(); }catch(e){}
    try{ if(id==='eventsPanel' && typeof window.renderEventsAdmin==='function') window.renderEventsAdmin(); }catch(e){}
    try{ if(id==='sushiPanel' && typeof window.renderSushiAdmin==='function') window.renderSushiAdmin(); }catch(e){}
    try{ if(id==='baristaPanel' && typeof window.renderBaristaAdmin==='function') window.renderBaristaAdmin(); }catch(e){}
    try{ if(id==='experiencePanel' && typeof window.renderManualSalesAdmin==='function') window.renderManualSalesAdmin(); }catch(e){}
    try{ if(id==='galleryPanel' && typeof window.renderGalleryAdmin==='function') window.renderGalleryAdmin(); }catch(e){}
    setTimeout(()=>wrapTables(document.getElementById(id)||document),180);
  }

  function showOnly(id){
    const p=document.getElementById(id); if(!p) return;
    $$('.panel').forEach(x=>{ if(x.id==='cloudAdminGate') return; x.classList.toggle('hidden',x.id!==id); });
    current=id; updateNav();
    if(id==='dashboardPanel') renderHub(); else { decorate(id); refreshPanelData(id); }
    window.scrollTo({top:0,behavior:'auto'});
  }
  function openPanel(id){ if(!id || !document.getElementById(id)) return; if(id!==current){ backStack.push(current); forwardStack=[]; } showOnly(id); }
  function goBack(){ if(!backStack.length) return; const prev=backStack.pop(); forwardStack.push(current); showOnly(prev); }
  function goForward(){ if(!forwardStack.length) return; const next=forwardStack.pop(); backStack.push(current); showOnly(next); }
  window.showPanel=openPanel;
  window.renderAllAdmin=function(){ activate(); };

  function pullRefresh(){
    if(window.__adminPull433) return; window.__adminPull433=true;
    let start=0,active=false; const hint=document.createElement('div'); hint.className='pull-refresh-hint'; hint.textContent='Release to refresh'; document.body.appendChild(hint);
    document.addEventListener('touchstart',e=>{ if(window.scrollY<=2){active=true; start=e.touches[0].clientY;} },{passive:true});
    document.addEventListener('touchmove',e=>{ if(!active) return; const dy=e.touches[0].clientY-start; hint.classList.toggle('show',dy>85); },{passive:true});
    document.addEventListener('touchend',e=>{ if(!active) return; const dy=(e.changedTouches[0]?.clientY||0)-start; active=false; hint.classList.remove('show'); if(dy>115 && window.scrollY<=10) location.reload(); },{passive:true});
  }

  function activate(){
    if(!isUnlocked()) return;
    styles(); installTopNav();
    document.querySelector('.side')?.setAttribute('aria-hidden','true');
    showOnly('dashboardPanel');
  }
  function boot(){
    styles(); pullRefresh();
    setTimeout(activate,400); setTimeout(activate,1200);
    new MutationObserver(()=>{ if(isUnlocked()) setTimeout(activate,80); }).observe(document.body,{attributes:true,attributeFilter:['class']});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
