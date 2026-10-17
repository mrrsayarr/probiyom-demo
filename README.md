# Probiyom

Probiyom’un probiyotik ve sinbiyotik temizlik ürünlerini, ürün gruplarını ve blog yazılarını sunan kurumsal web sitesi.

Arayüz HTML, CSS ve JavaScript ile hazırlanmıştır. Node.js derlemesi, her sayfa için içeriği ve SEO etiketleri hazır ayrı HTML belgeleri üretir. Tarayıcıdaki yönlendirici, menü geçişlerini tam sayfa yenilemeden gerçekleştirir. Cloudflare Workers ve Plesk için ayrı yayın çıktıları hazırlanır.

## Hızlı başlangıç

Node.js ve npm kurulu olmalıdır. Proje klasöründe:

```sh
npm ci
npm start
```

`npm ci`, kilit dosyasındaki bağımlılıkları yükler. `npm start` önce güncel içerikten build alır, ardından önizleme sunucusunu açar.

Önizleme: http://localhost:7076/ — kapatmak için terminalde **Ctrl+C** kullanın.

Farklı bir port için:

```sh
npm start -- 7077
```

Derleme Node.js ve `linkedom` kullanır; Chromium, Playwright, Python veya sistem paketi kurulumu gerekmez. Önizleme sunucusu `serve.mjs` dosyasıdır.

## Sayfa yapısı

Ana sayfalar:

```text
/             Ana sayfa: slider, teknoloji anlatımı, ürün grupları ve sertifikalar
/about/       Hakkımızda
/products/    Tüm ürün grupları
/blog/        Blog yazıları
/faq/         Sıkça sorulan sorular
/contact/     İletişim bilgileri, harita, form ve Trendyol duyurusu
```

Ürün grupları:

```text
/products/professional_cleaning/       Profesyonel temizlik
/products/home_cleaning/               Ev temizlik ürünleri
/products/personal_care/               Kişisel bakım
/products/cold_mist_spraying/           Soğuk sis ve püskürtme
/products/industrial_water_treatment/  Endüstriyel su arıtma
/products/livestock/                   Hayvancılık
/products/pet/                         Evcil hayvan ürünleri
```

Blog detayları `/blog/yazi-basligi/` biçimindedir. Mevcut yazılar `data/blogs.js` üzerinden oluşturulur. Ürünler, ilgili grup sayfasında listelenir; her ürünün ayrı bir detay adresi bulunmaz.

Sayfa adresleri `/` ile biter. Eski `/#blog/...` bağlantıları tarayıcıda ilgili blogun yeni adresine taşınır. Bulunmayan adresler gerçek **404** yanıtı döndürür.

## Temel dosyalar ve görevleri

```text
index.html                 Ortak HTML kabuğu, Google etiketleri ve temel metaveri
data/                      İçerik ve site ayarları
  site.js                  İletişim, sosyal medya, mağaza ve popup ayarları
  seo.js                   Sayfalara özel SEO başlıkları, açıklamalar ve ilgili ürünler
  categories.js            Ana sayfa ve ürünler sayfasının ortak kategori kartları
  products.js              Ürünler, grup tanımları ve grup açıklamaları
  blogs.js                 Blog metinleri, görselleri ve yayın tarihleri
  faqs.js                  Soru ve cevaplar
  slides.js                Ana sayfa slider içeriği ve süresi
  subjects.js              İletişim formunun konu seçenekleri
  image-assets.js          Build tarafından üretilen görsel boyutu/srcset bilgileri
pages/                     Sayfaların HTML şablonları
styles/                    Genel ve bileşen bazlı stiller
  vendor/                  Yerel Bootstrap dosyaları ve Inter fontları
scripts/                   Bileşenler, yönlendirme ve derleme kodu
images/                    Site görselleri
  categories/              Ürün grubu kartlarının görselleri
  optimized/               Farklı ekran boyutları için hazırlanmış görsel varyantları
serve.mjs                  Yerel önizleme ve yönlendirme kontrolleri
wrangler.jsonc             Cloudflare Worker ve Static Assets yapılandırması
_headers                   Statik dosyaların HTTP başlık kuralları
robots.txt                 Arama motoru tarama yönergeleri
sitemap.xml                Build tarafından üretilen site haritası
llms.txt                   Site ve kaynak bağlantılarını açıklayan Markdown dosyası
dist/                      Cloudflare build çıktısı; elle düzenlenmez
dist-plesk/                Plesk için bağımsız HTML sayfaları ve statik dosyalar
```

