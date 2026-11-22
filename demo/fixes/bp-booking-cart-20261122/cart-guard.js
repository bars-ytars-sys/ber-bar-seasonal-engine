/* BP booking instance only: keep Bnovo's native cart if its CSS manifest is late. */
(function (frame) {
  'use strict';
  if (!frame || typeof frame.initWebComponents !== 'function' ||
      typeof frame.updateCartComponent !== 'function') return;

  const init = frame.initWebComponents;
  const update = frame.updateCartComponent;
  let manifest = null;

  function valid(value) {
    return value && typeof value === 'object' && !Array.isArray(value) &&
      typeof value['css/main.css'] === 'string' && value['css/main.css'].length > 0;
  }

  frame.initWebComponents = function (data) {
    if (valid(data && data.manifest)) manifest = data.manifest;
    if (!manifest) {
      // Do not acknowledge a broken outer cart: Bnovo keeps its working native
      // cart visible until a valid outer cart has actually initialized.
      return;
    }
    return init.call(this, Object.assign({}, data, { manifest: manifest }));
  };

  frame.updateCartComponent = function (data) {
    if (!this.cartWidget || !manifest) return;
    if (valid(data && data.manifest)) manifest = data.manifest;
    return update.call(this, Object.assign({}, data, { manifest: manifest }));
  };
})(BnovoBookFrame);
