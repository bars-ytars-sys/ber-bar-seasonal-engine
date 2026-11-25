/* Restore the selected preview before Tilda moves the tooltip to its overlay. */
(() => {
  function loadPin(event) {
    const pin = event.target instanceof Element && event.target.closest('#rec2856176101 .tn-atom__pin');
    const photo = pin && pin.querySelector('img[data-bb-tip]');
    if (!photo) return;
    const url = photo.dataset.bbTip;
    if (photo.getAttribute('data-tipimg-original') !== url) {
      photo.setAttribute('data-tipimg-original', url);
      photo.src = url;
    }
  }

  for (const event of ['pointerdown', 'click']) {
    document.addEventListener(event, loadPin, true);
  }
})();
