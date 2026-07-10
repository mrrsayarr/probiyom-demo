# Probiyom Web Sitesi Tasarım ve Performans Optimizasyon Planı

Bu doküman, sitede **Bootstrap benzeri (grid ve utility sınıfı temelli)** modern bir tasarım yapısını korurken, sayfa açılış hızını (LCP, FCP vb.) en yüksek seviyede tutmak için uygulayabileceğimiz stratejileri içermektedir.

---

## 1. Neden Tüm Bootstrap Kütüphanesini Yüklememeliyiz?

Tüm Bootstrap paketini (`bootstrap.min.css` ve `bootstrap.min.js`) projeye eklemek şu dezavantajları getirir:
* **Büyük Dosya Boyutu:** Yaklaşık 200 KB boyutunda CSS ve JS tarayıcıyı bloke eder (Render-blocking).
* **Kullanılmayan Kod (Unused CSS):** Sitede Bootstrap bileşenlerinin (Örn: Modallar, Tooltipler, Carousel JS vb.) %90'ı kullanılmayacaktır.
* **Tasarım Çakışması:** Mevcut [styles/main.css](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/styles/main.css) kuralları ile Bootstrap kuralları ezme (override) savaşına girer, kod karmaşıklaşır.

---

## 2. Performansı Etkilemeden Bootstrap Konforu Sağlama Yöntemleri

### A. Sadece Bootstrap Grid ve Utilities Paketlerini Kullanmak (Önerilen 1)
Eğer Bootstrap'in 12'li kolon düzenini (`col-md-6`, `row`, `container`) ve yardımcı sınıflarını (`d-flex`, `justify-content-between`, `py-3`) seviyorsanız, tüm kütüphane yerine sadece bu modülleri yükleyebilirsiniz:
* **Bootstrap Grid Solo:** Sadece grid yapısını içerir (~48 KB).
* **Bootstrap Utilities Solo:** Sadece margin, padding, flexbox sınıflarını içerir (~30 KB).
* **Nasıl Eklenir?**
  [index.html](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/index.html) içerisine CDN üzerinden sadece bu alt paketleri ekleyebiliriz:
  ```html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-grid.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-utilities.min.css">
  ```

### B. Kendi Mini-Bootstrap Yapımızı Yazmak (En Hızlı ve En Temiz Yol - Önerilen 2)
Mevcut CSS dosyalarımızı (örneğin [styles/layout.css](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/styles/layout.css) ve [styles/base.css](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/styles/base.css)) CSS Grid ve Flexbox kullanarak modernize edebiliriz. Ekstra 0 KB kütüphane yüküyle şu sınıfları tanımlayabiliriz:

```css
/* Flexbox Yardımcı Sınıfları */
.d-flex { display: flex; }
.flex-col { flex-direction: column; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }

/* Grid Sistemi */
.grid { display: grid; gap: 1rem; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }

/* Padding/Margin Utility (Boşluklar) */
.m-0 { margin: 0; }
.p-2 { padding: 0.5rem; }
.py-4 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
```

### C. Hafif Alternatif CSS Framework'leri Kullanmak
Bootstrap yerine sadece bu iş için optimize edilmiş modern ve tüy siklet kütüphaneleri tercih edebiliriz:
1. **Pico.css (~10 KB):** HTML etiketlerine doğrudan stil giydirir. Hiç sınıf yazmadan sitenin Bootstrap gibi şık durmasını sağlar.
2. **Pure.css (~4 KB):** Yahoo tarafından geliştirilen, sadece temel grid ve form stillerini içeren dünyanın en küçük CSS kütüphanelerinden biridir.

---

## 3. Web Sitesini Uçuracak Hız Optimizasyonu Teknikleri

CSS dışında sitenin açılış hızını zirveye taşıyacak adımlar:

### 1. Görsel Optimizasyonu (En Büyük LCP İyileştirmesi)
* Sitedeki slider ve ürün görsellerini `.jpg`/`.png` formatından **`.webp`** formatına dönüştürmeliyiz. WebP kaliteden ödün vermeden dosya boyutunu %70'e kadar küçültür.
* Tüm `<img>` etiketlerine `loading="lazy"` ekleyerek sadece ekrana giren resimlerin yüklenmesini sağlamalıyız:
  ```html
  <img src="resim.webp" loading="lazy" alt="Açıklama">
  ```

### 2. Kritik CSS'i Ayırmak (Critical CSS)
* Sayfa ilk açıldığında görünen üst kısım (Header ve ilk Slayt) stillerini `<head>` içinde `<style>` olarak inline yazıp, geri kalan [styles/main.css](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/styles/main.css) dosyasını asenkron yükletebiliriz.

### 3. Font Yüklemelerini Optimize Etmek
* Google Fonts bağlantılarına `display=swap` parametresi eklenmiş (bizim sitemizde zaten ekli). Bu sayede font yüklenene kadar sistem fontu gösterilir ve içerik gecikmez.

### 4. Tarayıcı Önbelleklemesi (Caching)
* Statik veri dosyaları ([data/products.js](file:///c:/Users/msy/Desktop/Probiyom/probiyom-website-main/data/products.js) vb.) nadir değiştiği için sunucu tarafında bu dosyalar için uzun süreli `Cache-Control` başlıkları tanımlanmalıdır.
