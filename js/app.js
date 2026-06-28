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
let state = { lang: localStorage.langar_lang || 'hr', activeCat:'classic_coffee', activeOrderCat:'classic_coffee', menuMode:'grid', orderMode:'grid', cart:[], orderType:'dine_in' };
const MENU_STORAGE_KEY = 'langar_menu_v10';
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
  const blockedItemIds = new Set(['desserts_001','tapas_006','tapas_007']);
  const normalize = menu => menu.map(c=>({...c, icon:ICONS[c.id]||c.icon||'✦', title:c.title||{en:c.id,hr:c.id}, description:c.description||{en:'',hr:''}, items:(c.items||[]).filter(i=>!blockedItemIds.has(i.id)).map(i=>{
    let item={...i, name:i.name||{en:i.name_en||'',hr:i.name_hr||i.name_en||''}, desc:i.desc||{en:'',hr:''}, ingredients:i.ingredients||i.desc||{en:'',hr:''}};
    if(item.id==='tacos_007'){
      item.desc={en:'Grilled chicken thigh with basmati rice, teriyaki sauce and sesame.', hr:'Grilani pileći zabatak s basmati rižom, teriyaki umakom i sezamom.'};
      item.ingredients={en:'Grilled chicken thigh, basmati rice, teriyaki sauce, sesame.', hr:'Grilani pileći zabatak, basmati riža, teriyaki umak, sezam.'};
    }
    const ing = itemIngredients(item,'en').toLowerCase();
    return {...item, allergens:item.allergens || (item.isAlcoholic?'18+':(ing.includes('milk')||ing.includes('mozzarella')||ing.includes('cheese')?'milk / gluten possible':'ask staff'))};
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


function renderClubState(){
  // V4.4.5: Langar Club must be real Cloud login/register, not an old local-only Save Profile view.
  if(window.LangarCloudAuth && typeof window.LangarCloudAuth.renderClub === 'function'){
    window.LangarCloudAuth.renderClub();
    return;
  }
  const club = document.getElementById('club');
  if(!club) return;
  const authBox = document.getElementById('clubAuthBox');
  const loginForm = document.getElementById('clubLoginForm');
  const signupForm = document.getElementById('clubForm');
  const loginTab = document.getElementById('clubLoginTab');
  const signupTab = document.getElementById('clubSignupTab');
  const success = document.getElementById('clubSuccess');
  const result = document.getElementById('clubResult');
  const rule = club.querySelector('.club-rule');
  const p = profile();
  function showMode(mode){
    const signup = mode === 'signup';
    if(loginForm) loginForm.classList.toggle('hidden', signup);
    if(signupForm) signupForm.classList.toggle('hidden', !signup);
    if(loginTab) loginTab.classList.toggle('active', !signup);
    if(signupTab) signupTab.classList.toggle('active', signup);
    if(rule) rule.classList.toggle('hidden', !signup);
  }
  if(loginTab && loginTab.dataset.localClubTabsWired !== '1'){
    loginTab.dataset.localClubTabsWired = '1';
    loginTab.addEventListener('click',()=>showMode('login'));
  }
  if(signupTab && signupTab.dataset.localClubTabsWired !== '1'){
    signupTab.dataset.localClubTabsWired = '1';
    signupTab.addEventListener('click',()=>showMode('signup'));
  }
  // Only a Cloud-ready profile should hide the registration/login area.
  if(!p || !p.cloudReady){
    if(authBox) authBox.classList.remove('hidden');
    if(success){ success.className='success-card hidden'; success.innerHTML=''; }
    if(result){ result.className='qr-card hidden'; result.innerHTML=''; }
    showMode('login');
    return;
  }
  if(authBox) authBox.classList.add('hidden');
  if(rule) rule.classList.add('hidden');
  if(success){
    success.className='success-card';
    success.innerHTML = `<h3>${state.lang==='hr'?'Dobrodošli u Langar Club':'Welcome to Langar Club'}</h3><p>${state.lang==='hr'?'Vaš Cloud profil je aktivan. Kredit, kartice i rođendanske pogodnosti vraćaju se nakon prijave.':'Your Cloud profile is active. Credit, cards and birthday rewards restore after login.'}</p><div class="club-profile-summary"><b>${escapeHtml([p.firstName,p.lastName].filter(Boolean).join(' ') || p.email || p.phone || 'Langar member')}</b><small>${escapeHtml(p.email || p.phone || '')}</small><span>Langar Credit: <b>€${Number(p.credit||0).toFixed(2)}</b></span></div><div class="cloud-row"><button class="secondary" data-go="rewards">${state.lang==='hr'?'Otvori nagrade':'Open Rewards'}</button><button class="secondary" data-go="referral">${state.lang==='hr'?'Referral QR':'Referral QR'}</button></div>`;
    attachNav();
  }
  if(result){
    const code = p.qr || p.referralCode || p.id || 'LANGAR';
    result.className='qr-card';
    result.innerHTML = `<h3>${state.lang==='hr'?'Članski QR':'Member QR'}</h3><div class="qr-real"><img src="${qrUrl(String(code),220)}" alt="Member QR"><b>${escapeHtml(code)}</b></div>`;
  }
}
window.renderClubState = renderClubState;

function ensureWelcomeInbox(){ if(localStorage.langar_booted_v3) return; localStorage.langar_booted_v3='1'; const msgs=[{id:uid('msg'),type:'message',title:'Opening Soon',body:'Join Langar Club and receive your opening invitation and welcome espresso card.',unread:true,createdAt:new Date().toISOString()}]; LS.set('langar_inbox', msgs); }
let viewStack = ['home'];
function updateBackButton(){
  const btn=$('#backBtn');
  if(!btn) return;
  const current=$('.view.active')?.id || 'home';
  btn.classList.toggle('hidden', current==='home' || (viewStack.length<=1 && !((current==='menu' && state.menuMode==='detail') || (current==='order' && state.orderMode==='detail'))));
}
function navigate(id, push=true){
  const target=$('#'+CSS.escape(id));
  if(!target) return;
  const current=$('.view.active')?.id;
  if(push && current && current!==id) viewStack.push(id);
  $$('.view').forEach(v=>v.classList.toggle('active', v.id===id));
  $$('.bottom-nav button').forEach(b=>b.classList.toggle('active', b.dataset.go===id));
  if(id==='menu'){ state.menuMode='grid'; renderMenu(); }
  if(id==='order'){ state.orderMode='grid'; renderOrderMenu(); }
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
  if(current==='order' && state.orderMode==='detail'){ state.orderMode='grid'; renderOrderMenu(); updateBackButton(); return; }
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
function activeCategories(){ return getMenu().filter(c=>c.active!==false && c.id!=='breakfast_addons' && c.hiddenInMenu!==true); }
function categoryButton(cat, active, cb){ const count=(cat.items||[]).filter(i=>i.available!==false).length; const btn=document.createElement('button'); btn.className='cat-tab '+(active?'active':''); btn.innerHTML=`<span class="cat-icon">${cat.icon||'✦'}</span><b>${catTitle(cat)}</b><small>${count}</small>`; btn.onclick=cb; return btn; }
function escapeHtml(value){ return String(value||'').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function isBreakfastItem(item){ return String(item.categoryId||'')==='breakfast' || String(item.id||'').startsWith('BRK-'); }
function breakfastAddOns(){ const cat=getMenu().find(c=>c.id==='breakfast_addons'); if(!cat) return []; return (cat.items||[]).filter(i=>i.available!==false && i.orderable!==false).map(i=>({...i, categoryId:'breakfast_addons', categoryTitle:catTitle(cat)})); }
function breakfastDrinkChoices(){ return [
  {id:'OJ', en:'Orange Juice 200ml', hr:'Sok od naranče 200 ml'},
  {id:'ESP', en:'Espresso', hr:'Espresso'},
  {id:'AME', en:'Americano', hr:'Americano'},
  {id:'TEA', en:'Classic Tea', hr:'Klasični čaj'}
]; }
function breakfastCustomizedItem(item, drink, addOns){
  const langDrink = drink || breakfastDrinkChoices()[0];
  const extras=(addOns||[]);
  const baseNameEn=itemName(item,'en'), baseNameHr=itemName(item,'hr');
  const extrasEn=extras.map(x=>itemName(x,'en')).join(', ');
  const extrasHr=extras.map(x=>itemName(x,'hr')).join(', ');
  const total=priceNum(item.price)+extras.reduce((s,x)=>s+priceNum(x.price),0);
  const suffixEn=`Drink: ${langDrink.en}${extrasEn?`; Add-ons: ${extrasEn}`:''}`;
  const suffixHr=`Piće: ${langDrink.hr}${extrasHr?`; Dodaci: ${extrasHr}`:''}`;
  return {...item, id:[item.id, langDrink.id, ...extras.map(x=>x.id)].join('__'), price:`€${total.toFixed(2)}`, name:{en:`${baseNameEn} (${suffixEn})`, hr:`${baseNameHr} (${suffixHr})`}, desc:{en:`${itemDesc(item,'en')} ${suffixEn}.`, hr:`${itemDesc(item,'hr')} ${suffixHr}.`}, ingredients:{en:`${itemIngredients(item,'en')} ${extrasEn?`Add-ons: ${extrasEn}.`:''}`, hr:`${itemIngredients(item,'hr')} ${extrasHr?`Dodaci: ${extrasHr}.`:''}`}};
}
function renderBreakfastOptions(item, orderMode){
  if(!isBreakfastItem(item)) return '';
  const drinks=breakfastDrinkChoices();
  const addOns=breakfastAddOns();
  const drinkTitle=state.lang==='hr'?'Uključeno piće':'Included drink';
  const addTitle=state.lang==='hr'?'Dodatno uz doručak':'Breakfast add-ons';
  const help=state.lang==='hr'?'Odaberite jedno uključeno piće i po želji dodajte priloge. Dodaci se obračunavaju na ukupnu cijenu.':'Choose one included drink and optional sides. Add-ons are added to the final price.';
  const drinkHtml=drinks.map((d,idx)=>`<label class="option-chip ${idx===0?'selected':''}"><input type="radio" name="breakfastDrink" value="${d.id}" ${idx===0?'checked':''}> <span>${escapeHtml(state.lang==='hr'?d.hr:d.en)}</span></label>`).join('');
  const addHtml=addOns.map(a=>`<label class="option-chip addon-chip"><input type="checkbox" name="breakfastAddon" value="${escapeHtml(a.id)}"> <span>${escapeHtml(itemName(a))}</span><b>${escapeHtml(a.price)}</b></label>`).join('');
  return `<section class="breakfast-options" data-base-price="${priceNum(item.price).toFixed(2)}"><h4>${drinkTitle}</h4><p class="muted">${help}</p><div class="option-grid drink-options">${drinkHtml}</div><h4>${addTitle}</h4><div class="option-grid addon-options">${addHtml||`<p class="muted">${state.lang==='hr'?'Dodaci trenutno nisu dostupni.':'Add-ons are not available right now.'}</p>`}</div><div class="breakfast-live-total"><span>${state.lang==='hr'?'Ukupno':'Total'}</span><b>€${priceNum(item.price).toFixed(2)}</b></div></section>`;
}
function readBreakfastSelection(){
  const drinkId=$('#modalBody input[name="breakfastDrink"]:checked')?.value || 'OJ';
  const drink=breakfastDrinkChoices().find(d=>d.id===drinkId)||breakfastDrinkChoices()[0];
  const ids=$$('#modalBody input[name="breakfastAddon"]:checked').map(x=>x.value);
  const all=breakfastAddOns();
  return {drink, addOns:ids.map(id=>all.find(a=>a.id===id)).filter(Boolean)};
}
function updateBreakfastLiveTotal(){
  const box=$('#modalBody .breakfast-options'); if(!box) return;
  const base=parseFloat(box.dataset.basePrice||'0')||0;
  const sel=readBreakfastSelection();
  const total=base+sel.addOns.reduce((sum,x)=>sum+priceNum(x.price),0);
  const text=`€${total.toFixed(2)}`;
  const totalBox=$('#modalBody .breakfast-live-total b'); if(totalBox) totalBox.textContent=text;
  const btn=$('#modalBody .addFromModal');
  if(btn) btn.textContent=(state.lang==='hr'?'Dodaj u narudžbu':'Add to order')+' — '+text;
}
function attachBreakfastOptionUX(){
  $$('#modalBody .option-chip input').forEach(input=>{ input.onchange=()=>{
    if(input.type==='radio'){ $$('#modalBody .drink-options .option-chip').forEach(l=>l.classList.toggle('selected', !!l.querySelector('input')?.checked)); }
    if(input.type==='checkbox'){ const label=input.closest('.option-chip'); if(label) label.classList.toggle('selected', input.checked); }
    updateBreakfastLiveTotal();
  }; });
  updateBreakfastLiveTotal();
}
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
function addSwipeNavigation(el, onPrev, onNext){
  if(!el) return;
  let sx=0, sy=0;
  el.ontouchstart=e=>{ const t=e.changedTouches[0]; sx=t.clientX; sy=t.clientY; };
  el.ontouchend=e=>{ const t=e.changedTouches[0]; const dx=t.clientX-sx; const dy=t.clientY-sy; if(Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.4){ dx<0 ? onNext() : onPrev(); } };
}

function renderMenuGrid(){ const list=$('#menuList'); if(!list) return; const cats=menuCategories(); list.innerHTML=`<section class="menu-category-landing"><div class="menu-category-grid"></div></section>`; const grid=list.querySelector('.menu-category-grid'); cats.forEach((cat,n)=>{ const count=(cat.items||[]).filter(i=>i.available!==false).length; const card=document.createElement('button'); card.type='button'; card.className='menu-category-card'; card.style.setProperty('--delay', `${Math.min(n,12)*35}ms`); card.innerHTML=`<span class="menu-cat-icon">${cat.icon||'✦'}</span><b>${catTitle(cat)}</b><small>${cat.virtual?(state.lang==='hr'?'rezervacija':'pre-order'):`${count} ${state.lang==='hr'?'artikala':'items'}`}</small>`; card.onclick=()=>openMenuCategory(cat.id); grid.appendChild(card); }); }
function orderCategories(){
  const cats=activeCategories().filter(c=>c.items.some(i=>i.available!==false&&i.orderable!==false));
  if(!cats.some(c=>c.id==='sushi_preorder')) cats.push({id:'sushi_preorder', icon:'🍣', title:{hr:'Sushi rezervacija',en:'Sushi Pre-order'}, description:{hr:'Svježi sushi samo uz rezervaciju najmanje 1 dan ranije.',en:'Fresh sushi by pre-order only, at least 1 day in advance.'}, items:[], virtual:true, sort:999});
  return cats;
}
function renderOrderCategoryTabs(){ const tabs=$('#orderCategoryTabs'); if(!tabs) return; tabs.innerHTML=''; tabs.classList.add('hidden'); const hint=tabs.previousElementSibling; if(hint&&hint.classList.contains('swipe-hint')) hint.classList.add('hidden'); }
function openOrderCategory(catId){ state.activeOrderCat=catId; state.orderMode='detail'; renderOrderMenu(); updateBackButton(); window.scrollTo({top:0,behavior:'smooth'}); }
function moveOrderCategory(step){ const cats=orderCategories(); let idx=cats.findIndex(c=>c.id===state.activeOrderCat); if(idx<0) idx=0; idx=(idx+step+cats.length)%cats.length; openOrderCategory(cats[idx].id); }
function renderOrderGrid(){ const wrap=$('#orderMenu'); if(!wrap) return; const cats=orderCategories(); wrap.innerHTML=`<section class="menu-category-landing order-category-landing"><div class="menu-category-grid"></div></section>`; const grid=wrap.querySelector('.menu-category-grid'); cats.forEach((cat,n)=>{ const count=(cat.items||[]).filter(i=>i.available!==false&&i.orderable!==false).length; const card=document.createElement('button'); card.type='button'; card.className='menu-category-card order-category-card'; card.style.setProperty('--delay', `${Math.min(n,12)*35}ms`); card.innerHTML=`<span class="menu-cat-icon">${cat.icon||'✦'}</span><b>${catTitle(cat)}</b><small>${cat.virtual?(state.lang==='hr'?'rezervacija':'pre-order'):`${count} ${state.lang==='hr'?'artikala':'items'}`}</small>`; card.onclick=()=>openOrderCategory(cat.id); grid.appendChild(card); }); }
function likesMap(){ return LS.get('langar_item_likes',{}); }
function isLiked(id){ return !!likesMap()[id]; }
function toggleLike(item){ const likes=likesMap(); likes[item.id]=!likes[item.id]; LS.set('langar_item_likes',likes); renderMenu(); renderOrderMenu(); renderHomeMarketing(); }
function itemNode(item, orderMode=false){ const node=document.createElement('article'); node.className='menu-item'; const disabled=orderMode&&item.orderable===false; node.innerHTML=`<div class="item-main"><h4>${itemName(item)}</h4><p class="hint">${T[state.lang].tap}</p>${item.isAlcoholic?`<span class="tag">${T[state.lang].alcoholic}</span>`:''}${item.isNew?`<span class="tag">NEW</span>`:''}</div><div class="item-side"><button class="likeBtn ${isLiked(item.id)?'liked':''}" aria-label="Favorite">${isLiked(item.id)?'♥':'♡'}</button><div class="price">${item.price}</div>${orderMode&&!disabled?`<button class="secondary addBtn">${T[state.lang].add}</button>`:''}${disabled?`<p class="muted">${T[state.lang].notOrderable}</p>`:''}</div>`; node.onclick=e=>{ if(e.target.classList.contains('addBtn')){e.stopPropagation(); if(isBreakfastItem(item)) openDetails(item, orderMode); else addToCart(item); return;} if(e.target.classList.contains('likeBtn')){e.stopPropagation();toggleLike(item);return;} openDetails(item, orderMode); }; return node; }
function openDetails(item, orderMode){ const name=itemName(item), desc=itemDesc(item), ingredients=itemIngredients(item); const breakfastOptions=renderBreakfastOptions(item, orderMode); $('#modalBody').innerHTML=`<div class="detail-row"><div><h2>${name}</h2><p class="price">${item.price}</p></div>${orderMode&&item.orderable!==false?`<button class="primary addFromModal">${T[state.lang].add}</button>`:''}</div>${desc?`<p class="muted detail-desc">${desc}</p>`:''}<div class="ingredients-box"><h4>${T[state.lang].ingredients}</h4><p>${ingredients}</p></div>${breakfastOptions}<p class="muted"><b>Allergens:</b> ${item.allergens||'Ask staff'}</p>${item.rewardEligible!==false?`<p class="tag">${T[state.lang].eligible}</p>`:''}${item.isAlcoholic?`<p class="tag">${state.lang==='hr'?'Samo za osobe 18+. Osoblje može zatražiti osobni dokument.':'18+ only. Staff may request ID.'}</p>`:''}`; attachBreakfastOptionUX(); const btn=$('#modalBody .addFromModal'); if(btn) btn.onclick=()=>{ if(isBreakfastItem(item)){ const sel=readBreakfastSelection(); addToCart(breakfastCustomizedItem(item, sel.drink, sel.addOns)); } else { addToCart(item); } $('#modal').classList.add('hidden')}; updateBreakfastLiveTotal(); $('#modal').classList.remove('hidden'); }
function renderMenu(){
  const list=$('#menuList'); if(!list) return;
  if(state.menuMode!=='detail'){ renderMenuGrid(); return; }
  const cats=menuCategories(); let cat=cats.find(c=>c.id===state.activeCat)||cats[0]; if(!cat){ renderMenuGrid(); return; }
  const idx=cats.findIndex(c=>c.id===cat.id);
  if(cat.id==='sushi_preorder'){
    list.innerHTML=`<section class="menu-detail-toolbar"><button class="secondary menuBackToGrid">‹ ${state.lang==='hr'?'Kategorije':'Categories'}</button><div><button class="secondary prevCat">‹ ${state.lang==='hr'?'Prethodno':'Previous'}</button><button class="secondary nextCat">${state.lang==='hr'?'Sljedeće':'Next'} ›</button></div></section><section class="selected-cat menu-detail-head"><div class="big-icon">${cat.icon}</div><div><h3>${catTitle(cat)}</h3><p>${catDesc(cat)||''}</p><small>${idx+1}/${cats.length} · ${state.lang==='hr'?'povucite lijevo/desno':'swipe left/right'}</small></div></section><section class="form-card sushi-menu-bridge"><h3>${state.lang==='hr'?'Rezervirajte sushi':'Reserve sushi'}</h3><p class="muted">${state.lang==='hr'?'Sushi se ne prodaje kao stalni dnevni artikl na početku. Rezervacija najmanje 1 dan ranije pomaže nam sačuvati svježinu i vidjeti potražnju.':'Sushi is not sold as a daily item at the beginning. Reserving at least 1 day ahead helps us keep freshness and measure demand.'}</p><button class="primary full" data-go="sushi">${state.lang==='hr'?'Otvori sushi rezervaciju':'Open sushi pre-order'}</button></section>`;
    list.querySelector('.menuBackToGrid').onclick=()=>{state.menuMode='grid'; renderMenu(); updateBackButton();};
    list.querySelector('.prevCat').onclick=()=>moveMenuCategory(-1); list.querySelector('.nextCat').onclick=()=>moveMenuCategory(1); addSwipeNavigation(list, ()=>moveMenuCategory(-1), ()=>moveMenuCategory(1)); attachNav(); return;
  }
  list.innerHTML=`<section class="menu-detail-toolbar"><button class="secondary menuBackToGrid">‹ ${state.lang==='hr'?'Kategorije':'Categories'}</button><div><button class="secondary prevCat">‹ ${state.lang==='hr'?'Prethodno':'Previous'}</button><button class="secondary nextCat">${state.lang==='hr'?'Sljedeće':'Next'} ›</button></div></section><section class="selected-cat menu-detail-head"><div class="big-icon">${cat.icon}</div><div><h3>${catTitle(cat)}</h3><p>${catDesc(cat)||''}</p><small>${idx+1}/${cats.length} · ${state.lang==='hr'?'povucite lijevo/desno':'swipe left/right'}</small></div></section><div class="item-list menu-detail-items"></div>`;
  const items=list.querySelector('.item-list');
  cat.items.filter(i=>i.available!==false).forEach(i=>items.appendChild(itemNode({...i,categoryId:cat.id,categoryTitle:catTitle(cat)},false)));
  list.querySelector('.menuBackToGrid').onclick=()=>{state.menuMode='grid'; renderMenu(); updateBackButton();};
  list.querySelector('.prevCat').onclick=()=>moveMenuCategory(-1);
  list.querySelector('.nextCat').onclick=()=>moveMenuCategory(1);
  addSwipeNavigation(list, ()=>moveMenuCategory(-1), ()=>moveMenuCategory(1));
}
function renderOrderMenu(){
  const wrap=$('#orderMenu'); if(!wrap) return;
  if(state.orderMode!=='detail'){ renderOrderGrid(); return; }
  const cats=orderCategories(); let cat=cats.find(c=>c.id===state.activeOrderCat)||cats[0]; if(!cat){ renderOrderGrid(); return; }
  const idx=cats.findIndex(c=>c.id===cat.id);
  if(cat.id==='sushi_preorder'){
    wrap.innerHTML=`<section class="menu-detail-toolbar"><button class="secondary orderBackToGrid">‹ ${state.lang==='hr'?'Kategorije':'Categories'}</button><div><button class="secondary prevOrderCat">‹ ${state.lang==='hr'?'Prethodno':'Previous'}</button><button class="secondary nextOrderCat">${state.lang==='hr'?'Sljedeće':'Next'} ›</button></div></section><section class="selected-cat menu-detail-head swipe-panel"><div class="big-icon">${cat.icon}</div><div><h3>${catTitle(cat)}</h3><p>${catDesc(cat)||''}</p><small>${idx+1}/${cats.length} · ${state.lang==='hr'?'povucite lijevo/desno':'swipe left/right'}</small></div></section><section class="form-card sushi-menu-bridge"><h3>${state.lang==='hr'?'Rezervirajte sushi':'Reserve sushi'}</h3><p class="muted">${state.lang==='hr'?'Sushi se rezervira najmanje 1 dan ranije radi svježine i kontrole potražnje.':'Sushi is reserved at least 1 day in advance for freshness and demand control.'}</p><button class="primary full" data-go="sushi">${state.lang==='hr'?'Otvori sushi rezervaciju':'Open sushi pre-order'}</button></section>`;
    wrap.querySelector('.orderBackToGrid').onclick=()=>{state.orderMode='grid'; renderOrderMenu(); updateBackButton();}; wrap.querySelector('.prevOrderCat').onclick=()=>moveOrderCategory(-1); wrap.querySelector('.nextOrderCat').onclick=()=>moveOrderCategory(1); addSwipeNavigation(wrap, ()=>moveOrderCategory(-1), ()=>moveOrderCategory(1)); attachNav(); return;
  }
  wrap.innerHTML=`<section class="menu-detail-toolbar"><button class="secondary orderBackToGrid">‹ ${state.lang==='hr'?'Kategorije':'Categories'}</button><div><button class="secondary prevOrderCat">‹ ${state.lang==='hr'?'Prethodno':'Previous'}</button><button class="secondary nextOrderCat">${state.lang==='hr'?'Sljedeće':'Next'} ›</button></div></section><section class="selected-cat menu-detail-head swipe-panel"><div class="big-icon">${cat.icon}</div><div><h3>${catTitle(cat)}</h3><p>${catDesc(cat)||''}</p><small>${idx+1}/${cats.length} · ${state.lang==='hr'?'povucite lijevo/desno':'swipe left/right'}</small></div></section><div class="item-list menu-detail-items"></div>`;
  const items=wrap.querySelector('.item-list'); cat.items.filter(i=>i.available!==false&&i.orderable!==false).forEach(i=>items.appendChild(itemNode({...i,categoryId:cat.id,categoryTitle:catTitle(cat)},true)));
  wrap.querySelector('.orderBackToGrid').onclick=()=>{state.orderMode='grid'; renderOrderMenu(); updateBackButton();}; wrap.querySelector('.prevOrderCat').onclick=()=>moveOrderCategory(-1); wrap.querySelector('.nextOrderCat').onclick=()=>moveOrderCategory(1); addSwipeNavigation(wrap, ()=>moveOrderCategory(-1), ()=>moveOrderCategory(1));
}
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
function showDigitalCardModal(card, sourceItem){
  if(!card) return;
  const activeText = state.lang==='hr'?'Aktivan jednokratni kod':'Active one-time code';
  const inactiveText = state.lang==='hr'?'Neaktivan kod':'Inactive code';
  $('#modalBody').innerHTML=`<h2>${card.title}</h2><p>${card.body}</p><div class="qrbox"><b>${card.code}</b><small>${card.status==='active'?activeText:inactiveText}</small></div><p>Status: <b>${card.status}</b></p>${card.status==='active'?'<button class="primary full" id="redeemFromInbox">Redeem / Staff Scan</button>':''}<button class="secondary full" id="deleteInboxModal">${state.lang==='hr'?'Obriši poruku':'Delete message'}</button>`;
  $('#modal').classList.remove('hidden');
  const btn=$('#redeemFromInbox'); if(btn) btn.onclick=()=>{ redeemCard(card.id); $('#modal').classList.add('hidden'); renderInbox(); };
  const del=$('#deleteInboxModal'); if(del) del.onclick=()=>{ deleteInboxItem(sourceItem || {...card,type:'card'}); $('#modal').classList.add('hidden'); };
}
function findWelcomeCard(){
  return cards().find(c=>c.type==='welcome' && c.status==='active') || cards().find(c=>String(c.title||'').toLowerCase().includes('espresso') && c.status==='active');
}
function openInboxItem(item){
  markInboxItemRead(item);
  if(item.type==='card'){
    const card=cards().find(c=>c.id===item.id);
    if(!card) return;
    showDigitalCardModal(card, item);
    return;
  }
  const looksLikeWelcomeCard = item.cloudWelcomeLocal || String(item.title+' '+item.body).toLowerCase().includes('espresso card') || String(item.title+' '+item.body).toLowerCase().includes('free espresso');
  if(looksLikeWelcomeCard){
    const welcomeCard = findWelcomeCard();
    if(welcomeCard){ showDigitalCardModal(welcomeCard, item); return; }
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
function renderSushiPreorder(){
  const box=$('#sushiPreorderView');
  if(!box) return;
  const tomorrow=new Date();
  tomorrow.setDate(tomorrow.getDate()+1);
  tomorrow.setMinutes(tomorrow.getMinutes()-tomorrow.getTimezoneOffset());
  const min=tomorrow.toISOString().slice(0,10);
  const opts=sushiItems().filter(x=>x.active!==false).map(x=>`<option value="${x.id}">${textOf(x.name)} — ${x.price}</option>`).join('');
  const profile=LS.get('langar_profile',{})||{};
  box.innerHTML=`<section class="form-card sushi-preorder-card"><h3>${state.lang==='hr'?'Rezervacija sushija':'Sushi Pre-order'}</h3><p class="muted">${state.lang==='hr'?'Sushi naručujemo svjež prema rezervacijama. Molimo rezervirajte najmanje 1 dan ranije. Kada admin potvrdi rezervaciju, potvrda dolazi u vaš Inbox.':'We source sushi fresh based on pre-orders. Please reserve at least 1 day in advance. When admin confirms your pre-order, confirmation will appear in your Inbox.'}</p><form id="sushiForm"><label>${state.lang==='hr'?'Vrsta sushija':'Sushi type'}<select name="sushiId" required>${opts}</select></label><label>${state.lang==='hr'?'Količina':'Quantity'}<input type="number" min="1" value="1" name="qty" required></label><label>${state.lang==='hr'?'Datum':'Date'}<input type="date" name="date" min="${min}" value="${min}" required></label><label>${state.lang==='hr'?'Vrijeme':'Time'}<input type="time" name="time" value="18:00" required></label><label>${state.lang==='hr'?'Način':'Mode'}<select name="mode"><option value="dine_in">${state.lang==='hr'?'Serviranje u kafiću':'Serve in café'}</option><option value="pickup">Pick-up</option><option value="delivery">Delivery</option></select></label><label>${state.lang==='hr'?'Ime':'Name'}<input name="name" value="${profile.firstName||''} ${profile.lastName||''}" required></label><label>${state.lang==='hr'?'Telefon':'Phone'}<input name="phone" value="${profile.phone||''}" required></label><label>${state.lang==='hr'?'Adresa za dostavu':'Delivery address'}<input name="delivery_address" placeholder="${state.lang==='hr'?'Samo ako je delivery':'Only if delivery'}"></label><label>${state.lang==='hr'?'Napomena':'Note'}<textarea name="note" placeholder="Allergy, preferred type, delivery address..."></textarea></label><button class="primary full">${state.lang==='hr'?'Pošalji rezervaciju':'Send pre-order'}</button></form><p class="legal mini">${state.lang==='hr'?'Cloud pravilo: rezervacija se sprema u Supabase, pa je admin vidi i na laptopu i na mobitelu.':'Cloud rule: pre-order is saved in Supabase, so admin can see it on laptop and mobile.'}</p></section>`;
  const f=$('#sushiForm');
  if(f) f.onsubmit=async e=>{
    e.preventDefault();
    const btn=f.querySelector('button[type="submit"],button.primary');
    if(btn) btn.disabled=true;
    const data=Object.fromEntries(new FormData(f).entries());
    const item=sushiItems().find(x=>x.id===data.sushiId);
    const itemNameEn=textOf(item?.name,'en')||data.sushiId;
    const itemNameHr=textOf(item?.name,'hr')||itemNameEn;
    const qty=Math.max(1, parseInt(data.qty||'1',10));
    const unit=priceNum(item?.price||0);
    const localRow={id:uid('SUSHI'),status:'pending',itemName:itemNameEn,itemNameHr,createdAt:new Date().toISOString(),...data,qty};
    try{
      const cloud=window.LangarCloud;
      const session=cloud && await cloud.getSession();
      if(!cloud || !session?.user){
        alert(state.lang==='hr'?'Prvo se registrirajte u Langar Clubu i potvrdite broj mobitela.':'Please register in Langar Club and verify your phone first.');
        if(btn) btn.disabled=false;
        return;
      }
      const preorderNumber='SUSHI-' + Date.now().toString(36).toUpperCase();
      const {data:pre,error:preErr}=await cloud.client.from('sushi_preorders').insert({
        user_id:session.user.id,
        preorder_number:preorderNumber,
        status:'pending',
        fulfillment_type:data.mode || 'pickup',
        requested_date:data.date,
        requested_time:data.time || null,
        customer_name:data.name,
        customer_phone:data.phone,
        delivery_address:data.delivery_address || null,
        note:data.note || null,
        total:unit*qty
      }).select('id,preorder_number').single();
      if(preErr) throw preErr;
      const {error:itemErr}=await cloud.client.from('sushi_preorder_items').insert({
        sushi_preorder_id:pre.id,
        item_id:null,
        item_name_en:itemNameEn,
        item_name_hr:itemNameHr,
        quantity:qty,
        unit_price:unit,
        total_price:unit*qty
      });
      if(itemErr) throw itemErr;
      const list=LS.get('langar_sushi_preorders',[]);
      list.unshift({...localRow,cloudId:pre.id,preorder_number:pre.preorder_number||preorderNumber});
      LS.set('langar_sushi_preorders',list);
      addInbox({id:uid('msg'),type:'message',title:state.lang==='hr'?'Sushi rezervacija poslana':'Sushi pre-order sent',body:state.lang==='hr'?`Primili smo vašu sushi rezervaciju za ${itemNameHr} (${data.date} ${data.time}). Admin će potvrditi dostupnost u Inboxu.`:`We received your sushi pre-order for ${itemNameEn} (${data.date} ${data.time}). Admin will confirm availability in your Inbox.`,unread:true,createdAt:new Date().toISOString()});
      f.reset();
      alert(state.lang==='hr'?'Sushi rezervacija je spremljena u Cloud i poslana adminu.':'Sushi pre-order saved in Cloud and sent to admin.');
    }catch(err){
      console.warn('Cloud sushi preorder error:', err);
      const list=LS.get('langar_sushi_preorders',[]);
      list.unshift(localRow);
      LS.set('langar_sushi_preorders',list);
      addInbox({id:uid('msg'),type:'message',title:state.lang==='hr'?'Sushi rezervacija spremljena lokalno':'Sushi pre-order saved locally',body:state.lang==='hr'?'Cloud spremanje nije uspjelo. Pokušajte ponovno ili kontaktirajte Langar Bar.':'Cloud save failed. Please try again or contact Langar Bar.',unread:true,createdAt:new Date().toISOString()});
      alert((state.lang==='hr'?'Cloud greška: ':'Cloud error: ')+(err.message||err));
    }finally{ if(btn) btn.disabled=false; }
  };
}

function renderGallery(){ const g=$('#galleryView'); if(!g)return; const imgs=LS.get('langar_gallery',[{src:'assets/tacos_hero.jpeg',title:'Signature tacos',cat:'Tacos'},{src:'assets/prawn_tacos.jpeg',title:'Crunchy prawn tacos',cat:'Tacos'},{src:'assets/quesadilla_real.jpeg',title:'Quesadilla preview',cat:'Food'}]); g.innerHTML=imgs.map(i=>`<article><img src="${i.src}"><b>${i.title}</b><small>${i.cat}</small></article>`).join(''); }
function renderPublicFeedback(){ const box=$('#publicFeedbackList'); if(!box) return; const publicItems=LS.get('langar_feedback',[]).filter(f=>+f.rating>=4); box.innerHTML=publicItems.length?publicItems.map(f=>`<article class="review-card"><b>${'★'.repeat(+f.rating)}</b><p>${f.message}</p><small>${f.name||'Langar guest'}${f.favorite?` · ${f.favorite}`:''}</small></article>`).join(''):`<p class="muted">${state.lang==='hr'?'Još nema javnih recenzija.':'No public reviews yet.'}</p>`; }
function maybeGoogleReviewPrompt(rating){ if(+rating>=4){ const googleUrl=LS.get('langar_google_review_url','https://www.google.com/maps/search/?api=1&query=Langar+Bar+Dugo+Selo'); $('#modalBody').innerHTML=`<h2>${state.lang==='hr'?'Hvala na lijepoj ocjeni!':'Thank you for the kind rating!'}</h2><p>${state.lang==='hr'?'Vaša pozitivna recenzija može biti prikazana gostima u aplikaciji. Ako želite podržati Langar Bar i na Google Maps, otvorite Google recenziju.':'Your positive review may be shown to guests in the app. If you would like to support Langar Bar on Google Maps too, open Google review.'}</p><a class="primary full button-link" target="_blank" rel="noopener" href="${googleUrl}">${state.lang==='hr'?'Otvori Google Maps':'Open Google Maps'}</a><button class="secondary full" id="closeReviewPrompt">${state.lang==='hr'?'Kasnije':'Maybe later'}</button>`; $('#modal').classList.remove('hidden'); $('#closeReviewPrompt').onclick=()=>$('#modal').classList.add('hidden'); } else { alert(state.lang==='hr'?'Hvala. Vaša poruka je poslana adminu kako bismo je privatno riješili.':'Thank you. Your feedback was sent to admin so we can solve it privately.'); } }

// =============================
// V4.5.7 — Customer order status tracker, countdown and stronger local notifications
// =============================
const orderStatusLabels = {
  new:{hr:'Poslana', en:'Sent'},
  accepted:{hr:'Prihvaćena', en:'Accepted'},
  preparing:{hr:'U pripremi', en:'Preparing'},
  ready:{hr:'Spremna', en:'Ready'},
  completed:{hr:'Završena', en:'Completed'},
  cancelled:{hr:'Otkazana', en:'Cancelled'},
  rejected:{hr:'Odbijena', en:'Rejected'}
};
function orderStatusText(st){ const o=orderStatusLabels[String(st||'new').toLowerCase()]||orderStatusLabels.new; return state.lang==='hr'?o.hr:o.en; }
function isTerminalOrder(st){ return ['completed','cancelled','rejected'].includes(String(st||'').toLowerCase()); }
function formatOrderEta(order){
  const mins = order?.estimatedMinutes || order?.estimated_minutes || null;
  const readyAt = order?.estimatedReadyAt || order?.estimated_ready_at || null;
  if(!mins && !readyAt && !order?.adminCustomerNote && !order?.admin_customer_note) return '';
  let txt = '';
  if(mins){ txt = state.lang==='hr' ? `Procjena: oko ${mins} min` : `Estimated time: about ${mins} min`; }
  if(readyAt){
    try{ const t = new Date(readyAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); txt += txt ? ` · ${t}` : (state.lang==='hr' ? `Spremno oko: ${t}` : `Ready around: ${t}`); }catch(e){}
  }
  const note = order?.adminCustomerNote || order?.admin_customer_note || '';
  if(note) txt += txt ? ` · ${note}` : note;
  return txt;
}
function orderCountdownInfo(order){
  const readyAt = order?.estimatedReadyAt || order?.estimated_ready_at || null;
  if(!readyAt || isTerminalOrder(order?.status)) return null;
  const target = new Date(readyAt).getTime();
  if(!target || Number.isNaN(target)) return null;
  const diff = Math.floor((target - Date.now())/1000);
  if(diff <= 0){
    return {expired:true, text: state.lang==='hr' ? 'Procijenjeno vrijeme je stiglo — čekamo potvrdu osoblja.' : 'Estimated time reached — waiting for staff confirmation.'};
  }
  const h = Math.floor(diff/3600);
  const m = Math.floor((diff%3600)/60);
  const sec = diff%60;
  const clock = h>0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
  return {expired:false, text: state.lang==='hr' ? `Preostalo: ${clock}` : `Time left: ${clock}`};
}
function hasActiveOrderCountdown(){
  return customerOrders().some(o=>orderCountdownInfo(o) && !isTerminalOrder(o.status));
}
function customerOrders(){ return LS.get('langar_orders_v3',[]); }
function saveCustomerOrders(list){ LS.set('langar_orders_v3', list); }
function orderMessageForStatus(o, st){
  const num=o.cloudOrderNumber||o.order_number||o.id||'';
  const eta=formatOrderEta(o);
  const en={accepted:`Your order ${num} has been accepted.`,preparing:`Your order ${num} is now being prepared.`,ready:`Your order ${num} is ready.`,completed:`Your order ${num} is completed. Thank you.`,cancelled:`Your order ${num} was cancelled. Please contact staff if needed.`,rejected:`Your order ${num} was rejected. Please contact staff or place another order.`};
  const hr={accepted:`Vaša narudžba ${num} je prihvaćena.`,preparing:`Vaša narudžba ${num} je u pripremi.`,ready:`Vaša narudžba ${num} je spremna.`,completed:`Vaša narudžba ${num} je završena. Hvala.`,cancelled:`Vaša narudžba ${num} je otkazana. Molimo kontaktirajte osoblje ako je potrebno.`,rejected:`Vaša narudžba ${num} je odbijena. Molimo kontaktirajte osoblje ili pošaljite novu narudžbu.`};
  const base=state.lang==='hr'?(hr[st]||`Status narudžbe ${num}: ${orderStatusText(st)}`):(en[st]||`Order ${num} status: ${orderStatusText(st)}`);
  return eta ? `${base} ${eta}` : base;
}
function orderEtaUpdateMessage(o){
  const num=o.cloudOrderNumber||o.order_number||o.id||'';
  const eta=formatOrderEta(o);
  return state.lang==='hr' ? `Vrijeme za narudžbu ${num} je ažurirano. ${eta}` : `Time update for order ${num}. ${eta}`;
}

async function requestOrderStatusNotifications(order){
  try{
    if(window.LangarCloud?.requestCustomerPushPermission){ await window.LangarCloud.requestCustomerPushPermission(); }
    else if(window.LangarOrderCloud?.requestCustomerPushPermission){ await window.LangarOrderCloud.requestCustomerPushPermission(); }
    else if('Notification' in window && Notification.permission==='default'){
      await Notification.requestPermission();
    }
  }catch(e){ console.warn('Order notification permission failed', e); }
}
function showOrderBrowserNotification(order, newStatus){
  try{
    if(!('Notification' in window) || Notification.permission!=='granted') return;
    const title = state.lang==='hr' ? 'Langar Bar — status narudžbe' : 'Langar Bar — order status';
    const body = orderMessageForStatus(order, newStatus);
    const opts = { body, tag:'langar-order-'+(order.cloudId||order.id||'status'), badge:'assets/icon-192.png', icon:'assets/icon-192.png' };
    if(navigator.serviceWorker?.ready){ navigator.serviceWorker.ready.then(reg=>reg.showNotification(title, opts)).catch(()=>new Notification(title, opts)); }
    else new Notification(title, opts);
  }catch(e){}
}
function notifyOrderStatusIfNeeded(order, newStatus){
  if(!order || !newStatus) return;
  const key='order_status_'+(order.cloudId||order.id)+'_'+newStatus;
  const sent=LS.get('langar_order_status_notified',{});
  if(sent[key]) return;
  sent[key]=new Date().toISOString(); LS.set('langar_order_status_notified',sent);
  if(['accepted','preparing','ready','completed','cancelled','rejected'].includes(String(newStatus))){
    addInbox({id:uid('msg'),type:'message',title:state.lang==='hr'?'Ažuriranje narudžbe':'Order update',body:orderMessageForStatus(order,newStatus),unread:true,createdAt:new Date().toISOString()});
    showOrderBrowserNotification(order,newStatus);
  }
}
function notifyOrderEtaIfNeeded(order){
  if(!order) return;
  const etaKey=(order.estimatedReadyAt||'')+'_'+(order.estimatedMinutes||'')+'_'+(order.adminCustomerNote||'');
  if(!etaKey.replace(/_/g,'')) return;
  const key='order_eta_'+(order.cloudId||order.id)+'_'+etaKey;
  const sent=LS.get('langar_order_status_notified',{});
  if(sent[key]) return;
  sent[key]=new Date().toISOString(); LS.set('langar_order_status_notified',sent);
  const body=orderEtaUpdateMessage(order);
  addInbox({id:uid('msg'),type:'message',title:state.lang==='hr'?'Vrijeme narudžbe':'Order time update',body,unread:true,createdAt:new Date().toISOString()});
  try{
    if('Notification' in window && Notification.permission==='granted'){
      const title=state.lang==='hr'?'Langar Bar — vrijeme narudžbe':'Langar Bar — order time';
      const opts={ body, tag:'langar-order-eta-'+(order.cloudId||order.id), badge:'assets/icon-192.png', icon:'assets/icon-192.png' };
      if(navigator.serviceWorker?.ready){ navigator.serviceWorker.ready.then(reg=>reg.showNotification(title, opts)).catch(()=>new Notification(title, opts)); }
      else new Notification(title, opts);
    }
  }catch(e){}
}
function orderCancelText(order){
  const st=String(order.cancelStatus||'').toLowerCase();
  if(st==='approved') return state.lang==='hr'?'Otkazivanje je odobreno.':'Cancellation approved.';
  if(st==='rejected') return state.lang==='hr'?'Otkazivanje nije moguće bez dogovora s osobljem.':'Cancellation is not available without staff approval.';
  if(order.cancelRequestedAt) return state.lang==='hr'?'Zahtjev za otkazivanje je poslan osoblju.':'Cancellation request sent to staff.';
  return '';
}
function canRequestCancel(order){
  if(!order?.cloudOrderToken || isTerminalOrder(order.status) || order.cancelRequestedAt) return false;
  return ['new','accepted','preparing'].includes(String(order.status||'new').toLowerCase());
}
function notifyCancellationUpdateIfNeeded(order){
  const key='order_cancel_'+(order.cloudId||order.id)+'_'+(order.cancelStatus||'requested')+'_'+(order.cancelRequestedAt||'');
  const sent=LS.get('langar_order_status_notified',{});
  if(sent[key]) return;
  sent[key]=new Date().toISOString(); LS.set('langar_order_status_notified',sent);
  const body=orderCancelText(order);
  if(body) addInbox({id:uid('msg'),type:'message',title:state.lang==='hr'?'Otkazivanje narudžbe':'Order cancellation',body,unread:true,createdAt:new Date().toISOString()});
}
async function requestOrderCancellation(orderId){
  const orders=customerOrders();
  const order=orders.find(o=>o.id===orderId || o.cloudId===orderId);
  if(!order || !order.cloudOrderToken) return alert(state.lang==='hr'?'Narudžba se ne može pronaći.':'Order cannot be found.');
  const ageMin=(Date.now()-new Date(order.createdAt).getTime())/60000;
  const defaultMsg = ageMin<=3
    ? (state.lang==='hr'?'Želim otkazati narudžbu.':'I would like to cancel my order.')
    : (state.lang==='hr'?'Želim provjeriti može li se narudžba otkazati.':'I would like to check if this order can still be cancelled.');
  const reason=prompt(state.lang==='hr'?'Napišite razlog otkazivanja. Osoblje mora potvrditi otkazivanje.':'Write the cancellation reason. Staff must approve cancellation.', defaultMsg);
  if(reason===null) return;
  try{
    if(!window.LangarOrderCloud?.requestOrderCancellation) throw new Error('Cancellation cloud function is not loaded.');
    await window.LangarOrderCloud.requestOrderCancellation(order.cloudOrderToken, reason.trim());
    order.cancelRequestedAt=new Date().toISOString(); order.cancelReason=reason.trim(); order.cancelStatus='requested';
    saveCustomerOrders(orders); renderCustomerOrderStatus();
    alert(state.lang==='hr'?'Zahtjev za otkazivanje je poslan. Osoblje će ga potvrditi ili odbiti.':'Cancellation request sent. Staff will approve or reject it.');
  }catch(err){ alert((state.lang==='hr'?'Greška pri slanju zahtjeva: ':'Cancellation request error: ')+(err.message||err)); }
}

async function syncCustomerOrderStatuses(){
  let accountMergeChanged=false;
  try{
    if(window.LangarOrderCloud?.syncAccountOrders){
      const now=Date.now();
      if(now-(window.__langarLastAccountOrderSync||0)>10000){
        window.__langarLastAccountOrderSync=now;
        const result=await window.LangarOrderCloud.syncAccountOrders();
        accountMergeChanged=!!result?.changed;
      }
    }
  }catch(e){ console.warn('Account order cloud sync failed', e.message||e); }
  try{
    if(window.LangarCloud?.syncInbox){
      const now=Date.now();
      if(now-(window.__langarLastInboxSync||0)>12000){
        window.__langarLastInboxSync=now;
        await window.LangarCloud.syncInbox();
      }
    }
  }catch(e){ console.warn('Cloud inbox sync failed', e.message||e); }
  const orders=customerOrders();
  const track=orders.filter(o=>o.cloudOrderToken && !String(o.status||'new').match(/^(completed|cancelled|rejected)$/));
  if(!track.length || !window.LangarOrderCloud?.client){ if(accountMergeChanged){ renderCustomerOrderStatus(); renderInboxBadge(); } return; }
  let changed=accountMergeChanged;
  for(const o of track.slice(0,10)){
    try{
      const row = window.LangarOrderCloud.getOrderByToken ? await window.LangarOrderCloud.getOrderByToken(o.cloudOrderToken) : (await window.LangarOrderCloud.client.rpc('get_customer_order_by_token',{p_token:o.cloudOrderToken})).data?.[0];
      if(!row) continue;
      const old=o.status||'new';
      const oldEta=(o.estimatedReadyAt||'')+'|'+(o.estimatedMinutes||'')+'|'+(o.adminCustomerNote||'');
      const oldCancel=(o.cancelStatus||'')+'|'+(o.cancelRequestedAt||'')+'|'+(o.cancelAdminNote||'');
      o.status=row.status||old; o.paid=!!row.paid; o.updatedAt=row.updated_at||o.updatedAt; o.completedAt=row.completed_at||o.completedAt; o.cloudOrderNumber=row.order_number||o.cloudOrderNumber;
      o.estimatedMinutes=(row.estimated_minutes ?? o.estimatedMinutes ?? null); o.estimatedReadyAt=(row.estimated_ready_at ?? o.estimatedReadyAt ?? null); o.adminCustomerNote=(row.admin_customer_note ?? o.adminCustomerNote ?? '');
      o.cancelRequestedAt=row.cancel_requested_at||o.cancelRequestedAt||null; o.cancelReason=row.cancel_reason||o.cancelReason||''; o.cancelStatus=row.cancel_status||o.cancelStatus||''; o.cancelDecidedAt=row.cancel_decided_at||o.cancelDecidedAt||null; o.cancelAdminNote=row.cancel_admin_note||o.cancelAdminNote||'';
      const newEta=(o.estimatedReadyAt||'')+'|'+(o.estimatedMinutes||'')+'|'+(o.adminCustomerNote||'');
      const newCancel=(o.cancelStatus||'')+'|'+(o.cancelRequestedAt||'')+'|'+(o.cancelAdminNote||'');
      if(o.status!==old){ notifyOrderStatusIfNeeded(o,o.status); changed=true; }
      else if(newEta!==oldEta && (o.estimatedReadyAt||o.estimatedMinutes||o.adminCustomerNote)){ notifyOrderEtaIfNeeded(o); changed=true; }
      if(newCancel!==oldCancel && (o.cancelRequestedAt||o.cancelStatus)){ notifyCancellationUpdateIfNeeded(o); changed=true; }
    }catch(e){ console.warn('Order status sync failed', e.message||e); }
  }
  if(changed){ saveCustomerOrders(orders); renderCustomerOrderStatus(); renderInboxBadge(); }
}
function renderCustomerOrderStatus(){
  const box=document.getElementById('customerOrderStatus'); if(!box) return;
  const orders=customerOrders().filter(o=>o.cloudId||o.cloudOrderToken).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,8);
  if(!orders.length){ box.innerHTML=''; return; }
  const notifState = ('Notification' in window) ? Notification.permission : 'unsupported';
  const notifLabel = notifState==='granted' ? (state.lang==='hr'?'Order alerts enabled':'Order alerts enabled') : (state.lang==='hr'?'Enable order alerts':'Enable order alerts');
  box.innerHTML=`<div class="my-orders-card enhanced-orders"><h4>${state.lang==='hr'?'Moje zadnje narudžbe':'My recent orders'}</h4><p class="muted mini">${state.lang==='hr'?'Kada ste prijavljeni, Cloud narudžbe se sinkroniziraju na svim uređajima. Guest narudžbe ostaju samo na uređaju na kojem su poslane.':'When you are logged in, Cloud orders sync across all devices. Guest orders stay only on the device that placed them.'}</p><div class="order-status-actions"><button type="button" class="secondary" id="enableOrderAlerts">${notifLabel}</button></div>${orders.map(o=>{ const eta=formatOrderEta(o); const c=orderCountdownInfo(o); const visibleItems=(o.items||[]).slice(0,3).map(i=>escapeHtml((i.qty||1)+' × '+(i.nameSnapshot||i.name||i.id))).join('<br>'); const cancelText=orderCancelText(o); return `<div class="my-order-line enhanced ${isTerminalOrder(o.status)?'terminal':''}"><div class="my-order-main"><b class="my-order-number">${escapeHtml(o.cloudOrderNumber||o.id)}</b><small>${new Date(o.createdAt).toLocaleString()}${o.tableNumber?` · Table ${escapeHtml(o.tableNumber)}`:''}${o.type?` · ${escapeHtml(o.type)}`:''}</small>${visibleItems?`<small class="my-order-items">${visibleItems}</small>`:''}${eta?`<small class="order-eta-line">${escapeHtml(eta)}</small>`:''}${c?`<div class="order-countdown ${c.expired?'expired':''}">⏱ ${escapeHtml(c.text)}</div>`:''}${cancelText?`<small class="order-cancel-line ${escapeHtml(o.cancelStatus||'requested')}">${escapeHtml(cancelText)}</small>`:''}${canRequestCancel(o)?`<button type="button" class="secondary subtle order-cancel-btn" data-request-cancel="${escapeHtml(o.id)}">${state.lang==='hr'?'Zatraži otkazivanje':'Request cancellation'}</button>`:''}</div><span class="status-badge ${escapeHtml(o.status||'new')}">${orderStatusText(o.status||'new')}</span></div>`; }).join('')}<button type="button" class="secondary full" id="refreshMyOrders">${state.lang==='hr'?'Osvježi status':'Refresh status'}</button></div>`;
  const btn=document.getElementById('refreshMyOrders'); if(btn) btn.onclick=async()=>{ await syncCustomerOrderStatuses(); alert(state.lang==='hr'?'Status je osvježen.':'Status refreshed.'); };
  const alertBtn=document.getElementById('enableOrderAlerts'); if(alertBtn) alertBtn.onclick=async()=>{ await requestOrderStatusNotifications({}); renderCustomerOrderStatus(); alert(state.lang==='hr'?'Ako je dozvola uključena, obavijesti za narudžbu su aktivne na ovom uređaju.':'If permission is enabled, order alerts are active on this device.'); };
  document.querySelectorAll('[data-request-cancel]').forEach(b=>b.onclick=()=>requestOrderCancellation(b.dataset.requestCancel));
}

function updateOrderTypeFields(){
  const type=state.orderType;
  const tableWrap=$('#orderTableWrap');
  const addressWrap=$('#orderAddressWrap');
  const nameInput=$('#orderName');
  const phoneInput=$('#orderPhone');
  if(tableWrap) tableWrap.classList.toggle('hidden', type!=='dine_in');
  if(addressWrap) addressWrap.classList.toggle('hidden', type!=='delivery');
  if(nameInput){ nameInput.required = type!=='dine_in'; nameInput.placeholder = type==='dine_in' ? 'Optional / nije obavezno' : 'Name / Ime'; }
  if(phoneInput){ phoneInput.required = type!=='dine_in'; phoneInput.placeholder = type==='dine_in' ? 'Optional / nije obavezno' : '+385...'; }
  const note=$('#orderModeNote');
  if(note){
    note.textContent = type==='dine_in'
      ? (state.lang==='hr'?'Za narudžbu u kafiću nije potrebna registracija. Dovoljan je broj stola.':'No registration is needed for in-café table ordering. Table number is enough.')
      : (state.lang==='hr'?'Za pick-up/delivery status ostaje vidljiv na ovom uređaju. Uključite obavijesti ako želite poruke o statusu.':'For pick-up/delivery, status remains visible on this device. Enable notifications to receive order updates.');
  }
}
function renderAll(){ renderCategoryTabs(); renderMenu(); renderOrderCategoryTabs(); renderOrderMenu(); renderCart(); renderDashboard(); renderHomeMarketing(); renderPublicFeedback(); renderAppQr(); renderInboxBadge(); renderReservationCalendar(); renderEventCalendar(); renderSushiPreorder(); updateOrderTypeFields(); renderCustomerOrderStatus(); }
function setupEvents(){
  attachNav();
  const back=$('#backBtn'); if(back) back.onclick=goBack; const refInput=document.querySelector('[name="referralCode"]'); if(refInput && localStorage.langar_pending_referral && !refInput.value) refInput.value=localStorage.langar_pending_referral;
  $('#langBtn').onclick=()=>setLang(state.lang==='hr'?'en':'hr');
  $$('.segmented [data-order-type]').forEach(b=>b.onclick=()=>{$$('.segmented button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); state.orderType=b.dataset.orderType; updateOrderTypeFields();}); updateOrderTypeFields();
  $('#closeModal').onclick=()=>$('#modal').classList.add('hidden');
  $('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden')};
  $('#inboxBtn').onclick=()=>{renderInbox(); markInboxAllRead(); renderInbox(); $('#inboxPanel').classList.remove('hidden')};
  $('#closeInbox').onclick=()=>$('#inboxPanel').classList.add('hidden');
  $('#closePopup').onclick=$('#popupLater').onclick=()=>{ $('#welcomePopup').classList.add('hidden'); localStorage.langar_popup_closed='1';};
  $('#clubForm').onsubmit=e=>{
    if(window.LangarCloudAuth){ e.preventDefault(); return; }
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
  $('#submitOrder').onclick=async()=>{
    if(!state.cart.length)return alert(T[state.lang].emptyCart);
    if(state.orderType==='dine_in' && !$('#orderTable')?.value.trim()) return alert(state.lang==='hr'?'Unesite broj stola.':'Please enter table number.');
    if(state.orderType!=='dine_in' && !$('#orderName')?.value.trim()) return alert(state.lang==='hr'?'Unesite ime za pick-up/delivery.':'Please enter name for pick-up/delivery.');
    if(state.orderType!=='dine_in' && !$('#orderPhone')?.value.trim()) return alert(state.lang==='hr'?'Unesite telefon za pick-up/delivery.':'Please enter phone number for pick-up/delivery.');
    if(state.orderType==='delivery' && !$('#orderAddress')?.value.trim()) return alert(state.lang==='hr'?'Unesite adresu dostave.':'Please enter delivery address.');
    const total=state.cart.reduce((sum,it)=>sum+priceNum(it.price)*it.qty,0);
    const order={id:uid('ORD'),status:'new',paid:false,type:state.orderType,tableNumber:$('#orderTable')?.value.trim()||'',name:$('#orderName').value,phone:$('#orderPhone').value,address:$('#orderAddress').value,note:$('#orderNote').value,items:state.cart.map(it=>({...it, nameSnapshot:itemName(it,'en'), nameSnapshotHr:itemName(it,'hr')})),total:+total.toFixed(2),referredBy:profile()?.referredBy||null,createdAt:new Date().toISOString()};
    const orders=LS.get('langar_orders_v3',[]); orders.unshift(order); LS.set('langar_orders_v3',orders);
    let cloudOk=false;
    let cloudError='';
    if(window.LangarOrderCloud && typeof window.LangarOrderCloud.submitOrder==='function'){
      const btn=$('#submitOrder'); const oldText=btn.textContent; btn.disabled=true; btn.textContent=state.lang==='hr'?'Šaljem narudžbu...':'Sending order...';
      try{ const res=await window.LangarOrderCloud.submitOrder(order); cloudOk=!!res?.ok; if(res?.id) order.cloudId=res.id; if(res?.order_number) order.cloudOrderNumber=res.order_number; if(res?.order_token) order.cloudOrderToken=res.order_token; if(res?.status) order.status=res.status; const saved=LS.get('langar_orders_v3',[]); const idx=saved.findIndex(x=>x.id===order.id); if(idx>=0){ saved[idx]=order; LS.set('langar_orders_v3',saved); } }
      catch(err){ cloudError = err?.message || String(err); console.warn('Cloud order submit failed', err); }
      btn.disabled=false; btn.textContent=oldText;
    } else {
      cloudError = 'Order Cloud module is not loaded.';
    }
    if(!cloudOk){
      alert((state.lang==='hr'?'Narudžba nije poslana u Cloud/Admin tablet. Košarica je ostala spremljena za ponovni pokušaj. Greška: ':'Order was not sent to Cloud/Admin tablet. Cart stays available for retry. Run the latest V4.5.0 SQL if you still see a Cloud/RLS error. Error: ') + cloudError);
      return;
    }
    state.cart=[]; renderCart(); renderCustomerOrderStatus(); syncCustomerOrderStatuses(); addInbox({id:uid('msg'),type:'message',title:state.lang==='hr'?'Narudžba je poslana':'Order sent',body:state.lang==='hr'?`Vaša narudžba ${order.cloudOrderNumber||order.id} je poslana kafiću. Status možete pratiti u aplikaciji.`:`Your order ${order.cloudOrderNumber||order.id} was sent to the café. You can follow the status in the app.`,unread:true,createdAt:new Date().toISOString()});
    await requestOrderStatusNotifications(order);
    if(window.LangarOrderCloud?.syncAccountOrders) window.LangarOrderCloud.syncAccountOrders().then(()=>renderCustomerOrderStatus()).catch(()=>{});
    alert(state.lang==='hr'?'Narudžba je poslana kafiću i vidljiva je na admin tabletu. Status možete pratiti u aplikaciji.':'Order was sent to the café and is visible on the admin tablet. You can follow the status in the app.');
  };
  if(!localStorage.langar_popup_closed) setTimeout(()=>$('#welcomePopup').classList.remove('hidden'),800);
  updateBackButton();
}
const urlRef=new URLSearchParams(location.search).get('ref'); if(urlRef) localStorage.langar_pending_referral=urlRef; ensureWelcomeInbox(); setupEvents(); setLang(state.lang); setInterval(syncCustomerOrderStatuses, 10000); setInterval(()=>{ if(hasActiveOrderCountdown()) renderCustomerOrderStatus(); }, 1000); setTimeout(syncCustomerOrderStatuses, 1200); if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{})); }
