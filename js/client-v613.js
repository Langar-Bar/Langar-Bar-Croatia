(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
let lastTotal='',lastCount=-1,lastFingerprint='',detailsOpen=false;

function text(hr,en){const l=localStorage.langar_lang||document.documentElement.lang||'hr';return l==='hr'?hr:en}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function priceNum(v){const m=String(v||'').replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):0}
function cartState(){try{return window.state&&Array.isArray(window.state.cart)?window.state.cart:[]}catch{return []}}
function itemName(x){const n=x?.name;const l=localStorage.langar_lang||'hr';return (n&&typeof n==='object'?(n[l]||n.en||n.hr):n)||x?.nameSnapshot||x?.nameSnapshotHr||x?.id||'Item'}
function cartItemCount(){const a=cartState();if(a.length)return a.reduce((n,x)=>n+(Number(x.qty)||1),0);const box=$('#cartItems');if(!box)return 0;const t=(box.textContent||'').trim();return (!t||/empty|prazna/i.test(t))?0:Math.max(1,box.children.length||1)}
function itemPreview(){const a=cartState();if(a.length)return a.slice(0,2).map(x=>`${Number(x.qty)||1}× ${itemName(x)}`).join(' · ');const box=$('#cartItems');return box?(box.textContent||'').replace(/\s+/g,' ').trim().slice(0,95):''}
function detailRows(){const a=cartState();if(a.length)return a.map(x=>{const q=Number(x.qty)||1,unit=priceNum(x.price),line=unit*q;return `<div class="v613-detail-line"><span><b>${q}×</b> ${escapeHtml(itemName(x))}</span><strong>€${line.toFixed(2)}</strong></div>`}).join('');const box=$('#cartItems');const txt=box?(box.textContent||'').replace(/\s+/g,' ').trim():'';return txt?`<div class="v613-detail-fallback">${escapeHtml(txt)}</div>`:`<div class="v613-detail-empty">${text('Košarica je prazna.','Cart is empty.')}</div>`}
function ensureSummary(){
  const order=$('#order');if(!order)return null;let bar=$('#v613OrderSummary');if(bar)return bar;
  bar=document.createElement('section');bar.id='v613OrderSummary';bar.className='v613-empty';bar.setAttribute('aria-live','polite');const head=order.querySelector('.section-head');if(head?.nextSibling)order.insertBefore(bar,head.nextSibling);else order.prepend(bar);
  bar.addEventListener('click',e=>{
    const toggle=e.target.closest('.v613-order-open,.v613-order-title,.v613-order-count,.v613-order-total');
    if(toggle){detailsOpen=!detailsOpen;renderSummary(true);return}
    const checkout=e.target.closest('.v613-go-checkout');if(checkout){const cart=$('.cart',order);if(cart){cart.classList.remove('v613-cart-focus');void cart.offsetWidth;cart.classList.add('v613-cart-focus');cart.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>cart.classList.remove('v613-cart-focus'),900)}}
  });return bar;
}
function renderSummary(force=false){
  const bar=ensureSummary();if(!bar)return;const total=$('#cartTotal')?.textContent?.trim()||'€0.00',count=cartItemCount(),preview=itemPreview(),fp=[total,count,preview,localStorage.langar_lang,detailsOpen].join('|');if(!force&&fp===lastFingerprint)return;
  const changed=lastFingerprint&&((total!==lastTotal)||(count!==lastCount));lastFingerprint=fp;lastTotal=total;lastCount=count;bar.classList.toggle('v613-empty',count===0);bar.classList.toggle('v613-expanded',detailsOpen&&count>0);
  bar.innerHTML=`<div class="v613-order-row"><div class="v613-order-count">${count}</div><div class="v613-order-title"><b>${text('سفارش شما / Vaša narudžba','Your order')}</b><small>${count?escapeHtml(preview||text('آیتم‌های انتخاب‌شده','Selected items')):text('هنوز آیتمی انتخاب نشده','No items selected yet')}</small></div><div class="v613-order-total"><small>${text('جمع کل','Total')}</small>${escapeHtml(total)}</div><button type="button" class="v613-order-open" aria-expanded="${detailsOpen?'true':'false'}">${detailsOpen?text('بستن','Close'):text('جزئیات','Details')}</button></div>${detailsOpen&&count?`<div class="v613-order-details">${detailRows()}<div class="v613-detail-footer"><span>${text('جمع فعلی سفارش','Current order total')}</span><b>${escapeHtml(total)}</b><button type="button" class="v613-go-checkout">${text('ادامه سفارش','Continue / checkout')}</button></div></div>`:''}`;
  if(changed){bar.classList.remove('v613-cart-pulse');void bar.offsetWidth;bar.classList.add('v613-cart-pulse');setTimeout(()=>bar.classList.remove('v613-cart-pulse'),520)}
}
function installObservers(){const root=$('#order')||document.body;new MutationObserver(()=>renderSummary()).observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['value','class']});document.addEventListener('input',e=>{if(e.target.closest('#order'))renderSummary()},true);document.addEventListener('change',e=>{if(e.target.closest('#order'))renderSummary()},true);document.addEventListener('click',e=>{if(!e.target.closest('button,[data-add],[data-add-item],[data-cart-remove],[data-qty]'))return;setTimeout(()=>renderSummary(),30);setTimeout(()=>renderSummary(),250)},true)}
function improveModalClose(){document.addEventListener('click',e=>{const close=e.target.closest('.close,#closeModal,#closeInbox');if(close){const card=close.closest('.modal-card,.drawer>div');if(card){card.style.transition='transform .16s ease,opacity .16s ease';card.style.transform='translateY(12px) scale(.97)';card.style.opacity='.2'}}},true)}
function boot(){ensureSummary();renderSummary(true);installObservers();improveModalClose();setInterval(()=>renderSummary(),1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.LangarClientV613={renderSummary,version:'6.1.3'};
})();
