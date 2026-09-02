(()=>{
'use strict';
const URL='https://fkanccgigogbxodiljqt.supabase.co',KEY='sb_publishable_WbWIWgu9R2AKepJiRrygCw_1oWrdwG7';
const client=window.supabase?.createClient?.(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}});if(!client)return;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function reviews(){const box=document.getElementById('publicFeedbackList');if(!box)return;const {data,error}=await client.from('public_reviews_v530').select('*').order('published_at',{ascending:false}).limit(30);if(error||!data?.length)return;box.innerHTML=data.map(r=>`<article class="review-card v530-review"><div class="v530-stars">${'★'.repeat(+r.rating||5)}</div><h4>${esc(r.item_name||'Langar Bar order')}</h4><p>${esc(r.comment||'')}</p><small>${esc(r.customer_name||'Langar guest')}</small></article>`).join('')}
window.addEventListener('load',()=>{setTimeout(reviews,900);setTimeout(reviews,2600)});
})();
