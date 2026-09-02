// Langar App V4.4.0 — customer order progress, accept timer and feedback
(function(){
  'use strict';
  const LS = window.LS || {get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
  const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const lang=()=>{try{return (window.state&&state.lang)||localStorage.langar_lang||'hr'}catch{return localStorage.langar_lang||'hr'}};
  const t=(hr,en)=>lang()==='hr'?hr:en;
  const uid=(p='ID')=>p+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
  const priceNum=v=>parseFloat(String(v??'0').replace(/[^0-9.,-]/g,'').replace(',','.'))||0;
  const client=()=>window.LangarCloud?.client||null;
  const profile=()=>{try{return window.profile?window.profile():LS.get('langar_profile',null)}catch{return LS.get('langar_profile',null)}};
  let submitting=false;

  function toast(message){
    let el=$('#langarToast');
    if(!el){ el=document.createElement('div'); el.id='langarToast'; document.body.appendChild(el); }
    el.textContent=message; el.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove('show'),3000);
  }
  function getState(){try{return window.state||state||null}catch{return window.state||null}}
  function itemNameSafe(it,l=lang()){
    try{ if(window.itemName) return window.itemName(it,l); }catch{}
    if(typeof it.name==='object') return it.name[l]||it.name.en||it.name.hr||'Item';
    return it.nameSnapshot||it.name||it.item_name_en||'Item';
  }
  function currentCart(){ const st=getState(); if(st&&Array.isArray(st.cart)&&st.cart.length) return st.cart; const backup=LS.get('langar_cart_backup_v440',LS.get('langar_cart_backup_v439',LS.get('langar_cart_backup_v438',[]))); return Array.isArray(backup)?backup:[]; }
  function backupCart(){ const st=getState(); if(st&&Array.isArray(st.cart)) LS.set('langar_cart_backup_v440',st.cart); }
  function clearCart(){ const st=getState(); if(st&&Array.isArray(st.cart)) st.cart=[]; LS.set('langar_cart_backup_v440',[]); LS.set('langar_cart_backup_v439',[]); LS.set('langar_cart_backup_v438',[]); try{ if(window.renderCart) window.renderCart(); }catch{} }
  function currentOrderType(){ const active=$('.order-mode-segment [data-order-type].active')||$('.segmented [data-order-type].active'); const st=getState(); return active?.dataset.orderType||st?.orderType||'pickup'; }
  function setOrderType(type){ const st=getState(); if(st) st.orderType=type; $$('.order-mode-segment [data-order-type], .segmented [data-order-type]').forEach(b=>b.classList.toggle('active',b.dataset.orderType===type)); updateOrderModeFields(); }
  function updateOrderModeFields(){
    const mode=currentOrderType(); const addr=$('#orderAddress'); if(!addr) return; const label=addr.closest('label'); if(!label) return; const span=label.querySelector('span');
    if(mode==='delivery'){
      label.style.display='block'; if(span){span.textContent=t('Adresa za dostavu','Delivery address'); span.dataset.hr='Adresa za dostavu'; span.dataset.en='Delivery address';}
      addr.placeholder=t('Ulica, broj, kat, napomena za dostavu','Street, number, floor, delivery note');
    }else if(mode==='dine_in'){
      label.style.display='block'; if(span){span.textContent=t('Broj stola','Table number'); span.dataset.hr='Broj stola'; span.dataset.en='Table number';}
      addr.placeholder=t('Npr. stol 4 ili terasa','e.g. table 4 or terrace');
    }else{ label.style.display='none'; addr.value=''; }
  }
  function ensurePaymentField(){
    const note=$('#orderNote'); if(!note) return;
    const old=$('#orderPaymentMethod'); if(old){ old.closest('label')?.querySelector('small')?.remove(); return; }
    const label=document.createElement('label');
    label.innerHTML=`<span data-hr="Način plaćanja" data-en="Payment method">${t('Način plaćanja','Payment method')}</span><select id="orderPaymentMethod"><option value="cash">${t('Gotovina','Cash')}</option><option value="card_on_delivery">${t('Kartica pri dostavi/preuzimanju','Card on delivery / pickup')}</option></select>`;
    note.closest('label')?.before(label);
  }
  function ensureCustomerOrdersBox(){ const submit=$('#submitOrder'); const cart=submit?.closest('.cart'); if(submit&&cart&&!$('#customerOrderStatus')){ const box=document.createElement('section'); box.id='customerOrderStatus'; box.className='order-status-box'; cart.appendChild(box); } const club=$('#club'); if(club&&!$('#clubOrderHistory')){ const box=document.createElement('section'); box.id='clubOrderHistory'; box.className='order-status-box'; club.appendChild(box); } }
  function decorateOrder(){
    ensurePaymentField();
    $$('.order-mode-segment [data-order-type], .segmented [data-order-type]').forEach(b=>{ if(!b.dataset.v440Mode){ b.dataset.v440Mode='1'; b.addEventListener('click',()=>setOrderType(b.dataset.orderType)); } });
    updateOrderModeFields(); backupCart(); ensureCustomerOrdersBox(); renderCustomerOrders();
  }
  function appendMarker(note,key,value){ let s=String(note||'').replace(new RegExp('\\n?\\['+key+':[^\\]]+\\]','g'),'').trim(); return (s?s+'\n':'')+`[${key}:${value}]`; }
  function parseMeta(note){
    const s=String(note||''); const pick=k=>{const m=s.match(new RegExp('\\['+k+':([^\\]]+)\\]')); return m?m[1].trim():'';};
    return {paymentMethod:pick('PAYMENT_METHOD')||'cash',etaMinutes:Number(pick('ETA_MINUTES')||0),etaOfferedAt:pick('ETA_OFFERED_AT')||'',etaAcceptedAt:pick('ETA_ACCEPTED_AT')||pick('ETA_SENT_AT')||'',customerDecision:pick('CUSTOMER_DECISION')||'',feedbackSubmitted:pick('FEEDBACK_SUBMITTED')==='true',tableNumber:pick('TABLE')||'',cleanNote:s.replace(/\n?\[(PAYMENT_METHOD|ETA_MINUTES|ETA_OFFERED_AT|ETA_ACCEPTED_AT|ETA_SENT_AT|CUSTOMER_DECISION|REMARIS_ENTERED|TABLE|FEEDBACK_SUBMITTED):[^\]]+\]/g,'').replace(/^Customer note:\s*/,'').trim()};
  }
  function etaCountdown(meta,status){
    if(!meta.etaMinutes) return '';
    if(meta.customerDecision!=='accepted' || !meta.etaAcceptedAt) return t('Čeka potvrdu gosta','Waiting for customer confirmation');
    if(['ready','out_for_delivery','delivered','completed','cancelled','rejected','cancelled_by_customer'].includes(status||'')) return '';
    const end=new Date(meta.etaAcceptedAt).getTime()+meta.etaMinutes*60000; const left=Math.max(0,end-Date.now());
    if(!left) return t('Vrijeme je isteklo','Time reached'); const m=Math.floor(left/60000), s=Math.floor((left%60000)/1000); return `${m}:${String(s).padStart(2,'0')}`;
  }
  function orderLabel(status,meta={}){
    if(status==='time_offered' && meta.customerDecision!=='accepted') return t('Čeka potvrdu vremena','Waiting for time confirmation');
    return ({submitted:t('Čeka vrijeme','Waiting for time'),time_offered:t('Vrijeme ponuđeno','Time offered'),accepted:t('Prihvaćeno','Accepted'),preparing:t('U pripremi','Preparing'),ready:t('Spremno','Ready'),out_for_delivery:t('Na dostavi','Out for delivery'),delivered:t('Dostavljeno','Delivered'),completed:t('Završeno','Completed'),cancelled:t('Otkazano','Cancelled'),cancelled_by_customer:t('Otkazano','Cancelled'),rejected:t('Odbijeno','Rejected'),new:t('Čeka vrijeme','Waiting for time')}[status]||status||'submitted');
  }
  function orderProgress(status,meta={}){
    const steps=[
      ['submitted',t('Sent','Sent')],
      ['time_offered',t('Time','Time')],
      ['accepted',t('Accepted','Accepted')],
      ['preparing',t('Preparing','Preparing')],
      ['ready',t('Ready','Ready')],
      ['completed',t('Done','Done')]
    ];
    const map={new:0,submitted:0,time_offered:1,accepted:2,preparing:3,ready:4,out_for_delivery:4,delivered:5,completed:5,cancelled:1,cancelled_by_customer:1,rejected:1};
    const current=map[status||'submitted']??0;
    const cancelled=['cancelled','cancelled_by_customer','rejected'].includes(status||'');
    return `<div class="order-progress ${cancelled?'cancelled':''}">${steps.map((s,i)=>`<span class="${i<=current?'done':''} ${i===current?'active':''}"><b>${i+1}</b><small>${esc(s[1])}</small></span>`).join('')}</div>`;
  }
  function orderTypeLabel(type){ return type==='delivery'?t('Delivery','Delivery'):(type==='dine_in'?t('Dine-in','Dine-in'):'Pick-up'); }
  async function submitCloudOrder(order){
    const c=client(); if(!c) return null; const session=(await c.auth.getSession()).data.session;
    const type=['delivery','pickup','dine_in'].includes(order.type)?order.type:'pickup';
    let meta=`[PAYMENT_METHOD:${order.paymentMethod||'cash'}]`;
    if(type==='dine_in'&&order.tableNumber) meta+=`\n[TABLE:${order.tableNumber}]`;
    if(order.note) meta+=`\nCustomer note: ${order.note}`;
    const {data,error}=await c.from('orders').insert({user_id:session?.user?.id||null,order_number:order.id,order_type:type,status:'submitted',customer_name:order.name||null,customer_phone:order.phone||null,delivery_address:type==='delivery'?(order.address||null):null,customer_note:meta,subtotal:order.subtotal||0,delivery_fee:order.deliveryFee||0,discount_total:0,total:order.total||0,payment_status:'unpaid'}).select('id,order_number').single();
    if(error) throw error;
    const rows=(order.items||[]).map(i=>({order_id:data.id,item_name_en:i.nameSnapshot||i.name||'Item',item_name_hr:i.nameSnapshotHr||i.nameSnapshot||i.name||'Item',quantity:i.qty||1,unit_price:priceNum(i.price),total_price:priceNum(i.price)*(i.qty||1),note:i.note||null}));
    if(rows.length){ const {error:itemErr}=await c.from('order_items').insert(rows); if(itemErr) console.warn('order items insert error',itemErr.message); }
    return data;
  }
  function broadcastOrder(order){ try{localStorage.setItem('langar_order_signal_v440',JSON.stringify({id:order.id,at:Date.now(),type:order.type,total:order.total})); localStorage.setItem('langar_order_signal_v439',JSON.stringify({id:order.id,at:Date.now(),type:order.type,total:order.total})); localStorage.setItem('langar_order_signal_v438',JSON.stringify({id:order.id,at:Date.now()}));}catch{} try{ if('BroadcastChannel'in window){const bc=new BroadcastChannel('langar_orders'); bc.postMessage({type:'new_order',order}); setTimeout(()=>bc.close(),500);} }catch{} }
  function buildOrder(){
    const cart=currentCart(); if(!cart.length) return null; const p=profile(); const type=currentOrderType(); const addressOrTable=$('#orderAddress')?.value?.trim()||'';
    const total=cart.reduce((s,it)=>s+priceNum(it.price)*(it.qty||1),0);
    return {id:uid('ORD'),status:'submitted',paid:false,remarisEntered:false,type,paymentMethod:$('#orderPaymentMethod')?.value||'cash',name:$('#orderName')?.value?.trim()||p?.firstName||'',phone:$('#orderPhone')?.value?.trim()||p?.phone||'',address:type==='delivery'?addressOrTable:'',tableNumber:type==='dine_in'?addressOrTable:'',note:$('#orderNote')?.value?.trim()||'',customerId:p?.id||null,items:cart.map(it=>({...it,qty:it.qty||1,nameSnapshot:itemNameSafe(it,'en'),nameSnapshotHr:itemNameSafe(it,'hr')})),subtotal:+total.toFixed(2),total:+total.toFixed(2),referredBy:p?.referredBy||null,createdAt:new Date().toISOString()};
  }
  async function handleSubmit(e){
    if(e){e.preventDefault();e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();}
    if(submitting) return; submitting=true;
    try{ backupCart(); const order=buildOrder(); if(!order){ alert(t('Košarica je prazna. Prvo dodajte artikl.','Cart is empty. Add an item first.')); return; }
      try{ const cloudRow=await submitCloudOrder(order); if(cloudRow){order.cloudId=cloudRow.id; order.cloudOrderNumber=cloudRow.order_number; order.cloud=true;} }
      catch(err){ console.warn('Cloud order save failed:',err.message); toast(t('Narudžba je spremljena lokalno. Cloud nije dostupan.','Order saved locally. Cloud is not available.')); }
      const orders=LS.get('langar_orders_v3',[])||[]; orders.unshift(order); LS.set('langar_orders_v3',orders); broadcastOrder(order); clearCart(); decorateOrder(); toast(t('Narudžba je poslana. Langar Bar će poslati vrijeme pripreme.','Order sent. Langar Bar will send prep time.'));
    }finally{submitting=false;}
  }
  function installSubmit(){ const btn=$('#submitOrder'); if(!btn) return; btn.onclick=null; btn.dataset.v440Submit='1'; btn.addEventListener('click',handleSubmit,true); }
  function localOrdersForCustomer(){ const p=profile(); const phone=(p?.phone||$('#orderPhone')?.value||'').replace(/\D/g,''); return (LS.get('langar_orders_v3',[])||[]).filter(o=>(p?.id&&(o.customerId===p.id||o.user_id===p.id))||(phone&&String(o.phone||o.customer_phone||'').replace(/\D/g,'')===phone)); }
  async function fetchCloudOrders(){
    const c=client(); if(!c) return []; const session=(await c.auth.getSession()).data.session; if(!session?.user) return [];
    const {data,error}=await c.from('orders').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(12); if(error) return [];
    const orders=(data||[]).map(o=>({id:o.order_number||o.id,cloudId:o.id,status:o.status,type:o.order_type,name:o.customer_name,phone:o.customer_phone,address:o.delivery_address,note:o.customer_note,customer_note:o.customer_note,total:Number(o.total||0),paymentStatus:o.payment_status,createdAt:o.created_at,cloud:true,items:[]}));
    const ids=orders.map(o=>o.cloudId).filter(Boolean); if(ids.length){ const {data:items}=await c.from('order_items').select('*').in('order_id',ids); (items||[]).forEach(it=>{const o=orders.find(x=>x.cloudId===it.order_id); if(o) o.items.push({qty:it.quantity,nameSnapshot:it.item_name_en,nameSnapshotHr:it.item_name_hr,item_name_en:it.item_name_en,item_name_hr:it.item_name_hr,unit_price:it.unit_price,total_price:it.total_price});}); }
    return orders;
  }
  function mergeOrders(cloud,local){ const map=new Map(); [...cloud,...local].forEach(o=>map.set(o.cloudId||o.id,o)); return Array.from(map.values()).sort((a,b)=>new Date(b.createdAt||b.created_at||0)-new Date(a.createdAt||a.created_at||0)); }
  function canFeedback(o,meta){ return ['delivered','completed'].includes(o.status) && !o.feedbackSubmitted && !meta.feedbackSubmitted; }
  function paintCustomerOrders(box,orders){
    box.innerHTML=`<h3>${t('Moje narudžbe','My Orders')}</h3>`+(orders.length?orders.map(o=>{ const meta=parseMeta(o.customer_note||o.note||''); const waiting=meta.etaMinutes && (!meta.customerDecision || meta.customerDecision==='pending') && ['submitted','new','time_offered'].includes(o.status||'submitted');
      return `<article class="order-status-card ${esc(o.status)}"><b>${esc(o.id)}</b><small>${new Date(o.createdAt||o.created_at||Date.now()).toLocaleString()}</small><p>${(o.items||[]).map(i=>`${i.qty||i.quantity||1}× ${esc((lang()==='hr'&&(i.nameSnapshotHr||i.item_name_hr))||i.nameSnapshot||i.item_name_en||i.name||'Item')}`).join('<br>')||'<span class="muted">Items loading...</span>'}</p><p><b>${t('Način','Mode')}:</b> ${esc(orderTypeLabel(o.type||'pickup'))}</p><p><b>${t('Status','Status')}:</b> ${esc(orderLabel(o.status,meta))}</p>${orderProgress(o.status,meta)}${(o.type==='delivery'&&o.address)?`<p><b>${t('Adresa','Address')}:</b> ${esc(o.address)}</p>`:''}${(o.type==='dine_in'&&(meta.tableNumber||o.tableNumber))?`<p><b>${t('Stol','Table')}:</b> ${esc(meta.tableNumber||o.tableNumber)}</p>`:''}<p><b>${t('Plaćanje','Payment')}:</b> ${meta.paymentMethod==='card_on_delivery'?t('Kartica','Card'):t('Gotovina','Cash')}</p>${meta.etaMinutes?`<p class="eta-line"><b>${t('Procijenjeno vrijeme','Estimated time')}:</b> ${meta.etaMinutes} min · <span data-countdown-order="${esc(o.cloudId||o.id)}">${etaCountdown(meta,o.status)}</span></p>`:''}${waiting?`<div class="toolbar"><button class="primary" data-accept-order="${esc(o.cloudId||o.id)}">${t('Prihvaćam vrijeme','Accept time')}</button><button class="danger" data-cancel-order="${esc(o.cloudId||o.id)}">${t('Otkaži narudžbu','Cancel order')}</button></div>`:''}${canFeedback(o,meta)?`<form class="order-feedback-form" data-feedback-order="${esc(o.cloudId||o.id)}"><h4>${t('Ocijenite narudžbu','Rate this order')}</h4><label>${t('Hrana','Food')}<select name="foodRating"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label><label>${t('Dostava/usluga','Delivery/service')}<select name="deliveryRating"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label><label>${t('Komentar','Comment')}<textarea name="message" placeholder="${t('Kako je bilo?','How was it?')}"></textarea></label><button class="secondary full">${t('Pošalji feedback','Send feedback')}</button></form>`:''}</article>`; }).join(''):`<p class="muted">${t('Ovdje ćete vidjeti vrijeme pripreme.','Here you will see prep time.')}</p>`);
    $$('[data-accept-order]',box).forEach(b=>b.onclick=()=>customerDecision(b.dataset.acceptOrder,'accepted'));
    $$('[data-cancel-order]',box).forEach(b=>b.onclick=()=>customerDecision(b.dataset.cancelOrder,'cancelled'));
    $$('.order-feedback-form',box).forEach(f=>f.onsubmit=e=>submitOrderFeedback(e,f));
  }
  async function renderCustomerOrders(){ ensureCustomerOrdersBox(); const boxes=[$('#customerOrderStatus'),$('#clubOrderHistory')].filter(Boolean); if(!boxes.length) return; const local=localOrdersForCustomer(); boxes.forEach(box=>paintCustomerOrders(box,local.slice(0,8))); try{ const cloud=await fetchCloudOrders(); const merged=mergeOrders(cloud,local).slice(0,12); boxes.forEach(box=>paintCustomerOrders(box,merged)); }catch{} }
  async function updateCloudOrder(id,patch){ const c=client(); if(!c||!id||String(id).startsWith('ORD-')) return false; try{ const {error}=await c.from('orders').update(patch).eq('id',id); if(error) throw error; return true; }catch(err){ console.warn('cloud order update error',err.message); toast(t('Cloud ažuriranje nije uspjelo.','Cloud update failed.')+' '+err.message); return false; } }
  async function fetchOneCloudOrder(id){ const c=client(); if(!c||!id||String(id).startsWith('ORD-')) return null; try{ const {data}=await c.from('orders').select('*').eq('id',id).maybeSingle(); return data||null; }catch{return null;} }
  async function customerDecision(id,decision){
    const now=new Date().toISOString(); const local=LS.get('langar_orders_v3',[])||[]; let did=false;
    local.forEach(o=>{ if(o.id===id||o.cloudId===id){ did=true; const meta=parseMeta(o.note||o.customer_note||''); let note=appendMarker(o.note||o.customer_note||'','CUSTOMER_DECISION',decision); if(decision==='accepted') note=appendMarker(note,'ETA_ACCEPTED_AT',now); o.note=note; o.customer_note=note; o.status=decision==='accepted'?'accepted':'cancelled_by_customer'; o.updatedAt=now; }});
    LS.set('langar_orders_v3',local);
    const co=await fetchOneCloudOrder(id); if(co){ let note=appendMarker(co.customer_note||'','CUSTOMER_DECISION',decision); const patch={customer_note:note,updated_at:now,status:decision==='accepted'?'accepted':'cancelled_by_customer'}; if(decision==='accepted') patch.customer_note=appendMarker(note,'ETA_ACCEPTED_AT',now); await updateCloudOrder(id,patch); did=true; }
    try{ localStorage.setItem('langar_order_signal_v440',JSON.stringify({id,at:Date.now(),decision})); localStorage.setItem('langar_order_signal_v439',JSON.stringify({id,at:Date.now(),decision})); }catch{}
    toast(decision==='accepted'?t('Vrijeme je potvrđeno.','Time accepted.'):t('Narudžba je otkazana.','Order cancelled.'));
    renderCustomerOrders();
  }
  async function submitOrderFeedback(e,f){
    e.preventDefault(); const id=f.dataset.feedbackOrder; const data=Object.fromEntries(new FormData(f).entries()); const avg=Math.round(((+data.foodRating||5)+(+data.deliveryRating||5))/2); const p=profile();
    const localOrders=LS.get('langar_orders_v3',[])||[]; const o=localOrders.find(x=>x.id===id||x.cloudId===id)||{};
    const fb={id:uid('FB'),orderId:id,rating:String(avg),foodRating:data.foodRating,deliveryRating:data.deliveryRating,message:data.message||'',favorite:(o.items||[]).map(i=>i.nameSnapshot||i.item_name_en).filter(Boolean).join(', '),name:o.name||p?.firstName||'Langar guest',status:avg>=4?'public':'admin_only',isPublic:false,createdAt:new Date().toISOString()};
    const list=LS.get('langar_feedback',[]); list.unshift(fb); LS.set('langar_feedback',list);
    localOrders.forEach(x=>{ if(x.id===id||x.cloudId===id){ x.feedbackSubmitted=true; x.feedbackAt=new Date().toISOString(); x.note=appendMarker(x.note||x.customer_note||'','FEEDBACK_SUBMITTED','true'); }}); LS.set('langar_orders_v3',localOrders);
    const c=client(); if(c){ try{ const session=(await c.auth.getSession()).data.session; await c.from('feedback').insert({user_id:session?.user?.id||null,order_id:id.length>20?id:null,rating:avg,message:data.message||'',customer_name:fb.name,is_public:false,status:avg>=4?'public':'admin_only'}); const co=await fetchOneCloudOrder(id); if(co){ await updateCloudOrder(id,{customer_note:appendMarker(co.customer_note||'','FEEDBACK_SUBMITTED','true'),updated_at:new Date().toISOString()}); } }catch(err){ console.warn('cloud feedback insert error',err.message); } }
    toast(t('Hvala na feedbacku.','Thank you for your feedback.')); renderCustomerOrders();
  }
  const oldRenderCart=window.renderCart; if(typeof oldRenderCart==='function') window.renderCart=function(){ oldRenderCart.apply(this,arguments); backupCart(); decorateOrder(); installSubmit(); };
  function boot(){ decorateOrder(); installSubmit(); setInterval(()=>{backupCart(); renderCustomerOrders();},3500); setInterval(()=>$$('[data-countdown-order]').forEach(el=>{ const orders=localOrdersForCustomer(); const o=orders.find(x=>x.id===el.dataset.countdownOrder||x.cloudId===el.dataset.countdownOrder); if(o) el.textContent=etaCountdown(parseMeta(o.customer_note||o.note||''),o.status); }),1000); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  window.LangarOrderFlow={renderCustomerOrders,decorateOrder,toast,parseMeta,appendMarker,customerDecision};
})();
