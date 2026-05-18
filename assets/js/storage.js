/* ============================================================
   storage.js — Portfolio Storage Engine
   Baca  : fetch /data/portfolio.json (file statis GitHub Pages)
   Tulis : localStorage (admin lokal)
   Deploy: Export JSON → commit ke repo → push → GitHub Pages update
   kitayangdesain.com
============================================================ */

const KYD_KEY   = 'kyd_portfolio_v2';   /* localStorage key  */
const KYD_DRAFT = 'kyd_draft_pending';  /* ada perubahan belum di-deploy? */

/* ============================================================
   DEFAULT DATA — ditampilkan sebelum admin isi sendiri
============================================================ */
const DEFAULT_ITEMS = [
  {
    id: 'default-1', order: 0, featured: true,
    title: 'Nusantara Heritage Co.', client: 'Nusantara Heritage Co.', year: '2024',
    category: 'branding', categoryLabel: 'Branding & Identity',
    tags: ['Logo Design', 'Brand System', 'Stationery', 'Brand Guidelines'],
    description: 'Nusantara Heritage Co. adalah perusahaan yang mengkurasi dan memasarkan kerajinan tangan autentik dari seluruh nusantara. Identitas baru mencerminkan kekayaan budaya Indonesia namun tetap relevan bagi konsumen modern.',
    result: 'Brand recognition meningkat 240% dalam 6 bulan. Kini terdistribusi di 8 negara Asia Tenggara.',
    image: null, color: '#C8A96E', emoji: '🌿',
  },
  {
    id: 'default-2', order: 1, featured: true,
    title: 'FinWave Mobile App', client: 'PT FinWave Technology', year: '2024',
    category: 'digital', categoryLabel: 'UI/UX Design',
    tags: ['UI Design', 'UX Research', 'Prototyping', 'Design System'],
    description: 'Aplikasi fintech untuk segmen milenial Indonesia. Menyederhanakan kompleksitas keuangan menjadi pengalaman yang natural dan aman.',
    result: 'App store rating dari 3.2 ke 4.7 bintang. User retention naik 65%.',
    image: null, color: '#1A1714', emoji: '◈',
  },
  {
    id: 'default-3', order: 2, featured: false,
    title: 'Kopi Rojo Packaging', client: 'Kopi Rojo', year: '2023',
    category: 'print', categoryLabel: 'Packaging & Print',
    tags: ['Packaging', 'Print Design', 'Illustration', 'Retail'],
    description: 'Brand kopi specialty asal Toraja. Kemasan bercerita tentang asal-usul dan kebanggaan lokal tanpa terkesan kuno.',
    result: 'Penjualan meningkat 3x lipat dalam 6 bulan. Terdistribusi di 200+ kafe specialty.',
    image: null, color: '#6B3A1F', emoji: '☕',
  },
  {
    id: 'default-4', order: 3, featured: false,
    title: 'EduPath Platform', client: 'PT EduPath Indonesia', year: '2023',
    category: 'digital', categoryLabel: 'UI/UX Design',
    tags: ['Web Design', 'UI/UX', 'Illustration'],
    description: 'Platform e-learning yang menghubungkan pelajar dengan mentor terbaik. Serius tapi tetap approachable.',
    result: 'Waktu di platform +42 menit per sesi. Conversion rate dari 3.1% ke 8.7%.',
    image: null, color: '#2D4A6E', emoji: '📚',
  },
  {
    id: 'default-5', order: 4, featured: false,
    title: 'Puri Alam Resort', client: 'Puri Alam Group', year: '2023',
    category: 'spatial', categoryLabel: 'Spatial Branding',
    tags: ['Spatial Design', 'Signage', 'Wayfinding'],
    description: 'Resort butik di Ubud, Bali. Seluruh elemen visual bernafaskan keseimbangan kemewahan dan ketenangan alam.',
    result: 'Rating 9.2/10 di Booking.com. Diliput Condé Nast Traveler & Tatler Asia.',
    image: null, color: '#8B7355', emoji: '🏨',
  },
  {
    id: 'default-6', order: 5, featured: false,
    title: 'Gala Nite 2024', client: 'Astra Motor Indonesia', year: '2024',
    category: 'motion', categoryLabel: 'Motion & Event',
    tags: ['Motion Graphics', 'Event Design', 'LED Content'],
    description: 'Gala dinner tahunan Astra Motor tema "Future Forward". Dihadiri 2.000+ tamu undangan.',
    result: '98% survei pasca-event menyatakan kepuasan tertinggi terhadap elemen visual.',
    image: null, color: '#2D1B4E', emoji: '✦',
  }
];

