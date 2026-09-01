(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const client=()=>window.LangarAdminCloud?.client||null;
let knownOrders=new Set(),knownCancel=new Map(),primed=false,audio=null,lastAlert='';
function unlockAudio(){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume()}catch{}}
document.addEventListener('pointerdown',unlockAudio,{once:false,capture:true});
function tone(freq,when,dur=.16,g=.12){try{unlockAudio();if(!audio||audio.state!=='running')return;const o=audio.createOscillator(),v=audio.createGain();o.type='sine';o.frequency.value=freq;v.gain.setValueAtTime(.001,when);v.gain.exponentialRampToValueAtTime(g,when+.02);v.gain.exponentialRampToValueAtTime(.001,when+dur);o.connect(v);v.connect(audio.destination);o.start(when);o.stop(when+dur+.03)}catch{}}
function escalating(kind='order'){try{unlockAudio();if(!audio||audio.state!=='running')return;const t=audio.currentTime+.03;const seq=kind==='cancel'?[980,760,980,760,1120]:[520,660,820,1040];seq.forEach((f,i)=>tone(f,t+i*.18,.14,.15+i*.018));setTimeout(()=>{if(audio?.state==='running'){const q=audio.currentTime+.03;const seq2=kind==='cancel'?[1120,860,1120,860]:[660,820,1040,1320];seq2.forEach((f,i)=>tone(f,q+i*.16,.13,.17+i*.015))}},900)}catch{}}
function toast(text,kind='order'){let x=$('#v610OrderToast');if(!x){x=document.createElement('div');x.id='v610OrderToast';document.body.appendChild(x)}x.dataset.kind=kind;x.textContent=(kind==='cancel'?'⚠️ ':'🔔 ')+text;clearTimeout(x._t);x._t=setTimeout(()=>x.remove(),12000)}
function openOrders(id,kind='order'){try{if(typeof window.showPanel==='function')window.showPanel('ordersPanel');else $$('.panel').forEach(p=>p.classList.toggle('hidden',p.id!=='ordersPanel'));localStorage.langar_admin_order_filter='live';setTimeout(()=>$('#refreshCloudOrders')?.click(),80);setTimeout(()=>{const cards=$$('.cloud-order-card');const card=cards.find(c=>c.textContent.includes(id))||cards[0];if(card){card.classList.add(kind==='cancel'?'v610-cancel-focus':'v610-new-order-focus');card.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>card.classList.remove('v610-new-order-focus','v610-cancel-focus'),9000)}},700)}catch(e){console.warn('[V610] focus order',e)}}
function browserNote(title,body,tag){try{if('Notification'in window&&Notification.permission==='granted')new Notification(title,{body,icon:'assets/admin-icon-192.png',badge:'assets/admin-icon-192.png',tag})}catch{}}
async function poll(){const c=client();if(!c||document.body.classList.contains('admin-locked'))return;try{
  const {data,error}=await c.from('customer_orders').select('id,order_number,status,is_test,created_at,cancel_requested_at,cancel_status,cancel_reason_code,cancel_reason_note,updated_at').eq('is_test',false).in('status',['new','accepted','preparing','ready']).order('created_at',{ascending:false}).limit(80);
  if(error)throw error;
  const rows=data||[],ids=new Set(rows.map(x=>String(x.id)));
  if(!primed){knownOrders=ids;rows.forEach(x=>knownCancel.set(String(x.id),`${x.cancel_requested_at||''}|${x.cancel_status||''}`));primed=true;return}
  const cancelFresh=rows.filter(x=>{const key=String(x.id),sig=`${x.cancel_requested_at||''}|${x.cancel_status||''}`,old=knownCancel.get(key)||'';return x.cancel_requested_at&&String(x.cancel_status||'requested')==='requested'&&sig!==old});
  rows.forEach(x=>knownCancel.set(String(x.id),`${x.cancel_requested_at||''}|${x.cancel_status||''}`));
  const fresh=rows.filter(x=>!knownOrders.has(String(x.id)));knownOrders=ids;
  if(cancelFresh.length){const first=cancelFresh[0],sig='cancel:'+String(first.id)+':'+first.cancel_requested_at;if(sig!==lastAlert){lastAlert=sig;escalating('cancel');toast(`CANCELLATION REQUEST — ${first.order_number||String(first.id).slice(0,8)}. Review and approve/reject.`,'cancel');openOrders(first.order_number||String(first.id).slice(0,8),'cancel');browserNote('Langar Bar — CANCELLATION REQUEST',`${first.order_number||String(first.id).slice(0,8)} requested cancellation. Open Orders to approve or reject.`,'langar-admin-cancel-request')}}
  if(fresh.length){const first=fresh[0],sig='order:'+String(first.id);if(sig!==lastAlert){lastAlert=sig;escalating('order');toast(`NEW ORDER ${first.order_number||String(first.id).slice(0,8)} — opening Orders now`,'order');openOrders(first.order_number||String(first.id).slice(0,8),'order');browserNote('Langar Bar — NEW ORDER',`${first.order_number||String(first.id).slice(0,8)} received. Orders panel opened automatically.`,'langar-admin-new-order')}}
}catch(e){console.warn('[V610] order/cancel watch',e?.message||e)}}
function rgb(s){const m=String(s||'').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);return m?[+m[1],+m[2],+m[3]]:null}
function isDarkGreen(c){return !!c&&c[1]>c[0]*1.12&&c[1]>c[2]*1.03&&c[1]>=35&&c[1]<155&&((c[0]+c[1]+c[2])/3)<120}
function isLight(c){return !!c&&((c[0]*.2126+c[1]*.7152+c[2]*.0722)/255)>.66}
function hasGreenGradient(s){s=String(s||'').toLowerCase();return /rgb\((1[0-9]|2[0-9]|3[0-9]),\s*(4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9]|1[01][0-9]),\s*(1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])\)/.test(s)||s.includes('#123f2e')||s.includes('#1e4435')||s.includes('#0f211a')||s.includes('#173429')}
function hasGoldGradient(s){s=String(s||'').toLowerCase();return s.includes('217, 180, 95')||s.includes('245, 215, 139')||s.includes('216, 178, 74')||s.includes('#d8b24a')||s.includes('#d9b45f')||s.includes('#f5d78b')||s.includes('#ffe066')}
function setText(el,color,toneName){el.style.setProperty('color',color,'important');el.style.setProperty('text-shadow','none','important');if(toneName)el.dataset.v610Tone=toneName;el.querySelectorAll('*').forEach(x=>{x.style.setProperty('color',color,'important');x.style.setProperty('text-shadow','none','important')})}
function fixButtonText(){$$('button,a.secondary,a.primary,.button-link').forEach(b=>{if(b.classList.contains('danger')||b.closest('.danger')){setText(b,'#fff','danger');return}const cs=getComputedStyle(b),bg=rgb(cs.backgroundColor),img=cs.backgroundImage||'';const green=isDarkGreen(bg)||hasGreenGradient(img);const gold=hasGoldGradient(img)||hasGoldGradient(cs.backgroundColor);const light=isLight(bg);if(green){setText(b,'#f2d36b','green')}else if(gold||light){setText(b,'#080808','light')}else{setText(b,'#f7f7f2','dark')}})}
new MutationObserver(fixButtonText).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','aria-pressed']});
setInterval(fixButtonText,900);setInterval(poll,2200);setTimeout(()=>{fixButtonText();poll()},500);
window.LangarAdminV610={poll,unlockAudio,fixButtonText,version:'6.2.3'};
})();
