const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const LS = {
  get(k, d){ try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d} },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};
const ICONS = {
  'classic_coffee':'☕',
  'signature_coffee':'✨☕',
  'affogato':'🍨☕',
  'espresso_bull':'⚡☕',
  'coffee_cocktails':'🍸☕',
  'tea':'🍵',
  'tea_latte':'🫖',
  'iced_refreshers':'🧊🍹',
  'lemonade':'🍋',
  'matcha':'🍵✨',
  'smoothies':'🥭',
  'coffee_milkshakes':'🥤☕',
  'kids_milk':'🧸🥛',
  'protein':'💪🥤',
  'soft_drinks':'🧃',
  'beer':'🍺',
  'wine':'🍷',
  'wine_pairing':'🧀🍷',
  'breakfast_combos':'<span class="combo-icon">☕🥐</span>',
  'desserts':'🧁',
  'ice_cream':'🍦',
  'toast_sandwiches':'🥪',
  'tacos':'🌮',
  'focaccia_pizza':'🍕',
  'tapas':'<img src="assets/tapas_icon_clean.png" alt="Tapas">',
  'cat-coffee':'☕',
  'cat-tea':'🍵',
  'cat-matcha-smoothies':'🥤',
  'cat-protein':'💪',
  'cat-soft':'🧃',
  'cat-beer-wine':'🍷',
  'cat-combo':'<span class="combo-icon">☕🥐</span>',
  'cat-dessert':'🧁',
  'cat-toast':'🥖',
  'cat-tacos':'🌮',
  'cat-focaccia-pizza':'🍕',
  'cat-tapas':'<img src="assets/tapas_icon_clean.png" alt="Tapas">'
};
const T = {
  hr:{ tap:'Kliknite za sastojke', ingredients:'Sastojci', add:'Add', emptyCart:'Košarica je prazna.', orderSaved:'Narudžba je poslana u Admin Orders.', eligible:'Eligible for Langar Credit', alcoholic:'18+', unavailable:'Trenutno nedostupno', notOrderable:'Nije dostupno za online narudžbu', welcome:'Dobrodošli', join:'Učlani se', noProfile:'Još niste član Langar Cluba.'},
  en:{ tap:'Tap for ingredients', ingredients:'Ingredients', add:'Add', emptyCart:'Your cart is empty.', orderSaved:'Order was sent to Admin Orders.', eligible:'Eligible for Langar Credit', alcoholic:'18+', unavailable:'Currently unavailable', notOrderable:'Not available for online ordering', welcome:'Welcome', join:'Join now', noProfile:'You are not a Langar Club member yet.'}
};
let state = { lang: localStorage.langar_lang || 'hr', activeCat:'classic_coffee', activeOrderCat:'classic_coffee', menuMode:'grid', cart:[], orderType:'pickup' };
const MENU_STORAGE_KEY = 'langar_menu_v5';
function textOf(value, lang=state.lang){
  if(value && typeof value === 'object') return value[lang] || value.en || value.hr || '';
  return value || '';
}
function catTitle(cat){ return textOf(cat.title); }
function catDesc(cat){ return textOf(cat.description); }
function itemName(item, lang=state.lang){ return textOf(item.name, lang); }
function itemDesc(item, lang=state.lang){ return textOf(item.desc, lang); }
function cleanText(txt){ return String(txt||'').replace(/\s+/g,' ').trim(); }
function itemIngredients(item, lang=state.lang){ const ing=cleanText(textOf(item.ingredients, lang)); const desc=cleanText(itemDesc(item, lang)); if(!ing) return desc; if(desc && ing.toLowerCase()===desc.toLowerCase()) return ing; return ing; }
function currentAppUrl(refCode=''){
  const base = window.location.origin + window.location.pathname.replace(/index\.html$/,'');
  return refCode ? `${base}?ref=${encodeURIComponent(refCode)}` : base;
}
function qrUrl(data, size=220){
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}
function getMenu(){
  const normalize = menu => menu.map(c=>({...c, icon:ICONS[c.id]||c.icon||'✦', title:c.title||{en:c.id,hr:c.id}, description:c.description||{en:'',hr:''}, items:(c.items||[]).map(i=>{
    const ing = itemIngredients(i,'en').toLowerCase();
    return {...i, name:i.name||{en:i.name_en||'',hr:i.name_hr||i.name_en||''}, desc:i.desc||{en:'',hr:''}, ingredients:i.ingredients||i.desc||{en:'',hr:''}, allergens:i.allergens || (i.isAlcoholic?'18+':(ing.includes('milk')||ing.includes('mozzarella')||ing.includes('cheese')?'milk / gluten possible':'ask staff'))};
  })}));
  const stored=LS.get(MENU_STORAGE_KEY, null);
  if(stored) return normalize(stored);
  const m=normalize(LANGAR_DEFAULT_MENU);
  LS.set(MENU_STORAGE_KEY,m);
  return m;
}
function saveMenu(m){ LS.set(MENU_STORAGE_KEY,m); }
function setLang(lang){ state.lang=lang; localStorage.langar_lang=lang; document.documentElement.lang=lang; $('#langBtn').textContent=lang==='hr'?'EN':'HR'; $$('[data-hr]').forEach(el=>{ el.textContent=el.dataset[lang]; }); renderAll(); }
function priceNum(p){ const match=String(p).replace(',','.').match(/[0-9]+(\.[0-9]+)?/); return match?parseFloat(match[0]):0; }
function uid(prefix){ return prefix+'-'+Math.random().toString(36).slice(2,8)+'-'+Date.now().toString(36).slice(-4); }
function profile(){ return LS.get('langar_profile', null); }
function cards(){ return LS.get('langar_cards', []); }
function inbox(){ return LS.get('langar_inbox', []); }
const RESERVATION_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];
function todayISO(){ const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); }
function dateLabel(iso){ return new Date(iso+'T12:00:00').toLocaleDateString(state.lang==='hr'?'hr-HR':'en-US',{weekday:'short',day:'2-digit',month:'2-digit'}); }
function activeReservations(){ return LS.get('langar_reservations',[]).filter(r=>!['cancelled','completed','rejected'].includes(String(r.status||'').toLowerCase())); }
function isReservationSlotBooked(date,time){ return activeReservations().some(r=>r.date===date && r.time===time); }
function reservationDayStatus(date){ const booked=RESERVATION_SLOTS.filter(t=>isReservationSlotBooked(date,t)).length; return {booked, total:RESERVATION_SLOTS.length, full:booked>=RESERVATION_SLOTS.length}; }
function renderReservationCalendar(){
  const dateInput=$('#reservationDate'), timeInput=$('#reservationTime'), dateStrip=$('#reservationDateStrip'), slotGrid=$('#reservationSlots'), status=$('#reservationStatus');
  if(!dateInput||!timeInput||!dateStrip||!slotGrid) return;
  const min=todayISO(); dateInput.min=min; if(!dateInput.value) dateInput.value=min;
  const selectedDate=dateInput.value;
  dateStrip.innerHTML='';
  for(let i=0;i<10;i++){
    const d=new Date(); d.setDate(d.getDate()+i); d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
    const iso=d.toISOString().slice(0,10); const st=reservationDayStatus(iso);
    const b=document.createElement('button');
    b.type='button'; b.className='date-chip '+(iso===selectedDate?'selected ':'')+(st.full?'booked':'available');
    b.innerHTML=`<b>${dateLabel(iso)}</b><small>${st.booked}/${st.total} ${state.lang==='hr'?'rez.':'booked'}</small>`;
    b.onclick=()=>{dateInput.value=iso; timeInput.value=''; renderReservationCalendar();};
    dateStrip.appendChild(b);
  }
  slotGrid.innerHTML='';
  RESERVATION_SLOTS.forEach(t=>{
    const booked=isReservationSlotBooked(selectedDate,t);
    const b=document.createElement('button');
    b.type='button'; b.disabled=booked;
    b.className='slot-btn '+(booked?'booked':'available')+(timeInput.value===t?' selected':'');
    b.innerHTML=`<b>${t}</b><small>${booked?(state.lang==='hr'?'Zauzeto':'Booked'):(state.lang==='hr'?'Slobodno':'Available')}</small>`;
    b.onclick=()=>{timeInput.value=t; renderReservationCalendar();};
    slotGrid.appendChild(b);
  });
  if(status){
    if(timeInput.value) status.innerHTML = `<b>${state.lang==='hr'?'Odabrano':'Selected'}:</b> ${selectedDate} ${timeInput.value}`;
    else status.textContent = state.lang==='hr'?'Odaberite zeleni slobodni termin. Crveni termini su već rezervirani.':'Choose a green available time. Red slots are already reserved.';
  }
}

