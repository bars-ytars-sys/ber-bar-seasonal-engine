// Optional enhancement: the guide still works when Safari blocks iframe storage.
async function prepareCache() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register('./sw.js', {scope:'./'});
    const ready = await navigator.serviceWorker.ready;
    const images = [...document.images].filter(img => img.complete && img.naturalWidth).map(img => img.currentSrc);
    (ready.active || registration.active)?.postMessage({type:'SAVE_VIEWED_IMAGES',urls:images});
  } catch { /* Private browsing and third-party storage restrictions are supported. */ }
}
const start = () => {
  if ('requestIdleCallback' in window) requestIdleCallback(prepareCache, {timeout:3000});
  else setTimeout(prepareCache,1000);
};
if (document.readyState === 'complete') start();
else window.addEventListener('load',start,{once:true});
