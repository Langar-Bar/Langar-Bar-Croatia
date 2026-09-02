(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let client=null, productMedia=new Map();
const getClient=()=>window.LangarCloud?.client||null;
async function waitClient(){for(let i=0;i<60;i++){client=getClient();if(client)return client;await new Promise(r=>setTimeout(r,150));}return null}
function lang(){return window.state?.lang==='hr'?'hr':'en'}
function toast(msg,ok=true){let n=document.getElementById('v556toast');if(!n){n=document.createElement('div');n.id='v556toast';document.body.appendChild(n)}n.className='v556-toast '+(ok?'ok':'bad');n.textContent=msg;setTimeout(()=>n.remove(),4500)}
function val(f,n){return String(new FormData(f).get(n)||'').trim()}
function ensureReservationExtras(){
 const f=$('#reservationForm');if(!f)return;
 if(!f.querySelector('[name="area"]')){
  const guests=f.querySelector('[name="guests"]')?.closest('label');
  guests?.insertAdjacentHTML('afterend',`<label><span data-hr="Željeni prostor" data-en="Preferred area">Preferred area</span><select name="area"><option value="inside">Inside / Unutra</option><option value="terrace">Terrace / Terasa</option><option value="any">No preference / Svejedno</option></select></label>`);
 }
 if(!$('#myReservations')){
  f.insertAdjacentHTML('afterend',`<section class="section-head compact"><h3 data-en="My reservations" data-hr="Moje rezervacije">My reservations</h3></section><div id="myReservations" class="v556-my-reservations"><p class="muted">Sign in to see your reservations.</p></div>`);
 }
}
async function submitReservation(e){
 e.preventDefault();e.stopImmediatePropagation();
 const f=e.currentTarget,c=client||await waitClient();if(!c)return toast('Cloud connection unavailable.',false);
 const {data:{session}}=await c.auth.getSession();if(!session)return toast('Please sign in before reserving.',false);
 const payload={p_date:val(f,'date'),p_time:val(f,'time'),p_name:val(f,'name'),p_phone:val(f,'phone'),p_guests:Number(val(f,'guests')||1),p_area:val(f,'area')||'any',p_note:val(f,'note')};
 if(!payload.p_date||!payload.p_time||!payload.p_name||!payload.p_phone)return toast('Complete date, time, name and phone.',false);
 const btn=f.querySelector('button');if(btn)btn.disabled=true;
 try{
  const {data,error}=await c.rpc('customer_create_reservation_v556',payload);if(error)throw error;
  const result=typeof data==='string'?JSON.parse(data):data;
  if(result?.status==='confirmed') toast(result.message||'Reservation confirmed automatically.');
  else if(result?.status==='pending') toast(result.message||'Reservation request sent.');
  else if(result?.status==='unavailable'){
   const alt=(result.alternatives||[]).map(x=>`${x.date} ${String(x.time).slice(0,5)}${x.area?' · '+x.area:''}`).join('\n');
   alert((result.message||'That time is full.')+(alt?'\n\nAvailable alternatives:\n'+alt:''));
  } else toast(result?.message||'Reservation saved.');
  if(result?.status!=='unavailable'){f.reset();try{window.renderReservationCalendar?.()}catch{} await loadMyReservations()}
 }catch(err){toast('Reservation error: '+(err.message||String(err)),false)}finally{if(btn)btn.disabled=false}
}
function wireReservation(){ensureReservationExtras();const old=$('#reservationForm');if(!old||old.dataset.v556)return;const f=old.cloneNode(true);old.replaceWith(f);f.dataset.v556='1';f.addEventListener('submit',submitReservation,true)}
async function loadMyReservations(){
 const box=$('#myReservations');if(!box)return;const c=client||await waitClient();if(!c)return;
 const {data:{session}}=await c.auth.getSession();if(!session){box.innerHTML='<p class="muted">Sign in to see your reservations.</p>';return}
 const {data,error}=await c.from('reservations').select('id,reservation_date,reservation_time,guests,area,table_label,status,admin_note,note,created_at').eq('user_id',session.user.id).order('reservation_date',{ascending:false}).order('reservation_time',{ascending:false});
 if(error){box.innerHTML=`<p class="error">${esc(error.message)}</p>`;return}
 box.innerHTML=(data||[]).map(r=>`<article class="v556-res-card status-${esc(r.status)}"><div><b>${esc(r.reservation_date)} · ${esc(String(r.reservation_time).slice(0,5))}</b><span>${esc(r.status)}</span></div><p>${Number(r.guests)} guests · ${esc(r.area||'inside')}${r.table_label?` · ${esc(r.table_label)}`:''}</p>${r.admin_note?`<p class="v556-admin-note">${esc(r.admin_note)}</p>`:''}</article>`).join('')||'<p class="muted">No reservations yet.</p>';
}
async function loadGallery(){
 const g=$('#galleryView');if(!g)return;const c=client||await waitClient();if(!c)return;
 g.innerHTML='<p>Loading gallery…</p>';
 const {data,error}=await c.from('gallery_items').select('*').eq('active',true).in('photo_role',['gallery','both']).order('sort_order').order('created_at',{ascending:false});
 if(error){g.innerHTML=`<p class="error">${esc(error.message)}</p>`;return}
 const l=lang();g.innerHTML=(data||[]).map(i=>`<article class="v556-public-photo"><img loading="lazy" src="${esc(i.image_url)}?v=${Date.parse(i.updated_at||i.created_at||Date.now())}" alt="${esc((l==='hr'?i.title_hr:i.title_en)||i.title_en||i.title_hr||'Langar Bar')}"><div><b>${esc((l==='hr'?i.title_hr:i.title_en)||i.title_en||i.title_hr||'')}</b><small>${esc(i.category||'Gallery')}</small></div></article>`).join('')||'<p>No gallery photos yet.</p>';
}
async function loadProductMedia(){
 const c=client||await waitClient();if(!c)return;const {data,error}=await c.from('menu_item_media').select('*').eq('active',true);if(error)return;
 productMedia=new Map((data||[]).map(x=>[String(x.menu_item_id),x]));patchItemRenderer();try{window.renderMenu?.();window.renderOrderMenu?.()}catch{}
}
function mediaFor(item){return productMedia.get(String(item?.cloudId||item?.id||''))}
function patchItemRenderer(){
 if(typeof window.itemNode==='function'&&!window.itemNode.__v556){const orig=window.itemNode;window.itemNode=function(item,orderMode){const node=orig(item,orderMode),m=mediaFor(item);if(m&&!node.querySelector('.v556-product-thumb')){const img=document.createElement('img');img.className='v556-product-thumb';img.src=m.image_url+'?v='+Date.parse(m.updated_at||Date.now());img.alt=item.name?.en||item.name_en||item.id||'Product';node.prepend(img);node.classList.add('v556-has-photo')}return node};window.itemNode.__v556=true}
 if(typeof window.openDetails==='function'&&!window.openDetails.__v556){const orig=window.openDetails;window.openDetails=function(item,orderMode){orig(item,orderMode);const m=mediaFor(item),body=$('#modalBody');if(m&&body&&!body.querySelector('.v556-product-hero')){const img=document.createElement('img');img.className='v556-product-hero';img.src=m.image_url+'?v='+Date.parse(m.updated_at||Date.now());img.alt=item.name?.en||item.id||'Product';body.prepend(img)}};window.openDetails.__v556=true}
}
async function init(){await waitClient();wireReservation();loadMyReservations();loadGallery();loadProductMedia();
 client?.channel('v556-customer').on('postgres_changes',{event:'*',schema:'public',table:'reservations'},loadMyReservations).on('postgres_changes',{event:'*',schema:'public',table:'gallery_items'},loadGallery).on('postgres_changes',{event:'*',schema:'public',table:'menu_item_media'},loadProductMedia).subscribe();
 document.addEventListener('click',e=>{if(e.target.closest('[data-go="reservation"]'))setTimeout(()=>{wireReservation();loadMyReservations()},120);if(e.target.closest('[data-go="gallery"]'))setTimeout(loadGallery,120)},true);
 setInterval(wireReservation,1500);
}
window.addEventListener('load',()=>setTimeout(init,900));
})();
