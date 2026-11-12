/* The owner requested one New Year link in the native BR header. Demo only. */
(() => {
  const destination = new URL('br-new-year.html', document.currentScript.src).href;
  const base = new URL('.',document.currentScript.src);
  document.addEventListener('click',event=>{
    const a=event.target.closest?.('a[href]');
    if(!a||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const url=new URL(a.href),pages={'/':'br-glavnaya.html','/doma':'br-doma.html','/new-year':'br-new-year.html'};
    if(!['ecobr.ru','www.ecobr.ru'].includes(url.hostname)||!pages[url.pathname]||url.hash)return;
    event.preventDefault();event.stopImmediatePropagation();
    location.assign(new URL(pages[url.pathname],base).href+url.search);
  },true);
  let link, observer;
  function mount() {
    const header = document.getElementById('t-header');
    if (!header || !header.querySelector('a[href="/"]')) return false;
    if (!link && !document.querySelector('script[data-demo-new-year-header]')) {
      link = document.createElement('a'); link.className = 'brd-header-newyear';
      link.href = destination; link.innerHTML = '<span aria-hidden="true">✧</span> Новый год';
      header.append(link);
      const elements = [...header.querySelectorAll('.tn-elem')];
      const resize = new ResizeObserver(place); elements.forEach(e => resize.observe(e));
      window.addEventListener('resize',place,{passive:true});
      window.addEventListener('load',place,{once:true});
    }
      for (const about of header.querySelectorAll('a[href="/about"]')) {
        const row = about.closest('.tn-elem');
        if (!row || row.parentElement.querySelector('.brd-header-menu-item')) continue;
        const item = document.createElement('div'); item.className = 'brd-header-menu-item';
        const a = document.createElement('a'); a.href = destination; a.textContent = 'Новый год 2027';
        item.append(a); row.before(item);
      }
    place(); return true;
  }
  function place() {
    if (!link) return;
    const header = document.getElementById('t-header');
    const boxes = [...header.querySelectorAll('a:not(.brd-header-newyear)')].map(a=>({a,r:a.getBoundingClientRect()})).filter(({a,r})=>r.width>20&&r.height>8&&r.top>=0&&r.top<85&&r.right<=innerWidth+2&&getComputedStyle(a).visibility!=='hidden');
    const logo = boxes.filter(({a,r})=>a.getAttribute('href')==='/'&&r.left<innerWidth/3).sort((a,b)=>a.r.left-b.r.left)[0];
    const next = logo&&boxes.filter(({r})=>r.left>logo.r.right+8).sort((a,b)=>a.r.left-b.r.left)[0];
    const gap = next&&next.r.left-logo.r.right;
    if (!logo || !next || gap<145 || innerWidth<640) { link.hidden=true; return; }
    link.hidden=false;
    link.style.left=Math.round(logo.r.right+(gap-126)/2)+'px';
    link.style.top=Math.max(7,Math.round(logo.r.top+(logo.r.height-36)/2))+'px';
  }
  if (!mount()) {
    observer=new MutationObserver(()=>{if(mount())observer.disconnect();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    document.addEventListener('DOMContentLoaded',()=>{mount();observer.disconnect();},{once:true});
  }
  document.addEventListener('DOMContentLoaded',mount,{once:true});
})();
