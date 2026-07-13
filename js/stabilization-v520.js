(()=>{
'use strict';
const URL='https://fkanccgigogbxodiljqt.supabase.co', KEY='sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7';
const client=window.supabase?.createClient?.(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}}); if(!client)return;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function session(){return (await client.auth.getSession()).data.session}
async function loadReservations(){
 const {data}=await client.from('reservations').select('reservation_date,reservation_time,status').in('status',['pending','confirmed']).gte('reservation_date',new Date().toISOString().slice(0,10));
 if(data){localStorage.setItem('langar_reservations',JSON.stringify(data.map(r=>({date:r.reservation_date,time:String(r.reservation_time).slice(0,5),status:r.status})))); try{window.renderReservationCalendar?.()}catch{}}
}
function wireReservation(){const f=document.getElementById('reservationForm'); if(!f||f.dataset.cloud520)return; f.dataset.cloud520='1';
 f.addEventListener('submit',async e=>{e.preventDefault();e.stopImmediatePropagation(); const s=await session(); if(!s){alert('Please login to Langar Club before making a reservation.');return}
 const d=Object.fromEntries(new FormData(f).entries()); if(!d.time){alert('Please choose a time.');return}
 const btn=f.querySelector('button[type=submit],button:not([type])'); if(btn)btn.disabled=true;
 const {error}=await client.rpc('customer_create_reservation_v520',{p_date:d.date,p_time:d.time,p_name:d.name,p_phone:d.phone,p_guests:+d.guests,p_note:d.note||''});
 if(btn)btn.disabled=false; if(error){alert('Reservation error: '+error.message);return} alert('Reservation request sent. You will receive confirmation in the app.'); f.reset(); document.getElementById('reservationTime').value=''; await loadReservations();
 },true);
}
async function loadGallery(){const g=document.getElementById('galleryView'); if(!g)return; const {data,error}=await client.from('gallery_items').select('*').eq('active',true).order('sort_order').order('created_at',{ascending:false}); if(error||!data?.length)return;
 g.innerHTML=data.map(i=>`<article><img src="${esc(i.image_url)}" alt="${esc(i.title_en||i.title_hr||'Langar Bar')}"><b>${esc((window.state?.lang==='hr'?i.title_hr:i.title_en)||i.title_en||i.title_hr||'')}</b><small>${esc(i.category||'Gallery')}</small></article>`).join('');
}
async function loadPublicReviews(){const boxes=[document.getElementById('publicFeedbackList'),document.querySelector('.home-reviews>div')].filter(Boolean); if(!boxes.length)return; const {data}=await client.from('public_reviews_v520').select('*').order('published_at',{ascending:false}).limit(20); if(!data?.length)return;
 const html=data.map(r=>`<article class="review-card"><b>${'★'.repeat(+r.rating||5)}</b>${r.item_name?`<h4>${esc(r.item_name)}</h4>`:''}<p>${esc(r.comment||'')}</p><small>${esc(r.customer_name||'Langar guest')}</small></article>`).join(''); boxes.forEach(b=>b.innerHTML=html);
}
async function syncImportantInbox(){const s=await session();if(!s)return; const {data}=await client.from('inbox_messages').select('*').eq('user_id',s.user.id).eq('is_deleted',false).eq('priority','important').is('shown_at',null).order('created_at',{ascending:false}).limit(1); if(!data?.[0])return; const m=data[0];
 const el=document.createElement('div');el.className='v520-important-popup';el.innerHTML=`<b>${esc(m.title||'Langar Bar')}</b><p>${esc(m.body||'')}</p><button class="secondary full">OK</button>`;document.body.appendChild(el);el.querySelector('button').onclick=async()=>{await client.from('inbox_messages').update({shown_at:new Date().toISOString()}).eq('id',m.id);el.remove()};
}
function interceptInboxDelete(){document.addEventListener('click',async e=>{const b=e.target.closest('#deleteInboxModal,[data-delete-inbox]'); if(!b)return; const modal=document.querySelector('.inbox-detail-open'); const id=modal?.dataset?.cloudId||b.dataset.cloudId; if(id)await client.rpc('customer_delete_inbox_v520',{p_message_id:id});},true)}
window.addEventListener('load',()=>{wireReservation();loadReservations();loadGallery();loadPublicReviews();syncImportantInbox();interceptInboxDelete(); setInterval(loadReservations,30000)});
})();
