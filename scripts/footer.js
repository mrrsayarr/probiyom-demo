/* ===================================================================
   Footer – contact info + copyright (Responsive Bootstrap Grid)
   =================================================================== */

function Footer(container) {
  container.innerHTML =
    '<footer class="footer py-5 text-white-50">' +
      '<div class="container">' +
        '<div class="row gy-4 gx-md-5 justify-content-between">' +
          
          /* Marka & Slogan Sütunu */
          '<div class="col-lg-3 col-md-12 text-center text-lg-start">' +
            '<div class="footer-brand d-inline-flex align-items-center gap-2 mb-3 text-white">' +
              '<img src="images/logo.svg" alt="Probiyom logo" class="footer-logo p-1 rounded bg-opacity-10" style="height: 50px; width: auto;">' +
              '<span class="fw-bold fs-5 tracking-tight text-white">Probiyom</span>' +
            '</div>' +
            '<p class="small lh-base mb-0 text-white-50">Yüzde yüz doğal ve sürdürülebilir probiyotik teknolojilerle, yaşam alanlarınızda kalıcı hijyen çözümleri sunuyoruz.</p>' +
          '</div>' +

          /* Adres Sütunu */
          '<div class="col-6 col-sm-4 col-lg-2 text-start">' +
            '<span class="footer-label d-block text-white mb-3 text-uppercase fw-bold">Adres</span>' +
            '<ul class="list-unstyled d-flex flex-column gap-2 small mb-0">' +
              '<li>' + SiteData.address1 + '</li>' +
              '<li>' + SiteData.address2 + '</li>' +
            '</ul>' +
          '</div>' +

          /* İletişim Sütunu */
          '<div class="col-6 col-sm-4 col-lg-3 text-start">' +
            '<span class="footer-label d-block text-white mb-3 text-uppercase fw-bold">İletişim</span>' +
            '<ul class="list-unstyled d-flex flex-column gap-2 small mb-0">' +
              '<li><a href="tel:' + SiteData.phone + '" class="footer-link text-decoration-none transition-all">' + SiteData.phone + '</a></li>' +
              '<li><a href="mailto:' + SiteData.email + '" class="footer-link text-decoration-none transition-all">' + SiteData.email + '</a></li>' +
            '</ul>' +
          '</div>' +

          /* Sosyal Medya Sütunu */
          '<div class="col-12 col-sm-4 col-lg-2 text-center text-sm-start">' +
            '<span class="footer-label d-block text-white mb-3 text-uppercase fw-bold">Sosyal Medya</span>' +
            '<ul class="list-unstyled d-flex flex-column gap-2 small mb-0">' +
              '<li><a href="' + SiteData.instagram + '" target="_blank" rel="noopener" class="footer-link text-decoration-none transition-all">Instagram</a></li>' +
              '<li><a href="' + SiteData.x + '" target="_blank" rel="noopener" class="footer-link text-decoration-none transition-all">X</a></li>' +
              '<li><a href="' + SiteData.linkedin + '" target="_blank" rel="noopener" class="footer-link text-decoration-none transition-all">LinkedIn</a></li>' +
              '<li><a href="' + SiteData.youtube + '" target="_blank" rel="noopener" class="footer-link text-decoration-none transition-all">YouTube</a></li>' +
            '</ul>' +
          '</div>' +

        '</div>' +

        /* Telif Hakkı Alanı */
        '<div class="footer-copy mt-5 pt-4 text-center">' +
          '<small class="small text-white-50">&copy; ' + new Date().getFullYear() + ' Probiyom. Tüm hakları saklıdır.</small>' +
        '</div>' +
      '</div>' +
    '</footer>';
}