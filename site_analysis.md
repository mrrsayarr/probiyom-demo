# Probiyom Web Sitesi Çalışma ve Veri Akış Rehberi

Bu doküman, **Probiyom** web sitesinin yazılımsal mimarisini, sayfa yapısını, hangi verinin (metin, resim, link vb.) hangi dosyadan çekilerek nasıl yüklendiğini detaylı bir şekilde açıklamaktadır.

---

## 1. Genel Mimari ve Çalışma Mantığı

Probiyom web sitesi, modern bir **Single Page Application (SPA - Tek Sayfa Uygulaması)** olarak tasarlanmıştır. 
* **Tek Giriş Noktası:** Tüm site [index.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/index.html) dosyası üzerinden yüklenir.
* **Sunucu Tarafı Olmayan Yapı (Serverless/Static):** Sitede bir veritabanı veya dinamik API sunucusu bulunmaz. Bunun yerine tüm içerikler (ürünler, bloglar, sıkça sorulan sorular, site bilgileri) [data/](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data) klasöründeki statik JavaScript dosyalarında (`.js` formatında nesneler olarak) saklanır.
* **Dinamik Yükleme (Routing):** Ziyaretçi menüden bir sayfaya tıkladığında, tarayıcı adres satırındaki hash değeri (örneğin `#home`, `#about`, `#products`, `#blog`) değişir. Bu değişimi yakalayan [scripts/router.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/scripts/router.js) dosyası, ilgili sayfa şablonunu (örneğin `pages/home.html`) asenkron olarak çeker (`fetch`) ve [index.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/index.html) içerisindeki `#page-content` alanına yerleştirir. Ardından ilgili verileri bu şablonun üzerine dinamik olarak yazar (hydrates).

---

## 2. Klasör ve Dosya Yapısı

Sitenin ana dizin yapısı ve temel işlevleri şu şekildedir:

```text
probiyom-website-main/
│
├── index.html                  # Sitenin ana giriş kapısı (iskelet)
│
├── data/                       # Verilerin saklandığı JavaScript dosyaları
│   ├── site.js                 # Şirket iletişim, sosyal medya ve harita koordinatları
│   ├── products.js             # Ürün grupları, tanıtım metinleri ve tüm ürün listesi
│   ├── blogs.js                # Blog yazıları, içerikleri ve resim yolları
│   ├── faqs.js                 # Sıkça Sorulan Sorular (Soru - Cevap çiftleri)
│   ├── slides.js               # Ana sayfa ve Ürünler sayfasındaki slider görselleri
│   └── subjects.js             # İletişim formundaki mesaj konuları
│
├── pages/                      # Sayfaların HTML şablonları (Partials)
│   ├── home.html               # Ana sayfa şablonu
│   ├── about.html              # Hakkımızda şablonu
│   ├── products.html           # Ürün grupları genel listeleme şablonu
│   ├── product-group.html      # Belirli bir ürün grubunun detay şablonu
│   ├── blog.html               # Blog genel listeleme şablonu
│   ├── faq.html                # SSS şablonu
│   ├── contact.html            # İletişim sayfası şablonu
│   └── not-found.html          # 404 Hata sayfası şablonu
│
├── scripts/                    # Dinamik işlevleri sağlayan JavaScript bileşenleri
│   ├── app.js                  # Uygulama başlatıcı (Navbar, Footer ve Router'ı yükler)
│   ├── router.js               # Hash tabanlı yönlendirici ve sayfa doldurucuları
│   ├── navbar.js               # Dinamik menü ve mobil/masaüstü navigasyon yönetimi
│   ├── footer.js               # Dinamik footer bileşeni
│   ├── slider.js               # Otomatik dönen görsel kaydırıcı (Carousel) bileşeni
│   ├── product-grid.js         # Ürünleri kart yapısında ızgara olarak listeleyen bileşen
│   ├── blog.js                 # Blog yazılarını listeleyen bileşen
│   ├── faq.js                  # SSS Soru-Cevap akordeon bileşeni
│   ├── contact-form.js         # İletişim formu doğrulama ve mailto tetikleme
│   ├── contact-map.js          # OpenLayers kütüphanesi ile harita çizimi
│   └── helpers.js              # HTML güvenlik filtreleri (XSS önleme ve biçimlendirme)
│
└── styles/                     # Görsel tasarımları belirleyen CSS dosyaları
    └── main.css                # Tüm sitenin stil kuralları, renk paleti ve responsive düzenleri
```

---

## 3. Sayfa Sayfa Veri Akış Haritası

Hangi sayfanın, hangi veriyi nereden çekip kullanıcıya gösterdiğine dair detaylı tablo:

