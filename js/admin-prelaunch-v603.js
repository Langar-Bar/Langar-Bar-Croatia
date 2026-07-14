(()=>{
'use strict';
const cloud=()=>window.LangarAdminCloud?.client||window.LangarCloud?.client||window.langarSupabase||window.supabaseClient||window.sb||null;
async function waitForCloud(maxMs=12000){
 const started=Date.now();
 while(Date.now()-started<maxMs){
  const c=cloud();
  if(c) return c;
  await new Promise(r=>setTimeout(r,200));
 }
 return null;
}
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
const q=(root,name)=>root?.querySelector(`[name="${name}"]`);
function ensureSection(){
 const panel=document.getElementById('settingsPanel');if(!panel||document.getElementById('openingManagementV603'))return;
 document.getElementById('openingManagementV601')?.remove();document.getElementById('openingManagementV600')?.remove();
 const section=document.createElement('div');section.id='openingManagementV603';section.className='opening-admin-v603';
 section.innerHTML=`<div class="section-head"><h3>Opening Management</h3><p>Publish the opening status and date instantly to every customer device.</p></div><form id="openingFormV603" class="form-card"><label>Show opening section<select name="enabled"><option value="true">Enabled</option><option value="false">Hidden</option></select></label><label>Opening status<select name="status"><option value="opening_soon">Opening Soon</option><option value="soft_opening">Soft Opening</option><option value="grand_opening">Grand Opening</option><option value="open_now">Open Now</option></select></label><label>Opening date and time<input type="datetime-local" name="opening_at"><small>Leave empty until the exact date is known.</small></label><div class="edit-grid"><label>Headline EN<input name="headline_en" maxlength="120"></label><label>Headline HR<input name="headline_hr" maxlength="120"></label></div><div class="edit-grid"><label>Announcement EN<textarea name="announcement_en" maxlength="500"></textarea></label><label>Announcement HR<textarea name="announcement_hr" maxlength="500"></textarea></label></div><label>Hero image URL (optional)<input name="hero_image_url" placeholder="https://..."></label><div class="toolbar"><button class="primary" type="submit">Save & publish</button><button class="secondary opening-action-v603" type="button" id="openingPreviewV603">Preview</button><button class="secondary opening-action-v603" type="button" id="openingClearDateV603">Clear date</button></div><p id="openingStatusV603" class="admin-login-status"></p></form><div id="openingPreviewBoxV603" class="opening-preview-admin-v603" hidden></div>`;
 panel.prepend(section);const f=section.querySelector('form');f.addEventListener('submit',save);section.querySelector('#openingPreviewV603').onclick=preview;section.querySelector('#openingClearDateV603').onclick=()=>{q(f,'opening_at').value='';preview()};load();
}
function formData(){
 const f=document.getElementById('openingFormV603');const raw=q(f,'opening_at')?.value||'';
 return {enabled:q(f,'enabled')?.value==='true',status:q(f,'status')?.value||'opening_soon',opening_at:raw?new Date(raw).toISOString():null,headline_en:(q(f,'headline_en')?.value||'').trim(),headline_hr:(q(f,'headline_hr')?.value||'').trim(),announcement_en:(q(f,'announcement_en')?.value||'').trim(),announcement_hr:(q(f,'announcement_hr')?.value||'').trim(),hero_image_url:(q(f,'hero_image_url')?.value||'').trim()||null};
}
function preview(data){const o=data||formData(),b=document.getElementById('openingPreviewBoxV603');if(!b)return;b.hidden=false;b.innerHTML=`<b>${esc((o.status||'opening_soon').replaceAll('_',' '))}</b><h3>${esc(o.headline_en||'Opening Soon')}</h3><p>${esc(o.announcement_en||'The exact date will be announced soon.')}</p><small>${o.opening_at?new Date(o.opening_at).toLocaleString():'No countdown date set'}</small>`}
function populate(o){const f=document.getElementById('openingFormV603');if(!f||!o)return;q(f,'enabled').value=String(o.enabled!==false);q(f,'status').value=o.status||'opening_soon';q(f,'opening_at').value=o.opening_at?new Date(new Date(o.opening_at).getTime()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16):'';['headline_en','headline_hr','announcement_en','announcement_hr','hero_image_url'].forEach(k=>{const el=q(f,k);if(el)el.value=o[k]||''});preview(o)}
async function readCloud(){const c=await waitForCloud();if(!c)return{data:null,error:new Error('Cloud unavailable')};let data,error;try{({data,error}=await c.from('opening_management').select('*').eq('id',1).maybeSingle())}catch(e){error=e}if(error||!data){try{({data,error}=await c.rpc('get_opening_settings_v600'))}catch(e){error=e}}return{data:Array.isArray(data)?data[0]:data,error}}
async function load(){const c=await waitForCloud();if(!c)return setTimeout(load,1000);const {data}=await readCloud();if(data)populate(data)}
async function save(e){
 e.preventDefault();const s=document.getElementById('openingStatusV603'),payload=formData();s.textContent='Connecting to Cloud…';
 const c=await waitForCloud();
 if(!c){s.textContent='Cloud connection unavailable. Reload the admin panel and sign in again.';return}
 let session=null;try{session=(await c.auth.getSession()).data?.session||null}catch(_){ }
 if(!session){s.textContent='Admin session unavailable. Please log out and sign in again.';return}
 s.textContent='Saving…';let data,error;
 try{({data,error}=await c.rpc('admin_save_opening_settings_v600',{p_settings:payload}))}catch(ex){error=ex}
 if(error){
   const msg=error.message||String(error);
   s.textContent='Save error: '+msg;
   console.error('Opening Management save failed',error);
   return
 }
 const saved=Array.isArray(data)?data[0]:data;
 const verify=await readCloud();const finalData=verify.data||saved||payload;
 populate(finalData);s.textContent='Saved and published. Countdown is now live on customer devices.';
 try{const ch=new BroadcastChannel('langar-opening');ch.postMessage(finalData);ch.close()}catch(_){ }
}
function stylePrinterButtons(){
 document.querySelectorAll('button,input[type="button"]').forEach(b=>{const t=((b.textContent||b.value||'')+' '+(b.id||'')).toLowerCase();if(/printer.*test|test.*receipt|preview.*receipt|receipt.*preview/.test(t))b.classList.add('printer-test-readable-v603')});
}
function init(){ensureSection();stylePrinterButtons();document.querySelectorAll('[data-panel="settings"],#settingsBtn,[data-target="settingsPanel"]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{ensureSection();stylePrinterButtons()},80)));new MutationObserver(()=>{stylePrinterButtons();if(document.getElementById('settingsPanel')&&!document.getElementById('openingManagementV603'))ensureSection()}).observe(document.body,{childList:true,subtree:true})}
document.addEventListener('DOMContentLoaded',init);setTimeout(init,1000);
})();
