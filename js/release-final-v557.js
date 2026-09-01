(()=>{
'use strict';
/*
 * Compatibility shim for a historical V5.5.7 script reference.
 * The active reservation and gallery behavior is implemented by the later
 * V5.5.8/V5.5.9/V5.6.0 modules. Keeping this file prevents a 404 and avoids
 * duplicating or overriding those newer handlers.
 */
window.LangarReleaseFinal557=Object.freeze({
  version:'5.5.7',
  compatibilityShim:true,
  loadedAt:new Date().toISOString()
});
})();