| Sayfa (Hash Rota) | Yüklenen HTML Şablonu | Kullanılan Veri Dosyası (JS Değişkeni) | Verinin Çekildiği Alan ve Açıklama |
| :--- | :--- | :--- | :--- |
| **Genel Şablon (Header / Nav)** | [index.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/index.html) (Statik) | [data/products.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/products.js) (`GroupSlugToEnum`, `ProductGroupLabels`) | **Menü Linkleri:** Ürün grupları dinamik olarak okunup üst menüdeki "Ürünlerimiz" açılır listesine link (`#products/<slug>`) ve başlık olarak eklenir. |
| **Genel Şablon (Footer)** | [index.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/index.html) (Statik) | [data/site.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/site.js) (`SiteData`) | **İletişim ve Adres:** Şirketin adresi, telefonu, e-postası ve Instagram, X, LinkedIn, YouTube sosyal medya linkleri alt bilgiye yazılır. |
| **Ana Sayfa** (`#home` veya boş) | [pages/home.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/pages/home.html) | [data/slides.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/slides.js) (`homeSlides`, `productSlides`) | **Ana Slayt:** Üst kısımdaki büyük görseller (`homeSlides`) yüklenir. <br>**Ürün Grupları Slaytı:** Alt kısımdaki ürün kategori slaytları (`productSlides`) linkleri ile yerleştirilir. <br>**Statik Metinler:** "Probiyotik Teknoloji Nedir?" vb. başlıklar şablonun içinden okunur. |
| **Hakkımızda** (`#about`) | [pages/about.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/pages/about.html) | [data/site.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/site.js) (`SiteData`) | **Adres ve İletişim Bilgileri:** Sayfanın altındaki iletişim alanları `SiteData` içinden çekilir.<br>**Vizyon & Misyon:** `about.html` içindeki statik metinlerden gelir. |
| **Ürünler Genel** (`#products`) | [pages/products.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/pages/products.html) | [data/slides.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/slides.js) (`productSlides`) | **Ürün Grubu Seçim Sliderı:** Kullanıcının ürün gruplarına tıklamasını sağlayan slider (`productSlides`) yüklenir. |
| **Ürün Grubu Detay** (`#products/<slug>`) | [pages/product-group.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/pages/product-group.html) | [data/products.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/products.js) (`ProductGroupLabels`, `ProductGroupIntroText`, `products`) | **Grup Tanıtım Metinleri:** Seçilen gruba ait başlık, giriş maddeleri (`bullets`), açıklama paragrafı, uyarı metni ve görsel (`imageDir`) `ProductGroupIntroText` nesnesinden çekilir.<br>**Ürün Kartları:** Bu gruba ait olan ürünler `products` dizisinden filtrelenerek ad, açıklama, özellikler, resim ve stok durumu ("Mevcut"/"Yakında") olarak listelenir. |
| **Blog** (`#blog`) | [pages/blog.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/pages/blog.html) | [data/blogs.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/blogs.js) (`blogPosts`) | **Blog Yazıları:** Tüm blog yazılarının başlıkları, detaylı metinleri (`text`) ve görselleri (`imageDir`) bu dosyadan döngüyle çekilip kartlar halinde basılır. |
| **Sıkça Sorulan Sorular** (`#faq`) | [pages/faq.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/pages/faq.html) | [data/faqs.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/faqs.js) (`faqs`) | **Akordeon SSS Listesi:** Sorular ve cevaplar çekilir. Cevaplardaki `<strong>`, `<br>` gibi biçimlendirmeler `helpers.js`'teki süzgeçten geçirilerek güvenle gösterilir. |
| **İletişim** (`#contact`) | [pages/contact.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/pages/contact.html) | [data/site.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/site.js) (`SiteData`), [data/subjects.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/subjects.js) (`MessageSubjects`), [data/products.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/products.js) (`ProductGroupLabels`) | **İletişim Detayları:** Telefon, e-posta ve sosyal medya linkleri `SiteData`'dan alınır.<br>**Harita Koordinatları:** Haritayı merkezlemek için `SiteData.lat` ve `SiteData.lon` koordinatları OpenLayers harita motoruna iletilir.<br>**Form Seçenekleri:** Konu başlıkları `MessageSubjects` dosyasından, ürün grubu listesi ise `ProductGroupLabels` üzerinden dinamik olarak formdaki select kutularına yüklenir. |

---

## 4. Detaylı Kod ve Veri Bağlantıları

