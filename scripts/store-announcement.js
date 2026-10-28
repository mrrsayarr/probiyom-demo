/* One announcement per page load. Store details live in data/site.js. */
var StoreAnnouncement = (function () {
  var initialized = false;
  var shown = false;
  var announcementImage;
  var announcementVisual;
  var announcement;
  // The mobile image is contained inside a 45svh frame, rather than filling its width.
  var imageSizes = '(max-width: 639px) min(calc(100vw - 32px), 36svh), 410px';

  function getAnnouncement(now) {
    var event = SiteData.eventAnnouncement;
    if (event && event.enabled && (now === undefined ? Date.now() : Number(now)) < Date.parse(event.endsAt)) return event;
    return SiteData.storeAnnouncement;
  }

  function init() {
    announcement = getAnnouncement();
    if (initialized || !announcement || !announcement.enabled) return;
    initialized = true;
    announcementImage = new Image(1122, 1402);
    announcementImage.alt = announcement.imageAlt;
    announcementImage.fetchPriority = 'high';
    // This small opening image is the LCP element: decode it with its first paint.
    announcementImage.decoding = 'sync';
    announcementVisual = announcementImage;
    if (announcement.mobileImage) {
      announcementVisual = document.createElement('picture');
      var mobile = document.createElement('source');
      mobile.media = '(max-width: 639px)';
      mobile.srcset = announcement.mobileImage;
      var mobileAsset = typeof ImageAssets !== 'undefined' && ImageAssets[announcement.mobileImage];
      if (mobileAsset) {
        mobile.setAttribute('width', mobileAsset.width);
        mobile.setAttribute('height', mobileAsset.height);
      }
      announcementVisual.appendChild(mobile);
      announcementVisual.appendChild(announcementImage);
    }
    setResponsiveImage(announcementImage, announcement.image, announcement.mobileImage ? '(max-width: 639px) min(calc(100vw - 32px), 45svh), 960px' : imageSizes);
    // Dimensions reserve the image space; opening does not need to wait for decoding.
    show();
  }

  function show() {
    if (shown) return;
    if (document.visibilityState === 'hidden') {
      // A background tab should open immediately when visited, without a one-second polling delay.
      document.addEventListener('visibilitychange', function resume() {
        if (document.visibilityState === 'hidden') return;
        document.removeEventListener('visibilitychange', resume);
        show();
      });
      return;
    }
    if (document.querySelector('dialog[open], .contact-modal-overlay.is-visible, #app-loader')) {
      setTimeout(show, 1000);
      return;
    }
    var opener = document.activeElement;
    var previousOverflow = document.body.style.overflow;
    var dialog = document.createElement('dialog');
    dialog.className = 'store-announcement' + (announcement.mobileImage ? ' store-announcement--event' : '');
    dialog.setAttribute('aria-labelledby', 'store-announcement-title');
    dialog.innerHTML =
      '<button type="button" class="store-announcement__close" aria-label="Duyuruyu kapat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>' +
      '<div class="store-announcement__layout">' +
        '<div class="store-announcement__visual"></div>' +
        '<div class="store-announcement__content">' +
          '<span class="store-announcement__brand">' + escapeHtml(announcement.brand || 'Probiyom × Trendyol') + '</span>' +
          '<h2 id="store-announcement-title">' + escapeHtml(announcement.title || 'Trendyol mağazamız açıldı.') + '</h2>' +
          (announcement.dateLabel ? '<p class="store-announcement__date">' + escapeHtml(announcement.dateLabel) + '</p>' : '') +
          '<p>' + escapeHtml(announcement.description || 'Probiyom ürünlerini artık Trendyol mağazamızdan da inceleyebilir ve sipariş verebilirsiniz.') + '</p>' +
          (announcement.location ? '<p class="store-announcement__location">' + escapeHtml(announcement.location) + '</p>' : '') +
          '<a class="store-announcement__link" href="' + escapeAttr(announcement.link || SiteData.trendyol) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(announcement.linkLabel || 'Trendyol mağazamızı keşfet') + ' <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a>' +
          '<button type="button" class="store-announcement__continue">Siteye devam et</button>' +
        '</div>' +
      '</div>';
    if (!announcementImage.complete || announcementImage.naturalWidth) {
      dialog.querySelector('.store-announcement__visual').appendChild(announcementVisual);
      announcementImage.addEventListener('error', function () {
        var visual = dialog.querySelector('.store-announcement__visual');
        if (visual) visual.remove();
        dialog.querySelector('.store-announcement__layout').style.gridTemplateColumns = '1fr';
      }, { once: true });
    } else {
      dialog.querySelector('.store-announcement__visual').remove();
      dialog.querySelector('.store-announcement__layout').style.gridTemplateColumns = '1fr';
    }
    function close() { dialog.close(); }
    dialog.querySelector('.store-announcement__close').addEventListener('click', close);
    dialog.querySelector('.store-announcement__continue').addEventListener('click', close);
    dialog.querySelector('.store-announcement__link').addEventListener('click', close);
    dialog.addEventListener('click', function (event) {
      var bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) close();
    });
    dialog.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      var items = dialog.querySelectorAll('button, a[href]');
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    dialog.addEventListener('close', function () {
      document.body.style.overflow = previousOverflow;
      if (opener && opener.isConnected && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
      dialog.remove();
    }, { once: true });
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.querySelector('.store-announcement__close').focus({ preventScroll: true });
    document.body.style.overflow = 'hidden';
    shown = true;
  }

  return { init: init, imageSizes: imageSizes, getAnnouncement: getAnnouncement };
})();
