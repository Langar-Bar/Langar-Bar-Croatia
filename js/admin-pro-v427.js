// Langar Admin V4.2.7 — Modern Admin Hub, navigation, sushi simplification, activity history
(function(){
  'use strict';
  const CONFIG = { supabaseUrl:'https://fkanccgigogbxodiljqt.supabase.co', supabaseKey:'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7' };
  const client = window.supabase?.createClient ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth:{ persistSession:true, autoRefreshToken:true } }) : null;
  const $ = s=>document.querySelector(s);
  const $$ = s=>Array.from(document.querySelectorAll(s));
  const safe = v=>String(v||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const panels = [
    {id:'dashboardPanel', icon:'🏠', title:'Dashboard', note:'Admin home'},
    {id:'quickPricePanel', icon:'💶', title:'Quick Price Update', note:'Fast price edit'},
    {id:'menuPanel', icon:'📋', title:'Menu Manager', note:'Items, ingredients, availability'},
    {id:'ordersPanel', icon:'🧾', title:'Orders / Delivery', note:'Online order workflow'},
    {id:'reservationsPanel', icon:'📅', title:'Reservations', note:'Table/time requests'},
    {id:'customersPanel', icon:'👥', title:'Customers & Rewards', note:'Profiles, credit, cards, history'},
    {id:'referralsPanel', icon:'🔗', title:'Referral Rewards', note:'Invite rules and rewards'},
    {id:'notificationsPanel', icon:'✉️', title:'Notifications / Inbox', note:'Messages and campaigns'},
    {id:'experiencePanel', icon:'✨', title:'Experience Tools', note:'Surprise, polls, sales stats'},
    {id:'eventsPanel', icon:'🎟️', title:'Event Manager', note:'Events and interests'},
    {id:'sushiPanel', icon:'🍣', title:'Sushi Pre-orders', note:'Confirm, notify, demand'},
    {id:'baristaPanel', icon:'☕', title:'Barista Questions', note:'Coffee questions'},
    {id:'feedbackPanel', icon:'⭐', title:'Feedback / Reviews', note:'Positive public, negative admin'},
    {id:'galleryPanel', icon:'🖼️', title:'Gallery Manager', note:'Photos and categories'},
    {id:'settingsPanel', icon:'⚙️', title:'Settings / Remaris', note:'Rules and integrations'}
  ];
  let navStack=[]; let forwardStack=[]; let currentPanel='dashboardPanel';
  let suppressTrack=false;

  function ensureStyles(){
    if($('#adminPro427Styles')) return;
    const st=document.createElement('style'); st.id='adminPro427Styles'; st.textContent=`
      .admin-nav-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.admin-nav-btn{border:1px solid rgba(238,211,139,.24);background:rgba(255,255,255,.055);color:var(--cream);border-radius:14px;padding:9px 11px;cursor:pointer}.admin-nav-btn:disabled{opacity:.35;cursor:not-allowed}.admin-hub-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:12px}.admin-hub-card{border:1px solid rgba(238,211,139,.22);background:linear-gradient(145deg,rgba(238,211,139,.13),rgba(20,66,51,.44));color:var(--cream);border-radius:22px;padding:16px;text-align:left;min-height:122px;box-shadow:0 14px 28px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.08);cursor:pointer;transition:transform .18s ease, border-color .18s ease}.admin-hub-card:hover,.admin-hub-card:active{transform:translateY(-2px) scale(1.01);border-color:rgba(238,211,139,.55)}.admin-hub-card .hub-icon{display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:16px;background:rgba(238,211,139,.14);font-size:1.55rem;margin-bottom:10px;animation:adminIconPulse 2.8s ease-in-out infinite}.admin-hub-card b{display:block;font-size:1rem}.admin-hub-card small{display:block;color:var(--muted);line-height:1.35;margin-top:4px}.admin-pro-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}.admin-stat-card{border:1px solid rgba(238,211,139,.18);border-radius:18px;background:rgba(255,255,255,.035);padding:12px}.admin-stat-card span{font-size:1.25rem}.admin-stat-card b{display:block;font-size:1.4rem;margin-top:4px}.admin-stat-card small{color:var(--muted)}@keyframes adminIconPulse{0%,100%{filter:brightness(1);transform:scale(1)}50%{filter:brightness(1.25);transform:scale(1.06)}}.admin-toast-stack{position:fixed;right:14px;bottom:14px;z-index:99999;display:flex;flex-direction:column;gap:8px}.admin-toast{border:1px solid rgba(238,211,139,.25);background:rgba(7,18,14,.96);color:var(--cream);border-radius:16px;padding:12px 14px;max-width:360px;box-shadow:0 18px 40px rgba(0,0,0,.4);animation:toastIn .22s ease}.admin-toast.ok{border-color:rgba(136,255,177,.35)}.admin-toast.error{border-color:rgba(255,120,120,.45)}@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.sushi-card-list{display:grid;gap:12px}.sushi-admin-card{border:1px solid rgba(238,211,139,.22);border-radius:22px;background:rgba(255,255,255,.035);padding:14px}.sushi-admin-card .sushi-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.sushi-badge{display:inline-flex;border:1px solid rgba(238,211,139,.26);border-radius:999px;padding:4px 9px;color:var(--gold);font-size:.78rem}.sushi-menu-tools{margin-bottom:14px}.sushi-menu-row{display:grid;grid-template-columns:1.4fr 100px 80px auto;gap:8px;align-items:end;border-bottom:1px solid rgba(238,211,139,.12);padding:8px 0}.activity-log-box{margin-top:12px}.activity-row{border:1px solid rgba(238,211,139,.16);border-radius:14px;padding:10px;margin:7px 0;background:rgba(255,255,255,.025)}.admin-action-center{border:1px solid rgba(238,211,139,.20);background:rgba(238,211,139,.06);border-radius:18px;padding:10px;margin:12px 0}.admin-action-center h3{margin:0 0 6px}.admin-action-center ul{margin:0;padding-left:18px}.admin-action-center li{margin:4px 0;color:var(--muted)}
      @media(max-width:760px){.admin-hub-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.admin-hub-card{padding:13px;min-height:112px;border-radius:20px}.admin-hub-card .hub-icon{width:40px;height:40px;font-size:1.35rem}.admin-pro-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.admin-nav-actions{width:100%;justify-content:space-between}.sushi-menu-row{grid-template-columns:1fr 90px}.sushi-menu-row button,.sushi-menu-row label:nth-child(3){grid-column:span 2}.admin-toast-stack{left:10px;right:10px;bottom:10px}.admin-toast{max-width:none}.side{display:none}.admin-grid{grid-template-columns:1fr!important}.panel{animation:panelFade .18s ease}@keyframes panelFade{from{opacity:.7;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}}
    `; document.head.appendChild(st);
  }

  function toast(msg,type='ok'){
    let stack=$('.admin-toast-stack');
    if(!stack){stack=document.createElement('div');stack.className='admin-toast-stack';document.body.appendChild(stack);}
    const el=document.createElement('div'); el.className='admin-toast '+type; el.textContent=String(msg||'Done.'); stack.appendChild(el);
    const logs=JSON.parse(localStorage.getItem('langar_admin_action_log')||'[]'); logs.unshift({message:String(msg||'Done'),type,createdAt:new Date().toISOString()}); localStorage.setItem('langar_admin_action_log',JSON.stringify(logs.slice(0,30)));
    setTimeout(()=>{el.style.opacity='0';el.style.transform='translateY(6px)';setTimeout(()=>el.remove(),250);},3200);
  }
  window.adminNotify=toast;
  const nativeAlert=window.alert.bind(window);
  window.alert=function(msg){ toast(msg,'ok'); console.log('Admin notice:',msg); };

  function panelTitle(id){return panels.find(p=>p.id===id)?.title||id;}
  function setNavButtons(){
    $('#adminBackBtn')?.toggleAttribute('disabled',navStack.length===0);
    $('#adminForwardBtn')?.toggleAttribute('disabled',forwardStack.length===0);
    const lbl=$('#adminCurrentPanelLabel'); if(lbl) lbl.textContent=panelTitle(currentPanel);
  }
  function showPanelCore(id){
    const old=window.__originalShowPanelFor427 || window.showPanel;
    if(typeof old==='function') old(id); else $$('.panel').forEach(p=>p.classList.toggle('hidden',p.id!==id));
    currentPanel=id; setNavButtons();
    const el=document.getElementById(id); if(el) setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),40);
    if(id==='dashboardPanel') setTimeout(renderDashboardHub,120);
  }
  function showTracked(id){
    if(!id || id===currentPanel){showPanelCore(id); return;}
    if(!suppressTrack){navStack.push(currentPanel); forwardStack=[];}
    showPanelCore(id);
  }
  function back(){ if(!navStack.length) return; const prev=navStack.pop(); forwardStack.push(currentPanel); suppressTrack=true; showPanelCore(prev); suppressTrack=false; }
  function forward(){ if(!forwardStack.length) return; const next=forwardStack.pop(); navStack.push(currentPanel); suppressTrack=true; showPanelCore(next); suppressTrack=false; }
  function nextPanel(dir){const i=panels.findIndex(p=>p.id===currentPanel); if(i<0) return; const next=panels[(i+dir+panels.length)%panels.length]; showTracked(next.id);}

  function installNavigation(){
    if(window.__adminProNavInstalled) return; window.__adminProNavInstalled=true;
    window.__originalShowPanelFor427=window.showPanel;
    window.showPanel=showTracked;
    const actions=$('.admin-actions');
    if(actions && !$('#adminBackBtn')){
      const wrap=document.createElement('div'); wrap.className='admin-nav-actions';
      wrap.innerHTML=`<button id="adminBackBtn" class="admin-nav-btn" type="button">‹ Back</button><button id="adminHomeBtn" class="admin-nav-btn" type="button">⌂ Home</button><button id="adminForwardBtn" class="admin-nav-btn" type="button">Forward ›</button><small id="adminCurrentPanelLabel" class="muted">Dashboard</small>`;
      actions.prepend(wrap);
      $('#adminBackBtn').onclick=back; $('#adminForwardBtn').onclick=forward; $('#adminHomeBtn').onclick=()=>showTracked('dashboardPanel');
    }
    let startX=0,startY=0;
    document.querySelector('main')?.addEventListener('touchstart',e=>{const t=e.touches[0];startX=t.clientX;startY=t.clientY;},{passive:true});
    document.querySelector('main')?.addEventListener('touchend',e=>{const t=e.changedTouches[0]; const dx=t.clientX-startX, dy=t.clientY-startY; if(Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.4){ if(dx<0) nextPanel(1); else nextPanel(-1); }},{passive:true});
    setNavButtons();
  }

  async function counts(){
    if(!client) return {customers:'-',inbox:'-',sushi:'-',cards:'-'};
    try{
      const [profiles,inbox,sushi,cards]=await Promise.all([
        client.from('profiles').select('id',{count:'exact',head:true}),
        client.from('inbox_messages').select('id',{count:'exact',head:true}),
        client.from('sushi_preorders').select('id',{count:'exact',head:true}),
        client.from('reward_cards').select('id',{count:'exact',head:true})
      ]);
      return {customers:profiles.count||0,inbox:inbox.count||0,sushi:sushi.count||0,cards:cards.count||0};
    }catch{return {customers:'-',inbox:'-',sushi:'-',cards:'-'};}
  }
  async function renderDashboardHub(){
    const d=$('#adminDashboard'); if(!d) return;
    const c=await counts();
    const last=JSON.parse(localStorage.getItem('langar_admin_action_log')||'[]').slice(0,5);
    d.innerHTML=`
      <div class="admin-pro-stats">
        <button class="admin-stat-card" data-admin-go="customersPanel"><span>👥</span><b>${c.customers}</b><small>Cloud Customers</small></button>
        <button class="admin-stat-card" data-admin-go="notificationsPanel"><span>✉️</span><b>${c.inbox}</b><small>Cloud Inbox</small></button>
        <button class="admin-stat-card" data-admin-go="sushiPanel"><span>🍣</span><b>${c.sushi}</b><small>Sushi Pre-orders</small></button>
        <button class="admin-stat-card" data-admin-go="customersPanel"><span>🎁</span><b>${c.cards}</b><small>Reward Cards</small></button>
      </div>
      <div class="admin-action-center"><h3>Admin Action Center</h3>${last.length?`<ul>${last.map(x=>`<li>${safe(new Date(x.createdAt).toLocaleTimeString())} — ${safe(x.message)}</li>`).join('')}</ul>`:'<p class="muted">Recent admin confirmations will appear here.</p>'}</div>
      <div class="section-head"><h2>Admin Modules</h2><p>Tap a module. Use Back / Forward or swipe left/right on mobile.</p></div>
      <div class="admin-hub-grid">${panels.filter(p=>p.id!=='dashboardPanel').map(p=>`<button class="admin-hub-card" data-admin-go="${p.id}"><span class="hub-icon">${p.icon}</span><b>${p.title}</b><small>${p.note}</small></button>`).join('')}</div>`;
    $$('[data-admin-go]').forEach(b=>b.onclick=()=>showTracked(b.dataset.adminGo));
  }

  function sushiItems(){
    try{return JSON.parse(localStorage.getItem('langar_sushi_items')||'[]');}catch{return []}
  }
  function saveSushiItems(items){localStorage.setItem('langar_sushi_items',JSON.stringify(items)); try{window.adminNotify('Sushi menu saved locally. It is used by the customer sushi reservation form.','ok')}catch(e){} }
  function renderSushiMenuEditor(){
    const items=sushiItems().length?sushiItems():[
      {id:'SUSHI-MIX',name:{en:'Sushi Mix Box',hr:'Sushi Mix Box'},price:'from €12.00',active:true},
      {id:'SUSHI-SALMON',name:{en:'Salmon Sushi Box',hr:'Salmon Sushi Box'},price:'from €14.00',active:true},
      {id:'SUSHI-VEGGIE',name:{en:'Veggie Sushi Box',hr:'Veggie Sushi Box'},price:'from €10.00',active:true}
    ];
    if(!sushiItems().length) saveSushiItems(items);
    return `<div class="legal-block sushi-menu-tools"><h3>🍣 Sushi pre-order menu</h3><p class="muted">Edit sushi boxes available for reservation. The customer sees only active items.</p><div id="sushiMenuRows">${items.map((it,idx)=>`<div class="sushi-menu-row" data-sushi-item-row="${idx}"><label>Name EN<input data-sm="nameEn" value="${safe(it.name?.en||'')}"></label><label>Price<input data-sm="price" value="${safe(it.price||'')}"></label><label>Active<select data-sm="active"><option value="true" ${it.active!==false?'selected':''}>Active</option><option value="false" ${it.active===false?'selected':''}>Hidden</option></select></label><button class="danger" data-del-sushi-item="${idx}">Delete</button></div>`).join('')}</div><div class="toolbar"><button class="secondary" id="addSushiMenuItem">Add sushi item</button><button class="primary" id="saveSushiMenuItems">Save sushi menu</button></div></div>`;
  }
  async function requireAdmin(){
    if(!client) throw new Error('Supabase SDK not loaded');
    const {data}=await client.auth.getSession();
    if(!data.session?.user) throw new Error('Please login as Cloud Admin first.');
    return data.session.user;
  }
  function mapItems(row){
    const items=row.sushi_preorder_items||[]; if(!items.length)return '<small>No item row</small>';
    return items.map(i=>`${safe(i.item_name_en||i.item_name_hr||'Sushi')} × ${safe(i.quantity||1)}`).join('<br>');
  }
  async function setSushiStatus(row,status,button){
    try{
      button && (button.disabled=true);
      const admin=await requireAdmin();
      const {error}=await client.from('sushi_preorders').update({status,handled_by:admin.id,updated_at:new Date().toISOString()}).eq('id',row.id);
      if(error) throw error;
      if(row.user_id){
        const isReady=status==='ready', isRejected=status==='rejected';
        const title_en=isReady?'Your sushi is ready':isRejected?'Sushi pre-order update':'Sushi pre-order confirmed';
        const body_en=isReady?'Your sushi is ready for the selected service mode. Please come to pick it up, wait for delivery, or ask our staff in the café.':isRejected?'Sorry, this sushi pre-order cannot be confirmed. Please contact Langar Bar or choose another date/type.':`Your sushi pre-order is confirmed for ${row.requested_date||''} ${(row.requested_time||'').slice(0,5)}.`;
        const title_hr=isReady?'Vaš sushi je spreman':isRejected?'Obavijest o sushi rezervaciji':'Sushi rezervacija potvrđena';
        const body_hr=isReady?'Vaš sushi je spreman prema odabranom načinu usluge. Molimo dođite po njega, pričekajte dostavu ili se javite osoblju u kafiću.':isRejected?'Nažalost, ovu sushi rezervaciju ne možemo potvrditi. Kontaktirajte Langar Bar ili odaberite drugi datum/tip.':`Vaša sushi rezervacija potvrđena je za ${row.requested_date||''} ${(row.requested_time||'').slice(0,5)}.`;
        await client.from('inbox_messages').insert({user_id:row.user_id,type:'sushi',title_en,body_en,title_hr,body_hr,is_read:false,data:{sushi_preorder_id:row.id,status,campaign_key:'sushi_'+status+'_'+row.id+'_'+Date.now()}});
      }
      toast(status==='confirmed'?'Sushi reservation confirmed and customer Inbox updated.':status==='ready'?'Ready message sent to customer Inbox.':'Sushi reservation updated.','ok');
      await renderProSushiAdmin();
    }catch(err){toast('Sushi action error: '+(err.message||err),'error');}
    finally{button && (button.disabled=false);}
  }
  async function renderProSushiAdmin(){
    const box=$('#sushiAdmin'); if(!box || !client) return;
    box.innerHTML='<p class="muted">Loading Cloud sushi pre-orders...</p>';
    try{
      await requireAdmin();
      const {data,error}=await client.from('sushi_preorders').select('id,user_id,preorder_number,status,fulfillment_type,requested_date,requested_time,customer_name,customer_phone,delivery_address,note,total,created_at,sushi_preorder_items(item_name_en,item_name_hr,quantity,total_price)').order('created_at',{ascending:false}).limit(100);
      if(error) throw error;
      const rows=data||[]; const demand={}; rows.forEach(r=>(r.sushi_preorder_items||[]).forEach(i=>{const k=i.item_name_en||i.item_name_hr||'Sushi'; demand[k]=(demand[k]||0)+(+i.quantity||1)}));
      box.innerHTML=`${renderSushiMenuEditor()}<div class="admin-mobile-note"><b>Sushi workflow simplified:</b> admin confirms a valid request. Customer receives confirmation in Inbox. Later, use <b>Send ready message</b> when it is actually ready. Automatic reminders will be connected in the notification automation step.</div>${rows.length?`<div class="sushi-card-list">${rows.map(r=>`<article class="sushi-admin-card"><span class="sushi-badge">${safe(r.status||'pending')}</span><h3>${safe(r.preorder_number||r.id.slice(0,8))}</h3><p>${mapItems(r)}<br><small>Total: €${Number(r.total||0).toFixed(2)}</small></p><p><b>Date:</b> ${safe(r.requested_date||'')} ${(r.requested_time||'').slice(0,5)}<br><b>Customer:</b> ${safe(r.customer_name||'Guest')} · ${safe(r.customer_phone||'')}<br><b>Mode:</b> ${safe(r.fulfillment_type||'')} ${r.delivery_address?'· '+safe(r.delivery_address):''}<br><b>Note:</b> ${safe(r.note||'-')}</p><div class="sushi-actions"><button class="primary" data-sushi-confirm="${r.id}">Confirm + notify</button><button class="secondary" data-sushi-ready="${r.id}">Send ready message</button><button class="danger" data-sushi-reject="${r.id}">Reject + notify</button></div></article>`).join('')}</div><div class="legal-block"><b>Demand insight</b><p>${Object.entries(demand).map(([k,v])=>`${safe(k)}: ${v}`).join('<br>')||'No demand yet.'}</p></div>`:'<p class="muted">No Cloud sushi pre-orders yet.</p>'}`;
      $('#addSushiMenuItem')?.addEventListener('click',()=>{const items=sushiItems(); items.push({id:'SUSHI-'+Date.now(),name:{en:'New Sushi Box',hr:'New Sushi Box'},price:'from €0.00',active:true}); saveSushiItems(items); renderProSushiAdmin();});
      $('#saveSushiMenuItems')?.addEventListener('click',()=>{const items=sushiItems(); $$('[data-sushi-item-row]').forEach(row=>{const idx=+row.dataset.sushiItemRow; if(!items[idx])return; items[idx].name={en:row.querySelector('[data-sm=nameEn]').value,hr:row.querySelector('[data-sm=nameEn]').value}; items[idx].price=row.querySelector('[data-sm=price]').value; items[idx].active=row.querySelector('[data-sm=active]').value==='true';}); saveSushiItems(items);});
      $$('[data-del-sushi-item]').forEach(b=>b.onclick=()=>{const items=sushiItems(); items.splice(+b.dataset.delSushiItem,1); saveSushiItems(items); renderProSushiAdmin();});
      rows.forEach(r=>{ $(`[data-sushi-confirm="${CSS.escape(r.id)}"]`)?.addEventListener('click',e=>setSushiStatus(r,'confirmed',e.currentTarget)); $(`[data-sushi-ready="${CSS.escape(r.id)}"]`)?.addEventListener('click',e=>setSushiStatus(r,'ready',e.currentTarget)); $(`[data-sushi-reject="${CSS.escape(r.id)}"]`)?.addEventListener('click',e=>setSushiStatus(r,'rejected',e.currentTarget)); });
    }catch(err){ box.innerHTML=`<p style="color:#ffb1a8">Cloud sushi error: ${safe(err.message||err)}</p>`; }
  }

  async function injectActivityHistory(){
    const detail=$('#cloudCustomerDetail'); if(!detail || !client) return;
    if(detail.dataset.activityInjected==='1') return;
    const txt=detail.textContent||''; const m=txt.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i); if(!m) return;
    const userId=m[0]; detail.dataset.activityInjected='1';
    const wrap=document.createElement('div'); wrap.className='legal-block activity-log-box'; wrap.innerHTML=`<h3>Customer Visit / Order History</h3><p class="muted">Scan QR/barcode later, or manually add a visit now. This is the base for personalized birthday surprises and favorite-item marketing.</p><div class="edit-grid"><label>Item / order<input id="activityItem" placeholder="Cappuccino, Sushi Mix, Taco..."></label><label>Amount €<input id="activityAmount" type="number" step="0.01" value="0"></label></div><label>Note<textarea id="activityNote" placeholder="Manual café visit, POS receipt, preference..."></textarea></label><button class="primary" id="saveActivityLog">Save customer activity</button><div id="activityLogRows"><p class="muted">Loading history...</p></div>`; detail.appendChild(wrap);
    async function loadRows(){
      const box=$('#activityLogRows');
      try{ const {data,error}=await client.from('customer_activity_log').select('item_name,amount,note,activity_type,created_at').eq('user_id',userId).order('created_at',{ascending:false}).limit(20); if(error) throw error; box.innerHTML=(data||[]).length?(data||[]).map(r=>`<div class="activity-row"><b>${safe(r.item_name||r.activity_type||'Visit')}</b> <small>${r.amount?('€'+Number(r.amount).toFixed(2)):''}</small><br><small>${new Date(r.created_at).toLocaleString()}</small><p>${safe(r.note||'')}</p></div>`).join(''):'<p class="muted">No saved customer activity yet.</p>'; }
      catch(e){box.innerHTML='<p class="muted">Run SQL V4.2.7 customer_activity_log to enable history.</p>';}
    }
    $('#saveActivityLog')?.addEventListener('click',async()=>{try{const admin=await requireAdmin(); const payload={user_id:userId,staff_user_id:admin.id,activity_type:'manual_visit',source:'admin',item_name:$('#activityItem').value,amount:Number($('#activityAmount').value||0),note:$('#activityNote').value}; const {error}=await client.from('customer_activity_log').insert(payload); if(error) throw error; toast('Customer activity saved.','ok'); $('#activityItem').value=''; $('#activityAmount').value='0'; $('#activityNote').value=''; loadRows();}catch(e){toast('Customer history error: '+(e.message||e),'error');}});
    loadRows();
  }

  function observeCustomerDetail(){ const target=$('#customersAdmin'); if(!target||window.__activityObserve427)return; window.__activityObserve427=true; new MutationObserver(()=>setTimeout(injectActivityHistory,150)).observe(target,{childList:true,subtree:true}); }

  function install(){
    ensureStyles(); installNavigation();
    window.renderSushiAdmin=renderProSushiAdmin;
    const oldAll=window.renderAll; if(typeof oldAll==='function' && !window.__pro427Wrap){window.__pro427Wrap=true; window.renderAll=function(){oldAll(); setTimeout(()=>{renderDashboardHub(); renderProSushiAdmin(); observeCustomerDetail();},120);};}
    setTimeout(()=>{renderDashboardHub(); renderProSushiAdmin(); observeCustomerDetail();},900);
    document.addEventListener('click',e=>{ const g=e.target.closest?.('[data-admin-go]'); if(g) showTracked(g.dataset.adminGo); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install); else install();
})();
