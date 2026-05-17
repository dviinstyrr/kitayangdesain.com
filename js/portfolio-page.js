/* ============================================================
   portfolio-page.js — Logic Halaman Publik Portofolio
   kitayangdesain.com
============================================================ */

(function () {
  'use strict';

  /* ── State ─────────────────────────────────── */
  let allItems     = [];
  let filtered     = [];
  let currentView  = 'grid';   /* 'grid' | 'list' */
  let activeFilter = 'all';
  let modalIndex   = -1;       /* index di filtered[] */

  /* ── Category map ───────────────────────────── */
  const CATEGORIES = [
    { value: 'all',      label: 'Semua' },
    { value: 'branding', label: 'Branding' },
    { value: 'digital',  label: 'Digital' },
    { value: 'print',    label: 'Print' },
    { value: 'spatial',  label: 'Spatial' },
    { value: 'motion',   label: 'Motion' },
  ];

  /* ── DOM refs ───────────────────────────────── */
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  /* ============================================================
     INIT
  ============================================================ */
  function init() {
    allItems = PortfolioStorage.getAll();
    filtered = [...allItems];

    buildFilterTabs();
    renderCount();
    renderFeatured();
    renderGrid();
    bindViewToggle();
    bindModal();
    bindKeyboard();
  }

  /* ============================================================
     FILTER TABS
  ============================================================ */
  function buildFilterTabs() {
    const container = $('pf-filter-tabs');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => {
      const count = cat.value === 'all'
        ? allItems.length
        : allItems.filter(i => i.category === cat.value).length;
      if (count === 0 && cat.value !== 'all') return '';
      return `
        <button class="pf-filter-tab ${cat.value === 'all' ? 'active' : ''}"
                data-cat="${cat.value}">
          ${cat.label}
          <span style="opacity:0.45;margin-left:0.3rem;font-size:0.65rem">${count}</span>
        </button>`;
    }).join('');

    container.addEventListener('click', e => {
      const btn = e.target.closest('.pf-filter-tab');
      if (!btn) return;
      $$('.pf-filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.cat;
      applyFilter();
    });
  }

  function applyFilter() {
    filtered = activeFilter === 'all'
      ? [...allItems]
      : allItems.filter(i => i.category === activeFilter);
    renderGrid();
    renderCount();
  }

  /* ============================================================
     COUNT
  ============================================================ */
  function renderCount() {
    const el = $('pf-count');
    if (el) el.textContent = filtered.length;
    const totalEl = $('pf-total');
    if (totalEl) totalEl.textContent = allItems.length;
  }

  /* ============================================================
     FEATURED SECTION
  ============================================================ */
  function renderFeatured() {
    const wrap = $('pf-featured-grid');
    if (!wrap) return;
    const items = allItems.filter(i => i.featured).slice(0, 3);
    if (!items.length) { wrap.closest('.pf-featured-section')?.remove(); return; }

    wrap.innerHTML = items.map((item, idx) => `
      <div class="pf-featured-card" data-id="${item.id}" style="background:${cardBg(item)}">
        ${item.featured && idx === 0 ? '<span class="featured-badge">★ Featured</span>' : ''}
        ${cardImageHTML(item)}
        <div class="pf-card-overlay">
          <span class="pf-card-cat">${item.categoryLabel}</span>
          <h3 class="pf-card-title">${item.title}</h3>
          <span class="pf-card-meta">${item.client} · ${item.year}</span>
        </div>
        <div class="pf-card-arrow">↗</div>
      </div>
    `).join('');

    wrap.querySelectorAll('.pf-featured-card').forEach(card => {
      card.addEventListener('click', () => {
        const id  = card.dataset.id;
        const idx = filtered.findIndex(i => i.id === id);
        openModal(idx !== -1 ? idx : allItems.findIndex(i => i.id === id));
      });
      hoverCursor(card);
    });
  }

  /* ============================================================
     MAIN GRID
  ============================================================ */
  function renderGrid() {
    const grid = $('pf-grid');
    if (!grid) return;

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="pf-empty">
          <div class="pf-empty-icon">🎨</div>
          <h3>Belum ada karya</h3>
          <p>Tidak ada karya dalam kategori ini.<br>Coba pilih kategori lain.</p>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map((item, idx) => buildCard(item, idx)).join('');

    /* bind click */
    grid.querySelectorAll('.pf-card').forEach(card => {
      card.addEventListener('click', () => openModal(parseInt(card.dataset.idx)));
      hoverCursor(card);
    });

    /* stagger animation */
    grid.querySelectorAll('.pf-card').forEach((card, i) => {
      card.style.animationDelay = Math.min(i * 0.06, 0.4) + 's';
    });
  }

  function buildCard(item, idx) {
    const isListView = currentView === 'list';
    const tagsHTML = isListView
      ? `<div class="pf-card-info-tags">${(item.tags || []).slice(0, 3).map(t =>
          `<span class="pf-card-info-tag">${t}</span>`).join('')}</div>`
      : '';

    return `
      <div class="pf-card" data-id="${item.id}" data-idx="${idx}">
        <div class="pf-card-img-wrap" style="background:${cardBg(item)}">
          ${cardImageHTML(item)}
          ${item.featured ? '<span class="featured-badge">★</span>' : ''}
          <div class="pf-card-overlay">
            <span class="pf-card-cat">${item.categoryLabel}</span>
            <h3 class="pf-card-title">${item.title}</h3>
            <span class="pf-card-meta">${item.client} · ${item.year}</span>
          </div>
          <div class="pf-card-arrow">↗</div>
        </div>
        <div class="pf-card-info">
          <div class="pf-card-info-title">${item.title}</div>
          <div class="pf-card-info-sub">${item.categoryLabel} · ${item.year}</div>
          ${tagsHTML}
        </div>
      </div>`;
  }

  /* ============================================================
     VIEW TOGGLE (Grid / List)
  ============================================================ */
  function bindViewToggle() {
    const grid   = $('btn-view-grid');
    const list   = $('btn-view-list');
    const pfGrid = $('pf-grid');
    if (!grid || !list || !pfGrid) return;

    grid.addEventListener('click', () => {
      currentView = 'grid';
      pfGrid.classList.remove('view-list');
      grid.classList.add('active');
      list.classList.remove('active');
      renderGrid();
    });
    list.addEventListener('click', () => {
      currentView = 'list';
      pfGrid.classList.add('view-list');
      list.classList.add('active');
      grid.classList.remove('active');
      renderGrid();
    });
  }

  /* ============================================================
     MODAL
  ============================================================ */
  function bindModal() {
    const overlay = $('pf-modal-overlay');
    if (!overlay) return;

    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });
    $('pf-modal-close')?.addEventListener('click', closeModal);
    $('pf-modal-prev')?.addEventListener('click', () => openModal(modalIndex - 1));
    $('pf-modal-next')?.addEventListener('click', () => openModal(modalIndex + 1));
  }

  function openModal(idx) {
    /* Fallback: search in allItems if idx is out of range */
    const source = filtered.length ? filtered : allItems;
    if (idx < 0 || idx >= source.length) return;

    modalIndex = idx;
    const item = source[idx];
    const overlay = $('pf-modal-overlay');
    if (!overlay) return;

    /* Image */
    const imgWrap = $('pf-modal-img');
    if (imgWrap) {
      imgWrap.innerHTML = item.image
        ? `<img src="${item.image}" alt="${item.title}" loading="lazy">`
        : `<div class="pf-modal-img-placeholder" style="background:${cardBg(item)}">${item.emoji || '🎨'}</div>`;
    }

    /* Tags */
    const tagsEl = $('pf-modal-tags');
    if (tagsEl) {
      tagsEl.innerHTML = (item.tags || []).map(t =>
        `<span class="pf-modal-tag">${t}</span>`).join('');
    }

    setText('pf-modal-cat',    item.categoryLabel);
    setText('pf-modal-year',   item.year);
    setText('pf-modal-title',  item.title);
    setText('pf-modal-client', '🏢 ' + (item.client || '—'));
    setText('pf-modal-desc',   item.description || '—');
    setText('pf-modal-result', item.result || '—');

    /* Nav buttons */
    const prev = $('pf-modal-prev');
    const next = $('pf-modal-next');
    if (prev) prev.disabled = idx <= 0;
    if (next) next.disabled = idx >= source.length - 1;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('pf-modal')?.scrollTo({ top: 0 });
  }

  function closeModal() {
    $('pf-modal-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
    modalIndex = -1;
  }

  /* ============================================================
     KEYBOARD
  ============================================================ */
  function bindKeyboard() {
    document.addEventListener('keydown', e => {
      if (!$('pf-modal-overlay')?.classList.contains('open')) return;
      if (e.key === 'Escape')      closeModal();
      if (e.key === 'ArrowLeft')   openModal(modalIndex - 1);
      if (e.key === 'ArrowRight')  openModal(modalIndex + 1);
    });
  }

  /* ============================================================
     HELPERS
  ============================================================ */
  function cardBg(item) {
    return item.color
      ? `linear-gradient(135deg, ${item.color}55 0%, ${item.color}22 100%)`
      : 'var(--bg2)';
  }

  function cardImageHTML(item) {
    if (item.image) {
      return `<img src="${item.image}" alt="${item.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">`;
    }
    return `
      <div class="pf-card-placeholder" style="background:${cardBg(item)}">
        <span>${item.emoji || '🎨'}</span>
        <span>${item.title}</span>
      </div>`;
  }

  function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text || '';
  }

  function hoverCursor(el) {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  }

  /* ============================================================
     TOAST
  ============================================================ */
  window.pfToast = function (msg, duration = 2800) {
    const t = $('pf-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), duration);
  };

  /* ============================================================
     CURSOR (reuse from main site jika diload standalone)
  ============================================================ */
  function initCursor() {
    const cursor = document.getElementById('cursor');
    const ring   = document.getElementById('cursor-ring');
    if (!cursor || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    });
    (function animRing() {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(animRing);
    })();
  }

  /* ============================================================
     BOOTSTRAP
  ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { init(); initCursor(); });
  } else {
    init(); initCursor();
  }

})();
