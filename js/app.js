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
let state = { lang: localStorage.langar_lang || 'hr', activeCat:'classic_coffee', activeOrderCat:'classic_coffee', cart:[], orderType:'pickup' };
const MENU_STORAGE_KEY = 'langar_menu_v5';
function textOf(value, lang=state.lang){
  if(value && typeof value === 'object') return value[lang] || value.en || value.hr || '';
  return value || '';
}
function catTitle(cat){ return textOf(cat.title); }
function catDesc(cat){ return textOf(cat.description); }
function itemName(item, lang=state.lang){ return textOf(item.name, lang); }
function itemDesc(item, lang=state.lang){ return textOf(item.desc, lang); }
function itemIngredients(item, lang=state.lang){ return textOf(item.ingredients, lang) || itemDesc(item, lang); }
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
  btn.classList.toggle('hidden', current==='home' || viewStack.length<=1);
}
function navigate(id, push=true){
  const target=$('#'+CSS.escape(id));
  if(!target) return;
  const current=$('.view.active')?.id;
  if(push && current && current!==id) viewStack.push(id);
  $$('.view').forEach(v=>v.classList.toggle('active', v.id===id));
  $$('.bottom-nav button').forEach(b=>b.classList.toggle('active', b.dataset.go===id));
  if(id==='rewards') renderRewards();
  if(id==='referral') renderReferral();
  if(id==='gallery') renderGallery();
  if(id==='club') renderClubState();
  updateBackButton();
  window.scrollTo({top:0,behavior:'smooth'});
}
function goBack(){
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
function renderCategoryTabs(){ const tabs=$('#categoryTabs'); if(!tabs) return; tabs.innerHTML=''; const cats=activeCategories(); if(!cats.find(c=>c.id===state.activeCat)&&cats[0]) state.activeCat=cats[0].id; cats.forEach(cat=>tabs.appendChild(categoryButton(cat, cat.id===state.activeCat, ()=>{state.activeCat=cat.id;renderCategoryTabs();renderMenu();}))); }
function renderOrderCategoryTabs(){ const tabs=$('#orderCategoryTabs'); if(!tabs) return; tabs.innerHTML=''; const cats=activeCategories().filter(c=>c.items.some(i=>i.available!==false&&i.orderable!==false)); if(!cats.find(c=>c.id===state.activeOrderCat)&&cats[0]) state.activeOrderCat=cats[0].id; cats.forEach(cat=>tabs.appendChild(categoryButton(cat, cat.id===state.activeOrderCat, ()=>{state.activeOrderCat=cat.id;renderOrderCategoryTabs();renderOrderMenu();}))); }
function likesMap(){ return LS.get('langar_item_likes',{}); }
function isLiked(id){ return !!likesMap()[id]; }
function toggleLike(item){ const likes=likesMap(); likes[item.id]=!likes[item.id]; LS.set('langar_item_likes',likes); renderMenu(); renderOrderMenu(); renderHomeMarketing(); }
function itemNode(item, orderMode=false){ const node=document.createElement('article'); node.className='menu-item'; const disabled=orderMode&&item.orderable===false; node.innerHTML=`<div class="item-main"><h4>${itemName(item)}</h4><p class="hint">${T[state.lang].tap}</p>${item.isAlcoholic?`<span class="tag">${T[state.lang].alcoholic}</span>`:''}${item.isNew?`<span class="tag">NEW</span>`:''}</div><div class="item-side"><button class="likeBtn ${isLiked(item.id)?'liked':''}" aria-label="Favorite">${isLiked(item.id)?'♥':'♡'}</button><div class="price">${item.price}</div>${orderMode&&!disabled?`<button class="secondary addBtn">${T[state.lang].add}</button>`:''}${disabled?`<p class="muted">${T[state.lang].notOrderable}</p>`:''}</div>`; node.onclick=e=>{ if(e.target.classList.contains('addBtn')){e.stopPropagation();addToCart(item);return;} if(e.target.classList.contains('likeBtn')){e.stopPropagation();toggleLike(item);return;} openDetails(item, orderMode); }; return node; }
function openDetails(item, orderMode){ const name=itemName(item), desc=itemDesc(item), ingredients=itemIngredients(item); $('#modalBody').innerHTML=`<div class="detail-row"><div><h2>${name}</h2><p class="price">${item.price}</p></div>${orderMode&&item.orderable!==false?`<button class="primary addFromModal">${T[state.lang].add}</button>`:''}</div>${desc?`<p class="muted detail-desc">${desc}</p>`:''}<div class="ingredients-box"><h4>${T[state.lang].ingredients}</h4><p>${ingredients}</p></div><p class="muted"><b>Allergens:</b> ${item.allergens||'Ask staff'}</p>${item.rewardEligible!==false?`<p class="tag">${T[state.lang].eligible}</p>`:''}${item.isAlcoholic?`<p class="tag">${state.lang==='hr'?'Samo za osobe 18+. Osoblje može zatražiti osobni dokument.':'18+ only. Staff may request ID.'}</p>`:''}`; const btn=$('#modalBody .addFromModal'); if(btn) btn.onclick=()=>{addToCart(item);$('#modal').classList.add('hidden')}; $('#modal').classList.remove('hidden'); }
function renderMenu(){ const cats=activeCategories(); const cat=cats.find(c=>c.id===state.activeCat)||cats[0]; const list=$('#menuList'); if(!cat||!list)return; list.innerHTML=`<section class="selected-cat"><div class="big-icon">${cat.icon}</div><div><h3>${catTitle(cat)}</h3><p>${catDesc(cat)||''}</p></div></section><div class="item-list"></div>`; const items=list.querySelector('.item-list'); cat.items.filter(i=>i.available!==false).forEach(i=>items.appendChild(itemNode({...i,categoryId:cat.id,categoryTitle:catTitle(cat)},false))); }
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
function orderCounts(){ const counts={}; LS.get('langar_orders_v3',[]).forEach(o=>(o.items||[]).forEach(it=>{ counts[it.id]=(counts[it.id]||0)+(it.qty||1); })); return counts; }
function rankedItems(){ const likes=likesMap(); const counts=orderCounts(); return allItems().filter(i=>i.available!==false).map(i=>({...i, rank:(counts[i.id]||0)*3 + (likes[i.id]?5:0) + (i.isFeatured?2:0), orderCount:counts[i.id]||0, liked:!!likes[i.id]})).sort((a,b)=>b.rank-a.rank).slice(0,4); }
function renderHomeMarketing(){ const wrap=$('#homeMarketingHub'); if(!wrap) return; const popular=rankedItems(); const daily=LS.get('langar_daily_surprise',{title:{hr:'Današnje iznenađenje',en:'Today’s Surprise'},body:{hr:'Pridružite se Langar Clubu i pratite posebne ponude za otvorenje.',en:'Join Langar Club and watch for opening offers.'}}); const poll=LS.get('langar_poll',{question:{hr:'Koji okus želite sljedeći?',en:'Which flavor should come next?'},options:['Pistachio Protein','Mango Ice Cream','Spicy Taco','Chocolate Dessert'],votes:{}}); const feedback=LS.get('langar_feedback',[]).filter(f=>+f.rating>=4).slice(0,3);
  wrap.innerHTML=`<section class="section-head compact-head"><h2>${state.lang==='hr'?'Langar iskustvo':'Langar Experience'}</h2><p>${state.lang==='hr'?'Dnevna ponuda, glasanje, favoriti i recenzije gostiju.':'Daily surprise, voting, favorites and guest reviews.'}</p></section><div class="experience-grid"><article class="experience-card surprise"><span>✨</span><h3>${textOf(daily.title)}</h3><p>${textOf(daily.body)}</p></article><article class="experience-card poll"><span>🗳️</span><h3>${textOf(poll.question)}</h3><div id="homePollOptions"></div></article><article class="experience-card" data-go="feedback"><span>⭐</span><h3>${state.lang==='hr'?'Ostavite feedback':'Leave feedback'}</h3><p>${state.lang==='hr'?'Pozitivne recenzije mogu biti javne; problemi idu samo adminu.':'Positive reviews may be public; problems go to admin only.'}</p></article></div><section class="section-head compact-head"><h2>${state.lang==='hr'?'Popularno i najviše lajkano':'Popular & Most Liked'}</h2><p>${state.lang==='hr'?'Računa se prema narudžbama, lajkovima i istaknutim artiklima.':'Calculated from orders, likes and featured items.'}</p></section><div class="popular-strip" id="popularStrip"></div><section class="public-reviews home-reviews"><h3>${state.lang==='hr'?'Što gosti vole':'What guests love'}</h3><div>${feedback.length?feedback.map(f=>`<article><b>${'★'.repeat(+f.rating)}</b><p>${f.message}</p><small>${f.name||'Langar guest'}</small></article>`).join(''):`<p class="muted">${state.lang==='hr'?'Još nema javnih recenzija.':'No public reviews yet.'}</p>`}</div></section>`;
  const pollBox=$('#homePollOptions'); if(pollBox){ poll.options.forEach(opt=>{ const b=document.createElement('button'); b.className='poll-option'; b.innerHTML=`<b>${opt}</b><small>${poll.votes?.[opt]||0} ${state.lang==='hr'?'glasova':'votes'}</small>`; b.onclick=()=>{ poll.votes=poll.votes||{}; poll.votes[opt]=(poll.votes[opt]||0)+1; LS.set('langar_poll',poll); renderHomeMarketing(); }; pollBox.appendChild(b); }); }
  const pop=$('#popularStrip'); if(pop){ popular.forEach(it=>{ const a=document.createElement('article'); a.className='popular-card'; a.innerHTML=`<b>${itemName(it)}</b><small>${it.categoryTitle}</small><p>${it.price}</p><button class="secondary">${state.lang==='hr'?'Detalji':'Details'}</button>`; a.querySelector('button').onclick=()=>openDetails(it,false); pop.appendChild(a); }); }
  attachNav();
}
function renderClubState(){
  const p=profile(); const form=$('#clubForm'), success=$('#clubSuccess'), result=$('#clubResult');
  if(!form||!success) return;
  if(!p){ form.classList.remove('hidden'); success.classList.add('hidden'); if(result) result.classList.add('hidden'); return; }
  form.classList.add('hidden'); if(result) result.classList.add('hidden');
  success.classList.remove('hidden');
  success.innerHTML=`<h3>${state.lang==='hr'?'Registracija je uspješno završena.':'Registration completed successfully.'}</h3><p>${state.lang==='hr'?'Vaša digitalna kartica za besplatan espresso spremljena je u Inbox i Rewards. Tamo je možete otvoriti i pokazati osoblju za skeniranje.':'Your digital free espresso card is saved in Inbox and Rewards. You can open it there and show it to staff for scanning.'}</p><div class="dashboard-actions"><button class="primary" data-go="rewards">${state.lang==='hr'?'Otvori Rewards':'Open Rewards'}</button><button class="secondary" id="showPersonalQr">${state.lang==='hr'?'Prikaži moj QR':'Show my QR'}</button></div>`;
  attachNav();
  const q=$('#showPersonalQr'); if(q) q.onclick=()=>openPersonalQR();
}
function openPersonalQR(){ const p=profile(); if(!p) return; const data=currentAppUrl('member-'+p.qr); $('#modalBody').innerHTML=`<h2>Langar Club QR</h2><p class="muted">${state.lang==='hr'?'Ovaj QR služi za identifikaciju člana i skupljanje Langar Credit.':'This QR identifies the member and collects Langar Credit.'}</p><div class="qr-real"><img src="${qrUrl(data,240)}" alt="Langar Club QR"><b>${p.qr}</b><small>${data}</small></div>`; $('#modal').classList.remove('hidden'); }
function createCard(type, title, body, discount){ return {id:uid('card'),type,title,body,discount,status:'active',unread:true,createdAt:new Date().toISOString(), code:uid('QR').toUpperCase()}; }
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
function openInboxItem(item){
  markInboxItemRead(item);
  if(item.type==='card'){
    const card=cards().find(c=>c.id===item.id);
    if(!card) return;
    $('#modalBody').innerHTML=`<h2>${card.title}</h2><p>${card.body}</p><div class="qrbox"><b>${card.code}</b><small>${card.status==='active'?'Active one-time code':'Inactive code'}</small></div><p>Status: <b>${card.status}</b></p>${card.status==='active'?'<button class="primary full" id="redeemFromInbox">Redeem / Staff Scan</button>':''}`;
    $('#modal').classList.remove('hidden');
    const btn=$('#redeemFromInbox'); if(btn) btn.onclick=()=>{ redeemCard(card.id); $('#modal').classList.add('hidden'); renderInbox(); };
    return;
  }
  $('#modalBody').innerHTML=`<h2>${item.title}</h2><p>${item.body}</p><small>${new Date(item.createdAt).toLocaleString()}</small>`;
  $('#modal').classList.remove('hidden');
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
  list.forEach(item=>{ const a=document.createElement('article'); a.className='inbox-item clickable '+(item.unread?'unread':''); a.innerHTML=`<b>${item.title}</b><p>${item.body}</p><small>${new Date(item.createdAt).toLocaleString()}</small><span class="tap-note">${item.type==='card'?'Open card':'Open message'}</span>`; a.onclick=()=>openInboxItem(item); box.appendChild(a); });
}
function renderAppQr(){ const box=$('#appInstallQr'); if(!box) return; const link=currentAppUrl(); box.innerHTML=`<img src="${qrUrl(link,180)}" alt="Langar Bar app QR"><b>Langar Bar App</b><small>${link}</small>`; }
function renderGallery(){ const g=$('#galleryView'); if(!g)return; const imgs=LS.get('langar_gallery',[{src:'assets/tacos_hero.jpeg',title:'Signature tacos',cat:'Tacos'},{src:'assets/prawn_tacos.jpeg',title:'Crunchy prawn tacos',cat:'Tacos'},{src:'assets/quesadilla_real.jpeg',title:'Quesadilla preview',cat:'Food'}]); g.innerHTML=imgs.map(i=>`<article><img src="${i.src}"><b>${i.title}</b><small>${i.cat}</small></article>`).join(''); }
function renderPublicFeedback(){ const box=$('#publicFeedbackList'); if(!box) return; const publicItems=LS.get('langar_feedback',[]).filter(f=>+f.rating>=4); box.innerHTML=publicItems.length?publicItems.map(f=>`<article class="review-card"><b>${'★'.repeat(+f.rating)}</b><p>${f.message}</p><small>${f.name||'Langar guest'}${f.favorite?` · ${f.favorite}`:''}</small></article>`).join(''):`<p class="muted">${state.lang==='hr'?'Još nema javnih recenzija.':'No public reviews yet.'}</p>`; }
function maybeGoogleReviewPrompt(rating){ if(+rating>=4){ $('#modalBody').innerHTML=`<h2>${state.lang==='hr'?'Hvala na lijepoj ocjeni!':'Thank you for the kind rating!'}</h2><p>${state.lang==='hr'?'Ako želite podržati Langar Bar, možete nam kasnije ostaviti recenziju na Google Maps.':'If you want to support Langar Bar, you can later leave us a Google Maps review.'}</p><button class="primary full" id="closeReviewPrompt">OK</button>`; $('#modal').classList.remove('hidden'); $('#closeReviewPrompt').onclick=()=>$('#modal').classList.add('hidden'); } else { alert(state.lang==='hr'?'Hvala. Vaša poruka je poslana adminu kako bismo je privatno riješili.':'Thank you. Your feedback was sent to admin so we can solve it privately.'); } }
function renderAll(){ renderCategoryTabs(); renderMenu(); renderOrderCategoryTabs(); renderOrderMenu(); renderCart(); renderDashboard(); renderHomeMarketing(); renderPublicFeedback(); renderAppQr(); renderInboxBadge(); renderReservationCalendar(); }
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
  $('#submitOrder').onclick=()=>{ if(!state.cart.length)return alert(T[state.lang].emptyCart); const total=state.cart.reduce((s,it)=>s+priceNum(it.price)*it.qty,0); const orders=LS.get('langar_orders_v3',[]); orders.unshift({id:uid('ORD'),status:'new',paid:false,type:state.orderType,name:$('#orderName').value,phone:$('#orderPhone').value,address:$('#orderAddress').value,note:$('#orderNote').value,items:state.cart.map(it=>({...it, nameSnapshot:itemName(it,'en'), nameSnapshotHr:itemName(it,'hr')})),total:+total.toFixed(2),referredBy:profile()?.referredBy||null,createdAt:new Date().toISOString()}); LS.set('langar_orders_v3',orders); state.cart=[]; renderCart(); alert(T[state.lang].orderSaved);};
  if(!localStorage.langar_popup_closed) setTimeout(()=>$('#welcomePopup').classList.remove('hidden'),800);
  updateBackButton();
}
const urlRef=new URLSearchParams(location.search).get('ref'); if(urlRef) localStorage.langar_pending_referral=urlRef; ensureWelcomeInbox(); setupEvents(); setLang(state.lang); if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{})); }