/* ============================================================
   PORTFOLIO STORAGE
============================================================ */
const PortfolioStorage = {

  /* ── Baca: coba dari localStorage dulu, fallback ke JSON ──
     Halaman publik (portfolio.html) fetch langsung dari JSON.
     Admin panel pakai localStorage (data lokal browser).
  ────────────────────────────────────────────────────────── */
  async fetchPublic() {
    try {
      const res = await fetch('/data/portfolio.json?_=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return Array.isArray(data)
        ? data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [];
    } catch (e) {
      console.warn('[KYD] Gagal fetch portfolio.json, pakai default:', e.message);
      return [...DEFAULT_ITEMS];
    }
  },

  /* Baca dari localStorage (untuk admin panel) */
  getAll() {
    try {
      const raw = localStorage.getItem(KYD_KEY);
      if (!raw) return this._seed();
      const data = JSON.parse(raw);
      return data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch {
      return this._seed();
    }
  },

  _seed() {
    const items = DEFAULT_ITEMS.map(i => ({ ...i }));
    this._save(items);
    return items;
  },

  _save(items) {
    try {
      localStorage.setItem(KYD_KEY, JSON.stringify(items));
      localStorage.setItem(KYD_DRAFT, '1'); /* tandai ada perubahan */
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('⚠️ Penyimpanan penuh!\nHapus beberapa item atau gunakan gambar lebih kecil.');
      }
      return false;
    }
  },

  hasDraft()    { return !!localStorage.getItem(KYD_DRAFT); },
  clearDraft()  { localStorage.removeItem(KYD_DRAFT); },

  /* ── CRUD ───────────────────────────────────────────────── */
  add(data) {
    const items  = this.getAll();
    const newItem = {
      ...data,
      id       : 'kyd-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      order    : items.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    this._save(items);
    return newItem;
  },

  update(id, fields) {
    const items = this.getAll();
    const idx   = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...fields, updatedAt: new Date().toISOString() };
    this._save(items);
    return items[idx];
  },

  remove(id) {
    const items = this.getAll().filter(i => i.id !== id);
    items.forEach((it, i) => { it.order = i; });
    this._save(items);
    return true;
  },

  reorder(fromIdx, toIdx) {
    const items = this.getAll();
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    items.forEach((it, i) => { it.order = i; });
    this._save(items);
    return items;
  },

  toggleFeatured(id) {
    const item = this.getAll().find(i => i.id === id);
    if (!item) return null;
    return this.update(id, { featured: !item.featured });
  },

  /* ── EXPORT: download portfolio.json ─────────────────────
     Setelah download, user tinggal commit file ini ke repo.
  ────────────────────────────────────────────────────────── */
  exportJSON() {
    const items = this.getAll();
    /* Bersihkan field internal yang tidak perlu */
    const clean = items.map(({ createdAt, updatedAt, ...rest }) => rest);
    const blob  = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href     = url;
    a.download = 'portfolio.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.clearDraft(); /* tandai sudah di-export */
  },

  /* ── IMPORT: load portfolio.json dari file ──────────────── */
  importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          if (!Array.isArray(data)) throw new Error('Format tidak valid');
          this._save(data);
          resolve(data.length);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsText(file);
    });
  },

  /* ── KOMPRES GAMBAR sebelum disimpan ────────────────────── */
  compressImage(file, maxPx = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file?.type.startsWith('image/')) {
        reject(new Error('File bukan gambar.')); return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxPx || height > maxPx) {
            if (width >= height) { height = Math.round(height * maxPx / width); width = maxPx; }
            else { width = Math.round(width * maxPx / height); height = maxPx; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.readAsDataURL(file);
    });
  },

  storageSize() {
    const raw   = localStorage.getItem(KYD_KEY) || '';
    const bytes = new Blob([raw]).size;
    if (bytes < 1024)        return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  },

  reset() {
    localStorage.removeItem(KYD_KEY);
    localStorage.removeItem(KYD_DRAFT);
    return this._seed();
  }
};

