// Langar App V4.3.7 — stable orders with pickup, delivery and dine-in modes
(function(){
  'use strict';
  const LS = window.LS || {get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  const lang = ()=> (window.state && state.lang) || localStorage.langar_lang || 'hr';
  const t = (hr,en)=> lang()==='hr' ? hr : en;
  const uid = (p='ID')=> p+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
  const priceNum = window.priceNum || ((v)=>parseFloat(String(v).replace(/[^0-9.,]/g,'').replace(',','.'))||0);
  const profile = window.profile || (()=>LS.get('langar_profile', null));
  const cloud = ()=>window.LangarCloud;
  const client = ()=>cloud()?.client || null;
  function appState(){
    try{ return window.state || state || null; }catch(e){ return window.state || null; }
  }

  function showToast(message){
    let el=$('#langarToast');
    if(!el){ el=document.createElement('div'); el.id='langarToast'; document.body.appendChild(el); }
    el.textContent=message; el.classList.add('show');
    clearTimeout(showToast._t); showToast._t=setTimeout(()=>el.classList.remove('show'),2700);
  }

  function parseMeta(note){
    const s=String(note||'');
    const pick=(key)=>{ const m=s.match(new RegExp('\\\\['+key+':([^\\\\]]+)\\\\]')); return m?m[1].trim():''; };
    return {
      paymentMethod: pick('PAYMENT_METHOD') || 'cash',
      etaMinutes: Number(pick('ETA_MINUTES')||0),
      etaSentAt: pick('ETA_SENT_AT') || '',
      customerDecision: pick('CUSTOMER_DECISION') || '',
      remarisEntered: pick('REMARIS_ENTERED') === 'true',
      tableNumber: pick('TABLE') || '',
      cleanNote: s.replace(/\n?\[(PAYMENT_METHOD|ETA_MINUTES|ETA_SENT_AT|CUSTOMER_DECISION|REMARIS_ENTERED|TABLE):[^\]]+\]/g,'').replace(/^Customer note:\s*/,'').trim()
    };
  }
  function appendMarker(note,key,value){
    let s=String(note||'');
    const re=new RegExp('\\n?\\['+key+':[^\\]]+\\]','g');
    s=s.replace(re,'').trim();
    return (s? s+'\n':'')+`[${key}:${value}]`;
  }
  function orderLabel(status, meta={}){
    if(meta.customerDecision==='accepted' && status==='submitted') return t('Vrijeme prihvaćeno','Time accepted');
    return ({draft:'Draft',submitted:t('Čeka vrijeme','Waiting for time'),accepted:t('Prihvaćeno','Accepted'),preparing:t('U pripremi','Preparing'),ready:t('Spremno','Ready'),out_for_delivery:t('Na dostavi','Out for delivery'),delivered:t('Dostavljeno','Delivered'),completed:t('Završeno','Completed'),cancelled:t('Otkazano','Cancelled'),rejected:t('Odbijeno','Rejected'),refunded:'Refunded',new:t('Čeka vrijeme','Waiting for time'),time_offered:t('Vrijeme ponuđeno','Time offered'),cancelled_by_customer:t('Otkazano','Cancelled') }[status] || status || 'submitted');
  }
  function etaCountdownFrom(meta){
    if(!meta.etaMinutes || !meta.etaSentAt) return '';
    const end=new Date(meta.etaSentAt).getTime()+Number(meta.etaMinutes)*60000;
    const left=Math.max(0,end-Date.now());
    if(!left) return t('Vrijeme je isteklo','Time reached');
    const m=Math.floor(left/60000); const s=Math.floor((left%60000)/1000);
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  function currentOrderType(){ const st=appState(); return (st && st.orderType) || 'pickup'; }
  function updateOrderModeFields(){
    const mode=currentOrderType();
    const addr=$('#orderAddress'); if(!addr) return;
    const label=addr.closest('label'); if(!label) return;
    const span=label.querySelector('span');
    if(mode==='delivery'){
      label.style.display='block';
      if(span){ span.textContent=t('Adresa za dostavu','Delivery address'); span.dataset.hr='Adresa za dostavu'; span.dataset.en='Delivery address'; }
      addr.placeholder=t('Ulica, broj, kat, napomena za dostavu','Street, number, floor, delivery note');
    } else if(mode==='dine_in'){
      label.style.display='block';
      if(span){ span.textContent=t('Broj stola','Table number'); span.dataset.hr='Broj stola'; span.dataset.en='Table number'; }
      addr.placeholder=t('Npr. stol 4 ili terasa','e.g. table 4 or terrace');
    } else {
      label.style.display='none';
      addr.value='';
    }
  }
  function orderTypeLabel(type){
    return type==='delivery'?t('Delivery','Delivery'):(type==='dine_in'?t('Dine-in','Dine-in'):'Pick-up');
  }
  function decorateOrderUI(){
    const oldPaymentNote = $('#orderPaymentMethod')?.closest('label')?.querySelector('small.muted');
    if(oldPaymentNote) oldPaymentNote.remove();
    const note=$('#orderNote');
    if(note && !$('#orderPaymentMethod')){
      const label=document.createElement('label');
      // Internal courier/POS instruction is shown only in Admin, never to customers.
      label.innerHTML=`<span data-hr="Način plaćanja" data-en="Payment method">${t('Način plaćanja','Payment method')}</span><select id="orderPaymentMethod"><option value="cash">${t('Gotovina','Cash')}</option><option value="card_on_delivery">${t('Kartica pri dostavi/preuzimanju','Card on delivery / pickup')}</option></select>`;
      note.closest('label').before(label);
    }
    $$('.segmented [data-order-type]').forEach(b=>{ if(!b.dataset.dineReady){ b.dataset.dineReady='1'; b.addEventListener('click',()=>setTimeout(updateOrderModeFields,0)); }});
    updateOrderModeFields();
    const submit=$('#submitOrder');
    if(submit && !$('#customerOrderStatus')){
      const box=document.createElement('section');
      box.id='customerOrderStatus'; box.className='order-status-box';
      submit.closest('.cart')?.appendChild(box);
    }
    renderCustomerOrders();
  }

  function localOrdersForCustomer(){
    const p=profile(); const phone=(p?.phone||$('#orderPhone')?.value||'').replace(/\D/g,'');
    return (LS.get('langar_orders_v3',[])||[]).filter(o=>{
      if(p?.id && (o.customerId===p.id || o.user_id===p.id)) return true;
      if(phone && String(o.phone||o.customer_phone||'').replace(/\D/g,'')===phone) return true;
      return false;
    });
  }

  async function fetchCloudCustomerOrders(){
    const c=client(); if(!c) return [];
    const session=(await c.auth.getSession()).data.session; if(!session?.user) return [];
    const {data,error}=await c.from('orders').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(10);
    if(error){ console.warn('customer cloud orders error',error.message); return []; }
    const orders=(data||[]).map(o=>({
      id:o.order_number||o.id, cloudId:o.id, status:o.status, type:o.order_type, name:o.customer_name, phone:o.customer_phone, address:o.delivery_address, note:o.customer_note, customer_note:o.customer_note,
      total:Number(o.total||0), paymentStatus:o.payment_status, createdAt:o.created_at, cloud:true, items:[]
    }));
    const ids=orders.map(o=>o.cloudId).filter(Boolean);
    if(ids.length){
      const {data:items}=await c.from('order_items').select('*').in('order_id',ids);
      (items||[]).forEach(it=>{ const o=orders.find(x=>x.cloudId===it.order_id); if(o) o.items.push({qty:it.quantity,item_name_en:it.item_name_en,item_name_hr:it.item_name_hr,nameSnapshot:it.item_name_en,nameSnapshotHr:it.item_name_hr,unit_price:it.unit_price,total_price:it.total_price}); });
    }
    return orders;
  }

  async function renderCustomerOrders(){
    const box=$('#customerOrderStatus'); if(!box) return;
    const local=localOrdersForCustomer();
    let orders=local.slice(0,8);
    if(!orders.length){
      box.innerHTML=`<h3>${t('Moje narudžbe','My Orders')}</h3><p class="muted">${t('Ovdje ćete vidjeti vrijeme pripreme, potvrdu ili mogućnost otkazivanja.','Here you will see prep time, confirmation or cancellation options.')}</p>`;
    } else {
      paintCustomerOrders(box, orders);
    }
    const cloudOrders=await fetchCloudCustomerOrders();
    if(cloudOrders.length){
      const map=new Map();
      [...cloudOrders,...local].forEach(o=>map.set(o.cloudId||o.id,o));
      paintCustomerOrders(box, Array.from(map.values()).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,8));
    }
  }

  function paintCustomerOrders(box, orders){
    box.innerHTML=`<h3>${t('Moje narudžbe','My Orders')}</h3>${orders.map(o=>{
      const meta=parseMeta(o.customer_note||o.note||'');
      const waitingDecision=meta.etaMinutes && !meta.customerDecision && (o.status==='submitted'||o.status==='new'||o.status==='time_offered');
      return `<article class="order-status-card ${esc(o.status)}">
        <b>${esc(o.id)}</b><small>${new Date(o.createdAt||o.created_at||Date.now()).toLocaleString()}</small>
        <p>${(o.items||[]).map(i=>`${i.qty||i.quantity||1}× ${esc((lang()==='hr'&&(i.nameSnapshotHr||i.item_name_hr))||i.nameSnapshot||i.item_name_en||i.name||'Item')}`).join('<br>')||'<span class="muted">Items loading...</span>'}</p>
        <p><b>${t('Način','Mode')}:</b> ${esc(orderTypeLabel(o.type||'pickup'))}</p>
        <p><b>${t('Status','Status')}:</b> ${esc(orderLabel(o.status,meta))}</p>
        ${(o.type==='delivery'&&o.address)?`<p><b>${t('Adresa','Address')}:</b> ${esc(o.address)}</p>`:''}${(o.type==='dine_in'&&(meta.tableNumber||o.address))?`<p><b>${t('Stol','Table')}:</b> ${esc(meta.tableNumber||o.address)}</p>`:''}
        <p><b>${t('Plaćanje','Payment')}:</b> ${meta.paymentMethod==='card_on_delivery'?t('Kartica','Card'):t('Gotovina','Cash')}</p>
        ${meta.etaMinutes?`<p class="eta-line"><b>${t('Procijenjeno vrijeme','Estimated time')}:</b> ${meta.etaMinutes} min · <span data-countdown-order="${esc(o.cloudId||o.id)}">${etaCountdownFrom(meta)}</span></p>`:''}
        ${waitingDecision?`<div class="toolbar"><button class="primary" data-accept-order="${esc(o.cloudId||o.id)}">${t('Prihvaćam vrijeme','Accept time')}</button><button class="danger" data-cancel-order="${esc(o.cloudId||o.id)}">${t('Otkaži narudžbu','Cancel order')}</button></div>`:''}
        ${(o.status==='delivered'||o.status==='completed')&&!o.feedbackSubmitted?`<form class="order-feedback-form" data-feedback-order="${esc(o.cloudId||o.id)}"><h4>${t('Ocijenite narudžbu','Rate this order')}</h4><label>${t('Hrana','Food')}<select name="foodRating"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label><label>${t('Dostava/usluga','Delivery/service')}<select name="deliveryRating"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label><label>${t('Komentar','Comment')}<textarea name="message" placeholder="${t('Kako je bilo?','How was it?')}"></textarea></label><button class="secondary full">${t('Pošalji feedback','Send feedback')}</button></form>`:''}
      </article>`;
    }).join('')}`;
    $$('[data-accept-order]',box).forEach(b=>b.onclick=()=>customerOrderDecision(b.dataset.acceptOrder,'accepted'));
    $$('[data-cancel-order]',box).forEach(b=>b.onclick=()=>customerOrderDecision(b.dataset.cancelOrder,'cancelled'));
    $$('.order-feedback-form',box).forEach(f=>f.onsubmit=e=>submitOrderFeedback(e,f));
  }

  async function customerOrderDecision(id, decision){
    const c=client();
    const msg=decision==='accepted'?t('Narudžba je potvrđena.','Order accepted.'):t('Narudžba je otkazana.','Order cancelled.');
    const local=LS.get('langar_orders_v3',[]);
    let found=false;
    local.forEach(o=>{ if(o.id===id || o.cloudId===id){ found=true; o.customerDecision=decision; o.status=decision==='accepted'?'accepted':'cancelled_by_customer'; o.note=appendMarker(o.note||'', 'CUSTOMER_DECISION', decision); o.updatedAt=new Date().toISOString(); } });
    LS.set('langar_orders_v3',local);
    if(c){
      try{
        const {data}=await c.from('orders').select('id,customer_note,status').eq('id',id).maybeSingle();
        if(data){
          let note=appendMarker(data.customer_note||'', 'CUSTOMER_DECISION', decision);
          const patch={customer_note:note, updated_at:new Date().toISOString()};
          if(decision==='cancelled') patch.status='cancelled';
          await c.from('orders').update(patch).eq('id',id);
        }
      }catch(err){ console.warn('cloud order decision error',err.message); }
    }
    showToast(msg); renderCustomerOrders();
  }

  async function submitOrderFeedback(e,f){
    e.preventDefault();
    const id=f.dataset.feedbackOrder; const data=Object.fromEntries(new FormData(f).entries());
    const avg=Math.round(((+data.foodRating||5)+(+data.deliveryRating||5))/2);
    const localOrders=LS.get('langar_orders_v3',[]); const o=localOrders.find(x=>x.id===id||x.cloudId===id)||{};
    const fb={id:uid('FB'),orderId:id,rating:String(avg),foodRating:data.foodRating,deliveryRating:data.deliveryRating,message:data.message||'',favorite:(o.items||[]).map(i=>i.nameSnapshot).join(', '),name:o.name||profile()?.firstName||'Langar guest',status:avg>=4?'public':'admin_only',createdAt:new Date().toISOString()};
    const list=LS.get('langar_feedback',[]); list.unshift(fb); LS.set('langar_feedback',list);
    const c=client();
    if(c){ try{ const session=(await c.auth.getSession()).data.session; await c.from('feedback').insert({user_id:session?.user?.id||null,order_id:id.length>20?id:null,rating:avg,message:data.message||'',customer_name:fb.name,is_public:avg>=4,status:avg>=4?'public':'admin_only'}); }catch(err){ console.warn('cloud feedback insert error',err.message); } }
    localOrders.forEach(x=>{ if(x.id===id||x.cloudId===id){ x.feedbackSubmitted=true; x.feedbackAt=new Date().toISOString(); }}); LS.set('langar_orders_v3',localOrders);
    showToast(t('Hvala na feedbacku.','Thank you for your feedback.')); renderCustomerOrders();
  }

  async function submitCloudOrder(order){
    const c=client(); if(!c) return null;
    const session=(await c.auth.getSession()).data.session; if(!session?.user) return null;
    const orderNumber=order.id;
    const type = ['delivery','pickup','dine_in'].includes(order.type) ? order.type : 'pickup';
    let metaNote=`[PAYMENT_METHOD:${order.paymentMethod||'cash'}]`;
    if(type==='dine_in' && order.tableNumber) metaNote += `
[TABLE:${order.tableNumber}]`;
    if(order.note) metaNote += `
Customer note: ${order.note}`;
    const {data,error}=await c.from('orders').insert({
      user_id: session.user.id,
      order_number: orderNumber,
      order_type: type,
      status: 'submitted',
      customer_name: order.name||null,
      customer_phone: order.phone||null,
      delivery_address: type==='delivery' ? (order.address||null) : null,
      customer_note: metaNote,
      subtotal: order.subtotal ?? order.total ?? 0,
      delivery_fee: order.deliveryFee || 0,
      discount_total: 0,
      total: order.total || 0,
      payment_status: 'unpaid'
    }).select('id,order_number').single();
    if(error) throw error;
    const rows=(order.items||[]).map(i=>({order_id:data.id,item_name_en:i.nameSnapshot||i.name||'Item',item_name_hr:i.nameSnapshotHr||i.nameSnapshot||i.name||'Item',quantity:i.qty||1,unit_price:priceNum(i.price),total_price:priceNum(i.price)*(i.qty||1),note:i.note||null}));
    if(rows.length){ const {error:itemErr}=await c.from('order_items').insert(rows); if(itemErr) console.warn('cloud order items error',itemErr.message); }
    return data;
  }

  function overrideSubmit(){
    const btn=$('#submitOrder'); if(!btn) return;
    btn.dataset.etaReady='1';
    btn.onclick=async()=>{
      const st=appState();
      const cart=(st && Array.isArray(st.cart)) ? st.cart : [];
      if(!cart.length) return alert((window.T&&T[lang()]?.emptyCart)||'Cart is empty.');
      const total=cart.reduce((s,it)=>s+priceNum(it.price)*it.qty,0);
      const p=profile();
      const orderType=state.orderType||'pickup';
      const addressOrTable=$('#orderAddress')?.value||'';
      const order={
        id:uid('ORD'),status:'new',paid:false,remarisEntered:false,type:orderType,paymentMethod:$('#orderPaymentMethod')?.value||'cash',
        name:$('#orderName')?.value||p?.firstName||'',phone:$('#orderPhone')?.value||p?.phone||'',address:orderType==='delivery'?addressOrTable:'',tableNumber:orderType==='dine_in'?addressOrTable:'',note:$('#orderNote')?.value||'',customerId:p?.id||null,
        items:cart.map(it=>({...it, nameSnapshot:window.itemName?itemName(it,'en'):(it.name?.en||it.name||'Item'), nameSnapshotHr:window.itemName?itemName(it,'hr'):(it.name?.hr||it.name?.en||it.name||'Item')})),
        subtotal:+total.toFixed(2),total:+total.toFixed(2),referredBy:p?.referredBy||null,createdAt:new Date().toISOString()
      };
      try{ const cloudRow=await submitCloudOrder(order); if(cloudRow){ order.cloudId=cloudRow.id; order.cloudOrderNumber=cloudRow.order_number; order.cloud=true; } }
      catch(err){ console.warn('Cloud order save failed:',err.message); showToast(t('Narudžba je spremljena lokalno. Cloud nije dostupan.','Order saved locally. Cloud is not available.')); }
      const orders=LS.get('langar_orders_v3',[]); orders.unshift(order); LS.set('langar_orders_v3',orders);
      if(st) st.cart=[]; if(window.renderCart) renderCart(); decorateOrderUI();
      showToast(t('Narudžba je poslana. Čekajte procijenjeno vrijeme od Langar Bara.','Order sent. Wait for Langar Bar to send estimated time.'));
    };
  }

  const oldRenderCart=window.renderCart;
  if(typeof oldRenderCart==='function') window.renderCart=function(){ oldRenderCart.apply(this,arguments); decorateOrderUI(); overrideSubmit(); };
  document.addEventListener('DOMContentLoaded',()=>{decorateOrderUI(); overrideSubmit(); setInterval(()=>$$('[data-countdown-order]').forEach(el=>{ const orders=[...(LS.get('langar_orders_v3',[])||[])]; const o=orders.find(x=>x.id===el.dataset.countdownOrder||x.cloudId===el.dataset.countdownOrder); if(o) el.textContent=etaCountdownFrom(parseMeta(o.customer_note||o.note||'')); }),1000);});
  window.LangarOrderFlow={renderCustomerOrders,decorateOrderUI,showToast,parseMeta,appendMarker};
})();
