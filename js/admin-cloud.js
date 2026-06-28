(function(){
  'use strict';
  const CONFIG = {
    supabaseUrl: 'https://fkanccgigogbxodiljqt.supabase.co',
    supabaseKey: 'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7'
  };
  const $ = (s,r=document)=>r.querySelector(s);
  const safe = v=>String(v||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  if(!window.supabase || !window.supabase.createClient){
    document.body.classList.add('admin-locked');
    return;
  }
  const client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth:{ persistSession:true, autoRefreshToken:true } });

  function lockAdmin(){
    document.body.classList.add('admin-locked');
    document.body.classList.remove('admin-unlocked');
    localStorage.removeItem('langar_admin_cloud_user');
    localStorage.removeItem('langar_admin_cloud_role');
    const gate=$('#cloudAdminGate');
    if(gate) gate.classList.remove('hidden');
    const badge=$('#adminCloudBadge');
    if(badge) badge.innerHTML='';
  }
  function unlockAdmin(user, role){
    document.body.classList.remove('admin-locked');
    document.body.classList.add('admin-unlocked');
    localStorage.langar_admin_cloud_user = user.id;
    localStorage.langar_admin_cloud_role = role;
    const gate=$('#cloudAdminGate');
    if(gate) gate.classList.add('hidden');
    const badge=$('#adminCloudBadge');
    if(badge) badge.innerHTML = `<div class="admin-lock-banner"><b>Cloud Admin verified</b><br>User: ${safe(user.email || user.id)}<br>Role: ${safe(role)}</div>`;
    if(typeof window.renderAllAdmin === 'function') window.renderAllAdmin();
  }
  async function checkAdmin(user){
    const { data, error } = await client.from('admin_members').select('role,active').eq('user_id', user.id).eq('active', true).maybeSingle();
    if(error) throw error;
    return data;
  }
  function injectGate(){
    const root=document.querySelector('.admin');
    if(!root || $('#cloudAdminGate')) return;
    const gate=document.createElement('section');
    gate.id='cloudAdminGate';
    gate.className='panel admin-login-shell';
    gate.innerHTML=`
      <div class="section-head">
        <h2>Cloud Admin Login</h2>
        <p>For security, admin modules open only after a verified Cloud Admin login.</p>
      </div>
      <div class="form-card" id="adminAuthBox">
        <label>Email<input id="adminCloudEmail" type="email" autocomplete="username" placeholder="admin@email.com"></label>
        <label>Password<input id="adminCloudPassword" type="password" autocomplete="current-password" placeholder="Password"></label>
        <button id="adminCloudLogin" class="primary full">Login to Admin Mode</button>
        <p id="adminCloudStatus" class="admin-login-status">Enter the active owner/admin account. Without login, dashboard and admin modules stay locked.</p>
      </div>
    `;
    const header=root.querySelector('.topbar');
    if(header) header.insertAdjacentElement('afterend', gate); else root.prepend(gate);
    const badge=document.createElement('div');
    badge.id='adminCloudBadge';
    badge.className='admin-login-shell';
    gate.insertAdjacentElement('afterend', badge);
    $('#adminCloudLogin').onclick=login;
    const logoutBtn=$('#adminCloudLogout');
    if(logoutBtn) logoutBtn.onclick=logout;
    $('#adminCloudPassword').addEventListener('keydown', e=>{ if(e.key==='Enter') login(); });
  }
  async function login(){
    const email=$('#adminCloudEmail')?.value.trim();
    const password=$('#adminCloudPassword')?.value || '';
    const status=$('#adminCloudStatus');
    if(!email || !password){ status.textContent='Enter email and password.'; status.className='admin-login-status error'; return; }
    status.textContent='Checking Cloud Admin access...'; status.className='admin-login-status';
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if(error){ lockAdmin(); status.textContent='Login error: '+error.message; status.className='admin-login-status error'; return; }
    try{
      const admin = await checkAdmin(data.user);
      if(!admin){ await client.auth.signOut(); lockAdmin(); status.innerHTML='<b>Access denied.</b> This user is not active in admin_members.'; status.className='admin-login-status error'; return; }
      status.innerHTML='Verified. Opening admin dashboard...'; status.className='admin-login-status ok';
      unlockAdmin(data.user, admin.role);
    }catch(err){ lockAdmin(); status.textContent='Admin check error: '+err.message; status.className='admin-login-status error'; }
  }
  async function logout(){
    const btn=$('#adminCloudLogout');
    if(btn) btn.disabled=true;
    try{ await client.auth.signOut(); }catch(e){}
    lockAdmin();
    const status=$('#adminCloudStatus');
    if(status){ status.textContent='You have logged out. Enter email and password to open Admin Mode again.'; status.className='admin-login-status ok'; }
    if(btn) btn.disabled=false;
  }

  async function boot(){
    injectGate();
    lockAdmin();
    const { data }=await client.auth.getSession();
    if(data.session?.user){
      try{
        const admin=await checkAdmin(data.session.user);
        if(admin) unlockAdmin(data.session.user, admin.role); else { await client.auth.signOut(); lockAdmin(); }
      }catch{ lockAdmin(); }
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

// =============================
// V4.2 — Admin Cloud Menu + Feedback tools
// =============================
(function(){
  'use strict';
  const CONFIG = { supabaseUrl:'https://fkanccgigogbxodiljqt.supabase.co', supabaseKey:'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7' };
  const client = window.supabase?.createClient ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth:{ persistSession:true, autoRefreshToken:true } }) : null;
  const $ = s=>document.querySelector(s);
  const $$ = s=>Array.from(document.querySelectorAll(s));
  const safe = v=>String(v||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const priceNum = p=>{ const m=String(p||'0').replace(',','.').match(/[0-9]+(\.[0-9]+)?/); return m?Number(m[0]):0; };
  const getLocalMenu = ()=> typeof getMenu==='function' ? getMenu() : [];
  let wired=false;

  function ensureCloudBoxes(){
    const menuPanel=$('#menuPanel');
    if(menuPanel && !$('#cloudMenuAdminBox')){
      const box=document.createElement('div');
      box.id='cloudMenuAdminBox';
      box.className='legal-block';
      box.innerHTML=`<h3>Cloud Menu Sync</h3><p>V4.2 reads Menu/Likes/Feedback from Supabase. Use this to seed or refresh cloud menu data.</p><div class="toolbar"><button id="seedCloudMenu" class="primary">Upload current menu to Cloud</button><button id="loadCloudMenuAdmin" class="secondary">Check Cloud Menu</button></div><div id="cloudMenuStatus" class="muted">Cloud menu not checked yet.</div>`;
      const head=menuPanel.querySelector('.toolbar') || menuPanel.querySelector('.section-head');
      (head||menuPanel).insertAdjacentElement('afterend', box);
    }
    const fb=$('#feedbackPanel');
    if(fb && !$('#cloudFeedbackAdminBox')){
      const box=document.createElement('div');
      box.id='cloudFeedbackAdminBox';
      box.className='legal-block';
      box.innerHTML=`<h3>Cloud Feedback</h3><p>Shows feedback saved in Supabase. 4–5 stars can be public; 1–3 stars stay admin-only.</p><button id="loadCloudFeedbackAdmin" class="secondary">Refresh Cloud Feedback</button><div id="cloudFeedbackList" style="margin-top:10px"></div>`;
      fb.appendChild(box);
    }
    $('#seedCloudMenu')?.addEventListener('click', seedCloudMenu);
    $('#loadCloudMenuAdmin')?.addEventListener('click', renderCloudMenuStatus);
    $('#loadCloudFeedbackAdmin')?.addEventListener('click', renderCloudFeedbackAdmin);
  }

  async function requireAdminSession(){
    if(!client) throw new Error('Supabase SDK not loaded');
    const {data}=await client.auth.getSession();
    if(!data.session?.user) throw new Error('Please login as Cloud Admin first.');
    return data.session.user;
  }
  async function seedCloudMenu(){
    const status=$('#cloudMenuStatus');
    try{
      const user=await requireAdminSession();
      if(status) status.textContent='Cleaning old cloud menu...';
      try{ await client.from('menu_items').update({active:false,available_in_menu:false}).neq('id','00000000-0000-0000-0000-000000000000'); }catch(_e){ console.warn('Menu item cleanup skipped', _e?.message||_e); }
      try{ await client.from('menu_categories').update({active:false}).neq('id','00000000-0000-0000-0000-000000000000'); }catch(_e){ console.warn('Menu category cleanup skipped', _e?.message||_e); }
      if(status) status.textContent='Uploading categories...';
      const menu=getLocalMenu();
      const catRows=menu.map((c,idx)=>({
        slug:c.id,
        title_en:c.title?.en||c.id,
        title_hr:c.title?.hr||c.title?.en||c.id,
        description_en:c.description?.en||'',
        description_hr:c.description?.hr||c.description?.en||'',
        icon:String(c.icon||'✦').includes('<')?'✦':String(c.icon||'✦'),
        sort_order:c.sort||idx+1,
        active:c.active!==false
      }));
      const {error:catErr}=await client.from('menu_categories').upsert(catRows,{onConflict:'slug'});
      if(catErr) throw catErr;
      const {data:cats,error:readErr}=await client.from('menu_categories').select('id,slug');
      if(readErr) throw readErr;
      const catMap={}; (cats||[]).forEach(c=>catMap[c.slug]=c.id);
      const itemRows=[];
      menu.forEach((cat)=>{
        (cat.items||[]).forEach((i,idx)=>{
          if(!catMap[cat.id]) return;
          itemRows.push({
            category_id:catMap[cat.id],
            sku:i.sku||i.id,
            name_en:i.name?.en||i.name_en||'',
            name_hr:i.name?.hr||i.name_hr||i.name?.en||'',
            description_en:i.desc?.en||'',
            description_hr:i.desc?.hr||i.desc?.en||'',
            ingredients_en:i.ingredients?.en||i.desc?.en||'',
            ingredients_hr:i.ingredients?.hr||i.ingredients?.en||'',
            allergens:Array.isArray(i.allergens)?i.allergens:String(i.allergens||'ask staff').split(',').map(x=>x.trim()).filter(Boolean),
            price:priceNum(i.price),
            icon:String(i.icon||cat.icon||'').includes('<')?'':String(i.icon||cat.icon||''),
            sort_order:idx+1,
            active:i.available!==false,
            available_in_menu:i.available!==false,
            allow_online_order:i.orderable!==false,
            is_new:!!i.isNew,
            is_featured:!!i.isFeatured,
            is_sushi_preorder:!!i.isSushiPreorder,
            created_by:user.id
          });
        });
      });
      if(status) status.textContent=`Uploading ${itemRows.length} items...`;
      for(let i=0;i<itemRows.length;i+=50){
        const {error}=await client.from('menu_items').upsert(itemRows.slice(i,i+50),{onConflict:'sku'});
        if(error) throw error;
      }
      if(status) status.innerHTML=`<b>Cloud menu uploaded.</b><br>${catRows.length} categories and ${itemRows.length} items synced.`;
    }catch(err){ if(status) status.innerHTML=`<span style="color:#ffb1a8">Cloud menu error: ${safe(err.message)}</span>`; }
  }
  async function renderCloudMenuStatus(){
    const status=$('#cloudMenuStatus');
    try{
      await requireAdminSession();
      const {data:cats,error:e1}=await client.from('menu_categories').select('id',{count:'exact',head:true});
      const {data:items,error:e2,count}=await client.from('menu_items').select('id',{count:'exact',head:true});
      if(e1||e2) throw (e1||e2);
      const catCount = cats?.length || 0;
      if(status) status.innerHTML=`Cloud menu connection works. Items in Cloud: <b>${count ?? 0}</b>. If app still shows local menu, upload current menu first and refresh app with ?v=42.`;
    }catch(err){ if(status) status.innerHTML=`<span style="color:#ffb1a8">${safe(err.message)}</span>`; }
  }
  async function renderCloudFeedbackAdmin(){
    const box=$('#cloudFeedbackList'); if(!box) return;
    try{
      await requireAdminSession();
      box.innerHTML='Loading cloud feedback...';
      const {data,error}=await client.from('feedback').select('id,rating,message,customer_name,is_public,status,admin_reply,created_at').order('created_at',{ascending:false}).limit(100);
      if(error) throw error;
      if(!data?.length){ box.innerHTML='<p class="muted">No Cloud feedback yet.</p>'; return; }
      box.innerHTML=`<table class="table"><thead><tr><th>Rating</th><th>Customer / Message</th><th>Status</th><th>Date</th></tr></thead><tbody>${data.map(f=>`<tr><td>${'★'.repeat(+f.rating)}</td><td><b>${safe(f.customer_name||'Guest')}</b><br>${safe(f.message||'')}${f.admin_reply?`<div class="legal mini"><b>Reply:</b> ${safe(f.admin_reply)}</div>`:''}</td><td>${safe(f.status)}<br><small>${f.is_public?'public':'admin only'}</small></td><td>${new Date(f.created_at).toLocaleString()}</td></tr>`).join('')}</tbody></table>`;
    }catch(err){ box.innerHTML=`<span style="color:#ffb1a8">Cloud feedback error: ${safe(err.message)}</span>`; }
  }
  function wrapRenderAll(){
    if(window.__langarV42AdminWrap) return; window.__langarV42AdminWrap=true;
    const old=window.renderAll || (typeof renderAll==='function'?renderAll:null);
    if(old){ window.renderAll=function(){ old(); ensureCloudBoxes(); }; }
  }
  function boot(){ ensureCloudBoxes(); wrapRenderAll(); setTimeout(ensureCloudBoxes,800); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

// =============================
// V4.2.1 — Cloud Sushi Pre-orders + mobile admin helper
// =============================
(function(){
  'use strict';
  const CONFIG = { supabaseUrl:'https://fkanccgigogbxodiljqt.supabase.co', supabaseKey:'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7' };
  const client = window.supabase?.createClient ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth:{ persistSession:true, autoRefreshToken:true } }) : null;
  const $ = s=>document.querySelector(s);
  const $$ = s=>Array.from(document.querySelectorAll(s));
  const safe = v=>String(v||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const statusLabel = {pending:'Pending',confirmed:'Confirmed',supplier_ordered:'Supplier ordered',ready:'Ready',delivered:'Delivered',served:'Served',cancelled:'Cancelled',rejected:'Rejected'};
  const statuses = ['pending','confirmed','supplier_ordered','ready','delivered','served','cancelled','rejected'];
  async function requireAdmin(){
    if(!client) throw new Error('Supabase SDK not loaded');
    const {data}=await client.auth.getSession();
    if(!data.session?.user) throw new Error('Please login as Cloud Admin first.');
    return data.session.user;
  }
  function mapItems(row){
    const items = row.sushi_preorder_items || [];
    if(!items.length) return '<small>No item row</small>';
    return items.map(i=>`${safe(i.item_name_en||i.item_name_hr||'Sushi')} × ${safe(i.quantity||1)}`).join('<br>');
  }
  async function renderCloudSushiAdmin(){
    const box=$('#sushiAdmin'); if(!box || !client) return;
    box.innerHTML='<p class="muted">Loading Cloud sushi pre-orders...</p>';
    try{
      await requireAdmin();
      const {data,error}=await client
        .from('sushi_preorders')
        .select('id,user_id,preorder_number,status,fulfillment_type,requested_date,requested_time,customer_name,customer_phone,delivery_address,note,total,created_at,sushi_preorder_items(item_name_en,item_name_hr,quantity,total_price)')
        .order('created_at',{ascending:false})
        .limit(100);
      if(error) throw error;
      const rows=data||[];
      if(!rows.length){
        box.innerHTML='<p class="muted">No Cloud sushi pre-orders yet.</p><div class="legal-block"><b>Cloud sushi logic</b><p>Customer sushi reservations are now saved in Supabase. Admin can see the same requests from laptop and phone. When status changes, confirmation is saved to the customer Cloud Inbox.</p></div>';
        return;
      }
      const demand={};
      rows.forEach(r=>(r.sushi_preorder_items||[]).forEach(i=>{ const k=i.item_name_en||i.item_name_hr||'Sushi'; demand[k]=(demand[k]||0)+(+i.quantity||1); }));
      box.innerHTML=`<div class="admin-mobile-note">Cloud synced: laptop and phone show the same sushi pre-orders.</div><div class="table-wrap"><table class="table"><thead><tr><th>Sushi</th><th>Date / Time</th><th>Customer</th><th>Mode</th><th>Note</th><th>Status</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${safe(r.preorder_number||r.id.slice(0,8))}</b><br>${mapItems(r)}<br><small>Total: €${Number(r.total||0).toFixed(2)}</small></td><td>${safe(r.requested_date||'')}<br>${safe((r.requested_time||'').slice(0,5))}</td><td>${safe(r.customer_name||'Guest')}<br><small>${safe(r.customer_phone||'')}</small>${r.delivery_address?`<br><small>${safe(r.delivery_address)}</small>`:''}</td><td>${safe(r.fulfillment_type||'')}</td><td>${safe(r.note||'')}</td><td><select data-cloud-sushi-status="${r.id}" data-user-id="${safe(r.user_id||'')}">${statuses.map(st=>`<option value="${st}" ${r.status===st?'selected':''}>${statusLabel[st]}</option>`).join('')}</select><small class="status-hint" id="sushi-status-${r.id}"></small></td></tr>`).join('')}</tbody></table></div><div class="legal-block"><b>Demand insight</b><p>${Object.entries(demand).map(([k,v])=>`${safe(k)}: ${v}`).join('<br>')||'No demand yet.'}</p></div>`;
      $$('[data-cloud-sushi-status]').forEach(sel=>sel.onchange=async()=>{
        const id=sel.dataset.cloudSushiStatus;
        const userId=sel.dataset.userId;
        const status=sel.value;
        const hint=$(`#sushi-status-${CSS.escape(id)}`);
        if(hint) hint.textContent=' Saving...';
        try{
          const admin=await requireAdmin();
          const {error:updateErr}=await client.from('sushi_preorders').update({status,handled_by:admin.id,updated_at:new Date().toISOString()}).eq('id',id);
          if(updateErr) throw updateErr;
          if(userId){
            const title_en = status==='confirmed'?'Sushi pre-order confirmed': status==='ready'?'Your sushi is ready': status==='rejected'?'Sushi pre-order update':'Sushi pre-order updated';
            const body_en = status==='confirmed'?'Your sushi pre-order has been confirmed by Langar Bar. We will prepare it for the selected date and time.': status==='ready'?'Your sushi is ready. Please come to pick it up or wait for delivery/service according to your selected mode.': status==='rejected'?'Sorry, this sushi pre-order cannot be confirmed. Please contact Langar Bar or choose another date/type.':'Your sushi pre-order status is now: '+statusLabel[status]+'.';
            const title_hr = status==='confirmed'?'Sushi rezervacija potvrđena': status==='ready'?'Vaš sushi je spreman': status==='rejected'?'Obavijest o sushi rezervaciji':'Sushi rezervacija ažurirana';
            const body_hr = status==='confirmed'?'Langar Bar je potvrdio vašu sushi rezervaciju. Pripremit ćemo je za odabrani datum i vrijeme.': status==='ready'?'Vaš sushi je spreman. Molimo dođite po njega ili pričekajte dostavu/serviranje prema odabranom načinu.': status==='rejected'?'Nažalost, ovu sushi rezervaciju ne možemo potvrditi. Kontaktirajte Langar Bar ili odaberite drugi datum/tip.':'Status vaše sushi rezervacije je: '+statusLabel[status]+'.';
            await client.from('inbox_messages').insert({
              user_id:userId,
              type:'sushi',
              title_en, body_en, title_hr, body_hr,
              is_read:false,
              data:{sushi_preorder_id:id,status,campaign_key:'sushi_status_'+id+'_'+status}
            });
          }
          if(hint) hint.textContent=' Saved + customer Inbox updated';
        }catch(err){
          if(hint) hint.textContent=' Error: '+(err.message||err);
          alert('Cloud sushi status error: '+(err.message||err));
        }
      });
    }catch(err){
      box.innerHTML=`<p style="color:#ffb1a8">Cloud sushi error: ${safe(err.message||err)}</p><p class="muted">If you are not logged in as Cloud Admin, login first. Local pre-orders on this device cannot sync to phone until they are created in Cloud.</p>`;
    }
  }
  function install(){
    window.renderSushiAdmin = renderCloudSushiAdmin;
    if(typeof window.renderAll==='function'){
      const old=window.renderAll;
      if(!window.__langarSushiCloudWrap){
        window.__langarSushiCloudWrap=true;
        window.renderAll=function(){ old(); renderCloudSushiAdmin(); };
      }
    }
    setTimeout(renderCloudSushiAdmin, 600);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install); else install();
})();

