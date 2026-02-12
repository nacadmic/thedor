(function () {
  function getByKey(obj, key) {
    return key.split('.').reduce(function (o, p) { return o && o[p]; }, obj);
  }

  function applyContent(data) {
    if (!data) return;
    document.querySelectorAll('[data-content]').forEach(function (el) {
      var key = el.getAttribute('data-content');
      var val = getByKey(data, key);
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

  var apiBase = location.origin + '/api';
  fetch(apiBase + '/content')
    .then(function (r) { return r.json(); })
    .then(applyContent)
    .catch(function () {
      applyContent(null);
    });
})();
