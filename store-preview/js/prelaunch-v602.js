(()=>{
'use strict';
const VERSION='6.0.2';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const cloud=()=>window.langarSupabase||window.supabaseClient||window.sb||window.LangarCloud?.client||null;
const getLang=()=>{const v=(localStorage.getItem('langar_lang')||document.documentElement.lang||'hr').toLowerCase();return v.startsWith('en')?'en':'hr'};
let openingTimer=null,openingChannel=null,openingRetry=0,dedupeLock=false,versionBusy=false;

function cleanPopularDuplicates(){
 if(dedupeLock)return;dedupeLock=true;
 try{
  const view=document.getElementById('ask-barista');if(!view)return;
  const blocks=[...view.querySelectorAll('.popular-questions,.knowledge-suggestions,.suggested-questions,[data-popular-questions],section,div')]
   .filter(el=>/popular questions|popularna pitanja/i.test((el.querySelector('h2,h3,h4')?.textContent||'').trim()));
  blocks.slice(1).forEach(el=>el.remove());
 }finally{setTimeout(()=>dedupeLock=false,80)}
}
function rerenderLanguage(){
 document.querySelectorAll('[data-en][data-hr]').forEach(el=>{const val=el.getAttribute('data-'+getLang());if(val!=null)el.textContent=val});
 try{window.LangarKnowledgeV542?.history?.()}catch(_){ }
 try{window.LangarKnowledgeV542?.suggested?.()}catch(_){ }
 setTimeout(cleanPopularDuplicates,30);setTimeout(cleanPopularDuplicates,250);
 renderOpening(window.__langarOpeningV602||null);
 document.dispatchEvent(new CustomEvent('langar:languagechanged',{detail:{lang:getLang()}}));
}
function installLanguageBridge(){
 const btn=document.getElementById('langBtn');
 if(btn&&!btn.dataset.v602){btn.dataset.v602='1';btn.addEventListener('click',()=>setTimeout(rerenderLanguage,30))}
 window.addEventListener('storage',e=>{if(e.key==='langar_lang')rerenderLanguage()});
 document.addEventListener('click',e=>{if(e.target.closest('#langBtn,[data-language],[data-lang]'))setTimeout(rerenderLanguage,50)},true);
 const ask=document.getElementById('ask-barista');if(ask)new MutationObserver(cleanPopularDuplicates).observe(ask,{childList:true,subtree:true});
 setTimeout(cleanPopularDuplicates,300);
}
function openingLabel(o){const L=getLang();const map={opening_soon:{hr:'Uskoro otvaramo',en:'Opening Soon'},soft_opening:{hr:'Probno otvorenje',en:'Soft Opening'},grand_opening:{hr:'Svečano otvorenje',en:'Grand Opening'},open_now:{hr:'Otvoreno',en:'Open Now'}};return(map[o?.status]||map.opening_soon)[L]}
function ensureOpeningHost(){
 let host=document.getElementById('langarOpeningV602');if(host)return host;
 document.getElementById('langarOpeningV601')?.remove();
 const home=document.getElementById('home');if(!home)return null;
 host=document.createElement('section');host.id='langarOpeningV602';host.className='opening-v602';
 const anchor=home.querySelector('.hero,.section-head,.home-hero')||home.firstElementChild;
 if(anchor)anchor.insertAdjacentElement('afterend',host);else home.prepend(host);
 return host;
}
function renderOpening(o){
 if(openingTimer){clearInterval(openingTimer);openingTimer=null}
 const host=ensureOpeningHost();if(!host)return;
 if(!o||o.enabled===false){host.hidden=true;return}
 host.hidden=false;window.__langarOpeningV602=o;
 const L=getLang(),title=openingLabel(o),headline=L==='hr'?(o.headline_hr||title):(o.headline_en||title),announcement=L==='hr'?(o.announcement_hr||''):(o.announcement_en||'');
 const hero=o.hero_image_url?`<img class="opening-v602-image" src="${esc(o.hero_image_url)}" alt="${esc(headline)}">`:'';
 host.innerHTML=`${hero}<div class="opening-v602-inner"><span class="opening-v602-kicker">${esc(title)}</span><h2>${esc(headline)}</h2>${announcement?`<p>${esc(announcement)}</p>`:''}<div id="openingCountdownV602" class="opening-countdown-v602" ${o.opening_at?'':'hidden'}></div>${!o.opening_at&&o.status!=='open_now'?`<small>${L==='hr'?'Točan datum objavit ćemo uskoro.':'The exact date will be announced soon.'}</small>`:''}</div>`;
 if(o.opening_at){
  const target=new Date(o.opening_at).getTime();
  const draw=()=>{const out=document.getElementById('openingCountdownV602');if(!out)return;const d=target-Date.now();if(!Number.isFinite(target)){out.hidden=true;return}if(d<=0){out.innerHTML=`<strong>${esc(openingLabel({...o,status:'open_now'}))}</strong>`;return}const days=Math.floor(d/86400000),hours=Math.floor(d%86400000/3600000),mins=Math.floor(d%3600000/60000),secs=Math.floor(d%60000/1000),labels=L==='hr'?['dana','sati','min','sek']:['days','hours','min','sec'];out.innerHTML=[[days,labels[0]],[hours,labels[1]],[mins,labels[2]],[secs,labels[3]]].map(([n,l])=>`<span><b>${n}</b><small>${l}</small></span>`).join('')};
  draw();openingTimer=setInterval(draw,1000);
 }
}
async function fetchOpening(){
 const c=cloud();if(!c){if(openingRetry++<30)setTimeout(fetchOpening,500);return}
 let data,error;
 try{({data,error}=await c.from('opening_management').select('*').eq('id',1).maybeSingle())}catch(e){error=e}
 if(error||!data){try{({data,error}=await c.rpc('get_opening_settings_v600'))}catch(e){error=e}}
 const o=Array.isArray(data)?data[0]:data;
 if(!error&&o){openingRetry=0;renderOpening(o);subscribeOpening(c)}else if(openingRetry++<15)setTimeout(fetchOpening,1200);
}
function subscribeOpening(c){
 if(openingChannel||!c?.channel)return;
 openingChannel=c.channel('opening-v602').on('postgres_changes',{event:'*',schema:'public',table:'opening_management'},p=>renderOpening(p.new||p.old)).subscribe();
 try{const bc=new BroadcastChannel('langar-opening');bc.onmessage=e=>{if(e.data)renderOpening(e.data)}}catch(_){ }
}
function compareVersions(a,b){const A=String(a).split('.').map(Number),B=String(b).split('.').map(Number);for(let i=0;i<Math.max(A.length,B.length);i++){const x=A[i]||0,y=B[i]||0;if(x!==y)return x-y}return 0}
function updateDialog(remote,force=false){
 let box=document.getElementById('langarUpdateV602');if(box)return;
 document.getElementById('langarUpdateV601')?.remove();
 const L=getLang();box=document.createElement('div');box.id='langarUpdateV602';box.className='update-v602';
 box.innerHTML=`<div><h3>${L==='hr'?'Dostupna je nova verzija':'A new version is available'}</h3><p>${L==='hr'?'Ažurirajte aplikaciju kako biste dobili najnovija poboljšanja.':'Update the app to receive the latest improvements.'}</p><div class="update-actions-v602"><button id="langarUpdateNowV602" class="update-primary-v602">${L==='hr'?'Ažuriraj sada':'Update now'}</button>${force?'':`<button id="langarUpdateLaterV602" class="update-secondary-v602">${L==='hr'?'Kasnije':'Later'}</button>`}</div></div>`;
 document.body.appendChild(box);
 box.querySelector('#langarUpdateLaterV602')?.addEventListener('click',()=>box.remove());
 box.querySelector('#langarUpdateNowV602').onclick=hardUpdate;
}
async function hardUpdate(){
 const box=document.getElementById('langarUpdateV602');const btn=document.getElementById('langarUpdateNowV602');if(btn){btn.disabled=true;btn.textContent=getLang()==='hr'?'Ažuriranje…':'Updating…'}
 try{
  if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs){try{await r.update();r.waiting?.postMessage({type:'SKIP_WAITING'})}catch(_){}}}
  if('caches'in window){for(const k of await caches.keys())await caches.delete(k)}
  localStorage.setItem('langar_applied_version',VERSION);
 }catch(_){ }
 box?.remove();
 const url=new URL(location.href);url.searchParams.set('v','602');url.searchParams.set('_u',Date.now());location.replace(url.toString());
}
async function checkVersion(){
 if(versionBusy)return;versionBusy=true;
 try{
  const r=await fetch('./app-version.json?_='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('version file');
  const j=await r.json(),remote=String(j.version||'');
  if(remote&&compareVersions(remote,VERSION)>0)updateDialog(remote,!!j.force_update);
  else{document.getElementById('langarUpdateV602')?.remove();localStorage.setItem('langar_applied_version',VERSION)}
 }catch(_){ }finally{versionBusy=false}
}
function removeLegacyUpdateButtons(){document.getElementById('langarManualUpdateV601')?.remove();document.querySelectorAll('.manual-update-v601,[id^="langarManualUpdate"]').forEach(x=>x.remove())}
function init(){removeLegacyUpdateButtons();installLanguageBridge();fetchOpening();checkVersion();setInterval(checkVersion,180000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){removeLegacyUpdateButtons();checkVersion();fetchOpening()}})}
document.addEventListener('DOMContentLoaded',init);setTimeout(init,900);
})();
