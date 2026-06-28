// Langar Admin V4.3.5 — restored Orders/Delivery panel with Cloud + local orders and ETA controls
(function(){
  'use strict';
  const LS = window.LS || {get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
  const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const uid=(p='ID')=>p+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
  const CONFIG={supabaseUrl:'https://fkanccgigogbxodiljqt.supabase.co',supabaseKey:'sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7'};
  const client=window.supabase?.createClient ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {auth:{persistSession:true,autoRefreshToken:true}}) : null;

  function toast(message){
    if(window.adminNotify) return window.adminNotify(message);
    let el=$('#adminToast'); if(!el){el=document.createElement('div');el.id='adminToast';document.body.appendChild(el);} el.textContent=message; el.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove('show'),2800);
  }
  function parseMeta(note){ const s=String(note||''); const pick=k=>{const m=s.match(new RegExp('\\\\['+k+':([^\\\\]]+)\\\\]')); return m?m[1].trim():''}; return {paymentMethod:pick('PAYMENT_METHOD')||'cash',etaMinutes:Number(pick('ETA_MINUTES')||0),etaSentAt:pick('ETA_SENT_AT')||'',decision:pick('CUSTOMER_DECISION')||'',remarisEntered:pick('REMARIS_ENTERED')==='true',cleanNote:s.replace(/\n?\[(PAYMENT_METHOD|ETA_MINUTES|ETA_SENT_AT|CUSTOMER_DECISION|REMARIS_ENTERED):[^\]]+\]/g,'').replace(/^Customer note:\s*/,'').trim()}; }
  function appendMarker(note,key,value){ let s=String(note||''); s=s.replace(new RegExp('\\n?\\['+key+':[^\\]]+\\]','g'),'').trim(); return (s?s+'\n':'')+`[${key}:${value}]`; }
  function label(st,meta={}){ if(meta.decision==='accepted'&&st==='submitted') return 'Customer accepted time'; if(meta.decision==='cancelled') return 'Cancelled by customer'; return ({draft:'Draft',submitted:'New / waiting ETA',accepted:'Accepted',rejected:'Rejected',preparing:'Preparing',ready:'Ready',out_for_delivery:'Out for delivery',delivered:'Delivered',completed:'Completed',cancelled:'Cancelled',refunded:'Refunded',new:'New / waiting ETA',time_offered:'Time sent — waiting customer'}[st]||st||'new'); }
  function countdown(meta){ if(!meta.etaMinutes||!meta.etaSentAt) return ''; const end=new Date(meta.etaSentAt).getTime()+Number(meta.etaMinutes)*60000; const left=Math.max(0,end-Date.now()); return left?`${Math.floor(left/60000)}:${String(Math.floor((left%60000)/1000)).padStart(2,'0')}`:'time reached'; }

  async function fetchCloudOrders(){
    if(!client) return [];
    try{
      const {data,error}=await client.from('orders').select('*').order('created_at',{ascending:false}).limit(80);
      if(error) throw error;
      const orders=(data||[]).map(o=>({id:o.order_number||o.id,cloudId:o.id,cloud:true,status:o.status,type:o.order_type,name:o.customer_name,phone:o.customer_phone,address:o.delivery_address,note:o.customer_note,customer_note:o.customer_note,total:Number(o.total||0),paymentStatus:o.payment_status,createdAt:o.created_at,paid:o.payment_status==='paid',items:[]}));
      const ids=orders.map(o=>o.cloudId).filter(Boolean);
      if(ids.length){ const {data:items}=await client.from('order_items').select('*').in('order_id',ids); (items||[]).forEach(it=>{ const o=orders.find(x=>x.cloudId===it.order_id); if(o) o.items.push({qty:it.quantity,nameSnapshot:it.item_name_en,nameSnapshotHr:it.item_name_hr,unit_price:it.unit_price,total_price:it.total_price}); }); }
      return orders;
    }catch(err){ console.warn('admin cloud orders error',err.message); return []; }
  }

  function localOrders(){ return (LS.get('langar_orders_v3',[])||[]).map(o=>({...o,cloud:false})); }
  function mergeOrders(cloudOrders, local){ const map=new Map(); [...local,...cloudOrders].forEach(o=>map.set(o.cloudId||o.id,o)); return Array.from(map.values()).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)); }

  function renderActionCenter(){ const log=LS.get('langar_admin_action_log',[]).slice(0,5); return `<div class="legal-block admin-action-center"><b>Admin Action Center</b>${log.length?`<ul>${log.map(l=>`<li><small>${new Date(l.createdAt).toLocaleTimeString()}</small> — ${esc(l.message)}</li>`).join('')}</ul>`:'<p class="muted">No actions yet.</p>'}</div>`; }

  function paintOrders(orders){
    const box=$('#ordersAdmin'); if(!box) return;
    if(!orders.length){ box.innerHTML=renderActionCenter()+`<div class="legal-block"><b>No orders yet.</b><p>When a customer submits an online order, it will appear here. If testing on another device, make sure the customer is logged in so the order saves to Cloud.</p></div>`; return; }
    box.innerHTML=`${renderActionCenter()}<div class="legal-block"><b>Paid / Entered in Remaris</b><p><b>Paid</b> means customer paid cash/card. <b>Entered in Remaris</b> means staff manually entered the order into Remaris/POS for fiscal receipt. Use payment method below to know whether courier needs card terminal.</p></div><div class="toolbar"><button class="secondary" id="refreshOrdersAdmin">Refresh orders</button></div><div class="order-admin-list">${orders.map(o=>orderCard(o)).join('')}</div>`;
    $('#refreshOrdersAdmin')?.addEventListener('click',()=>renderOrders(true));
    $$('[data-eta]').forEach(b=>b.onclick=()=>{ const inp=$(`[data-custom-eta="${CSS.escape(b.dataset.order)}"]`); if(inp) inp.value=b.dataset.eta; });
    $$('[data-send-eta]').forEach(b=>b.onclick=()=>sendEta(b.dataset.sendEta));
    $$('[data-save-order]').forEach(b=>b.onclick=()=>saveOrder(b.dataset.saveOrder));
    $$('[data-ready-order]').forEach(b=>b.onclick=()=>readyOrder(b.dataset.readyOrder));
    $$('[data-reject-order]').forEach(b=>b.onclick=()=>rejectOrder(b.dataset.rejectOrder));
  }
  function orderCard(o){
    const meta=parseMeta(o.customer_note||o.note||''); const id=o.cloudId||o.id;
    const payment=meta.paymentMethod==='card_on_delivery'?'Card on delivery/pickup — courier should take POS terminal':'Cash';
    return `<article class="admin-order-card ${esc(o.status)}"><header><div><b>${esc(o.id)}</b><small>${new Date(o.createdAt||Date.now()).toLocaleString()} · ${esc(o.type||'pickup')} · ${o.cloud?'<b>Cloud</b>':'local'}</small></div><span class="tag">${esc(label(o.status,meta))}</span></header>
    <div class="order-admin-grid"><div><h4>Customer</h4><p>${esc(o.name||'-')}<br>${esc(o.phone||'')}<br>${esc(o.address||'')}</p><p><b>Payment:</b> ${payment}<br><b>Total:</b> €${Number(o.total||0).toFixed(2)}</p></div><div><h4>Items</h4><p>${(o.items||[]).map(i=>`${i.qty||i.quantity||1}× ${esc(i.nameSnapshot||i.item_name_en||i.name||'Item')}`).join('<br>')||'<span class="muted">No item rows loaded.</span>'}</p><small>${esc(meta.cleanNote||'')}</small></div></div>
    <div class="eta-box"><b>Prep / delivery time offer</b><div class="eta-buttons"><button data-eta="15" data-order="${esc(id)}">15 min</button><button data-eta="20" data-order="${esc(id)}">20 min</button><button data-eta="30" data-order="${esc(id)}">30 min</button><button data-eta="45" data-order="${esc(id)}">45 min</button><button data-eta="60" data-order="${esc(id)}">60 min</button></div><label>Custom minutes<input type="number" min="1" value="${esc(meta.etaMinutes||30)}" data-custom-eta="${esc(id)}"></label><button class="primary full" data-send-eta="${esc(id)}">Send time to customer / ask confirmation</button>${meta.etaMinutes?`<p><b>Sent ETA:</b> ${meta.etaMinutes} min · <span data-admin-countdown="${esc(id)}">${countdown(meta)}</span></p>`:''}${meta.decision?`<p><b>Customer decision:</b> ${esc(meta.decision)}</p>`:''}</div>
    <div class="edit-grid order-flags"><label>Status<select data-order-status="${esc(id)}">${statusOptions(o.status)}</select></label><label><input type="checkbox" data-order-paid="${esc(id)}" ${o.paid||o.paymentStatus==='paid'?'checked':''}> Paid</label><label><input type="checkbox" data-order-remaris="${esc(id)}" ${meta.remarisEntered||o.remarisEntered?'checked':''}> Entered in Remaris</label></div>
    <div class="toolbar"><button class="secondary" data-save-order="${esc(id)}">Save status / payment</button><button class="secondary" data-ready-order="${esc(id)}">Ready message</button><button class="danger" data-reject-order="${esc(id)}">Reject / cancel + notify</button></div></article>`;
  }
  function statusOptions(current){ const opts=['submitted','accepted','preparing','ready','out_for_delivery','delivered','completed','cancelled','rejected']; return opts.map(x=>`<option value="${x}" ${current===x?'selected':''}>${label(x)}</option>`).join(''); }

  async function updateCloud(id, patch){ if(!client || !id || id.startsWith('ORD-')) return false; const {error}=await client.from('orders').update(patch).eq('id',id); if(error){ console.warn('cloud order update error',error.message); toast('Cloud update failed: '+error.message); return false;} return true; }
  async function inbox(userId,title,body,data={}){ if(!client||!userId) return; try{ await client.from('inbox_messages').insert({user_id:userId,type:'order_update',title_en:title,body_en:body,title_hr:title,body_hr:body,data}); }catch(e){ console.warn('inbox insert error',e.message); } }
  async function getCloudOrder(id){ if(!client || !id || id.startsWith('ORD-')) return null; try{ const {data}=await client.from('orders').select('*').eq('id',id).maybeSingle(); return data||null; }catch{return null;} }

  async function sendEta(id){
    const mins=Math.max(1,parseInt($(`[data-custom-eta="${CSS.escape(id)}"]`)?.value||'30',10)); const now=new Date().toISOString();
    const local=LS.get('langar_orders_v3',[]); let lo=local.find(o=>o.id===id||o.cloudId===id); if(lo){ lo.etaMinutes=mins; lo.etaSentAt=now; lo.status='time_offered'; lo.customerDecision='waiting'; lo.note=appendMarker(appendMarker(lo.note||'', 'ETA_MINUTES', mins), 'ETA_SENT_AT', now); }
    LS.set('langar_orders_v3',local);
    const co=await getCloudOrder(id); if(co){ let note=appendMarker(appendMarker(co.customer_note||'', 'ETA_MINUTES', mins), 'ETA_SENT_AT', now); note=appendMarker(note,'CUSTOMER_DECISION',''); await updateCloud(id,{customer_note:note,updated_at:now}); await inbox(co.user_id,'Order time estimate',`Langar Bar can prepare your order in about ${mins} minutes. Please accept or cancel inside the app.`,{order_id:id,eta_minutes:mins}); }
    toast(`ETA ${mins} minutes sent to customer.`); renderOrders(true);
  }
  async function saveOrder(id){
    const st=$(`[data-order-status="${CSS.escape(id)}"]`)?.value||'submitted'; const paid=!!$(`[data-order-paid="${CSS.escape(id)}"]`)?.checked; const remaris=!!$(`[data-order-remaris="${CSS.escape(id)}"]`)?.checked;
    const local=LS.get('langar_orders_v3',[]); const lo=local.find(o=>o.id===id||o.cloudId===id); if(lo){ lo.status=st; lo.paid=paid; lo.remarisEntered=remaris; lo.note=appendMarker(lo.note||'', 'REMARIS_ENTERED', remaris?'true':'false'); lo.updatedAt=new Date().toISOString(); } LS.set('langar_orders_v3',local);
    const co=await getCloudOrder(id); if(co){ const note=appendMarker(co.customer_note||'', 'REMARIS_ENTERED', remaris?'true':'false'); await updateCloud(id,{status:st,payment_status:paid?'paid':'unpaid',customer_note:note,updated_at:new Date().toISOString()}); }
    toast('Order status/payment saved.'); renderOrders(true);
  }
  async function readyOrder(id){ const co=await getCloudOrder(id); const st=(co?.order_type==='delivery')?'out_for_delivery':'ready'; await updateCloud(id,{status:st,updated_at:new Date().toISOString()}); if(co) await inbox(co.user_id,'Your order is ready',co.order_type==='delivery'?'Your order is ready and going out for delivery.':'Your order is ready for pick-up.',{order_id:id,status:st}); const local=LS.get('langar_orders_v3',[]); local.forEach(o=>{ if(o.id===id||o.cloudId===id) o.status=st; }); LS.set('langar_orders_v3',local); toast('Ready message sent to customer.'); renderOrders(true); }
  async function rejectOrder(id){ if(!confirm('Reject/cancel this order and notify customer?')) return; const co=await getCloudOrder(id); await updateCloud(id,{status:'rejected',updated_at:new Date().toISOString()}); if(co) await inbox(co.user_id,'Order cancelled','Sorry, Langar Bar cannot confirm this order right now. Please try another time or contact us.',{order_id:id,status:'rejected'}); const local=LS.get('langar_orders_v3',[]); local.forEach(o=>{ if(o.id===id||o.cloudId===id) o.status='rejected'; }); LS.set('langar_orders_v3',local); toast('Order rejected/cancelled and customer notified.'); renderOrders(true); }

  async function renderOrders(force=false){ const box=$('#ordersAdmin'); if(!box) return; box.innerHTML=renderActionCenter()+'<p class="muted">Loading orders...</p>'; const cloudOrders=await fetchCloudOrders(); paintOrders(mergeOrders(cloudOrders,localOrders())); }
  window.renderOrders=renderOrders;
  const oldRenderAll=window.renderAll; if(typeof oldRenderAll==='function') window.renderAll=function(){ oldRenderAll.apply(this,arguments); renderOrders(); };
  document.addEventListener('DOMContentLoaded',()=>{ setTimeout(()=>renderOrders(),600); setInterval(()=>$$('[data-admin-countdown]').forEach(el=>{ const local=LS.get('langar_orders_v3',[]); const o=local.find(x=>x.id===el.dataset.adminCountdown||x.cloudId===el.dataset.adminCountdown); if(o) el.textContent=countdown(parseMeta(o.customer_note||o.note||'')); }),1000); });
})();