Yönlendirme ve SEO akışı:

- `scripts/site-routes.js`: Sayfa adresleri ve şablon eşleştirmeleri.
- `scripts/router.js`: Tarayıcı içi gezinme, eski bağlantılar ve sayfa yükleme.
- `scripts/page-controllers.js`: Sayfa bileşenlerinin kurulması ve temizlenmesi.
- `scripts/page-seo.js`: Sayfaya özel başlık, açıklama, canonical ve JSON-LD.
- `scripts/build-seo.cjs` ve `scripts/seo-worker.mjs`: HTML üretimi ve Cloudflare’da doğru belgenin sunulması.

## İçerik nasıl güncellenir?

### Ürünler ve kategori kartları

Ürün adı, açıklaması, görseli, maddeleri ve mevcut/yakında durumu `data/products.js` içindedir.

Ürün grubu kartlarının fotoğrafı, açıklaması, simgesi ve alternatif görsel metni `data/categories.js` üzerinden değiştirilir. Bu kartlar ana sayfada ve Ürünlerimiz sayfasında aynı kaynaktan gösterilir. Grup sayfalarının tanıtım içeriği ise `data/products.js` içindeki grup tanımlarında bulunur.

### Blog yazıları

`data/blogs.js` içindeki `blogPosts` dizisine yazı ekleyin veya mevcut kaydı düzenleyin. Metin içindeki `**kalın yazılar**` okunabilir biçimde gösterilir; dış kaynaklar `<a href="https://...">Kaynak adı</a>` biçiminde eklenebilir.

Yayın tarihi kullanılacaksa ilgili kayda ISO biçiminde alan ekleyin:

```js
datePublished: "2026-10-17",
```

Tarih yalnızca bu alanı bulunan yazılarda gösterilir; görünür yazar adı Probiyom’dur. Adres, kayıtta `slug` varsa bu değerden, yoksa başlıktan üretilir. Yayınlanmış bir yazının başlığını değiştirirken mevcut adresini korumak için önce eski slug değerini kayda açıkça ekleyin.

### SSS ve iletişim

Soru ve cevaplar `data/faqs.js` içinden düzenlenir. İletişim bilgileri ve sosyal bağlantılar `data/site.js`, formun konu seçenekleri `data/subjects.js` içindedir.

İletişim formu Web3Forms üzerinden gönderim yapar. Gönderim kodu ve servis anahtarı `scripts/contact-form.js` içindedir. Arayüz testi gerçek e-posta teslimini doğrulamaz; yayın sonrası teslim ayrıca kontrol edilmelidir.

### Trendyol duyurusu

Mağaza bağlantısı `data/site.js` içindeki `trendyol` alanıdır. Popup’ın görünürlüğü, görsel adresi ve alternatif metni aynı dosyadaki `storeAnnouncement` ayarlarından yönetilir.

Mağaza popup’ı her tam sayfa açılışında veya yenilemede otomatik olarak bir kez görünür; site içi menü geçişlerinde tekrarlanmaz. Görsel `images/trendyol-popup.webp` dosyasından gelir ve mobilde tamamı gösterilir. Mağaza bağlantısı ile görünürlük ayarları `data/site.js` üzerinden yönetilir. İletişim sayfasındaki mağaza duyurusu da korunur.

### Görseller

Görselleri uygun boyutta WebP olarak hazırlayın ve içeriği anlatan alternatif metin kullanın. Build, mevcut optimize varyantları `srcset` ile bağlar ve görsel boyutlarını HTML’e ekler; yeni küçük görselleri kendisi üretmez.

Bir görselin dosyası değişirse eski optimize varyantlar yeni dosyayla eşleştirilmez. Yeni varyantlar hazırlanana kadar asıl görsel kullanılır. `data/image-assets.js` dosyasını elle düzenlemeyin.

## SEO ve Google etiketleri

