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
function setImportant(el,name,value){ if(el?.style?.getPropertyValue(name)!==value || el.style.getPropertyPriority(name)!=='important') el?.style?.setProperty(name,value,'important'); }
function fixButtons(root=document){
  root.querySelectorAll?.('button,.button,a.secondary,a.primary,[role="button"]').forEach(el=>{
    if(el.closest('#cloudAdminGate')) return;
    const cs=getComputedStyle(el); const bg=cs.backgroundColor; const lum=luminance(bg);
    const color=looksGreen(bg)&&lum!=null&&lum<0.55?'#ffffff':lum!=null&&lum>0.67?'#111111':null;
    if(!color)return;
    setImportant(el,'color',color);
    el.querySelectorAll('*').forEach(n=>setImportant(n,'color',color));
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
  setImportant(gate,'position','relative');setImportant(gate,'z-index','1000');setImportant(gate,'pointer-events','auto');setImportant(gate,'touch-action','manipulation');
  gate.querySelectorAll('input,button,label,.form-card').forEach(el=>{setImportant(el,'pointer-events','auto');setImportant(el,'touch-action','manipulation')});
  gate.querySelectorAll('input').forEach(input=>{input.disabled=false;input.readOnly=false;setImportant(input,'user-select','text');setImportant(input,'-webkit-user-select','text');setImportant(input,'opacity','1');setImportant(input,'color','#fff4d6');setImportant(input,'background','#08140f');setImportant(input,'caret-color','#f5d78b');setImportant(input,'font-size','16px')});
  const btn=gate.querySelector('#adminCloudLogin');if(btn){setImportant(btn,'pointer-events','auto');setImportant(btn,'color','#111111')}
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
  new MutationObserver(muts=>{if(queued||!muts.some(m=>m.addedNodes.length))return;queued=true;requestAnimationFrame(()=>{queued=false;refresh()})}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',()=>setTimeout(()=>fixButtons(document),50),true);
  setInterval(()=>{fixLogin();fixButtons(document)},900);
  setTimeout(refresh,300);setTimeout(refresh,1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();