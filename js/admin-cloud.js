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
