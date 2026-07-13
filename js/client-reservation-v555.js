(()=>{
'use strict';
const getClient=()=>window.LangarCloud?.client||null;
async function wait(){for(let i=0;i<50;i++){const c=getClient();if(c)return c;await new Promise(r=>setTimeout(r,150));}return null}
const val=(f,n)=>String(new FormData(f).get(n)||'').trim();
async function submitReservation(e){
 e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
 const f=e.currentTarget,c=await wait();
 if(!c)return alert('Cloud connection is unavailable. Please try again.');
 const {data:{session}}=await c.auth.getSession();
 if(!session)return alert('Please login to Langar Club before making a reservation.');
 const payload={
  p_date:val(f,'date'),p_time:val(f,'time'),p_name:val(f,'name'),p_phone:val(f,'phone'),
  p_guests:Number(val(f,'guests')||1),p_area:val(f,'area')||'inside',p_occasion:val(f,'occasion'),
  p_high_chair:['on','true','1'].includes(val(f,'high_chair')),p_note:val(f,'note')
 };
 if(!payload.p_date||!payload.p_time||!payload.p_name||!payload.p_phone)return alert('Please complete date, time, name and phone.');
 const btn=f.querySelector('button[type="submit"],button:not([type])'); if(btn)btn.disabled=true;
 try{
  let {error}=await c.rpc('customer_create_reservation_v554',payload);
  if(error && /schema cache|function.*does not exist/i.test(error.message||'')){
    const legacy={p_date:payload.p_date,p_guests:payload.p_guests,p_name:payload.p_name,p_note:payload.p_note,p_phone:payload.p_phone,p_time:payload.p_time};
    ({error}=await c.rpc('customer_create_reservation_v520',legacy));
  }
  if(error)throw error;
  alert('Reservation request sent. You will receive confirmation in the app.');
  f.reset(); try{window.renderReservationCalendar?.()}catch{}
 }catch(err){alert('Reservation error: '+(err.message||String(err)))}finally{if(btn)btn.disabled=false}
}
function forceWire(){
 const old=document.getElementById('reservationForm'); if(!old||old.dataset.v555)return;
 // Cloning removes all older V5.2/V5.4 event listeners that still call the obsolete RPC.
 const f=old.cloneNode(true); old.replaceWith(f); f.dataset.v555='1';
 f.addEventListener('submit',submitReservation,true);
}
window.addEventListener('load',()=>setTimeout(forceWire,1000));
document.addEventListener('click',()=>setTimeout(forceWire,80),{passive:true});
})();
