/* ===================================================================
   Hash-based Router with Dynamic SEO & Schema Integration
   Routes: #home, #about, #products, #products/<slug>, #contact, #faq, #blog
   =================================================================== */

var Router = (function () {
  var mainContainer = null;
  var currentSlider = null;
  var pageCache = {};

  function init(container) {
    mainContainer = container;
    window.addEventListener('hashchange', onRoute);
    onRoute();
  }

  function onRoute() {
    var hash = window.location.hash.replace(/^#\/?/, '') || 'home';
    var parts = hash.split('/');
    var page = parts[0];

    /* Scroll to top on navigation */
    window.scrollTo(0, 0);

    /* Destroy previous slider if any */
    if (currentSlider && currentSlider.destroy) {
      currentSlider.destroy();
      currentSlider = null;
    }

    switch (page) {
      case 'home':
        loadPage('pages/home.html', initHomePage);
        break;
      case 'about':
        loadPage('pages/about.html', initAboutPage);
        break;
      case 'products':
        if (parts.length > 1 && parts[1]) {
          loadPage('pages/product-group.html', function () {
            initProductGroupPage(parts[1]);
          });
        } else {
          loadPage('pages/products.html', initProductsPage);
        }
        break;
      case 'contact':
        loadPage('pages/contact.html', initContactPage);
        break;
      case 'faq':
        loadPage('pages/faq.html', initFaqPage);
        break;
      case 'blog':
        loadPage('pages/blog.html', initBlogPage);
        break;
      default:
        loadPage('pages/not-found.html', function () {
          updateSEO('Sayfa Bulunamadı - 404', 'Aradığınız sayfa bulunamadı.', '#404');
        });
        break;
    }
  }

  function loadPage(url, callback) {
    if (pageCache[url]) {
      mainContainer.innerHTML = pageCache[url];
      if (callback) callback();
      return;
    }

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Page not found');
        return res.text();
      })
      .then(function (html) {
        pageCache[url] = html;
        mainContainer.innerHTML = html;
        if (callback) callback();
      })
      .catch(function () {
        mainContainer.innerHTML = '<section class="page-section"><h1 class="text-brand">Sayfa yüklenemedi</h1></section>';
      });
  }

  /* ===================================================================
     YENİ: Dinamik SEO, Meta Etiketleri ve Şema (Schema.org) Enjektörü
     =================================================================== */

  function updateSEO(title, description, path) {
    // 1. Tarayıcı Başlığı
    document.title = title ? title + " | Probiyom" : "Probiyom - Probiyotik & Sinbiyotik Teknolojisi";

    // 2. Meta Description (Google Arama Özeti)
    var metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    if (description) {
      metaDesc.setAttribute('content', description);
    }

    // 3. Canonical Link (Dizinleme Kararlılığı)
    var canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    var cleanPath = path ? (path.indexOf('#') === 0 ? path : '#' + path) : '';
    canonical.setAttribute('href', window.location.origin + window.location.pathname + cleanPath);

    // 4. OpenGraph Sosyal Medya Kartları
    updateMetaTag('og:title', title ? title + " | Probiyom" : "Probiyom");
    updateMetaTag('og:description', description || '');
    updateMetaTag('og:url', window.location.origin + window.location.pathname + cleanPath);
  }

  function updateMetaTag(property, content) {
    var tag = document.querySelector('meta[property="' + property + '"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }

  // Google için Dinamik Ürün Grubu Şeması (JSON-LD)
  function injectProductSchema(groupTitle, slug, description) {
    var oldSchema = document.getElementById('dynamic-schema');
    if (oldSchema && oldSchema.parentNode) {
      oldSchema.parentNode.removeChild(oldSchema);
    }

    var schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": groupTitle + " | Probiyom Biyoteknoloji",
      "description": description,
      "url": window.location.origin + window.location.pathname + "#products/" + slug
    };

    var script = document.createElement('script');
    script.id = 'dynamic-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  /* ---- Page initializers (SEO İyileştirmeleri Entegre Edildi) ---- */

  function initHomePage() {
    // Ana Sayfa SEO Güncellemesi
    updateSEO(
      'Probiyotik & Sinbiyotik Temizlik Teknolojisi',
      'Yüzde yüz doğal, patentli HeiQ VivoTech probiyotik ve sinbiyotik temizlik teknolojisi ile yaşam alanlarınızda 72 saate kadar kalıcı ve sürdürülebilir hijyen çözümleri.',
      '#home'
    );

    var sliders = [];
    var homeSliderEl = document.getElementById('home-slider');
    if (homeSliderEl) {
      sliders.push(ImageSlider(homeSliderEl, homeSlides, SLIDER_DURATION_MS));
    }
    var productsSliderEl = document.getElementById('products-slider');
    if (productsSliderEl) {
      sliders.push(ImageSlider(productsSliderEl, productSlides, SLIDER_DURATION_MS));
    }
    currentSlider = {
      destroy: function () {
        sliders.forEach(function (s) { if (s && s.destroy) s.destroy(); });
      }
    };
  }

  function initProductsPage() {
    // Genel Ürünler Sayfası SEO Güncellemesi
    updateSEO(
      'Ürün Gruplarımız',
      'Profesyonel temizlikten ev bakımına, hayvancılıktan kişisel bakıma kadar HeiQ Chrisal patentli probiyotik ve sinbiyotik hijyen ürünlerimizi keşfedin.',
      '#products'
    );

    var sliderEl = document.getElementById('products-slider');
    if (sliderEl) {
      currentSlider = ImageSlider(sliderEl, productSlides, SLIDER_DURATION_MS);
    }
  }

  function initProductGroupPage(slug) {
    var groupEnum = GroupSlugToEnum[slug];
    if (groupEnum === undefined) {
      mainContainer.innerHTML = pageCache['pages/not-found.html'] ||
        '<section class="page-section"><h1 class="text-brand">404</h1><p>Ürün grubu bulunamadı.</p></section>';
      updateSEO('404 - Sayfa Bulunamadı', 'Aradığınız ürün grubu bulunamadı.', '#404');
      return;
    }

    var groupTitle = ProductGroupLabels[groupEnum] || 'Ürün Grubu';
    var groupIntro = ProductGroupIntroText[groupEnum];
    var groupProducts = products.filter(function (p) {
      return p.group === groupEnum;
    });

    // Dinamik Ürün Grubu SEO Açıklaması ve Şema Enjeksiyonu
    var groupSeoDesc = (groupIntro && groupIntro.paragraph)
      ? groupIntro.paragraph
      : groupTitle + ' kategorisindeki patentli HeiQ Synbio probiyotik ve sinbiyotik temizlik ve bakım ürünlerimizi inceleyin.';

    updateSEO(groupTitle, groupSeoDesc, '#products/' + slug);
    injectProductSchema(groupTitle, slug, groupSeoDesc);

    /* Build header */
    var headerEl = document.getElementById('group-header');
    if (headerEl) {
      var headerHtml = '<h1 class="text-brand">' + escapeHtml(groupTitle) + '</h1>';

      if (groupIntro) {
        var introTextHtml =
          '<div class="group-intro-text max-w-5xl">' +
            '<p class="heading">' + escapeHtml(groupIntro.heading) + '</p>' +
            '<ul>';

        for (var i = 0; i < groupIntro.bullets.length; i++) {
          introTextHtml += '<li>' + escapeHtml(groupIntro.bullets[i]) + '</li>';
        }

        introTextHtml += '</ul>' +
          '<p>' + escapeHtml(groupIntro.paragraph) + '</p>';

        if (groupIntro.warning) {
          introTextHtml += '<p class="warning">' + escapeHtml(groupIntro.warning) + '</p>';
        }

        introTextHtml += '</div>';

        var introImageHtml = '';
        if (groupIntro.imageDir) {
          var imgAlt = groupIntro.imageName || groupTitle;
          introImageHtml =
            '<div class="group-intro-image">' +
              '<div class="group-intro-image-inner">' +
                '<img src="' + escapeAttr(groupIntro.imageDir) + '" alt="' + escapeAttr(imgAlt) + '">' +
              '</div>' +
            '</div>';
        }

        if (introImageHtml) {
          headerHtml +=
            '<div class="row g-4 align-items-start">' +
              '<div class="col-12 col-lg-7">' + introTextHtml + '</div>' +
              '<div class="col-12 col-lg-5">' + introImageHtml + '</div>' +
            '</div>';
        } else {
          headerHtml += introTextHtml;
        }
      }

      headerEl.innerHTML = headerHtml;
    }

    /* Build product grid */
    var productsEl = document.getElementById('group-products');
    if (productsEl) {
      ProductGrid(productsEl, groupProducts);
    }
  }

  function initAboutPage() {
    // Hakkımızda SEO Güncellemesi
    updateSEO(
      'Hakkımızda',
      'Probiyom olarak HeiQ Chrisal iş birliğiyle yüzde yüz doğal ve sürdürülebilir probiyotik hijyen teknolojilerini yaşam alanlarınıza taşıyoruz.',
      '#about'
    );

    var addressEl = document.getElementById('about-address');
    if (addressEl) {
      addressEl.innerHTML = SiteData.address1 + '<br>' + SiteData.address2;
    }

    var phoneEl = document.getElementById('about-phone');
    if (phoneEl) {
      phoneEl.href = 'tel:' + SiteData.phone;
      phoneEl.textContent = SiteData.phone;
    }

    var emailEl = document.getElementById('about-email');
    if (emailEl) {
      emailEl.href = 'mailto:' + SiteData.email;
      emailEl.textContent = SiteData.email;
    }

    var socialEl = document.getElementById('about-social');
    if (socialEl) {
      socialEl.innerHTML =
        '<a href="' + SiteData.instagram + '" target="_blank" rel="noopener">Instagram</a>' +
        ' &middot; ' +
        '<a href="' + SiteData.x + '" target="_blank" rel="noopener">Twitter / X</a>';
    }
  }

  function initFaqPage() {
    // SSS SEO Güncellemesi
    updateSEO(
      'Sıkça Sorulan Sorular',
      'Probiyotik ve sinbiyotik hijyen teknolojisi, kullanım alanları, 72 saat süren etkisi ve ürünlerimiz hakkında merak ettiğiniz tüm yanıtlar.',
      '#faq'
    );

    var listEl = document.getElementById('faq-list');
    if (listEl) {
      FaqList(listEl, faqs);
    }
  }

  function initBlogPage() {
    // Blog SEO Güncellemesi
    updateSEO(
      'Blog & Bilimsel Makaleler',
      'Probiyotik teknoloji, mikrobiyom sağlığı, sürdürülebilirlik ve biyolojik hijyen hakkında en güncel makaleler ve bilimsel yayınlar.',
      '#blog'
    );

    var listEl = document.getElementById('blog-list');
    if (listEl) {
      BlogList(listEl, blogPosts);
    }
  }

  function initContactPage() {
    // İletişim SEO Güncellemesi
    updateSEO(
      'İletişim',
      'Probiyom Ekibi ile iletişime geçin. Teknik bilgi, ürün talepleri ve iş birliği süreçleri için bize ulaşabilirsiniz.',
      '#contact'
    );

    /* Fill contact info */
    var addressEl = document.getElementById('contact-address');
    if (addressEl) {
      addressEl.innerHTML = SiteData.address1 + '<br>' + SiteData.address2;
    }

    var phoneEl = document.getElementById('about-phone');
    if (phoneEl) {
      phoneEl.href = 'tel:' + SiteData.phone;
      phoneEl.textContent = SiteData.phone;
    }

    var emailEl = document.getElementById('about-email');
    if (emailEl) {
      emailEl.href = 'mailto:' + SiteData.email;
      emailEl.textContent = SiteData.email;
    }

    var instagramEl = document.getElementById('contact-instagram');
    if (instagramEl) {
      instagramEl.href = SiteData.instagram;
      instagramEl.textContent = SiteData.instagram;
    }

    var xEl = document.getElementById('contact-x');
    if (xEl) {
      xEl.href = SiteData.x;
      xEl.textContent = SiteData.x;
    }

    var linkedinEl = document.getElementById('contact-linkedin');
    if (linkedinEl) {
      linkedinEl.href = SiteData.linkedin;
      linkedinEl.textContent = SiteData.linkedin;
    }

    var youtubeEl = document.getElementById('contact-youtube');
    if (youtubeEl) {
      youtubeEl.href = SiteData.youtube;
      youtubeEl.textContent = SiteData.youtube;
    }

    /* Map */
    var mapEl = document.getElementById('contact-map');
    if (mapEl) {
      ContactMap(mapEl, SiteData.lon, SiteData.lat, 15);
    }

    /* Contact form */
    var formEl = document.getElementById('contact-form-container');
    if (formEl) {
      ContactForm(formEl);
    }
  }

  return { init: init };
})();