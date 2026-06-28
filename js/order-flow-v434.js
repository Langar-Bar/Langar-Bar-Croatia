// Langar App V4.3.4 — order ETA, payment preference and post-order feedback
(function(){
  const LS = window.LS || {get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
  const $ = (s)=>document.querySelector(s);
  const $$ = (s)=>Array.from(document.querySelectorAll(s));
  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  const lang = ()=> (window.state && state.lang) || localStorage.langar_lang || 'hr';
  const t = (hr,en)=> lang()==='hr' ? hr : en;
  const uid = (p='ID')=> p+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
  const priceNum = window.priceNum || ((v)=>parseFloat(String(v).replace(/[^0-9.,]/g,'').replace(',','.'))||0);
  const profile = window.profile || (()=>LS.get('langar_profile', null));
  function showToast(message){
    let el=$('#langarToast');
    if(!el){ el=document.createElement('div'); el.id='langarToast'; document.body.appendChild(el); }
    el.textContent=message; el.classList.add('show');
    clearTimeout(showToast._t); showToast._t=setTimeout(()=>el.classList.remove('show'),2600);
  }
  function orderLabel(status){
    return ({new:'Waiting for time',time_offered:'Time offered',accepted:'Accepted',preparing:'Preparing',ready:'Ready',out_for_delivery:'Out for delivery',delivered:'Delivered',completed:'Completed',cancelled_by_customer:'Cancelled by customer',cancelled:'Cancelled',rejected:'Rejected'}[status] || status || 'new');
  }
  function etaCountdown(order){
    if(!order.etaMinutes || !order.etaSentAt) return '';
    const end = new Date(order.etaSentAt).getTime() + (+order.etaMinutes||0)*60000;
    const left = Math.max(0, end - Date.now());
    const m = Math.floor(left/60000); const s = Math.floor((left%60000)/1000);
    return left ? `${m}:${String(s).padStart(2,'0')}` : t('Vrijeme je isteklo','Time reached');
  }
  function decorateOrderUI(){
    const note=$('#orderNote');
    if(note && !$('#orderPaymentMethod')){
      const label=document.createElement('label');
      label.innerHTML=`<span data-hr="Način plaćanja" data-en="Payment method">${t('Način plaćanja','Payment method')}</span><select id="orderPaymentMethod"><option value="cash">${t('Gotovina','Cash')}</option><option value="card_on_delivery">${t('Kartica pri dostavi/preuzimanju','Card on delivery / pickup')}</option></select><small class="muted">${t('Ako odaberete karticu za dostavu, ponesite POS uređaj.','If card is selected for delivery, courier should take the POS terminal.')}</small>`;
      note.closest('label').before(label);
    }
    const submit=$('#submitOrder');
    if(submit && !$('#customerOrderStatus')){
      const box=document.createElement('section');
      box.id='customerOrderStatus';
      box.className='order-status-box';
      submit.closest('.cart').appendChild(box);
    }
    renderCustomerOrders();
  }
  function renderCustomerOrders(){
    const box=$('#customerOrderStatus'); if(!box) return;
    const p=profile(); const phone=(p?.phone||$('#orderPhone')?.value||'').replace(/\D/g,'');
    const orders=(LS.get('langar_orders_v3',[])||[]).filter(o=>{
      if(p?.id && o.customerId===p.id) return true;
      if(phone && String(o.phone||'').replace(/\D/g,'')===phone) return true;
      return false;
    }).slice(0,6);
    if(!orders.length){ box.innerHTML=`<h3>${t('Moje narudžbe','My Orders')}</h3><p class="muted">${t('Ovdje ćete vidjeti vrijeme pripreme, potvrdu ili mogućnost otkazivanja.','Here you will see prep time, confirmation or cancellation options.')}</p>`; return; }
    box.innerHTML=`<h3>${t('Moje narudžbe','My Orders')}</h3>${orders.map(o=>`
      <article class="order-status-card ${esc(o.status)}">
        <b>${esc(o.id)}</b><small>${new Date(o.createdAt).toLocaleString()}</small>
        <p>${(o.items||[]).map(i=>`${i.qty}× ${esc((lang()==='hr'&&i.nameSnapshotHr)||i.nameSnapshot||i.name||'Item')}`).join('<br>')}</p>
        <p><b>${t('Status','Status')}:</b> ${esc(orderLabel(o.status))}</p>
        <p><b>${t('Plaćanje','Payment')}:</b> ${o.paymentMethod==='card_on_delivery'?t('Kartica','Card'):t('Gotovina','Cash')}</p>
        ${o.etaMinutes?`<p class="eta-line"><b>${t('Procijenjeno vrijeme','Estimated time')}:</b> ${o.etaMinutes} min · <span data-countdown="${esc(o.id)}">${etaCountdown(o)}</span></p>`:''}
        ${o.status==='time_offered'?`<div class="toolbar"><button class="primary" data-accept-order="${esc(o.id)}">${t('Prihvaćam vrijeme','Accept time')}</button><button class="danger" data-cancel-order="${esc(o.id)}">${t('Otkaži narudžbu','Cancel order')}</button></div>`:''}
        ${(o.status==='delivered'||o.status==='completed')&&!o.feedbackSubmitted?`<form class="order-feedback-form" data-feedback-order="${esc(o.id)}"><h4>${t('Ocijenite narudžbu','Rate this order')}</h4><label>${t('Hrana','Food')}<select name="foodRating"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label><label>${t('Dostava/usluga','Delivery/service')}<select name="deliveryRating"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label><label>${t('Komentar','Comment')}<textarea name="message" placeholder="${t('Kako je bilo?','How was it?')}"></textarea></label><button class="secondary full">${t('Pošalji feedback','Send feedback')}</button></form>`:''}
      </article>`).join('')}`;
    $$('[data-accept-order]').forEach(b=>b.onclick=()=>updateOrder(b.dataset.acceptOrder,{status:'accepted',customerDecision:'accepted',acceptedAt:new Date().toISOString()}, t('Narudžba je potvrđena.','Order accepted.')));
    $$('[data-cancel-order]').forEach(b=>b.onclick=()=>updateOrder(b.dataset.cancelOrder,{status:'cancelled_by_customer',customerDecision:'cancelled',cancelledAt:new Date().toISOString()}, t('Narudžba je otkazana.','Order cancelled.')));
    $$('.order-feedback-form').forEach(f=>f.onsubmit=e=>{
      e.preventDefault();
      const id=f.dataset.feedbackOrder; const data=Object.fromEntries(new FormData(f).entries());
      const avg=Math.round(((+data.foodRating||5)+(+data.deliveryRating||5))/2);
      const orders=LS.get('langar_orders_v3',[]); const o=orders.find(x=>x.id===id)||{};
      const list=LS.get('langar_feedback',[]);
      list.unshift({id:uid('FB'),orderId:id,rating:String(avg),foodRating:data.foodRating,deliveryRating:data.deliveryRating,message:data.message||'',favorite:(o.items||[]).map(i=>i.nameSnapshot).join(', '),name:o.name||profile()?.firstName||'Langar guest',status:avg>=4?'public':'admin_only',createdAt:new Date().toISOString()});
      LS.set('langar_feedback',list);
      updateOrder(id,{feedbackSubmitted:true,feedbackAt:new Date().toISOString()}, t('Hvala na feedbacku.','Thank you for your feedback.'));
    });
  }
  function updateOrder(id, patch, message){
    const orders=LS.get('langar_orders_v3',[]).map(o=>o.id===id?{...o,...patch,updatedAt:new Date().toISOString()}:o);
    LS.set('langar_orders_v3',orders); renderCustomerOrders(); showToast(message);
  }
  function overrideSubmit(){
    const btn=$('#submitOrder'); if(!btn || btn.dataset.etaReady) return; btn.dataset.etaReady='1';
    btn.onclick=()=>{
      if(!window.state || !state.cart.length) return alert((window.T&&T[lang()]?.emptyCart)||'Cart is empty.');
      const total=state.cart.reduce((s,it)=>s+priceNum(it.price)*it.qty,0);
      const p=profile();
      const order={
        id:uid('ORD'),status:'new',paid:false,remarisEntered:false,type:state.orderType,
        paymentMethod:$('#orderPaymentMethod')?.value||'cash',
        name:$('#orderName').value,phone:$('#orderPhone').value,address:$('#orderAddress').value,note:$('#orderNote').value,
        customerId:p?.id||null,
        items:state.cart.map(it=>({...it, nameSnapshot:window.itemName?itemName(it,'en'):(it.name?.en||it.name||'Item'), nameSnapshotHr:window.itemName?itemName(it,'hr'):(it.name?.hr||it.name?.en||it.name||'Item')})),
        total:+total.toFixed(2),referredBy:p?.referredBy||null,createdAt:new Date().toISOString()
      };
      const orders=LS.get('langar_orders_v3',[]); orders.unshift(order); LS.set('langar_orders_v3',orders);
      state.cart=[]; if(window.renderCart) renderCart(); decorateOrderUI();
      showToast(t('Narudžba je poslana. Čekajte procijenjeno vrijeme od Langar Bara.','Order sent. Wait for Langar Bar to send estimated time.'));
    };
  }
  const oldRenderCart=window.renderCart;
  if(typeof oldRenderCart==='function') window.renderCart=function(){ oldRenderCart.apply(this,arguments); decorateOrderUI(); overrideSubmit(); };
  document.addEventListener('DOMContentLoaded',()=>{decorateOrderUI(); overrideSubmit(); setInterval(()=>$$('[data-countdown]').forEach(el=>{ const o=(LS.get('langar_orders_v3',[])||[]).find(x=>x.id===el.dataset.countdown); if(o) el.textContent=etaCountdown(o); }),1000);});
  window.LangarOrderFlow={renderCustomerOrders,decorateOrderUI,showToast};
})();
