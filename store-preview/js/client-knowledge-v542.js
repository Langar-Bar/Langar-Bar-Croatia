(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const cloud=()=>window.langarSupabase||window.supabaseClient||window.sb||window.LangarCloud?.client||null;
const lang=()=>localStorage.langar_lang==='en'?'en':'hr';
const fmt=n=>n==null||n===''?'—':Number(n).toLocaleString(undefined,{maximumFractionDigits:1});
let busy=false;
function answerCard({title,answer,knowledge}){
 const L=lang(),k=knowledge||{},recipe=k.recipe||{};
 return `<article class="smart-answer-card v542-answer"><div class="answer-badge">Langar Bar Drink Guide</div>${title?`<h3>${esc(title)}</h3>`:''}<p class="v542-answer-text">${esc(answer||'')}</p>${Object.keys(recipe).length?`<div class="recipe-grid"><span><b>${L==='hr'?'Kava':'Coffee'}</b>${fmt(recipe.coffee_g)} g</span><span><b>Espresso</b>${fmt(recipe.espresso_ml)} ml</span><span><b>${L==='hr'?'Voda':'Water'}</b>${fmt(recipe.water_ml)} ml</span><span><b>${L==='hr'?'Mlijeko':'Milk'}</b>${fmt(recipe.milk_ml)} ml</span><span><b>${L==='hr'?'Pjena':'Foam'}</b>${fmt(recipe.foam_ml)} ml</span><span><b>${L==='hr'?'Šalica':'Cup'}</b>${fmt(recipe.cup_ml)} ml</span></div>`:''}${k.allergen_note?`<div class="allergen-note">⚠️ ${esc(k.allergen_note)}</div>`:''}<small>${L==='hr'?'Automatski odgovor iz provjerene baze znanja Langar Bara.':'Automatic answer from Langar Bar’s verified knowledge base.'}</small></article>`;
}
async function session(){const c=cloud();if(!c)return null;return (await c.auth.getSession()).data.session||null}
async function history(){
 const box=document.getElementById('myBaristaQuestions'),c=cloud();if(!box||!c)return;
 const s=await session();if(!s){box.innerHTML='<p class="muted">Sign in to see your question history.</p>';return}
 const {data,error}=await c.rpc('list_my_barista_questions_v541');
 if(error){box.innerHTML=`<p class="error">${esc(error.message)}</p>`;return}
 box.innerHTML=(data||[]).map(q=>`<article class="question-thread" data-question-id="${esc(q.id)}"><div class="thread-head"><div class="thread-status ${esc(q.status||'new')}">${esc(q.status||'new')}</div><button type="button" class="v542-delete-question" data-delete-question="${esc(q.id)}" aria-label="Delete">🗑 ${lang()==='hr'?'Obriši':'Delete'}</button></div><h4>${esc(q.subject||'Question')}</h4><p class="thread-question"><b>${lang()==='hr'?'Vaše pitanje':'Your question'}:</b><br>${esc(q.question)}</p>${q.answer?`<div class="thread-answer"><b>${q.answer_source==='knowledge'?'Langar Bar Drink Guide':'Langar Bar Barista'}</b><p>${esc(q.answer)}</p></div>`:'<p class="muted">Waiting for the Langar Bar team.</p>'}<small>${new Date(q.created_at).toLocaleString()}</small></article>`).join('')||'<p class="muted">No questions yet.</p>';
 box.querySelectorAll('[data-delete-question]').forEach(b=>b.addEventListener('click',deleteQuestion));
}
async function deleteQuestion(e){
 const id=e.currentTarget.dataset.deleteQuestion,c=cloud();
 if(!id||!c)return;
 const ok=confirm(lang()==='hr'?'Obrisati ovo pitanje i odgovor iz vašeg računa?':'Delete this question and answer from your account?');if(!ok)return;
 e.currentTarget.disabled=true;
 const {error}=await c.rpc('delete_my_barista_question_v542',{p_question_id:id});
 if(error){alert(error.message);e.currentTarget.disabled=false;return}
 e.currentTarget.closest('.question-thread')?.remove();
 if(!document.querySelector('#myBaristaQuestions .question-thread')) document.getElementById('myBaristaQuestions').innerHTML='<p class="muted">No questions yet.</p>';
}
async function suggested(){
 const c=cloud(),host=document.getElementById('askBaristaForm');if(!c||!host)return;
 document.getElementById('v542SuggestedQuestions')?.remove();
 const {data,error}=await c.rpc('list_suggested_barista_questions_v542',{p_lang:lang(),p_limit:50});if(error||!data?.length)return;
 const wrap=document.createElement('section');wrap.id='v542SuggestedQuestions';wrap.className='v541-suggested';
 wrap.innerHTML=`<h3>${lang()==='hr'?'Popularna pitanja':'Popular questions'}</h3><p>${lang()==='hr'?'Dodirnite pitanje za trenutačan odgovor.':'Tap a question for an instant answer.'}</p><div class="v541-question-chips">${data.map(x=>`<button type="button" data-faq-id="${esc(x.faq_id)}" data-q="${esc(x.question)}">${esc(x.question)}</button>`).join('')}</div>`;
 host.parentNode.insertBefore(wrap,host);
 wrap.querySelectorAll('[data-faq-id]').forEach(b=>b.addEventListener('click',openSuggested));
}
async function openSuggested(e){
 e.preventDefault();e.stopImmediatePropagation();if(busy)return;busy=true;
 const b=e.currentTarget,c=cloud(),box=document.getElementById('smartBaristaAnswer');b.disabled=true;box?.classList.remove('hidden');if(box)box.innerHTML='<p class="muted">Loading verified answer…</p>';
 try{
   const {data,error}=await c.rpc('answer_suggested_barista_question_v542',{p_faq_id:b.dataset.faqId,p_lang:lang()});if(error)throw error;
   const r=Array.isArray(data)?data[0]:data;
   if(box)box.innerHTML=answerCard({title:r.question,answer:r.answer,knowledge:{recipe:{}}});
   await history();box?.scrollIntoView({behavior:'smooth',block:'start'});
 }catch(err){if(box)box.innerHTML=`<p class="error">${esc(err.message||err)}</p>`}finally{b.disabled=false;busy=false}
}
async function submit(e){
 e.preventDefault();e.stopImmediatePropagation();if(busy)return;busy=true;
 const f=e.currentTarget,c=cloud(),box=document.getElementById('smartBaristaAnswer'),btn=f.querySelector('button[type="submit"],button');
 if(!c){busy=false;return alert('Cloud connection is not ready.')}
 const s=await session();if(!s){busy=false;return alert('Please sign in first.')}
 const fd=new FormData(f),q=String(fd.get('question')||'').trim(),topic=String(fd.get('topic')||'Drink question');if(!q){busy=false;return}
 btn.disabled=true;box?.classList.remove('hidden');if(box)box.innerHTML='<p class="muted">Searching verified Langar Bar knowledge…</p>';
 try{
   const {data,error}=await c.rpc('smart_barista_ask_v542',{p_question:q,p_subject:topic,p_lang:lang()});if(error)throw error;
   const r=Array.isArray(data)?data[0]:data;
   if(r?.matched){if(box)box.innerHTML=answerCard({title:r.title,answer:r.answer,knowledge:r.knowledge||{}})}
   else if(box)box.innerHTML=`<article class="smart-answer-card"><h3>${lang()==='hr'?'Poslano baristi':'Sent to our barista'}</h3><p>${lang()==='hr'?'Nismo pronašli dovoljno siguran odgovor. Vaše pitanje je spremljeno i naš tim će odgovoriti u istoj niti.':'We did not find a sufficiently reliable answer. Your question has been saved and our team will reply in the same thread.'}</p></article>`;
   f.reset();await history();box?.scrollIntoView({behavior:'smooth',block:'start'});
 }catch(err){if(box)box.innerHTML=`<p class="error">${esc(err.message||err)}</p>`}finally{btn.disabled=false;busy=false}
}
function init(){
 const f=document.getElementById('askBaristaForm');if(f&&!f.dataset.v542){f.dataset.v542='1';f.addEventListener('submit',submit,true)}
 history();suggested();
 document.querySelectorAll('[data-go="ask-barista"]').forEach(n=>{if(!n.dataset.v542){n.dataset.v542='1';n.addEventListener('click',()=>setTimeout(()=>{history();suggested()},180))}})
}
document.addEventListener('DOMContentLoaded',init);setTimeout(init,1400);window.LangarKnowledgeV542={history,suggested};
})();
