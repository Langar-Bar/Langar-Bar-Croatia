(()=>{
'use strict';
const VERSION='6.0.1';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const cloud=()=>window.langarSupabase||window.supabaseClient||window.sb||window.LangarCloud?.client||null;
const getLang=()=>{
  const v=(localStorage.getItem('langar_lang')||document.documentElement.lang||'hr').toLowerCase();
  return v.startsWith('en')?'en':'hr';
};
let openingTimer=null, openingChannel=null, openingRetry=0, dedupeLock=false;

function cleanPopularDuplicates(){
  if(dedupeLock)return; dedupeLock=true;
  try{
    const view=document.getElementById('ask-barista'); if(!view)return;
    const blocks=[...view.querySelectorAll('.popular-questions,.knowledge-suggestions,.suggested-questions,[data-popular-questions],section,div')]
      .filter(el=>/popular questions|popularna pitanja/i.test((el.querySelector('h2,h3,h4')?.textContent||'').trim()));
    blocks.slice(1).forEach(el=>el.remove());
  }finally{setTimeout(()=>dedupeLock=false,50)}
}
function rerenderLanguage(){
  document.querySelectorAll('[data-en][data-hr]').forEach(el=>{
    const L=getLang(); const val=el.getAttribute('data-'+L); if(val!=null)el.textContent=val;
  });
  try{window.LangarKnowledgeV542?.history?.();}catch(_){ }
  // Rebuild suggestions once, then remove any duplicate containers produced by legacy code.
  try{window.LangarKnowledgeV542?.suggested?.();}catch(_){ }
  setTimeout(cleanPopularDuplicates,30); setTimeout(cleanPopularDuplicates,180);
  renderOpening(window.__langarOpeningV601||null);
  document.dispatchEvent(new CustomEvent('langar:languagechanged',{detail:{lang:getLang()}}));
}
function installLanguageBridge(){
  const btn=document.getElementById('langBtn');
  if(btn&&!btn.dataset.v601){btn.dataset.v601='1';btn.addEventListener('click',()=>setTimeout(rerenderLanguage,20));}
  window.addEventListener('storage',e=>{if(e.key==='langar_lang')rerenderLanguage()});
  document.addEventListener('click',e=>{if(e.target.closest('#langBtn,[data-language],[data-lang]'))setTimeout(rerenderLanguage,40)},true);
  const ask=document.getElementById('ask-barista');
  if(ask)new MutationObserver(cleanPopularDuplicates).observe(ask,{childList:true,subtree:true});
  setTimeout(cleanPopularDuplicates,300);
}
function openingLabel(o){
  const L=getLang();
  const map={opening_soon:{hr:'Uskoro otvaramo',en:'Opening Soon'},soft_opening:{hr:'Probno otvorenje',en:'Soft Opening'},grand_opening:{hr:'Svečano otvorenje',en:'Grand Opening'},open_now:{hr:'Otvoreno',en:'Open Now'}};
  return (map[o?.status]||map.opening_soon)[L];
}
function ensureOpeningHost(){
  let host=document.getElementById('langarOpeningV601'); if(host)return host;
  const home=document.getElementById('home'); if(!home)return null;
  host=document.createElement('section'); host.id='langarOpeningV601'; host.className='opening-v601';
  const anchor=home.querySelector('.hero,.section-head,.home-hero')||home.firstElementChild;
  if(anchor)anchor.insertAdjacentElement('afterend',host); else home.prepend(host);
  return host;
}
function renderOpening(o){
  if(openingTimer){clearInterval(openingTimer);openingTimer=null}
  const host=ensureOpeningHost(); if(!host)return;
  if(!o||o.enabled===false){host.hidden=true;return}
  host.hidden=false; window.__langarOpeningV601=o;
  const L=getLang(),title=openingLabel(o),headline=L==='hr'?(o.headline_hr||title):(o.headline_en||title),announcement=L==='hr'?(o.announcement_hr||''):(o.announcement_en||'');
  const hero=o.hero_image_url?`<img class="opening-v601-image" src="${esc(o.hero_image_url)}" alt="${esc(headline)}">`:'';
  host.innerHTML=`${hero}<div class="opening-v601-inner"><span class="opening-v601-kicker">${esc(title)}</span><h2>${esc(headline)}</h2>${announcement?`<p>${esc(announcement)}</p>`:''}<div id="openingCountdownV601" class="opening-countdown-v601" ${o.opening_at?'':'hidden'}></div>${!o.opening_at&&o.status!=='open_now'?`<small>${L==='hr'?'Točan datum objavit ćemo uskoro.':'The exact date will be announced soon.'}</small>`:''}</div>`;
  if(o.opening_at){
    const draw=()=>{const out=document.getElementById('openingCountdownV601');if(!out)return;const d=new Date(o.opening_at).getTime()-Date.now();if(d<=0){out.innerHTML=`<strong>${esc(openingLabel({...o,status:'open_now'}))}</strong>`;return}const days=Math.floor(d/86400000),hours=Math.floor(d%86400000/3600000),mins=Math.floor(d%3600000/60000),secs=Math.floor(d%60000/1000),labels=L==='hr'?['dana','sati','min','sek']:['days','hours','min','sec'];out.innerHTML=[[days,labels[0]],[hours,labels[1]],[mins,labels[2]],[secs,labels[3]]].map(([n,l])=>`<span><b>${n}</b><small>${l}</small></span>`).join('')};
    draw(); openingTimer=setInterval(draw,1000);
  }
}
async function fetchOpening(){
  const c=cloud(); if(!c){if(openingRetry++<20)setTimeout(fetchOpening,500);return}
  let data,error;
  try{({data,error}=await c.rpc('get_opening_settings_v600'));}catch(e){error=e}
  if(error){
    try{({data,error}=await c.from('opening_management').select('*').eq('id',1).maybeSingle());}catch(e){error=e}
  }
  const o=Array.isArray(data)?data[0]:data;
  if(!error&&o){renderOpening(o);subscribeOpening(c)}
  else if(openingRetry++<10)setTimeout(fetchOpening,1200);
}
function subscribeOpening(c){
  if(openingChannel||!c?.channel)return;
  openingChannel=c.channel('opening-v601').on('postgres_changes',{event:'*',schema:'public',table:'opening_management'},p=>renderOpening(p.new||p.old)).subscribe();
}
function updateDialog(remote,force=false){
  if(document.getElementById('langarUpdateV601'))return;
  const L=getLang(),box=document.createElement('div');box.id='langarUpdateV601';box.className='update-v601';
  box.innerHTML=`<div><h3>${L==='hr'?'Dostupna je nova verzija':'A new version is available'}</h3><p>${L==='hr'?'Ažurirajte aplikaciju kako biste dobili najnovija poboljšanja.':'Update the app to receive the latest improvements.'}</p><button id="langarUpdateNowV601" class="primary">${L==='hr'?'Ažuriraj sada':'Update now'}</button>${force?'':`<button id="langarUpdateLaterV601" class="secondary">${L==='hr'?'Kasnije':'Later'}</button>`}</div>`;
  document.body.appendChild(box);
  box.querySelector('#langarUpdateLaterV601')?.addEventListener('click',()=>box.remove());
  box.querySelector('#langarUpdateNowV601').onclick=hardUpdate;
}
async function hardUpdate(){
  const btn=document.getElementById('langarUpdateNowV601');if(btn){btn.disabled=true;btn.textContent=getLang()==='hr'?'Ažuriranje…':'Updating…'}
  try{
    if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs){try{r.waiting?.postMessage({type:'SKIP_WAITING'});await r.unregister()}catch(_){}}}
    if('caches'in window){for(const k of await caches.keys())await caches.delete(k)}
    localStorage.setItem('langar_seen_version',VERSION);
  }catch(_){ }
  const base=location.pathname; location.replace(base+'?v=601&t='+Date.now());
}
function addManualUpdateButton(){
  if(document.getElementById('langarManualUpdateV601'))return;
  const b=document.createElement('button');b.id='langarManualUpdateV601';b.type='button';b.className='manual-update-v601';b.textContent=getLang()==='hr'?'Provjeri ažuriranje':'Check update';b.onclick=()=>checkVersion(true);document.body.appendChild(b);
}
async function checkVersion(manual=false){
  try{
    const r=await fetch('./app-version.json?t='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'}});if(!r.ok)throw new Error('version file');
    const j=await r.json(),remote=String(j.version||'');
    if(remote&&remote!==VERSION)updateDialog(remote,!!j.force_update);
    else if(manual){const L=getLang();alert(L==='hr'?'Aplikacija je ažurirana.':'The app is up to date.');}
  }catch(e){if(manual)alert(getLang()==='hr'?'Provjera ažuriranja trenutno nije dostupna.':'Update check is temporarily unavailable.');}
}
function init(){installLanguageBridge();fetchOpening();addManualUpdateButton();checkVersion();setInterval(()=>checkVersion(false),120000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){checkVersion();fetchOpening()}})}
document.addEventListener('DOMContentLoaded',init);setTimeout(init,900);
})();
