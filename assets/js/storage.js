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
    description: 'Nusantara Heritage Co. adalah perusahaan yang mengkurasi dan pemasarkan kerajinan tangan autentik dari seluruh nusantara. Identitas baru mencerminkan kekayaan budaya Indonesia namun tetap relevan bagi konsumen modern.',
    result: 'Brand recognition meningkat 240% dalam 6 bulan. Kini terdistribusi di 8 negara Asia Tenggara.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80', color: '#C8A96E', emoji: '🌿',
    gallery: [
      { id: 'g1', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', size: 'large', position: 'left' },
      { id: 'g2', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80', size: 'small', position: 'center' },
      { id: 'g3', image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&q=80', size: 'small', position: 'right' },
      { id: 'g4', image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&q=80', size: 'medium', position: 'left' },
      { id: 'g5', image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80', size: 'medium', position: 'center' },
      { id: 'g6', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80', size: 'small', position: 'right' },
    ],
  },
  {
    id: 'default-2', order: 1, featured: true,
    title: 'FinWave Mobile App', client: 'PT FinWave Technology', year: '2024',
    category: 'digital', categoryLabel: 'UI/UX Design',
    tags: ['UI Design', 'UX Research', 'Prototyping', 'Design System'],
    description: 'Aplikasi fintech untuk segmen milenial Indonesia. Menyederhanakan kompleksitas keuangan menjadi pengalaman yang natural dan aman.',
    result: 'App store rating dari 3.2 ke 4.7 bintang. User retention naik 65%.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', color: '#1A1714', emoji: '◈',
    gallery: [
      { id: 'g7', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', size: 'medium', position: 'left' },
      { id: 'g8', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80', size: 'small', position: 'center' },
      { id: 'g9', image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&q=80', size: 'large', position: 'right' },
      { id: 'g10', image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&q=80', size: 'medium', position: 'left' },
    ],
  },
  {
    id: 'default-3', order: 2, featured: false,
    title: 'Kopi Rojo Packaging', client: 'Kopi Rojo', year: '2023',
    category: 'print', categoryLabel: 'Packaging & Print',
    tags: ['Packaging', 'Print Design', 'Illustration', 'Retail'],
    description: 'Brand kopi specialty asal Toraja. Kemasan bercerita tentang asal-usul dan kebanggaan lokal tanpa terkesan kuno.',
    result: 'Penjualan meningkat 3x lipat dalam 6 bulan. Terdistribusi di 200+ kafe specialty.',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80', color: '#6B3A1F', emoji: '☕',
    gallery: [
      { id: 'g11', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80', size: 'small', position: 'center' },
      { id: 'g12', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', size: 'large', position: 'left' },
      { id: 'g13', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80', size: 'medium', position: 'right' },
      { id: 'g14', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80', size: 'small', position: 'left' },
      { id: 'g15', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80', size: 'small', position: 'right' },
    ],
  },
  {
    id: 'default-4', order: 3, featured: false,
    title: 'EduPath Platform', client: 'PT EduPath Indonesia', year: '2023',
    category: 'digital', categoryLabel: 'UI/UX Design',
    tags: ['Web Design', 'UI/UX', 'Illustration'],
    description: 'Platform e-learning yang menghubungkan pelajar dengan mentor terbaik. Serius tapi tetap approachable.',
    result: 'Waktu di platform +42 menit per sesi. Conversion rate dari 3.1% ke 8.7%.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80', color: '#2D4A6E', emoji: '📚',
    gallery: [
      { id: 'g16', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80', size: 'large', position: 'center' },
      { id: 'g17', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80', size: 'small', position: 'left' },
      { id: 'g18', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80', size: 'medium', position: 'right' },
    ],
  },
  {
    id: 'default-5', order: 4, featured: false,
    title: 'Puri Alam Resort', client: 'Puri Alam Group', year: '2023',
    category: 'spatial', categoryLabel: 'Spatial Branding',
    tags: ['Spatial Design', 'Signage', 'Wayfinding'],
    description: 'Resort butik di Ubud, Bali. Seluruh elemen visual bernafaskan keseimbangan kemewahan dan ketenangan alam.',
    result: 'Rating 9.2/10 di Booking.com. Diliput Condé Nast Traveler & Tatler Asia.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', color: '#8B7355', emoji: '🏨',
    gallery: [
      { id: 'g19', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', size: 'large', position: 'left' },
      { id: 'g20', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', size: 'medium', position: 'center' },
      { id: 'g21', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80', size: 'small', position: 'right' },
      { id: 'g22', image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=80', size: 'small', position: 'left' },
      { id: 'g23', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80', size: 'medium', position: 'right' },
      { id: 'g24', image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=600&q=80', size: 'small', position: 'center' },
    ],
  },
  {
    id: 'default-6', order: 5, featured: false,
    title: 'Gala Nite 2024', client: 'Astra Motor Indonesia', year: '2024',
    category: 'motion', categoryLabel: 'Motion & Event',
    tags: ['Motion Graphics', 'Event Design', 'LED Content'],
    description: 'Gala dinner tahunan Astra Motor tema "Future Forward". Dihadiri 2.000+ tamu undangan.',
    result: '98% survei pasca-event menyatakan kepuasan tertinggi terhadap elemen visual.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', color: '#2D1B4E', emoji: '✦',
    gallery: [
      { id: 'g25', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', size: 'large', position: 'center' },
      { id: 'g26', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80', size: 'medium', position: 'left' },
      { id: 'g27', image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&q=80', size: 'medium', position: 'right' },
      { id: 'g28', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80', size: 'small', position: 'left' },
      { id: 'g29', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80', size: 'small', position: 'right' },
    ],
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
    content: '<p>Selama lebih dari satu dekade terakhir, saya mengamati tren yang mengkhawatirkan di industri desain Indonesia: brand-brand lokal berlomba-lomba meniru estetika Barat tanpa mempertanyakan apakah itu relevan dengan konteks lokal mereka.</p><p>Bukan berarti inspirasi dari luar itu buruk. Masalahnya muncul ketika kita menjadikan Barat sebagai satu-satunya patokan.</p><h3>Masalah dengan Pendekatan Copy-Paste</h3><p>Ketika sebuah brand lokal menggunakan minimalis ala Skandinavia tanpa konteks budaya yang kuat, hasilnya seringkali terasa hampa.</p>',
    image: null, color: '#C8A96E', emoji: '✦'
  },
  {
    id: 'blog-2', order: 1,
    title: '5 Kesalahan Desain UI yang Masih Sering Dilakukan Startup di Indonesia',
    category: 'digital', categoryLabel: 'UI/UX',
    date: '8 Januari 2025', readTime: '5 menit baca',
    excerpt: 'Setelah menangani puluhan proyek startup, saya melihat pola kesalahan yang terus berulang.',
    content: '<p>Sebagai desainer yang fokus pada UI/UX, saya sudah menangani lebih dari 30 proyek startup dalam 5 tahun terakhir. Ada pola kesalahan yang terus berulang.</p><h3>1. Mengabaikan Onboarding</h3><p>70% pengguna baru memutuskan dalam 3 menit pertama apakah mereka akan bertahan atau tidak.</p>',
    image: null, color: '#2D4A6E', emoji: '◈'
  },
  {
    id: 'blog-3', order: 2,
    title: 'Panduan Lengkap Memilih Font untuk Brand Indonesia yang Kuat',
    category: 'branding', categoryLabel: 'Typography',
    date: '2 Januari 2025', readTime: '6 menit baca',
    excerpt: 'Tipografi adalah tulang punggung identitas visual. Panduan ini membantu Anda memilih font yang tepat.',
    content: '<p>Tipografi seringkali menjadi elemen yang paling diremehkan dalam proses branding. Padahal, font yang tepat bisa menjadi perbedaan antara brand yang terasa premium dan brand yang terasa asal-asalan.</p>',
    image: null, color: '#6B3A1F', emoji: 'Aa'
  },
  {
    id: 'blog-4', order: 3,
    title: 'Bagaimana Desain Kemasan Bisa Menjadi Senjata Pemasaran Paling Ampuh',
    category: 'print', categoryLabel: 'Packaging',
    date: '26 Desember 2024', readTime: '7 menit baca',
    excerpt: 'Di rak yang penuh sesak, kemasan Anda punya waktu kurang dari 3 detik untuk menarik perhatian.',
    content: '<p>Dalam dunia retail, kemasan bukan sekadar pembungkus — ia adalah salesperson yang bekerja 24/7 tanpa gaji.</p>',
    image: null, color: '#8B5E3C', emoji: '📦'
  },
  {
    id: 'blog-5', order: 4,
    title: 'Minimalisme dalam Desain: Lebih Sedikit, Lebih Bermakna',
    category: 'branding', categoryLabel: 'Desain',
    date: '20 Desember 2024', readTime: '5 menit baca',
    excerpt: 'Filosofi "less is more" bukan sekadar tren estetika — ia adalah pernyataan tentang menghormati perhatian audiens.',
    content: '<p>Minimalisme sering disalahpahami sebagai "membuat sesuatu menjadi kosong". Padahal esensi minimalisme adalah menghilangkan segala sesuatu yang tidak esensial.</p>',
    image: null, color: '#2D4A6E', emoji: '🎨'
  },
  {
    id: 'blog-6', order: 5,
    title: 'Bagaimana AI Mengubah Industri Desain Grafis Indonesia',
    category: 'digital', categoryLabel: 'Industri',
    date: '15 Desember 2024', readTime: '6 menit baca',
    excerpt: 'Refleksi jujur seorang desainer tentang peluang dan ancaman yang dibawa oleh AI dalam dunia kreatif.',
    content: '<p>AI generatif sudah mengubah lanskap desain grafis secara fundamental. Sebagai seseorang yang sudah berkecimpung di industri ini selama 7+ tahun, saya melihat ini dari dua sisi.</p>',
    image: null, color: '#1A1714', emoji: '◈'
  },
  {
    id: 'blog-7', order: 6,
    title: 'Cara Menetapkan Harga Jasa Desain yang Adil dan Menguntungkan',
    category: 'other', categoryLabel: 'Bisnis Kreatif',
    date: '10 Desember 2024', readTime: '7 menit baca',
    excerpt: 'Panduan praktis untuk desainer freelance dan studio kecil yang ingin keluar dari jebakan undercharging.',
    content: '<p>Salah satu masalah terbesar dalam industri desain Indonesia adalah culture undercharging. Banyak desainer merasa bersalah memasang harga yang pantas.</p>',
    image: null, color: '#6B3A1F', emoji: '🌿'
  },
  {
    id: 'blog-1779172195237', order: 7,
    title: 'Mengapa "Bunga" Adalah Elemen Paling Sempurna dalam Dunia Desain',
    category: 'other', categoryLabel: 'Digital',
    date: '20 Maret 2025', readTime: '6 menit baca',
    excerpt: 'Dalam semesta visual, ada satu elemen yang tidak pernah gagal mencuri perhatian. Kehadirannya bukan sekadar pemanis, melainkan definisi dari harmoni, keanggunan, dan inspirasi yang tak lekang oleh waktu.',
    content: '<p>Dalam semesta visual, ada satu elemen yang tidak pernah gagal mencuri perhatian. Ia bukan sekadar pemanis atau dekorasi musiman. Kehadirannya adalah definisi dari harmoni itu sendiri.</p>',
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
  reorder(fromIdx, toIdx) {
    const items = this.getAll();
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    items.forEach((it, i) => { it.order = i; });
    this._save(items);
    return items;
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
  },
  importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          if (!Array.isArray(data)) throw new Error('Format tidak valid');
          this._save(data);
          resolve(data.length);
        } catch (err) { reject(err); }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsText(file);
    });
  },
  storageSize() {
    const raw = localStorage.getItem(KYD_BLOG_KEY) || '';
    const bytes = new Blob([raw]).size;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  },
  reset() {
    localStorage.removeItem(KYD_BLOG_KEY);
    localStorage.removeItem(KYD_BLOG_DRAFT);
    return this._seed();
  }
};

window.BlogStorage = BlogStorage;

window.PortfolioStorage = PortfolioStorage;