(()=>{
'use strict';

const VERSION='6.0.9';
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));
const money=value=>`€${Number(value||0).toFixed(2)}`;
const typeLabel=value=>{
  const normalized=String(value||'pickup').toLowerCase().replace(/[- ]/g,'_');
  if(['dine_in','dinein','table','inside'].includes(normalized)) return 'Dine-in';
  return normalized==='delivery'?'Delivery':'Pick-up';
};
const client=()=>window.LangarAdminCloud?.client||null;
let printLock=false;

async function getSettings(){
  const local=window.LangarAdminSettings550?.get?.();
  if(local) return local;
  try{
    const c=client();
    if(!c) return {};
    const {data,error}=await c.from('langar_settings').select('key,value');
    if(error) throw error;
    return Object.fromEntries((data||[]).map(row=>[
      row.key,
      typeof row.value==='string'?row.value:(row.value?.value??row.value)
    ]));
  }catch(error){
    console.warn('[Print V609] settings unavailable',error);
    return {};
  }
}

function splitItemName(value){
  const text=String(value||'Item').trim();
  const match=text.match(/^(.+?)\s*\((.+)\)$/);
  if(!match) return {base:text,options:''};
  return {base:match[1].trim(),options:match[2].trim()};
}

function itemRows(order){
  const items=Array.isArray(order.items)?order.items:[];
  return items.map(item=>{
    const qty=Math.max(1,Number(item.qty||item.quantity||1));
    const fullName=item.name_hr||item.name_en||item.name||item.nameSnapshotHr||item.nameSnapshot||'Item';
    const parts=splitItemName(fullName);
    const unit=Number(item.price||item.unit_price||0);
    const line=Number(item.line_total??item.lineTotal??(qty*unit));
    const itemNote=String(item.note||'').trim();
    const addOns=Array.isArray(item.addOns)?item.addOns:[];
    return `
      <div class="item-row">
        <div class="item-main">
          <b>${qty} × ${esc(parts.base)}</b>
          ${parts.options?`<span class="options">${esc(parts.options)}</span>`:''}
          ${addOns.length?`<span class="options">${esc(addOns.map(a=>a.name||a.id).join(', '))}</span>`:''}
          ${itemNote?`<span class="item-note">NOTE: ${esc(itemNote)}</span>`:''}
        </div>
        <strong>${money(line)}</strong>
      </div>`;
  }).join('');
}

function ticket(order,copyType,settings){
  const type=typeLabel(order.fulfillment_type||order.order_type||order.type);
  const title=copyType==='delivery'?`${type.toUpperCase()} COPY`:'INTERNAL PREPARATION TICKET';
  const created=new Date(order.created_at||order.createdAt||Date.now()).toLocaleString('hr-HR');
  const printCount=Number(order.internal_print_count||0);
  const status=String(order.status||'new').toUpperCase();
  const number=order.order_number||order.cloudOrderNumber||String(order.id||'').slice(0,8).toUpperCase();
  return `
    <main class="ticket">
      <header>
        ${String(settings.receipt_show_logo)!=='false'?'<h1>LANGAR BAR</h1>':''}
        <div class="ticket-title">${esc(title)}</div>
        <div class="order-number">${esc(number)}</div>
      </header>
      <section class="meta">
        <div><b>TYPE</b><span>${esc(type)}</span></div>
        <div><b>STATUS</b><span>${esc(status)}</span></div>
        <div><b>CREATED</b><span>${esc(created)}</span></div>
        ${order.table_number||order.tableNumber?`<div class="priority"><b>TABLE</b><span>${esc(order.table_number||order.tableNumber)}</span></div>`:''}
        ${order.customer_name||order.name?`<div><b>CUSTOMER</b><span>${esc(order.customer_name||order.name)}</span></div>`:''}
        ${order.customer_phone||order.phone?`<div><b>PHONE</b><span>${esc(order.customer_phone||order.phone)}</span></div>`:''}
        ${order.delivery_address||order.address?`<div class="priority"><b>ADDRESS</b><span>${esc(order.delivery_address||order.address)}</span></div>`:''}
      </section>
      <section class="items">
        ${itemRows(order)||'<div class="empty">No items found</div>'}
      </section>
      ${order.note||order.customer_note?`<section class="order-note"><b>ORDER NOTE</b><p>${esc(order.note||order.customer_note)}</p></section>`:''}
      ${order.admin_customer_note?`<section class="staff-note"><b>STAFF / CUSTOMER MESSAGE</b><p>${esc(order.admin_customer_note)}</p></section>`:''}
      <section class="total"><span>TOTAL</span><b>${money(order.total)}</b></section>
      <section class="fiscal-state">
        <div><b>Fiscal system recorded</b><span>${order.paid?'YES':'NO / NOT CONFIRMED'}</span></div>
        ${order.fiscal_receipt_number?`<div><b>Fiscal receipt no.</b><span>${esc(order.fiscal_receipt_number)}</span></div>`:''}
      </section>
      <section class="nonfiscal">
        INTERNAL ORDER DOCUMENT<br>
        NOT A FISCAL INVOICE<br>
        <small>Interna potvrda narudžbe — nije fiskalni račun</small>
      </section>
      <footer>Printed from Admin V${VERSION}${printCount?` · Previous prints: ${printCount}`:''}</footer>
    </main>`;
}

