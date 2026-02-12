(function () {
  function getByKey(obj, key) {
    return key.split('.').reduce(function (o, p) { return o && o[p]; }, obj);
  }

  function applyContent(data) {
    if (!data) return;
    document.querySelectorAll('[data-content]').forEach(function (el) {
      var key = el.getAttribute('data-content');
      var val = getByKey(data, key);
      if (key === 'about.body' && (val === undefined || val === null) && data.about) {
        var p = data.about;
        val = [p.paragraph1, p.paragraph2, p.paragraph3].filter(Boolean).join('\n\n');
      }
      if (val === undefined || val === null) return;
      if (el.tagName === 'IMG') {
        var imgSrc = val;
        if (typeof imgSrc === 'string' && imgSrc.indexOf('./') === 0 && typeof location !== 'undefined' && location.origin) {
          imgSrc = location.origin + imgSrc.slice(1);
        }
        el.src = imgSrc;
        var altKey = el.getAttribute('data-content-alt');
        if (altKey) el.alt = getByKey(data, altKey) || el.alt;
      } else {
        el.textContent = val;
      }
    });
    document.querySelectorAll('a[data-content-href]').forEach(function (el) {
      var key = el.getAttribute('data-content-href');
      var val = getByKey(data, key);
      if (val) el.href = val;
    });
    var titleEl = document.querySelector('title');
    if (titleEl && data.meta && data.meta.siteTitle) {
      if (document.body.classList.contains('page-about')) {
        titleEl.textContent = (getByKey(data, 'about.pageTitle') || 'About') + ' | ' + data.meta.siteTitle;
      } else {
        titleEl.textContent = data.meta.siteTitle;
      }
    }
  }

  var FALLBACK_GALLERY = {
    '1': './images/1.jpg', '2': './images/2.png', '3': './images/3.png', '4': './images/4.jpg',
    '5': './images/5.png', '6': './images/6.jpg', '7': './images/7.png', '8': './images/8.jpg', '9': './images/9.png'
  };

  function buildGallery(data) {
    var wrap = document.getElementById('galleryWrap');
    if (!wrap) return;
    var raw = (data && data.home && data.home.galleryImages);
    var imgs = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    var keys = [];
    for (var i = 1; i <= 24; i++) {
      var k = String(i);
      var v = imgs[k];
      if (v && typeof v === 'string' && v.trim()) keys.push(k);
    }
    if (keys.length === 0) {
      imgs = FALLBACK_GALLERY;
      keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    }
    wrap.innerHTML = keys.map(function (key, i) {
      var large = i === 0 ? ' gallery-cell--large' : '';
      var src = (imgs[key] && String(imgs[key]).trim()) || '';
      if (src.indexOf('./') === 0) src = (typeof location !== 'undefined' && location.origin ? location.origin : '') + src.slice(1);
      var srcAttr = src ? ' src="' + src.replace(/"/g, '&quot;') + '"' : '';
      return '<div class="gallery-cell' + large + '"><div class="gallery-item gallery-item--contain reveal visible">' +
        '<img' + srcAttr + ' alt="" data-content="home.galleryImages.' + key + '" data-content-alt="home.galleryAlt"></div></div>';
    }).join('');
  }

  var apiBase = location.origin + '/api';
  fetch(apiBase + '/content')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      buildGallery(data || null);
      if (data) applyContent(data);
      setTimeout(function () {
        window.dispatchEvent(new Event('scroll'));
      }, 100);
    })
    .catch(function () {
      buildGallery(null);
    });
})();
