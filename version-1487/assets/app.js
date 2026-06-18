
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function text(v) { return (v || '').toString().toLowerCase(); }

  function openMobileMenu() {
    const toggle = qs('.mobile-toggle');
    const panel = qs('.mobile-panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHeroCarousel() {
    const root = qs('[data-hero-carousel]');
    if (!root) return;
    const slides = qsa('.hero-slide', root);
    const dots = qsa('.hero-dot', root);
    if (!slides.length) return;
    let index = 0;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle('active', idx === index));
      dots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    show(0);
    window.setInterval(() => show(index + 1), 5200);
  }

  function renderMovieCard(m) {
    const tags = (m.tags || []).slice(0, 3).map(function (t) { return '<span>' + escapeHtml(t) + '</span>'; }).join('');
    return '' +
      '<a class="movie-card" href="' + escapeAttr(m.url) + '">' +
      '<div class="poster poster-bucket-' + (m.bucket || 0) + '">' +
      '<div class="poster-glow"></div>' +
      '<div class="poster-top"><span class="poster-year">' + escapeHtml(m.year) + '</span><span class="poster-region">' + escapeHtml(m.region) + '</span></div>' +
      '<div class="poster-center"><div class="poster-title">' + escapeHtml(trimText(m.title, 18)) + '</div><div class="poster-sub">' + escapeHtml(trimText(m.genre, 22)) + '</div></div>' +
      '<div class="poster-tags">' + tags + '</div>' +
      '<div class="poster-footer">' + escapeHtml(m.type || '') + '</div>' +
      '</div>' +
      '<div class="movie-card-body"><h3>' + escapeHtml(m.title) + '</h3><div class="movie-meta">' + escapeHtml(m.region + ' · ' + m.year + ' · ' + m.genre) + '</div><p>' + escapeHtml(trimText(m.one_line || '', 58)) + '</p></div>' +
      '</a>';
  }

  function renderRankItem(m, rank) {
    return '' +
      '<a class="rank-row" href="' + escapeAttr(m.url) + '">' +
      '<div class="rank-num">' + rank + '</div>' +
      '<div class="rank-copy"><h3>' + escapeHtml(m.title) + '</h3><p>' + escapeHtml(trimText(m.one_line || '', 84)) + '</p><div class="rank-meta">' + escapeHtml(m.region + ' · ' + m.year + ' · ' + m.genre) + '</div></div>' +
      '</a>';
  }

  function escapeHtml(s) {
    return (s == null ? '' : String(s))
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(s) { return escapeHtml(s); }
  function trimText(s, n) {
    s = (s == null ? '' : String(s)).replace(/\s+/g, ' ').trim();
    return s.length <= n ? s : s.slice(0, n - 1) + '…';
  }

  function getMovieIndex() {
    return window.MOVIE_INDEX || [];
  }

  function initSearchPage() {
    const root = qs('[data-search-page]');
    if (!root) return;
    const qInput = qs('[data-search-input]', root);
    const resultWrap = qs('[data-search-results]', root);
    const countEl = qs('[data-search-count]', root);
    const regionSelect = qs('[data-filter-region]', root);
    const yearSelect = qs('[data-filter-year]', root);
    const typeSelect = qs('[data-filter-type]', root);
    const all = getMovieIndex();

    const url = new URL(window.location.href);
    qInput.value = url.searchParams.get('q') || '';

    function run() {
      const q = text(qInput.value);
      const region = regionSelect ? regionSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const filtered = all.filter(function (m) {
        const hay = [m.title, m.region, m.type, m.year, m.genre, (m.tags || []).join(' '), m.one_line].join(' ').toLowerCase();
        const okQ = !q || hay.indexOf(q) !== -1;
        const okRegion = !region || m.region === region;
        const okYear = !year || String(m.year) === year;
        const okType = !type || m.type === type;
        return okQ && okRegion && okYear && okType;
      });
      countEl.textContent = filtered.length + ' 条结果';
      if (!filtered.length) {
        resultWrap.innerHTML = '<div class="empty-state">没有找到匹配内容，请尝试更换关键词。</div>';
        return;
      }
      resultWrap.innerHTML = filtered.slice(0, 240).map(renderMovieCard).join('');
    }

    [qInput, regionSelect, yearSelect, typeSelect].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', run);
      el.addEventListener('change', run);
    });
    run();
  }

  function initCategoryFilter() {
    const root = qs('[data-filter-page]');
    if (!root) return;
    const qInput = qs('[data-filter-input]', root);
    const results = qs('[data-filter-results]', root);
    const countEl = qs('[data-filter-count]', root);
    const regionSelect = qs('[data-filter-region]', root);
    const yearSelect = qs('[data-filter-year]', root);
    const typeSelect = qs('[data-filter-type]', root);
    const all = Array.from(qsa('[data-card-json]', root)).map(function (node) {
      try { return JSON.parse(node.textContent); } catch (e) { return null; }
    }).filter(Boolean);

    function run() {
      const q = text(qInput ? qInput.value : '');
      const region = regionSelect ? regionSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const filtered = all.filter(function (m) {
        const hay = [m.title, m.region, m.type, m.year, m.genre, (m.tags || []).join(' '), m.one_line].join(' ').toLowerCase();
        const okQ = !q || hay.indexOf(q) !== -1;
        const okRegion = !region || m.region === region;
        const okYear = !year || String(m.year) === year;
        const okType = !type || m.type === type;
        return okQ && okRegion && okYear && okType;
      });
      if (countEl) countEl.textContent = filtered.length + ' 条';
      if (!results) return;
      results.innerHTML = filtered.map(renderMovieCard).join('') || '<div class="empty-state">没有匹配的影片。</div>';
    }

    [qInput, regionSelect, yearSelect, typeSelect].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', run);
      el.addEventListener('change', run);
    });
    run();
  }

  function initRankPage() {
    const root = qs('[data-rank-page]');
    if (!root) return;
    const all = getMovieIndex();
    const tabs = qsa('[data-rank-tab]', root);
    const out = qs('[data-rank-output]', root);
    const query = new URL(window.location.href).searchParams.get('q') || '';
    const filtered = all.filter(function (m) {
      if (!query) return true;
      const hay = [m.title, m.region, m.type, m.genre, (m.tags || []).join(' '), m.one_line].join(' ').toLowerCase();
      return hay.indexOf(query.toLowerCase()) !== -1;
    });

    function sortBy(mode) {
      let arr = filtered.slice();
      if (mode === 'latest') arr.sort(function (a, b) { return (b.year - a.year) || (b.score - a.score); });
      else if (mode === 'classic') arr.sort(function (a, b) { return (a.year - b.year) || (b.score - a.score); });
      else arr.sort(function (a, b) { return (b.score - a.score) || (a.id.localeCompare(b.id)); });
      out.innerHTML = arr.slice(0, 120).map(function (m, i) { return renderRankItem(m, i + 1); }).join('');
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        sortBy(tab.getAttribute('data-rank-tab'));
      });
    });
    sortBy('hot');
  }

  function initDetailPlayer() {
    const stage = qs('[data-player-stage]');
    const video = qs('video[data-player-video]', stage);
    const playBtn = qs('[data-play-demo]', stage);
    const sourceBtns = qsa('[data-source-btn]', stage);
    if (!stage || !video) return;
    const sources = JSON.parse(stage.getAttribute('data-sources') || '[]');
    if (!sources.length) return;
    let current = 0;

    function loadSource(idx) {
      current = idx;
      const src = sources[idx];
      sourceBtns.forEach(function (btn, i) {
        btn.classList.toggle('primary', i === idx);
        btn.classList.toggle('secondary', i !== idx);
      });
      if (window.Hls && window.Hls.isSupported() && /m3u8/i.test(src.url)) {
        if (video._hls) {
          video._hls.destroy();
          video._hls = null;
        }
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(src.url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        if (video._hls) {
          video._hls.destroy();
          video._hls = null;
        }
        video.src = src.url;
      }
      video.load();
    }

    function startPlay() {
      loadSource(current);
      stage.classList.add('playing');
      const p = video.play();
      if (p && p.catch) p.catch(function () {});
    }

    sourceBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        loadSource(parseInt(btn.getAttribute('data-source-index'), 10) || 0);
      });
    });
    if (playBtn) playBtn.addEventListener('click', startPlay);
    loadSource(0);
  }

  function initRandomButtons() {
    const btn = qs('[data-random-link]');
    if (!btn) return;
    const all = getMovieIndex();
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (!all.length) return;
      const idx = Math.floor(Math.random() * all.length);
      window.location.href = all[idx].url;
    });
  }

  ready(function () {
    openMobileMenu();
    initHeroCarousel();
    initSearchPage();
    initCategoryFilter();
    initRankPage();
    initDetailPlayer();
    initRandomButtons();
  });
})();