function printDocument(content,settings){
  const paper=String(settings.printer_paper_width)==='58'?58:80;
  const printable=Math.max(48,Math.min(paper-2,Number(settings.printer_printable_width||(paper-6))));
  const margin=Math.max(1,Math.min(8,Number(settings.printer_margin_mm||3)));
  const configuredScale=Number(settings.printer_font_scale||100)/100;
  const scale=Math.max(1,Math.min(1.35,configuredScale));
  return `<!doctype html><html><head><meta charset="utf-8"><title>Langar internal ticket</title><style>
    @page{size:${paper}mm auto;margin:${margin}mm}
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#fff;color:#000}
    body{width:${printable}mm;font-family:Arial,Helvetica,sans-serif;font-size:${13*scale}px;line-height:1.34;font-weight:700}
    .ticket{width:${printable}mm;color:#000;background:#fff}
    header{text-align:center;border-bottom:3px double #000;padding-bottom:8px;margin-bottom:8px}
    h1{font-size:${24*scale}px;line-height:1;margin:0 0 5px;font-weight:950;letter-spacing:.03em}
    .ticket-title{font-size:${15*scale}px;font-weight:950}
    .order-number{font-size:${22*scale}px;font-weight:950;margin-top:6px}
    .meta{border:2px solid #000;margin:8px 0}
    .meta>div,.fiscal-state>div{display:grid;grid-template-columns:36% 1fr;gap:5px;padding:5px 6px;border-bottom:1px solid #000;overflow-wrap:anywhere}
    .meta>div:last-child,.fiscal-state>div:last-child{border-bottom:0}
    .meta b,.fiscal-state b{font-weight:950}
    .priority{font-size:${16*scale}px;background:#eee}
    .items{border-top:2px solid #000;border-bottom:2px solid #000;margin:9px 0}
    .item-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;padding:8px 2px;border-bottom:1px dashed #333;align-items:start}
    .item-row:last-child{border-bottom:0}
    .item-main>b{display:block;font-size:${16*scale}px;line-height:1.25;font-weight:950;overflow-wrap:anywhere}
    .item-row strong{font-size:${15*scale}px;font-weight:950;white-space:nowrap}
    .options{display:block;margin-top:4px;padding:4px 5px;border-left:4px solid #000;background:#eee;font-size:${12.5*scale}px;line-height:1.35;font-weight:850;overflow-wrap:anywhere}
    .item-note{display:block;margin-top:4px;padding:4px 5px;border:2px solid #000;font-size:${13*scale}px;font-weight:950}
    .order-note,.staff-note{border:3px solid #000;padding:7px;margin:9px 0;font-size:${14*scale}px}
    .order-note p,.staff-note p{margin:4px 0 0;white-space:pre-wrap;font-weight:950;overflow-wrap:anywhere}
    .staff-note{border-style:dashed}
    .total{display:flex;justify-content:space-between;gap:8px;border-top:4px solid #000;border-bottom:4px solid #000;padding:7px 1px;margin:10px 0;font-size:${21*scale}px;font-weight:950}
    .fiscal-state{border:2px solid #000;margin:8px 0;font-size:${11.5*scale}px}
    .nonfiscal{border:4px solid #000;padding:8px 5px;text-align:center;font-size:${14*scale}px;line-height:1.28;font-weight:950;margin-top:10px}
    .nonfiscal small{display:block;margin-top:4px;font-size:${10.5*scale}px}
    footer{text-align:center;margin-top:8px;font-size:${9.5*scale}px;font-weight:700}
  </style></head><body>${content}</body></html>`;
}

