(()=>{
'use strict';
let client, menuCategories=[], galleryCategories=[];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function sb(){return window.langarCloud?.client||window.supabaseClient||window._supabase||null}
function status(msg,type='info'){const el=$('#gallery552status');if(!el)return;el.textContent=msg;el.className='gallery551-status '+type}
async function loadMenu(){
 const [cRes,iRes]=await Promise.all([
  client.from('menu_categories').select('id,slug,title_en,title_hr,sort_order,active').eq('active',true).order('sort_order'),
  client.from('menu_items').select('id,category_id,sku,name_en,name_hr,sort_order,active,available_in_menu').eq('active',true).order('sort_order')
 ]);
 if(!cRes.error&&cRes.data?.length){menuCategories=cRes.data.map(c=>({...c,items:(iRes.data||[]).filter(i=>i.category_id===c.id&&i.available_in_menu!==false)}));}
 else {menuCategories=(Array.isArray(window.LANGAR_DEFAULT_MENU)?window.LANGAR_DEFAULT_MENU:[]).map(c=>({id:c.id,slug:c.id,title_en:c.title?.en||c.id,title_hr:c.title?.hr||'',items:(c.items||[]).map(i=>({id:i.cloudId||i.id,sku:i.id,name_en:i.name?.en||i.id,name_hr:i.name?.hr||''}))}));}
}
async function loadGalleryCategories(){
 const {data}=await client.from('gallery_categories').select('*').eq('active',true).order('sort_order').order('title_en');
 galleryCategories=data||[];
}
function categoryOptions(){
 const fixed=[['interior','Interior / Interijer'],['events','Events / Događaji'],['customers','Customers / Gosti']];
 return `<optgroup label="Gallery categories">${galleryCategories.map(x=>`<option value="gallery:${esc(x.slug)}">${esc(x.title_en)} / ${esc(x.title_hr||'')}</option>`).join('')}${fixed.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('')}</optgroup><optgroup label="Menu categories">${menuCategories.map(c=>`<option value="menu:${esc(c.id)}">${esc(c.title_en||c.slug)} / ${esc(c.title_hr||'')}</option>`).join('')}</optgroup>`;
}
function itemOptions(catId){const c=menuCategories.find(x=>String(x.id)===String(catId));return `<option value="">Whole category / Cijela kategorija</option>${(c?.items||[]).map(i=>`<option value="${esc(i.id)}">${esc(i.name_en||i.sku)} / ${esc(i.name_hr||'')}</option>`).join('')}`}
async function nextSort(){const {data}=await client.from('gallery_items').select('sort_order').order('sort_order',{ascending:false}).limit(1);return ((data?.[0]?.sort_order)||0)+10}
async function renderPanel(){
 const p=$('#galleryPanel');if(!p||p.dataset.v552)return;p.dataset.v552='1';
 await Promise.all([loadMenu(),loadGalleryCategories()]);
 p.innerHTML=`<div class="section-head"><h2>Gallery & Product Photos</h2><p>Create gallery categories dynamically, upload public gallery photos, and assign a main image to every menu product.</p></div>
 <details class="form-card gallery552-category-manager"><summary><b>Manage gallery categories</b></summary><form id="gallery552catForm"><div class="edit-grid"><label>Title EN<input name="title_en" required></label><label>Title HR<input name="title_hr" required></label></div><div class="edit-grid"><label>Slug<input name="slug" placeholder="pizza-night"></label><label>Display order<input name="sort_order" type="number" value="10"></label></div><button class="secondary full">Add category</button></form><div id="gallery552catList"></div></details>
 <form id="gallery552" class="form-card gallery551-form">
 <label>Photo<input type="file" name="file" accept="image/jpeg,image/png,image/webp" required></label>
 <div class="edit-grid"><label>Use photo as<select name="photo_role" id="gallery552role"><option value="gallery">Gallery photo only</option><option value="product">Main product photo only</option><option value="both">Gallery + main product photo</option></select></label><label>Status<select name="active"><option value="true">Visible</option><option value="false">Hidden</option></select></label></div>
 <div class="edit-grid"><label>Title EN<input name="title_en" required></label><label>Title HR<input name="title_hr" required></label></div>
 <div class="edit-grid"><label>Category<select name="category" id="gallery552cat" required>${categoryOptions()}</select></label><label>Specific menu item<select name="menu_item_id" id="gallery552item"><option value="">Not linked to one item</option></select></label></div>
 <div class="edit-grid"><label>Display order<input type="number" name="sort_order" id="gallery552sort" min="0" step="1"><small>Lower numbers appear first. Use 10, 20, 30. The next number is filled automatically.</small></label><label>Image fit<select name="image_fit"><option value="cover">Cover</option><option value="contain">Contain</option></select></label></div>
 <label>Caption EN<textarea name="caption_en"></textarea></label><label>Caption HR<textarea name="caption_hr"></textarea></label>
 <button class="primary full" id="gallery552upload">Upload and publish</button><div id="gallery552status" class="gallery551-status"></div></form>
 <div class="toolbar"><button class="secondary" id="gallery552refresh">Refresh gallery</button></div><div id="gallery552list" class="v551-gallery-grid"></div>`;
 const cat=$('#gallery552cat'), item=$('#gallery552item'), role=$('#gallery552role');
 const syncItems=()=>{const v=cat.value;item.innerHTML=v.startsWith('menu:')?itemOptions(v.slice(5)):'<option value="">Not linked to one item</option>';syncRole()};
 const syncRole=()=>{const needs=role.value!=='gallery';item.required=needs;if(needs&&!cat.value.startsWith('menu:')){const first=menuCategories[0];if(first){cat.value='menu:'+first.id;syncItems()}}};
 cat.onchange=syncItems;role.onchange=syncRole;
 $('#gallery552refresh').onclick=()=>{loadList();loadCategoryList()};
 $('#gallery552catForm').onsubmit=addCategory;
 nextSort().then(n=>{$('#gallery552sort').value=n});
 $('#gallery552').onsubmit=upload;
 await loadCategoryList();await loadList();
}
async function addCategory(e){
 e.preventDefault();const fd=new FormData(e.currentTarget);const titleEn=String(fd.get('title_en')||'').trim(), titleHr=String(fd.get('title_hr')||'').trim();let slug=String(fd.get('slug')||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');if(!slug)slug=titleEn.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const {error}=await client.rpc('admin_upsert_gallery_category_v552',{p_slug:slug,p_title_en:titleEn,p_title_hr:titleHr,p_sort_order:Number(fd.get('sort_order')||0),p_active:true});
 if(error){alert(error.message);return}e.currentTarget.reset();await loadGalleryCategories();$('#gallery552cat').innerHTML=categoryOptions();await loadCategoryList();
}
async function loadCategoryList(){const box=$('#gallery552catList');if(!box)return;await loadGalleryCategories();box.innerHTML=galleryCategories.map(c=>`<div class="gallery552-cat-row"><span><b>${esc(c.title_en)}</b><small>${esc(c.title_hr||'')} · ${esc(c.slug)}</small></span><button class="danger" data-delcat="${c.id}">Delete</button></div>`).join('')||'<p>No custom gallery categories yet.</p>';box.querySelectorAll('[data-delcat]').forEach(b=>b.onclick=async()=>{if(!confirm('Delete this category? Existing photos will remain.'))return;const {error}=await client.rpc('admin_delete_gallery_category_v552',{p_id:b.dataset.delcat});if(error)alert(error.message);else{await loadGalleryCategories();$('#gallery552cat').innerHTML=categoryOptions();loadCategoryList()}})}
async function upload(e){
 e.preventDefault();const btn=$('#gallery552upload');btn.disabled=true;status('Uploading photo…');
 const fd=new FormData(e.currentTarget), file=fd.get('file');if(!file||!file.size){status('Choose a photo first.','error');btn.disabled=false;return}if(file.size>8*1024*1024){status('Photo is too large. Maximum 8 MB.','error');btn.disabled=false;return}
 const role=String(fd.get('photo_role')||'gallery'), rawCat=String(fd.get('category')||''), menuCategoryId=rawCat.startsWith('menu:')?rawCat.slice(5):null, menuItemId=String(fd.get('menu_item_id')||'')||null;
 if(role!=='gallery'&&!menuItemId){status('Choose the exact menu product for a product photo.','error');btn.disabled=false;return}
 const ext=(file.name.split('.').pop()||'jpg').toLowerCase();const path=`gallery/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;
 const up=await client.storage.from('langar-gallery').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});if(up.error){status('Storage upload failed: '+up.error.message,'error');btn.disabled=false;return}
 const publicUrl=client.storage.from('langar-gallery').getPublicUrl(path).data.publicUrl;
 const payload={p_image_url:publicUrl,p_storage_path:path,p_title_en:String(fd.get('title_en')||''),p_title_hr:String(fd.get('title_hr')||''),p_caption_en:String(fd.get('caption_en')||''),p_caption_hr:String(fd.get('caption_hr')||''),p_category:rawCat,p_menu_category_id:menuCategoryId,p_menu_item_id:menuItemId,p_sort_order:Number(fd.get('sort_order')||0),p_active:String(fd.get('active'))==='true',p_photo_role:role,p_image_fit:String(fd.get('image_fit')||'cover')};
 const ins=await client.rpc('admin_create_gallery_item_v552',payload);if(ins.error){await client.storage.from('langar-gallery').remove([path]);status('Database save failed: '+ins.error.message,'error');btn.disabled=false;return}
 status(role==='gallery'?'Gallery photo published.':role==='product'?'Product photo saved.':'Gallery and product photo published.','ok');e.currentTarget.reset();$('#gallery552item').innerHTML='<option value="">Not linked to one item</option>';$('#gallery552cat').innerHTML=categoryOptions();$('#gallery552sort').value=await nextSort();await loadList();btn.disabled=false;
}
async function loadList(){
 const box=$('#gallery552list');if(!box)return;box.innerHTML='<p>Loading…</p>';const {data,error}=await client.from('gallery_items').select('*').order('sort_order').order('created_at',{ascending:false});if(error){box.innerHTML=`<p class="gallery551-error">${esc(error.message)}</p>`;return}
 box.innerHTML=(data||[]).map(i=>`<article class="v551-gallery-item"><img src="${esc(i.image_url)}?v=${Date.parse(i.updated_at||i.created_at||Date.now())}" alt="${esc(i.title_en||i.title_hr||'Photo')}"><div><b>${esc(i.title_en||i.title_hr||'Photo')}</b><small>${esc(labelFor(i))}</small><small>${esc(i.photo_role||'gallery')} · Order ${Number(i.sort_order)||0} · ${i.active?'Visible':'Hidden'}</small><div class="gallery551-actions"><button class="secondary" data-toggle="${i.id}" data-active="${i.active}">${i.active?'Hide':'Show'}</button><button class="danger" data-delete="${i.id}" data-path="${esc(i.storage_path||'')}">Delete</button></div></div></article>`).join('')||'<p>No photos uploaded yet.</p>';
 box.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=async()=>{const {error}=await client.rpc('admin_update_gallery_item_v551',{p_id:b.dataset.toggle,p_active:b.dataset.active!=='true'});if(error)alert(error.message);else loadList()});
 box.querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Delete this photo permanently?'))return;const {error}=await client.rpc('admin_delete_gallery_item_v552',{p_id:b.dataset.delete});if(error){alert(error.message);return}if(b.dataset.path)await client.storage.from('langar-gallery').remove([b.dataset.path]);loadList()});
}
function labelFor(i){if(i.menu_item_id){for(const c of menuCategories){const x=(c.items||[]).find(v=>String(v.id)===String(i.menu_item_id));if(x)return `${c.title_en} › ${x.name_en}`}}if(i.menu_category_id){const c=menuCategories.find(x=>String(x.id)===String(i.menu_category_id));if(c)return c.title_en}return String(i.category||'Gallery').replace('gallery:','').replace('general-','')}
function init(){client=sb();if(!client){setTimeout(init,600);return}renderPanel()}
window.addEventListener('load',()=>setTimeout(init,700));
})();
