(() => {
'use strict';
const preview=new URLSearchParams(location.search).get('storePreview')==='1';
const native=Boolean(window.Capacitor?.isNativePlatform?.());
if(!native&&!preview)return;
function rgb(v){const m=String(v||'').match(/rgba?\((\d+)\D+(\d+)\D+(\d+)/i);return m?[+m[1],+m[2],+m[3]]:null}
function paint(el){if(!(el instanceof HTMLElement))return;const cs=getComputedStyle(el);const c=rgb(cs.backgroundColor);if(!c)return;const [r,g,b]=c;const lum=(.2126*r+.7152*g+.0722*b)/255;const green=(g>r*1.06&&g>b*1.04&&g>45);const yellow=(r>145&&g>115&&b<125&&Math.abs(r-g)<115);const light=lum>.72;
 if(green&&lum<.58){el.style.setProperty('color','#ffffff','important');el.querySelectorAll('span,b,strong,small,i').forEach(x=>x.style?.setProperty('color','#ffffff','important'));el.dataset.langarContrast='green-white'}
 else if(yellow||light){el.style.setProperty('color','#101712','important');el.querySelectorAll('span,b,strong,small,i').forEach(x=>x.style?.setProperty('color','#101712','important'));el.dataset.langarContrast='light-black'}
}
function scan(root=document){root.querySelectorAll?.('button,.btn,[role="button"],input[type="button"],input[type="submit"]').forEach(paint)}
function init(){scan();const obs=new MutationObserver(ms=>{for(const m of ms){if(m.type==='childList')m.addedNodes.forEach(n=>{if(n.nodeType===1){paint(n);scan(n)}});else if(m.target instanceof HTMLElement)paint(m.target)}});obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});setInterval(()=>scan(),1400)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();