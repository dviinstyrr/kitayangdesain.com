/* ============================================================
   portfolio-page.js — Halaman Publik Portofolio
   Fetch data dari /data/portfolio.json (file statis GitHub Pages)
   kitayangdesain.com
============================================================ */
(function () {
  'use strict';

  let allItems    = [];
  let filtered    = [];
  let currentView = 'grid';
  let activeFilter= 'all';
  let modalIndex  = -1;

  const CATEGORIES = [
    { value: 'all',      label: 'Semua' },
    { value: 'branding', label: 'Branding' },
    { value: 'digital',  label: 'Digital' },
    { value: 'print',    label: 'Print' },
    { value: 'spatial',  label: 'Spatial' },
    { value: 'motion',   label: 'Motion' },
  ];

  const $ = id => document.getElementById(id);

  /* ── INIT ─────────────────────────────────────────────── */
  async function init() {
    showSkeleton();
    allItems = await PortfolioStorage.fetchPublic();
    filtered = [...allItems];
    buildFilterTabs();
    renderCount();
    renderFeatured();
    renderGrid();
    bindViewToggle();
    bindModal();
    bindKeyboard();
    initCursor();
  }

  function showSkeleton() {
    const grid = $('pf-grid');
    if (grid) grid.innerHTML = [1,2,3,4,5,6].map(() =>
      `<div style="aspect-ratio:4/3;background:var(--bg2);border-radius:6px;animation:pulse 1.5s ease infinite"></div>`
    ).join('');
  }

  /* ── FILTER TABS ──────────────────────────────────────── */
  function buildFilterTabs() {
    const wrap = $('pf-filter-tabs');
    if (!wrap) return;
    wrap.innerHTML = CATEGORIES.map(cat => {
      const n = cat.value === 'all' ? allItems.length : allItems.filter(i => i.category === cat.value).length;
      if (n === 0 && cat.value !== 'all') return '';
      return `<button class="pf-filter-tab ${cat.value === 'all' ? 'active' : ''}" data-cat="${cat.value}">
        ${cat.label} <span style="opacity:.4;font-size:.65rem">${n}</span>
      </button>`;
    }).join('');

    wrap.addEventListener('click', e => {
      const btn = e.target.closest('.pf-filter-tab');
      if (!btn) return;
      wrap.querySelectorAll('.pf-filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.cat;
      filtered = activeFilter === 'all' ? [...allItems] : allItems.filter(i => i.category === activeFilter);
      renderGrid();
      renderCount();
    });
  }

  function renderCount() {
    const el = $('pf-count'); if (el) el.textContent = filtered.length;
    const t  = $('pf-total'); if (t)  t.textContent  = allItems.length;
  }

  /* ── FEATURED ─────────────────────────────────────────── */
  function renderFeatured() {
    const wrap = $('pf-featured-grid');
    if (!wrap) return;
    const items = allItems.filter(i => i.featured).slice(0, 3);
    if (!items.length) { wrap.closest('.pf-featured-section')?.remove(); return; }

    wrap.innerHTML = items.map((item, idx) => `
      <div class="pf-featured-card" data-id="${item.id}" style="background:${cardBg(item)}">
        ${idx === 0 ? '<span class="featured-badge">★ Featured</span>' : ''}
        ${cardImg(item)}
        <div class="pf-card-overlay">
          <span class="pf-card-cat">${item.categoryLabel}</span>
          <h3 class="pf-card-title">${item.title}</h3>
          <span class="pf-card-meta">${item.client} · ${item.year}</span>
        </div>
        <div class="pf-card-arrow">↗</div>
      </div>`).join('');

    wrap.querySelectorAll('.pf-featured-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = filtered.findIndex(i => i.id === card.dataset.id);
        openModal(idx !== -1 ? idx : allItems.findIndex(i => i.id === card.dataset.id));
      });
    });
  }

  /* ── GRID ─────────────────────────────────────────────── */
  function renderGrid() {
    const grid = $('pf-grid');
    if (!grid) return;

    if (!filtered.length) {
      grid.innerHTML = `<div class="pf-empty">
        <div class="pf-empty-icon">🎨</div>
        <h3>Belum ada karya</h3>
        <p>Tidak ada karya dalam kategori ini.</p>
      </div>`; return;
    }

    grid.innerHTML = filtered.map((item, idx) => `
      <div class="pf-card" data-idx="${idx}" style="animation-delay:${Math.min(idx * 0.06, 0.4)}s">
        <div class="pf-card-img-wrap" style="background:${cardBg(item)}">
          ${cardImg(item)}
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
          ${currentView === 'list'
            ? `<div class="pf-card-info-tags">${(item.tags||[]).slice(0,3).map(t=>`<span class="pf-card-info-tag">${t}</span>`).join('')}</div>`
            : ''}
        </div>
      </div>`).join('');

    grid.querySelectorAll('.pf-card').forEach(card => {
      card.addEventListener('click', () => openModal(parseInt(card.dataset.idx)));
    });
  }

  /* ── VIEW TOGGLE ──────────────────────────────────────── */
  function bindViewToggle() {
    const btnGrid = $('btn-view-grid');
    const btnList = $('btn-view-list');
    const grid    = $('pf-grid');
    if (!btnGrid || !btnList || !grid) return;

    btnGrid.addEventListener('click', () => {
      currentView = 'grid'; grid.classList.remove('view-list');
      btnGrid.classList.add('active'); btnList.classList.remove('active');
      renderGrid();
    });
    btnList.addEventListener('click', () => {
      currentView = 'list'; grid.classList.add('view-list');
      btnList.classList.add('active'); btnGrid.classList.remove('active');
      renderGrid();
    });
  }

  /* ── MODAL ────────────────────────────────────────────── */
  function bindModal() {
    $('pf-modal-overlay')?.addEventListener('click', e => {
      if (e.target === $('pf-modal-overlay')) closeModal();
    });
    $('pf-modal-close')?.addEventListener('click', closeModal);
    $('pf-modal-prev')?.addEventListener('click', () => openModal(modalIndex - 1));
    $('pf-modal-next')?.addEventListener('click', () => openModal(modalIndex + 1));
  }

  function openModal(idx) {
    const source = filtered.length ? filtered : allItems;
    if (idx < 0 || idx >= source.length) return;
    modalIndex = idx;
    const item = source[idx];
    const overlay = $('pf-modal-overlay');

    const imgWrap = $('pf-modal-img');
    if (imgWrap) {
      imgWrap.innerHTML = item.image
        ? `<img src="${item.image}" alt="${item.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">`
        : `<div class="pf-modal-img-placeholder" style="background:${cardBg(item)}">${item.emoji||'🎨'}</div>`;
    }

    const tags = $('pf-modal-tags');
    if (tags) tags.innerHTML = (item.tags||[]).map(t=>`<span class="pf-modal-tag">${t}</span>`).join('');

    set('pf-modal-cat',    item.categoryLabel);
    set('pf-modal-year',   item.year);
    set('pf-modal-title',  item.title);
    set('pf-modal-client', '🏢 ' + (item.client || '—'));
    set('pf-modal-desc',   item.description || '—');
    set('pf-modal-result', item.result || '—');

    const prev = $('pf-modal-prev'); if (prev) prev.disabled = idx <= 0;
    const next = $('pf-modal-next'); if (next) next.disabled = idx >= source.length - 1;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('pf-modal')?.scrollTo({ top: 0 });
  }

  function closeModal() {
    $('pf-modal-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
    modalIndex = -1;
  }

  function bindKeyboard() {
    document.addEventListener('keydown', e => {
      if (!$('pf-modal-overlay')?.classList.contains('open')) return;
      if (e.key === 'Escape')      closeModal();
      if (e.key === 'ArrowLeft')   openModal(modalIndex - 1);
      if (e.key === 'ArrowRight')  openModal(modalIndex + 1);
    });
  }

  /* ── HELPERS ──────────────────────────────────────────── */
  function cardBg(item) {
    return item.color
      ? `linear-gradient(135deg,${item.color}55,${item.color}22)`
      : 'var(--bg2)';
  }
  function cardImg(item) {
    if (item.image) return `<img src="${item.image}" alt="${item.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">`;
    return `<div class="pf-card-placeholder" style="background:${cardBg(item)}">
      <span style="font-size:2.2rem">${item.emoji||'🎨'}</span>
      <span>${item.title}</span>
    </div>`;
  }
  function set(id, v) { const el = $(id); if (el) el.textContent = v || ''; }

  /* ── CURSOR ───────────────────────────────────────────── */
  function initCursor() {
    const cur  = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    if (!cur || !ring) return;
    let mx=0,my=0,rx=0,ry=0;
    document.addEventListener('mousemove', e => {
      mx=e.clientX; my=e.clientY;
      cur.style.left=mx+'px'; cur.style.top=my+'px';
    });
    (function loop() {
      rx+=(mx-rx)*.12; ry+=(my-ry)*.12;
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('.pf-card,.pf-featured-card,.pf-modal-nav-btn').forEach(el => {
      el.addEventListener('mouseenter', ()=>document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', ()=>document.body.classList.remove('cursor-hover'));
    });
  }

  /* ── BOOTSTRAP ────────────────────────────────────────── */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();