Her sayfa için ayrı başlık, açıklama, canonical ve uygun yapılandırılmış veri üretilir. Canonical adreslerde `https://www.probiyom.com` kullanılır. Sayfa şablonları bağımsız arama sonuçları olarak indekslenmemeleri için `noindex` başlığıyla sunulur.

Arama ve sosyal paylaşım özetlerini `data/seo.js` üzerinden düzenleyin. Anahtarlar kalıcı sayfa yollarıdır; SEO başlığını değiştirmek yazının görünen başlığını veya URL’sini değiştirmez. Yeni blogların özeti için de bu dosyaya kayıt eklenebilir. `groups` alanı yazı sonundaki ilgili ürünleri ve benzer içerikleri belirler. Yayın tarihleri `data/blogs.js` içinde tutulur; bilinmeyen tarihler üretilmez.

Sayfa konumu bağlantıları yalnızca ürün grubu detaylarında ve blog yazılarında gösterilir; BreadcrumbList şeması bu görünür bağlantılarla eşleşir. Mobilde bağlantılar daha küçük yazı ve aralıklarla sunulur. Ürün grupları ürün listesi sayfalarıdır; kategori kartları tekil ürün gibi işaretlenmez. Yayın çıktısındaki HTML şablonları ayrıca `noindex` meta içerir; yönlendirici bu yalnızca şablona ait etiketi sayfaya eklemeden önce temizler.

- Google Tag Manager kapsayıcısı: `GTM-578BDWC9`. Kod ve `noscript` yedeği `index.html` içindedir.
- Search Console doğrulama metaları ve doğrulama HTML dosyası korunmalıdır.
- `sitemap.xml`, build sırasında kayıtlı sayfalardan yeniden üretilir.
- `robots.txt` ve `llms.txt` elle yönetilir; yeni içerik eklerken bağlantılarını gözden geçirin.

Analytics ve Ads ölçümleri GTM üzerinden çalışır. Aynı ölçüm kodlarını ikinci kez eklemeden önce GTM yapılandırmasını kontrol edin.

## Derleme ve kontrol

```sh
npm run build
node serve.mjs --check
```

Build; sayfaları, SEO belgelerini, site haritasını ve içeriklerine göre sürümlenmiş CSS/JS dosyalarını `dist/` içine hazırlar. Kontrol komutu geçici bir portta çalışır; sayfa yanıtlarını, yönlendirmeleri, 404 davranışını ve dahili dosya korumasını doğrulayıp kapanır.

Kaynak değişikliklerini `data/`, `pages/`, `styles/` veya `scripts/` altında yapın. `dist/` içindeki elle yapılan değişiklikler sonraki build’de üzerine yazılabilir.

## Plesk yayını

### GitHub üzerinden otomatik hazırlama (önerilen)

Günlük akış: kaynak dosyaları GitHub'daki **main** dalında düzenleyin. **Actions → Plesk yayinini hazirla** kontrolü yeşil olduğunda Plesk'te **Pull now → Deploy now** yapın. ZIP yüklemek veya hosting üzerinde npm çalıştırmak gerekmez. Plesk'in mevcut webhook/otomatik yayın bağlantısı ayrıca etkinse yayın dalındaki değişiklikleri o bağlantı üzerinden alabilir.

İlk kurulum bir kez yapılır:

1. `.github/workflows/plesk.yml` dosyasını ve güncel proje kaynaklarını GitHub'daki `main` dalına yükleyin. `scripts/build-seo.cjs` ve `package.json` içindeki `build:plesk` komutu da güncel olmalıdır.
2. GitHub **Actions** sekmesinde **Plesk yayinini hazirla** işinin başarıyla tamamlanmasını bekleyin. İş akışı, hazır HTML ve statik dosyalar içeren `plesk` dalını otomatik oluşturur. GitHub Actions'ın etkin olması gerekir; ayrıca token veya FTP şifresi girilmez. Kuruluş politikası yazma iznini engelliyorsa bu politika yöneticiniz tarafından düzenlenmelidir.
3. Plesk **Git → Repository Settings** bölümünde **Repository branch** alanını `plesk` seçin. Yeni dal görünmüyorsa önce **Pull now** ile uzak dalları güncelleyin. **Deployment directory** `/httpdocs` olarak kalsın; **Enable post deployment actions** kapalı olsun.
4. **Hosting Settings → Document root** `httpdocs` olarak kalsın. Önceki yöntemde `httpdocs/dist-plesk` yaptıysanız build tamamlandıktan sonra `httpdocs` olarak değiştirin. Plesk'te **Pull now → Deploy now** yapın.
5. `/blog/`, `/products/` ve bir yazı adresini yeni sekmede açıp yenileyin.

