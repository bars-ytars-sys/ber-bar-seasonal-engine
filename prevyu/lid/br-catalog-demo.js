/* Demo catalog only: the main page keeps its native compact booking module. */
(() => {
  const base = new URL('.', document.currentScript.src);
  window.BBStayInitialHash = location.hash;
  window.BRStayAssetBase = base.href;
  window.BRStayMount = {
    target: 'rec2037067891',
    hideRecords: ['rec2037067891','rec2486825571','rec1841670091','rec9990000104','rec2037071111'],
    initialHouse: new URL(location.href).searchParams.get('house')
  };
  document.addEventListener('click',event=>{
    const a=event.target.closest?.('a[href]');
    if(!a||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const destination=new URL(a.href),pages={'/':'br-glavnaya.html','/doma':'br-doma.html','/new-year':'br-new-year.html'};
    if(!['ecobr.ru','www.ecobr.ru'].includes(destination.hostname)||!pages[destination.pathname]||destination.hash)return;
    event.preventDefault();event.stopImmediatePropagation();
    location.assign(new URL(pages[destination.pathname],base).href+destination.search);
  },true);
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = new URL('br-stay.css?v=20261107-catalog',base);
  document.head.append(css);
  for (const name of ['br-stay-data.js','br-stay-core.js','br-stay-calendar.js','br-stay.js']) {
    const script = document.createElement('script');
    script.async = false; script.src = new URL(name+'?v=20261107-catalog',base);
    document.head.append(script);
  }
})();
