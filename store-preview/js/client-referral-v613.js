(()=>{
'use strict';
const client=()=>window.LangarCloud?.client||null;
function readProfile(){try{return JSON.parse(localStorage.langar_profile||'{}')}catch{return {}}}
function candidate(){const p=readProfile();return String(localStorage.langar_pending_referral||p.referralCodeInput||p.referredBy||'').trim()}
async function claim(){const c=client();if(!c)return {ok:false,reason:'cloud_unavailable'};const {data}=await c.auth.getSession();if(!data.session?.user)return {ok:false,reason:'not_logged_in'};const code=candidate();if(!code)return {ok:false,reason:'no_code'};const done=localStorage.langar_referral_claimed_v613;if(done&&done.toUpperCase()===code.toUpperCase())return {ok:true,already:true};const {data:r,error}=await c.rpc('claim_referral_code_v613',{p_code:code});if(error){console.warn('[V613 referral]',error.message);return {ok:false,error};}localStorage.langar_referral_claimed_v613=code.toUpperCase();localStorage.removeItem('langar_pending_referral');return {ok:true,data:r}}
function boot(){let tries=0;const tm=setInterval(async()=>{tries++;const r=await claim();if(r.ok||tries>40)clearInterval(tm)},500);window.addEventListener('langar-auth-ready',claim);document.addEventListener('visibilitychange',()=>{if(!document.hidden)claim()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.LangarReferralV613={claim,version:'6.1.3'};
})();
