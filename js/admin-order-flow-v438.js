// Langar Admin V4.3.8 — restored live Orders/Delivery panel with alarm + ETA
(function(){
  'use strict';
  const LS=window.LS||{get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
  const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const client=()=>window.LangarCloud?.client||null;
  let soundEnabled=LS.get('langar_order_sound_enabled_v438',false);
  let initialSeen=false;

  function toast(msg){ if(window.adminNotify) return window.adminNotify(msg); let el=document.createElement('div'); el.className='admin-toast'; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2600); }
  function parseMeta(note){ const s=String(note||''); const pick=k=>{const m=s.match(new RegExp('\\['+k+':([^\\]]+)\\]')); return m?m[1].trim():'';}; return {paymentMethod:pick('PAYMENT_METHOD')||'cash',etaMinutes:Number(pick('ETA_MINUTES')||0),etaSentAt:pick('ETA_SENT_AT')||'',decision:pick('CUSTOMER_DECISION')||'',remarisEntered:pick('REMARIS_ENTERED')==='true',tableNumber:pick('TABLE')||'',cleanNote:s.replace(/\n?\[(PAYMENT_METHOD|ETA_MINUTES|ETA_SENT_AT|CUSTOMER_DECISION|REMARIS_ENTERED|TABLE):[^\]]+\]/g,'').replace(/^Customer note:\s*/,'').trim()}; }
  function appendMarker(note,key,value){ let s=String(note||'').replace(new RegExp('\\n?\\['+key+':[^\\]]+\\]','g'),'').trim(); return (s?s+'\n':'')+`[${key}:${value}]`; }
  function paymentLabel(v){ return v==='card_on_delivery'?'Card':'Cash'; }
  function orderTypeLabel(t){ return t==='delivery'?'Delivery':(t==='dine_in'?'Dine-in':'Pick-up'); }
  function statusOptions(s){ const opts=['submitted','time_offered','accepted','preparing','ready','out_for_delivery','delivered','completed','cancelled','rejected']; return opts.map(o=>`<option value="${o}" ${o===(s||'submitted')?'selected':''}>${o}</option>`).join(''); }
  function countdown(m){ if(!m.etaMinutes||!m.etaSentAt) return ''; const end=new Date(m.etaSentAt).getTime()+m.etaMinutes*60000; const left=Math.max(0,end-Date.now()); if(!left) return 'Time reached'; const mm=Math.floor(left/60000), ss=Math.floor((left%60000)/1000); return `${mm}:${String(ss).padStart(2,'0')}`; }
  function timeout(p,ms=4500){ return Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))]); }

  async function fetchCloudOrders(){
    const c=client(); if(!c) return [];
    try{
      const {data,error}=await timeout(c.from('orders').select('*').order('created_at',{ascending:false}).limit(100));
      if(error) throw error;
      const orders=(data||[]).map(o=>({id:o.order_number||o.id,cloudId:o.id,cloud:true,status:o.status||'submitted',type:o.order_type||'pickup',name:o.customer_name,phone:o.customer_phone,address:o.delivery_address,note:o.customer_note,customer_note:o.customer_note,total:Number(o.total||0),paymentStatus:o.payment_status,createdAt:o.created_at,paid:o.payment_status==='paid',user_id:o.user_id,items:[]}));
      const ids=orders.map(o=>o.cloudId).filter(Boolean);
      if(ids.length){ const {data:items}=await timeout(c.from('order_items').select('*').in('order_id',ids),4500).catch(()=>({data:[]})); (items||[]).forEach(it=>{ const o=orders.find(x=>x.cloudId===it.order_id); if(o) o.items.push({qty:it.quantity,nameSnapshot:it.item_name_en,nameSnapshotHr:it.item_name_hr,unit_price:it.unit_price,total_price:it.total_price}); }); }
      return orders;
    }catch(err){ console.warn('admin cloud orders error',err.message); return []; }
  }
  function localOrders(){ return (LS.get('langar_orders_v3',[])||[]).map(o=>({...o,cloud:false,status:o.status||'submitted'})); }
  function merge(cloud,local){ const map=new Map(); [...cloud,...local].forEach(o=>map.set(o.cloudId||o.id,o)); return Array.from(map.values()).sort((a,b)=>new Date(b.createdAt||b.created_at||0)-new Date(a.createdAt||a.created_at||0)); }

  function enableSound(){ soundEnabled=true; LS.set('langar_order_sound_enabled_v438',true); beep(); toast('Order sound enabled.'); renderOrders(true); }
  function beep(){
    if(!soundEnabled) return;
    try{ const ctx=new (window.AudioContext||window.webkitAudioContext)(); let t=ctx.currentTime; [0,0.22,0.44].forEach(d=>{ const o=ctx.createOscillator(), g=ctx.createGain(); o.type='sine'; o.frequency.value=880; g.gain.setValueAtTime(0.0001,t+d); g.gain.exponentialRampToValueAtTime(0.25,t+d+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.14); o.connect(g); g.connect(ctx.destination); o.start(t+d); o.stop(t+d+0.16); }); setTimeout(()=>ctx.close(),1000); }catch{}
  }
  function checkAlarm(orders){
    const actionable=orders.filter(o=>!['completed','delivered','cancelled','rejected'].includes(o.status));
    const ids=actionable.map(o=>o.cloudId||o.id).filter(Boolean);
    const seen=LS.get('langar_admin_seen_order_ids_v438',[]);
    if(!initialSeen){ LS.set('langar_admin_seen_order_ids_v438',Array.from(new Set([...seen,...ids]))); initialSeen=true; return; }
    const fresh=ids.filter(id=>!seen.includes(id));
    if(fresh.length){ beep(); toast(`New order received (${fresh.length})`); document.title='🔔 New order - Langar Admin'; LS.set('langar_admin_seen_order_ids_v438',Array.from(new Set([...seen,...ids]))); }
  }

  function monitorHtml(){ return `<div class="order-live-monitor legal-block"><b>Live Order Monitor</b><p>Keep this page open. New orders will appear here automatically.</p><div class="toolbar"><button class="secondary" id="refreshOrdersAdmin">Refresh orders</button><button class="secondary" id="enableOrderSound">${soundEnabled?'Sound enabled':'Enable order sound'}</button><button class="secondary" id="markOrdersSeen">Mark all seen</button></div></div>`; }
  function orderCard(o){
    const id=o.cloudId||o.id; const meta=parseMeta(o.customer_note||o.note||''); const payment=meta.paymentMethod||o.paymentMethod||'cash';
    return `<article class="admin-order-card ${esc(o.status)}"><header><div><b>${esc(o.id)}</b><small>${new Date(o.createdAt||o.created_at||Date.now()).toLocaleString()} · ${esc(orderTypeLabel(o.type||'pickup'))} · ${o.cloud?'<b>Cloud</b>':'local'}</small></div><span class="tag">${esc(o.status||'submitted')}</span></header>
      <div class="order-admin-grid"><div><h4>Customer</h4><p>${esc(o.name||'-')}<br>${esc(o.phone||'')}${o.type==='delivery'&&o.address?`<br><b>Address:</b> ${esc(o.address)}`:''}${o.type==='dine_in'&&(meta.tableNumber||o.tableNumber)?`<br><b>Table:</b> ${esc(meta.tableNumber||o.tableNumber)}`:''}</p><p><b>Payment:</b> ${paymentLabel(payment)}<br><b>Total:</b> €${Number(o.total||0).toFixed(2)}</p></div><div><h4>Items</h4><p>${(o.items||[]).map(i=>`${i.qty||i.quantity||1}× ${esc(i.nameSnapshot||i.item_name_en||i.name||'Item')}`).join('<br>')||'<span class="muted">No item rows loaded.</span>'}</p><small>${esc(meta.cleanNote||'')}</small></div></div>
      <div class="eta-box"><b>Send prep / delivery time</b><div class="eta-buttons"><button data-eta="15" data-order="${esc(id)}">15 min</button><button data-eta="20" data-order="${esc(id)}">20 min</button><button data-eta="30" data-order="${esc(id)}">30 min</button><button data-eta="45" data-order="${esc(id)}">45 min</button><button data-eta="60" data-order="${esc(id)}">60 min</button></div><label>Custom minutes<input type="number" min="1" value="${esc(meta.etaMinutes||30)}" data-custom-eta="${esc(id)}"></label><button class="primary full" data-send-eta="${esc(id)}">Send time to customer</button>${meta.etaMinutes?`<p><b>Sent ETA:</b> ${meta.etaMinutes} min · <span data-admin-countdown="${esc(id)}">${countdown(meta)}</span></p>`:''}${meta.decision?`<p><b>Customer decision:</b> ${esc(meta.decision)}</p>`:''}</div>
      <div class="edit-grid order-flags"><label>Status<select data-order-status="${esc(id)}">${statusOptions(o.status)}</select></label><label><input type="checkbox" data-order-paid="${esc(id)}" ${o.paid||o.paymentStatus==='paid'?'checked':''}> Paid</label><label><input type="checkbox" data-order-remaris="${esc(id)}" ${meta.remarisEntered||o.remarisEntered?'checked':''}> Entered in Remaris</label></div>
      <div class="toolbar"><button class="secondary" data-save-order="${esc(id)}">Save status / payment</button><button class="secondary" data-ready-order="${esc(id)}">Ready message</button><button class="danger" data-reject-order="${esc(id)}">Reject / cancel + notify</button></div></article>`;
  }
  function bindButtons(orders){
    $('#refreshOrdersAdmin')?.addEventListener('click',()=>renderOrders(true)); $('#enableOrderSound')?.addEventListener('click',enableSound); $('#markOrdersSeen')?.addEventListener('click',()=>{LS.set('langar_admin_seen_order_ids_v438',orders.map(o=>o.cloudId||o.id)); toast('Orders marked as seen.');});
    $$('[data-eta]').forEach(b=>b.onclick=()=>{ const inp=$(`[data-custom-eta="${CSS.escape(b.dataset.order)}"]`); if(inp) inp.value=b.dataset.eta; });
    $$('[data-send-eta]').forEach(b=>b.onclick=()=>sendEta(b.dataset.sendEta)); $$('[data-save-order]').forEach(b=>b.onclick=()=>saveOrder(b.dataset.saveOrder)); $$('[data-ready-order]').forEach(b=>b.onclick=()=>readyOrder(b.dataset.readyOrder)); $$('[data-reject-order]').forEach(b=>b.onclick=()=>rejectOrder(b.dataset.rejectOrder));
  }
  function paint(orders){
    const box=$('#ordersAdmin'); if(!box) return; checkAlarm(orders);
    if(!orders.length){ box.innerHTML=monitorHtml()+`<div class="legal-block"><b>No orders yet.</b><p>When a customer submits an online order, it will appear here. If testing from another device or installed app, make sure Cloud order policies are enabled and the customer submits through the latest app version.</p></div>`; bindButtons(orders); return; }
    box.innerHTML=monitorHtml()+`<div class="legal-block"><b>Payment / Remaris</b><p><b>Payment</b> shows Cash or Card for staff. <b>Paid</b> means money was received. <b>Entered in Remaris</b> means staff manually entered the order into Remaris/POS for fiscal receipt.</p></div><div class="order-admin-list">${orders.map(orderCard).join('')}</div>`; bindButtons(orders);
  }
  async function renderOrders(force=false){ const box=$('#ordersAdmin'); if(!box) return; box.innerHTML=monitorHtml()+'<p class="muted">Loading orders...</p>'; bindButtons([]); const orders=merge(await fetchCloudOrders(),localOrders()); paint(orders); }
  window.renderOrders=renderOrders;

  async function getCloudOrder(id){ const c=client(); if(!c||!id||String(id).startsWith('ORD-')) return null; try{ const {data}=await c.from('orders').select('*').eq('id',id).maybeSingle(); return data||null; }catch{return null;} }
  async function updateCloud(id,patch){ const c=client(); if(!c||!id||String(id).startsWith('ORD-')) return false; try{ const {error}=await c.from('orders').update(patch).eq('id',id); if(error) throw error; return true; }catch(err){ toast('Cloud update failed: '+err.message); return false; } }
  async function inbox(userId,title,body,data={}){ const c=client(); if(!c||!userId) return; try{ await c.from('inbox_messages').insert({user_id:userId,type:'order_update',title_en:title,body_en:body,title_hr:title,body_hr:body,data}); }catch(e){} }
  async function sendEta(id){ const inp=$(`[data-custom-eta="${CSS.escape(id)}"]`); const mins=Math.max(1,parseInt(inp?.value||'30',10)); const now=new Date().toISOString(); const local=LS.get('langar_orders_v3',[])||[]; local.forEach(o=>{ if(o.id===id||o.cloudId===id){ o.status='time_offered'; o.note=appendMarker(appendMarker(appendMarker(o.note||'','ETA_MINUTES',mins),'ETA_SENT_AT',now),'CUSTOMER_DECISION',''); }}); LS.set('langar_orders_v3',local); const co=await getCloudOrder(id); if(co){ let note=appendMarker(appendMarker(appendMarker(co.customer_note||'','ETA_MINUTES',mins),'ETA_SENT_AT',now),'CUSTOMER_DECISION',''); await updateCloud(id,{status:'time_offered',customer_note:note,updated_at:now}); await inbox(co.user_id,'Order time estimate',`Langar Bar can prepare your order in about ${mins} minutes. Please accept or cancel inside the app.`,{order_id:id,eta_minutes:mins}); } toast(`Time sent: ${mins} minutes.`); renderOrders(true); }
  async function saveOrder(id){ const st=$(`[data-order-status="${CSS.escape(id)}"]`)?.value||'submitted'; const paid=!!$(`[data-order-paid="${CSS.escape(id)}"]`)?.checked; const remaris=!!$(`[data-order-remaris="${CSS.escape(id)}"]`)?.checked; const local=LS.get('langar_orders_v3',[])||[]; local.forEach(o=>{ if(o.id===id||o.cloudId===id){ o.status=st; o.paid=paid; o.remarisEntered=remaris; o.note=appendMarker(o.note||'','REMARIS_ENTERED',remaris?'true':'false'); }}); LS.set('langar_orders_v3',local); const co=await getCloudOrder(id); if(co){ const note=appendMarker(co.customer_note||'','REMARIS_ENTERED',remaris?'true':'false'); await updateCloud(id,{status:st,payment_status:paid?'paid':'unpaid',customer_note:note,updated_at:new Date().toISOString()}); } toast('Order updated.'); renderOrders(true); }
  async function readyOrder(id){ const co=await getCloudOrder(id); const st=(co?.order_type==='delivery')?'out_for_delivery':'ready'; await updateCloud(id,{status:st,updated_at:new Date().toISOString()}); if(co) await inbox(co.user_id,'Your order is ready',co.order_type==='delivery'?'Your order is ready and going out for delivery.':(co.order_type==='dine_in'?'Your order is ready at your table / counter.':'Your order is ready for pick-up.'),{order_id:id,status:st}); const local=LS.get('langar_orders_v3',[])||[]; local.forEach(o=>{ if(o.id===id||o.cloudId===id)o.status=st; }); LS.set('langar_orders_v3',local); toast('Ready message sent.'); renderOrders(true); }
  async function rejectOrder(id){ if(!confirm('Reject/cancel this order and notify customer?')) return; const co=await getCloudOrder(id); await updateCloud(id,{status:'rejected',updated_at:new Date().toISOString()}); if(co) await inbox(co.user_id,'Order cancelled','Sorry, Langar Bar cannot confirm this order right now. Please try another time or contact us.',{order_id:id,status:'rejected'}); const local=LS.get('langar_orders_v3',[])||[]; local.forEach(o=>{ if(o.id===id||o.cloudId===id)o.status='rejected'; }); LS.set('langar_orders_v3',local); toast('Order rejected/cancelled.'); renderOrders(true); }

  try{ if('BroadcastChannel' in window){ const bc=new BroadcastChannel('langar_orders'); bc.onmessage=e=>{ if(e.data?.type==='new_order') setTimeout(()=>renderOrders(true),200); }; } }catch{}
  window.addEventListener('storage',e=>{ if(e.key==='langar_order_signal_v438'||e.key==='langar_orders_v3') setTimeout(()=>renderOrders(true),200); });
  const oldShow=window.showPanel; if(typeof oldShow==='function'){ window.showPanel=function(id){ oldShow.apply(this,arguments); if(id==='ordersPanel') setTimeout(()=>renderOrders(true),200); }; }
  document.addEventListener('DOMContentLoaded',()=>{ setTimeout(()=>renderOrders(true),900); setInterval(()=>{ const visible=$('#ordersPanel')&&!$('#ordersPanel').classList.contains('hidden'); if(visible) renderOrders(true); $$('[data-admin-countdown]').forEach(el=>{ const all=localOrders(); const o=all.find(x=>x.id===el.dataset.adminCountdown||x.cloudId===el.dataset.adminCountdown); if(o) el.textContent=countdown(parseMeta(o.customer_note||o.note||'')); }); },6000); });
})();