function ensureWelcomeInbox(){ if(localStorage.langar_booted_v3) return; localStorage.langar_booted_v3='1'; const msgs=[{id:uid('msg'),type:'message',title:'Opening Soon',body:'Join Langar Club and receive your opening invitation and welcome espresso card.',unread:true,createdAt:new Date().toISOString()}]; LS.set('langar_inbox', msgs); }
let viewStack = ['home'];
function updateBackButton(){
  const btn=$('#backBtn');
  if(!btn) return;
  const current=$('.view.active')?.id || 'home';
  btn.classList.toggle('hidden', current==='home' || (viewStack.length<=1 && !(current==='menu' && state.menuMode==='detail')));
}
function navigate(id, push=true){
  const target=$('#'+CSS.escape(id));
  if(!target) return;
  const current=$('.view.active')?.id;
  if(push && current && current!==id) viewStack.push(id);
  $$('.view').forEach(v=>v.classList.toggle('active', v.id===id));
  $$('.bottom-nav button').forEach(b=>b.classList.toggle('active', b.dataset.go===id));
  if(id==='menu'){ state.menuMode='grid'; renderMenu(); }
  if(id==='rewards') renderRewards();
  if(id==='referral') renderReferral();
  if(id==='gallery') renderGallery();
  if(id==='club') renderClubState();
  updateBackButton();
  window.scrollTo({top:0,behavior:'smooth'});
}
function goBack(){
  const current=$('.view.active')?.id;
  if(current==='menu' && state.menuMode==='detail'){ state.menuMode='grid'; renderMenu(); updateBackButton(); return; }
  if(viewStack.length<=1){ navigate('home', false); return; }
  viewStack.pop();
  const prev=viewStack[viewStack.length-1] || 'home';
  navigate(prev, false);
}
function attachNav(){
  $$('[data-go]').forEach(b=>{
    b.onclick=()=>{
      if(b.id==='popupJoin') $('#welcomePopup')?.classList.add('hidden');
      navigate(b.dataset.go);
    };
  });
}
function activeCategories(){ return getMenu().filter(c=>c.active!==false); }
function categoryButton(cat, active, cb){ const count=(cat.items||[]).filter(i=>i.available!==false).length; const btn=document.createElement('button'); btn.className='cat-tab '+(active?'active':''); btn.innerHTML=`<span class="cat-icon">${cat.icon||'✦'}</span><b>${catTitle(cat)}</b><small>${count}</small>`; btn.onclick=cb; return btn; }
function renderCategoryTabs(){ const tabs=$('#categoryTabs'); if(!tabs) return; tabs.innerHTML=''; tabs.classList.add('hidden'); }
function menuCategories(){
  const cats=activeCategories();
  if(!cats.some(c=>c.id==='sushi_preorder')){
    cats.push({id:'sushi_preorder', icon:'🍣', title:{hr:'Sushi rezervacija',en:'Sushi Pre-order'}, description:{hr:'Svježi sushi samo uz rezervaciju najmanje 1 dan ranije.',en:'Fresh sushi by pre-order only, at least 1 day in advance.'}, items:[], virtual:true, sort:999});
  }
  return cats;
}
function openMenuCategory(catId){ state.activeCat=catId; state.menuMode='detail'; renderMenu(); updateBackButton(); window.scrollTo({top:0,behavior:'smooth'}); }
function moveMenuCategory(step){ const cats=menuCategories(); let idx=cats.findIndex(c=>c.id===state.activeCat); if(idx<0) idx=0; idx=(idx+step+cats.length)%cats.length; openMenuCategory(cats[idx].id); }
function renderMenuGrid(){ const list=$('#menuList'); if(!list) return; const cats=menuCategories(); list.innerHTML=`<section class="menu-category-landing"><div class="menu-landing-title"><h3>${state.lang==='hr'?'Kategorije menija':'Menu Categories'}</h3><p>${state.lang==='hr'?'Dodirnite kategoriju za otvaranje artikala. Stranice kategorija imaju Back, Previous i Next za uredno pregledavanje.':'Tap a category to open items. Category pages have Back, Previous and Next for organized browsing.'}</p></div><div class="menu-category-grid"></div></section>`; const grid=list.querySelector('.menu-category-grid'); cats.forEach(cat=>{ const count=(cat.items||[]).filter(i=>i.available!==false).length; const card=document.createElement('button'); card.type='button'; card.className='menu-category-card'; card.innerHTML=`<span class="menu-cat-icon">${cat.icon||'✦'}</span><b>${catTitle(cat)}</b><small>${cat.virtual?(state.lang==='hr'?'rezervacija':'pre-order'):`${count} ${state.lang==='hr'?'artikala':'items'}`}</small>`; card.onclick=()=>openMenuCategory(cat.id); grid.appendChild(card); }); }
function renderOrderCategoryTabs(){ const tabs=$('#orderCategoryTabs'); if(!tabs) return; tabs.innerHTML=''; const cats=activeCategories().filter(c=>c.items.some(i=>i.available!==false&&i.orderable!==false)); if(!cats.find(c=>c.id===state.activeOrderCat)&&cats[0]) state.activeOrderCat=cats[0].id; cats.forEach(cat=>tabs.appendChild(categoryButton(cat, cat.id===state.activeOrderCat, ()=>{state.activeOrderCat=cat.id;renderOrderCategoryTabs();renderOrderMenu();}))); }
function likesMap(){ return LS.get('langar_item_likes',{}); }
function isLiked(id){ return !!likesMap()[id]; }
function toggleLike(item){ const likes=likesMap(); likes[item.id]=!likes[item.id]; LS.set('langar_item_likes',likes); renderMenu(); renderOrderMenu(); renderHomeMarketing(); }
function itemNode(item, orderMode=false){ const node=document.createElement('article'); node.className='menu-item'; const disabled=orderMode&&item.orderable===false; node.innerHTML=`<div class="item-main"><h4>${itemName(item)}</h4><p class="hint">${T[state.lang].tap}</p>${item.isAlcoholic?`<span class="tag">${T[state.lang].alcoholic}</span>`:''}${item.isNew?`<span class="tag">NEW</span>`:''}</div><div class="item-side"><button class="likeBtn ${isLiked(item.id)?'liked':''}" aria-label="Favorite">${isLiked(item.id)?'♥':'♡'}</button><div class="price">${item.price}</div>${orderMode&&!disabled?`<button class="secondary addBtn">${T[state.lang].add}</button>`:''}${disabled?`<p class="muted">${T[state.lang].notOrderable}</p>`:''}</div>`; node.onclick=e=>{ if(e.target.classList.contains('addBtn')){e.stopPropagation();addToCart(item);return;} if(e.target.classList.contains('likeBtn')){e.stopPropagation();toggleLike(item);return;} openDetails(item, orderMode); }; return node; }
function openDetails(item, orderMode){ const name=itemName(item), desc=itemDesc(item), ingredients=itemIngredients(item); $('#modalBody').innerHTML=`<div class="detail-row"><div><h2>${name}</h2><p class="price">${item.price}</p></div>${orderMode&&item.orderable!==false?`<button class="primary addFromModal">${T[state.lang].add}</button>`:''}</div>${desc?`<p class="muted detail-desc">${desc}</p>`:''}<div class="ingredients-box"><h4>${T[state.lang].ingredients}</h4><p>${ingredients}</p></div><p class="muted"><b>Allergens:</b> ${item.allergens||'Ask staff'}</p>${item.rewardEligible!==false?`<p class="tag">${T[state.lang].eligible}</p>`:''}${item.isAlcoholic?`<p class="tag">${state.lang==='hr'?'Samo za osobe 18+. Osoblje može zatražiti osobni dokument.':'18+ only. Staff may request ID.'}</p>`:''}`; const btn=$('#modalBody .addFromModal'); if(btn) btn.onclick=()=>{addToCart(item);$('#modal').classList.add('hidden')}; $('#modal').classList.remove('hidden'); }
function renderMenu(){
  const list=$('#menuList'); if(!list) return;
  if(state.menuMode!=='detail'){ renderMenuGrid(); return; }
  const cats=menuCategories(); let cat=cats.find(c=>c.id===state.activeCat)||cats[0]; if(!cat){ renderMenuGrid(); return; }
  const idx=cats.findIndex(c=>c.id===cat.id);
  if(cat.id==='sushi_preorder'){
    list.innerHTML=`<section class="menu-detail-toolbar"><button class="secondary menuBackToGrid">‹ ${state.lang==='hr'?'Kategorije':'Categories'}</button><div><button class="secondary prevCat">‹ ${state.lang==='hr'?'Prethodno':'Previous'}</button><button class="secondary nextCat">${state.lang==='hr'?'Sljedeće':'Next'} ›</button></div></section><section class="selected-cat menu-detail-head"><div class="big-icon">${cat.icon}</div><div><h3>${catTitle(cat)}</h3><p>${catDesc(cat)||''}</p><small>${idx+1}/${cats.length}</small></div></section><section class="form-card sushi-menu-bridge"><h3>${state.lang==='hr'?'Rezervirajte sushi':'Reserve sushi'}</h3><p class="muted">${state.lang==='hr'?'Sushi se ne prodaje kao stalni dnevni artikl na početku. Rezervacija najmanje 1 dan ranije pomaže nam sačuvati svježinu i vidjeti potražnju.':'Sushi is not sold as a daily item at the beginning. Reserving at least 1 day ahead helps us keep freshness and measure demand.'}</p><button class="primary full" data-go="sushi">${state.lang==='hr'?'Otvori sushi rezervaciju':'Open sushi pre-order'}</button></section>`;
    list.querySelector('.menuBackToGrid').onclick=()=>{state.menuMode='grid'; renderMenu(); updateBackButton();};
    list.querySelector('.prevCat').onclick=()=>moveMenuCategory(-1); list.querySelector('.nextCat').onclick=()=>moveMenuCategory(1); attachNav(); return;
  }
  list.innerHTML=`<section class="menu-detail-toolbar"><button class="secondary menuBackToGrid">‹ ${state.lang==='hr'?'Kategorije':'Categories'}</button><div><button class="secondary prevCat">‹ ${state.lang==='hr'?'Prethodno':'Previous'}</button><button class="secondary nextCat">${state.lang==='hr'?'Sljedeće':'Next'} ›</button></div></section><section class="selected-cat menu-detail-head"><div class="big-icon">${cat.icon}</div><div><h3>${catTitle(cat)}</h3><p>${catDesc(cat)||''}</p><small>${idx+1}/${cats.length}</small></div></section><div class="item-list menu-detail-items"></div>`;
  const items=list.querySelector('.item-list');
  cat.items.filter(i=>i.available!==false).forEach(i=>items.appendChild(itemNode({...i,categoryId:cat.id,categoryTitle:catTitle(cat)},false)));
  list.querySelector('.menuBackToGrid').onclick=()=>{state.menuMode='grid'; renderMenu(); updateBackButton();};
  list.querySelector('.prevCat').onclick=()=>moveMenuCategory(-1);
  list.querySelector('.nextCat').onclick=()=>moveMenuCategory(1);
}
function renderOrderMenu(){ const cats=activeCategories().filter(c=>c.items.some(i=>i.available!==false&&i.orderable!==false)); const cat=cats.find(c=>c.id===state.activeOrderCat)||cats[0]; const wrap=$('#orderMenu'); if(!cat||!wrap)return; wrap.innerHTML=`<section class="selected-cat"><div class="big-icon">${cat.icon}</div><div><h3>${catTitle(cat)}</h3><p>${catDesc(cat)||''}</p></div></section><div class="item-list"></div>`; const items=wrap.querySelector('.item-list'); cat.items.filter(i=>i.available!==false&&i.orderable!==false).forEach(i=>items.appendChild(itemNode({...i,categoryId:cat.id,categoryTitle:catTitle(cat)},true))); }
function addToCart(item){ const found=state.cart.find(x=>x.id===item.id); if(found) found.qty++; else state.cart.push({...item, qty:1}); renderCart(); renderSmartSuggestion(item); }
function renderSmartSuggestion(item){ const box=$('#smartSuggestion'); if(!box) return; const id=item.categoryId||''; let msg=state.lang==='hr'?'Dodajte piće ili desert uz narudžbu.':'Add a drink or dessert to your order.'; if(String(id).includes('taco')||String(id).includes('focaccia')||String(id).includes('tapas')) msg=state.lang==='hr'?'Savršeno uz osvježavajuće piće ili espresso nakon jela.':'Perfect with a refreshing drink or an espresso after food.'; if(String(id).includes('coffee')) msg=state.lang==='hr'?'Kava se odlično slaže s desertom ili kroasanom.':'Coffee pairs beautifully with dessert or croissant.'; if(String(id).includes('protein')) msg=state.lang==='hr'?'Probajte proteinski napitak uz lagani sendvič ili snack.':'Try a protein drink with a light sandwich or snack.'; box.innerHTML=`<article class="smart-suggestion"><b>${state.lang==='hr'?'Prijedlog uz narudžbu':'Smart suggestion'}</b><p>${msg}</p></article>`; }
function renderCart(){ const c=$('#cartItems'); if(!c)return; if(!state.cart.length){ c.textContent=T[state.lang].emptyCart; $('#cartTotal').textContent='€0.00'; return;} c.innerHTML=''; let total=0; state.cart.forEach((it,idx)=>{ const lt=priceNum(it.price)*it.qty; total+=lt; const line=document.createElement('div'); line.className='cart-line'; line.innerHTML=`<span>${it.qty} × ${itemName(it)}</span><b>€${lt.toFixed(2)}</b><button>×</button>`; line.querySelector('button').onclick=()=>{state.cart.splice(idx,1);renderCart();}; c.appendChild(line);}); $('#cartTotal').textContent=`€${total.toFixed(2)}`; }
function renderDashboard(){
  const p=profile(); const d=$('#homeDashboard'); if(!d)return;
  if(!p){
    d.innerHTML=`<div class="dash-card"><h3>${T[state.lang].noProfile}</h3><p>${state.lang==='hr'?'Registrirajte se i primite digitalnu espresso karticu.':'Register and receive your digital espresso card.'}</p><button class="primary" data-go="club">${T[state.lang].join}</button></div>`;
    attachNav(); return;
  }
  const level=p.orders>=30?'VIP':p.orders>=15?'Gold':p.orders>=5?'Silver':'Bronze';
  d.innerHTML=`<div class="dash-card"><p class="muted">${T[state.lang].welcome}, ${p.firstName}</p><h3>${p.credit?.toFixed(2)||'0.00'} € Langar Credit</h3><div class="stats"><span>${level}<small>Level</small></span><span>${p.orders||0}<small>Orders</small></span><span>${p.referrals||0}<small>Friends</small></span></div><div class="dashboard-actions"><button class="secondary" data-go="rewards">Rewards</button><button class="secondary" data-go="club">My QR</button></div><p class="muted">${state.lang==='hr'?'Digitalne kartice i QR kodovi nalaze se u Inboxu i Rewards. Iskorištene kartice automatski nestaju iz aktivnih nagrada.':'Digital cards and QR codes are in Inbox and Rewards. Redeemed cards automatically disappear from active rewards.'}</p></div>`;
  attachNav();
}
function allItems(){ return activeCategories().flatMap(c=>(c.items||[]).map(i=>({...i, categoryId:c.id, categoryTitle:catTitle(c)}))); }
function manualSalesMap(){ return LS.get('langar_pos_sales',{}); }
function commentCounts(){ const counts={}; LS.get('langar_feedback',[]).filter(f=>+f.rating>=4).forEach(f=>{ const fav=String(f.favorite||'').toLowerCase().trim(); if(!fav) return; allItems().forEach(i=>{ const en=itemName(i,'en').toLowerCase(); const hr=itemName(i,'hr').toLowerCase(); if(en.includes(fav)||fav.includes(en)||hr.includes(fav)||fav.includes(hr)){ counts[i.id]=(counts[i.id]||0)+1; } }); }); return counts; }
function orderCounts(){ const counts={}; LS.get('langar_orders_v3',[]).forEach(o=>(o.items||[]).forEach(it=>{ counts[it.id]=(counts[it.id]||0)+(it.qty||1); })); const manual=manualSalesMap(); Object.keys(manual).forEach(id=>{ counts[id]=(counts[id]||0)+(+manual[id]||0); }); return counts; }
function rankedItems(limit=8){ const likes=likesMap(); const counts=orderCounts(); const comments=commentCounts(); return allItems().filter(i=>i.available!==false).map(i=>{ const likeCount=(likes[i.id]?1:0)+(+LS.get('langar_cloud_like_counts',{})[i.id]||0); const orderCount=counts[i.id]||0; const commentCount=comments[i.id]||0; return {...i, rank:orderCount*3 + likeCount*5 + commentCount*4 + (i.isFeatured?2:0), orderCount, likeCount, commentCount, liked:!!likes[i.id]}; }).sort((a,b)=>b.rank-a.rank).slice(0,limit); }
function bestSellerItems(limit=6){ return allItems().filter(i=>i.available!==false).map(i=>({...i, sales:orderCounts()[i.id]||0})).sort((a,b)=>b.sales-a.sales).slice(0,limit); }
function lastCompletedOrRecentOrder(){ const orders=LS.get('langar_orders_v3',[]); return orders.find(o=>(o.items||[]).length) || null; }
function addOrderAgain(order){ if(!order || !(order.items||[]).length) return; order.items.forEach(it=>{ state.cart.push({...it, qty:it.qty||1}); }); renderCart(); navigate('order'); alert(state.lang==='hr'?'Zadnja narudžba je dodana u košaricu.':'Your previous order was added to the cart.'); }
function renderHomeMarketing(){ const wrap=$('#homeMarketingHub'); if(!wrap) return; const popular=rankedItems(8); const sellers=bestSellerItems(6); const daily=LS.get('langar_daily_surprise',{title:{hr:'Današnje iznenađenje',en:'Today’s Surprise'},body:{hr:'Pridružite se Langar Clubu i pratite posebne ponude za otvorenje.',en:'Join Langar Club and watch for opening offers.'}}); const poll=LS.get('langar_poll',{question:{hr:'Koji okus želite sljedeći?',en:'Which flavor should come next?'},options:['Pistachio Protein','Mango Ice Cream','Spicy Taco','Chocolate Dessert'],votes:{}}); const feedback=LS.get('langar_feedback',[]).filter(f=>+f.rating>=4).slice(0,3); const recent=lastCompletedOrRecentOrder(); const nextEvents=eventsList().filter(e=>e.active!==false).slice(0,3);
  wrap.innerHTML=`<section class="section-head compact-head"><h2>${state.lang==='hr'?'Langar iskustvo':'Langar Experience'}</h2><p>${state.lang==='hr'?'Dnevna ponuda, ponovna narudžba, eventi, popularno i recenzije.':'Daily surprise, order again, events, popular items and reviews.'}</p></section>
  <div class="experience-grid">
    <article class="experience-card surprise"><span>✨</span><h3>${textOf(daily.title)}</h3><p>${textOf(daily.body)}</p></article>
    <article class="experience-card order-again"><span>↻</span><h3>${state.lang==='hr'?'Naruči ponovno':'Order Again'}</h3>${recent?`<p>${(recent.items||[]).slice(0,2).map(i=>i.nameSnapshotHr&&state.lang==='hr'?i.nameSnapshotHr:i.nameSnapshot||i.name||'Item').join(' + ')}</p><button class="secondary" id="orderAgainBtn">${state.lang==='hr'?'Dodaj u košaricu':'Add to cart'}</button>`:`<p>${state.lang==='hr'?'Nakon prve narudžbe ovdje će se pojaviti brzo ponavljanje omiljene narudžbe.':'After your first order, quick reorder will appear here.'}</p>`}</article>
    <article class="experience-card feedback-short" data-go="feedback"><span>⭐</span><h3>${state.lang==='hr'?'Ostavi feedback':'Leave feedback'}</h3></article>
  </div>
  <section class="section-head compact-head"><h2>${state.lang==='hr'?'Nadolazeći eventi':'Upcoming Events'}</h2><p>${state.lang==='hr'?'Kliknite event za detalje, datum, vrijeme i prijavu interesa.':'Tap an event for details, date, time and interest registration.'}</p></section>
  <div class="mini-events">${nextEvents.map(e=>`<article data-go="events"><span>${e.icon||'✦'}</span><b>${textOf(e.title)}</b><small>${eventDateTimeLabel(e)}</small></article>`).join('')}</div>
  <section class="section-head compact-head"><h2>${state.lang==='hr'?'Popularno i najviše lajkano':'Popular & Most Liked'}</h2><p>${state.lang==='hr'?'Računa se prema lajkovima, pozitivnim komentarima, online narudžbama i ručno unesenoj prodaji iz kafića.':'Calculated from likes, positive comments, online orders and manually entered café/POS sales.'}</p></section><div class="popular-strip wide" id="popularStrip"></div>
  <section class="section-head compact-head"><h2>${state.lang==='hr'?'Najprodavanije':'Best Sellers'}</h2><p>${state.lang==='hr'?'Za kafić: admin može ručno dodati prodajne brojke dok se ne spoji Remaris/POS.':'For café sales: admin can enter sales counts manually until Remaris/POS sync is connected.'}</p></section><div class="popular-strip" id="bestSellerStrip"></div>
  <section class="public-reviews home-reviews"><h3>${state.lang==='hr'?'Što gosti vole':'What guests love'}</h3><div>${feedback.length?feedback.map(f=>`<article><b>${'★'.repeat(+f.rating)}</b><p>${f.message}</p><small>${f.name||'Langar guest'}${f.adminReply?` · ${state.lang==='hr'?'Odgovoreno':'Replied'}`:''}</small></article>`).join(''):`<p class="muted">${state.lang==='hr'?'Još nema javnih recenzija.':'No public reviews yet.'}</p>`}</div></section>`;
  attachNav(); const again=$('#orderAgainBtn'); if(again) again.onclick=()=>addOrderAgain(recent);
  const strip=$('#popularStrip'); if(strip){ strip.innerHTML=popular.map(i=>`<article class="popular-card"><b>${itemName(i)}</b><span>${i.price}</span><small>♥ ${i.likeCount||0} · 💬 ${i.commentCount||0} · 🧾 ${i.orderCount||0}</small><p>${state.lang==='hr'?'Score':'Score'} ${i.rank}</p></article>`).join(''); }
  const bs=$('#bestSellerStrip'); if(bs){ bs.innerHTML=sellers.map(i=>`<article class="popular-card bestseller"><b>${itemName(i)}</b><span>${i.price}</span><small>🧾 ${i.sales||0} ${state.lang==='hr'?'prodaja':'sales'}</small><p>${i.sales?state.lang==='hr'?'Top prodaja':'Top seller':state.lang==='hr'?'Dodajte POS brojke':'Add POS counts'}</p></article>`).join(''); }
}
function addInbox(item){ const list=inbox(); list.unshift(item); LS.set('langar_inbox',list); renderInboxBadge(); }
function redeemCard(id){ const list=cards().map(c=>c.id===id?{...c,status:'redeemed',redeemedAt:new Date().toISOString()}:c); LS.set('langar_cards', list); addInbox({id:uid('msg'),title:'Card redeemed',body:'Digital card was redeemed and is now invalid.',unread:true,createdAt:new Date().toISOString()}); renderRewards(); }
function renderRewards(){
  const p=profile(); const wrap=$('#rewardsView'); if(!wrap)return;
  if(!p){ wrap.innerHTML='<div class="empty-state">Join Langar Club to unlock rewards.</div>'; return; }
  const active=cards().filter(c=>c.status==='active'); const used=cards().filter(c=>c.status!=='active');
  wrap.innerHTML=`<section class="wallet"><h3>${p.credit?.toFixed(2)||'0.00'} €</h3><p>Langar Credit</p><div class="stats"><span>${p.orders||0}<small>Orders</small></span><span>${p.visits||0}<small>Visits</small></span><span>${p.referrals||0}<small>Referrals</small></span></div><button class="secondary" id="rewardMemberQr">Show member QR</button></section><h3>Active Digital Cards</h3><div class="cards-list active-cards"></div><h3>Used / Expired Cards</h3><div class="cards-list used-cards"></div><h3>History</h3><div class="history-list">${(LS.get('langar_history',[])||[]).map(h=>`<p><b>${h.type}</b> — ${h.text}<br><small>${new Date(h.createdAt).toLocaleString()}</small></p>`).join('')||'<p class="muted">No history yet.</p>'}</div>`;
  const renderCard=(card)=>{ const a=document.createElement('article'); a.className='reward-card '+card.status; a.innerHTML=`<h3>${card.title}</h3><p>${card.body}</p><div class="qrbox"><b>${card.code}</b><small>${card.status==='active'?'Active one-time code':'Inactive code'}</small></div><p>Status: <b>${card.status}</b></p>${card.status==='active'?`<button class="secondary">Redeem / Scan</button>`:''}`; const btn=a.querySelector('button'); if(btn) btn.onclick=()=>redeemCard(card.id); return a; };
  const activeBox=wrap.querySelector('.active-cards'); const usedBox=wrap.querySelector('.used-cards');
  activeBox.innerHTML=''; usedBox.innerHTML='';
  active.forEach(c=>activeBox.appendChild(renderCard(c))); if(!active.length) activeBox.innerHTML='<p class="muted">No active cards.</p>';
  used.forEach(c=>usedBox.appendChild(renderCard(c))); if(!used.length) usedBox.innerHTML='<p class="muted">No used cards yet.</p>';
  const mq=$('#rewardMemberQr'); if(mq) mq.onclick=()=>openPersonalQR();
}
function renderReferral(){ const p=profile(); const wrap=$('#referralView'); if(!wrap)return; if(!p){wrap.innerHTML='<div class="empty-state">Register first to receive your referral QR.</div>'; return;} if(!p.referralCode){ p.referralCode='REF-'+p.qr.replace('LNG-',''); LS.set('langar_profile',p); } const link=currentAppUrl(p.referralCode); wrap.innerHTML=`<section class="qr-card"><h3>${state.lang==='hr'?'Vaš referral QR':'Your referral QR'}</h3><p>${state.lang==='hr'?'Prijatelj skenira ovaj QR, instalira/otvori aplikaciju i registrira se u Langar Club. Nagrada se aktivira tek nakon njegove prve plaćene online narudžbe.':'Your friend scans this QR, installs/opens the app and registers in Langar Club. The reward activates only after their first paid online order.'}</p><div class="qr-real"><img src="${qrUrl(link,260)}" alt="Referral QR"><b>${p.referralCode}</b><small>${link}</small></div><p><b>Reward rule:</b> friend registers through your QR, places the first online order, pays, and the order is completed. Then you receive €0.50 Langar Credit.</p><button class="secondary" id="copyReferralLink">${state.lang==='hr'?'Kopiraj link':'Copy link'}</button></section>`; const copy=$('#copyReferralLink'); if(copy) copy.onclick=()=>navigator.clipboard?.writeText(link).then(()=>alert('Referral link copied.')); }
function deleteInboxItem(item){
  if(item.type==='card'){
    LS.set('langar_cards', cards().filter(c=>c.id!==item.id));
  } else {
    LS.set('langar_inbox', inbox().filter(m=>m.id!==item.id));
  }
  renderInbox(); renderInboxBadge();
}
function openInboxItem(item){
  markInboxItemRead(item);
  if(item.type==='card'){
    const card=cards().find(c=>c.id===item.id);
    if(!card) return;
    $('#modalBody').innerHTML=`<h2>${card.title}</h2><p>${card.body}</p><div class="qrbox"><b>${card.code}</b><small>${card.status==='active'?'Active one-time code':'Inactive code'}</small></div><p>Status: <b>${card.status}</b></p>${card.status==='active'?'<button class="primary full" id="redeemFromInbox">Redeem / Staff Scan</button>':''}<button class="secondary full" id="deleteInboxModal">${state.lang==='hr'?'Obriši poruku':'Delete message'}</button>`;
    $('#modal').classList.remove('hidden');
    const btn=$('#redeemFromInbox'); if(btn) btn.onclick=()=>{ redeemCard(card.id); $('#modal').classList.add('hidden'); renderInbox(); };
    const del=$('#deleteInboxModal'); if(del) del.onclick=()=>{deleteInboxItem(item); $('#modal').classList.add('hidden');};
    return;
  }
  $('#modalBody').innerHTML=`<h2>${item.title}</h2><p>${item.body}</p><small>${new Date(item.createdAt).toLocaleString()}</small><button class="secondary full" id="deleteInboxModal">${state.lang==='hr'?'Obriši poruku':'Delete message'}</button>`;
  $('#modal').classList.remove('hidden');
  const del=$('#deleteInboxModal'); if(del) del.onclick=()=>{deleteInboxItem(item); $('#modal').classList.add('hidden');};
}
function updateAppBadge(count){
  const btn=$('#inboxBadge');
  if(btn){ btn.textContent=count; btn.classList.toggle('hidden', !count); }
  try{
    if('setAppBadge' in navigator){ count ? navigator.setAppBadge(count) : navigator.clearAppBadge(); }
  }catch(e){}
}
function renderInboxBadge(){ const unread=inbox().filter(x=>x.unread).length+cards().filter(c=>c.unread&&c.status==='active').length; updateAppBadge(unread); }
function markInboxItemRead(item){
  if(item.type==='card'){
    const list=cards().map(c=>c.id===item.id?{...c,unread:false}:c); LS.set('langar_cards', list);
  } else {
    const list=inbox().map(m=>m.id===item.id?{...m,unread:false}:m); LS.set('langar_inbox', list);
  }
  renderInboxBadge();
}
function markInboxAllRead(){
  LS.set('langar_inbox', inbox().map(m=>({...m,unread:false})));
  LS.set('langar_cards', cards().map(c=>({...c,unread:false})));
  renderInboxBadge();
}