İçerikleri daima **main** dalında düzenleyin. `plesk` dalı otomatik üretilir; elle yapılan değişiklikler sonraki başarılı build'de değiştirilir. Build veya doğrulama başarısız olursa yayın dalı güncellenmez. İş akışı yalnızca `main` değişikliklerinde çalışır, yayın dalı kendi kendini tekrar tetiklemez. Plesk'te `main` dalını tekrar yayınlamayın; bu dal kaynak kodu içerir.

### Elle paket hazırlama (alternatif)

Yerel bilgisayarda:

```sh
npm ci
npm run build:plesk
```

`dist-plesk/` klasörünün **içindekileri**, gizli `.htaccess` dosyaları dahil, Plesk alan adının belge köküne (genellikle `httpdocs/`) yükleyin. Önce mevcut yayının yedeğini alın. `index.html`, `blog/`, `products/` ve `images/` belge kökünde aynı seviyede bulunmalıdır; üstte fazladan `dist-plesk/` klasörü bırakmayın. Hazır çıktı için hosting üzerinde Node.js çalıştırılması gerekmez.

Hazır paketi elle yüklerken de **Document root** `httpdocs` olarak kalır. Kaynak proje kökü doğrudan yayınlanmamalıdır.

Bu çıktı, 22 sayfanın her birini kendi `index.html` dosyasıyla sunar. Menüden gezinmeden açılan blog ve ürün adresleri de çalışır. Apache için `.htaccess`; eski sayısal blog adreslerini kalıcı yönlendirir, özel 404 sayfasını, önbellek ve güvenlik başlıklarını ayarlar. Tüm adresleri ana sayfaya yönlendiren SPA kuralı eklemeyin.

Apache kurallarının uygulanması için Plesk Apache & nginx Settings bölümünde Proxy mode ve Smart static files processing kullanılabilir. HTML dosyaları doğrudan nginx tarafından sunulursa `.htaccess` kuralları uygulanmaz; bu durumda HTML uzantısını doğrudan sunulan dosyalardan çıkarın veya eşdeğer nginx ayarlarını hosting yöneticisine uygulatın. Fiziksel sayfa dosyaları her iki sunucuda da kullanılabilir.

Yükleme sonrası `/blog/`, `/products/` ve bir blog detay adresini yeni sekmede açıp yenileyin. Olmayan bir adresin HTTP 404 döndürdüğünü kontrol edin.

## Cloudflare Workers yayını

Cloudflare’daki Git tabanlı yayında:

1. Kaynak dosyaları ve `package-lock.json` dosyasını repoya gönderin.
2. **Build command** alanını `npm run build`, **Deploy command** alanını `npm run deploy` yapın.
3. Yeni dağıtımı başlatın; alan adının doğru Worker’a bağlı olduğunu kontrol edin.

`npm run deploy`, `npx wrangler deploy` çalıştırır. Önce build tamamlanmış olmalıdır. Yerel terminalden de önce `npm run build`, ardından `npm run deploy` kullanın.

Alternatif olarak panelde **Build command** `npm run build`, **Deploy command** `npx wrangler deploy` kullanılabilir. `dist/` Git’te olmadığı için doğrudan deploy çalıştırılan bir akışta build adımı atlanmamalıdır.

Worker giriş dosyası ve asset klasörü `wrangler.jsonc` içindedir. Cloudflare `dist/` çıktısını Worker ile sunar; Plesk için yukarıdaki `dist-plesk/` çıktısını kullanın.

Yayın sonrası ana sayfayı, bir ürün grubunu, bir blog detayını ve iletişim sayfasını açın. Eski bir blog bağlantısını deneyin; GA4 Gerçek Zamanlı ekranında ziyaretin göründüğünü ve form mesajının ilgili adrese ulaştığını kontrol edin.
