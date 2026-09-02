(()=>{
'use strict';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const client=()=>window.LangarAdminCloud?.client||window.supabaseClient||null;
const bool=v=>v===true||v==='true'||v===1||v==='1';
const val=v=>typeof v==='string'?v:(v&&typeof v==='object'&&'value'in v?v.value:v);
const defaults={
 admin_sound:true,alert_volume:'75',alert_repeat_seconds:'0',sound_order:'triple',sound_reservation:'double',sound_cancel:'warning',sound_barista:'soft',sound_review:'soft',
 cancel_window_minutes:'2',support_phone:'+385916062535',cancel_reason_required:true,
 new_member_cash_limit:'20',trusted_cash_limit:'50',phone_verified_for_cash:true,
 receipt_footer:'Thank you for choosing Langar Bar!',receipt_align:'center',receipt_size:'13',receipt_bold:false,receipt_show_logo:true,
 printer_paper_width:'80',printer_printable_width:'74',printer_margin_mm:'3',printer_font_scale:'100',printer_density:'normal',printer_copies:'1',printer_connection:'browser',printer_name:'',printer_ip:'',printer_port:'9100',printer_bridge_url:'',printer_auto_close:true,
 admin_theme:'langar',high_contrast:false,compact_orders:true,
 pause_all_orders:false,pause_delivery:false,pause_pickup:false,pause_reservations:false,kitchen_busy:false,prep_time_minutes:'20'
};
let settings={...defaults};
async function load(){const c=client();if(!c)return settings;const {data,error}=await c.from('langar_settings').select('key,value');if(error)throw error;(data||[]).forEach(r=>settings[r.key]=val(r.value));return settings}
function input(name,label,type='text',extra=''){return `<label>${label}<input name="${name}" type="${type}" ${extra}></label>`}
function check(name,label){return `<label class="v550-check"><input name="${name}" type="checkbox"> <span>${label}</span></label>`}
function select(name,label,options){return `<label>${label}<select name="${name}">${options.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`}
function render(){const p=$('#settingsPanel');if(!p)return;p.dataset.v520='1';p.innerHTML=`
<div class="section-head"><h2>Settings / Operations</h2><p>All settings below are stored in Supabase and apply without publishing a new version.</p></div>
<form id="settings550" class="v550-settings-grid">
<section class="v550-card v550-wide"><h3>🖨️ Printer setup</h3><p class="v550-help">Choose the receipt width and connection workflow. Browser print works now. Direct Bluetooth/LAN printing requires a compatible native app or local print bridge.</p><div class="v550-grid">
${select('printer_paper_width','Paper roll size',[['58','58 mm'],['80','80 mm'],['custom','Custom']])}
${input('printer_printable_width','Printable width (mm)','number','min="40" max="100" step="1"')}
${input('printer_margin_mm','Page margin (mm)','number','min="0" max="10" step="0.5"')}
${select('printer_font_scale','Receipt text scale',[['85','85% compact'],['100','100% standard'],['115','115% large'],['130','130% extra large']])}
${select('printer_density','Layout density',[['compact','Compact'],['normal','Normal'],['spacious','Spacious']])}
${input('printer_copies','Default copies','number','min="1" max="3"')}
${select('printer_connection','Connection mode',[['browser','System print dialog'],['bridge','Local network print bridge'],['native','Native Bluetooth/USB app']])}
${input('printer_name','Printer name / model')}
${input('printer_ip','Printer IP address','text','placeholder="192.168.1.50"')}
${input('printer_port','Printer port','number','min="1" max="65535"')}
${input('printer_bridge_url','Local bridge URL','url','placeholder="http://192.168.1.20:8080/print"')}
${check('receipt_show_logo','Show Langar Bar name/logo text')}
${check('printer_auto_close','Close preview after print command')}
</div><div class="v550-actions"><button type="button" id="testPrinter550" class="secondary">Print test receipt</button><button type="button" id="previewPrinter550" class="secondary">Preview test receipt</button></div><div id="printerStatus550" class="v550-status"></div></section>
<section class="v550-card"><h3>🔔 Admin alerts</h3>${check('admin_sound','Enable sounds')}${input('alert_volume','Volume (%)','range','min="0" max="100" step="5"')}${input('alert_repeat_seconds','Repeat every seconds (0 = no repeat)','number','min="0" max="300"')}${select('sound_order','Order sound',[['triple','Triple bell'],['double','Double bell'],['soft','Soft tone'],['warning','Warning tone']])}${select('sound_reservation','Reservation sound',[['double','Double bell'],['soft','Soft tone'],['triple','Triple bell']])}${select('sound_cancel','Cancellation sound',[['warning','Warning tone'],['triple','Triple bell'],['double','Double bell']])}${select('sound_barista','Question sound',[['soft','Soft tone'],['double','Double bell'],['triple','Triple bell']])}<div class="v550-actions"><button type="button" data-test-sound="order" class="secondary">Test order</button><button type="button" data-test-sound="cancel" class="secondary">Test cancellation</button></div></section>
<section class="v550-card"><h3>🧾 Receipt message</h3><label>Footer text<textarea name="receipt_footer" rows="5"></textarea></label>${select('receipt_align','Alignment',[['center','Center'],['left','Left'],['right','Right']])}${select('receipt_size','Font size',[['11','Small'],['13','Medium'],['16','Large'],['19','Extra large']])}${check('receipt_bold','Bold footer')}</section>
<section class="v550-card"><h3>❌ Cancellation rules</h3>${input('cancel_window_minutes','Automatic cancellation window (minutes)','number','min="0" max="60"')}${input('support_phone','Support phone','tel')}${check('cancel_reason_required','Cancellation reason is required')}</section>
<section class="v550-card"><h3>💶 Cash order controls</h3>${input('new_member_cash_limit','New member limit (€)','number','min="0" step="0.01"')}${input('trusted_cash_limit','Trusted member limit (€)','number','min="0" step="0.01"')}${check('phone_verified_for_cash','Verified phone required for cash delivery/pickup')}</section>
<section class="v550-card"><h3>🚦 Emergency controls</h3>${check('pause_all_orders','Pause all online orders')}${check('pause_delivery','Pause delivery')}${check('pause_pickup','Pause pickup')}${check('pause_reservations','Pause reservations')}${check('kitchen_busy','Kitchen busy mode')}${input('prep_time_minutes','Default preparation time (minutes)','number','min="1" max="180"')}</section>
<section class="v550-card"><h3>🎨 Appearance</h3>${select('admin_theme','Admin theme',[['langar','Langar Green'],['light','Light'],['dark','Dark'],['high','High contrast']])}${check('high_contrast','Force high contrast text')}${check('compact_orders','Compact order cards by default')}<p class="v550-help">Only tested themes are offered so text remains readable.</p></section>
<div class="v550-savebar"><button class="primary" type="submit">Save all settings</button><span id="settingsStatus550"></span></div>
</form>`;
const f=$('#settings550');Object.entries(settings).forEach(([k,v])=>{const e=f.elements[k];if(!e)return;if(e.type==='checkbox')e.checked=bool(v);else e.value=v??''});
applyTheme();bind(f);
}
function soundPattern(kind){const map={triple:[880,1040,880],double:[760,980],soft:[620],warning:[920,620,920]};const key=settings['sound_'+kind]||settings.sound_order||'triple';return map[key]||map.triple}
function play(kind='order'){if(!bool(settings.admin_sound))return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C(),vol=Math.max(.01,Math.min(.3,Number(settings.alert_volume||75)/400));soundPattern(kind).forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*.2;o.frequency.value=freq;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.15);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.17)});setTimeout(()=>ctx.close(),1400)}
function bind(f){f.onsubmit=async e=>{e.preventDefault();const c=client();if(!c)return alert('Supabase client unavailable');const rows=[];for(const el of f.elements){if(!el.name)continue;const v=el.type==='checkbox'?el.checked:el.value;settings[el.name]=v;rows.push({key:el.name,value:v})}const st=$('#settingsStatus550');st.textContent='Saving…';const {error}=await c.from('langar_settings').upsert(rows,{onConflict:'key'});st.textContent=error?`Error: ${error.message}`:'Saved';if(!error){applyTheme();window.dispatchEvent(new CustomEvent('langar-settings-updated',{detail:{...settings}}));setTimeout(()=>st.textContent='',2500)}};
f.querySelectorAll('[data-test-sound]').forEach(b=>b.onclick=()=>{for(const el of f.elements){if(el.name)settings[el.name]=el.type==='checkbox'?el.checked:el.value}play(b.dataset.testSound)});
$('#testPrinter550').onclick=()=>{syncForm(f);window.LangarOrderPrint550?.testPrint?.(settings)};
$('#previewPrinter550').onclick=()=>{syncForm(f);window.LangarOrderPrint550?.testPreview?.(settings)};
f.elements.printer_paper_width.onchange=()=>{if(f.elements.printer_paper_width.value==='58')f.elements.printer_printable_width.value='52';if(f.elements.printer_paper_width.value==='80')f.elements.printer_printable_width.value='74'};
}
function syncForm(f){for(const el of f.elements){if(el.name)settings[el.name]=el.type==='checkbox'?el.checked:el.value}}
function applyTheme(){document.documentElement.dataset.adminTheme=settings.admin_theme||'langar';document.documentElement.classList.toggle('v550-high-contrast',bool(settings.high_contrast));document.documentElement.classList.toggle('v550-compact-orders',bool(settings.compact_orders))}
async function init(){try{await load();render();window.LangarAdminSettings550={get:()=>({...settings}),reload:async()=>{await load();render()},play}}catch(e){console.error(e)}}
window.addEventListener('load',()=>setTimeout(init,900));
})();
