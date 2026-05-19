/* ============================================================
   admin.js — Panel Admin Online
   Auth    : bcrypt hash via Netlify Function
   Storage : localStorage → Deploy ke GitHub via API
   kitayangdesain.com
============================================================ */
(function () {
  'use strict';

  const SESSION_KEY = 'kyd_admin_token';

  /* ── State ─────────────────────────────────────────────── */
  let allItems     = [];
  let editingId    = null;
  let pendingImg   = null;
  let dragSrcIdx   = null;

  let currentTab   = 'portfolio';
  let allBlogPosts = [];
  let blogEditingId   = null;
  let blogPendingImg  = null;
  let blogDragSrcIdx  = null;

  const $ = id => document.getElementById(id);

  function getToken() { return sessionStorage.getItem(SESSION_KEY) || ''; }

  /* ── INIT ──────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', async () => {
    if (await checkSession()) { showApp(); startSessionWatch(); }
    else showLogin();
  });

  let sessionTimer = null;

  /* ── SESSION ───────────────────────────────────────────── */
  async function checkSession() {
    const token = getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 <= Date.now()) { doLogout(); return false; }
      return true;
    } catch { doLogout(); return false; }
  }
  function saveSession(token) {
    sessionStorage.setItem(SESSION_KEY, token);
    startSessionWatch();
  }

  function startSessionWatch() {
    clearInterval(sessionTimer);
    sessionTimer = setInterval(async () => {
      if (!(await checkSession())) {
        toast('Sesi habis (30 menit). Silakan login ulang.');
        doLogout();
      }
    }, 60000);
  }

  function doLogout() {
    clearInterval(sessionTimer);
    sessionStorage.clear();
    localStorage.clear();
    showLogin();
  }

  $('login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const pw = $('login-pw')?.value || '';
    const btn = e.target.querySelector('.login-btn');
    const err = $('login-err');
    if (btn) { btn.disabled = true; btn.textContent = 'Memverifikasi...'; }
    if (err) err.style.display = 'none';

    try {
      const res = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        saveSession(data.token);
        $('login-pw').value = '';
        showApp();
      } else {
        if (err) { err.textContent = data.error || 'Password salah.'; err.style.display = 'block'; }
        $('login-pw').value = '';
        $('login-pw').focus();
      }
    } catch (ex) {
      if (err) { err.textContent = 'Gagal terhubung ke server.'; err.style.display = 'block'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Masuk →'; }
    }
  });

  $('login-pw')?.addEventListener('input', () => {
    const err = $('login-err');
    if (err) err.style.display = 'none';
  });

  $('toggle-pw')?.addEventListener('click', () => {
    const inp = $('login-pw');
    const btn = $('toggle-pw');
    if (!inp || !btn) return;
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    btn.innerHTML = show ? '&#128584;' : '&#128065;';
  });

  /* ── APP INIT ──────────────────────────────────────────── */
  function initApp() {
    allItems = PortfolioStorage.getAll();
    allBlogPosts = BlogStorage.getAll();
    renderList(allItems);
    renderBlogList(allBlogPosts);
    updateSidebar();
    bindFormEvents();
    bindBlogFormEvents();
    bindSearch();

    $('btn-new')?.addEventListener('click', () => {
      if (currentTab === 'blog') openBlogNew(); else openNew();
    });
    $('btn-deploy')?.addEventListener('click', doDeploy);
    $('import-file')?.addEventListener('change', doImport);
    $('btn-reset')?.addEventListener('click', doReset);
    $('btn-logout')?.addEventListener('click', () => {
      if (confirm('Keluar dari admin?')) doLogout();
    });
  }

  /* ── TAB SWITCHING ─────────────────────────────────────── */
  window.switchTab = function(tab) {
    currentTab = tab;
    $('tab-portfolio')?.classList.toggle('active', tab === 'portfolio');
    $('tab-blog')?.classList.toggle('active', tab === 'blog');

    // Toggle topbar
    const topbar = document.querySelector('.topbar');
    const content = document.querySelector('.content');
    if (tab === 'blog') {
      if (topbar) {
        topbar.querySelector('.topbar-l').innerHTML = `
          <input class="adm-search" id="search" type="search" placeholder="🔍  Cari artikel..."/>
          <select class="adm-filter" id="filter-cat">
            <option value="all">Semua Kategori</option>
            <option value="branding">Branding</option>
            <option value="digital">Digital</option>
            <option value="print">Print</option>
            <option value="other">Bisnis Kreatif</option>
          </select>
          <span id="item-count"></span>`;
        topbar.querySelector('#btn-new-topbar').textContent = '+ Tambah Artikel';
        bindSearch();
      }
      if (content) {
        content.innerHTML = `
          <div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;margin-bottom:1.25rem;font-size:.78rem;color:var(--fg2);line-height:1.8;display:flex;align-items:flex-start;gap:.75rem;">
            <span style="font-size:1.25rem;flex-shrink:0">🚀</span>
            <span>
              <strong style="color:var(--fg)">Online Mode:</strong>
              Edit artikel di sini → klik <strong>Deploy</strong> → data langsung ter-push ke GitHub → Netlify otomatis update.
            </span>
          </div>
          <div id="blog-list"></div>`;
      }
      renderBlogList(allBlogPosts);
      updateSidebar();
    } else {
      if (topbar) {
        topbar.querySelector('.topbar-l').innerHTML = `
          <input class="adm-search" id="search" type="search" placeholder="🔍  Cari karya..."/>
          <select class="adm-filter" id="filter-cat">
            <option value="all">Semua Kategori</option>
            <option value="branding">Branding</option>
            <option value="digital">Digital</option>
            <option value="print">Print</option>
            <option value="spatial">Spatial</option>
            <option value="motion">Motion</option>
            <option value="other">Lainnya</option>
          </select>
          <span id="item-count"></span>`;
        topbar.querySelector('#btn-new-topbar').textContent = '+ Tambah Karya';
        bindSearch();
      }
      if (content) {
        content.innerHTML = `
          <div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;margin-bottom:1.25rem;font-size:.78rem;color:var(--fg2);line-height:1.8;display:flex;align-items:flex-start;gap:.75rem;">
            <span style="font-size:1.25rem;flex-shrink:0">🚀</span>
            <span>
              <strong style="color:var(--fg)">Online Mode:</strong>
              Edit karya di sini → klik <strong>Deploy</strong> → data langsung ter-push ke GitHub → Netlify otomatis update.
            </span>
          </div>
          <div id="admin-list"></div>`;
      }
      renderList(allItems);
      updateSidebar();
    }
  };

  /* ── SIDEBAR info ──────────────────────────────────────── */
  function updateSidebar() {
    if (currentTab === 'portfolio') {
      setText('sidebar-count',   allItems.length + ' karya');
      setText('sidebar-storage', PortfolioStorage.storageSize() + ' / ~5MB');
      const draftBanner = $('draft-banner');
      if (draftBanner) draftBanner.style.display = PortfolioStorage.hasDraft() ? 'block' : 'none';
    } else {
      setText('sidebar-count',   allBlogPosts.length + ' artikel');
      setText('sidebar-storage', BlogStorage.storageSize() + ' / ~5MB');
      const draftBanner = $('draft-banner');
      if (draftBanner) draftBanner.style.display = BlogStorage.hasDraft() ? 'block' : 'none';
    }
  }

  /* ── RENDER LIST ───────────────────────────────────────── */
  function renderList(data) {
    const list = $('admin-list');
    if (!list) return;
    setText('item-count', data.length + ' karya');

    if (!data.length) {
      list.innerHTML = `
        <div class="adm-empty">
          <div style="font-size:2.5rem;margin-bottom:.75rem">📂</div>
          <p>Belum ada karya.<br>Klik <strong>+ Tambah Karya</strong> untuk mulai.</p>
        </div>`;
      return;
    }

    list.innerHTML = data.map((item, idx) => `
      <div class="adm-item" draggable="true" data-id="${item.id}" data-idx="${idx}">
        <div class="adm-drag" title="Drag untuk urutkan">⠿</div>
        <div class="adm-thumb" style="background:${bg(item)}">
          ${item.image
            ? `<img src="${item.image}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:4px">`
            : `<span style="font-size:1.6rem">${item.emoji || '🎨'}</span>`}
        </div>
        <div class="adm-info">
          <div class="adm-title">${x(item.title)}</div>
          <div class="adm-meta">
            <span class="cat-badge cat-${item.category}">${x(item.categoryLabel)}</span>
            <span>${x(item.client)} · ${x(item.year)}</span>
            ${item.featured ? '<span class="feat-pill">★ Featured</span>' : ''}
          </div>
          <div class="adm-tags">${(item.tags || []).slice(0, 4).map(t => `<span class="adm-tag">${x(t)}</span>`).join('')}</div>
        </div>
        <div class="adm-actions">
          <button class="adm-btn ghost" onclick="adminStar('${item.id}')" title="Toggle featured">
            ${item.featured ? '★' : '☆'}
          </button>
          <button class="adm-btn outline" onclick="adminEdit('${item.id}')">Edit</button>
          <button class="adm-btn danger" onclick="adminDel('${item.id}','${x(item.title)}')">Hapus</button>
        </div>
      </div>`).join('');

    bindDrag();
    updateSidebar();
  }

  /* ── SEARCH ────────────────────────────────────────────── */
  function bindSearch() {
    $('search')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      renderList(!q ? allItems : allItems.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.client.toLowerCase().includes(q) ||
        (i.categoryLabel || '').toLowerCase().includes(q)));
    });
    $('filter-cat')?.addEventListener('change', e => {
      const cat = e.target.value;
      renderList(cat === 'all' ? allItems : allItems.filter(i => i.category === cat));
    });
  }

  /* ── DRAG & DROP ───────────────────────────────────────── */
  function bindDrag() {
    document.querySelectorAll('.adm-item[draggable]').forEach(row => {
      row.addEventListener('dragstart', e => {
        dragSrcIdx = parseInt(row.dataset.idx);
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      row.addEventListener('dragend',  () => row.classList.remove('dragging'));
      row.addEventListener('dragover', e => { e.preventDefault(); row.classList.add('drag-over'); });
      row.addEventListener('dragleave',() => row.classList.remove('drag-over'));
      row.addEventListener('drop', e => {
        e.preventDefault(); row.classList.remove('drag-over');
        const to = parseInt(row.dataset.idx);
        if (dragSrcIdx !== null && dragSrcIdx !== to) {
          allItems = PortfolioStorage.reorder(dragSrcIdx, to);
          renderList(allItems);
          toast('✓ Urutan diubah — klik Deploy untuk push ke GitHub');
        }
        dragSrcIdx = null;
      });
    });
  }

  /* ── FORM OPEN ─────────────────────────────────────────── */
  function openNew() {
    editingId = null; pendingImg = null;
    clearForm();
    setText('panel-title', '+ Tambah Karya Baru');
    setText('submit-btn',  'Simpan Karya');
    openPanel();
  }

  window.adminEdit = function (id) {
    const item = allItems.find(i => i.id === id);
    if (!item) return;
    editingId  = id;
    pendingImg = item.image || null;
    fillForm(item);
    setText('panel-title', 'Edit Karya');
    setText('submit-btn',  'Update Karya');
    openPanel();
  };

  function openPanel() {
    $('panel')?.classList.add('open');
    $('overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    clearStatus();
    setTimeout(() => $('f-title')?.focus(), 80);
  }
  function closePanel() {
    $('panel')?.classList.remove('open');
    $('overlay')?.classList.remove('open');
    document.body.style.overflow = '';
    editingId = null; pendingImg = null;
  }
  $('btn-close-panel')?.addEventListener('click', closePanel);
  $('btn-cancel')?.addEventListener('click', closePanel);
  $('overlay')?.addEventListener('click', closePanel);

  /* ── FORM EVENTS ───────────────────────────────────────── */
  function bindFormEvents() {
    $('item-form')?.addEventListener('submit', e => { e.preventDefault(); saveItem(); });

    $('f-image')?.addEventListener('change', async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      setStatus('⏳ Memproses gambar...', 'info');
      try {
        pendingImg = await PortfolioStorage.compressImage(file);
        showPreview(pendingImg);
        setStatus(`✓ Gambar siap (${imgSize(pendingImg)}) — tersimpan sebagai base64`, 'success');
      } catch (err) {
        setStatus('✗ ' + err.message, 'error');
      }
    });

    $('btn-rm-img')?.addEventListener('click', () => {
      pendingImg = null;
      if ($('f-image')) $('f-image').value = '';
      hidePreview();
      setStatus('Gambar dihapus.', 'info');
    });

    $('f-color')?.addEventListener('input', updatePrev);
    $('f-emoji')?.addEventListener('input', updatePrev);
    updatePrev();
  }

  /* ── SAVE ──────────────────────────────────────────────── */
  function saveItem() {
    const title = ($('f-title')?.value || '').trim();
    if (!title) { setStatus('✗ Judul wajib diisi.', 'error'); return; }

    const catMap = {
      branding: 'Branding & Identity', digital: 'UI/UX Design',
      print: 'Packaging & Print', spatial: 'Spatial Branding',
      motion: 'Motion & Event', other: 'Lainnya'
    };
    const cat = $('f-category')?.value || 'other';

    const payload = {
      title,
      client       : ($('f-client')?.value   || '').trim() || '—',
      year         : ($('f-year')?.value      || '').trim() || String(new Date().getFullYear()),
      category     : cat,
      categoryLabel: catMap[cat] || 'Lainnya',
      color        : $('f-color')?.value  || '#C8A96E',
      emoji        : ($('f-emoji')?.value  || '').trim() || '🎨',
      description  : ($('f-desc')?.value   || '').trim(),
      result       : ($('f-result')?.value || '').trim(),
      tags         : ($('f-tags')?.value   || '').split(',').map(t => t.trim()).filter(Boolean),
      featured     : !!$('f-featured')?.checked,
      image        : pendingImg || null,
    };

    const saved = editingId
      ? PortfolioStorage.update(editingId, payload)
      : PortfolioStorage.add(payload);

    if (saved) {
      allItems = PortfolioStorage.getAll();
      renderList(allItems);
      setStatus(`✓ "${saved.title}" tersimpan!`, 'success');
      toast('✓ Tersimpan — klik Deploy untuk push ke GitHub');
      setTimeout(closePanel, 900);
    } else {
      setStatus('✗ Gagal menyimpan (storage penuh?)', 'error');
    }
  }

  /* ── DELETE ────────────────────────────────────────────── */
  window.adminDel = function (id, title) {
    if (!confirm(`Hapus karya "${title}"?`)) return;
    PortfolioStorage.remove(id);
    allItems = PortfolioStorage.getAll();
    renderList(allItems);
    toast(`✓ "${title}" dihapus`);
  };

  /* ── TOGGLE FEATURED ───────────────────────────────────── */
  window.adminStar = function (id) {
    const updated = PortfolioStorage.toggleFeatured(id);
    if (updated) {
      allItems = PortfolioStorage.getAll();
      renderList(allItems);
      toast(updated.featured ? '★ Ditambahkan ke Featured' : '☆ Dihapus dari Featured');
    }
  };

  /* ── DEPLOY ────────────────────────────────────────────── */
  async function doDeploy() {
    const type = currentTab === 'blog' ? 'blog' : 'portfolio';
    const data = type === 'blog' ? BlogStorage.getAll() : PortfolioStorage.getAll();
    const token = getToken();

    if (!token) { toast('✗ Sesi habis, silakan login ulang'); doLogout(); return; }

    toast('⏳ Deploying ' + type + '.json...');
    try {
      const res = await fetch('/.netlify/functions/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ type, data })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast('✓ ' + type + '.json berhasil di-deploy ke GitHub!');
        if (type === 'blog') BlogStorage.clearDraft(); else PortfolioStorage.clearDraft();
        updateSidebar();
      } else if (res.status === 401) {
        toast('✗ Sesi habis, silakan login ulang');
        doLogout();
      } else {
        toast('✗ Deploy gagal: ' + (result.error || 'Unknown error'));
      }
    } catch (ex) {
      toast('✗ Gagal terhubung ke server: ' + ex.message);
    }
  }

  /* ── IMPORT ────────────────────────────────────────────── */
  async function doImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (currentTab === 'blog') {
        const count = await BlogStorage.importJSON(file);
        allBlogPosts = BlogStorage.getAll();
        renderBlogList(allBlogPosts);
        toast('✓ ' + count + ' artikel berhasil diimport');
      } else {
        const count = await PortfolioStorage.importJSON(file);
        allItems = PortfolioStorage.getAll();
        renderList(allItems);
        toast('✓ ' + count + ' karya berhasil diimport');
      }
    } catch (err) {
      toast('✗ Import gagal: ' + err.message);
    }
    e.target.value = '';
  }

  /* ── RESET ─────────────────────────────────────────────── */
  function doReset() {
    if (currentTab === 'blog') {
      if (!confirm('Reset semua artikel ke default?\nTidak bisa dibatalkan!')) return;
      allBlogPosts = BlogStorage.reset();
      renderBlogList(allBlogPosts);
      toast('Artikel direset ke default');
    } else {
      if (!confirm('Reset semua data ke default?\nTidak bisa dibatalkan!')) return;
      allItems = PortfolioStorage.reset();
      renderList(allItems);
      toast('Data direset ke default');
    }
  }

  /* ============================================================
     BLOG MANAGEMENT
  ============================================================ */

  /* ── RENDER BLOG LIST ──────────────────────────────────── */
  function renderBlogList(data) {
    const list = $('blog-list');
    if (!list) return;
    setText('item-count', data.length + ' artikel');

    if (!data.length) {
      list.innerHTML = '<div class="adm-empty"><div style="font-size:2.5rem;margin-bottom:.75rem">📝</div><p>Belum ada artikel.<br>Klik <strong>+ Tambah Artikel</strong> untuk mulai.</p></div>';
      return;
    }

    list.innerHTML = data.map(function(item, idx) {
      return '<div class="adm-item" draggable="true" data-id="' + item.id + '" data-idx="' + idx + '">'
        + '<div class="adm-drag" title="Drag untuk urutkan">⠿</div>'
        + '<div class="adm-thumb" style="background:' + bg(item) + '">'
        + (item.image
          ? '<img src="' + item.image + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:4px">'
          : '<span style="font-size:1.6rem">' + (item.emoji || '✦') + '</span>')
        + '</div>'
        + '<div class="adm-info">'
        + '<div class="adm-title">' + x(item.title) + '</div>'
        + '<div class="adm-meta">'
        + '<span class="cat-badge cat-' + item.category + '">' + x(item.categoryLabel || item.category) + '</span>'
        + '<span>' + x(item.date) + '</span>'
        + '<span>' + x(item.readTime) + '</span>'
        + '</div>'
        + '<div class="adm-tags">' + x((item.excerpt || '').substring(0, 80)) + ((item.excerpt || '').length > 80 ? '...' : '') + '</div>'
        + '</div>'
        + '<div class="adm-actions">'
        + '<button class="adm-btn outline" onclick="blogEdit(\'' + item.id + '\')">Edit</button>'
        + '<button class="adm-btn danger" onclick="blogDel(\'' + item.id + '\',\'' + x(item.title).replace(/'/g, "\\'") + '\')">Hapus</button>'
        + '</div></div>';
    }).join('');

    bindBlogDrag();
    updateSidebar();
  }

  /* ── BLOG SEARCH (wired via switchTab) ─────────────────── */
  function bindBlogSearch() {
    $('search')?.addEventListener('input', function(e) {
      var q = e.target.value.toLowerCase().trim();
      renderBlogList(!q ? allBlogPosts : allBlogPosts.filter(function(p) {
        return p.title.toLowerCase().includes(q) ||
          (p.categoryLabel || '').toLowerCase().includes(q) ||
          (p.excerpt || '').toLowerCase().includes(q);
      }));
    });
    $('filter-cat')?.addEventListener('change', function(e) {
      var cat = e.target.value;
      renderBlogList(cat === 'all' ? allBlogPosts : allBlogPosts.filter(function(p) { return p.category === cat; }));
    });
  }

  /* ── BLOG DRAG & DROP ──────────────────────────────────── */
  function bindBlogDrag() {
    document.querySelectorAll('.adm-item[draggable]').forEach(function(row) {
      row.addEventListener('dragstart', function(e) {
        blogDragSrcIdx = parseInt(row.dataset.idx);
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      row.addEventListener('dragend', function() { row.classList.remove('dragging'); });
      row.addEventListener('dragover', function(e) { e.preventDefault(); row.classList.add('drag-over'); });
      row.addEventListener('dragleave', function() { row.classList.remove('drag-over'); });
      row.addEventListener('drop', function(e) {
        e.preventDefault(); row.classList.remove('drag-over');
        var to = parseInt(row.dataset.idx);
        if (blogDragSrcIdx !== null && blogDragSrcIdx !== to) {
          allBlogPosts = BlogStorage.reorder(blogDragSrcIdx, to);
          renderBlogList(allBlogPosts);
          toast('✓ Urutan diubah — klik Deploy untuk push ke GitHub');
        }
        blogDragSrcIdx = null;
      });
    });
  }

  /* ── BLOG FORM OPEN ────────────────────────────────────── */
  function openBlogNew() {
    blogEditingId = null; blogPendingImg = null;
    clearBlogForm();
    setText('blog-panel-title', '+ Tambah Artikel Baru');
    setText('blog-submit-btn', 'Simpan Artikel');
    openBlogPanel();
  }

  window.blogEdit = function(id) {
    var item = allBlogPosts.find(function(p) { return p.id === id; });
    if (!item) return;
    blogEditingId = id;
    blogPendingImg = item.image || null;
    fillBlogForm(item);
    setText('blog-panel-title', 'Edit Artikel');
    setText('blog-submit-btn', 'Update Artikel');
    openBlogPanel();
  };

  function openBlogPanel() {
    $('blog-panel')?.classList.add('open');
    $('blog-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    clearBlogStatus();
    setTimeout(function() { $('b-title')?.focus(); }, 80);
  }
  function closeBlogPanel() {
    $('blog-panel')?.classList.remove('open');
    $('blog-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
    blogEditingId = null; blogPendingImg = null;
  }

  /* ── BLOG FORM EVENTS ──────────────────────────────────── */
  function bindBlogFormEvents() {
    $('btn-close-blog-panel')?.addEventListener('click', closeBlogPanel);
    $('btn-cancel-blog')?.addEventListener('click', closeBlogPanel);
    $('blog-overlay')?.addEventListener('click', closeBlogPanel);

    $('blog-form')?.addEventListener('submit', function(e) { e.preventDefault(); saveBlogItem(); });

    $('b-image')?.addEventListener('change', async function(e) {
      var file = e.target.files?.[0];
      if (!file) return;
      setBlogStatus('⏳ Memproses gambar...', 'info');
      try {
        blogPendingImg = await PortfolioStorage.compressImage(file);
        showBlogPreview(blogPendingImg);
        setBlogStatus('✓ Gambar siap (' + imgSize(blogPendingImg) + ')', 'success');
      } catch (err) {
        setBlogStatus('✗ ' + err.message, 'error');
      }
    });

    $('btn-rm-blog-img')?.addEventListener('click', function() {
      blogPendingImg = null;
      if ($('b-image')) $('b-image').value = '';
      hideBlogPreview();
      setBlogStatus('Gambar dihapus.', 'info');
    });

    $('b-color')?.addEventListener('input', updateBlogPrev);
    $('b-emoji')?.addEventListener('input', updateBlogPrev);
    updateBlogPrev();

    // Insert image into content
    $('btn-insert-img')?.addEventListener('click', function() {
      $('insert-img-file')?.click();
    });
    $('insert-img-file')?.addEventListener('change', async function(e) {
      var file = e.target.files?.[0];
      if (!file) return;
      var ta = $('b-content');
      if (!ta) return;
      var align = $('insert-img-align')?.value || 'full';
      setBlogStatus('⏳ Memproses gambar...', 'info');
      try {
        var b64 = await PortfolioStorage.compressImage(file, 1200, 0.80);
        var styleMap = {
          full: 'width:100%;border-radius:6px;margin:1.5rem 0',
          center: 'display:block;margin:1.5rem auto;max-width:100%;border-radius:6px',
          left: 'float:left;margin:0 1.5rem 1rem 0;max-width:50%;border-radius:6px',
          right: 'float:right;margin:0 0 1rem 1.5rem;max-width:50%;border-radius:6px'
        };
        var imgTag = '<div class="blog-img-wrap blog-img-' + align + '" style="overflow:hidden;margin:1.5rem 0">'
          + '<img src="' + b64 + '" alt="" style="' + (styleMap[align] || styleMap.full) + '">'
          + '</div>';
        // Insert at cursor position
        var start = ta.selectionStart;
        var end = ta.selectionEnd;
        var before = ta.value.substring(0, start);
        var after = ta.value.substring(end);
        // Add newlines if needed
        var prefix = (before.length > 0 && before[before.length - 1] !== '\n') ? '\n' : '';
        var suffix = (after.length > 0 && after[0] !== '\n') ? '\n' : '';
        ta.value = before + prefix + imgTag + suffix + after;
        // Move cursor after inserted image
        var newPos = start + prefix.length + imgTag.length + suffix.length;
        ta.setSelectionRange(newPos, newPos);
        ta.focus();
        setBlogStatus('✓ Gambar disisipkan (' + imgSize(b64) + ') — posisi: ' + align, 'success');
      } catch (err) {
        setBlogStatus('✗ ' + err.message, 'error');
      }
      e.target.value = '';
    });
  }

  /* ── BLOG SAVE ─────────────────────────────────────────── */
  function saveBlogItem() {
    var title = ($('b-title')?.value || '').trim();
    var content = ($('b-content')?.value || '').trim();
    var excerpt = ($('b-excerpt')?.value || '').trim();
    if (!title) { setBlogStatus('✗ Judul wajib diisi.', 'error'); return; }
    if (!content) { setBlogStatus('✗ Konten artikel wajib diisi.', 'error'); return; }
    if (!excerpt) { setBlogStatus('✗ Ringkasan wajib diisi.', 'error'); return; }

    var catMap = {
      branding: 'Branding', digital: 'UI/UX',
      print: 'Packaging', spatial: 'Spatial',
      motion: 'Motion & Video', other: 'Lainnya'
    };
    var cat = $('b-category')?.value || 'other';

    // Format tanggal dari date input (YYYY-MM-DD) ke format Indonesia
    var dateVal = '';
    var dateInput = $('b-date')?.value || '';
    if (dateInput) {
      var months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      var parts = dateInput.split('-');
      dateVal = parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
    } else {
      dateVal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // Waktu baca: angka + "menit baca"
    var readMin = parseInt($('b-readtime')?.value) || 5;
    var readTimeVal = readMin + ' menit baca';

    var payload = {
      title        : title,
      category     : cat,
      categoryLabel: ($('b-catlabel')?.value || '').trim() || catMap[cat] || 'Lainnya',
      date         : dateVal,
      readTime     : readTimeVal,
      excerpt      : excerpt,
      content      : content,
      image        : blogPendingImg || null,
      color        : $('b-color')?.value || '#C8A96E',
      emoji        : ($('b-emoji')?.value || '').trim() || '✦'
    };

    var saved = blogEditingId
      ? BlogStorage.update(blogEditingId, payload)
      : BlogStorage.add(payload);

    if (saved) {
      allBlogPosts = BlogStorage.getAll();
      renderBlogList(allBlogPosts);
      setBlogStatus('✓ "' + saved.title + '" tersimpan!', 'success');
      toast('✓ Tersimpan — jangan lupa Export & Deploy');
      setTimeout(closeBlogPanel, 900);
    } else {
      setBlogStatus('✗ Gagal menyimpan (storage penuh?)', 'error');
    }
  }

  /* ── BLOG DELETE ────────────────────────────────────────── */
  window.blogDel = function(id, title) {
    if (!confirm('Hapus artikel "' + title + '"?')) return;
    BlogStorage.remove(id);
    allBlogPosts = BlogStorage.getAll();
    renderBlogList(allBlogPosts);
    toast('✓ "' + title + '" dihapus');
  };

  /* ── BLOG FORM HELPERS ──────────────────────────────────── */
  function clearBlogForm() {
    $('blog-form')?.reset();
    if ($('b-color')) $('b-color').value = '#C8A96E';
    hideBlogPreview(); updateBlogPrev(); clearBlogStatus();
  }

  function fillBlogForm(item) {
    setVal('b-title',     item.title);
    setVal('b-category',  item.category);
    setVal('b-catlabel',  item.categoryLabel || '');
    setVal('b-excerpt',   item.excerpt || '');
    setVal('b-content',   item.content || '');
    setVal('b-color',     item.color || '#C8A96E');
    setVal('b-emoji',     item.emoji || '');

    // Parse tanggal Indonesia → YYYY-MM-DD untuk input date
    if (item.date) {
      var months = {'Januari':'01','Februari':'02','Maret':'03','April':'04','Mei':'05','Juni':'06','Juli':'07','Agustus':'08','September':'09','Oktober':'10','November':'11','Desember':'12'};
      var dp = item.date.split(' ');
      if (dp.length === 3 && months[dp[1]]) {
        setVal('b-date', dp[2] + '-' + months[dp[1]] + '-' + dp[0].padStart(2, '0'));
      } else {
        // fallback: kosongkan, biar user pilih ulang
        setVal('b-date', '');
      }
    } else {
      setVal('b-date', '');
    }

    // Parse "8 menit baca" → 8
    var rt = (item.readTime || '').replace(/[^0-9]/g, '');
    setVal('b-readtime', rt || '');

    item.image ? showBlogPreview(item.image) : hideBlogPreview();
    updateBlogPrev(); clearBlogStatus();
  }

  function showBlogPreview(src) {
    var w = $('blog-img-wrap'); var i = $('blog-img-prev');
    if (i) i.src = src; if (w) w.style.display = 'block';
  }
  function hideBlogPreview() {
    var w = $('blog-img-wrap'); if (w) w.style.display = 'none';
  }
  function updateBlogPrev() {
    var el = $('blog-color-prev'); if (!el) return;
    el.style.background = 'linear-gradient(135deg,' + ($('b-color')?.value||'#C8A96E') + '55,' + ($('b-color')?.value||'#C8A96E') + '22)';
    el.textContent = $('b-emoji')?.value || '✦';
  }
  function setBlogStatus(msg, type) {
    var el = $('blog-form-status'); if (!el) return;
    el.textContent = msg; el.className = 'form-status ' + (type || '');
  }
  function clearBlogStatus() { setBlogStatus(''); }

  /* ── FORM HELPERS ──────────────────────────────────────── */
  function clearForm() {
    $('item-form')?.reset();
    if ($('f-color')) $('f-color').value = '#C8A96E';
    if ($('f-year'))  $('f-year').value  = String(new Date().getFullYear());
    hidePreview(); updatePrev(); clearStatus();
  }

  function fillForm(item) {
    setVal('f-title',  item.title);
    setVal('f-client', item.client);
    setVal('f-year',   item.year);
    setVal('f-category', item.category);
    setVal('f-color',    item.color || '#C8A96E');
    setVal('f-emoji',    item.emoji || '');
    setVal('f-desc',     item.description || '');
    setVal('f-result',   item.result || '');
    setVal('f-tags',     (item.tags || []).join(', '));
    if ($('f-featured')) $('f-featured').checked = !!item.featured;
    item.image ? showPreview(item.image) : hidePreview();
    updatePrev(); clearStatus();
  }

  function showPreview(src) {
    const w = $('img-wrap'); const i = $('img-prev');
    if (i) i.src = src; if (w) w.style.display = 'block';
  }
  function hidePreview() {
    const w = $('img-wrap'); if (w) w.style.display = 'none';
  }
  function updatePrev() {
    const el = $('color-prev'); if (!el) return;
    el.style.background = `linear-gradient(135deg,${$('f-color')?.value||'#C8A96E'}55,${$('f-color')?.value||'#C8A96E'}22)`;
    el.textContent = $('f-emoji')?.value || '🎨';
  }
  function setStatus(msg, type = '') {
    const el = $('form-status'); if (!el) return;
    el.textContent = msg; el.className = 'form-status ' + type;
  }
  function clearStatus() { setStatus(''); }

  /* ── TOAST ─────────────────────────────────────────────── */
  let toastT;
  function toast(msg) {
    const t = $('admin-toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ── UTILS ─────────────────────────────────────────────── */
  function bg(item) {
    return item.color
      ? `linear-gradient(135deg,${item.color}44,${item.color}22)`
      : '#EEEAE4';
  }
  function x(s) {
    return String(s || '').replace(/[&<>"']/g,
      c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  function setText(id, v) { const el = $(id); if (el) el.textContent = v; }
  function setVal(id, v)  { const el = $(id); if (el) el.value = v ?? ''; }
  function imgSize(b64) {
    const b = Math.round(b64.length * 3 / 4);
    return b > 1048576 ? (b / 1048576).toFixed(2) + ' MB' : Math.round(b / 1024) + ' KB';
  }
})();