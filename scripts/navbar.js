/* ===================================================================
   Navbar – responsive navigation with desktop dropdown & mobile menu
   =================================================================== */

function Navbar(container) {
  var isOpen = false;

  var groupItems = Object.keys(GroupSlugToEnum).map(function (slug) {
    return {
      href: '#products/' + slug,
      label: ProductGroupLabels[GroupSlugToEnum[slug]],
    };
  });

  function buildDesktopGroupLinks() {
    return groupItems.map(function (g) {
      return '<li><a href="' + g.href + '" class="text-decoration-none d-block px-3 py-2 fw-semibold">' + g.label + '</a></li>';
    }).join('');
  }

  function buildMobileLinks() {
    var navItems = [
      { label: 'Ana Sayfa', href: '#home' },
      { label: 'Hakkımızda', href: '#about' },
      { label: 'Ürünlerimiz', href: '#products' },
      { label: 'Blog', href: '#blog' },
      { label: 'SSS', href: '#faq' },
      { label: 'İletişim', href: '#contact' },
    ];

    return navItems.map(function (item) {
      var subLinks = '';
      if (item.href === '#products') {
        subLinks = '<ul class="sub-links list-unstyled m-0 ps-3">' +
          groupItems.map(function (g) {
            return '<li><a href="' + g.href + '" class="text-decoration-none d-block px-3 py-2 fw-semibold text-secondary">' + g.label + '</a></li>';
          }).join('') +
          '</ul>';
      }
      return '<li>' +
        '<a href="' + item.href + '" class="text-decoration-none d-block px-3 py-2 fw-semibold">' + item.label + '</a>' +
        subLinks +
        '</li>';
    }).join('');
  }

  function render() {
    container.innerHTML =
      '<nav class="navbar position-relative py-2" aria-label="Main navigation">' +
        /* İçerikleri hizalamak için Bootstrap container yapısı */
        '<div class="container d-flex align-items-center justify-content-between">' +
          
          '<a href="#home" class="navbar-brand d-flex align-items-center gap-2 text-decoration-none" aria-label="Probiyom ana sayfa">' +
            // Logo ve marka adını içeren navbar-brand kısmı
            '<img src="images/logo.svg" alt="Probiyom logo" style="height: 50px; width: auto;" class="height: 50px; width: auto;">' +
            '<span class="fs-6 fw-bold tracking-tight text-white">Probiyom</span>' +
          '</a>' +

          /* Desktop links */
          '<ul class="navbar-links list-unstyled m-0 d-none d-md-flex align-items-center gap-4">' +
            '<li><a href="#home" class="text-decoration-none fw-semibold">Ana Sayfa</a></li>' +
            '<li><a href="#about" class="text-decoration-none fw-semibold">Hakkımızda</a></li>' +
            '<li class="nav-dropdown position-relative">' +
              '<a href="#products" class="nav-dropdown-trigger text-decoration-none fw-semibold d-flex align-items-center gap-1">' +
                '<span>Ürünlerimiz</span>' +
                '<span class="nav-dropdown-arrow" aria-hidden="true">▾</span>' +
              '</a>' +
              /* DÜZELTİLDİ: 'z-3' sınıfı buradan kaldırıldı */
              '<div class="nav-dropdown-menu position-absolute end-0 top-100 pt-2">' +
                '<div class="nav-dropdown-panel rounded-3 border border-light-subtle shadow">' +
                  '<ul class="list-unstyled m-0 py-2">' + buildDesktopGroupLinks() + '</ul>' +
                '</div>' +
              '</div>' +
            '</li>' +
            '<li><a href="#blog" class="text-decoration-none fw-semibold">Blog</a></li>' +
            '<li><a href="#faq" class="text-decoration-none fw-semibold">SSS</a></li>' +
            '<li><a href="#contact" class="text-decoration-none fw-semibold">İletişim</a></li>' +
          '</ul>' +

          /* Mobile button */
          '<button type="button" class="navbar-mobile-btn d-inline-flex d-md-none align-items-center justify-content-center border border-white-50 rounded-3 px-3 py-2 text-white" aria-label="Menüyü aç/kapat">' +
            '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="me-2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>' +
            '<span class="small fw-semibold">Menü</span>' +
          '</button>' +

        '</div>' +

        /* Mobile menu */
        /* DÜZELTİLDİ: 'z-3' sınıfı buradan da kaldırıldı */
        '<div class="mobile-menu position-absolute top-100 end-0 w-100 mt-2 d-none">' +
          '<div class="mobile-menu-panel rounded-3 border border-light-subtle shadow max-h-70 overflow-y-auto" style="overscroll-behavior: contain;">' +
            '<ul class="list-unstyled m-0 py-2">' + buildMobileLinks() + '</ul>' +
          '</div>' +
        '</div>' +
      '</nav>';

    /* Events */
    var btn = container.querySelector('.navbar-mobile-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        isOpen = !isOpen;
        var menu = container.querySelector('.mobile-menu');
        if (menu) {
          menu.classList.toggle('is-open', isOpen);
        }
      });
    }

    /* Close mobile menu when a link is clicked */
    var mobileLinks = container.querySelectorAll('.mobile-menu a');
    for (var i = 0; i < mobileLinks.length; i++) {
      mobileLinks[i].addEventListener('click', function () {
        isOpen = false;
        var menu = container.querySelector('.mobile-menu');
        if (menu) menu.classList.remove('is-open');
      });
    }

    // Scroll kontrolü
    function handleScroll() {
      var scrolled = window.scrollY > 40;
      var navbarEl = container.querySelector('.navbar');
      if (navbarEl) {
        if (scrolled) {
          navbarEl.classList.add('is-scrolled');
        } else {
          navbarEl.classList.remove('is-scrolled');
        }
      }
    }

    // --- YENİ: Dropdown Linkine Tıklandığında Kapatma Mekanizması ---
    var dropdownMenu = container.querySelector('.nav-dropdown-menu');
    var dropdownLinks = container.querySelectorAll('.nav-dropdown-panel a');
    var navDropdown = container.querySelector('.nav-dropdown');

    if (dropdownMenu && dropdownLinks.length > 0) {
      for (var d = 0; d < dropdownLinks.length; d++) {
        dropdownLinks[d].addEventListener('click', function () {
          dropdownMenu.classList.add('force-hide'); // Tıklanınca menüyü gizlemeye zorla
        });
      }
    }

    if (navDropdown && dropdownMenu) {
      navDropdown.addEventListener('mouseleave', function () {
        dropdownMenu.classList.remove('force-hide'); // Fare alandan ayrılınca kilidi sıfırla
      });
    }
    
    window.addEventListener('scroll', handleScroll);
    setTimeout(handleScroll, 50);
  }

  render();

  /* Close mobile menu on desktop resize */
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && isOpen) {
      isOpen = false;
      var menu = container.querySelector('.mobile-menu');
      if (menu) menu.classList.remove('is-open');
    }
  });
}