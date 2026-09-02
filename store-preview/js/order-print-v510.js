(()=>{
  'use strict';
  const STORE_KEY='langar_internal_print_log_v510';
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const money=v=>`€${Number(v||0).toFixed(2)}`;
  const typeLabel=v=>{const x=String(v||'pickup').toLowerCase().replace(/[- ]/g,'_');return ['dine_in','dinein','table','inside'].includes(x)?'Dine-in':(x==='delivery'?'Delivery':'Pick-up')};
  const orderItems=o=>Array.isArray(o?.items)?o.items:[];
  function readLog(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'[]')}catch{return []}}
  function writeLog(x){localStorage.setItem(STORE_KEY,JSON.stringify(x.slice(0,1000)))}
  function recordPrint(o,copyType){const log=readLog();log.unshift({orderId:o.id,orderNumber:o.order_number||'',copyType,printedAt:new Date().toISOString()});writeLog(log)}
  function ticketHtml(o,copyType){
    const delivery=copyType==='delivery';
    const items=orderItems(o);
    const orderType=typeLabel(o.fulfillment_type||o.order_type||o.type);
    const title=delivery?`${orderType.toUpperCase()} COPY`:'INTERNAL ORDER TICKET';
    const address=o.delivery_address||o.address||'';
    const phone=o.customer_phone||o.phone||'';
    const customer=o.customer_name||o.name||'Guest';
    const note=o.note||o.customer_note||'';
    const table=o.table_number||'';
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
      @page{size:80mm auto;margin:3mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;width:74mm;margin:0;color:#000;font-size:12px}.center{text-align:center}.line{border-top:1px dashed #000;margin:7px 0}.row{display:flex;justify-content:space-between;gap:6px}.big{font-size:18px;font-weight:800}.meta{line-height:1.5}.items{width:100%;border-collapse:collapse}.items td{vertical-align:top;padding:3px 0}.items td:last-child{text-align:right}.warn{font-weight:800;border:2px solid #000;padding:5px;margin-top:8px;text-align:center}.address{font-size:14px;font-weight:700;overflow-wrap:anywhere}.muted{font-size:10px}.copy{font-size:14px;font-weight:800}
    </style></head><body>
      <div class="center"><div class="big">LANGAR BAR</div><div class="copy">${esc(title)}</div><div>${esc(o.order_number||String(o.id||'').slice(0,8))}</div></div>
      <div class="line"></div><div class="meta"><b>Type:</b> ${esc(orderType)}<br><b>Created:</b> ${esc(new Date(o.created_at||o.createdAt||Date.now()).toLocaleString())}<br><b>Customer:</b> ${esc(customer)}<br>${phone?`<b>Phone:</b> ${esc(phone)}<br>`:''}${table?`<b>Table:</b> ${esc(table)}<br>`:''}${address?`<b>Address:</b><div class="address">${esc(address)}</div>`:''}</div>
      <div class="line"></div><table class="items">${items.map(i=>{const qty=Number(i.qty||1);const name=i.name_hr||i.name_en||i.nameSnapshot||i.name||'Item';const add=Array.isArray(i.addOns)&&i.addOns.length?`<div class="muted">${esc(i.addOns.map(a=>a.name||a.id).join(', '))}</div>`:'';const total=i.line_total??(qty*Number(i.price||0));return `<tr><td><b>${qty} × ${esc(name)}</b>${add}</td><td>${money(total)}</td></tr>`}).join('')}</table>
      <div class="line"></div><div class="row"><b>TOTAL</b><b>${money(o.total)}</b></div>${note?`<div class="line"></div><b>NOTE:</b><div>${esc(note)}</div>`:''}
      <div class="warn">INTERNAL ORDER RECEIPT<br>NOT A FISCAL INVOICE<br><span class="muted">Interna potvrda narudžbe – nije fiskalni račun</span></div>
      <div class="center muted" style="margin-top:7px">Printed ${esc(new Date().toLocaleString())}</div>
      <script>window.onload=()=>{setTimeout(()=>window.print(),150)};<\/script></body></html>`;
  }
  function printOrder(id,copyType='internal'){
    const o=window.LANGAR_ADMIN_ORDER_CACHE?.[String(id)];
    if(!o){alert('Order data is not available. Refresh the Orders panel and try again.');return}
    const w=window.open('','_blank','width=420,height=720');
    if(!w){alert('Printing popup was blocked. Allow popups for the Langar Bar admin page.');return}
    w.document.open();w.document.write(ticketHtml(o,copyType));w.document.close();recordPrint(o,copyType);
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-print-order]');if(a){e.preventDefault();printOrder(a.dataset.printOrder,'internal');return}
    const d=e.target.closest('[data-print-delivery]');if(d){e.preventDefault();printOrder(d.dataset.printDelivery,'delivery')}
  });
  window.LangarOrderPrint={printOrder,readLog};
})();
