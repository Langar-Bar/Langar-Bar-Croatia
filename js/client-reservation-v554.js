(()=>{
'use strict';
const getClient=()=>window.LangarCloud?.client||null;
async function wait(){for(let i=0;i<40;i++){const c=getClient();if(c)return c;await new Promise(r=>setTimeout(r,200));}return null}
function val(f,n){return String(new FormData(f).get(n)||'').trim()}
async function submit(e){e.preventDefault();e.stopImmediatePropagation();const f=e.currentTarget,c=await wait();if(!c)return alert('Cloud connection is unavailable. Please try again.');const {data:{session}}=await c.auth.getSession();if(!session)return alert('Please login to Langar Club before making a reservation.');const payload={p_date:val(f,'date'),p_time:val(f,'time'),p_name:val(f,'name'),p_phone:val(f,'phone'),p_guests:Number(val(f,'guests')||1),p_area:val(f,'area')||'inside',p_occasion:val(f,'occasion'),p_high_chair:['on','true','1'].includes(val(f,'high_chair')),p_note:val(f,'note')};if(!payload.p_date||!payload.p_time||!payload.p_name||!payload.p_phone)return alert('Please complete date, time, name and phone.');const btn=f.querySelector('button[type="submit"]');if(btn)btn.disabled=true;const {error}=await c.rpc('customer_create_reservation_v554',payload);if(btn)btn.disabled=false;if(error)return alert(error.message);alert('Reservation request sent. You will receive confirmation in the app.');f.reset();try{window.renderReservationCalendar?.()}catch{}}
function wire(){const f=document.getElementById('reservationForm');if(!f||f.dataset.v554)return;f.dataset.v554='1';f.addEventListener('submit',submit,true)}
window.addEventListener('load',()=>{setTimeout(wire,800);document.addEventListener('click',()=>setTimeout(wire,100),{passive:true})});
})();
