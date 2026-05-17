/* ============================================================
   admin.js — Panel Admin Portofolio
   kitayangdesain.com
============================================================ */

(function () {
  'use strict';

  /* ── Konfigurasi Password Admin ─────────────────────────────
     Ganti string ini dengan password Anda sendiri.
     Untuk keamanan lebih, hash password di sisi server.
  ────────────────────────────────────────────────────────── */
  const ADMIN_PASSWORD  = 'kyd2025admin';
  const SESSION_KEY     = 'kyd_admin_session';
  const SESSION_EXPIRY  = 8 * 60 * 60 * 1000; /* 8 jam */

  /* ── State ─────────────────────────────────────────────── */
  let items         = [];
  let editingId     = null;   /* null = tambah baru, string = edit */
  let pendingImage  = null;   /* base64 string dari file upload */
  let dragSrcIdx    = null;

  /* ── DOM refs ────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);

  /* ============================================================
     AUTH
  ============================================================ */
  function checkSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const { ts } = JSON.parse(raw);
      return Date.now() - ts < SESSION_EXPIRY;
    } catch { return false; }
  }

  function saveSession() {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }));
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    showScreen('login');
  }

  function initAuth() {
    if (checkSession()) { showScreen('app'); initApp(); return; }
    showScreen('login');

    $('login-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const pw = $('login-password')?.value || '';
      if (pw === ADMIN_PASSWORD) {
        saveSession();
        showScreen('app');
        initApp();
      } else {
        const err = $('login-error');
        if (err) { err.textContent = 'Password salah. Coba lagi.'; err.style.display = 'block'; }
        $('login-password').value = '';
        $('login-password').focus();
      }
    });

    $('login-password')?.addEventListener('input', () => {
      const err = $('login-error');
      if (err) err.style.display = 'none';
    });
  }

  function showScreen(name) {
    ['login', 'app'].forEach(s => {
      const el = $('screen-' + s);
      if (el) el.style.display = s === name ? '' : 'none';
    });
  }

  /* ============================================================
     INIT APP
  ============================================================ */
  function initApp() {
    loadItems();
    bindFormEvents();
    bindDragDrop();
    bindSearch();
    updateStorageInfo();
    bindLogout();

    $('btn-new-item')?.addEventListener('click', openFormNew);
    $('btn-reset')?.addEventListener('click', confirmReset);
  }

  function loadItems() {
    items = PortfolioStorage.getAll();
    renderList();
  }

  /* ============================================================
     ITEM LIST
  ============================================================ */
  function renderList(subset) {
    const list = $('admin-list');
    if (!list) return;
    const data = subset ?? items;

    if (!data.length) {
      list.innerHTML = `
        <div class="adm-empty">
          <div style="font-size:3rem;margin-bottom:1rem">📂</div>
          <p>Belum ada karya. Klik <strong>+ Tambah Karya</strong> untuk memulai.</p>
        </div>`;
      return;
    }

    list.innerHTML = data.map((item, idx) => `
      <div class="adm-item" draggable="true" data-id="${item.id}" data-idx="${idx}">
        <div class="adm-item-drag" title="Drag untuk urutkan">⠿</div>
        <div class="adm-item-thumb" style="background:${itemBg(item)}">
          ${item.image
            ? `<img src="${item.image}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover">`
            : `<span>${item.emoji || '🎨'}</span>`}
        </div>
        <div class="adm-item-info">
          <div class="adm-item-title">${item.title}</div>
          <div class="adm-item-meta">
            <span class="adm-cat-badge cat-${item.category}">${item.categoryLabel}</span>
            <span>${item.client} · ${item.year}</span>
            ${item.featured ? '<span class="adm-featured-badge">★ Featured</span>' : ''}
          </div>
          <div class="adm-item-tags">${(item.tags || []).slice(0, 4).map(t =>
            `<span class="adm-tag">${t}</span>`).join('')}</div>
        </div>
        <div class="adm-item-actions">
          <button class="adm-btn adm-btn-sm adm-btn-ghost" onclick="adminToggleFeatured('${item.id}')" title="${item.featured ? 'Hapus dari featured' : 'Set sebagai featured'}">
            ${item.featured ? '★' : '☆'}
          </button>
          <button class="adm-btn adm-btn-sm adm-btn-outline" onclick="adminEdit('${item.id}')">Edit</button>
          <button class="adm-btn adm-btn-sm adm-btn-danger" onclick="adminDelete('${item.id}')">Hapus</button>
        </div>
      </div>
    `).join('');

    /* bind drag after render */
    bindDragDrop();
    updateCount(data.length);
  }

  function updateCount(n) {
    const el = $('item-count');
    if (el) el.textContent = `${n} karya`;
  }

  /* ============================================================
     SEARCH / FILTER
  ============================================================ */
  function bindSearch() {
    $('admin-search')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) { renderList(); return; }
      renderList(items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.client.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      ));
    });

    $('admin-filter-cat')?.addEventListener('change', e => {
      const cat = e.target.value;
      renderList(cat === 'all' ? items : items.filter(i => i.category === cat));
    });
  }

  /* ============================================================
     FORM — TAMBAH / EDIT
  ============================================================ */
  function openFormNew() {
    editingId    = null;
    pendingImage = null;
    resetForm();
    $('form-title-text').textContent = '+ Tambah Karya Baru';
    $('form-submit-btn').textContent = 'Simpan Karya';
    openPanel();
  }

  window.adminEdit = function (id) {
    const item = PortfolioStorage.getById(id);
    if (!item) return;
    editingId    = id;
    pendingImage = item.image || null;
    populateForm(item);
    $('form-title-text').textContent = 'Edit Karya';
    $('form-submit-btn').textContent = 'Update Karya';
    openPanel();
  };

  function populateForm(item) {
    setValue('f-title',       item.title);
    setValue('f-client',      item.client);
    setValue('f-year',        item.year);
    setValue('f-category',    item.category);
    setValue('f-color',       item.color || '#C8A96E');
    setValue('f-emoji',       item.emoji || '');
    setValue('f-description', item.description);
    setValue('f-result',      item.result);
    setValue('f-tags',        (item.tags || []).join(', '));
    setChecked('f-featured',  item.featured);

    const preview = $('img-preview');
    const previewWrap = $('img-preview-wrap');
    if (preview && previewWrap) {
      if (item.image) {
        preview.src = item.image;
        previewWrap.style.display = 'block';
      } else {
        previewWrap.style.display = 'none';
      }
    }
    updatePlaceholderPreview(item.color || '#C8A96E', item.emoji || '🎨');
  }

  function resetForm() {
    $('item-form')?.reset();
    setValue('f-color', '#C8A96E');
    setValue('f-year', new Date().getFullYear().toString());
    const previewWrap = $('img-preview-wrap');
    if (previewWrap) previewWrap.style.display = 'none';
    updatePlaceholderPreview('#C8A96E', '🎨');
  }

  function bindFormEvents() {
    /* Submit */
    $('item-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      await saveItem();
    });

    /* Image upload */
    $('f-image')?.addEventListener('change', async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      showFormStatus('⏳ Memproses gambar...', 'info');
      try {
        pendingImage = await PortfolioStorage.compressImage(file);
        const preview = $('img-preview');
        const previewWrap = $('img-preview-wrap');
        if (preview) preview.src = pendingImage;
        if (previewWrap) previewWrap.style.display = 'block';
        showFormStatus(`✓ Gambar siap (${estimateSize(pendingImage)})`, 'success');
      } catch (err) {
        showFormStatus('✗ Gagal memproses gambar: ' + err.message, 'error');
      }
    });

    /* Remove image */
    $('btn-remove-img')?.addEventListener('click', () => {
      pendingImage = null;
      if ($('f-image')) $('f-image').value = '';
      const previewWrap = $('img-preview-wrap');
      if (previewWrap) previewWrap.style.display = 'none';
      showFormStatus('Gambar dihapus. Karya akan tampil dengan warna/emoji.', 'info');
    });

    /* Color / emoji live preview */
    $('f-color')?.addEventListener('input', e => {
      updatePlaceholderPreview(e.target.value, $('f-emoji')?.value || '🎨');
    });
    $('f-emoji')?.addEventListener('input', e => {
      updatePlaceholderPreview($('f-color')?.value || '#C8A96E', e.target.value || '🎨');
    });

    /* Close panel */
    $('btn-close-panel')?.addEventListener('click', closePanel);
    $('panel-overlay')?.addEventListener('click', closePanel);
  }

  async function saveItem() {
    const title = getValue('f-title').trim();
    if (!title) { showFormStatus('✗ Judul wajib diisi.', 'error'); return; }

    const catValue = getValue('f-category');
    const catMap   = {
      branding: 'Branding & Identity',
      digital:  'UI/UX Design',
      print:    'Packaging & Print',
      spatial:  'Spatial Branding',
      motion:   'Motion & Event',
      other:    'Lainnya'
    };

    const payload = {
      title,
      client:        getValue('f-client').trim()  || '—',
      year:          getValue('f-year').trim()     || new Date().getFullYear().toString(),
      category:      catValue,
      categoryLabel: catMap[catValue] || 'Lainnya',
      color:         getValue('f-color'),
      emoji:         getValue('f-emoji').trim()   || '🎨',
      description:   getValue('f-description').trim(),
      result:        getValue('f-result').trim(),
      tags:          getValue('f-tags').split(',').map(t => t.trim()).filter(Boolean),
      featured:      getChecked('f-featured'),
      image:         pendingImage,
    };

    $('form-submit-btn').disabled = true;
    $('form-submit-btn').textContent = 'Menyimpan...';

    let success = false;
    if (editingId) {
      const updated = PortfolioStorage.update(editingId, payload);
      success = !!updated;
    } else {
      const added = PortfolioStorage.add(payload);
      success = !!added;
    }

    $('form-submit-btn').disabled = false;
    $('form-submit-btn').textContent = editingId ? 'Update Karya' : 'Simpan Karya';

    if (success) {
      showFormStatus(`✓ Karya "${title}" berhasil ${editingId ? 'diupdate' : 'ditambahkan'}!`, 'success');
      loadItems();
      updateStorageInfo();
      setTimeout(closePanel, 800);
    } else {
      showFormStatus('✗ Gagal menyimpan. Penyimpanan mungkin penuh.', 'error');
    }
  }

  /* ============================================================
     DELETE
  ============================================================ */
  window.adminDelete = function (id) {
    const item = PortfolioStorage.getById(id);
    if (!item) return;
    if (!confirm(`Hapus karya "${item.title}"?\n\nTindakan ini tidak bisa dibatalkan.`)) return;
    if (PortfolioStorage.remove(id)) {
      loadItems();
      updateStorageInfo();
      adminToast(`✓ "${item.title}" berhasil dihapus.`);
    }
  };

  /* ============================================================
     TOGGLE FEATURED
  ============================================================ */
  window.adminToggleFeatured = function (id) {
    const updated = PortfolioStorage.toggleFeatured(id);
    if (updated) {
      loadItems();
      adminToast(updated.featured ? '★ Ditambahkan ke Featured' : '☆ Dihapus dari Featured');
    }
  };

  /* ============================================================
     RESET
  ============================================================ */
  function confirmReset() {
    if (!confirm('Reset semua data ke default?\n\nSemua karya yang telah ditambahkan akan hilang.\nTindakan ini tidak bisa dibatalkan!')) return;
    PortfolioStorage.reset();
    loadItems();
    updateStorageInfo();
    adminToast('Data direset ke default.');
  }

  /* ============================================================
     DRAG & DROP REORDER
  ============================================================ */
  function bindDragDrop() {
    const rows = document.querySelectorAll('.adm-item[draggable]');
    rows.forEach(row => {
      row.addEventListener('dragstart', e => {
        dragSrcIdx = parseInt(row.dataset.idx);
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
      row.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; row.classList.add('drag-over'); });
      row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
      row.addEventListener('drop', e => {
        e.preventDefault();
        row.classList.remove('drag-over');
        const toIdx = parseInt(row.dataset.idx);
        if (dragSrcIdx !== null && dragSrcIdx !== toIdx) {
          PortfolioStorage.reorder(dragSrcIdx, toIdx);
          loadItems();
          adminToast('✓ Urutan diperbarui.');
        }
        dragSrcIdx = null;
      });
    });
  }

  /* ============================================================
     PANEL (SLIDE-IN FORM)
  ============================================================ */
  function openPanel() {
    $('form-panel')?.classList.add('open');
    $('panel-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('f-title')?.focus();
  }

  function closePanel() {
    $('form-panel')?.classList.remove('open');
    $('panel-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
    editingId    = null;
    pendingImage = null;
    $('form-status').textContent = '';
  }

  /* ============================================================
     HELPERS
  ============================================================ */
  function itemBg(item) {
    return item.color
      ? `linear-gradient(135deg, ${item.color}44, ${item.color}22)`
      : 'var(--bg2)';
  }

  function estimateSize(b64) {
    const bytes = Math.round((b64.length * 3) / 4);
    return bytes > 1024 * 1024
      ? (bytes / (1024 * 1024)).toFixed(2) + ' MB'
      : Math.round(bytes / 1024) + ' KB';
  }

  function updatePlaceholderPreview(color, emoji) {
    const ph = $('color-preview');
    if (ph) {
      ph.style.background = `linear-gradient(135deg, ${color}44, ${color}22)`;
      ph.textContent = emoji;
    }
  }

  function updateStorageInfo() {
    const el = $('storage-info');
    if (el) el.textContent = `Penyimpanan terpakai: ${PortfolioStorage.getStorageSize()} / ~5 MB`;
  }

  function showFormStatus(msg, type) {
    const el = $('form-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'form-status ' + (type || '');
  }

  function bindLogout() {
    $('btn-logout')?.addEventListener('click', () => {
      if (confirm('Keluar dari panel admin?')) logout();
    });
  }

  /* form value helpers */
  function getValue(id)    { return $(id)?.value ?? ''; }
  function setValue(id, v) { if ($(id)) $(id).value = v ?? ''; }
  function getChecked(id)  { return !!($(id)?.checked); }
  function setChecked(id, v) { if ($(id)) $(id).checked = !!v; }

  /* Toast */
  let toastTimer;
  function adminToast(msg) {
    const t = $('admin-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
  }

  /* Export for inline HTML buttons */
  window.adminEdit           = window.adminEdit;
  window.adminDelete         = window.adminDelete;
  window.adminToggleFeatured = window.adminToggleFeatured;

  /* ============================================================
     BOOTSTRAP
  ============================================================ */
  document.addEventListener('DOMContentLoaded', initAuth);

})();
