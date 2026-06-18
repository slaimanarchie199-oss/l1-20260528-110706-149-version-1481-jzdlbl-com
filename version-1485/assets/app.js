(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    inputs.forEach(function (input) {
      var targetSelector = input.getAttribute("data-target");
      var scope = targetSelector ? document.querySelector(targetSelector) : document;
      if (!scope) {
        return;
      }
      var panel = input.closest(".search-panel");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
      var activeFilter = "";

      function apply() {
        var term = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year")
          ].join(" "));
          var matchedText = !term || haystack.indexOf(term) !== -1;
          var matchedFilter = !activeFilter || haystack.indexOf(normalize(activeFilter)) !== -1;
          card.classList.toggle("is-filtered", !(matchedText && matchedFilter));
        });
      }

      input.addEventListener("input", apply);

      if (panel) {
        var clear = panel.querySelector("[data-clear-search]");
        if (clear) {
          clear.addEventListener("click", function () {
            input.value = "";
            activeFilter = "";
            panel.querySelectorAll("[data-filter-button]").forEach(function (button) {
              button.classList.toggle("is-active", !button.getAttribute("data-filter-value"));
            });
            apply();
            input.focus();
          });
        }
        panel.querySelectorAll("[data-filter-button]").forEach(function (button) {
          if (!button.getAttribute("data-filter-value")) {
            button.classList.add("is-active");
          }
          button.addEventListener("click", function () {
            activeFilter = button.getAttribute("data-filter-value") || "";
            panel.querySelectorAll("[data-filter-button]").forEach(function (item) {
              item.classList.toggle("is-active", item === button);
            });
            apply();
          });
        });
      }
    });
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    window.addEventListener("scroll", function () {
      button.classList.toggle("is-visible", window.scrollY > 360);
    });
    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupBackTop();
  });
})();
