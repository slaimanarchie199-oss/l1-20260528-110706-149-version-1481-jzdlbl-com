(function () {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle && mobileMenu) {
        toggle.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
        var input = root.querySelector("[data-filter-search]");
        var typeSelect = root.querySelector("[data-filter-type]");
        var regionSelect = root.querySelector("[data-filter-region]");
        var yearSelect = root.querySelector("[data-filter-year]");
        var list = document.querySelector("[data-filter-list]");
        var status = document.querySelector("[data-filter-status]");

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        function matchesYear(cardYear, selectedYear) {
            if (!selectedYear) {
                return true;
            }
            if (selectedYear === "older") {
                var numberYear = parseInt(cardYear, 10);
                return !numberYear || numberYear < 2023;
            }
            return cardYear.indexOf(selectedYear) !== -1;
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : "");
            var typeValue = normalize(typeSelect ? typeSelect.value : "");
            var regionValue = normalize(regionSelect ? regionSelect.value : "");
            var yearValue = normalize(yearSelect ? yearSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.textContent + " " + card.dataset.keywords);
                var cardType = normalize(card.dataset.type);
                var cardRegion = normalize(card.dataset.region);
                var cardYear = normalize(card.dataset.year);
                var ok = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (typeValue && cardType !== typeValue) {
                    ok = false;
                }
                if (regionValue && cardRegion !== regionValue) {
                    ok = false;
                }
                if (!matchesYear(cardYear, yearValue)) {
                    ok = false;
                }

                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });

            if (status) {
                status.textContent = visible > 0 ? "筛选结果已更新" : "没有找到匹配内容";
            }
        }

        [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    });
})();

function initPlayer(sourceUrl) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".play-overlay");
    var hlsInstance = null;
    var started = false;

    if (!video || !sourceUrl) {
        return;
    }

    function bindSource() {
        if (started) {
            return;
        }
        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hlsInstance = new Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function startPlayback() {
        bindSource();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
            overlay.classList.remove("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
