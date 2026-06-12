(function(){
  'use strict';
  const CONFIG = {
    supabaseUrl: 'https://fkanccgigogbxodiljqt.supabase.co',
    supabaseKey: 'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7'
  };
  const $ = (s,r=document)=>r.querySelector(s);
  const safe = v=>String(v||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  if(!window.supabase || !window.supabase.createClient) return;
  const client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth:{ persistSession:true, autoRefreshToken:true }});
  async function checkAdmin(user){
    const { data, error } = await client.from('admin_members').select('role,active').eq('user_id', user.id).eq('active', true).maybeSingle();
    if(error) throw error;
    return data;
  }
  function inject(){
    const main = document.querySelector('.admin main');
    if(!main || $('#cloudAdminLogin')) return;
    const box=document.createElement('section');
    box.id='cloudAdminLogin'; box.className='panel';
    box.innerHTML=`<div class="section-head"><h2>Cloud Admin Login</h2><p>V4.1 foundation: verifies admin access from Supabase admin_members before production admin actions.</p></div><div class="form-card" id="adminAuthBox"><label>Email<input id="adminCloudEmail" type="email" placeholder="admin@email.com"></label><label>Password<input id="adminCloudPassword" type="password" placeholder="Password"></label><button id="adminCloudLogin" class="primary full">Login to Cloud Admin</button><p id="adminCloudStatus" class="legal mini">Prototype panels remain visible for testing. Production will lock actions behind this login.</p></div>`;
    main.prepend(box);
    $('#adminCloudLogin').onclick=login;
  }
  async function login(){
    const email=$('#adminCloudEmail').value.trim(); const password=$('#adminCloudPassword').value;
    const status=$('#adminCloudStatus'); status.textContent='Checking...';
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if(error){ status.textContent='Login error: '+error.message; return; }
    try{
      const admin = await checkAdmin(data.user);
      if(!admin){ status.innerHTML='<b style="color:#ffb1a8">Access denied.</b> This user is not active in admin_members.'; return; }
      status.innerHTML=`<b style="color:#eed38b">Cloud admin verified.</b><br>User: ${safe(data.user.id)}<br>Role: ${safe(admin.role)}`;
      localStorage.langar_admin_cloud_user = data.user.id;
      localStorage.langar_admin_cloud_role = admin.role;
    }catch(err){ status.textContent='Admin check error: '+err.message; }
  }
  async function boot(){ inject(); const { data }=await client.auth.getSession(); if(data.session?.user){ try{ const admin=await checkAdmin(data.session.user); if(admin){ const st=$('#adminCloudStatus'); if(st) st.innerHTML=`<b style="color:#eed38b">Cloud admin session active.</b><br>Role: ${safe(admin.role)}`; } }catch{} } }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