/* ============================================================
   KODE TAMBAHAN: BLOG STORAGE ENGINE
============================================================ */
const KYD_BLOG_KEY   = 'kyd_blog_v1';
const KYD_BLOG_DRAFT = 'kyd_blog_draft_pending';

const DEFAULT_BLOGS = [
  {
    id: 'blog-1', order: 0,
    title: 'Mengapa Brand Lokal Indonesia Perlu Berhenti Meniru Barat dan Mulai Menciptakan Identitas Sendiri',
    category: 'branding', categoryLabel: 'Brand Strategy',
    date: '15 Januari 2025', readTime: '8 menit baca',
    excerpt: 'Selama bertahun-tahun, brand-brand Indonesia tumbuh dengan mengikuti tren desain Barat. Saatnya kita keluar dari siklus ini.',
    content: `<p>Ini adalah isi konten lengkap dari blog pertama Anda. Anda bisa menulis menggunakan tag HTML biasa seperti &lt;p&gt;, &lt;h3&gt;, atau &lt;strong&gt; untuk mengatur layout artikel agar terlihat profesional.</p>
              <h3>Filosofi Desain Lokal</h3>
              <p>Desain yang baik adalah desain yang jujur pada audiensnya sendiri...</p>`,
    image: null, color: '#C8A96E', emoji: '✦'
  }
];

const BlogStorage = {
  async fetchPublic() {
    try {
      const res = await fetch('/data/blog.json?_=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      console.warn('[KYD] Gagal fetch blog.json, pakai default:', e.message);
      return [...DEFAULT_BLOGS];
    }
  },
  getAll() {
    try {
      const raw = localStorage.getItem(KYD_BLOG_KEY);
      if (!raw) return this._seed();
      return JSON.parse(raw).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch { return this._seed(); }
  },
  _seed() {
    const items = DEFAULT_BLOGS.map(i => ({ ...i }));
    this._save(items); return items;
  },
  _save(items) {
    try {
      localStorage.setItem(KYD_BLOG_KEY, JSON.stringify(items));
      localStorage.setItem(KYD_BLOG_DRAFT, '1');
      return true;
    } catch (e) { return false; }
  },
  hasDraft() { return !!localStorage.getItem(KYD_BLOG_DRAFT); },
  clearDraft() { localStorage.removeItem(KYD_BLOG_DRAFT); },
  add(data) {
    const items = this.getAll();
    const newItem = { ...data, id: 'blog-' + Date.now(), order: items.length };
    items.push(newItem); this._save(items); return newItem;
  },
  update(id, fields) {
    const items = this.getAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...fields };
    this._save(items); return items[idx];
  },
  remove(id) {
    const items = this.getAll().filter(i => i.id !== id);
    items.forEach((it, i) => { it.order = i; });
    this._save(items); return true;
  },
  exportJSON() {
    const items = this.getAll();
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'blog.json';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    this.clearDraft();
  }
};

window.BlogStorage = BlogStorage;

window.PortfolioStorage = PortfolioStorage;