const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const LS = {
  get(k, d){ try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d} },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};
const ICONS = {
  'cat-coffee':'☕',
  'cat-tea':'🍵',
  'cat-matcha-smoothies':'🥤',
  'cat-protein':'💪',
  'cat-soft':'🧃',
  'cat-beer-wine':'🍷',
  'cat-combo':'🥐',
  'cat-dessert':'🧁',
  'cat-toast':'🥖',
  'cat-tacos':'🌮',
  'cat-focaccia-pizza':'🍕',
  'cat-tapas':'🫒'
};
const T = {
  hr:{ tap:'Kliknite za sastojke', ingredients:'Sastojci', add:'Add', emptyCart:'Košarica je prazna.', orderSaved:'Narudžba je poslana u Admin Orders.', eligible:'Eligible for Langar Credit', alcoholic:'18+', unavailable:'Trenutno nedostupno', notOrderable:'Nije dostupno za online narudžbu', welcome:'Dobrodošli', join:'Učlani se', noProfile:'Još niste član Langar Cluba.'},
  en:{ tap:'Tap for ingredients', ingredients:'Ingredients', add:'Add', emptyCart:'Your cart is empty.', orderSaved:'Order was sent to Admin Orders.', eligible:'Eligible for Langar Credit', alcoholic:'18+', unavailable:'Currently unavailable', notOrderable:'Not available for online ordering', welcome:'Welcome', join:'Join now', noProfile:'You are not a Langar Club member yet.'}
};
let state = { lang: localStorage.langar_lang || 'hr', activeCat:'cat-coffee', activeOrderCat:'cat-coffee', cart:[], orderType:'pickup' };
function getMenu(){
  const normalize = menu => menu.map(c=>({...c, icon:ICONS[c.id]||c.icon||'✦', items:c.items.map(i=>({...i, allergens:i.allergens || (i.isAlcoholic?'18+':(i.desc.en.toLowerCase().includes('milk')||i.desc.en.toLowerCase().includes('mozzarella')?'milk / gluten possible':'ask staff'))}))}));
  const stored=LS.get('langar_menu_v3', null);
  if(stored) return normalize(stored);
  const m=normalize(LANGAR_DEFAULT_MENU);
  LS.set('langar_menu_v3',m);
  return m;
}
function saveMenu(m){ LS.set('langar_menu_v3',m); }
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
function categoryButton(cat, active, cb){ const count=cat.items.filter(i=>i.available!==false).length; const btn=document.createElement('button'); btn.className='cat-tab '+(active?'active':''); btn.innerHTML=`<span class="cat-icon">${cat.icon||'✦'}</span><b>${cat.title[state.lang]}</b><small>${count}</small>`; btn.onclick=cb; return btn; }
function renderCategoryTabs(){ const tabs=$('#categoryTabs'); if(!tabs) return; tabs.innerHTML=''; const cats=activeCategories(); if(!cats.find(c=>c.id===state.activeCat)&&cats[0]) state.activeCat=cats[0].id; cats.forEach(cat=>tabs.appendChild(categoryButton(cat, cat.id===state.activeCat, ()=>{state.activeCat=cat.id;renderCategoryTabs();renderMenu();}))); }
function renderOrderCategoryTabs(){ const tabs=$('#orderCategoryTabs'); if(!tabs) return; tabs.innerHTML=''; const cats=activeCategories().filter(c=>c.items.some(i=>i.available!==false&&i.orderable!==false)); if(!cats.find(c=>c.id===state.activeOrderCat)&&cats[0]) state.activeOrderCat=cats[0].id; cats.forEach(cat=>tabs.appendChild(categoryButton(cat, cat.id===state.activeOrderCat, ()=>{state.activeOrderCat=cat.id;renderOrderCategoryTabs();renderOrderMenu();}))); }
function itemNode(item, orderMode=false){ const node=document.createElement('article'); node.className='menu-item'; const disabled=orderMode&&item.orderable===false; node.innerHTML=`<div class="item-main"><h4>${item.name}</h4><p class="hint">${T[state.lang].tap}</p>${item.isAlcoholic?`<span class="tag">${T[state.lang].alcoholic}</span>`:''}</div><div class="item-side"><div class="price">${item.price}</div>${orderMode&&!disabled?`<button class="secondary addBtn">${T[state.lang].add}</button>`:''}${disabled?`<p class="muted">${T[state.lang].notOrderable}</p>`:''}</div>`; node.onclick=e=>{ if(e.target.classList.contains('addBtn')){e.stopPropagation();addToCart(item);return;} openDetails(item, orderMode); }; return node; }
function openDetails(item, orderMode){ $('#modalBody').innerHTML=`<div class="detail-row"><div><h2>${item.name}</h2><p class="price">${item.price}</p></div>${orderMode&&item.orderable!==false?`<button class="primary addFromModal">${T[state.lang].add}</button>`:''}</div><div class="ingredients-box"><h4>${T[state.lang].ingredients}</h4><p><b>HR:</b> ${item.desc.hr}</p><p><b>EN:</b> ${item.desc.en}</p></div><p class="muted"><b>Allergens:</b> ${item.allergens||'Ask staff'}</p>${item.rewardEligible!==false?`<p class="tag">${T[state.lang].eligible}</p>`:''}${item.isAlcoholic?`<p class="tag">${state.lang==='hr'?'Samo za osobe 18+. Osoblje može zatražiti osobni dokument.':'18+ only. Staff may request ID.'}</p>`:''}`; const btn=$('#modalBody .addFromModal'); if(btn) btn.onclick=()=>{addToCart(item);$('#modal').classList.add('hidden')}; $('#modal').classList.remove('hidden'); }
function renderMenu(){ const cats=activeCategories(); const cat=cats.find(c=>c.id===state.activeCat)||cats[0]; const list=$('#menuList'); if(!cat||!list)return; list.innerHTML=`<section class="selected-cat"><div class="big-icon">${cat.icon}</div><div><h3>${cat.title[state.lang]}</h3><p>${cat.description?.[state.lang]||''}</p></div></section><div class="item-list"></div>`; const items=list.querySelector('.item-list'); cat.items.filter(i=>i.available!==false).forEach(i=>items.appendChild(itemNode(i,false))); }
function renderOrderMenu(){ const cats=activeCategories().filter(c=>c.items.some(i=>i.available!==false&&i.orderable!==false)); const cat=cats.find(c=>c.id===state.activeOrderCat)||cats[0]; const wrap=$('#orderMenu'); if(!cat||!wrap)return; wrap.innerHTML=`<section class="selected-cat"><div class="big-icon">${cat.icon}</div><div><h3>${cat.title[state.lang]}</h3><p>${cat.description?.[state.lang]||''}</p></div></section><div class="item-list"></div>`; const items=wrap.querySelector('.item-list'); cat.items.filter(i=>i.available!==false&&i.orderable!==false).forEach(i=>items.appendChild(itemNode(i,true))); }
function addToCart(item){ const found=state.cart.find(x=>x.id===item.id); if(found) found.qty++; else state.cart.push({...item, qty:1}); renderCart(); }
function renderCart(){ const c=$('#cartItems'); if(!c)return; if(!state.cart.length){ c.textContent=T[state.lang].emptyCart; $('#cartTotal').textContent='€0.00'; return;} c.innerHTML=''; let total=0; state.cart.forEach((it,idx)=>{ const lt=priceNum(it.price)*it.qty; total+=lt; const line=document.createElement('div'); line.className='cart-line'; line.innerHTML=`<span>${it.qty} × ${it.name}</span><b>€${lt.toFixed(2)}</b><button>×</button>`; line.querySelector('button').onclick=()=>{state.cart.splice(idx,1);renderCart();}; c.appendChild(line);}); $('#cartTotal').textContent=`€${total.toFixed(2)}`; }
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
function renderHomeCats(){ const wrap=$('#homeCategoryPreview'); if(!wrap)return; const cats=activeCategories().slice(0,8); wrap.innerHTML='<h2>Explore Langar</h2><div class="icon-grid"></div>'; const grid=wrap.querySelector('.icon-grid'); cats.forEach(cat=>{ const b=document.createElement('button'); b.innerHTML=`<span>${cat.icon}</span><b>${cat.title[state.lang]}</b>`; b.onclick=()=>{ state.activeCat=cat.id; navigate('menu'); renderCategoryTabs(); renderMenu();}; grid.appendChild(b);}); }
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
function openPersonalQR(){ const p=profile(); if(!p) return; $('#modalBody').innerHTML=`<h2>Langar Club QR</h2><p class="muted">${state.lang==='hr'?'Ovaj QR služi za identifikaciju člana i skupljanje Langar Credit.':'This QR identifies the member and collects Langar Credit.'}</p><div class="qrbox"><b>${p.qr}</b><small>Member ID</small></div>`; $('#modal').classList.remove('hidden'); }
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
function renderReferral(){ const p=profile(); const wrap=$('#referralView'); if(!wrap)return; if(!p){wrap.innerHTML='<div class="empty-state">Register first to receive your referral QR.</div>'; return;} wrap.innerHTML=`<section class="qr-card"><h3>Your invite QR</h3><div class="qrbox"><b>REF-${p.qr}</b><small>Referral code</small></div><p>Reward rule: friend registers through your QR, places the first online order, pays, and the order is completed. Then you receive €0.50 Langar Credit.</p></section>`; }
function openInboxItem(item){
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
function renderInboxBadge(){ const unread=inbox().filter(x=>x.unread).length+cards().filter(c=>c.unread&&c.status==='active').length; $('#inboxBadge').textContent=unread; }
function renderInbox(){
  const list=[...cards().filter(c=>c.status==='active').map(c=>({...c,type:'card'})), ...inbox()];
  const box=$('#inboxList');
  if(!list.length){ box.innerHTML='<p class="muted">Inbox is empty.</p>'; return; }
  box.innerHTML='';
  list.forEach(item=>{ const a=document.createElement('article'); a.className='inbox-item clickable'; a.innerHTML=`<b>${item.title}</b><p>${item.body}</p><small>${new Date(item.createdAt).toLocaleString()}</small><span class="tap-note">${item.type==='card'?'Open card':'Open message'}</span>`; a.onclick=()=>openInboxItem(item); box.appendChild(a); });
}
function renderGallery(){ const g=$('#galleryView'); if(!g)return; const imgs=LS.get('langar_gallery',[{src:'assets/tacos_hero.jpeg',title:'Signature tacos',cat:'Tacos'},{src:'assets/prawn_tacos.jpeg',title:'Crunchy prawn tacos',cat:'Tacos'},{src:'assets/quesadilla_real.jpeg',title:'Quesadilla preview',cat:'Food'}]); g.innerHTML=imgs.map(i=>`<article><img src="${i.src}"><b>${i.title}</b><small>${i.cat}</small></article>`).join(''); }
function renderAll(){ renderCategoryTabs(); renderMenu(); renderOrderCategoryTabs(); renderOrderMenu(); renderCart(); renderDashboard(); renderHomeCats(); renderInboxBadge(); renderReservationCalendar(); }
function setupEvents(){
  attachNav();
  const back=$('#backBtn'); if(back) back.onclick=goBack;
  $('#langBtn').onclick=()=>setLang(state.lang==='hr'?'en':'hr');
  $$('.segmented [data-order-type]').forEach(b=>b.onclick=()=>{$$('.segmented button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); state.orderType=b.dataset.orderType;});
  $('#closeModal').onclick=()=>$('#modal').classList.add('hidden');
  $('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden')};
  $('#inboxBtn').onclick=()=>{renderInbox();$('#inboxPanel').classList.remove('hidden')};
  $('#closeInbox').onclick=()=>$('#inboxPanel').classList.add('hidden');
  $('#closePopup').onclick=$('#popupLater').onclick=()=>{ $('#welcomePopup').classList.add('hidden'); localStorage.langar_popup_closed='1';};
  $('#clubForm').onsubmit=e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(e.target).entries());
    const p={...data, id:uid('CUST'), qr:'LNG-'+Math.floor(100000+Math.random()*900000), credit:0, orders:0, visits:0, referrals:0, createdAt:new Date().toISOString()};
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
  const partnerForm=$('#partnerForm');
  if(partnerForm) partnerForm.onsubmit=e=>{ e.preventDefault(); const data=Object.fromEntries(new FormData(e.target).entries()); const list=LS.get('langar_partner_applications',[]); list.unshift({id:uid('PART'),status:'new',createdAt:new Date().toISOString(),...data}); LS.set('langar_partner_applications',list); e.target.reset(); alert(state.lang==='hr'?'Prijava je primljena. Dodatne informacije šaljemo nakon pregleda.':'Application received. More information will be sent after review.'); };
  const reservationDate=$('#reservationDate'); if(reservationDate) reservationDate.onchange=()=>{ $('#reservationTime').value=''; renderReservationCalendar();};
  $('#reservationForm').onsubmit=e=>{e.preventDefault(); const data=Object.fromEntries(new FormData(e.target).entries()); if(!data.time){ alert(state.lang==='hr'?'Molimo odaberite slobodan zeleni termin.':'Please choose an available green time slot.'); return; } if(isReservationSlotBooked(data.date,data.time)){ alert(state.lang==='hr'?'Ovaj termin je već zauzet. Odaberite drugi zeleni termin.':'This time slot is already booked. Please choose another green slot.'); renderReservationCalendar(); return; } const res=LS.get('langar_reservations',[]); res.unshift({id:uid('RES'),status:'pending',createdAt:new Date().toISOString(),...data}); LS.set('langar_reservations',res); alert(state.lang==='hr'?'Rezervacija je poslana. Termin je sada zauzet dok ga admin ne otkaže.':'Reservation sent. This time slot is now blocked unless admin cancels it.'); e.target.reset(); $('#reservationTime').value=''; renderReservationCalendar();};
  $('#submitOrder').onclick=()=>{ if(!state.cart.length)return alert(T[state.lang].emptyCart); const total=state.cart.reduce((s,it)=>s+priceNum(it.price)*it.qty,0); const orders=LS.get('langar_orders_v3',[]); orders.unshift({id:uid('ORD'),status:'new',paid:false,type:state.orderType,name:$('#orderName').value,phone:$('#orderPhone').value,address:$('#orderAddress').value,note:$('#orderNote').value,items:state.cart,total:+total.toFixed(2),createdAt:new Date().toISOString()}); LS.set('langar_orders_v3',orders); state.cart=[]; renderCart(); alert(T[state.lang].orderSaved);};
  if(!localStorage.langar_popup_closed) setTimeout(()=>$('#welcomePopup').classList.remove('hidden'),800);
  updateBackButton();
}
ensureWelcomeInbox(); setupEvents(); setLang(state.lang);
