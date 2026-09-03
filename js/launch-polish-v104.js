(() => {
'use strict';

const CLEAN_FLAG='langar_launch_cleanup_v104_done';

function currentLang(){
  const v=String(localStorage.getItem('langar_lang')||document.documentElement.lang||'hr').toLowerCase();
  return v.startsWith('en')?'en':'hr';
}

function oneTimeCleanup(){
  if(localStorage.getItem(CLEAN_FLAG)==='1') return;
  const exact=[
    'langar_item_likes','langar_feedback','langar_pos_sales','langar_cloud_like_counts',
    'langar_orders_v3','langar_orders_guest'
  ];
  exact.forEach(k=>localStorage.removeItem(k));
  for(let i=localStorage.length-1;i>=0;i--){
    const k=localStorage.key(i)||'';
    if(k.startsWith('langar_orders_user_')) localStorage.removeItem(k);
  }
  localStorage.setItem(CLEAN_FLAG,'1');
}

function addStyles(){
  if(document.getElementById('launchPolish104Styles')) return;
  const s=document.createElement('style');
  s.id='launchPolish104Styles';
  s.textContent=`
    #more a[href^="tel:"],#more a[href^="mailto:"]{color:#f5d78b!important;text-decoration-color:rgba(245,215,139,.65)!important;font-weight:750!important}
    #more a[href^="tel:"]:visited,#more a[href^="mailto:"]:visited{color:#fff4d6!important}
    .launch-hidden-v104{display:none!important}
  `;
  document.head.appendChild(s);
}

function applyTranslations(root=document){
  const lang=currentLang();
  const nodes=[];
  if(root?.matches?.('[data-hr][data-en]')) nodes.push(root);
  root?.querySelectorAll?.('[data-hr][data-en]')?.forEach(n=>nodes.push(n));
  nodes.forEach(el=>{
    const value=el.dataset[lang];
    if(value==null) return;
    if(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement){
      if(el.dataset[`${lang}Placeholder`]) el.placeholder=el.dataset[`${lang}Placeholder`];
      return;
    }
    if(el.textContent!==value) el.textContent=value;
  });
}

function sectionHeadBefore(el){
  let p=el?.previousElementSibling;
  while(p && !p.classList.contains('section-head')) p=p.previousElementSibling;
  return p;
}

function meaningfulPopular(){
  return [...document.querySelectorAll('#popularStrip .popular-card small')].some(s=>{
    const t=s.textContent||'';
    const like=Number((t.match(/♥\s*(\d+)/)||[])[1]||0);
    const comments=Number((t.match(/💬\s*(\d+)/)||[])[1]||0);
    const orders=Number((t.match(/🧾\s*(\d+)/)||[])[1]||0);
    return like>0||comments>0||orders>0;
  });
}
function meaningfulSellers(){
  return [...document.querySelectorAll('#bestSellerStrip .popular-card')].some(card=>{
    const t=card.textContent||'';
    const m=t.match(/🧾\s*(\d+)/);
    return m && Number(m[1])>0;
  });
}
function realReviews(){
  return document.querySelectorAll('.home-reviews article').length>0;
}

function hideEmptyLaunchCards(){
  const popular=document.getElementById('popularStrip');
  if(popular){
    const hide=!meaningfulPopular();
    popular.classList.toggle('launch-hidden-v104',hide);
    sectionHeadBefore(popular)?.classList.toggle('launch-hidden-v104',hide);
  }
  const sellers=document.getElementById('bestSellerStrip');
  if(sellers){
    const hide=!meaningfulSellers();
    sellers.classList.toggle('launch-hidden-v104',hide);
    sectionHeadBefore(sellers)?.classList.toggle('launch-hidden-v104',hide);
  }
  const reviews=document.querySelector('.home-reviews');
  if(reviews) reviews.classList.toggle('launch-hidden-v104',!realReviews());
}

function refresh(){
  applyTranslations(document);
  hideEmptyLaunchCards();
}

function init(){
  oneTimeCleanup();
  addStyles();
  refresh();
  document.addEventListener('click',e=>{
    if(e.target.closest('#langBtn,[data-language],[data-lang]')) setTimeout(refresh,80);
    if(e.target.closest('[data-go]')) setTimeout(refresh,80);
  },true);
  let scheduled=false;
  new MutationObserver(muts=>{
    if(scheduled) return;
    if(!muts.some(m=>m.addedNodes.length)) return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;refresh();});
  }).observe(document.body,{childList:true,subtree:true});
  setTimeout(refresh,300);
  setTimeout(refresh,1200);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();