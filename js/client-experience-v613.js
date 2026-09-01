(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
let poll=null,options=[],voteCounts={},patchedInterest=false,syncing=false,lastSync=0;
const client=()=>window.LangarCloud?.client||null;
const lang=()=>localStorage.langar_lang||document.documentElement.lang||'hr';
const t=(hr,en)=>lang()==='hr'?hr:en;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function setLS(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
function getLS(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}
function eventMap(x){const date=x.event_date||'Coming soon',time=x.start_time?String(x.start_time).slice(0,5):'';return {id:x.id,cloudId:x.id,icon:x.icon||'✦',active:x.status==='published',title:{en:x.title_en||'',hr:x.title_hr||x.title_en||''},date,time,body:{en:x.full_description_en||x.short_description_en||'',hr:x.full_description_hr||x.short_description_hr||x.full_description_en||''},capacity:x.capacity||null,imageUrl:x.image_url||null,status:x.status};}
async function syncExperience(force=false){
  const c=client();if(!c||syncing)return;if(!force&&Date.now()-lastSync<20000)return;syncing=true;
  try{
    const [evRes,dayRes,pollRes]=await Promise.all([
      c.from('events').select('id,title_en,title_hr,short_description_en,short_description_hr,full_description_en,full_description_hr,icon,image_url,event_date,start_time,end_time,capacity,status').eq('status','published').order('event_date',{ascending:true,nullsFirst:false}).order('start_time',{ascending:true}),
      c.from('daily_surprises').select('id,title_en,title_hr,body_en,body_hr,valid_date,active,created_at').eq('active',true).order('created_at',{ascending:false}).limit(1),
      c.from('flavor_polls').select('id,question_en,question_hr,status,created_at').eq('status','active').order('created_at',{ascending:false}).limit(1)
    ]);
    if(!evRes.error&&evRes.data){setLS('langar_events',evRes.data.map(eventMap));}
    if(!dayRes.error&&dayRes.data?.[0]){const d=dayRes.data[0];setLS('langar_daily_surprise',{cloudId:d.id,title:{en:d.title_en,hr:d.title_hr||d.title_en},body:{en:d.body_en||'',hr:d.body_hr||d.body_en||''},validDate:d.valid_date||null});}
    if(!pollRes.error&&pollRes.data?.[0]){
      poll=pollRes.data[0];
      const o=await c.from('flavor_poll_options').select('id,poll_id,label_en,label_hr,sort_order').eq('poll_id',poll.id).order('sort_order');options=o.error?[]:(o.data||[]);
      const r=await c.rpc('public_flavor_poll_results',{p_poll_id:poll.id});voteCounts={};(r.data||[]).forEach(x=>voteCounts[x.option_id]=Number(x.vote_count||0));
      setLS('langar_poll',{cloudId:poll.id,question:{en:poll.question_en,hr:poll.question_hr||poll.question_en},options:options.map(x=>lang()==='hr'?(x.label_hr||x.label_en):x.label_en),optionIds:options.map(x=>x.id),votes:voteCounts});
    }
    lastSync=Date.now();
    try{if(typeof window.renderAll==='function')window.renderAll();else if(typeof window.renderHomeMarketing==='function')window.renderHomeMarketing()}catch{}
    setTimeout(()=>renderCloudPoll(),80);
    patchInterest();
  }catch(e){console.warn('[V613 experience sync]',e?.message||e)}finally{syncing=false}
}
function patchInterest(){
  if(patchedInterest||typeof window.saveEventInterest!=='function')return;const original=window.saveEventInterest;window.saveEventInterest=function(ev){
    const ret=original.apply(this,arguments);saveInterestCloud(ev).catch(e=>console.warn('[V613 event interest]',e?.message||e));return ret;
  };patchedInterest=true;
}
async function saveInterestCloud(ev){
  const c=client();if(!c||!ev?.id)return;const {data}=await c.auth.getSession();const uid=data.session?.user?.id;if(!uid)return;
  const {error}=await c.from('event_interests').upsert({event_id:ev.id,user_id:uid,status:'interested'},{onConflict:'event_id,user_id'});if(error)throw error;
}
async function vote(optionId){
  const c=client();if(!c||!poll?.id)return;const {data}=await c.auth.getSession();const uid=data.session?.user?.id;if(!uid){alert(t('Za glasovanje se prijavite u Langar Club.','Please log in to Langar Club to vote.'));return;}
  const old=await c.from('flavor_poll_votes').select('id').eq('poll_id',poll.id).eq('user_id',uid).maybeSingle();if(old.data?.id)await c.from('flavor_poll_votes').delete().eq('id',old.data.id);
  const {error}=await c.from('flavor_poll_votes').insert({poll_id:poll.id,option_id:optionId,user_id:uid});if(error){alert(t('Glas nije spremljen: ','Vote could not be saved: ')+error.message);return;}
  const r=await c.rpc('public_flavor_poll_results',{p_poll_id:poll.id});voteCounts={};(r.data||[]).forEach(x=>voteCounts[x.option_id]=Number(x.vote_count||0));renderCloudPoll();
}
function renderCloudPoll(){
  if(!poll||!options.length)return;const hub=$('#homeMarketingHub');if(!hub)return;let card=$('#v613CloudPoll');if(!card){card=document.createElement('section');card.id='v613CloudPoll';card.className='v613-cloud-poll';const anchor=hub.querySelector('.experience-grid');anchor?.after(card);if(!anchor)hub.prepend(card);}
  const total=options.reduce((s,o)=>s+(voteCounts[o.id]||0),0);
  card.innerHTML=`<div class="v613-poll-head"><span>🗳️</span><div><b>${esc(lang()==='hr'?(poll.question_hr||poll.question_en):poll.question_en)}</b><small>${t('Glasajte za sljedeći okus','Vote for the next flavor')}</small></div></div><div class="v613-poll-options">${options.map(o=>{const n=voteCounts[o.id]||0,p=total?Math.round(n*100/total):0,label=lang()==='hr'?(o.label_hr||o.label_en):o.label_en;return `<button type="button" data-cloud-poll-option="${esc(o.id)}"><span>${esc(label)}</span><b>${p}%</b><i style="--p:${p}%"></i></button>`}).join('')}</div><small class="v613-poll-total">${total} ${t('glasova','votes')}</small>`;
  $$('[data-cloud-poll-option]',card).forEach(b=>b.onclick=()=>vote(b.dataset.cloudPollOption));
}
function injectCss(){if($('#v613ExperienceCss'))return;const s=document.createElement('style');s.id='v613ExperienceCss';s.textContent=`.v613-cloud-poll{margin:16px 0;padding:14px;border:1px solid rgba(216,178,74,.35);border-radius:20px;background:linear-gradient(145deg,rgba(18,63,46,.78),rgba(7,18,14,.9));box-shadow:0 12px 28px rgba(0,0,0,.2)}.v613-poll-head{display:flex;gap:10px;align-items:center;margin-bottom:10px}.v613-poll-head>span{font-size:1.6rem}.v613-poll-head b,.v613-poll-head small{display:block}.v613-poll-head small{color:var(--muted);margin-top:2px}.v613-poll-options{display:grid;gap:7px}.v613-poll-options button{position:relative;overflow:hidden;display:flex;justify-content:space-between;gap:12px;padding:11px 12px;border-radius:14px;border:1px solid rgba(216,178,74,.22);background:rgba(255,255,255,.05);color:#fff;text-align:left;font-weight:800}.v613-poll-options button i{position:absolute;left:0;bottom:0;height:3px;width:var(--p);background:#d8b24a;transition:width .3s ease}.v613-poll-options button b{color:#d8b24a}.v613-poll-total{display:block;margin-top:8px;color:var(--muted)}`;document.head.appendChild(s)}
function boot(){injectCss();let n=0;const tmr=setInterval(()=>{n++;if(client()){clearInterval(tmr);syncExperience(true)}else if(n>40)clearInterval(tmr)},250);setInterval(()=>{if(!document.hidden)syncExperience(false)},30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncExperience(true)});new MutationObserver(()=>{patchInterest();if(poll)renderCloudPoll()}).observe(document.body,{subtree:true,childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.LangarExperienceV613={sync:syncExperience,version:'6.1.3'};
})();
