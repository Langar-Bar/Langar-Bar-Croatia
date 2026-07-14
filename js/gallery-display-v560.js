(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const currentLang=()=>String(localStorage.getItem('lang')||document.documentElement.lang||'en').toLowerCase().startsWith('hr')?'hr':'en';
const cleanText=v=>{
  const s=String(v||'').trim();
  if(!s || /^menu\s*:/i.test(s) || /^[0-9a-f]{8}-[0-9a-f-]{20,}$/i.test(s)) return '';
  return s;
};
function titleFor(row){
  const lang=currentLang();
  return cleanText(lang==='hr'?row.title_hr:row.title_en)
    || cleanText(row.title_en)
    || cleanText(row.title_hr)
    || (lang==='hr'?'Langar Bar fotografija':'Langar Bar photo');
}
async function supa(){
  for(let i=0;i<50;i++){
    const c=window.langarSupabase||window.supabaseClient||window.sb||window.__supabase;
    if(c?.from) return c;
    await new Promise(r=>setTimeout(r,100));
  }
  return null;
}
async function renderGallery(){
  const box=$('#galleryView'); if(!box) return;
  const c=await supa(); if(!c){ sanitizeExisting(); return; }
  const {data,error}=await c.from('gallery_items')
    .select('id,image_url,title_en,title_hr,created_at,updated_at,sort_order,photo_role,active')
    .eq('active',true)
    .in('photo_role',['gallery','both'])
    .order('sort_order',{ascending:true})
    .order('created_at',{ascending:false});
  if(error){ sanitizeExisting(); return; }
  box.innerHTML=(data||[]).map(row=>{
    const title=titleFor(row);
    const stamp=encodeURIComponent(row.updated_at||row.created_at||'');
    return `<article class="v560-gallery-card">
      <img loading="lazy" src="${esc(row.image_url)}${String(row.image_url).includes('?')?'&':'?'}v=${stamp}" alt="${esc(title)}">
      <div class="v560-gallery-caption"><strong>${esc(title)}</strong></div>
    </article>`;
  }).join('') || `<p class="v560-gallery-empty">${currentLang()==='hr'?'Još nema fotografija.':'No gallery photos yet.'}</p>`;
}
function sanitizeExisting(){
  const box=$('#galleryView'); if(!box) return;
  box.querySelectorAll('article, .gallery-card, [class*="gallery-card"]').forEach(card=>{
    card.classList.add('v560-gallery-card');
    const texts=[...card.querySelectorAll('small,p,span,div')];
    texts.forEach(el=>{
      const t=(el.textContent||'').trim();
      if(/^menu\s*:/i.test(t)||/^[0-9a-f]{8}-[0-9a-f-]{20,}$/i.test(t)) el.remove();
    });
    const img=card.querySelector('img');
    let title=[...card.querySelectorAll('h1,h2,h3,h4,strong,b')].find(el=>cleanText(el.textContent));
    if(!title){
      title=document.createElement('strong');
      title.textContent=cleanText(img?.alt)||(currentLang()==='hr'?'Langar Bar fotografija':'Langar Bar photo');
      const cap=document.createElement('div'); cap.className='v560-gallery-caption'; cap.append(title); card.append(cap);
    }else{
      let cap=title.closest('.v560-gallery-caption');
      if(!cap){ cap=document.createElement('div'); cap.className='v560-gallery-caption'; title.parentNode?.insertBefore(cap,title); cap.append(title); }
    }
  });
}
function schedule(){ setTimeout(renderGallery,60); setTimeout(renderGallery,500); }
document.addEventListener('click',e=>{ if(e.target.closest('[data-go="gallery"]')) schedule(); },true);
window.addEventListener('hashchange',()=>{ if(location.hash.includes('gallery')) schedule(); });
document.addEventListener('DOMContentLoaded',()=>{
  const box=$('#galleryView');
  if(box) new MutationObserver(()=>sanitizeExisting()).observe(box,{childList:true,subtree:true});
  schedule();
});
window.LangarGalleryV560={render:renderGallery};
})();
