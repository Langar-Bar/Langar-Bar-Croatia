(() => {
'use strict';

const SUPABASE_URL='https://fkanccgigogbxodiljqt.supabase.co';
const SUPABASE_KEY='sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7';

function luminance(rgb){
  const m=String(rgb||'').match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i);
  if(!m) return null;
  const [r,g,b]=[+m[1],+m[2],+m[3]];
  return (0.2126*r+0.7152*g+0.0722*b)/255;
}
function looksGreen(rgb){
  const m=String(rgb||'').match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i); if(!m)return false;
  const [r,g,b]=[+m[1],+m[2],+m[3]];
  return g>r*1.12 && g>b*1.02 && g>45;
}
function fixButtons(root=document){
  root.querySelectorAll?.('button,.button,a.secondary,a.primary,[role="button"]').forEach(el=>{
    if(el.closest('#cloudAdminGate')) return;
    const cs=getComputedStyle(el); const bg=cs.backgroundColor; const lum=luminance(bg);
    if(looksGreen(bg) && lum!=null && lum<0.55){
      el.style.setProperty('color','#ffffff','important');
      el.querySelectorAll('*').forEach(n=>n.style.setProperty('color','#ffffff','important'));
    }else if(lum!=null && lum>0.67){
      el.style.setProperty('color','#111111','important');
      el.querySelectorAll('*').forEach(n=>n.style.setProperty('color','#111111','important'));
    }
  });
}
function client(){
  if(window.LangarAdminCloud?.client) return window.LangarAdminCloud.client;
  if(!window.supabase?.createClient) return null;
  const c=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  window.LangarAdminCloud=Object.assign(window.LangarAdminCloud||{},{client:c,getSession:()=>c.auth.getSession(),signOut:()=>c.auth.signOut()});
  return c;
}
function fallbackGate(){
  if(document.getElementById('cloudAdminGate')||document.body.classList.contains('admin-unlocked')) return;
  const root=document.querySelector('.admin'); if(!root)return;
  const gate=document.createElement('section'); gate.id='cloudAdminGate'; gate.className='panel admin-login-shell';
  gate.innerHTML=`<div class="section-head"><h2>Cloud Admin Login</h2><p>Enter an active owner/admin account to open the secure Staff Console.</p></div><div class="form-card" id="adminAuthBox"><label>Email<input id="adminCloudEmail" type="email" autocomplete="username" inputmode="email" placeholder="admin@email.com"></label><label>Password<input id="adminCloudPassword" type="password" autocomplete="current-password" placeholder="Password"></label><button id="adminCloudLogin" type="button" class="primary full">Login to Admin Mode</button><p id="adminCloudStatus" class="admin-login-status">Admin modules remain locked until your account is verified.</p></div>`;
  (root.querySelector('.topbar')||root.firstElementChild)?.insertAdjacentElement('afterend',gate);
}
async function fallbackLogin(){
  const c=client(),status=document.getElementById('adminCloudStatus');
  const email=document.getElementById('adminCloudEmail')?.value.trim(); const password=document.getElementById('adminCloudPassword')?.value||'';
  if(!c){if(status)status.textContent='Cloud login service is still loading. Please try again.';return}
  if(!email||!password){if(status)status.textContent='Enter email and password.';return}
  if(status)status.textContent='Checking Cloud Admin access…';
  try{
    const {data,error}=await c.auth.signInWithPassword({email,password}); if(error)throw error;
    const {data:admin,error:checkErr}=await c.from('admin_members').select('role,active').eq('user_id',data.user.id).eq('active',true).maybeSingle();
    if(checkErr)throw checkErr;
    if(!admin){await c.auth.signOut();throw new Error('This account is not an active Langar Admin account.');}
    document.body.classList.remove('admin-locked');document.body.classList.add('admin-unlocked');
    localStorage.langar_admin_cloud_user=data.user.id;localStorage.langar_admin_cloud_role=admin.role;
    document.getElementById('cloudAdminGate')?.classList.add('hidden');
    if(typeof window.renderAllAdmin==='function')window.renderAllAdmin();
    window.dispatchEvent(new CustomEvent('langar-admin-unlocked',{detail:{userId:data.user.id,role:admin.role}}));
  }catch(e){if(status)status.textContent='Login error: '+(e?.message||e)}
}
function wireFallback(){
  const btn=document.getElementById('adminCloudLogin'); if(!btn||btn.dataset.v104Wired==='1')return;
  btn.dataset.v104Wired='1';
  btn.addEventListener('click',e=>{if(!window.LangarAdminCloud?.client){e.preventDefault();e.stopImmediatePropagation();fallbackLogin()}},true);
  document.getElementById('adminCloudPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!window.LangarAdminCloud?.client)fallbackLogin()});
}
function fixLogin(){
  fallbackGate();
  const gate=document.getElementById('cloudAdminGate'); if(!gate)return;
  gate.style.setProperty('position','relative','important');gate.style.setProperty('z-index','1000','important');gate.style.setProperty('pointer-events','auto','important');gate.style.setProperty('touch-action','manipulation','important');
  gate.querySelectorAll('input,button,label,.form-card').forEach(el=>{el.style.setProperty('pointer-events','auto','important');el.style.setProperty('touch-action','manipulation','important')});
  gate.querySelectorAll('input').forEach(input=>{input.disabled=false;input.readOnly=false;input.style.setProperty('user-select','text','important');input.style.setProperty('-webkit-user-select','text','important');input.style.setProperty('opacity','1','important');input.style.setProperty('color','#fff4d6','important');input.style.setProperty('background','#08140f','important');input.style.setProperty('caret-color','#f5d78b','important');input.style.setProperty('font-size','16px','important')});
  const btn=gate.querySelector('#adminCloudLogin');if(btn){btn.style.setProperty('pointer-events','auto','important');btn.style.setProperty('color','#111','important')}
  wireFallback();
}
function addCss(){
  if(document.getElementById('adminReleaseFix104Css'))return;
  const s=document.createElement('style');s.id='adminReleaseFix104Css';s.textContent=`#cloudAdminGate,#cloudAdminGate *{box-sizing:border-box}#cloudAdminGate{isolation:isolate!important}#cloudAdminGate input{position:relative!important;z-index:1002!important;min-height:48px!important}#cloudAdminGate label{position:relative!important;z-index:1001!important}#cloudAdminGate #adminCloudLogin{position:relative!important;z-index:1002!important}`;document.head.appendChild(s)
}
function refresh(){addCss();fixLogin();fixButtons(document)}
function init(){
  refresh();
  let queued=false;
  new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh()})}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  document.addEventListener('click',()=>setTimeout(()=>fixButtons(document),50),true);
  setTimeout(refresh,300);setTimeout(refresh,1000);setTimeout(refresh,2500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();