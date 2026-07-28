/* ===================================================================
   Navbar – responsive navigation with Contact Pop-Up Modal
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
        '<div class="container d-flex align-items-center justify-content-between">' +
          
          '<a href="#home" class="navbar-brand d-flex align-items-center gap-2 text-decoration-none" aria-label="Probiyom ana sayfa">' +
            '<img src="images/logo.svg" alt="Probiyom logo" style="height: 50px; width: auto;">' +
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
              '<div class="nav-dropdown-menu position-absolute end-0 top-100 pt-2">' +
                '<div class="nav-dropdown-panel rounded-3 border border-light-subtle shadow">' +
                  '<ul class="list-unstyled m-0 py-2">' + buildDesktopGroupLinks() + '</ul>' +
                '</div>' +
              '</div>' +
            '</li>' +
            '<li><a href="#blog" class="text-decoration-none fw-semibold">Blog</a></li>' +
            '<li><a href="#faq" class="text-decoration-none fw-semibold">SSS</a></li>' +
            '<li><a href="#contact" class="text-decoration-none fw-semibold">İletişim</a></li>' +
            
            /* YENİ: Contact Us / Bize Ulaşın Pop-Up Butonu */
            '<li>' +
              '<a href="#contact" class="nav-contact-btn text-decoration-none fw-bold small px-3 py-2 rounded-pill" id="nav-contact-trigger">' +
                'Bize Ulaşın' +
              '</a>' +
            '</li>' +
          '</ul>' +

          /* Mobile button */
          '<button type="button" class="navbar-mobile-btn d-inline-flex d-md-none align-items-center justify-content-center border border-white-50 rounded-3 px-3 py-2 text-white" aria-label="Menüyü aç/kapat">' +
            '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="me-2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>' +
            '<span class="small fw-semibold">Menü</span>' +
          '</button>' +

        '</div>' +

        /* Mobile menu */
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

    // YENİ: Contact Us Butonuna Tıklanınca Pop-Up Açma / Güvenli Yönlendirme Mantığı
    var contactBtn = container.querySelector('#nav-contact-trigger');
    if (contactBtn) {
      contactBtn.addEventListener('click', function (e) {
        try {
          // Eğer Pop-up sorunsuz çalışabiliyorsa varsayılan link gitmesini engelle ve modalı aç
          if (typeof ContactForm === 'function') {
            e.preventDefault();
            openContactModal();
          } else {
            // İletişim formu bileşeni yoksa doğrudan iletişim sayfasına yönlendir
            window.location.hash = '#contact';
          }
        } catch (err) {
          // Herhangi bir engelleyici veya JS çökmesinde otomatik iletişim sayfasına yönlendir
          console.warn("Pop-up açılamadı, doğrudan iletişim sayfasına aktarılıyor...", err);
          window.location.hash = '#contact';
        }
      });
    }

    // Scroll takip fonksiyonu
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

    window.addEventListener('scroll', handleScroll);
    setTimeout(handleScroll, 50);
  }

  /* YENİ: Sayfa İçi Pop-Up Modal Oluşturucu ve Yöneticisi */
  function openContactModal() {
    var modal = document.getElementById('contact-modal');
    
    // Modal DOM'da yoksa sıfırdan oluşturuyoruz
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'contact-modal';
      modal.className = 'contact-modal-overlay';
      modal.innerHTML = 
        '<div class="contact-modal-dialog position-relative">' +
          '<button type="button" class="contact-modal-close" aria-label="Kapat">&times;</button>' +
          '<div id="modal-form-container"></div>' +
        '</div>';
      
      document.body.appendChild(modal);

      // Kapatma Butonu ve Dışarı Tıklama Olayları
      var closeBtn = modal.querySelector('.contact-modal-close');
      closeBtn.addEventListener('click', closeContactModal);

      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          closeContactModal();
        }
      });

      // ESC Tuşu ile Kapatma
      window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('is-visible')) {
          closeContactModal();
        }
      });
    }

    // Formu modal içerisindeki konteynere yüklüyoruz
    var formContainer = modal.querySelector('#modal-form-container');
    if (formContainer && typeof ContactForm === 'function') {
      ContactForm(formContainer);
    } else {
      window.location.hash = '#contact';
      return;
    }

    // Modalı ekrana akıcı biçimde getiriyoruz
    requestAnimationFrame(function () {
      modal.classList.add('is-visible');
      document.body.style.overflow = 'hidden'; // Arka plan kaydırmasını engeller
    });
  }

  function closeContactModal() {
    var modal = document.getElementById('contact-modal');
    if (modal) {
      modal.classList.remove('is-visible');
      document.body.style.overflow = '';
    }
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