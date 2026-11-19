/* Local review shell only. Never include in a production T123. */
(() => {
  if (location.hostname !== '127.0.0.1' && location.hostname !== 'localhost') return;
  const nativeFetch = window.fetch;
  window.fetch = function(input, options) {
    const method = String(options?.method || input?.method || 'GET').toUpperCase();
    if (!['GET', 'HEAD'].includes(method)) return Promise.reject(new Error('Local demo: requests are disabled'));
    return nativeFetch.apply(this, arguments);
  };
  const open = XMLHttpRequest.prototype.open, send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method) {
    this.__brDemoBlocked = !['GET', 'HEAD'].includes(String(method).toUpperCase());
    return open.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function() {
    if (this.__brDemoBlocked) { this.abort(); return; }
    return send.apply(this, arguments);
  };
  document.addEventListener('submit', event => {
    event.preventDefault();
  }, true);
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    const url = new URL(anchor.href, location.href);
    if (url.hostname === 'ecobr.ru' && window.__brDemoPaths.includes(url.pathname.replace(/\/$/, '') || '/')) {
      anchor.href = location.origin + url.pathname + url.search + url.hash;
    }
  }, true);
})();