function renderInbox(){
  const list=[...cards().filter(c=>c.status==='active').map(c=>({...c,type:'card'})), ...inbox()];
  const box=$('#inboxList');
  if(!list.length){ box.innerHTML='<p class="muted">Inbox is empty.</p>'; return; }
  box.innerHTML='';
  list.forEach(item=>{ const a=document.createElement('article'); a.className='inbox-item compact clickable '+(item.unread?'unread':''); a.innerHTML=`<div><b>${item.title}</b><small>${new Date(item.createdAt).toLocaleString()}</small></div><button class="secondary small-open">${item.type==='card'?'Open card':'Open'}</button><button class="danger mini-delete">×</button>`; a.querySelector('.small-open').onclick=(e)=>{e.stopPropagation();openInboxItem(item)}; a.querySelector('.mini-delete').onclick=(e)=>{e.stopPropagation();deleteInboxItem(item)}; a.onclick=()=>openInboxItem(item); box.appendChild(a); });
}
function renderAppQr(){ const box=$('#appInstallQr'); if(!box) return; const link=currentAppUrl(); box.innerHTML=`<img src="${qrUrl(link,180)}" alt="Langar Bar app QR"><b>Langar Bar App</b><small>${link}</small>`; }
function defaultEvents(){ return [
  {id:'EVT-COFFEE-TALK', icon:'☕', active:true, title:{hr:'Coffee Talk Night',en:'Coffee Talk Night'}, date:'Coming soon', time:'19:00', body:{hr:'Večer za goste koji žele razumjeti espresso, cappuccino, vodu uz kavu, cremu i kako prepoznati dobru kavu. Bit će kratko, zabavno i korisno.',en:'An evening for guests who want to understand espresso, cappuccino, water with coffee, crema and how to recognize good coffee. Short, fun and useful.'}},
  {id:'EVT-TACO-NIGHT', icon:'🌮', active:true, title:{hr:'Taco & Tapas Night',en:'Taco & Tapas Night'}, date:'Coming soon', time:'20:00', body:{hr:'Druženje uz tacose, tapas zalogaje i posebne kombinacije pića. Gosti mogu otkriti koje kombinacije najbolje idu zajedno.',en:'A social evening with tacos, tapas bites and special drink pairings. Guests can discover which combinations work best together.'}},
  {id:'EVT-DESSERT-PAIRING', icon:'🧁', active:true, title:{hr:'Dessert & Coffee Pairing',en:'Dessert & Coffee Pairing'}, date:'Coming soon', time:'18:30', body:{hr:'Mali tasting: kako spojiti desert, espresso, cappuccino i hladne napitke u bolji doživljaj.',en:'A small tasting: how to pair dessert, espresso, cappuccino and cold drinks for a better experience.'}},
  {id:'EVT-PROTEIN-DAY', icon:'💪', active:true, title:{hr:'Protein Drink Day',en:'Protein Drink Day'}, date:'Coming soon', time:'17:00', body:{hr:'Dan za sportaše i aktivne goste: protein napitci, lagani snack i posebne ponude nakon treninga.',en:'A day for athletes and active guests: protein drinks, light snacks and post-workout offers.'}},
  {id:'EVT-BARISTA', icon:'🎓', active:true, title:{hr:'Barista Basics Workshop',en:'Barista Basics Workshop'}, date:'Coming soon', time:'16:00', body:{hr:'Uvod u espresso, mljevenje, mliječnu pjenu i higijenu aparata. Dobar početak za svakoga tko želi učiti kavu.',en:'Introduction to espresso, grinding, milk foam and machine hygiene. A good start for anyone who wants to learn coffee.'}}
]; }
function eventsList(){ const saved=LS.get('langar_events', null); if(saved) return saved; const d=defaultEvents(); LS.set('langar_events', d); return d; }
function eventDateTimeLabel(ev){ return [ev.date, ev.time].filter(Boolean).join(' · ') || (state.lang==='hr'?'Termin uskoro':'Date soon'); }
function openEventDetails(ev){ $('#modalBody').innerHTML=`<div class="event-detail-modal"><span class="event-big-icon">${ev.icon||'✦'}</span><h2>${textOf(ev.title)}</h2><p class="price">${eventDateTimeLabel(ev)}</p><p>${textOf(ev.body)}</p><button class="primary full event-interest-modal" data-event="${ev.id}">${state.lang==='hr'?'Zanima me':'I’m interested'}</button></div>`; $('#modal').classList.remove('hidden'); const btn=$('#modalBody .event-interest-modal'); if(btn) btn.onclick=()=>saveEventInterest(ev); }
function saveEventInterest(ev){ const p=profile(); const interests=LS.get('langar_event_interests',[]); const exists=interests.some(i=>i.eventId===ev.id && (i.customerId===p?.id || (!p && i.device==='local'))); if(!exists){ interests.unshift({id:uid('EI'), eventId:ev.id, eventTitle:textOf(ev.title,'en'), customerId:p?.id||null, device:p?null:'local', name:p?.firstName||'', createdAt:new Date().toISOString()}); LS.set('langar_event_interests', interests); }
  addInbox({id:uid('msg'), type:'message', title: state.lang==='hr'?'Interes za event spremljen':'Event interest saved', body: state.lang==='hr'?`Spremili smo vaš interes za: ${textOf(ev.title,'hr')}. Termin: ${eventDateTimeLabel(ev)}. Ako se termin promijeni, obavijest dolazi u Inbox.`:`We saved your interest for: ${textOf(ev.title,'en')}. Time: ${eventDateTimeLabel(ev)}. If the schedule changes, you will receive an Inbox notice.`, unread:true, createdAt:new Date().toISOString()}); renderInboxBadge(); alert(state.lang==='hr'?'Interes je spremljen u Inbox.':'Interest saved in Inbox.'); $('#modal').classList.add('hidden'); }
