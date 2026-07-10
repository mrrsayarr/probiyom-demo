/* ===================================================================
   ImageSlider – GPU-Accelerated Fluid Carousel (Fixed controls & Outside dots)
   =================================================================== */

function ImageSlider(container, slides, durationMs) {
  if (!slides || slides.length === 0) return;
  durationMs = durationMs || 5000;

  var activeIndex = 0;
  var timer = null;
  var isPaused = false;
  var slideElements = [];
  var dotElements = [];
  var pauseBtn = null;

  // DOM yapısını sadece BİR KEZ oluşturuyoruz
  function init() {
    var wrapper = document.createElement('div');
    wrapper.className = 'slider-wrapper';

    var frame = document.createElement('div');
    frame.className = 'slider-frame';

    slides.forEach(function (slide, index) {
      var slideDiv = document.createElement('div');
      slideDiv.className = 'slider-slide' + (index === 0 ? ' is-active' : '');

      // Performans Optimizasyonu: 
      // İlk görseli anında (eager), diğerlerini sayfa hızı için gecikmeli (lazy) yüklüyoruz.
      var imgLoading = index === 0 ? 'eager' : 'lazy';

      var imageContainer = '<div class="slider-image-container">' +
        '<img src="' + slide.src + '" alt="' + slide.alt + '" loading="l' + imgLoading + '">' +
        '</div>';

      var titleHtml = slide.title
        ? '<div class="slider-title"><p>' + slide.title + '</p></div>'
        : '';

      var innerContent = imageContainer + titleHtml;

      if (slide.link) {
        slideDiv.innerHTML = '<a href="' + slide.link + '">' + innerContent + '</a>';
      } else {
        slideDiv.innerHTML = innerContent;
      }

      frame.appendChild(slideDiv);
      slideElements.push(slideDiv);
    });

    // Duraklat / Devam et butonu
    if (slides.length > 1) {
      pauseBtn = document.createElement('button');
      pauseBtn.type = 'button';
      pauseBtn.className = 'slider-pause';
      updatePauseButton();
      pauseBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        togglePause();
      });
      frame.appendChild(pauseBtn);
    }

    // Sağa-Sola Kaydırma Okları
    if (slides.length > 1) {
      var prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'slider-arrow slider-arrow-prev';
      prevBtn.setAttribute('aria-label', 'Önceki slayt');
      prevBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
      prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        goTo((activeIndex - 1 + slides.length) % slides.length);
      });

      var nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'slider-arrow slider-arrow-next';
      nextBtn.setAttribute('aria-label', 'Sonraki slayt');
      nextBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
      nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        goTo((activeIndex + 1) % slides.length);
      });

      frame.appendChild(prevBtn);
      frame.appendChild(nextBtn);
    }

    wrapper.appendChild(frame);

    // Noktalı Navigasyon (YENİ: Slider çerçevesinin DIŞINA eklendi)
    if (slides.length > 1) {
      var dotsContainer = document.createElement('div');
      dotsContainer.className = 'slider-dots';

      slides.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider-dot' + (index === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Slayt ' + (index + 1));
        dot.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          goTo(index);
        });
        dotsContainer.appendChild(dot);
        dotElements.push(dot);
      });

      wrapper.appendChild(dotsContainer); // frame yerine wrapper altına (dışarıya) eklendi
    }

    container.innerHTML = '';
    container.appendChild(wrapper);
  }

  function updatePauseButton() {
    if (!pauseBtn) return;
    var pauseIcon = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg>';
    var playIcon = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5z"></path></svg>';
    
    pauseBtn.setAttribute('aria-label', isPaused ? 'Slaytı devam ettir' : 'Slaytı duraklat');
    pauseBtn.innerHTML = isPaused ? playIcon : pauseIcon;
  }

  function updateDOM() {
    slideElements.forEach(function (slide, idx) {
      if (idx === activeIndex) {
        slide.classList.add('is-active');
      } else {
        slide.classList.remove('is-active');
      }
    });

    dotElements.forEach(function (dot, idx) {
      if (idx === activeIndex) {
        dot.classList.add('is-active');
      } else {
        dot.classList.remove('is-active');
      }
    });
  }

  function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
      clearTimeout(timer);
      timer = null;
    } else {
      scheduleNext();
    }
    updatePauseButton();
  }

  function goTo(idx) {
    activeIndex = idx;
    clearTimeout(timer);
    timer = null;
    updateDOM();
    if (!isPaused) {
      scheduleNext();
    }
  }

  function scheduleNext() {
    if (slides.length <= 1) return;
    if (isPaused) return; // Güvenlik Kontrolü: Duraklatılmışsa yeni zamanlayıcı kurmayı engeller
    
    timer = setTimeout(function () {
      activeIndex = (activeIndex + 1) % slides.length;
      updateDOM();
      scheduleNext();
    }, durationMs);
  }

  init();
  if (!isPaused) scheduleNext();

  return {
    destroy: function () {
      clearTimeout(timer);
    },
  };
}