/* Search summaries are independent of visible headings and permanent URLs. */
var SeoContent = {
  home: {
    title: 'Probiyotik ve Sinbiyotik Temizlik Ürünleri',
    description: 'Probiyom ile HeiQ VivoTech ve Synbio teknolojilerini keşfedin. Ev, tesis, kişisel bakım ve endüstriyel kullanım için probiyotik temizlik ürünlerini inceleyin.'
  },
  about: {
    title: 'Hakkımızda: Probiyotik Hijyen Teknolojileri',
    description: 'Probiyom’un yaklaşımını, sektörel deneyimini ve HeiQ teknolojileriyle sunduğu probiyotik temizlik çözümlerini tanıyın. İş birliği için ekibimize ulaşın.'
  },
  products: {
    title: 'Probiyotik Temizlik ve Bakım Ürünleri',
    description: 'Ev ve profesyonel temizlik, kişisel bakım, soğuk sisleme, su arıtma ve hayvan bakımı için Probiyom ürün gruplarını kullanım alanlarına göre keşfedin.'
  },
  contact: {
    title: 'İletişim: Ürün Bilgisi ve İş Birliği',
    description: 'Probiyom ekibine ürün seçimi, kullanım bilgisi, teklif ve iş birliği için ulaşın. İletişim formunu, İstanbul adresimizi ve Trendyol mağazamızı inceleyin.'
  },
  faq: {
    title: 'Probiyotik Temizlik Hakkında Sık Sorulan Sorular',
    description: 'Probiyotik temizliğin çalışma prensibi, ürün seçimi, kullanım sıklığı ve çocuklu ya da evcil hayvanlı evlerde dikkat edilecek noktalar hakkında yanıtlar bulun.'
  },
  blog: {
    title: 'Probiyotik Temizlik, Mikrobiyom ve Hijyen Blogu',
    description: 'Probiyotik temizlik, sinbiyotik teknoloji, alerjenler, biyofilm ve sürdürülebilir hijyen üzerine kaynak bağlantıları içeren Probiyom yazılarını okuyun.'
  },
  'products/professional_cleaning': {
    description: 'Otel, restoran, ofis ve tesislerde yüzey, zemin ve ekipman temizliği için HeiQ VivoTech probiyotik ürünlerini inceleyin. Uygulamanıza uygun çözümü bulun.'
  },
  'products/home_cleaning': {
    description: 'Evde zemin, mutfak, banyo ve günlük yüzey temizliği için probiyotik ürünleri keşfedin. HeiQ temizlik çözümlerini kullanım alanlarına göre karşılaştırın.'
  },
  'products/personal_care': {
    description: 'Cildin doğal mikrobiyomunu desteklemeye yönelik probiyotik ve sinbiyotik kişisel bakım ürünlerini tanıyın. Formülleri ve kullanım özelliklerini inceleyin.'
  },
  'products/cold_mist_spraying': {
    description: 'Ofis, otel ve ortak kullanım alanlarında yüzey bakımı için HeiQ VivoTech soğuk sisleme ve püskürtme çözümlerini, uygulama alanlarını ve ürünlerini inceleyin.'
  },
  'products/industrial_water_treatment': {
    description: 'Soğutma suyu ve endüstriyel sistemlerde organik birikim ile biyofilm yönetimine yönelik probiyotik su arıtma ürünlerini ve uygulama alanlarını keşfedin.'
  },
  'products/pet': {
    title: 'Evcil Hayvan Bakımı ve Probiyotik Temizlik Ürünleri',
    description: 'Evcil hayvanların deri, tüy ve yaşam alanı bakımı için HeiQ Synbio Pet ürünlerini keşfedin. Probiyotik bakım, temizlik ve koku yönetimi çözümlerini inceleyin.'
  },
  'products/livestock': {
    description: 'Ahır, altlık, ekipman ve çiftlik ortamlarının bakımı için HeiQ VivoTech probiyotik hayvancılık ürünlerini tanıyın. Kullanım alanlarına uygun çözümleri inceleyin.'
  },
  'blog/alerji-bebek-ve-evcil-hayvan-dostu-temizlik-guvenli-yasam-alanlari': {
    title: 'Alerji, Bebek ve Evcil Hayvan Dostu Ev Temizliği',
    description: 'Bebekli ve evcil hayvanlı evlerde temizlik planı oluşturun. HEPA filtre, nem kontrolü, alerjen yönetimi ve yüzeye uygun ürün seçimi için rehberimizi okuyun.',
    groups: ['home_cleaning', 'pet']
  },
  'blog/probiyotik-temizligin-gucu-uzun-sureli-ve-mikrobiyom-dostu-hijyen': {
    title: 'Probiyotik Temizlik ve Mikrobiyom Dostu Hijyen',
    description: 'Probiyotik temizlik nasıl çalışır? Faydalı mikroorganizmalar, organik kirlerin parçalanması ve evden endüstriye kullanım alanlarını kaynaklarıyla inceleyin.',
    groups: ['home_cleaning', 'professional_cleaning']
  },
  'blog/temizlikte-enzimler-probiyotiklerin-yerine-gecmez': {
    title: 'Temizlikte Enzim ve Probiyotik Arasındaki Fark',
    description: 'Enzimler ile probiyotikler aynı şey mi? Temizlik formüllerindeki rollerini, enzim üretimini ve ürün seçerken dikkat edilecek farkları kaynaklarıyla öğrenin.',
    groups: ['home_cleaning', 'professional_cleaning']
  },
  'blog/alerjinizi-tetikleyen-sey-toz-mu-pet-mi-yoksa-polen-mi-yoksa-gorunmeyen-mikrobiyal-dengesizlik-mi': {
    title: 'Evde Alerjenler: Toz, Polen ve Evcil Hayvanlar',
    description: 'Ev tozu, polen ve evcil hayvan kaynaklı alerjenleri tanıyın. HEPA filtre, nem kontrolü, tekstil bakımı ve yüzeye uygun temizlik adımlarını birlikte inceleyin.',
    groups: ['home_cleaning', 'pet']
  },
  'blog/camasir-yikarken-gizli-tehlike-yumusaticilar-kalp-sagligimizi-nasil-etkiliyor': {
    title: 'Çamaşır Bakımı: Yumuşatıcılar ve Ürün Seçimi',
    description: 'Çamaşır bakımında parfüm, içerik ve dozaj seçimini değerlendirin. Yumuşatıcılarla ilgili sağlık iddialarını, araştırmaların sınırlarını ve kaynakları okuyun.',
    groups: ['home_cleaning']
  },
  'blog/gorunmez-kuresel-tehdit-antibiyotik-direnci-amr-gelecegimizin-en-buyuk-tehdidi-mi': {
    title: 'Antibiyotik Direnci (AMR) Nedir? Kaynaklı Rehber',
    description: 'Antibiyotik direncinin neden önemli olduğunu, küresel etkilerini ve hijyenle ilişkisini öğrenin. WHO ve bilimsel yayınlara dayanan Probiyom rehberini okuyun.',
    groups: ['professional_cleaning']
  },
  'blog/alerjinize-karsi-yeni-nesil-sinbiyotik-guc': {
    title: 'Sinbiyotik Temizlik ve Tekstil Alerjenlerinin Yönetimi',
    description: 'Sinbiyotik temizlikte probiyotik ve prebiyotiklerin rolünü keşfedin. Tekstil alerjen spreylerini, yüzey uyumunu ve üretici açıklamalarını kaynaklarıyla inceleyin.',
    groups: ['home_cleaning']
  },
  'blog/bir-ciftlikte-hijyen-sadece-temizlik-midir-yoksa-hastaliklari-onleyen-gorunmez-bir-savunma-hatti-mi': {
    title: 'Çiftlik Hijyeni ve Probiyotik Ortam Bakımı',
    description: 'Çiftliklerde zemin, altlık, ekipman ve su hattı bakımını birlikte değerlendirin. Probiyotik hijyen ürünlerinin kullanım alanlarını ve üretici verilerini okuyun.',
    groups: ['livestock']
  },
  'blog/endustriyel-su-sistemlerinde-gorunmeyen-maliyet-biyofilm': {
    title: 'Endüstriyel Su Sistemlerinde Biyofilm Yönetimi',
    description: 'Endüstriyel su sistemlerinde biyofilmin bakım ihtiyacıyla ilişkisini keşfedin. Probiyotik su arıtma yaklaşımını, uygulama sınırlarını ve kaynakları inceleyin.',
    groups: ['industrial_water_treatment']
  }
};
