(()=>{
'use strict';
const client=()=>window.LangarAdminCloud?.client||window.LangarCloud?.client||window.langarSupabase||window.supabaseClient||window.sb||null;
function openBarista(){window.showPanel?.('baristaPanel');setTimeout(()=>{document.getElementById('baristaPanel')?.scrollIntoView({behavior:'smooth',block:'start'});window.LangarKnowledgeAdminV540?.render?.();document.querySelector('#baristaAdmin')?.scrollIntoView({behavior:'smooth',block:'start'})},100)}
// Correct legacy alert routing before older handlers send question alerts to Orders.
document.addEventListener('click',e=>{const btn=e.target.closest('.v520-alert .primary,.v532-alert .primary');if(!btn)return;const alert=btn.closest('.v520-alert,.v532-alert');const text=(alert?.textContent||'').toLowerCase();if(text.includes('barista')||text.includes('question')||text.includes('pitanj')){e.preventDefault();e.stopImmediatePropagation();alert?.remove();openBarista()}},true);
// Keep barista panel fresh when opened from the menu or alert.
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&/barista questions/i.test(b.textContent||''))setTimeout(()=>{window.LangarKnowledgeAdminV540?.render?.();window.dispatchEvent(new Event('langar-admin-unlocked'))},120)},true);
function initRealtime(){const c=client();if(!c||window.__v541BaristaRealtime)return;window.__v541BaristaRealtime=true;c.channel('v541-barista-routing').on('postgres_changes',{event:'INSERT',schema:'public',table:'barista_questions'},()=>{setTimeout(()=>{if(!document.getElementById('baristaPanel')?.classList.contains('hidden'))window.dispatchEvent(new Event('langar-admin-unlocked'))},120)}).on('postgres_changes',{event:'UPDATE',schema:'public',table:'barista_questions'},()=>{}).subscribe()}
window.addEventListener('load',()=>setTimeout(initRealtime,1800));window.addEventListener('langar-admin-unlocked',initRealtime);
})();
