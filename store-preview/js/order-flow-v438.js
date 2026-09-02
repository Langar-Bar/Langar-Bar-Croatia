// Langar App V4.3.8 — stable order submit bridge + dine-in/delivery/pickup
(function(){
  'use strict';
  const LS = window.LS || {get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const lang=()=>{try{return (state&&state.lang)||localStorage.langar_lang||'hr'}catch{return localStorage.langar_lang||'hr'}};
  const t=(hr,en)=>lang()==='hr'?hr:en;
  const uid=(p='ID')=>p+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
  const priceNum=v=>parseFloat(String(v??'0').replace(/[^0-9.,-]/g,'').replace(',','.'))||0;
  const client=()=>window.LangarCloud?.client||null;
  const profile=()=>{try{return window.profile?window.profile():LS.get('langar_profile',null)}catch{return LS.get('langar_profile',null)}};
  let submitting=false;

  function toast(message){
    let el=$('#langarToast');
    if(!el){el=document.createElement('div');el.id='langarToast';document.body.appendChild(el);} 
    el.textContent=message; el.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove('show'),3000);
  }

  function getState(){try{return state||window.state||null}catch{return window.state||null}}
  function itemNameSafe(it, l=lang()){
    try{ if(window.itemName) return window.itemName(it,l); }catch{}
    if(typeof it.name==='object') return it.name[l]||it.name.en||it.name.hr||'Item';
    return it.nameSnapshot || it.name || it.item_name_en || 'Item';
  }
  function currentCart(){
    const st=getState();
    if(st && Array.isArray(st.cart) && st.cart.length) return st.cart;
    const backup=LS.get('langar_cart_backup_v438',[]);
    if(Array.isArray(backup) && backup.length) return backup;
    return [];
  }
  function backupCart(){
    const st=getState();
    if(st && Array.isArray(st.cart)) LS.set('langar_cart_backup_v438',st.cart);
  }
  function clearCart(){
    const st=getState();
    if(st && Array.isArray(st.cart)) st.cart=[];
    LS.set('langar_cart_backup_v438',[]);
    try{ if(window.renderCart) window.renderCart(); }catch{}
  }
  function currentOrderType(){
    const active=$('.order-mode-segment [data-order-type].active') || $('.segmented [data-order-type].active');
    const st=getState();
    return active?.dataset.orderType || st?.orderType || 'pickup';
  }
  function updateOrderType(type){
    const st=getState(); if(st) st.orderType=type;
    $$('.order-mode-segment [data-order-type], .segmented [data-order-type]').forEach(b=>b.classList.toggle('active',b.dataset.orderType===type));
    updateOrderModeFields();
  }
  function updateOrderModeFields(){
    const mode=currentOrderType();
    const addr=$('#orderAddress'); if(!addr) return;
    const label=addr.closest('label'); if(!label) return;
    const span=label.querySelector('span');
    if(mode==='delivery'){
      label.style.display='block';
      if(span){span.textContent=t('Adresa za dostavu','Delivery address'); span.dataset.hr='Adresa za dostavu'; span.dataset.en='Delivery address';}
      addr.placeholder=t('Ulica, broj, kat, napomena za dostavu','Street, number, floor, delivery note');
    }else if(mode==='dine_in'){
      label.style.display='block';
      if(span){span.textContent=t('Broj stola','Table number'); span.dataset.hr='Broj stola'; span.dataset.en='Table number';}
      addr.placeholder=t('Npr. stol 4 ili terasa','e.g. table 4 or terrace');
    }else{
      label.style.display='none'; addr.value='';
    }
  }
  function ensurePaymentField(){
    if($('#orderPaymentMethod')) return;
    const note=$('#orderNote'); if(!note) return;
    const label=document.createElement('label');
    label.innerHTML=`<span data-hr="Način plaćanja" data-en="Payment method">${t('Način plaćanja','Payment method')}</span><select id="orderPaymentMethod"><option value="cash">${t('Gotovina','Cash')}</option><option value="card_on_delivery">${t('Kartica','Card')}</option></select>`;
    note.closest('label')?.before(label);
  }
  function decorateOrder(){
    ensurePaymentField();
    $$('.order-mode-segment [data-order-type], .segmented [data-order-type]').forEach(b=>{
      if(!b.dataset.v438Mode){ b.dataset.v438Mode='1'; b.addEventListener('click',()=>updateOrderType(b.dataset.orderType)); }
    });
    updateOrderModeFields(); backupCart(); ensureCustomerOrdersBox(); renderCustomerOrders();
  }
  function ensureCustomerOrdersBox(){
    if($('#customerOrderStatus')) return;
    const submit=$('#submitOrder'); const cart=submit?.closest('.cart'); if(!submit||!cart) return;
    const box=document.createElement('section'); box.id='customerOrderStatus'; box.className='order-status-box'; cart.appendChild(box);
  }

  async function submitCloudOrder(order){
    const c=client(); if(!c) return null;
    const session=(await c.auth.getSession()).data.session;
    const type=['delivery','pickup','dine_in'].includes(order.type)?order.type:'pickup';
    let meta=`[PAYMENT_METHOD:${order.paymentMethod||'cash'}]`;
    if(type==='dine_in' && order.tableNumber) meta+=`\n[TABLE:${order.tableNumber}]`;
    if(order.note) meta+=`\nCustomer note: ${order.note}`;
    const {data,error}=await c.from('orders').insert({
      user_id:session?.user?.id||null, order_number:order.id, order_type:type, status:'submitted', customer_name:order.name||null, customer_phone:order.phone||null,
      delivery_address:type==='delivery'?(order.address||null):null, customer_note:meta, subtotal:order.subtotal||0, delivery_fee:order.deliveryFee||0, total:order.total||0, payment_status:'unpaid'
    }).select('id,order_number').single();
    if(error) throw error;
    const rows=(order.items||[]).map(i=>({order_id:data.id,item_name_en:i.nameSnapshot||i.name||'Item',item_name_hr:i.nameSnapshotHr||i.nameSnapshot||i.name||'Item',quantity:i.qty||1,unit_price:priceNum(i.price),total_price:priceNum(i.price)*(i.qty||1),note:i.note||null}));
    if(rows.length){ const {error:itemErr}=await c.from('order_items').insert(rows); if(itemErr) console.warn('order_items insert failed',itemErr.message); }
    return data;
  }
  function broadcastOrder(order){
    try{ localStorage.setItem('langar_order_signal_v438',JSON.stringify({id:order.id,at:Date.now(),type:order.type,total:order.total})); }catch{}
    try{ if('BroadcastChannel' in window){ const bc=new BroadcastChannel('langar_orders'); bc.postMessage({type:'new_order',order}); setTimeout(()=>bc.close(),500); } }catch{}
  }
  function buildOrder(){
    const cart=currentCart(); if(!cart.length) return null;
    const p=profile(); const type=currentOrderType(); const addressOrTable=$('#orderAddress')?.value?.trim()||'';
    const total=cart.reduce((s,it)=>s+priceNum(it.price)*(it.qty||1),0);
    return {
      id:uid('ORD'), status:'submitted', paid:false, remarisEntered:false, type, paymentMethod:$('#orderPaymentMethod')?.value||'cash',
      name:$('#orderName')?.value?.trim()||p?.firstName||'', phone:$('#orderPhone')?.value?.trim()||p?.phone||'',
      address:type==='delivery'?addressOrTable:'', tableNumber:type==='dine_in'?addressOrTable:'', note:$('#orderNote')?.value?.trim()||'', customerId:p?.id||null,
      items:cart.map(it=>({...it,qty:it.qty||1,nameSnapshot:itemNameSafe(it,'en'),nameSnapshotHr:itemNameSafe(it,'hr')})), subtotal:+total.toFixed(2), total:+total.toFixed(2), referredBy:p?.referredBy||null, createdAt:new Date().toISOString()
    };
  }
  async function handleSubmit(e){
    if(e){ e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); }
    if(submitting) return; submitting=true;
    try{
      backupCart(); const order=buildOrder();
      if(!order){ alert(t('Košarica je prazna. Prvo dodajte artikl.','Cart is empty. Add an item first.')); return; }
      try{ const cloudRow=await submitCloudOrder(order); if(cloudRow){ order.cloudId=cloudRow.id; order.cloudOrderNumber=cloudRow.order_number; order.cloud=true; } }
      catch(err){ console.warn('Cloud order save failed:',err.message); toast(t('Narudžba je spremljena lokalno. Cloud nije dostupan.','Order saved locally. Cloud is not available.')); }
      const orders=LS.get('langar_orders_v3',[])||[]; orders.unshift(order); LS.set('langar_orders_v3',orders); broadcastOrder(order); clearCart(); decorateOrder();
      toast(t('Narudžba je poslana. Langar Bar će poslati vrijeme pripreme.','Order sent. Langar Bar will send prep time.'));
    }finally{ submitting=false; }
  }
  function installSubmit(){
    const btn=$('#submitOrder'); if(!btn) return;
    if(btn.dataset.v438Submit) return; btn.dataset.v438Submit='1';
    btn.onclick=null;
    btn.addEventListener('click',handleSubmit,true);
  }
  function parseMeta(note){
    const s=String(note||''); const pick=k=>{const m=s.match(new RegExp('\\['+k+':([^\\]]+)\\]')); return m?m[1].trim():'';};
    return {paymentMethod:pick('PAYMENT_METHOD')||'cash',etaMinutes:Number(pick('ETA_MINUTES')||0),etaSentAt:pick('ETA_SENT_AT')||'',customerDecision:pick('CUSTOMER_DECISION')||'',tableNumber:pick('TABLE')||'',cleanNote:s.replace(/\n?\[(PAYMENT_METHOD|ETA_MINUTES|ETA_SENT_AT|CUSTOMER_DECISION|REMARIS_ENTERED|TABLE):[^\]]+\]/g,'').replace(/^Customer note:\s*/,'').trim()};
  }
  function etaCountdown(meta){
    if(!meta.etaMinutes||!meta.etaSentAt) return ''; const end=new Date(meta.etaSentAt).getTime()+meta.etaMinutes*60000; const left=Math.max(0,end-Date.now());
    if(!left) return t('Vrijeme je isteklo','Time reached'); const m=Math.floor(left/60000), s=Math.floor((left%60000)/1000); return `${m}:${String(s).padStart(2,'0')}`;
  }
  function localOrdersForCustomer(){
    const p=profile(); const phone=(p?.phone||$('#orderPhone')?.value||'').replace(/\D/g,'');
    return (LS.get('langar_orders_v3',[])||[]).filter(o=> (p?.id&&(o.customerId===p.id||o.user_id===p.id)) || (phone&&String(o.phone||o.customer_phone||'').replace(/\D/g,'')===phone));
  }
  async function fetchCloudOrders(){
    const c=client(); if(!c) return []; const session=(await c.auth.getSession()).data.session; if(!session?.user) return [];
    const {data,error}=await c.from('orders').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(10); if(error) return [];
    const orders=(data||[]).map(o=>({id:o.order_number||o.id,cloudId:o.id,status:o.status,type:o.order_type,name:o.customer_name,phone:o.customer_phone,address:o.delivery_address,note:o.customer_note,customer_note:o.customer_note,total:Number(o.total||0),paymentStatus:o.payment_status,createdAt:o.created_at,cloud:true,items:[]}));
    const ids=orders.map(o=>o.cloudId).filter(Boolean); if(ids.length){ const {data:items}=await c.from('order_items').select('*').in('order_id',ids); (items||[]).forEach(it=>{const o=orders.find(x=>x.cloudId===it.order_id); if(o) o.items.push({qty:it.quantity,nameSnapshot:it.item_name_en,nameSnapshotHr:it.item_name_hr,unit_price:it.unit_price,total_price:it.total_price});}); }
    return orders;
  }
  async function renderCustomerOrders(){
    const box=$('#customerOrderStatus'); if(!box) return; const local=localOrdersForCustomer(); let orders=local.slice(0,8);
    const paint=(arr)=>{ box.innerHTML=`<h3>${t('Moje narudžbe','My Orders')}</h3>`+(arr.length?arr.map(o=>{const m=parseMeta(o.customer_note||o.note||''); const waiting=m.etaMinutes&&!m.customerDecision&&(o.status==='submitted'||o.status==='new'||o.status==='time_offered'); return `<article class="order-status-card"><b>${esc(o.id)}</b><small>${new Date(o.createdAt||o.created_at||Date.now()).toLocaleString()}</small><p>${(o.items||[]).map(i=>`${i.qty||1}× ${esc((lang()==='hr'&&i.nameSnapshotHr)||i.nameSnapshot||i.name||'Item')}`).join('<br>')||'<span class="muted">Items loading...</span>'}</p><p><b>Mode:</b> ${esc(o.type||'pickup')}</p><p><b>Status:</b> ${esc(o.status||'submitted')}</p>${m.etaMinutes?`<p><b>Estimated time:</b> ${m.etaMinutes} min · <span data-countdown-order="${esc(o.cloudId||o.id)}">${etaCountdown(m)}</span></p>`:''}${waiting?`<div class="toolbar"><button class="primary" data-accept-order="${esc(o.cloudId||o.id)}">Accept time</button><button class="danger" data-cancel-order="${esc(o.cloudId||o.id)}">Cancel order</button></div>`:''}</article>`;}).join(''):`<p class="muted">${t('Ovdje ćete vidjeti vrijeme pripreme.','Here you will see prep time.')}</p>`); };
    paint(orders); try{ const cloudOrders=await fetchCloudOrders(); if(cloudOrders.length){const map=new Map(); [...cloudOrders,...local].forEach(o=>map.set(o.cloudId||o.id,o)); paint(Array.from(map.values()).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,8));}}catch{}
  }
  const oldRenderCart=window.renderCart;
  if(typeof oldRenderCart==='function') window.renderCart=function(){ oldRenderCart.apply(this,arguments); backupCart(); decorateOrder(); installSubmit(); };
  function boot(){ decorateOrder(); installSubmit(); setInterval(()=>{backupCart(); renderCustomerOrders();},3500); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  window.LangarOrderFlowV438={handleSubmit,renderCustomerOrders,decorateOrder,toast};
})();
