(()=>{
'use strict';
const VERSION='6.0.0';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const cloud=()=>window.langarSupabase||window.supabaseClient||window.sb||window.LangarCloud?.client||null;
const lang=()=>localStorage.langar_lang==='en'?'en':'hr';
let countdownTimer=null;
function refreshLanguageModules(){
  setTimeout(()=>{
    try{ window.LangarKnowledgeV542?.suggested?.(); window.LangarKnowledgeV542?.history?.(); }catch(e){}
    renderOpening(window.__langarOpeningV600||null);
    document.dispatchEvent(new CustomEvent('langar:languagechanged',{detail:{lang:lang()}}));
  },80);
}
function installLanguageBridge(){
 const btn=document.getElementById('langBtn');
 if(btn&&!btn.dataset.v600){btn.dataset.v600='1';btn.addEventListener('click',refreshLanguageModules);}
 window.addEventListener('storage',e=>{if(e.key==='langar_lang')refreshLanguageModules()});
 const root=document.documentElement;
 new MutationObserver(()=>refreshLanguageModules()).observe(root,{attributes:true,attributeFilter:['lang']});
}
function openingCopy(o){
 const L=lang(),status=o?.status||'opening_soon';
 const map={
  opening_soon:{hr:'Uskoro otvaramo',en:'Opening Soon'},
  soft_opening:{hr:'Probno otvorenje',en:'Soft Opening'},
  grand_opening:{hr:'Svečano otvorenje',en:'Grand Opening'},
  open_now:{hr:'Otvoreno',en:'Open Now'}
 };
 return map[status]?.[L]||map.opening_soon[L];
}
function ensureOpeningHost(){
 let host=document.getElementById('langarOpeningV600');
 if(host)return host;
 const home=document.getElementById('home')||document.querySelector('main.view');
 if(!home)return null;
 host=document.createElement('section');host.id='langarOpeningV600';host.className='opening-v600';
 const anchor=home.querySelector('.hero,.section-head')||home.firstElementChild;
 anchor?.insertAdjacentElement('afterend',host);
 return host;
}
function renderOpening(o){
 if(countdownTimer){clearInterval(countdownTimer);countdownTimer=null}
 const host=ensureOpeningHost();if(!host)return;
 if(!o||o.enabled===false){host.hidden=true;return}
 host.hidden=false;window.__langarOpeningV600=o;
 const L=lang(),title=openingCopy(o),announcement=L==='hr'?(o.announcement_hr||''):(o.announcement_en||'');
 const hasDate=!!o.opening_at;
 host.innerHTML=`<div class="opening-v600-inner"><span class="opening-v600-kicker">${esc(title)}</span><h2>${esc(L==='hr'?(o.headline_hr||title):(o.headline_en||title))}</h2>${announcement?`<p>${esc(announcement)}</p>`:''}<div id="openingCountdownV600" class="opening-countdown-v600" ${hasDate?'':'hidden'}></div>${!hasDate&&o.status!=='open_now'?`<small>${L==='hr'?'Točan datum objavit ćemo uskoro.':'The exact date will be announced soon.'}</small>`:''}</div>`;
 if(hasDate){
  const draw=()=>{
   const out=document.getElementById('openingCountdownV600');if(!out)return;
   const d=new Date(o.opening_at).getTime()-Date.now();
   if(d<=0){out.innerHTML=`<strong>${esc(openingCopy({...o,status:'open_now'}))}</strong>`;return}
   const days=Math.floor(d/86400000),hours=Math.floor(d%86400000/3600000),mins=Math.floor(d%3600000/60000),secs=Math.floor(d%60000/1000);
   const labels=L==='hr'?['dana','sati','min','sek']:['days','hours','min','sec'];
   out.innerHTML=[[days,labels[0]],[hours,labels[1]],[mins,labels[2]],[secs,labels[3]]].map(([n,l])=>`<span><b>${n}</b><small>${l}</small></span>`).join('');
  };draw();countdownTimer=setInterval(draw,1000);
 }
}
async function loadOpening(){
 const c=cloud();if(!c)return;
 const {data,error}=await c.rpc('get_opening_settings_v600');
 if(!error){const o=Array.isArray(data)?data[0]:data;renderOpening(o)}
}
function updateDialog(remote){
 if(document.getElementById('langarUpdateV600'))return;
 const L=lang(),box=document.createElement('div');box.id='langarUpdateV600';box.className='update-v600';
 box.innerHTML=`<div><h3>${L==='hr'?'Dostupna je nova verzija':'A new version is available'}</h3><p>${L==='hr'?'Ažurirajte aplikaciju kako biste dobili najnovija poboljšanja.':'Update the app to receive the latest improvements.'}</p><button id="langarUpdateNowV600" class="primary">${L==='hr'?'Ažuriraj sada':'Update now'}</button><button id="langarUpdateLaterV600" class="secondary">${L==='hr'?'Kasnije':'Later'}</button></div>`;
 document.body.appendChild(box);
 box.querySelector('#langarUpdateLaterV600').onclick=()=>box.remove();
 box.querySelector('#langarUpdateNowV600').onclick=async()=>{
   try{
    const regs=await navigator.serviceWorker?.getRegistrations?.()||[];
    for(const r of regs){await r.update();r.waiting?.postMessage({type:'SKIP_WAITING'});}
    if('caches' in window){for(const k of await caches.keys())await caches.delete(k)}
   }catch(e){}
   localStorage.setItem('langar_seen_version',remote);
   location.replace(location.pathname+'?v='+encodeURIComponent(remote)+'&t='+Date.now());
 };
}
async function checkVersion(){
 try{
  const r=await fetch('app-version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;
  const j=await r.json(),remote=String(j.version||'');
  const seen=localStorage.getItem('langar_seen_version');
  if(remote&&remote!==VERSION&&remote!==seen)updateDialog(remote);
 }catch(e){}
}
function init(){installLanguageBridge();loadOpening();checkVersion();setInterval(checkVersion,5*60*1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkVersion()})}
document.addEventListener('DOMContentLoaded',init);setTimeout(init,1200);
})();