function previewDocument(content,settings,title='Print preview',onConfirm=null){
  document.querySelector('.v609-print-modal')?.remove();
  const modal=document.createElement('div');
  modal.className='v609-print-modal';
  modal.innerHTML=`
    <div class="v609-print-dialog">
      <div class="v609-print-head"><h3>${esc(title)}</h3><button type="button" class="secondary" data-close-print>Close</button></div>
      <div class="v609-ticket-preview">${content}</div>
      <div class="v609-print-buttons">
        <button type="button" class="primary" data-confirm-print>Print now</button>
        <button type="button" class="secondary" data-close-print>Back to order</button>
      </div>
    </div>`;
  const style=document.createElement('style');
  style.textContent=`
    .v609-print-modal{position:fixed;inset:0;z-index:20000;background:rgba(0,0,0,.78);display:grid;place-items:center;padding:16px;overflow:auto}
    .v609-print-dialog{width:min(680px,100%);max-height:94vh;overflow:auto;background:#f2f2f2;color:#111;border:3px solid #e2b93f;border-radius:18px;padding:14px}
    .v609-print-head,.v609-print-buttons{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
    .v609-print-head h3{margin:0;color:#111}.v609-ticket-preview{width:min(80mm,100%);margin:14px auto;background:#fff;color:#000;padding:4mm;box-shadow:0 5px 18px rgba(0,0,0,.25);font-family:Arial,sans-serif}
    .v609-ticket-preview .ticket{color:#000}.v609-ticket-preview header{text-align:center;border-bottom:3px double #000;padding-bottom:8px}.v609-ticket-preview h1{margin:0;font-size:24px}.v609-ticket-preview .ticket-title{font-weight:900}.v609-ticket-preview .order-number{font-size:23px;font-weight:950;margin-top:6px}
    .v609-ticket-preview .meta,.v609-ticket-preview .fiscal-state{border:2px solid #000;margin:9px 0}.v609-ticket-preview .meta>div,.v609-ticket-preview .fiscal-state>div{display:grid;grid-template-columns:36% 1fr;gap:6px;padding:6px;border-bottom:1px solid #000}.v609-ticket-preview .meta>div:last-child,.v609-ticket-preview .fiscal-state>div:last-child{border-bottom:0}
    .v609-ticket-preview .priority{background:#eee;font-size:17px}.v609-ticket-preview .items{border-block:2px solid #000}.v609-ticket-preview .item-row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:9px 0;border-bottom:1px dashed #333}.v609-ticket-preview .item-row:last-child{border-bottom:0}.v609-ticket-preview .item-main>b{font-size:17px}.v609-ticket-preview .options{display:block;margin-top:5px;padding:5px;background:#eee;border-left:4px solid #000}.v609-ticket-preview .item-note{display:block;border:2px solid #000;padding:5px;margin-top:5px;font-weight:900}
    .v609-ticket-preview .order-note,.v609-ticket-preview .staff-note{border:3px solid #000;padding:7px;margin:9px 0}.v609-ticket-preview .order-note p,.v609-ticket-preview .staff-note p{margin:4px 0}.v609-ticket-preview .total{display:flex;justify-content:space-between;border-block:4px solid #000;padding:8px 0;margin:10px 0;font-size:22px;font-weight:950}.v609-ticket-preview .nonfiscal{border:4px solid #000;padding:8px;text-align:center;font-weight:950}.v609-ticket-preview footer{text-align:center;margin-top:8px;font-size:11px}
  `;
  modal.prepend(style);
  document.body.appendChild(modal);
  const close=()=>modal.remove();
  modal.querySelectorAll('[data-close-print]').forEach(button=>button.addEventListener('click',close));
  modal.addEventListener('click',event=>{if(event.target===modal) close();});
  const confirmButton=modal.querySelector('[data-confirm-print]');
  confirmButton.addEventListener('click',async()=>{
    if(confirmButton.dataset.v609Busy==='1') return;
    confirmButton.dataset.v609Busy='1';
    confirmButton.disabled=true;
    const oldText=confirmButton.textContent;
    confirmButton.textContent='Preparing print…';
    try{
      if(printLock) throw new Error('Another print is still active.');
      if(onConfirm) await onConfirm();
      startBrowserPrint(content,settings);
      if(String(settings.printer_auto_close)==='true') setTimeout(close,500);
    }catch(error){
      alert('Print record error: '+(error.message||error));
    }finally{
      setTimeout(()=>{
        confirmButton.disabled=false;
        confirmButton.textContent=oldText;
        delete confirmButton.dataset.v609Busy;
      },900);
    }
  });
}

