/* ===================================================================
   ContactForm – mailto-based contact form with validation (Refined UI)
   =================================================================== */

function ContactForm(container) {
  // GÜVENLİK KONTROLÜ: Eğer konteyner DOM'da henüz oluşmadıysa çökme yaşanmasını engeller.
  if (!container) {
    console.warn("ContactForm konteyneri DOM üzerinde bulunamadı.");
    return;
  }

  var form = {
    fullName: '',
    email: '',
    phone: '+90',
    productGroup: '',
    subject: '',
    message: '',
  };

  var submitted = false;

  function formatPhoneInput(raw) {
    var digits = raw.replace(/\D/g, '');
    var rest = digits.indexOf('90') === 0 ? digits.slice(2, 12) : digits.slice(0, 10);

    var a = rest.slice(0, 3);
    var b = rest.slice(3, 6);
    var c = rest.slice(6, 8);
    var d = rest.slice(8, 10);

    var out = '+90';
    if (a.length > 0) out += ' (' + a;
    if (a.length === 3) out += ')';
    if (b.length > 0) out += ' ' + b;
    if (c.length > 0) out += ' ' + c;
    if (d.length > 0) out += ' ' + d;

    return out;
  }

  function isValid() {
    return (
      form.fullName.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.productGroup !== '' &&
      form.subject !== ''
    );
  }

  function buildGroupOptions() {
    var opts = '<option value="" disabled selected>Seçiniz</option>';
    // Küresel değişkenin tanımlı olduğundan emin oluyoruz
    var productGroupList = typeof ProductGroup !== 'undefined' ? Object.values(ProductGroup) : [];
    var productGroupLabels = typeof ProductGroupLabels !== 'undefined' ? ProductGroupLabels : {};

    for (var i = 0; i < productGroupList.length; i++) {
      var val = productGroupList[i];
      var label = productGroupLabels[val] || val;
      var sel = form.productGroup == val ? ' selected' : '';
      opts += '<option value="' + val + '"' + sel + '>' + label + '</option>';
    }
    return opts;
  }

  function buildSubjectOptions() {
    var opts = '<option value="" disabled selected>Seçiniz</option>';
    // Küresel değişkenin tanımlı olduğundan emin oluyoruz
    var messageSubjectsList = typeof MessageSubjects !== 'undefined' ? MessageSubjects : [];

    for (var i = 0; i < messageSubjectsList.length; i++) {
      var sel = form.subject === messageSubjectsList[i] ? ' selected' : '';
      opts += '<option value="' + messageSubjectsList[i] + '"' + sel + '>' + messageSubjectsList[i] + '</option>';
    }
    return opts;
  }

  function render() {
    var successHtml = submitted
      ? '<div class="form-success mt-3"><p>E-mail uygulamanız açıldı. Mesajı göndererek bizimle iletişime geçebilirsiniz.</p></div>'
      : '';

    container.innerHTML =
      '<section class="p-4 p-md-5 bg-white rounded-4 border border-light-subtle shadow-sm">' +
        '<h2 class="text-brand fs-2 fw-bold mb-2">Bize Ulaşın</h2>' +
        '<p class="text-muted small lh-relaxed mb-4 max-w-4xl">' +
          'Merak ettiğiniz her konuda bize yazabilir veya arayabilirsiniz. Probiyom Ekibi olarak size yardımcı olmaktan memnuniyet duyarız.' +
        '</p>' +
        '<form class="contact-form row g-4" id="contact-form">' +
          '<div class="col-md-6">' +
            '<label class="form-field d-flex flex-column gap-2">' +
              '<span class="small fw-bold text-secondary">Adınız Soyadınız <span class="text-danger">*</span></span>' +
              '<input type="text" placeholder="Ad Soyad" required value="' + escapeAttr(form.fullName) + '" data-field="fullName">' +
            '</label>' +
          '</div>' +
          '<div class="col-md-6">' +
            '<label class="form-field d-flex flex-column gap-2">' +
              '<span class="small fw-bold text-secondary">E-mail Adresiniz <span class="text-danger">*</span></span>' +
              '<input type="email" placeholder="ornek@eposta.com" required value="' + escapeAttr(form.email) + '" data-field="email">' +
            '</label>' +
          '</div>' +
          '<div class="col-12">' +
            '<label class="form-field d-flex flex-column gap-2">' +
              '<span class="small fw-bold text-secondary">İrtibat Numarası</span>' +
              '<input type="tel" placeholder="+90 (5xx) xxx xx xx" value="' + escapeAttr(form.phone) + '" data-field="phone">' +
            '</label>' +
          '</div>' +
          '<div class="col-md-6">' +
            '<label class="form-field d-flex flex-column gap-2">' +
              '<span class="small fw-bold text-secondary">Ürün Grubu <span class="text-danger">*</span></span>' +
              '<select required data-field="productGroup">' + buildGroupOptions() + '</select>' +
            '</label>' +
          '</div>' +
          '<div class="col-md-6">' +
            '<label class="form-field d-flex flex-column gap-2">' +
              '<span class="small fw-bold text-secondary">Mesaj Konusu <span class="text-danger">*</span></span>' +
              '<select required data-field="subject">' + buildSubjectOptions() + '</select>' +
            '</label>' +
          '</div>' +
          '<div class="col-12">' +
            '<label class="form-field d-flex flex-column gap-2">' +
              '<span class="small fw-bold text-secondary">Mesajınız</span>' +
              '<textarea placeholder="Mesajınızı detaylıca buraya yazabilirsiniz..." data-field="message">' + escapeHtml(form.message) + '</textarea>' +
            '</label>' +
          '</div>' +
          '<div class="col-12 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-4">' +
            '<p class="small text-muted mb-0"><span class="text-danger">*</span> ile işaretli alanlar zorunludur.</p>' +
            '<button type="submit" class="btn-submit text-white border-0 transition-all"' + (isValid() ? '' : ' disabled') + '>E-mail Uygulamasında Aç</button>' +
          '</div>' +
          (submitted ? '<div class="col-12">' + successHtml + '</div>' : '') +
        '</form>' +
      '</section>';

    bindEvents();
  }

  function bindEvents() {
    var inputs = container.querySelectorAll('input, select, textarea');
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      var field = input.getAttribute('data-field');
      if (!field) continue;

      input.addEventListener('input', (function (f, el) {
        return function () {
          submitted = false;
          if (f === 'phone') {
            form[f] = formatPhoneInput(el.value);
            el.value = form[f];
          } else {
            form[f] = el.value;
          }
          updateSubmitButton();
        };
      })(field, input));

      if (input.tagName === 'SELECT') {
        input.addEventListener('change', (function (f, el) {
          return function () {
            submitted = false;
            form[f] = el.value;
            updateSubmitButton();
          };
        })(field, input));
      }
    }

    var formEl = container.querySelector('#contact-form');
    if (formEl) {
      formEl.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!isValid()) return;

        var mailSubject = 'İletişim Formu: ' + form.subject;
        var bodyLines = [
          'Ad: ' + form.fullName,
          'E-mail: ' + form.email,
        ];
        
        var productGroupLabels = typeof ProductGroupLabels !== 'undefined' ? ProductGroupLabels : {};
        
        if (form.phone.trim().length > 0) bodyLines.push('İrtibat No: ' + form.phone);
        bodyLines.push('Ürün grubu: ' + (productGroupLabels[form.productGroup] || form.productGroup));
        bodyLines.push('Mesaj konusu: ' + form.subject);
        bodyLines.push('');
        bodyLines.push('Mesaj:');
        bodyLines.push(form.message.trim().length > 0 ? form.message : '(Mesaj yok)');

        var params = new URLSearchParams();
        params.set('subject', mailSubject);
        params.set('body', bodyLines.join('\n'));
        
        var siteEmail = (typeof SiteData !== 'undefined' && SiteData.email) ? SiteData.email : 'destek@probiyom.com';
        var mailto = 'mailto:' + siteEmail + '?' + params.toString();

        window.location.href = mailto;

        submitted = true;
        form = {
          fullName: '',
          email: '',
          phone: '+90',
          productGroup: '',
          subject: '',
          message: '',
        };
        render();
      });
    }
  }

  function updateSubmitButton() {
    var btn = container.querySelector('.btn-submit');
    if (btn) btn.disabled = !isValid();
  }

  render();
}