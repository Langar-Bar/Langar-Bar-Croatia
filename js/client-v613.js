(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
let lastTotal='',lastCount=-1,lastFingerprint='';

function text(hr,en){const l=localStorage.langar_lang||document.documentElement.lang||'hr';return l==='hr'?hr:en}
function parseMoney(s){const m=String(s||'').replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):0}
function cartItemCount(){
  try{
    if(window.state&&Array.isArray(window.state.cart)) return window.state.cart.reduce((n,x)=>n+(Number(x.qty)||1),0);
  }catch{}
  const box=$('#cartItems'); if(!box) return 0;
  const qtys=$$('[data-cart-qty],.cart-item',box);
  if(qtys.length){let n=0;qtys.forEach(x=>{const q=Number(x.dataset.cartQty||x.querySelector?.('input[type="number"]')?.value||1);n+=Number.isFinite(q)?q:1});return n}
  const t=(box.textContent||'').trim();
  return (!t||/empty|prazna/i.test(t))?0:Math.max(1,box.children.length||1);
}
function itemPreview(){
  try{
    if(window.state&&Array.isArray(window.state.cart)&&window.state.cart.length){return window.state.cart.slice(0,2).map(x=>{const n=(x.name&&typeof x.name==='object'?(x.name[localStorage.langar_lang||'hr']||x.name.en||x.name.hr):x.name)||x.nameSnapshot||x.id||'Item';return `${Number(x.qty)||1}× ${n}`}).join(' · ')}
  }catch{}
  const box=$('#cartItems'); if(!box) return '';
  return (box.textContent||'').replace(/\s+/g,' ').trim().slice(0,95);
}
function ensureSummary(){
  const order=$('#order'); if(!order) return null;
  let bar=$('#v613OrderSummary');
  if(bar) return bar;
  bar=document.createElement('section');bar.id='v613OrderSummary';bar.className='v613-empty';bar.setAttribute('aria-live','polite');
  const head=order.querySelector('.section-head');
  if(head?.nextSibling) order.insertBefore(bar,head.nextSibling); else order.prepend(bar);
  bar.addEventListener('click',e=>{const b=e.target.closest('.v613-order-open');if(!b)return;const cart=$('.cart',order);if(cart){cart.classList.remove('v613-cart-focus');void cart.offsetWidth;cart.classList.add('v613-cart-focus');cart.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>cart.classList.remove('v613-cart-focus'),900)}});
  return bar;
}
function renderSummary(force=false){
  const bar=ensureSummary(); if(!bar) return;
  const totalEl=$('#cartTotal'), total=totalEl?.textContent?.trim()||'€0.00', count=cartItemCount(), preview=itemPreview();
  const fp=[total,count,preview,localStorage.langar_lang].join('|'); if(!force&&fp===lastFingerprint)return;
  const changed=lastFingerprint&&((total!==lastTotal)||(count!==lastCount)); lastFingerprint=fp;lastTotal=total;lastCount=count;
  bar.classList.toggle('v613-empty',count===0);
  bar.innerHTML=`<div class="v613-order-row"><div class="v613-order-count">${count}</div><div class="v613-order-title"><b>${text('Vaša narudžba','Your order')}</b><small>${count?escapeHtml(preview||text('Artikli odabrani','Selected items')):text('Još niste odabrali artikl','No items selected yet')}</small></div><div class="v613-order-total"><small>${text('Ukupno','Total')}</small>${escapeHtml(total)}</div><button type="button" class="v613-order-open">${text('Košarica','Cart')}</button></div>`;
  if(changed){bar.classList.remove('v613-cart-pulse');void bar.offsetWidth;bar.classList.add('v613-cart-pulse');setTimeout(()=>bar.classList.remove('v613-cart-pulse'),520)}
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function installObservers(){
  const root=$('#order')||document.body;
  const mo=new MutationObserver(()=>renderSummary());mo.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['value','class']});
  document.addEventListener('input',e=>{if(e.target.closest('#order'))renderSummary()},true);
  document.addEventListener('change',e=>{if(e.target.closest('#order'))renderSummary()},true);
  document.addEventListener('click',e=>{const target=e.target.closest('button,[data-add],[data-add-item],[data-cart-remove],[data-qty]');if(!target)return;setTimeout(()=>renderSummary(),30);setTimeout(()=>renderSummary(),250)},true);
}
function improveModalClose(){
  document.addEventListener('click',e=>{const close=e.target.closest('.close,#closeModal,#closeInbox');if(close){const card=close.closest('.modal-card,.drawer>div');if(card){card.style.transition='transform .16s ease,opacity .16s ease';card.style.transform='translateY(12px) scale(.97)';card.style.opacity='.2'}}},true);
}
function boot(){ensureSummary();renderSummary(true);installObservers();improveModalClose();setInterval(()=>renderSummary(),1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.LangarClientV613={renderSummary,version:'6.1.3'};
})();
