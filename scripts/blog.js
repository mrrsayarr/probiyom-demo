/* ===================================================================
   BlogList – Switches between list overview and dedicated reading view
   =================================================================== */

function BlogList(container, posts) {
  if (!posts || posts.length === 0) {
    container.innerHTML = '<div class="empty-state">Henüz blog yazısı eklenmedi.</div>';
    return;
  }

  // Başlangıçta özet kart listesini gösteriyoruz
  renderListView();

  // 1. ÖZET KART LİSTESİ GÖRÜNÜMÜ
  function renderListView() {
    var html = '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">';

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var imageAlt = post.imageName || post.title || '';

      // Yazının ilk 140 karakterinden özet oluşturuyoruz
      var snippet = getSnippet(post.text, 140);

      var imageHtml = '';
      if (post.imageDir) {
        imageHtml =
          '<div class="blog-post-image position-relative overflow-hidden">' +
          '<img src="' + escapeAttr(post.imageDir) + '" alt="' + escapeAttr(imageAlt) + '" class="w-100 h-100 object-fit-cover transition-all">' +
          '</div>';
      }

      html +=
        '<div class="col">' +
        '<article class="blog-post h-100 border border-light-subtle rounded-3 overflow-hidden d-flex flex-column shadow-sm bg-white cursor-pointer" data-index="' + i + '">' +
        imageHtml +
        '<div class="blog-post-body p-4 d-flex flex-column justify-content-between flex-grow-1">' +
        '<div>' +
        '<h2 class="blog-post-title fs-5 fw-bold mb-3 text-brand">' + escapeHtml(post.title) + '</h2>' +
        '<p class="blog-post-text text-muted small lh-relaxed mb-4">' + escapeHtml(snippet) + '</p>' +
        '</div>' +
        '<div class="text-start mt-auto">' +
        '<span class="read-more-link text-decoration-none fw-bold small text-brand d-inline-flex align-items-center gap-1 transition-all">' +
        'Devamını Oku <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
        '</span>' +
        '</div>' +
        '</div>' +
        '</article>' +
        '</div>';
    }
    html += '</div>';

    container.innerHTML = html;

    // Kartlara tıklama olayı ekleme (Detay görünümüne geçiş)
    var cards = container.querySelectorAll('.blog-post');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        renderDetailView(idx);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Okumaya en üstten başlaması için scroll sıfırlanır
      });
    });
  }

  // 2. TEKİL BLOG YAZISI OKUMA GÖRÜNÜMÜ
  function renderDetailView(index) {
    var post = posts[index];
    var imageAlt = post.imageName || post.title || '';

    // Metindeki \n\n işaretlerini düzgün paragraf etiketlerine çeviriyoruz
    var formattedTextHtml = formatBlogText(post.text);

    var imageHtml = '';
    if (post.imageDir) {
      imageHtml =
        '<div class="blog-detail-image rounded-3 overflow-hidden mb-4 shadow-sm" style="max-height: 480px; width: 100%;">' +
        '<img src="' + escapeAttr(post.imageDir) + '" alt="' + escapeAttr(imageAlt) + '" class="w-100 h-100 object-fit-cover">' +
        '</div>';
    }

    var detailHtml =
      '<article class="blog-detail-container max-w-5xl mx-auto py-2">' +
      /* Geri Dön Butonu */
      '<button type="button" class="back-to-blog-btn d-inline-flex align-items-center gap-2 mb-4 text-brand fw-semibold border-0 bg-transparent p-0">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" class="transition-all"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
      'Blog Yazılarına Dön' +
      '</button>' +

      /* Görsel */
      imageHtml +

      /* Başlık & Metin */
      '<div class="blog-detail-body mt-2">' +
      '<h1 class="blog-detail-title text-brand mb-4 fw-bold fs-2">' + escapeHtml(post.title) + '</h1>' +
      '<div class="blog-detail-text fs-6 text-muted lh-lg">' + formattedTextHtml + '</div>' +
      '</div>' +
      '</article>';

    container.innerHTML = detailHtml;

    // Geri Dön Butonu Olayı
    var backBtn = container.querySelector('.back-to-blog-btn');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        renderListView();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // Yardımcı Fonksiyon: Yazıdan özet öbek çıkarma
  function getSnippet(text, maxLength) {
    if (!text) return '';
    var cleanText = text.replace(/<\/?[^>]+(>|$)/g, ""); // HTML etiketlerini özetten temizler
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength).trim() + '...';
  }

  // Yardımcı Fonksiyon: \n\n işaretlerini paragraflara böler ve listeleri süzerek düzenler
  function formatBlogText(text) {
    if (!text) return '';
    var paragraphs = text.split('\n\n');
    var result = '';

    for (var i = 0; i < paragraphs.length; i++) {
      var pText = paragraphs[i].trim();
      if (!pText) continue;

      // Eğer paragraf bloku tire (-) ile başlayan liste maddeleri içeriyorsa
      if (pText.indexOf('\n-') !== -1 || pText.indexOf('- ') === 0) {
        var lines = pText.split('\n');
        var listHtml = '<ul class="ps-4 mb-4" style="list-style-type: disc;">';
        var inList = false;

        for (var j = 0; j < lines.length; j++) {
          var line = lines[j].trim();
          if (line.indexOf('-') === 0) {
            var cleanLine = line.substring(1).trim();
            listHtml += '<li class="mb-2 text-muted">' + cleanLine + '</li>';
            inList = true;
          } else if (line) {
            if (inList) {
              listHtml += '</ul>';
              inList = false;
            }
            listHtml += '<p class="mb-3">' + line + '</p>';
          }
        }
        if (inList) {
          listHtml += '</ul>';
        }
        result += listHtml;
      } else {
        // Normal paragraf olarak ekleme yapar
        result += '<p class="mb-4">' + pText + '</p>';
      }
    }
    return result;
  }
}