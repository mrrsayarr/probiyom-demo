/* ===================================================================
   BlogList – Switches between list overview and dedicated reading view
   =================================================================== */

function BlogList(container, posts, initialPostIndex) {
  if (!posts || posts.length === 0) {
    container.innerHTML = '<div class="empty-state">Henüz blog yazısı eklenmedi.</div>';
    return;
  }

  // Eğer adres satırından doğrudan bir makale indeksi verilmişse (#blog/0 gibi)
  if (initialPostIndex !== undefined && initialPostIndex !== null && !isNaN(initialPostIndex)) {
    var idx = parseInt(initialPostIndex, 10);
    if (idx >= 0 && idx < posts.length) {
      renderDetailView(idx);
    } else {
      renderListView();
    }
  } else {
    renderListView();
  }

  // 1. ÖZET KART LİSTESİ GÖRÜNÜMÜ
  function renderListView() {
    var html = '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">';

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var imageAlt = post.imageName || post.title || '';

      var snippet = getSnippet(post.text, 140);

      var imageHtml = '';
      if (post.imageDir) {
        imageHtml =
          '<div class="blog-post-image position-relative overflow-hidden bg-white">' +
          '<img src="' + escapeAttr(post.imageDir) + '" alt="' + escapeAttr(imageAlt) + '" class="w-100 h-100 object-fit-contain p-2 transition-all">' +
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

    // Karta tıklandığında adres satırındaki hash değerini günceller (#blog/0)
    var cards = container.querySelectorAll('.blog-post');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        window.location.hash = '#blog/' + idx; // Adres satırını güncelleyerek router'ı tetikler
      });
    });
  }

  // 2. TEKİL BLOG YAZISI OKUMA GÖRÜNÜMÜ (Yazı sonuna ikinci buton eklendi)
  function renderDetailView(index) {
    var post = posts[index];
    var imageAlt = post.imageName || post.title || '';

    // Metindeki \n\n işaretlerini düzgün paragraf etiketlerine çeviriyoruz
    var formattedTextHtml = formatBlogText(post.text);

    var imageHtml = '';
    if (post.imageDir) {
      imageHtml =
        '<div class="blog-detail-image rounded-3 overflow-hidden mb-4 shadow-sm bg-white text-center">' +
        '<img src="' + escapeAttr(post.imageDir) + '" alt="' + escapeAttr(imageAlt) + '" class="img-fluid object-fit-contain p-2" style="max-height: 480px; width: auto; margin: 0 auto;">' +
        '</div>';
    }

    var detailHtml =
      '<article class="blog-detail-container max-w-5xl mx-auto py-2">' +
      /* 1. Geri Dön Butonu (Üstte) */
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

      /* YENİ: 2. Geri Dön Butonu (Yazı Bitiminde Altta) */
      '<div class="mt-5 pt-4 border-top border-light-subtle d-flex justify-content-start">' +
      '<button type="button" class="back-to-blog-btn d-inline-flex align-items-center gap-2 text-brand fw-semibold border-0 bg-transparent p-0">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" class="transition-all"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
      'Blog Yazılarına Dön' +
      '</button>' +
      '</div>' +

      '</article>';

    container.innerHTML = detailHtml;

    // Görsele Tıklayınca Lightbox Büyütme
    var detailImg = container.querySelector('.blog-detail-image img');
    if (detailImg) {
      detailImg.style.cursor = 'zoom-in';
      detailImg.addEventListener('click', function () {
        var lightbox = document.createElement('div');
        lightbox.className = 'blog-lightbox';
        lightbox.innerHTML = '<img src="' + escapeAttr(post.imageDir) + '" alt="' + escapeAttr(imageAlt) + '">';
        document.body.appendChild(lightbox);

        requestAnimationFrame(function () {
          lightbox.classList.add('is-active');
        });

        lightbox.addEventListener('click', function () {
          lightbox.classList.remove('is-active');
          setTimeout(function () {
            if (lightbox.parentNode) {
              lightbox.parentNode.removeChild(lightbox);
            }
          }, 300);
        });
      });
    }

    // DÜZELTİLDİ: Hem üstteki hem alttaki 'Geri Dön' butonlarını yakalayan dinleyici
    var backBtns = container.querySelectorAll('.back-to-blog-btn');
    backBtns.forEach(function (backBtn) {
      backBtn.addEventListener('click', function () {
        window.location.hash = '#blog'; // Adresi genel blog listesine çevirir
      });
    });
  }

  function getSnippet(text, maxLength) {
    if (!text) return '';
    var cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength).trim() + '...';
  }

  function formatBlogText(text) {
    if (!text) return '';
    var paragraphs = text.split('\n\n');
    var result = '';

    for (var i = 0; i < paragraphs.length; i++) {
      var pText = paragraphs[i].trim();
      if (!pText) continue;

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
        result += '<p class="mb-4">' + pText + '</p>';
      }
    }
    return result;
  }
}