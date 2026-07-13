(()=>{
'use strict';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const sb=()=>window.langarCloud?.client||window.LangarAdminCloud?.client||window.supabaseClient||window._supabase||null;
let audioCtx=null;
function getCtx(){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;if(!audioCtx||audioCtx.state==='closed')audioCtx=new C();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
const patterns={triple:[880,1040,880],double:[760,980],soft:[620],warning:[920,620,920]};
function previewSound(key,volume){const ctx=getCtx();if(!ctx)return;const seq=patterns[key]||patterns.triple;const vol=Math.max(.005,Math.min(.35,Number(volume||75)/300));seq.forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*.2;o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.17);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.19)})}
function applyTheme(theme,high){const root=document.documentElement;root.dataset.adminTheme=theme||'langar';root.classList.toggle('v550-high-contrast',!!high);root.classList.toggle('v553-high-contrast',!!high);localStorage.setItem('langar_admin_theme_v553',theme||'langar');localStorage.setItem('langar_admin_high_contrast_v553',high?'1':'0')}
function restoreTheme(){applyTheme(localStorage.getItem('langar_admin_theme_v553')||document.documentElement.dataset.adminTheme||'langar',localStorage.getItem('langar_admin_high_contrast_v553')==='1')}
function enhanceSettings(){const f=$('#settings550');if(!f||f.dataset.v553)return;f.dataset.v553='1';
 const vol=f.elements.alert_volume;if(vol){const wrap=vol.closest('label');let out=document.createElement('output');out.className='v553-volume-value';out.textContent=`${vol.value}%`;wrap.append(out);vol.addEventListener('input',()=>{out.textContent=`${vol.value}%`});vol.addEventListener('change',()=>{const order=f.elements.sound_order?.value||'triple';previewSound(order,vol.value)})}
 const soundMap=[['sound_order','Order'],['sound_reservation','Reservation'],['sound_cancel','Cancellation'],['sound_barista','Question']];
 soundMap.forEach(([name,label])=>{const sel=f.elements[name];if(!sel)return;const row=sel.closest('label');const btn=document.createElement('button');btn.type='button';btn.className='secondary v553-preview-sound';btn.textContent=`▶ Preview ${label}`;btn.onclick=()=>previewSound(sel.value,vol?.value||75);row.append(btn);sel.addEventListener('change',()=>previewSound(sel.value,vol?.value||75))});
 const theme=f.elements.admin_theme, high=f.elements.high_contrast;if(theme){theme.addEventListener('change',()=>applyTheme(theme.value,high?.checked));}if(high){high.addEventListener('change',()=>applyTheme(theme?.value||'langar',high.checked))}
 f.addEventListener('submit',()=>setTimeout(()=>applyTheme(theme?.value||'langar',high?.checked),100));
 const card=theme?.closest('.v550-card');if(card&&!card.querySelector('.v553-theme-preview')){const preview=document.createElement('div');preview.className='v553-theme-preview';preview.innerHTML='<b>Live theme preview</b><span>Changes apply immediately. Save to keep them on every admin device.</span>';card.append(preview)}
}
function normalizeMenu(cats,items){return (cats||[]).map(c=>({...c,items:(items||[]).filter(i=>String(i.category_id)===String(c.id)&&i.active!==false&&i.available_in_menu!==false)})).filter(c=>c.active!==false)}
function localMenu(){try{if(typeof LANGAR_DEFAULT_MENU!=='undefined'&&Array.isArray(LANGAR_DEFAULT_MENU))return LANGAR_DEFAULT_MENU.map(c=>({id:c.id,slug:c.id,title_en:c.title?.en||c.id,title_hr:c.title?.hr||'',active:c.active!==false,items:(c.items||[]).filter(i=>i.available!==false).map(i=>({id:i.cloudId||i.id,sku:i.id,name_en:i.name?.en||i.id,name_hr:i.name?.hr||'',active:true,available_in_menu:true}))}))}catch(_){}
 try{const raw=JSON.parse(localStorage.getItem('langar_cloud_menu_cache')||'null');if(Array.isArray(raw))return raw.map(c=>({id:c.cloudId||c.id,slug:c.id,title_en:c.title?.en||c.id,title_hr:c.title?.hr||'',active:c.active!==false,items:(c.items||[]).map(i=>({id:i.cloudId||i.id,sku:i.id,name_en:i.name?.en||i.id,name_hr:i.name?.hr||''}))}))}catch(_){}return []}
async function getMenu(){const c=sb();if(c){try{const [a,b]=await Promise.all([c.from('menu_categories').select('id,slug,title_en,title_hr,sort_order,active').eq('active',true).order('sort_order'),c.from('menu_items').select('id,category_id,sku,name_en,name_hr,sort_order,active,available_in_menu').eq('active',true).order('sort_order')]);if(!a.error&&a.data?.length)return normalizeMenu(a.data,b.data||[])}catch(e){console.warn('Gallery menu cloud load failed',e)}}return localMenu()}
function menuOptions(menu){return menu.map(c=>`<option value="menu:${esc(c.id)}">${esc(c.title_en||c.slug)} / ${esc(c.title_hr||'')}</option>`).join('')}
function itemOptions(c){return `<option value="">Whole category / Cijela kategorija</option>${(c?.items||[]).map(i=>`<option value="${esc(i.id)}">${esc(i.name_en||i.sku)} / ${esc(i.name_hr||'')}</option>`).join('')}`}
async function repairGallery(){const cat=$('#gallery552cat'),item=$('#gallery552item');if(!cat||!item||cat.dataset.v553)return;cat.dataset.v553='1';const menu=await getMenu();if(!menu.length){const st=$('#gallery552status');if(st){st.textContent='Menu categories could not be loaded. Open Menu Manager and publish the cloud menu once.';st.className='gallery551-status error'}return}
 let group=[...cat.querySelectorAll('optgroup')].find(g=>/Menu categories/i.test(g.label));if(!group){group=document.createElement('optgroup');group.label='Menu categories';cat.append(group)}group.innerHTML=menuOptions(menu);
 const update=()=>{const v=cat.value;if(v.startsWith('menu:')){const c=menu.find(x=>String(x.id)===v.slice(5));item.innerHTML=itemOptions(c)}else item.innerHTML='<option value="">Not linked to one item</option>'};
 cat.addEventListener('change',update);update();
 const form=$('#gallery552');if(form&&!form.querySelector('.v553-gallery-help')){const h=document.createElement('div');h.className='v553-gallery-help';h.innerHTML=`<b>${menu.length} menu categories loaded</b><span>Select a menu category, then choose the exact food or drink below. New categories published in Menu Manager will appear after Refresh gallery.</span>`;form.prepend(h)}
 const ref=$('#gallery552refresh');if(ref)ref.addEventListener('click',async()=>{const newer=await getMenu();if(newer.length){menu.splice(0,menu.length,...newer);group.innerHTML=menuOptions(menu);update()}})
}
function loop(){enhanceSettings();repairGallery()}
restoreTheme();window.addEventListener('load',()=>{setTimeout(loop,1200);setInterval(loop,1500)});
})();
