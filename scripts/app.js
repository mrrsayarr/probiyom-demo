/* ===================================================================
   App entry – initialises layout and starts router
   =================================================================== */

(function () {
  function startApp() {
    try {
      if (localStorage.getItem('probiyom-motion') === 'full') {
        document.documentElement.setAttribute('data-motion', 'full');
      }
    } catch (error) { /* Storage can be disabled; system preferences still work. */ }
    /* Render navbar */
    var navContainer = document.getElementById('navbar-container');
    if (navContainer) {
      Navbar(navContainer);
    }

    /* Render footer */
    var footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
      Footer(footerContainer);
    }

    /* Start router */
    var mainContainer = document.getElementById('page-content');
    if (mainContainer) {
      Router.init(mainContainer);
    }
    if (window.StoreAnnouncement) window.StoreAnnouncement.init();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var styles = document.querySelector('link[data-full-styles]');
    // The early popup already works. Attach the full interface after its stylesheet is ready.
    if (styles && styles.media === 'print') {
      var started = false;
      function ready() {
        if (started) return;
        started = true;
        startApp();
      }
      styles.addEventListener('load', ready, { once: true });
      styles.addEventListener('error', ready, { once: true });
    } else startApp();
  });
})();