function startBrowserPrint(content,settings){
  if(printLock) return;
  printLock=true;
  const copies=Math.max(1,Math.min(3,Number(settings.printer_copies||1)));
  document.getElementById('v609PrintFrame')?.remove();
  const frame=document.createElement('iframe');
  frame.id='v609PrintFrame';
  frame.style.cssText='position:fixed;width:1px;height:1px;right:0;bottom:0;border:0;opacity:0;pointer-events:none';
  document.body.appendChild(frame);
  const repeated=Array.from({length:copies},()=>content).join('<div style="page-break-after:always"></div>');
  const doc=frame.contentDocument;
  doc.open();
  doc.write(printDocument(repeated,settings));
  doc.close();
  setTimeout(()=>{
    try{
      frame.contentWindow.focus();
      frame.contentWindow.print();
    }catch(error){
      alert('Print could not start: '+(error.message||error));
    }
    setTimeout(()=>{
      frame.remove();
      printLock=false;
    },3000);
  },350);
}

async function recordPrint(order,copyType){
  const c=client();
  if(!c||!order?.id) throw new Error('Supabase admin session is not available.');
  const metadata={
    version:VERSION,
    order_number:order.order_number||null,
    fulfillment_type:order.fulfillment_type||null,
    browser:navigator.userAgent.slice(0,240)
  };
  const {data,error}=await c.rpc('admin_record_order_print_v609',{
    p_order_id:order.id,
    p_copy_type:copyType,
    p_device_label:'Admin V6.0.9 browser print',
    p_metadata:metadata
  });
  if(error) throw error;
  const updated=Array.isArray(data)?data[0]:data;
  if(updated&&typeof updated==='object'){
    Object.assign(order,updated);
    if(window.LANGAR_ADMIN_ORDER_CACHE){
      window.LANGAR_ADMIN_ORDER_CACHE[String(order.id)]=order;
    }
  }
  try{
    window.dispatchEvent(new CustomEvent('langar-v609-print-recorded',{
      detail:{orderId:order.id,copyType,order:updated||order}
    }));
  }catch(_error){}
  return updated||order;
}

async function printOrder(id,copyType='internal'){
  if(printLock) return;
  const order=window.LANGAR_ADMIN_ORDER_CACHE?.[String(id)];
  if(!order){
    alert('Order data is not available. Refresh Orders and try again.');
    return;
  }
  const settings=await getSettings();
  previewDocument(
    ticket(order,copyType,settings),
    settings,
    copyType==='delivery'?'Delivery / pickup copy':'Internal preparation ticket',
    ()=>recordPrint(order,copyType)
  );
}

async function testPreview(settingsInput){
  const settings=settingsInput||await getSettings();
  const order={
    id:'test-v609',order_number:'TEST-V609',fulfillment_type:'delivery',status:'new',created_at:new Date().toISOString(),
    customer_name:'Test Customer',customer_phone:'+385 91 000 0000',delivery_address:'Test address 1, Dugo Selo',
    items:[
      {qty:2,name_hr:'Cappuccino (without sugar)',price:2.5,line_total:5},
      {qty:1,name_hr:'Chicken focaccia (sauce separate; no onion)',price:7.5,line_total:7.5,note:'ALLERGY CHECK'}
    ],
    total:12.5,note:'This is a printer setup test. Make the special instructions easy to read.',paid:false,internal_print_count:0
  };
  previewDocument(ticket(order,'delivery',settings),settings,'V6.0.9 printer test');
}

function handlePrintClick(event){
  const button=event.target.closest?.('[data-print-order],[data-print-delivery]');
  if(!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(button.dataset.v609Busy==='1') return;
  button.dataset.v609Busy='1';
  button.disabled=true;
  const id=button.dataset.printOrder||button.dataset.printDelivery;
  const copyType=button.dataset.printDelivery?'delivery':'internal';
  printOrder(id,copyType).finally(()=>setTimeout(()=>{
    button.disabled=false;
    delete button.dataset.v609Busy;
  },900));
}

document.addEventListener('click',handlePrintClick,true);
window.LangarOrderPrint609={version:VERSION,printOrder,testPreview};
window.LangarOrderPrint=window.LangarOrderPrint609;
})();
