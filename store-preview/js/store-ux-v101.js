(() => {
'use strict';

const SUPABASE_URL='https://fkanccgigogbxodiljqt.supabase.co';
const DELETE_URL=`${SUPABASE_URL}/functions/v1/delete-account`;
const preview=new URLSearchParams(location.search).get('storePreview')==='1';
const native=Boolean(window.Capacitor?.isNativePlatform?.());
if(!native&&!preview)return;

document.documentElement.classList.add('langar-store-build');
if(preview)document.documentElement.classList.add('langar-store-preview');

function client(){return window.langarCloud?.client||window.LangarCloud?.client||window.supabaseClient||window._supabase||null}
function addStyles(){
 if(document.getElementById('storeUx101Styles'))return;
 const s=document.createElement('style');s.id='storeUx101Styles';s.textContent=`
 .store-order-summary{position:sticky;top:86px;z-index:28;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px;padding:12px 14px;border:1px solid rgba(245,215,139,.48);border-radius:18px;background:rgba(7,25,18,.96);box-shadow:0 12px 26px rgba(0,0,0,.26);backdrop-filter:blur(12px);cursor:pointer}
 .store-order-summary b{color:#fff4d6;font-size:1rem}.store-order-summary strong{color:#f5d78b;font-size:1.08rem}.store-order-summary small{display:block;color:#b7c8bd;margin-top:2px}
 .store-delete-wrap{margin:16px 0;padding:16px;border:1px solid rgba(190,73,73,.55);border-radius:20px;background:rgba(72,19,19,.18)}
 .store-delete-wrap h3{margin:0 0 7px;color:#fff}.store-delete-wrap p{margin:0 0 12px;color:#d8c9c9;line-height:1.45}.store-delete-btn{width:100%;border:1px solid #b44b4b;background:#3a1515;color:#fff;border-radius:14px;padding:12px 14px;font-weight:850}
 .langar-store-build .app-install-card{display:none!important}
 @media(max-width:700px){
  #order,#order *{min-width:0}
  #order .order-layout{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:100%!important;overflow:visible!important}
  #order .cart{position:static!important;width:100%!important;max-width:100%!important;margin-top:16px!important}
  #orderMenu{width:100%!important;max-width:100%!important;overflow-x:hidden!important}
  #orderMenu>*{max-width:100%!important}
  #orderMenu .cards,#orderMenu .category-grid,#orderMenu .categories-grid,#orderMenu .order-category-grid,#orderMenu .order-categories,#orderMenu [class*='category-grid']{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:100%!important}
  #orderMenu button,#orderMenu article,#orderMenu .category-card,#orderMenu .cat-card{max-width:100%!important;width:100%!important}
  .store-order-summary{top:84px}
 }
 `;document.head.appendChild(s)
}

function ensureSummary(){
 const order=document.getElementById('order');if(!order||document.getElementById('storeOrderSummary'))return;
 const head=order.querySelector('.section-head');
 const box=document.createElement('div');box.id='storeOrderSummary';box.className='store-order-summary';box.setAttribute('role','button');box.tabIndex=0;
 box.innerHTML='<div><b>Your order</b><small id="storeOrderCount">0 items selected</small></div><strong id="storeOrderTotal">€0.00</strong>';
 (head||order.firstElementChild)?.insertAdjacentElement('afterend',box);
 const go=()=>order.querySelector('.cart')?.scrollIntoView({behavior:'smooth',block:'start'});box.addEventListener('click',go);box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')go()});
}
function refreshSummary(){
 const total=document.getElementById('cartTotal')?.textContent?.trim()||'€0.00';
 const cart=document.getElementById('cartItems');
 let count=0;
 if(cart){
  const lines=cart.querySelectorAll('.cart-line');
  if(lines.length)lines.forEach(line=>{const m=(line.textContent||'').match(/(?:×|x)\s*(\d+)|(\d+)\s*(?:×|x)/i);count+=m?Number(m[1]||m[2]||1):1});
 }
 const c=document.getElementById('storeOrderCount'),t=document.getElementById('storeOrderTotal');
 if(c)c.textContent=`${count} item${count===1?'':'s'} selected`;if(t)t.textContent=total;
}
function watchCart(){
 const cart=document.getElementById('cartItems'),total=document.getElementById('cartTotal');if(!cart&&!total)return;
 const obs=new MutationObserver(refreshSummary);if(cart)obs.observe(cart,{childList:true,subtree:true,characterData:true});if(total)obs.observe(total,{childList:true,subtree:true,characterData:true});refreshSummary();
}

async function deleteAccount(){
 const c=client();if(!c?.auth?.getSession){alert('Please log in first.');return}
 const first=confirm('Delete your Langar Club account permanently? This cannot be undone.');if(!first)return;
 const second=confirm('Final confirmation: delete your account and personal profile now?');if(!second)return;
 try{
  const {data}=await c.auth.getSession();const token=data?.session?.access_token;if(!token)throw new Error('Please log in before deleting your account.');
  const r=await fetch(DELETE_URL,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:'{}'});const out=await r.json().catch(()=>({}));if(!r.ok)throw new Error(out.error||'Account deletion failed.');
  try{await c.auth.signOut()}catch(_){ }const lang=localStorage.getItem('langar_lang');localStorage.clear();if(lang)localStorage.setItem('langar_lang',lang);alert('Your Langar Club account has been deleted.');location.href='index.html'+(preview?'?storePreview=1':'');
 }catch(e){alert(e instanceof Error?e.message:'Account deletion failed. Please try again.')}
}
function ensureClubDelete(){
 const club=document.getElementById('club');if(!club||document.getElementById('storeClubDelete'))return;
 const wrap=document.createElement('section');wrap.id='storeClubDelete';wrap.className='store-delete-wrap';wrap.style.display='none';wrap.innerHTML='<h3>Delete account</h3><p>Permanently delete your Langar Club account and personal profile. Transaction records that must be kept by law are anonymized.</p><button type="button" class="store-delete-btn">Delete my account permanently</button>';
 club.appendChild(wrap);wrap.querySelector('button').addEventListener('click',deleteAccount);
}
async function syncDelete(){
 const wrap=document.getElementById('storeClubDelete'),c=client();if(!wrap||!c?.auth?.getSession)return;
 try{const {data}=await c.auth.getSession();wrap.style.display=data?.session?.user?'':'none'}catch(_){wrap.style.display='none'}
}
function ensureStaff(){
 if(!native&&!preview)return;const more=document.querySelector('#more .more-grid,#more .cards,#more');if(!more||document.getElementById('storeStaffAccess'))return;
 const a=document.createElement('article');a.id='storeStaffAccess';a.className='more-card';a.innerHTML='<span>🔐</span><div><h3>Staff / Admin</h3><p>Secure staff access for orders, menu, reservations and reports.</p></div>';a.tabIndex=0;a.setAttribute('role','button');
 const go=()=>{location.href='admin.html'+(preview?'?storePreview=1':'?native=1')};a.addEventListener('click',go);a.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')go()});more.appendChild(a)
}
function init(){addStyles();ensureSummary();watchCart();ensureClubDelete();ensureStaff();syncDelete();setInterval(syncDelete,1800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,50),{once:true});else setTimeout(init,50);
})();
