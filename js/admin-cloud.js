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