// =============================
// V4.2.5 — Safe Customer Delete + Admin Protection
// =============================
(function(){
  'use strict';
  const CONFIG = { supabaseUrl:'https://fkanccgigogbxodiljqt.supabase.co', supabaseKey:'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7' };
  const client = window.supabase?.createClient ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth:{ persistSession:true, autoRefreshToken:true } }) : null;
  const $ = s=>document.querySelector(s);
  const $$ = s=>Array.from(document.querySelectorAll(s));
  const safe = v=>String(v||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const euro = n=>'€'+Number(n||0).toFixed(2);
  let customersCache=[];
  let selectedCustomerId=null;
  let cloudCustomersLoadedAt=null;
  let isRenderingCustomers=false;

  async function requireAdmin(){
    if(!client) throw new Error('Supabase SDK not loaded');
    const {data}=await client.auth.getSession();
    if(!data.session?.user) throw new Error('Please login as Cloud Admin first.');
    const {data:admin,error}=await client.from('admin_members').select('role,active').eq('user_id',data.session.user.id).eq('active',true).maybeSingle();
    if(error) throw error;
    if(!admin) throw new Error('This user is not an active Cloud Admin.');
    return {user:data.session.user, role:admin.role};
  }

  function customerName(c){
    return [c.first_name,c.last_name].filter(Boolean).join(' ') || c.email || c.phone || 'Unnamed customer';
  }

  async function loadCustomers(){
    await requireAdmin();
    let rows=null;
    let rpcError=null;
    try{
      const res = await client.rpc('admin_list_customers');
      if(res.error) rpcError = res.error; else rows = res.data || [];
    }catch(e){ rpcError = e; }
    if(!rows){
      const {data,error}=await client
        .from('profiles')
        .select('id,phone,email,first_name,last_name,birthday,app_language,customer_level,langar_credit,referral_code,marketing_opt_in,push_opt_in,last_seen_at,created_at,updated_at')
        .order('created_at',{ascending:false})
        .limit(500);
      if(error){
        const msg = rpcError ? ('RPC: '+(rpcError.message||rpcError)+' / Direct: '+error.message) : error.message;
        throw new Error(msg);
      }
      rows=data||[];
      // Safety fallback: even if RPC is unavailable, never show active admins as customers.
      try{
        const {data:admins}=await client.from('admin_members').select('user_id,active').eq('active',true);
        const adminIds=new Set((admins||[]).map(a=>a.user_id));
        rows=rows.filter(p=>!adminIds.has(p.id));
      }catch(e){}
    }
    customersCache=(rows||[]).filter(c=>c && c.id);
    cloudCustomersLoadedAt = new Date();
    if(selectedCustomerId && !customersCache.some(c=>c.id===selectedCustomerId)) selectedCustomerId=null;
    if(!selectedCustomerId && customersCache.length) selectedCustomerId=customersCache[0].id;
    return customersCache;
  }

  async function loadCustomerCards(userId){
    const {data,error}=await client.from('reward_cards')
      .select('id,reward_type,title_en,title_hr,description_en,description_hr,qr_code,status,valid_until,created_at')
      .eq('user_id',userId)
      .order('created_at',{ascending:false})
      .limit(100);
    if(error) return [];
    return data||[];
  }

  async function loadCustomerWallet(userId){
    const {data,error}=await client.from('wallet_transactions')
      .select('id,amount,transaction_type,reason,created_at')
      .eq('user_id',userId)
      .order('created_at',{ascending:false})
      .limit(30);
    if(error) return [];
    return data||[];
  }

  async function loadCustomerOrders(userId){
    const {data,error}=await client.from('sushi_preorders')
      .select('id,preorder_number,status,requested_date,total,created_at')
      .eq('user_id',userId)
      .order('created_at',{ascending:false})
      .limit(10);
    if(error) return [];
    return data||[];
  }

  async function renderCloudCustomerDetail(userId){
    const detail=$('#cloudCustomerDetail'); if(!detail) return;
    const c=customersCache.find(x=>x.id===userId);
    if(!c){ detail.innerHTML='<p class="muted">Select a customer.</p>'; return; }
    detail.innerHTML='<p class="muted">Loading customer details...</p>';
    const [cards,wallet,sushi]=await Promise.all([loadCustomerCards(userId),loadCustomerWallet(userId),loadCustomerOrders(userId)]);
    detail.innerHTML=`
      <div class="legal-block customer-detail-card">
        <h3>${safe(customerName(c))}</h3>
        <p><b>Phone:</b> ${safe(c.phone||'-')}<br>
        <b>Email:</b> ${safe(c.email||'-')}<br>
        <b>Birthday:</b> ${safe(c.birthday||'-')}<br>
        <b>Language:</b> ${safe(c.app_language||'-')}<br>
        <b>Level:</b> ${safe(c.customer_level||'bronze')}<br>
        <b>Langar Credit:</b> ${euro(c.langar_credit)}<br>
        <b>Referral code:</b> ${safe(c.referral_code||'-')}<br>
        <b>User ID:</b> <small>${safe(c.id)}</small></p>
        <div class="edit-grid">
          <label>Add / set credit amount<input id="cloudCreditAmount" type="number" step="0.01" value="${Number(c.langar_credit||0).toFixed(2)}"></label>
          <label>Reason<input id="cloudCreditReason" value="Admin adjustment"></label>
        </div>
        <div class="toolbar">
          <button class="primary" id="cloudSaveCredit">Save Credit</button>
          <button class="secondary" id="cloudSendEspresso">Send Free Espresso Card</button>
          <button class="secondary" id="cloudSendBirthday">Send Birthday Card</button>
          <button class="secondary" id="cloudSendInboxTest">Send Inbox Note</button>
          <button class="danger" id="cloudDeleteCustomer">Delete Customer</button>
        </div>
        <small id="cloudCustomerActionStatus" class="muted"></small>
      </div>
      <div class="quick-grid customer-mini-stats">
        <button><span>🎁</span><b>${cards.filter(x=>x.status==='active').length}</b><small>Active Cards</small></button>
        <button><span>💶</span><b>${euro(c.langar_credit)}</b><small>Credit</small></button>
        <button><span>🍣</span><b>${sushi.length}</b><small>Sushi Orders</small></button>
        <button><span>✉️</span><b>${c.push_opt_in?'On':'Off'}</b><small>Push</small></button>
      </div>
      <h3>Reward Cards</h3>
      ${cards.length?`<div class="cards-list">${cards.map(card=>`<article class="reward-card ${safe(card.status)}"><b>${safe(card.title_en||card.title_hr||card.reward_type)}</b><p>${safe(card.description_en||card.description_hr||'')}</p><div class="qrbox">${safe(card.qr_code||card.id.slice(0,8))}</div><small>${safe(card.status)} ${card.valid_until?'until '+safe(card.valid_until).slice(0,10):''}</small></article>`).join('')}</div>`:'<p class="muted">No reward cards yet.</p>'}
      <h3>Wallet History</h3>
      ${wallet.length?`<table class="table"><tbody>${wallet.map(w=>`<tr><td>${euro(w.amount)}</td><td>${safe(w.transaction_type)}<br><small>${safe(w.reason||'')}</small></td><td>${new Date(w.created_at).toLocaleString()}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">No wallet transactions yet.</p>'}
      <h3>Recent Sushi Pre-orders</h3>
      ${sushi.length?`<table class="table"><tbody>${sushi.map(o=>`<tr><td>${safe(o.preorder_number||o.id.slice(0,8))}</td><td>${safe(o.status)}</td><td>${safe(o.requested_date||'')}</td><td>${euro(o.total)}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">No sushi pre-orders yet.</p>'}
    `;
    $('#cloudSaveCredit')?.addEventListener('click',()=>saveCloudCredit(c));
    $('#cloudSendEspresso')?.addEventListener('click',()=>sendCloudCard(c,'welcome_espresso'));
    $('#cloudSendBirthday')?.addEventListener('click',()=>sendCloudCard(c,'birthday'));
    $('#cloudSendInboxTest')?.addEventListener('click',()=>sendCloudInbox(c));
    $('#cloudDeleteCustomer')?.addEventListener('click',()=>deleteCloudCustomer(c));
  }

  async function saveCloudCredit(c){
    const status=$('#cloudCustomerActionStatus');
    try{
      const {user}=await requireAdmin();
      const amount=Number($('#cloudCreditAmount')?.value||0);
      const reason=$('#cloudCreditReason')?.value||'Admin adjustment';
      if(amount < 0) throw new Error('Credit cannot be negative.');
      const old=Number(c.langar_credit||0);
      const diff=Number((amount-old).toFixed(2));
      const {error:e1}=await client.from('profiles').update({langar_credit:amount,updated_at:new Date().toISOString()}).eq('id',c.id);
      if(e1) throw e1;
      if(diff!==0){
        await client.from('wallet_transactions').insert({user_id:c.id,amount:diff,transaction_type:'adjustment',reason,created_by:user.id});
      }
      await client.from('inbox_messages').insert({user_id:c.id,type:'wallet',title_en:'Langar Credit updated',body_en:`Your Langar Credit is now ${euro(amount)}.`,title_hr:'Langar Credit ažuriran',body_hr:`Vaš Langar Credit sada je ${euro(amount)}.`,data:{campaign_key:'credit_update_'+Date.now(),amount}});
      if(status) status.textContent='Credit saved and customer Inbox updated.';
      c.langar_credit=amount;
      renderCloudCustomers();
    }catch(err){ if(status) status.textContent='Error: '+(err.message||err); alert('Credit error: '+(err.message||err)); }
  }

  async function sendCloudCard(c,type){
    const status=$('#cloudCustomerActionStatus');
    try{
      await requireAdmin();
      const isBirthday=type==='birthday';
      const qr=(isBirthday?'BDAY':'FREE')+'-'+Math.floor(100000+Math.random()*900000);
      const payload={
        user_id:c.id,
        reward_type:type,
        title_en:isBirthday?'Birthday Reward':'Free Espresso Card',
        title_hr:isBirthday?'Rođendanska nagrada':'Besplatni espresso',
        description_en:isBirthday?'40% for birthday guest + 20% for up to 3 friends. One-time card.':'One-time free espresso welcome/gift card.',
        description_hr:isBirthday?'40% za slavljenika + 20% za do 3 prijatelja. Jednokratna kartica.':'Jednokratna kartica za besplatan espresso.',
        qr_code:qr,
        status:'active'
      };
      const {error}=await client.from('reward_cards').insert(payload);
      if(error) throw error;
      await client.from('inbox_messages').insert({user_id:c.id,type:'reward',title_en:payload.title_en,body_en:payload.description_en,title_hr:payload.title_hr,body_hr:payload.description_hr,data:{campaign_key:'reward_'+qr,qr_code:qr,reward_type:type}});
      if(status) status.textContent='Reward card sent to customer Inbox/Rewards.';
      renderCloudCustomerDetail(c.id);
    }catch(err){ if(status) status.textContent='Error: '+(err.message||err); alert('Reward error: '+(err.message||err)); }
  }

  async function deleteCloudCustomer(c){
    const status=$('#cloudCustomerActionStatus');
    try{
      await requireAdmin();
      // Hard protection: never delete an active admin from the customer screen, even if old cache shows it.
      try{
        const {data:adminRow,error:adminErr}=await client.from('admin_members').select('role,active').eq('user_id',c.id).eq('active',true).maybeSingle();
        if(adminErr) throw adminErr;
        if(adminRow) throw new Error('This user is an active admin and cannot be deleted from Customers & Rewards. Use Admin Members settings, not customer delete.');
      }catch(checkErr){
        if(String(checkErr.message||checkErr).includes('active admin')) throw checkErr;
        // Continue only if the check failed because the table is inaccessible; RPC will still protect admins.
      }
      const name=customerName(c);
      const ok=confirm('Delete customer from Cloud list?\n\n'+name+'\n\nThis removes the customer profile, inbox, reward cards and test app data. Active admins are protected and cannot be deleted here.');
      if(!ok) return;
      if(status) status.textContent='Deleting customer from Cloud...';
      try{
        const rpc = await client.rpc('admin_delete_customer', { customer_id: c.id });
        if(rpc.error) throw rpc.error;
      }catch(rpcErr){
        throw new Error((rpcErr?.message||String(rpcErr)) + ' — Run the V4.2.5 Safe Customer Delete SQL in Supabase.');
      }
      selectedCustomerId=null;
      if(status) status.textContent='Customer deleted from Cloud list.';
      await renderCloudCustomers(true);
      await renderCloudDashboardStats();
    }catch(err){
      const msg=(err.message||String(err));
      if(status) status.textContent='Delete error: '+msg;
      alert('Delete customer error: '+msg);
    }
  }

  async function sendCloudInbox(c){
    const status=$('#cloudCustomerActionStatus');
    try{
      await requireAdmin();
      const {error}=await client.from('inbox_messages').insert({user_id:c.id,type:'admin',title_en:'Message from Langar Bar',body_en:'Thank you for being part of Langar Club.',title_hr:'Poruka iz Langar Bara',body_hr:'Hvala što ste dio Langar Cluba.',data:{campaign_key:'admin_note_'+Date.now()}});
      if(error) throw error;
      if(status) status.textContent='Inbox note sent.';
    }catch(err){ if(status) status.textContent='Error: '+(err.message||err); }
  }

  async function renderCloudCustomers(force=false){
    const box=$('#customersAdmin'); if(!box || !client) return;
    if(isRenderingCustomers && !force) return;
    isRenderingCustomers=true;
    box.innerHTML='<p class="muted">Loading live Cloud customers from Supabase...</p>';
    try{
      const list=await loadCustomers();
      const active=list.filter(c=>c.phone || c.email).length;
      box.innerHTML=`
        <div class="admin-mobile-note"><b>Cloud Live Customers (RPC sync).</b> This list is read directly from Supabase, not from this device. If laptop and phone differ, press <b>Force Cloud Refresh</b> and open the page with the latest version number.<br><small>Loaded: ${cloudCustomersLoadedAt?cloudCustomersLoadedAt.toLocaleString():'now'}</small></div>
        <div class="quick-grid customer-cloud-stats">
          <button><span>👥</span><b>${list.length}</b><small>Total profiles</small></button>
          <button><span>📱</span><b>${list.filter(c=>c.phone).length}</b><small>Phone users</small></button>
          <button><span>🎂</span><b>${list.filter(c=>c.birthday).length}</b><small>Birthdays saved</small></button>
          <button><span>💶</span><b>${euro(list.reduce((a,c)=>a+Number(c.langar_credit||0),0))}</b><small>Total credit</small></button>
        </div>
        <div class="cloud-customer-layout">
          <div class="cloud-customer-list">
            <div class="toolbar"><button class="secondary" id="refreshCloudCustomers">Force Cloud Refresh</button><button class="secondary" id="clearLocalCustomerCache">Clear local customer cache</button></div>
            ${list.length?list.map(c=>`<button class="customer-list-btn ${c.id===selectedCustomerId?'active':''}" data-cloud-customer="${safe(c.id)}"><b>${safe(customerName(c))}</b><small>${safe(c.phone||c.email||'No contact')} · ${safe(c.customer_level||'bronze')} · ${euro(c.langar_credit)}</small></button>`).join(''):'<p class="muted">No Cloud customers yet.</p>'}
          </div>
          <div id="cloudCustomerDetail" class="cloud-customer-detail"></div>
        </div>
      `;
      $('#refreshCloudCustomers')?.addEventListener('click',()=>{ selectedCustomerId=null; renderCloudCustomers(true); renderCloudDashboardStats(); });
      $('#clearLocalCustomerCache')?.addEventListener('click',()=>{ ['langar_profile','langar_cards','langar_inbox','langar_sushi_preorders','langar_orders_v3'].forEach(k=>localStorage.removeItem(k)); alert('Local prototype customer cache cleared on this device. Cloud customers are not deleted.'); selectedCustomerId=null; renderCloudCustomers(true); });
      $$('[data-cloud-customer]').forEach(btn=>btn.addEventListener('click',()=>{ selectedCustomerId=btn.dataset.cloudCustomer; renderCloudCustomers(); }));
      if(selectedCustomerId) renderCloudCustomerDetail(selectedCustomerId);
      isRenderingCustomers=false;
    }catch(err){
      isRenderingCustomers=false;
      box.innerHTML=`<p style="color:#ffb1a8">Cloud customers error: ${safe(err.message||err)}</p><p class="muted">Login as active Cloud Admin. If this still shows only one local profile, upload/test with Phone OTP so profiles are saved in Supabase.</p>`;
    }
  }

  async function renderCloudDashboardStats(){
    const d=$('#adminDashboard'); if(!d || !client) return;
    try{
      await requireAdmin();
      let counts=null;
      try{
        const rpc = await client.rpc('admin_dashboard_counts');
        if(!rpc.error && rpc.data) counts = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
      }catch(e){}
      if(!counts){
        const [profiles, inbox, sushi, cards] = await Promise.all([
          client.from('profiles').select('id',{count:'exact',head:true}),
          client.from('inbox_messages').select('id',{count:'exact',head:true}),
          client.from('sushi_preorders').select('id',{count:'exact',head:true}),
          client.from('reward_cards').select('id',{count:'exact',head:true})
        ]);
        counts={customers:profiles.count||0,inbox:inbox.count||0,sushi:sushi.count||0,cards:cards.count||0};
      }
      d.innerHTML=`<button><span>👥</span><b>${counts.customers}</b><small>Cloud Customers</small></button><button><span>✉️</span><b>${counts.inbox}</b><small>Cloud Inbox</small></button><button><span>🍣</span><b>${counts.sushi}</b><small>Sushi Pre-orders</small></button><button><span>🎁</span><b>${counts.cards}</b><small>Reward Cards</small></button><button><span>🔐</span><b>ON</b><small>Secure Admin</small></button><button><span>☁️</span><b>SYNC</b><small>Supabase</small></button>`;
    }catch(e){ /* admin may not be logged in yet */ }
  }

  function injectCustomerStyles(){
    if($('#cloudCustomerStyles')) return;
    const st=document.createElement('style'); st.id='cloudCustomerStyles'; st.textContent=`
      .cloud-customer-layout{display:grid;grid-template-columns:280px 1fr;gap:16px;margin-top:14px}.cloud-customer-list{display:flex;flex-direction:column;gap:8px}.customer-list-btn{text-align:left;border:1px solid rgba(238,211,139,.24);background:rgba(255,255,255,.04);color:var(--cream);border-radius:18px;padding:12px;cursor:pointer}.customer-list-btn.active{border-color:var(--gold);background:rgba(238,211,139,.14);box-shadow:0 12px 28px rgba(0,0,0,.22)}.customer-list-btn small{display:block;color:var(--muted);margin-top:4px}.customer-detail-card small{word-break:break-all}.customer-mini-stats button,.customer-cloud-stats button{min-height:88px}@media(max-width:760px){.cloud-customer-layout{grid-template-columns:1fr}.cloud-customer-list{max-height:260px;overflow:auto}.customer-list-btn{padding:14px}.customer-detail-card .toolbar{display:grid;grid-template-columns:1fr 1fr;gap:8px}.customer-detail-card .toolbar button{width:100%}.cloud-customer-list .toolbar{display:grid;grid-template-columns:1fr;gap:8px}}
    `; document.head.appendChild(st);
  }

  function install(){
    injectCustomerStyles();
    window.renderCustomers = renderCloudCustomers;
    const oldAll=window.renderAll || (typeof renderAll==='function'?renderAll:null);
    if(oldAll && !window.__langarCustomerCloudWrap){
      window.__langarCustomerCloudWrap=true;
      window.renderAll=function(){ oldAll(); setTimeout(()=>{renderCloudCustomers(true); renderCloudDashboardStats();},80); };
    }
    const oldShow=window.showPanel;
    if(oldShow && !window.__langarShowPanelCloudWrap){
      window.__langarShowPanelCloudWrap=true;
      window.showPanel=function(id){ oldShow(id); if(id==='customersPanel') setTimeout(()=>renderCloudCustomers(true),80); if(id==='dashboardPanel') setTimeout(()=>renderCloudDashboardStats(),80); };
    }
    const target=document.getElementById('customersAdmin');
    if(target && !window.__langarCustomerObserver){
      window.__langarCustomerObserver=true;
      const obs=new MutationObserver(()=>{
        const txt=(target.textContent||'');
        if(txt.includes('No customer registered in prototype') || txt.includes('Phone:') && !txt.includes('Cloud Live Customers')){
          setTimeout(()=>renderCloudCustomers(true),60);
        }
      });
      obs.observe(target,{childList:true,subtree:true});
    }
    setTimeout(()=>{ renderCloudCustomers(true); renderCloudDashboardStats(); },900);
    document.addEventListener('click',e=>{
      const btn=e.target.closest?.('[onclick*="customersPanel"],[onclick*="dashboardPanel"]');
      if(btn) setTimeout(()=>{renderCloudCustomers(true); renderCloudDashboardStats();},250);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install); else install();
})();




// =============================
// V4.5.7 — ETA draft+accept, overdue alarm, quick delay messages
// =============================
(function(){
  'use strict';
  const CONFIG = { supabaseUrl:'https://fkanccgigogbxodiljqt.supabase.co', supabaseKey:'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7' };
  if(!window.supabase?.createClient) return;
  const client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth:{ persistSession:true, autoRefreshToken:true } });
  const $ = s=>document.querySelector(s);
  const safe = v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const euro = n=>'€'+Number(n||0).toFixed(2);
  const statusLabels = {new:'New',accepted:'Accepted',preparing:'Preparing',ready:'Ready',completed:'Completed',cancelled:'Cancelled',rejected:'Rejected'};
  const statuses = ['new','accepted','preparing','ready','completed','cancelled','rejected'];
  const terminalStatuses = ['completed','cancelled','rejected'];
  const standardEtaMinutes = [10,15,20,30,45,60,90];
  let pollTimer=null, realtimeChannel=null, alarmTimer=null, alarmCtx=null;
  let adminStatusMessage='';
  let alarmUnlocked=false, alarmStartedAt=0;
  let lastRenderedSignature='';
  let orderFilter = localStorage.langar_admin_order_filter || 'live';
  let customDateFilter = localStorage.langar_admin_order_date_filter || localDateKey(new Date());
  let lastBrowserNotifyKey='';
  let healthCache=null, healthFetchedAt=0;
  let overdueBrowserNotifyKey='';
  const delayReasonOptions = [
    {label:'No extra message', value:''},
    {label:'Busy kitchen', value:'We are a little busy right now. Thank you for your patience.'},
    {label:'Fresh preparation', value:'Your order needs a few extra minutes so we can prepare it fresh.'},
    {label:'Almost ready', value:'Your order is almost ready. Thank you for waiting.'},
    {label:'Sorry for delay', value:'Sorry for the short delay. We are preparing your order now.'}
  ];
  let etaDrafts = readEtaDrafts();

  function cssEscape(v){ return window.CSS?.escape ? CSS.escape(v) : String(v).replace(/[^a-zA-Z0-9_-]/g, '\\$&'); }
  function ackedOrders(){ try{return JSON.parse(localStorage.langar_admin_order_ack_ids||'{}')}catch{return {}} }
  function saveAckedOrders(map){ localStorage.langar_admin_order_ack_ids = JSON.stringify(map||{}); }
  function currentNewUnacked(allRows){ const ack=ackedOrders(); return (allRows||[]).filter(o=>String(o.status||'new')==='new' && !ack[o.id]); }
  function ackOrderIds(ids){ const ack=ackedOrders(); (ids||[]).forEach(id=>{ if(id) ack[id]=new Date().toISOString(); }); saveAckedOrders(ack); stopOrderAlarm(); }
  function terminalStatus(st){ return terminalStatuses.includes(String(st||'').toLowerCase()); }
  function liveStatus(st){ return !terminalStatus(st); }
  function typeLabel(t){ return t==='dine_in'?'Dine-in':(t==='delivery'?'Delivery':'Pick-up'); }
  function normalizeItems(items){ if(Array.isArray(items)) return items; try{return JSON.parse(items||'[]')}catch{return []} }
  function localDateKey(value){
    const d = value instanceof Date ? new Date(value) : new Date(value);
    if(Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function offsetDateKey(days){ const d=new Date(); d.setDate(d.getDate()+days); return localDateKey(d); }
  function sameLocalDate(value,key){ return localDateKey(value)===key; }
  function etaText(o){
    const mins=o.estimated_minutes; const ready=o.estimated_ready_at; const note=o.admin_customer_note||'';
    let out='';
    if(mins) out='Customer time: about '+mins+' min';
    if(ready){ try{ const t=new Date(ready).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); out += out ? ' · Ready around '+t : 'Customer time: '+t; }catch(e){} }
    if(note) out += out ? ' · '+note : note;
    return out;
  }

  async function requireAdmin(){
    const {data}=await client.auth.getSession();
    if(!data.session?.user) throw new Error('Login as Cloud Admin first. Use the Cloud Admin Login at the top of admin.html.');
    return data.session.user;
  }

  async function getCloudHealth(force=false){
    if(!force && healthCache && Date.now()-healthFetchedAt < 45000) return healthCache;
    try{
      const {data,error}=await client.rpc('admin_cloud_health');
      if(error) throw error;
      healthCache=data||[]; healthFetchedAt=Date.now();
      return healthCache;
    }catch(e){ return [{check_name:'Cloud health', ok:false, count_value:0, last_at:null, message:e.message||String(e)}]; }
  }
  function renderHealthBlock(rows){
    const items=(rows||[]).map(r=>`<span class="health-pill ${r.ok?'ok':'bad'}"><b>${r.ok?'✓':'!'}</b> ${safe(r.check_name)}: ${safe(r.count_value??'—')}${r.last_at?` <small>${new Date(r.last_at).toLocaleString()}</small>`:''}</span>`).join('');
    const checked = healthFetchedAt ? new Date(healthFetchedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'}) : '—';
    return `<div class="cloud-health-box"><div><b>☁️ Cloud Health Check</b><small>Admin only · profiles, rewards, inbox and orders are checked in Supabase.</small><small class="health-last-check">Last check: ${safe(checked)}</small></div><div class="cloud-health-pills">${items||'<span class="health-pill bad">No health data</span>'}</div><button class="secondary" id="refreshCloudHealth">Check now</button></div>`;
  }
  function adminStatus(text){ adminStatusMessage = text || ''; }
  function renderAdminStatus(){ return adminStatusMessage ? `<div class="admin-action-status">${safe(adminStatusMessage)}</div>` : ''; }

  function readEtaDrafts(){ try{return JSON.parse(localStorage.langar_admin_eta_drafts||'{}')}catch{return {}} }
  function writeEtaDrafts(){ localStorage.langar_admin_eta_drafts = JSON.stringify(etaDrafts||{}); }
  function getEtaDraft(o){
    const id=String(o.id);
    const base={preset:'', custom:'', note:o.admin_customer_note||''};
    const mins=Number(o.estimated_minutes||0);
    if(mins){ if(standardEtaMinutes.includes(mins)) base.preset=String(mins); else base.custom=String(mins); }
    return {...base, ...(etaDrafts[id]||{})};
  }
  function saveEtaDraft(id, patch){
    id=String(id);
    etaDrafts[id]={...(etaDrafts[id]||{}), ...patch, touchedAt:new Date().toISOString()};
    writeEtaDrafts();
  }
  function clearEtaDraft(id){ delete etaDrafts[String(id)]; writeEtaDrafts(); }
  function collectEtaDraft(id){
    const draft=etaDrafts[String(id)]||{};
    const custom=String(draft.custom||'').trim();
    const preset=String(draft.preset||'').trim();
    const note=String(draft.note||'').trim();
    const minutes=custom!=='' ? Number(custom) : (preset!=='' ? Number(preset) : null);
    const hasDraft = custom!=='' || preset!=='' || note!=='';
    return {minutes, note, hasDraft};
  }
  function isOrderOverdue(o){
    if(!o || o.is_test) return false;
    const st=String(o.status||'new').toLowerCase();
    if(['ready','completed','cancelled','rejected'].includes(st)) return false;
    if(!o.estimated_ready_at) return false;
    const t=new Date(o.estimated_ready_at).getTime();
    return Number.isFinite(t) && t <= Date.now();
  }
  function delayReasonSelect(id){
    return `<select data-order-delay-message="${safe(id)}">${delayReasonOptions.map(o=>`<option value="${safe(o.value)}">${safe(o.label)}</option>`).join('')}</select>`;
  }

  async function unlockAlarmSound(){
    try{
      alarmCtx = alarmCtx || new (window.AudioContext||window.webkitAudioContext)();
      if(alarmCtx.state==='suspended') await alarmCtx.resume();
      alarmUnlocked = true;
      localStorage.langar_admin_alarm_unlocked='1';
      if('Notification' in window && Notification.permission==='default') await Notification.requestPermission().catch(()=>{});
      beepPattern();
      return true;
    }catch(e){ alert('Alarm sound could not be enabled: '+(e.message||e)); return false; }
  }
  function currentAlarmGain(){
    const elapsed = alarmStartedAt ? (Date.now()-alarmStartedAt)/1000 : 0;
    return Math.min(0.98, 0.42 + elapsed*0.03);
  }
  function beepOnce(freq=1250, dur=0.50, gainValue=null){
    try{
      if(!alarmCtx || alarmCtx.state==='suspended') return;
      const osc=alarmCtx.createOscillator(); const gain=alarmCtx.createGain();
      osc.type='square'; osc.frequency.setValueAtTime(freq, alarmCtx.currentTime);
      const g=Math.max(0.07, Math.min(0.98, gainValue ?? currentAlarmGain()));
      gain.gain.setValueAtTime(0.0001, alarmCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(g, alarmCtx.currentTime+0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, alarmCtx.currentTime+dur);
      osc.connect(gain); gain.connect(alarmCtx.destination); osc.start(); osc.stop(alarmCtx.currentTime+dur+0.03);
    }catch(e){}
  }
  function beepPattern(){
    const g=currentAlarmGain();
    beepOnce(1200,.34,g);
    setTimeout(()=>beepOnce(1780,.34,Math.min(.98,g+.08)),240);
    setTimeout(()=>beepOnce(980,.44,Math.min(.98,g+.14)),520);
    setTimeout(()=>beepOnce(2050,.24,Math.min(.98,g+.18)),900);
  }
  function browserNotifyNewOrders(unacked){
    if(!unacked?.length) return;
    const key=unacked.map(o=>o.id).sort().join('|');
    if(key===lastBrowserNotifyKey) return;
    lastBrowserNotifyKey=key;
    try{
      if('Notification' in window && Notification.permission==='granted'){
        const first=unacked[0];
        new Notification('Langar Bar — New order', { body:`${unacked.length} new order(s). First: ${first.order_number||String(first.id).slice(0,8)} · ${typeLabel(first.fulfillment_type)}`, icon:'assets/admin-icon-192.png', badge:'assets/admin-icon-192.png', tag:'langar-admin-new-order' });
      }
    }catch(e){}
  }
  function browserNotifyOverdue(overdue){
    if(!overdue?.length) return;
    const key=overdue.map(o=>o.id+'_'+(o.estimated_ready_at||'')).sort().join('|');
    if(key===overdueBrowserNotifyKey) return;
    overdueBrowserNotifyKey=key;
    try{
      if('Notification' in window && Notification.permission==='granted'){
        const first=overdue[0];
        new Notification('Langar Bar — ETA overdue', { body:`${overdue.length} order(s) reached estimated time. First: ${first.order_number||String(first.id).slice(0,8)}. Mark Ready or add more time.`, icon:'assets/admin-icon-192.png', badge:'assets/admin-icon-192.png', tag:'langar-admin-overdue-order' });
      }
    }catch(e){}
  }
  function startOrderAlarm(unacked, overdue){
    const hasNew=!!unacked?.length, hasOverdue=!!overdue?.length;
    if(!hasNew && !hasOverdue){ stopOrderAlarm(); return; }
    browserNotifyNewOrders(unacked||[]);
    browserNotifyOverdue(overdue||[]);
    if(!alarmUnlocked) return;
    if(!alarmStartedAt) alarmStartedAt=Date.now();
    if(alarmTimer) return;
    beepPattern();
    alarmTimer=setInterval(beepPattern, 1150);
  }
  function stopOrderAlarm(){ if(alarmTimer){ clearInterval(alarmTimer); alarmTimer=null; } alarmStartedAt=0; }

  async function fetchOrders(){
    await requireAdmin();
    const {data,error}=await client.rpc('admin_get_customer_orders',{p_limit:500});
    if(error) throw error;
    return data||[];
  }

  function buildOrderRows(allRows){
    const today=offsetDateKey(0), yesterday=offsetDateKey(-1);
    const realRows=(allRows||[]).filter(o=>!o.is_test);
    const live=realRows.filter(o=>liveStatus(o.status) && !o.archived_at);
    const todayRows=realRows.filter(o=>sameLocalDate(o.created_at,today));
    const yesterdayRows=realRows.filter(o=>sameLocalDate(o.created_at,yesterday));
    const archive=realRows.filter(o=>terminalStatus(o.status) || !!o.archived_at || (!sameLocalDate(o.created_at,today) && !sameLocalDate(o.created_at,yesterday)));
    const dateRows=realRows.filter(o=>sameLocalDate(o.created_at,customDateFilter));
    const testRows=(allRows||[]).filter(o=>o.is_test);
    let rows=realRows;
    if(orderFilter==='live') rows=live;
    else if(orderFilter==='today') rows=todayRows;
    else if(orderFilter==='yesterday') rows=yesterdayRows;
    else if(orderFilter==='archive') rows=archive;
    else if(orderFilter==='date') rows=dateRows;
    else if(orderFilter==='test') rows=testRows;
    else if(orderFilter==='all') rows=realRows;
    return {rows, live, todayRows, yesterdayRows, archive, testRows, dateRows};
  }

  function cardForOrder(o){
    const items=normalizeItems(o.items);
    const eta=etaText(o);
    const draft=getEtaDraft(o);
    const overdue=isOrderOverdue(o);
    const delayControls = overdue ? `<div class="eta-overdue-box"><b>⏰ Estimated time reached</b><small>Mark Ready or add a few more minutes. Alarm continues until this is resolved.</small><div class="toolbar mini"><button class="primary" data-order-ready="${safe(o.id)}">Mark Ready</button><button class="secondary" data-order-extend="${safe(o.id)}" data-minutes="5">+5 min</button><button class="secondary" data-order-extend="${safe(o.id)}" data-minutes="10">+10 min</button>${delayReasonSelect(o.id)}</div></div>` : '';
    return `<article class="cloud-order-card ${o.status==='new'?'new':''} ${terminalStatus(o.status)?'terminal':''} ${o.is_test?'is-test':''} ${overdue?'eta-overdue':''}">
      <div class="cloud-order-head"><div><h3>${safe(o.order_number||String(o.id).slice(0,8))} <span class="order-source-badge">${typeLabel(o.fulfillment_type)}</span>${o.is_test?` <span class="order-source-badge test">TEST</span>`:''}</h3>
        <div class="cloud-order-meta">${new Date(o.created_at).toLocaleString()}${o.table_number?` · Table: <b>${safe(o.table_number)}</b>`:''}${o.customer_name?` · ${safe(o.customer_name)}`:''}${o.customer_phone?` · ${safe(o.customer_phone)}`:''}</div>
        ${o.delivery_address?`<div class="cloud-order-meta">Address: ${safe(o.delivery_address)}</div>`:''}${eta?`<div class="order-eta-admin">${safe(eta)}</div>`:''}</div>
        <div class="cloud-order-total"><b>${euro(o.total)}</b><br><small>${safe(statusLabels[o.status]||o.status)}</small></div></div>
      <div class="cloud-order-items enhanced-items">${items.map(i=>`<div><span><b class="order-line-name">${safe(i.qty||1)} × ${safe(i.name_hr||i.name_en||i.name||'Item')}</b>${i.addOns?.length?`<small>${safe(i.addOns.map(a=>a.name||a.id).join(', '))}</small>`:''}</span><b>${euro(i.line_total ?? ((i.qty||1)*(i.price||0)))}</b></div>`).join('')||'<p class="muted">No items</p>'}</div>
      ${o.note?`<p class="muted"><b>Note:</b> ${safe(o.note)}</p>`:''}
      ${o.cancel_requested_at?`<div class="cancel-request-box ${o.cancel_status==='rejected'?'rejected':(o.cancel_status==='approved'?'approved':'pending')}"><b>Customer cancellation request</b><small>${new Date(o.cancel_requested_at).toLocaleString()}${o.cancel_reason?` · ${safe(o.cancel_reason)}`:''}</small><span>Status: ${safe(o.cancel_status||'requested')}</span>${(!terminalStatus(o.status) && (!o.cancel_status || o.cancel_status==='requested'))?`<div class="toolbar mini"><button class="danger subtle" data-cancel-approve="${safe(o.id)}">Approve cancel</button><button class="secondary" data-cancel-reject="${safe(o.id)}">Reject request</button></div>`:''}</div>`:''}
      <div class="cloud-order-actions"><select data-order-status="${safe(o.id)}"><option value="new" ${o.status==='new'?'selected':''}>New</option><option value="accepted" ${o.status==='accepted'?'selected':''}>Accept order${(draft.preset||draft.custom)?' + send time':''}</option><option value="preparing" ${o.status==='preparing'?'selected':''}>Preparing${(draft.preset||draft.custom)?' + send time':''}</option><option value="ready" ${o.status==='ready'?'selected':''}>Ready</option><option value="completed" ${o.status==='completed'?'selected':''}>Completed</option><option value="cancelled" ${o.status==='cancelled'?'selected':''}>Cancelled</option><option value="rejected" ${o.status==='rejected'?'selected':''}>Rejected</option></select><label class="checkline"><input type="checkbox" data-order-paid="${safe(o.id)}" ${o.paid?'checked':''}> Paid / entered in Remaris</label></div>
      <div class="order-eta-controls v457"><label>Set time before accepting</label><select data-order-eta-minutes="${safe(o.id)}"><option value="">Preset</option>${standardEtaMinutes.map(m=>`<option value="${m}" ${String(draft.preset)===String(m)?'selected':''}>${m<60?m+' min':(m===60?'1 hour':'1.5 hours')}</option>`).join('')}</select><input type="number" min="1" max="240" step="1" inputmode="numeric" data-order-eta-custom="${safe(o.id)}" placeholder="Custom min" value="${safe(draft.custom||'')}"><input data-order-customer-note="${safe(o.id)}" placeholder="Optional message to customer" value="${safe(draft.note||'')}"><button class="secondary" data-order-save-eta="${safe(o.id)}">Send time only</button></div>
      ${delayControls}
      <div class="order-admin-maintenance"><label class="checkline"><input type="checkbox" data-order-test="${safe(o.id)}" ${o.is_test?'checked':''}> Mark as test order</label>${o.is_test?`<button class="danger subtle" data-order-delete-test="${safe(o.id)}">Delete test order</button>`:''}</div>
    </article>`;
  }

  async function renderCloudOrders(force=false){
    const box=$('#ordersAdmin'); if(!box) return;
    try{
      const [allRows, healthRows] = await Promise.all([fetchOrders(), getCloudHealth(force)]);
      const signature=JSON.stringify([orderFilter, customDateFilter, allRows.map(o=>[o.id,o.status,o.paid,o.is_test,o.estimated_minutes,o.estimated_ready_at,o.admin_customer_note,o.cancel_requested_at,o.cancel_status,o.cancel_reason,o.updated_at,o.created_at,o.archived_at])]);
      const groups=buildOrderRows(allRows);
      const {rows, live, todayRows, yesterdayRows, archive, testRows, dateRows}=groups;
      const unacked=currentNewUnacked(allRows.filter(o=>!o.is_test));
      const overdueOrders=allRows.filter(o=>isOrderOverdue(o));
      startOrderAlarm(unacked, overdueOrders);
      if(!force && signature===lastRenderedSignature && !unacked.length && !overdueOrders.length) return;
      lastRenderedSignature=signature;
      const alarmBanner = (unacked.length || overdueOrders.length)
        ? `<div class="order-alarm-banner"><div><b>${unacked.length?'🔔 '+unacked.length+' NEW ORDER'+(unacked.length>1?'S':''):''}${unacked.length&&overdueOrders.length?' · ':''}${overdueOrders.length?'⏰ '+overdueOrders.length+' ETA OVERDUE':''}</b><small>Alarm gets louder until new orders are checked and overdue orders are marked Ready or extended.</small></div><button id="enableOrderAlarm" class="primary">${alarmUnlocked?'Alarm enabled':'Enable alarm sound'}</button>${unacked.length?`<button id="ackOrderAlarm" class="secondary">I checked new order(s)</button>`:''}</div>`
        : `<div class="order-alarm-quiet"><span>✓ No unchecked new orders or overdue ETA</span><button id="enableOrderAlarm" class="secondary">${alarmUnlocked?'Alarm enabled':'Enable alarm sound'}</button></div>`;
      const dateInput = `<span class="date-filter-wrap"><input id="orderCustomDate" type="date" value="${safe(customDateFilter)}"><button id="applyOrderDate" class="secondary">Open date</button></span>`;
      box.innerHTML = `${alarmBanner}${renderHealthBlock(healthRows)}${renderAdminStatus()}<div class="cloud-orders-toolbar ${unacked.length?'order-alert-flash':''}"><span class="order-pill">Live: ${live.length}</span><span class="order-pill">New: ${allRows.filter(o=>o.status==='new' && !o.is_test).length}</span><span class="order-pill">Today total: ${euro(todayRows.reduce((s,o)=>s+Number(o.total||0),0))}</span><span class="order-pill">Overdue: ${overdueOrders.length}</span><span class="order-pill">Auto-refresh: ON</span><button id="refreshCloudOrders" class="secondary">Refresh now</button>${testRows.length?`<button id="deleteAllTestOrders" class="danger subtle">Delete ${testRows.length} test order(s)</button>`:''}</div><div class="order-filter-tabs"><button data-order-filter="live" class="secondary ${orderFilter==='live'?'active':''}">Live Queue</button><button data-order-filter="today" class="secondary ${orderFilter==='today'?'active':''}">Today</button><button data-order-filter="yesterday" class="secondary ${orderFilter==='yesterday'?'active':''}">Yesterday</button><button data-order-filter="archive" class="secondary ${orderFilter==='archive'?'active':''}">Archive</button><button data-order-filter="date" class="secondary ${orderFilter==='date'?'active':''}">By date</button><button data-order-filter="test" class="secondary ${orderFilter==='test'?'active':''}">Test</button><button data-order-filter="all" class="secondary ${orderFilter==='all'?'active':''}">All 500</button>${dateInput}</div>` +
        (rows.length?`<div class="cloud-orders-list">${rows.map(cardForOrder).join('')}</div>`:`<p class="muted">Connected to Cloud. No orders in this filter yet.</p><div class="legal-block"><b>Tablet workflow</b><p>Keep this panel open. Orders auto-refresh every 5 seconds and also use Realtime when available. Click “Enable alarm sound” once after opening the tablet.</p></div>`);
      $('#refreshCloudOrders')?.addEventListener('click',async()=>{ adminStatus('Refreshing orders now...'); lastRenderedSignature=''; await renderCloudOrders(true); adminStatus('Orders refreshed at '+new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})); setTimeout(()=>renderCloudOrders(true),350); });
      $('#refreshCloudHealth')?.addEventListener('click',async()=>{ adminStatus('Checking Cloud Health now...'); healthFetchedAt=0; healthCache=null; lastRenderedSignature=''; await renderCloudOrders(true); adminStatus('Cloud Health checked at '+new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})); setTimeout(()=>renderCloudOrders(true),350); });
      $('#enableOrderAlarm')?.addEventListener('click',async()=>{ await unlockAlarmSound(); renderCloudOrders(true); });
      $('#ackOrderAlarm')?.addEventListener('click',()=>{ ackOrderIds(unacked.map(o=>o.id)); renderCloudOrders(true); });
      $('#applyOrderDate')?.addEventListener('click',()=>{ const v=$('#orderCustomDate')?.value || localDateKey(new Date()); customDateFilter=v; localStorage.langar_admin_order_date_filter=v; orderFilter='date'; localStorage.langar_admin_order_filter=orderFilter; renderCloudOrders(true); });
      $('#deleteAllTestOrders')?.addEventListener('click',()=>deleteAllTestOrders());
      document.querySelectorAll('[data-order-filter]').forEach(btn=>btn.onclick=()=>{ orderFilter=btn.dataset.orderFilter; localStorage.langar_admin_order_filter=orderFilter; renderCloudOrders(true); });
      document.querySelectorAll('[data-order-status]').forEach(sel=>sel.onchange=()=>updateOrderWithCurrentDraft(sel.dataset.orderStatus, sel.value));
      document.querySelectorAll('[data-order-paid]').forEach(ch=>ch.onchange=()=>updateOrder(ch.dataset.orderPaid,{paid:ch.checked}));
      document.querySelectorAll('[data-order-test]').forEach(ch=>ch.onchange=()=>updateOrder(ch.dataset.orderTest,{isTest:ch.checked}));
      document.querySelectorAll('[data-order-delete-test]').forEach(btn=>btn.onclick=()=>deleteTestOrder(btn.dataset.orderDeleteTest));
      document.querySelectorAll('[data-cancel-approve]').forEach(btn=>btn.onclick=()=>decideCancellation(btn.dataset.cancelApprove,'approved'));
      document.querySelectorAll('[data-cancel-reject]').forEach(btn=>btn.onclick=()=>decideCancellation(btn.dataset.cancelReject,'rejected'));
      document.querySelectorAll('[data-order-eta-minutes]').forEach(sel=>sel.onchange=()=>{ const id=sel.dataset.orderEtaMinutes; const input=document.querySelector(`[data-order-eta-custom="${cssEscape(id)}"]`); if(input && sel.value) input.value=''; saveEtaDraft(id,{preset:sel.value||'', custom: sel.value ? '' : (input?.value||'')}); });
      document.querySelectorAll('[data-order-eta-custom]').forEach(inp=>inp.oninput=()=>{ const id=inp.dataset.orderEtaCustom; const sel=document.querySelector(`[data-order-eta-minutes="${cssEscape(id)}"]`); if(inp.value.trim() && sel) sel.value=''; saveEtaDraft(id,{custom:inp.value.trim(), preset: inp.value.trim()? '' : (sel?.value||'')}); });
      document.querySelectorAll('[data-order-customer-note]').forEach(inp=>inp.oninput=()=>saveEtaDraft(inp.dataset.orderCustomerNote,{note:inp.value||''}));
      document.querySelectorAll('[data-order-delay-message]').forEach(sel=>sel.onchange=()=>{ const id=sel.dataset.orderDelayMessage; const note=document.querySelector(`[data-order-customer-note="${cssEscape(id)}"]`); if(note && sel.value){ note.value=sel.value; saveEtaDraft(id,{note:sel.value}); } });
      document.querySelectorAll('[data-order-ready]').forEach(btn=>btn.onclick=()=>updateOrder(btn.dataset.orderReady,{status:'ready'}));
      document.querySelectorAll('[data-order-extend]').forEach(btn=>btn.onclick=()=>{ const id=btn.dataset.orderExtend; const reason=document.querySelector(`[data-order-delay-message="${cssEscape(id)}"]`)?.value || 'Sorry for the short delay. We are preparing your order now.'; setOrderEta(id, Number(btn.dataset.minutes||5), reason); });
      document.querySelectorAll('[data-order-save-eta]').forEach(btn=>btn.onclick=async()=>{
        const id=btn.dataset.orderSaveEta;
        const draft=collectEtaDraft(id);
        if(draft.minutes!==null && (!Number.isFinite(draft.minutes) || draft.minutes<1 || draft.minutes>240)){ alert('Time must be between 1 and 240 minutes.'); return; }
        if(draft.minutes===null && !draft.note){ alert('Choose a preset time, enter custom minutes, or write a customer message first.'); return; }
        btn.disabled=true; const old=btn.textContent; btn.textContent='Sending...';
        await setOrderEta(id, draft.minutes, draft.note);
        btn.disabled=false; btn.textContent=old;
      });
    }catch(err){
      box.innerHTML = `<p style="color:#ffb1a8">Cloud orders error: ${safe(err.message||err)}</p><p class="muted">Run <b>langar_bar_v454_eta_cancel_refresh_fix.sql</b> in Supabase SQL Editor. Then login with a user that exists in <b>admin_members</b>.</p><button id="refreshCloudOrders" class="secondary">Try again</button>`;
      $('#refreshCloudOrders')?.addEventListener('click',()=>renderCloudOrders(true));
    }
  }

  async function setOrderEta(id, minutes, note){
    try{
      const {error}=await client.rpc('admin_set_order_eta', { p_order_id:id, p_estimated_minutes:minutes, p_admin_customer_note:note || null });
      if(error) throw error;
      adminStatus(`Ready time sent to customer at ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}.`);
      clearEtaDraft(id);
      lastRenderedSignature='';
      await renderCloudOrders(true);
    }catch(err){
      alert('Send time error: '+(err.message||err)+'. Run langar_bar_v454_eta_cancel_refresh_fix.sql if this function is missing.');
    }
  }

  async function decideCancellation(id, decision){
    const msg = decision==='approved' ? 'Approve cancellation and mark this order as Cancelled?' : 'Reject the customer cancellation request and keep the order active?';
    if(!confirm(msg)) return;
    try{
      const note = decision==='rejected' ? 'Order is already being prepared. Please contact Langar Bar staff.' : 'Cancellation approved by Langar Bar.';
      const {error}=await client.rpc('admin_decide_order_cancellation', { p_order_id:id, p_decision:decision, p_admin_note:note });
      if(error) throw error;
      adminStatus(`Cancellation request ${decision} at ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}.`);
      if(decision==='approved') ackOrderIds([id]);
      lastRenderedSignature='';
      await renderCloudOrders(true);
    }catch(err){ alert('Cancellation decision error: '+(err.message||err)); }
  }

  async function updateOrderWithCurrentDraft(id, status){
    const patch={status};
    const draft=collectEtaDraft(id);
    if(status && status!=='new' && status!=='ready' && status!=='completed' && status!=='cancelled' && status!=='rejected' && draft.hasDraft){
      if(draft.minutes!==null){
        if(!Number.isFinite(draft.minutes) || draft.minutes<1 || draft.minutes>240){ alert('Time must be between 1 and 240 minutes.'); return; }
        patch.etaMinutes=draft.minutes;
      }
      if(draft.note) patch.customerNote=draft.note;
    }
    await updateOrder(id, patch);
  }

  async function updateOrder(id, patch){
    try{
      const args={
        p_order_id:id,
        p_status:Object.prototype.hasOwnProperty.call(patch,'status')?patch.status:null,
        p_paid:Object.prototype.hasOwnProperty.call(patch,'paid')?patch.paid:null,
        p_fiscal_receipt_number:null,
        p_estimated_minutes:Object.prototype.hasOwnProperty.call(patch,'etaMinutes')?patch.etaMinutes:null,
        p_admin_customer_note:Object.prototype.hasOwnProperty.call(patch,'customerNote')?patch.customerNote:null,
        p_is_test:Object.prototype.hasOwnProperty.call(patch,'isTest')?patch.isTest:null
      };
      const {error}=await client.rpc('admin_update_customer_order', args);
      if(error) throw error;
      if(patch.status && patch.status!=='new') ackOrderIds([id]);
      if(patch.etaMinutes || patch.customerNote) clearEtaDraft(id);
      await renderCloudOrders(true);
    }catch(err){ alert('Order update error: '+(err.message||err)); }
  }

  async function deleteTestOrder(id){
    if(!confirm('Delete this TEST order from Supabase? Real orders cannot be deleted with this button.')) return;
    try{
      const {error}=await client.rpc('admin_delete_test_order',{p_order_id:id});
      if(error) throw error;
      await renderCloudOrders(true);
    }catch(err){ alert('Delete test order error: '+(err.message||err)); }
  }
  async function deleteAllTestOrders(){
    if(!confirm('Delete ALL orders marked as TEST from Supabase? This is only for test cleanup.')) return;
    try{
      const {data,error}=await client.rpc('admin_delete_test_orders');
      if(error) throw error;
      alert(`Deleted ${data||0} test order(s).`);
      await renderCloudOrders(true);
    }catch(err){ alert('Delete test orders error: '+(err.message||err)); }
  }

  function setupRealtime(){
    if(realtimeChannel || !client.channel) return;
    try{
      realtimeChannel = client.channel('langar-admin-orders-v457')
        .on('postgres_changes',{event:'INSERT',schema:'public',table:'customer_orders'}, payload=>{ renderCloudOrders(true); if(payload?.new) startOrderAlarm([payload.new]); })
        .on('postgres_changes',{event:'UPDATE',schema:'public',table:'customer_orders'}, ()=>renderCloudOrders(true))
        .on('postgres_changes',{event:'DELETE',schema:'public',table:'customer_orders'}, ()=>renderCloudOrders(true))
        .subscribe();
    }catch(e){ console.warn('Realtime setup failed; polling remains active.', e); }
  }

  function install(){
    if(window.__langarCloudOrdersInstalledV456) return; window.__langarCloudOrdersInstalledV456=true;
    if(typeof window.renderOrders === 'function') window.renderOrders = ()=>renderCloudOrders(true);
    const oldRenderAll = window.renderAll;
    if(typeof oldRenderAll === 'function' && !oldRenderAll.__cloudOrdersV453){ window.renderAll=function(){ oldRenderAll(); renderCloudOrders(true); }; window.renderAll.__cloudOrdersV453=true; }
    setupRealtime();
    renderCloudOrders(true);
    if(pollTimer) clearInterval(pollTimer);
    pollTimer=setInterval(()=>renderCloudOrders(false), 5000);
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden) renderCloudOrders(true); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(install,500)); else setTimeout(install,500);
})();