function renderEventCalendar(){ const box=$('#eventCalendarView'); if(!box) return; const list=eventsList().filter(e=>e.active!==false); box.innerHTML=list.map(ev=>`<article class="event-card clickable" data-event="${ev.id}"><span>${ev.icon||'✦'}</span><div><h3>${textOf(ev.title)}</h3><small>${eventDateTimeLabel(ev)}</small><p>${textOf(ev.body)}</p><button class="secondary event-interest" data-event="${ev.id}">${state.lang==='hr'?'Zanima me':'I’m interested'}</button></div></article>`).join(''); $$('.event-card.clickable').forEach(card=>card.onclick=(e)=>{ if(e.target.classList.contains('event-interest')) return; const ev=list.find(x=>x.id===card.dataset.event); if(ev) openEventDetails(ev); }); $$('.event-interest').forEach(btn=>btn.onclick=(e)=>{ e.stopPropagation(); const ev=list.find(x=>x.id===btn.dataset.event); if(ev) saveEventInterest(ev); }); }
function sushiItems(){ return LS.get('langar_sushi_items',[{id:'SUSHI-MIX',name:{hr:'Sushi Mix Box',en:'Sushi Mix Box'},price:'from €12.00',active:true},{id:'SUSHI-SALMON',name:{hr:'Salmon Sushi Box',en:'Salmon Sushi Box'},price:'from €14.00',active:true},{id:'SUSHI-VEGGIE',name:{hr:'Veggie Sushi Box',en:'Veggie Sushi Box'},price:'from €10.00',active:true}]); }
function renderSushiPreorder(){ const box=$('#sushiPreorderView'); if(!box) return; const tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1); tomorrow.setMinutes(tomorrow.getMinutes()-tomorrow.getTimezoneOffset()); const min=tomorrow.toISOString().slice(0,10); const opts=sushiItems().filter(x=>x.active!==false).map(x=>`<option value="${x.id}">${textOf(x.name)} — ${x.price}</option>`).join(''); box.innerHTML=`<section class="form-card"><h3>${state.lang==='hr'?'Rezervacija sushija':'Sushi Pre-order'}</h3><p class="muted">${state.lang==='hr'?'Sushi naručujemo svjež prema rezervacijama. Molimo rezervirajte najmanje 1 dan ranije.':'We source sushi fresh based on pre-orders. Please reserve at least 1 day in advance.'}</p><form id="sushiForm"><label>${state.lang==='hr'?'Vrsta sushija':'Sushi type'}<select name="sushiId" required>${opts}</select></label><label>${state.lang==='hr'?'Količina':'Quantity'}<input type="number" min="1" value="1" name="qty" required></label><label>${state.lang==='hr'?'Datum':'Date'}<input type="date" name="date" min="${min}" value="${min}" required></label><label>${state.lang==='hr'?'Vrijeme':'Time'}<input type="time" name="time" value="18:00" required></label><label>${state.lang==='hr'?'Način':'Mode'}<select name="mode"><option value="cafe">${state.lang==='hr'?'Serviranje u kafiću':'Serve in café'}</option><option value="pickup">Pick-up</option><option value="delivery">Delivery</option></select></label><label>${state.lang==='hr'?'Ime':'Name'}<input name="name" required></label><label>${state.lang==='hr'?'Telefon':'Phone'}<input name="phone" required></label><label>${state.lang==='hr'?'Napomena':'Note'}<textarea name="note" placeholder="Allergy, preferred type, delivery address..."></textarea></label><button class="primary full">${state.lang==='hr'?'Pošalji rezervaciju':'Send pre-order'}</button></form><p class="legal mini">${state.lang==='hr'?'Admin potvrđuje dostupnost i točan iznos. Cilj je mjeriti potražnju prije dnevne prodaje.':'Admin confirms availability and final amount. The goal is to measure demand before daily sushi sales.'}</p></section>`; const f=$('#sushiForm'); if(f) f.onsubmit=e=>{e.preventDefault(); const data=Object.fromEntries(new FormData(f).entries()); const item=sushiItems().find(x=>x.id===data.sushiId); const list=LS.get('langar_sushi_preorders',[]); list.unshift({id:uid('SUSHI'),status:'pending',itemName:textOf(item?.name,'en'),itemNameHr:textOf(item?.name,'hr'),createdAt:new Date().toISOString(),...data}); LS.set('langar_sushi_preorders',list); addInbox({id:uid('msg'),type:'message',title:state.lang==='hr'?'Sushi rezervacija primljena':'Sushi pre-order received',body:state.lang==='hr'?`Primili smo vašu sushi rezervaciju za ${textOf(item?.name,'hr')} (${data.date} ${data.time}). Admin će potvrditi dostupnost.`:`We received your sushi pre-order for ${textOf(item?.name,'en')} (${data.date} ${data.time}). Admin will confirm availability.`,unread:true,createdAt:new Date().toISOString()}); f.reset(); alert(state.lang==='hr'?'Sushi rezervacija je poslana.':'Sushi pre-order sent.');}; }
function renderGallery(){ const g=$('#galleryView'); if(!g)return; const imgs=LS.get('langar_gallery',[{src:'assets/tacos_hero.jpeg',title:'Signature tacos',cat:'Tacos'},{src:'assets/prawn_tacos.jpeg',title:'Crunchy prawn tacos',cat:'Tacos'},{src:'assets/quesadilla_real.jpeg',title:'Quesadilla preview',cat:'Food'}]); g.innerHTML=imgs.map(i=>`<article><img src="${i.src}"><b>${i.title}</b><small>${i.cat}</small></article>`).join(''); }
function renderPublicFeedback(){ const box=$('#publicFeedbackList'); if(!box) return; const publicItems=LS.get('langar_feedback',[]).filter(f=>+f.rating>=4); box.innerHTML=publicItems.length?publicItems.map(f=>`<article class="review-card"><b>${'★'.repeat(+f.rating)}</b><p>${f.message}</p><small>${f.name||'Langar guest'}${f.favorite?` · ${f.favorite}`:''}</small></article>`).join(''):`<p class="muted">${state.lang==='hr'?'Još nema javnih recenzija.':'No public reviews yet.'}</p>`; }
function maybeGoogleReviewPrompt(rating){ if(+rating>=4){ const googleUrl=LS.get('langar_google_review_url','https://www.google.com/maps/search/?api=1&query=Langar+Bar+Dugo+Selo'); $('#modalBody').innerHTML=`<h2>${state.lang==='hr'?'Hvala na lijepoj ocjeni!':'Thank you for the kind rating!'}</h2><p>${state.lang==='hr'?'Vaša pozitivna recenzija može biti prikazana gostima u aplikaciji. Ako želite podržati Langar Bar i na Google Maps, otvorite Google recenziju.':'Your positive review may be shown to guests in the app. If you would like to support Langar Bar on Google Maps too, open Google review.'}</p><a class="primary full button-link" target="_blank" rel="noopener" href="${googleUrl}">${state.lang==='hr'?'Otvori Google Maps':'Open Google Maps'}</a><button class="secondary full" id="closeReviewPrompt">${state.lang==='hr'?'Kasnije':'Maybe later'}</button>`; $('#modal').classList.remove('hidden'); $('#closeReviewPrompt').onclick=()=>$('#modal').classList.add('hidden'); } else { alert(state.lang==='hr'?'Hvala. Vaša poruka je poslana adminu kako bismo je privatno riješili.':'Thank you. Your feedback was sent to admin so we can solve it privately.'); } }
function renderAll(){ renderCategoryTabs(); renderMenu(); renderOrderCategoryTabs(); renderOrderMenu(); renderCart(); renderDashboard(); renderHomeMarketing(); renderPublicFeedback(); renderAppQr(); renderInboxBadge(); renderReservationCalendar(); renderEventCalendar(); renderSushiPreorder(); }
function setupEvents(){
  attachNav();
  const back=$('#backBtn'); if(back) back.onclick=goBack; const refInput=document.querySelector('[name="referralCode"]'); if(refInput && localStorage.langar_pending_referral && !refInput.value) refInput.value=localStorage.langar_pending_referral;
  $('#langBtn').onclick=()=>setLang(state.lang==='hr'?'en':'hr');
  $$('.segmented [data-order-type]').forEach(b=>b.onclick=()=>{$$('.segmented button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); state.orderType=b.dataset.orderType;});
  $('#closeModal').onclick=()=>$('#modal').classList.add('hidden');
  $('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden')};
  $('#inboxBtn').onclick=()=>{renderInbox(); markInboxAllRead(); renderInbox(); $('#inboxPanel').classList.remove('hidden')};
  $('#closeInbox').onclick=()=>$('#inboxPanel').classList.add('hidden');
  $('#closePopup').onclick=$('#popupLater').onclick=()=>{ $('#welcomePopup').classList.add('hidden'); localStorage.langar_popup_closed='1';};
  $('#clubForm').onsubmit=e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(e.target).entries());
    const pendingRef=localStorage.langar_pending_referral||data.referralCode||''; const p={...data, referralCodeInput:pendingRef, referredBy:pendingRef, id:uid('CUST'), qr:'LNG-'+Math.floor(100000+Math.random()*900000), referralCode:'REF-'+Math.floor(100000+Math.random()*900000), credit:0, orders:0, visits:0, referrals:0, referralRewardPosted:false, createdAt:new Date().toISOString()};
    LS.set('langar_profile',p);
    if(!cards().some(c=>c.type==='welcome')){
      const free=createCard('welcome','Free Espresso Card','One-time free espresso welcome gift. Show this card and let staff scan it.', 'free');
      LS.set('langar_cards',[free,...cards()]);
    }
    addInbox({id:uid('msg'),type:'message',title:'Welcome to Langar Club',body:'Your free espresso card is ready in Inbox and Rewards.',unread:true,createdAt:new Date().toISOString()});
    e.target.reset();
    renderAll();
    renderClubState();
    $('#modalBody').innerHTML=`<h2>${state.lang==='hr'?'Registracija je završena':'Registration completed'}</h2><p>${state.lang==='hr'?'Vaša registracija je uspješna. Digitalnu karticu za besplatan espresso možete pronaći u Inboxu i Rewards te je pokazati osoblju za skeniranje.':'Your registration is successful. You can find your digital free espresso card in Inbox and Rewards and show it to staff for scanning.'}</p><button class="primary full" data-go="rewards">${state.lang==='hr'?'Otvori Rewards':'Open Rewards'}</button>`;
    $('#modal').classList.remove('hidden');
    attachNav();
  };
  const feedbackForm=$('#feedbackForm');
  if(feedbackForm) feedbackForm.onsubmit=e=>{ e.preventDefault(); const data=Object.fromEntries(new FormData(e.target).entries()); const list=LS.get('langar_feedback',[]); list.unshift({id:uid('FB'),createdAt:new Date().toISOString(),status:+data.rating>=4?'public':'admin_only',...data}); LS.set('langar_feedback',list); e.target.reset(); renderPublicFeedback(); renderHomeMarketing(); maybeGoogleReviewPrompt(data.rating); };
  const partnerForm=$('#partnerForm');
  if(partnerForm) partnerForm.onsubmit=e=>{ e.preventDefault(); const data=Object.fromEntries(new FormData(e.target).entries()); const list=LS.get('langar_partner_applications',[]); list.unshift({id:uid('PART'),status:'new',createdAt:new Date().toISOString(),...data}); LS.set('langar_partner_applications',list); e.target.reset(); alert(state.lang==='hr'?'Prijava je primljena. Dodatne informacije šaljemo nakon pregleda.':'Application received. More information will be sent after review.'); };
  const reservationDate=$('#reservationDate'); if(reservationDate) reservationDate.onchange=()=>{ $('#reservationTime').value=''; renderReservationCalendar();};
  $('#reservationForm').onsubmit=e=>{e.preventDefault(); const data=Object.fromEntries(new FormData(e.target).entries()); if(!data.time){ alert(state.lang==='hr'?'Molimo odaberite slobodan zeleni termin.':'Please choose an available green time slot.'); return; } if(isReservationSlotBooked(data.date,data.time)){ alert(state.lang==='hr'?'Ovaj termin je već zauzet. Odaberite drugi zeleni termin.':'This time slot is already booked. Please choose another green slot.'); renderReservationCalendar(); return; } const res=LS.get('langar_reservations',[]); res.unshift({id:uid('RES'),status:'pending',createdAt:new Date().toISOString(),...data}); LS.set('langar_reservations',res); alert(state.lang==='hr'?'Rezervacija je poslana. Termin je sada zauzet dok ga admin ne otkaže.':'Reservation sent. This time slot is now blocked unless admin cancels it.'); e.target.reset(); $('#reservationTime').value=''; renderReservationCalendar();};
  const askForm=$('#askBaristaForm');
  if(askForm) askForm.onsubmit=e=>{ e.preventDefault(); const data=Object.fromEntries(new FormData(e.target).entries()); const list=LS.get('langar_barista_questions',[]); list.unshift({id:uid('BQ'),status:'new',createdAt:new Date().toISOString(),...data}); LS.set('langar_barista_questions',list); addInbox({id:uid('msg'),type:'message',title:state.lang==='hr'?'Pitanje je primljeno':'Question received',body:state.lang==='hr'?'Vaše pitanje za baristu je spremljeno. Odgovor ćete kasnije moći dobiti u Inboxu.':'Your question for the barista has been saved. You can receive the answer later in Inbox.',unread:true,createdAt:new Date().toISOString()}); e.target.reset(); renderInboxBadge(); alert(state.lang==='hr'?'Pitanje je poslano.':'Question sent.'); };
  $('#submitOrder').onclick=()=>{ if(!state.cart.length)return alert(T[state.lang].emptyCart); const total=state.cart.reduce((s,it)=>s+priceNum(it.price)*it.qty,0); const orders=LS.get('langar_orders_v3',[]); orders.unshift({id:uid('ORD'),status:'new',paid:false,type:state.orderType,name:$('#orderName').value,phone:$('#orderPhone').value,address:$('#orderAddress').value,note:$('#orderNote').value,items:state.cart.map(it=>({...it, nameSnapshot:itemName(it,'en'), nameSnapshotHr:itemName(it,'hr')})),total:+total.toFixed(2),referredBy:profile()?.referredBy||null,createdAt:new Date().toISOString()}); LS.set('langar_orders_v3',orders); state.cart=[]; renderCart(); alert(T[state.lang].orderSaved);};
  if(!localStorage.langar_popup_closed) setTimeout(()=>$('#welcomePopup').classList.remove('hidden'),800);
  updateBackButton();
}
const urlRef=new URLSearchParams(location.search).get('ref'); if(urlRef) localStorage.langar_pending_referral=urlRef; ensureWelcomeInbox(); setupEvents(); setLang(state.lang); if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{})); }
