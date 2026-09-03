(() => {
'use strict';

function luminance(rgb){
  const m=String(rgb||'').match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i);
  if(!m) return null;
  const [r,g,b]=[+m[1],+m[2],+m[3]];
  return (0.2126*r+0.7152*g+0.0722*b)/255;
}
function looksGreen(rgb){
  const m=String(rgb||'').match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i); if(!m)return false;
  const [r,g,b]=[+m[1],+m[2],+m[3]];
  return g>r*1.12 && g>b*1.02 && g>45;
}
function fixButtons(root=document){
  root.querySelectorAll?.('button,.button,a.secondary,a.primary,[role="button"]').forEach(el=>{
    if(el.closest('#cloudAdminGate')) return;
    const cs=getComputedStyle(el); const bg=cs.backgroundColor; const lum=luminance(bg);
    if(looksGreen(bg) && lum!=null && lum<0.55){
      el.style.setProperty('color','#ffffff','important');
      el.querySelectorAll('*').forEach(n=>n.style.setProperty('color','#ffffff','important'));
    }else if(lum!=null && lum>0.67){
      el.style.setProperty('color','#111111','important');
      el.querySelectorAll('*').forEach(n=>n.style.setProperty('color','#111111','important'));
    }
  });
}
function fixLogin(){
  const gate=document.getElementById('cloudAdminGate'); if(!gate)return;
  gate.style.setProperty('position','relative','important');
  gate.style.setProperty('z-index','1000','important');
  gate.style.setProperty('pointer-events','auto','important');
  gate.style.setProperty('touch-action','manipulation','important');
  gate.querySelectorAll('input,button,label,.form-card').forEach(el=>{
    el.style.setProperty('pointer-events','auto','important');
    el.style.setProperty('touch-action','manipulation','important');
  });
  gate.querySelectorAll('input').forEach(input=>{
    input.disabled=false; input.readOnly=false;
    input.style.setProperty('user-select','text','important');
    input.style.setProperty('-webkit-user-select','text','important');
    input.style.setProperty('opacity','1','important');
    input.style.setProperty('color','#fff4d6','important');
    input.style.setProperty('background','#08140f','important');
    input.style.setProperty('caret-color','#f5d78b','important');
    input.style.setProperty('font-size','16px','important');
  });
  const btn=gate.querySelector('#adminCloudLogin');
  if(btn){ btn.style.setProperty('pointer-events','auto','important'); btn.style.setProperty('color','#111','important'); }
}
function addCss(){
  if(document.getElementById('adminReleaseFix104Css'))return;
  const s=document.createElement('style');s.id='adminReleaseFix104Css';s.textContent=`
    #cloudAdminGate,#cloudAdminGate *{box-sizing:border-box}
    #cloudAdminGate{isolation:isolate!important}
    #cloudAdminGate input{position:relative!important;z-index:1002!important;min-height:48px!important}
    #cloudAdminGate label{position:relative!important;z-index:1001!important}
    #cloudAdminGate #adminCloudLogin{position:relative!important;z-index:1002!important}
  `;document.head.appendChild(s);
}
function refresh(){addCss();fixLogin();fixButtons(document)}
function init(){
  refresh();
  new MutationObserver(()=>requestAnimationFrame(refresh)).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  document.addEventListener('click',()=>setTimeout(()=>fixButtons(document),50),true);
  setTimeout(refresh,500);setTimeout(refresh,1500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();