### A. İletişim Bilgileri ve Harita
* **Nereden Çekiliyor:** [data/site.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/site.js)
```javascript
var SiteData = {
    address1: "Merdivenköy Mahallesi, Dikyol Sokak, B Blok, No 2/179",
    address2: "Kadıköy, İstanbul, Türkiye, 34732",
    phone: "+90-532-346-48-84",
    email: "probiyom@idolinvest.com",
    instagram: "https://www.instagram.com/probiyom/",
    x: "https://x.com/probiyom",
    linkedin: "https://www.linkedin.com/company/probiyom",
    youtube: "https://www.youtube.com/@Probiyom",
    lat: 40.992680,
    lon: 29.068512,
};
```
* **Nereye ve Nasıl Aktarılıyor:** 
  1. `initContactPage()` fonksiyonu ([scripts/router.js:L213-267](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/scripts/router.js#L213-267)), bu nesneden telefon linklerini (`tel:+90...`), e-posta linklerini (`mailto:...`) ve sosyal medya URL'lerini okuyup DOM elementlerine (`contact-phone`, `contact-email`, vb.) enjekte eder.
  2. `ContactMap(mapEl, SiteData.lon, SiteData.lat, 15)` çağrılarak harita oluşturulur. [scripts/contact-map.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/scripts/contact-map.js) içerisinde OpenLayers kütüphanesi kullanılarak bu koordinatlara bir işaretçi (marker) yerleştirilir.

### B. Ürün Grupları ve Ürün Detayları
* **Nereden Çekiliyor:** [data/products.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/products.js)
  * `ProductGroup` (Enum): Ürün gruplarını sayısal kimliklerle eşleştirir (örn. `HomeCleaning: 2`).
  * `ProductGroupLabels`: Sayısal kimlikleri Türkçe isimlerle eşleştirir (örn. `ProductGroup.HomeCleaning = "Ev Temizlik Ürünleri"`).
  * `GroupSlugToEnum`: URL slug'larını enum değerleriyle eşleştirir (örn. `home_cleaning` -> `ProductGroup.HomeCleaning`). Bu sayede adres satırında `#products/home_cleaning` yazıldığında hangi grubun yükleneceği tespit edilir.
  * `ProductGroupIntroText`: Her ürün grubu sayfasının üstünde bulunan tanıtım alanı.
    * Örnek (Ev Temizlik Ürünleri):
      ```javascript
      ProductGroupIntroText[ProductGroup.HomeCleaning] = {
        heading: "Geleneksel kimyasal temizlik ürünleri...",
        bullets: ["Dengeli bir mikrobiyom oluşmasını sağlamaz", ...],
        paragraph: "Bu nedenlerle, geleneksel temizlik yaklaşımları...",
        warning: "",
        imageDir: "images/products_pages/pp_2.png",
        imageName: "Home Cleaning Products"
      };
      ```
  * `products` (Dizi): Sitedeki tüm ürünlerin listesidir. Her ürün şu yapıyı içerir:
    * `id`: Ürün barkod/kod numarası.
    * `group`: Ait olduğu grubun enum ID'si.
    * `name`: Ürün adı.
    * `description`: Ürün açıklaması (paragraf).
    * `imageDir`: Ürün görselinin diskteki yolu.
    * `isAvailable`: Satış durumu (Mevcut/Yakında).
    * `bullets`: Ürünün temel faydalarını listeleyen dizi.
* **Nereye ve Nasıl Aktarılıyor:**
  * Router içindeki `initProductGroupPage(slug)` fonksiyonu çalıştırılır. 
  * İlk olarak slug'a ait tanıtım metinleri (`ProductGroupIntroText`) okunarak [pages/product-group.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/pages/product-group.html) şablonundaki `id="group-header"` alanına yazılır.
  * İkinci olarak, `products` dizisindeki tüm ürünler taranarak sadece o gruba ait olanlar filtrelenir.
  * Filtrelenen liste [scripts/product-grid.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/scripts/product-grid.js) bileşenine gönderilir. Bu bileşen dinamik olarak HTML kartları üretir ve `id="group-products"` alanına basar.

### C. Blog İçerikleri
* **Nereden Çekiliyor:** [data/blogs.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/blogs.js)
  * `blogPosts`: Sitedeki tüm blog makalelerini tutan dizidir.
  * Örnek blog yapısı:
    ```javascript
    {
      title: "Çamaşır Yıkarken Gizli Tehlike: Yumuşatıcılar...",
      text: "Evlerimizde <strong>temizlik ve tazelik</strong>...",
      imageDir: "images/blogs/blog_5_loundry.jpg",
      imageName: "Alt açıklama metni"
    }
    ```
* **Nereye ve Nasıl Aktarılıyor:**
  * Rota `#blog` olduğunda `initBlogPage()` tetiklenir ve `BlogList(listEl, blogPosts)` fonksiyonu ([scripts/blog.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/scripts/blog.js)) çağrılır.
  * Bu script, blog yazısının başlığını (`title`), görselini (`imageDir`) ve gövde metnini (`text`) okur. Gövde metnindeki HTML karakterleri `escapeHtml` süzgecinden geçirilir ve `id="blog-list"` içerisine kartlar halinde yerleştirilir.

### D. SSS (Sıkça Sorulan Sorular)
* **Nereden Çekiliyor:** [data/faqs.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/faqs.js)
  * `faqs` dizisindeki nesneler:
    ```javascript
    {
      question: "Probiyotik temizlik ürünleri nedir ve nasıl çalışır?",
      answer: "Probiyotik temizlik ürünlerimiz, <strong>faydalı bakterilerin...</strong>"
    }
    ```
* **Nereye ve Nasıl Aktarılıyor:**
  * `#faq` rotasında `initFaqPage()` tetiklenerek `FaqList(listEl, faqs)` çalıştırılır ([scripts/faq.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/scripts/faq.js)).
  * Soru kısımları buton başlıklarına yazılır.
  * Cevap kısımları (`answer`) ise [scripts/helpers.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/scripts/helpers.js) içerisindeki `formatText(str)` fonksiyonundan geçirilerek ekrana basılır. Bu sayede cevap metnindeki `<strong>`, `<u>`, `<em>` ve `<br>` gibi zengin metin etiketleri güvenle HTML olarak yorumlanır, diğer tehlikeli kodlar ise filtrelenir.
  * Ayrıca her butona `click` olayı atanarak akordeon (açılır-kapanır menü) mekanizması kurulur.

### E. İletişim Formu Konuları ve Gönderim Mekanizması
* **Nereden Çekiliyor:** [data/subjects.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/subjects.js) ve [data/products.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/products.js)
  * `MessageSubjects` dizisi: İletişim formunda "Mesaj Konusu" açılır kutusundaki seçenekleri sunar (`Sipariş`, `Bilgi İsteği`, `Öneri` vb.).
  * `ProductGroupLabels`: İletişim formunda "Ürün Grubu" açılır kutusundaki seçenekleri sunar.
* **Nereye ve Nasıl Aktarılıyor:**
  * [scripts/contact-form.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/scripts/contact-form.js) içindeki `ContactForm` bileşeni formu oluştururken bu iki veriyi okur ve `<option>` etiketlerini dinamik olarak üretir.
  * Form doldurulup "E-mail Uygulamasında Aç" butonuna tıklandığında, kullanıcının girdiği bilgiler derlenir ve varsayılan e-posta istemcisini (Outlook, Thunderbird, Mail vb.) tetiklemek üzere `mailto:probiyom@idolinvest.com?subject=...&body=...` linkine yönlendirme (`window.location.href = mailto;`) yapılır.

---

## 5. Görsel Öğeler (Slider ve Resimler)

Sitedeki tüm slayt gösterileri [scripts/slider.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/scripts/slider.js) içerisindeki `ImageSlider` modülü tarafından kontrol edilir:
* Slaytların resim yolları (`src`), alt metinleri (`alt`), varsa üzerine yazılacak başlık (`title`) ve tıklandığında gidilecek yönlendirme linki (`link`) [data/slides.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/slides.js) içinden okunur.
* Her 3.5 saniyede bir (`SLIDER_DURATION_MS = 3500`) slayt otomatik olarak ilerler. Sağ üst köşedeki duraklat/oynat butonu ile bu akış durdurulabilir.

---

## 6. Güvenlik ve Yardımcı İşlevler (Helpers)

Dinamik HTML oluşturulurken güvenlik zafiyetlerini (XSS) önlemek amacıyla [scripts/helpers.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/scripts/helpers.js) içerisindeki şu süzgeçler kullanılır:
1. `escapeHtml(str)`: Metindeki `<`, `>`, `&`, `"` gibi karakterleri HTML entity karşılıklarına (`&lt;`, `&gt;` vb.) dönüştürerek tarayıcının bunları zararlı bir kod olarak çalıştırmasını engeller.
2. `escapeAttr(str)`: HTML niteliklerinde (örneğin resimlerin `alt` veya `src` etiketlerinde) kullanılabilecek çift tırnak karakterlerini temizler.
3. `formatText(str)`: Cevap veya açıklama metinlerinin tamamını güvenli hale getirdikten sonra, sadece belirli biçimlendirme etiketlerine (`<strong>`, `<em>`, `<u>`, `<br>`) izin verir.
