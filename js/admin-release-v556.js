(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
let client=null;
const getClient=()=>window.LangarAdminCloud?.client||window.LangarCloud?.client||null;
async function waitClient(){for(let i=0;i<60;i++){client=getClient();if(client)return client;await new Promise(r=>setTimeout(r,150));}return null}
function toast(msg,ok=true){let n=document.getElementById('v556admintoast');if(!n){n=document.createElement('div');n.id='v556admintoast';document.body.appendChild(n)}n.className='v556-toast '+(ok?'ok':'bad');n.textContent=msg;setTimeout(()=>n.remove(),4500)}
async function updateReservation(id,status){
 const note=prompt('Optional message to customer:','');if(note===null)return;
 const {data,error}=await client.rpc('admin_update_reservation_v556',{p_id:id,p_status:status,p_note:note||''});
 if(error)return toast(error.message,false);toast(data?.message||'Reservation updated and customer notified.');renderReservations();
}
async function renderReservations(){
 const box=$('#reservationsAdmin');if(!box)return;client=client||await waitClient();if(!client)return;
 box.innerHTML='<p>Loading reservations…</p>';
 const {data,error}=await client.from('reservations').select('*').order('reservation_date').order('reservation_time');
 if(error){box.innerHTML=`<p class="error">${esc(error.message)}</p>`;return}
 box.innerHTML=(data||[]).map(r=>`<article class="v556-admin-res status-${esc(r.status)}"><div class="v556-res-main"><h3>${esc(r.reservation_date)} · ${esc(String(r.reservation_time).slice(0,5))}</h3><p><b>${esc(r.customer_name)}</b> · ${esc(r.phone)} · ${Number(r.guests)} guests</p><p>${esc(r.area||'inside')}${r.table_label?` · <b>${esc(r.table_label)}</b>`:''}</p>${r.note?`<p>${esc(r.note)}</p>`:''}<small>Status: <b>${esc(r.status)}</b></small></div><div class="v556-res-actions"><button class="confirm" data-rid="${r.id}" data-rst="confirmed">Confirm</button><button class="reject" data-rid="${r.id}" data-rst="rejected">Reject</button><button class="complete" data-rid="${r.id}" data-rst="completed">Completed</button><button class="noshow" data-rid="${r.id}" data-rst="no_show">No-show</button></div></article>`).join('')||'<p>No reservations yet.</p>';
 $$('[data-rid]',box).forEach(b=>b.onclick=()=>updateReservation(b.dataset.rid,b.dataset.rst));
}
function accordionMenuManager(){
 const box=$('#menuAdmin');if(!box||box.dataset.v556==='1')return;box.dataset.v556='1';
 const menu=typeof window.getMenu==='function'?window.getMenu():[];
 [...box.children].forEach((sec,ci)=>{if(!sec.matches('section'))return;const h=sec.querySelector('h3');const body=[...sec.children].filter(x=>x!==h);const details=document.createElement('details');details.className='v556-menu-category';if(ci===0)details.open=true;const summary=document.createElement('summary');summary.innerHTML=`<span>${h?.innerHTML||'Menu category'}</span><small>${sec.querySelectorAll('tbody tr').length} items</small>`;details.appendChild(summary);const wrap=document.createElement('div');wrap.className='v556-menu-category-body';body.forEach(x=>wrap.appendChild(x));details.appendChild(wrap);sec.replaceWith(details);
  const cat=menu[ci];details.querySelectorAll('tbody tr').forEach((tr,ii)=>{const item=cat?.items?.[ii];const cell=tr.lastElementChild;if(!cell||!item)return;const b=document.createElement('button');b.type='button';b.className='photoItem';b.textContent='Photo';b.onclick=()=>{window.showPanel?.('galleryPanel');setTimeout(()=>{const catSel=$('#v555MenuCat'),itemSel=$('#v555MenuItem');if(catSel){catSel.value=String(cat.cloudId||cat.id);catSel.dispatchEvent(new Event('change'));setTimeout(()=>{if(itemSel)itemSel.value=String(item.cloudId||item.id)},100)}},250)};cell.appendChild(b)})
 });
}
function observeMenu(){const box=$('#menuAdmin');if(!box)return;new MutationObserver(()=>setTimeout(accordionMenuManager,30)).observe(box,{childList:true});setTimeout(accordionMenuManager,100)}
function hookPanels(){const old=window.showPanel;window.showPanel=function(id){const r=old?.apply(this,arguments);setTimeout(()=>{if(id==='reservationsPanel')renderReservations();if(id==='menuPanel'){try{window.renderMenuAdmin?.()}catch{}setTimeout(accordionMenuManager,120)}},80);return r}}
async function init(){await waitClient();hookPanels();observeMenu();client?.channel('v556-admin-res').on('postgres_changes',{event:'*',schema:'public',table:'reservations'},()=>{if(!$('#reservationsPanel')?.classList.contains('hidden'))renderReservations()}).subscribe()}
window.addEventListener('load',()=>setTimeout(init,1000));
})();
