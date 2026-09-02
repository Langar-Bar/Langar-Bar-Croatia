(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let client=null,menuCats=[];
const getClient=()=>window.LangarAdminCloud?.client||window.LangarCloud?.client||null;
async function waitClient(){for(let i=0;i<50;i++){client=getClient();if(client)return client;await new Promise(r=>setTimeout(r,150));}return null}
function toast(msg,ok=true){let n=document.getElementById('v555toast');if(!n){n=document.createElement('div');n.id='v555toast';document.body.appendChild(n)}n.className='v555-toast '+(ok?'ok':'bad');n.textContent=msg;setTimeout(()=>n.remove(),4500)}
async function loadMenu(){
 const c=await waitClient();if(!c)return[];
 const {data:cats}=await c.from('menu_categories').select('*').eq('active',true).order('sort_order');
 const {data:items}=await c.from('menu_items').select('*').eq('active',true).order('sort_order');
 if(cats?.length){menuCats=cats.map(x=>({...x,items:(items||[]).filter(i=>String(i.category_id)===String(x.id))}));return menuCats}
 const local=window.MENU_DATA||window.menuData||[];
 menuCats=(local||[]).map((x,ci)=>({id:x.cloudId||x.id||String(ci),title_en:x.title?.en||x.title_en||x.id,title_hr:x.title?.hr||x.title_hr||'',items:(x.items||[]).map((i,ii)=>({id:i.cloudId||i.id||i.sku||`${ci}-${ii}`,name_en:i.name?.en||i.name_en||i.id,name_hr:i.name?.hr||i.name_hr||''}))}));
 return menuCats;
}
const groupOptions=()=>menuCats.map(c=>`<option value="${esc(c.id)}">${esc(c.title_en||c.slug)}${c.title_hr?` / ${esc(c.title_hr)}`:''}</option>`).join('');
function itemOptions(cid){const c=menuCats.find(x=>String(x.id)===String(cid));return '<option value="">Choose exact product</option>'+(c?.items||[]).map(i=>`<option value="${esc(i.id)}">${esc(i.name_en||i.sku)}${i.name_hr?` / ${esc(i.name_hr)}`:''}</option>`).join('')}
async function imageToBlob(file,maxDimension=2200,targetBytes=5.5*1024*1024){
 if(!file||!file.size)throw new Error('Choose a photo.');
 if(!file.type.startsWith('image/'))throw new Error('Please choose an image file.');
 const img=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('This image could not be read.'));im.src=URL.createObjectURL(file)});
 let w=img.naturalWidth,h=img.naturalHeight,scale=Math.min(1,maxDimension/Math.max(w,h));w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);URL.revokeObjectURL(img.src);
 let q=.9,blob=null;
 for(let i=0;i<7;i++){blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',q));if(blob&&blob.size<=targetBytes)break;q-=.1}
 if(!blob)throw new Error('Image compression failed.');
 return new File([blob],(file.name.replace(/\.[^.]+$/,'')||'photo')+'.jpg',{type:'image/jpeg'});
}
async function uploadFile(original,status){
 if(status)status.textContent='Preparing image…';
 const file=await imageToBlob(original);
 if(status)status.textContent=`Optimized ${(original.size/1048576).toFixed(1)} MB → ${(file.size/1048576).toFixed(1)} MB. Uploading…`;
 const path=`gallery/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.jpg`;
 const up=await client.storage.from('langar-gallery').upload(path,file,{cacheControl:'3600',upsert:false,contentType:'image/jpeg'});
 if(up.error)throw up.error;
 return{path,url:client.storage.from('langar-gallery').getPublicUrl(path).data.publicUrl};
}
async function renderGallery(){
 const p=$('#galleryPanel');if(!p)return;await loadMenu();
 p.innerHTML=`<div class="section-head"><h2>Gallery & Menu Product Photos</h2><p>Public Gallery is for café, events and promotional images. Menu Product Photos assigns one main image to an exact menu item.</p></div>
 <div class="v555-tabs"><button class="primary" data-gmode="public">Public Gallery</button><button class="secondary" data-gmode="product">Menu Product Photos</button></div>
 <section id="v555public" class="v555-gallery-mode"><form id="v555PublicForm" class="form-card"><h3>Public gallery photo</h3><label>Photo<input type="file" name="file" accept="image/*" required></label><small class="v555-help">Large camera photos are automatically resized and compressed.</small><div class="edit-grid"><label>Title EN<input name="title_en" required></label><label>Title HR<input name="title_hr"></label></div><label>Public category<select name="category"><option value="interior">Interior</option><option value="events">Events</option><option value="customers">Customers</option><option value="promotions">Promotions</option><option value="food">Food highlights</option><option value="drinks">Drink highlights</option></select></label><label>Display order<input name="sort_order" type="number" value="10"></label><p class="v555-upload-status"></p><button class="primary full">Upload public photo</button></form></section>
 <section id="v555product" class="v555-gallery-mode hidden"><form id="v555ProductForm" class="form-card"><h3>Menu product photo</h3><label>Photo<input type="file" name="file" accept="image/*" required></label><small class="v555-help">Choose the menu category first, then the exact food or drink.</small><div class="edit-grid"><label>Menu category<select id="v555MenuCat" name="menu_category_id" required><option value="">Choose category</option>${groupOptions()}</select></label><label>Exact menu item<select id="v555MenuItem" name="menu_item_id" required><option value="">Choose category first</option></select></label></div><div class="edit-grid"><label>Title EN<input name="title_en"></label><label>Title HR<input name="title_hr"></label></div><label><input type="checkbox" name="also_gallery"> Also show in Public Gallery</label><p class="v555-upload-status"></p><button class="primary full">Upload product photo</button></form></section>
 <div class="toolbar"><button id="v555GalleryRefresh" class="secondary">Refresh menu and photos</button></div><div id="v555GalleryList" class="v520-gallery-grid"></div>`;
 p.querySelectorAll('[data-gmode]').forEach(b=>b.onclick=()=>{p.querySelectorAll('[data-gmode]').forEach(x=>x.className='secondary');b.className='primary';$('#v555public').classList.toggle('hidden',b.dataset.gmode!=='public');$('#v555product').classList.toggle('hidden',b.dataset.gmode!=='product')});
 $('#v555MenuCat').onchange=e=>$('#v555MenuItem').innerHTML=itemOptions(e.target.value);
 $('#v555PublicForm').onsubmit=e=>uploadPhoto(e,false);$('#v555ProductForm').onsubmit=e=>uploadPhoto(e,true);
 $('#v555GalleryRefresh').onclick=async()=>{await loadMenu();$('#v555MenuCat').innerHTML='<option value="">Choose category</option>'+groupOptions();loadPhotos()};loadPhotos();
}
async function uploadPhoto(e,isProduct){
 e.preventDefault();const form=e.currentTarget,btn=form.querySelector('button[type="submit"],button:not([type])'),status=form.querySelector('.v555-upload-status');btn.disabled=true;
 try{const fd=new FormData(form),f=await uploadFile(fd.get('file'),status);let item=null,cat=null,role='gallery',category=String(fd.get('category')||'public');if(isProduct){item=String(fd.get('menu_item_id')||'');cat=String(fd.get('menu_category_id')||'');if(!item)throw new Error('Choose the exact menu item.');role=fd.get('also_gallery')?'both':'product';category='menu:'+cat}
  const {error}=await client.rpc('admin_create_gallery_item_v554',{p_image_url:f.url,p_storage_path:f.path,p_title_en:String(fd.get('title_en')||''),p_title_hr:String(fd.get('title_hr')||''),p_category:category,p_menu_category_id:cat||null,p_menu_item_id:item||null,p_sort_order:Number(fd.get('sort_order')||10),p_photo_role:role});
  if(error){await client.storage.from('langar-gallery').remove([f.path]);throw error}status.textContent='';toast(isProduct?'Product photo saved and published.':'Public gallery photo published.');form.reset();loadPhotos();
 }catch(err){if(status)status.textContent='';toast(err.message||String(err),false)}finally{btn.disabled=false}
}
async function loadPhotos(){const box=$('#v555GalleryList');if(!box||!client)return;box.innerHTML='<p>Loading…</p>';const{data,error}=await client.from('gallery_items').select('*').order('sort_order').order('created_at',{ascending:false});if(error){box.innerHTML=`<p class="error">${esc(error.message)}</p>`;return}box.innerHTML=(data||[]).map(i=>`<article class="v520-gallery-item"><img src="${esc(i.image_url)}"><div><b>${esc(i.title_en||i.title_hr||'Photo')}</b><small>${esc(i.category||'Gallery')} · ${esc(i.photo_role||'gallery')}</small><button class="danger full" data-gdel="${i.id}" data-path="${esc(i.storage_path||'')}">Delete</button></div></article>`).join('')||'<p>No photos yet.</p>';box.querySelectorAll('[data-gdel]').forEach(b=>b.onclick=async()=>{if(!confirm('Delete this photo?'))return;const{error}=await client.rpc('admin_delete_gallery_item_v554',{p_id:b.dataset.gdel});if(error)return toast(error.message,false);if(b.dataset.path)await client.storage.from('langar-gallery').remove([b.dataset.path]);loadPhotos()})}
async function renderReservations(){const box=$('#reservationsAdmin');if(!box)return;client=client||await waitClient();if(!client){box.innerHTML='<p class="error">Cloud connection unavailable.</p>';return}box.innerHTML='<p>Loading reservations…</p>';const{data,error}=await client.from('reservations').select('*').order('reservation_date').order('reservation_time');if(error){box.innerHTML=`<p class="error">${esc(error.message)}</p>`;return}box.innerHTML=(data||[]).map(r=>`<article class="v555-reservation"><div><h3>${esc(r.reservation_date)} · ${esc(String(r.reservation_time).slice(0,5))}</h3><p><b>${esc(r.customer_name)}</b> · ${esc(r.phone)} · ${Number(r.guests)} guests</p><p>${esc(r.note||'')}</p><small>Status: <b>${esc(r.status)}</b></small></div><div><button class="primary" data-rid="${r.id}" data-rst="confirmed">Confirm</button><button class="danger" data-rid="${r.id}" data-rst="rejected">Reject</button><button class="secondary" data-rid="${r.id}" data-rst="completed">Completed</button><button class="secondary" data-rid="${r.id}" data-rst="no_show">No-show</button></div></article>`).join('')||'<p>No reservations yet.</p>';box.querySelectorAll('[data-rid]').forEach(b=>b.onclick=async()=>{const note=prompt('Optional message to customer:','')||'';const{error}=await client.rpc('admin_update_reservation_v554',{p_id:b.dataset.rid,p_status:b.dataset.rst,p_note:note});if(error)toast(error.message,false);else{toast('Reservation updated.');renderReservations()}})}
function hook(){const old=window.showPanel;window.showPanel=function(id){const r=old?.apply(this,arguments);setTimeout(()=>{if(id==='galleryPanel')renderGallery();if(id==='reservationsPanel')renderReservations()},60);return r}}
async function init(){await waitClient();hook();if($('#galleryPanel'))renderGallery();client?.channel('v555-res').on('postgres_changes',{event:'*',schema:'public',table:'reservations'},()=>{if(!$('#reservationsPanel')?.classList.contains('hidden'))renderReservations()}).subscribe()}
window.addEventListener('load',()=>setTimeout(init,1000));
})();
