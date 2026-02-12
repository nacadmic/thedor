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
        el.src = val;
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
    wrap.innerHTML = keys.map(function (key, i) {
      var large = i === 0 ? ' gallery-cell--large' : '';
      return '<div class="gallery-cell' + large + '"><div class="gallery-item gallery-item--contain reveal">' +
        '<img src="" alt="" data-content="home.galleryImages.' + key + '" data-content-alt="home.galleryAlt"></div></div>';
    }).join('');
  }

  var apiBase = location.origin + '/api';
  fetch(apiBase + '/content')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      buildGallery(data);
      applyContent(data);
      window.dispatchEvent(new Event('scroll'));
    })
    .catch(function () {
      buildGallery(null);
      applyContent(null);
    });
})();
