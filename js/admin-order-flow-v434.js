// Langar Admin V4.3.5 — stable orders delivery ETA
(function(){
  const LS = window.LS || {get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
  const $ = (s)=>document.querySelector(s);
  const $$ = (s)=>Array.from(document.querySelectorAll(s));
  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  const uid = (p='ID')=> p+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
  function toast(message){
    let el=$('#adminToast');
    if(!el){ el=document.createElement('div'); el.id='adminToast'; document.body.appendChild(el); }
    el.textContent=message; el.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove('show'),2800);
    const log=LS.get('langar_admin_action_log',[]); log.unshift({message,createdAt:new Date().toISOString()}); LS.set('langar_admin_action_log',log.slice(0,30));
  }
  function addCustomerInbox(order,title,body){
    const msgs=LS.get('langar_inbox',[]); msgs.unshift({id:uid('msg'),type:'order_update',orderId:order.id,title,body,unread:true,createdAt:new Date().toISOString()}); LS.set('langar_inbox',msgs);
  }
  function countdown(order){
    if(!order.etaMinutes||!order.etaSentAt) return '';
    const end=new Date(order.etaSentAt).getTime()+Number(order.etaMinutes)*60000;
    const left=Math.max(0,end-Date.now());
    return left?`${Math.floor(left/60000)}:${String(Math.floor((left%60000)/1000)).padStart(2,'0')}`:'time reached';
  }
  function label(st){return ({new:'New / waiting ETA',time_offered:'Time sent — waiting customer',accepted:'Customer accepted',preparing:'Preparing',ready:'Ready',out_for_delivery:'Out for delivery',delivered:'Delivered',completed:'Completed',cancelled_by_customer:'Cancelled by customer',cancelled:'Cancelled',rejected:'Rejected'}[st]||st||'new');}
  function saveOrder(id,patch,msg){
    const arr=LS.get('langar_orders_v3',[]).map(o=>o.id===id?{...o,...patch,updatedAt:new Date().toISOString()}:o);
    LS.set('langar_orders_v3',arr); toast(msg||'Order updated.'); if(window.renderAll) renderAll(); else renderOrders();
  }
  function statusOptions(current){
    const opts=['new','time_offered','accepted','preparing','ready','out_for_delivery','delivered','completed','cancelled_by_customer','cancelled','rejected'];
    return opts.map(x=>`<option value="${x}" ${current===x?'selected':''}>${label(x)}</option>`).join('');
  }
  function renderActionCenter(){
    const log=LS.get('langar_admin_action_log',[]).slice(0,5);
    return `<div class="legal-block admin-action-center"><b>Admin Action Center</b>${log.length?`<ul>${log.map(l=>`<li><small>${new Date(l.createdAt).toLocaleTimeString()}</small> — ${esc(l.message)}</li>`).join('')}</ul>`:'<p class="muted">No actions yet.</p>'}</div>`;
  }
  function renderOrders(){
    const box=$('#ordersAdmin'); if(!box) return;
    const orders=LS.get('langar_orders_v3',[]);
    if(!orders.length){ box.innerHTML=renderActionCenter()+'<p class="muted">No orders yet.</p>'; return; }
    box.innerHTML=`${renderActionCenter()}<div class="legal-block"><b>What means “Paid / Entered in Remaris”?</b><p><b>Paid</b> means the customer has paid cash/card. <b>Entered in Remaris</b> means staff manually entered the order into Remaris/POS so fiscal receipt/accounting is handled there. Langar Credit should be posted only after paid + entered in Remaris + completed/delivered.</p></div><div class="order-admin-list">${orders.map((o)=>`
      <article class="admin-order-card ${esc(o.status)}">
        <header><div><b>${esc(o.id)}</b><small>${new Date(o.createdAt).toLocaleString()} · ${esc(o.type||'pickup')}</small></div><span class="tag">${esc(label(o.status))}</span></header>
        <div class="order-admin-grid"><div><h4>Customer</h4><p>${esc(o.name||'-')}<br>${esc(o.phone||'')}<br>${esc(o.address||'')}</p><p><b>Payment:</b> ${o.paymentMethod==='card_on_delivery'?'Card — send POS terminal with courier':'Cash'}<br><b>Total:</b> €${Number(o.total||0).toFixed(2)}</p></div><div><h4>Items</h4><p>${(o.items||[]).map(i=>`${i.qty}× ${esc(i.nameSnapshot||i.name||'Item')}`).join('<br>')}</p><small>${esc(o.note||'')}</small></div></div>
        <div class="eta-box"><b>Prep / delivery time offer</b><div class="eta-buttons"><button data-eta="15" data-order="${esc(o.id)}">15 min</button><button data-eta="20" data-order="${esc(o.id)}">20 min</button><button data-eta="30" data-order="${esc(o.id)}">30 min</button><button data-eta="45" data-order="${esc(o.id)}">45 min</button><button data-eta="60" data-order="${esc(o.id)}">60 min</button></div><label>Custom minutes<input type="number" min="1" value="${esc(o.etaMinutes||30)}" data-custom-eta="${esc(o.id)}"></label><button class="primary full" data-send-eta="${esc(o.id)}">Send time to customer / ask confirmation</button>${o.etaMinutes?`<p><b>Sent ETA:</b> ${o.etaMinutes} min · <span data-admin-countdown="${esc(o.id)}">${countdown(o)}</span></p>`:''}</div>
        <div class="edit-grid order-flags"><label>Status<select data-order-status="${esc(o.id)}">${statusOptions(o.status)}</select></label><label><input type="checkbox" data-order-paid="${esc(o.id)}" ${o.paid?'checked':''}> Paid</label><label><input type="checkbox" data-order-remaris="${esc(o.id)}" ${o.remarisEntered?'checked':''}> Entered in Remaris</label></div>
        <div class="toolbar"><button class="secondary" data-save-order="${esc(o.id)}">Save status / payment</button><button class="secondary" data-ready-order="${esc(o.id)}">Ready message</button><button class="danger" data-reject-order="${esc(o.id)}">Reject / cancel + notify</button></div>
      </article>`).join('')}</div>`;
    $$('[data-eta]').forEach(b=>b.onclick=()=>{ const id=b.dataset.order; const inp=$(`[data-custom-eta="${CSS.escape(id)}"]`); if(inp) inp.value=b.dataset.eta; });
    $$('[data-send-eta]').forEach(b=>b.onclick=()=>{ const id=b.dataset.sendEta; const arr=LS.get('langar_orders_v3',[]); const o=arr.find(x=>x.id===id); if(!o) return; const mins=Math.max(1,parseInt($(`[data-custom-eta="${CSS.escape(id)}"]`)?.value||'30',10)); Object.assign(o,{etaMinutes:mins,etaSentAt:new Date().toISOString(),status:'time_offered',customerDecision:'waiting'}); addCustomerInbox(o,'Order time estimate',`Langar Bar can prepare your order in about ${mins} minutes. Please accept or cancel inside the app.`); LS.set('langar_orders_v3',arr); toast(`ETA ${mins} minutes sent to customer.`); renderOrders(); });
    $$('[data-save-order]').forEach(b=>b.onclick=()=>{ const id=b.dataset.saveOrder; const arr=LS.get('langar_orders_v3',[]); const o=arr.find(x=>x.id===id); if(!o) return; o.status=$(`[data-order-status="${CSS.escape(id)}"]`)?.value||o.status; o.paid=!!$(`[data-order-paid="${CSS.escape(id)}"]`)?.checked; o.remarisEntered=!!$(`[data-order-remaris="${CSS.escape(id)}"]`)?.checked; if((o.status==='delivered'||o.status==='completed')&&o.paid&&o.remarisEntered&&!o.rewardPosted&&typeof window.postOrderReward==='function'){ postOrderReward(o); o.rewardPosted=true; } LS.set('langar_orders_v3',arr); toast('Order status/payment saved.'); renderOrders(); });
    $$('[data-ready-order]').forEach(b=>b.onclick=()=>{ const id=b.dataset.readyOrder; const arr=LS.get('langar_orders_v3',[]); const o=arr.find(x=>x.id===id); if(!o) return; o.status=o.type==='delivery'?'out_for_delivery':'ready'; addCustomerInbox(o,'Your order is ready', o.type==='delivery'?'Your order is ready and going out for delivery.':'Your order is ready for pick-up.'); LS.set('langar_orders_v3',arr); toast('Ready message sent to customer.'); renderOrders(); });
    $$('[data-reject-order]').forEach(b=>b.onclick=()=>{ const id=b.dataset.rejectOrder; if(!confirm('Reject/cancel this order and notify customer?')) return; const arr=LS.get('langar_orders_v3',[]); const o=arr.find(x=>x.id===id); if(!o) return; o.status='rejected'; addCustomerInbox(o,'Order cancelled','Sorry, Langar Bar cannot confirm this order right now. Please try another time or contact us.'); LS.set('langar_orders_v3',arr); toast('Order rejected/cancelled and customer notified.'); renderOrders(); });
  }
  window.renderOrders=renderOrders;
  const oldRenderAll=window.renderAll;
  if(typeof oldRenderAll==='function') window.renderAll=function(){ oldRenderAll.apply(this,arguments); renderOrders(); };
  document.addEventListener('DOMContentLoaded',()=>setInterval(()=>$$('[data-admin-countdown]').forEach(el=>{ const o=(LS.get('langar_orders_v3',[])||[]).find(x=>x.id===el.dataset.adminCountdown); if(o) el.textContent=countdown(o); }),1000));
})();
