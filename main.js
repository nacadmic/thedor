(function () {
  function closeMenu() {
    document.body.classList.remove('menu-open');
  }

  var hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  var menuLinks = document.querySelectorAll('.menu-nav a');
  for (var i = 0; i < menuLinks.length; i++) {
    menuLinks[i].addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (href.indexOf('#') === 0) {
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
      closeMenu();
    });
  }

  var navLinks = document.querySelectorAll('.nav a[href^="#"]');
  for (var j = 0; j < navLinks.length; j++) {
    navLinks[j].addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  var header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  var reveal = function () {
    var sections = document.querySelectorAll('.gallery .inner, .about .inner');
    var items = document.querySelectorAll('.gallery-item');
    var winH = window.innerHeight;
    var delay = 0;

    function check() {
      sections.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < winH * 0.85) {
          el.classList.add('visible');
        }
      });
      items.forEach(function (el, i) {
        var rect = el.getBoundingClientRect();
        if (rect.top < winH * 0.9) {
          delay = i * 0.08;
          el.style.transitionDelay = delay + 's';
          el.classList.add('visible');
        }
      });
    }

    check();
    window.addEventListener('scroll', check);
    window.addEventListener('resize', check);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reveal);
  } else {
    reveal();
  }
})();
