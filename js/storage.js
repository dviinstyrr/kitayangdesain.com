/* ============================================================
   storage.js — Portfolio Storage Engine
   Mengelola semua data portofolio via localStorage
   kitayangdesain.com
============================================================ */

const KYD_STORAGE_KEY = 'kyd_portfolio_v1';

/* Default items yang muncul sebelum admin mengisi sendiri */
const DEFAULT_PORTFOLIO = [
  {
    id: 'default-1',
    title: 'Nusantara Heritage Co.',
    category: 'branding',
    categoryLabel: 'Branding & Identity',
    client: 'Nusantara Heritage Co.',
    year: '2024',
    tags: ['Logo Design', 'Brand System', 'Stationery', 'Brand Guidelines'],
    description: 'Nusantara Heritage Co. adalah perusahaan yang mengkurasi kerajinan tangan autentik dari seluruh nusantara. Identitas baru mencerminkan kekayaan budaya Indonesia namun tetap relevan bagi konsumen modern.',
    result: 'Brand recognition meningkat 240% dalam 6 bulan. Kini terdistribusi di 8 negara Asia Tenggara.',
    image: null,        /* base64 string atau null */
    color: '#C8A96E',   /* fallback warna jika belum ada gambar */
    emoji: '🌿',
    featured: true,
    order: 0,
    createdAt: Date.now()
  },
  {
    id: 'default-2',
    title: 'FinWave Mobile App',
    category: 'digital',
    categoryLabel: 'UI/UX Design',
    client: 'PT FinWave Technology',
    year: '2024',
    tags: ['UI Design', 'UX Research', 'Prototyping', 'Design System'],
    description: 'Aplikasi fintech untuk segmen milenial Indonesia. Menyederhanakan kompleksitas keuangan menjadi pengalaman yang terasa natural dan aman.',
    result: 'App store rating dari 3.2 ke 4.7 bintang. User retention naik 65%.',
    image: null,
    color: '#1A1714',
    emoji: '◈',
    featured: true,
    order: 1,
    createdAt: Date.now()
  },
  {
    id: 'default-3',
    title: 'Kopi Rojo Packaging',
    category: 'print',
    categoryLabel: 'Packaging Design',
    client: 'Kopi Rojo',
    year: '2023',
    tags: ['Packaging', 'Print Design', 'Illustration', 'Retail'],
    description: 'Brand kopi specialty asal Toraja yang ingin bersaing di pasar premium. Kemasan bercerita tentang asal-usul dan kebanggaan lokal.',
    result: 'Penjualan meningkat 3x lipat dalam 6 bulan. Terdistribusi di 200+ kafe specialty.',
    image: null,
    color: '#6B3A1F',
    emoji: '☕',
    featured: false,
    order: 2,
    createdAt: Date.now()
  },
  {
    id: 'default-4',
    title: 'EduPath Platform',
    category: 'digital',
    categoryLabel: 'Web Design',
    client: 'PT EduPath Indonesia',
    year: '2023',
    tags: ['Web Design', 'UI/UX', 'Illustration', 'Design System'],
    description: 'Platform e-learning yang menghubungkan pelajar dengan mentor terbaik. Tampil serius tapi tetap approachable.',
    result: 'Waktu di platform +42 menit/sesi. Conversion rate dari 3.1% ke 8.7%.',
    image: null,
    color: '#2D4A6E',
    emoji: '📚',
    featured: false,
    order: 3,
    createdAt: Date.now()
  },
  {
    id: 'default-5',
    title: 'Puri Alam Resort',
    category: 'spatial',
    categoryLabel: 'Spatial Branding',
    client: 'Puri Alam Group',
    year: '2023',
    tags: ['Spatial Design', 'Signage', 'Environmental Graphics', 'Wayfinding'],
    description: 'Resort butik di Ubud, Bali. Seluruh elemen visual bernafaskan keseimbangan kemewahan dan ketenangan alam.',
    result: 'Rating 9.2/10 di Booking.com. Diliput Condé Nast Traveler & Tatler Asia.',
    image: null,
    color: '#8B7355',
    emoji: '🏨',
    featured: false,
    order: 4,
    createdAt: Date.now()
  },
  {
    id: 'default-6',
    title: 'Gala Nite 2024',
    category: 'motion',
    categoryLabel: 'Motion & Event',
    client: 'Astra Motor Indonesia',
    year: '2024',
    tags: ['Motion Graphics', 'Event Design', 'Visual Identity', 'LED Content'],
    description: 'Gala dinner tahunan Astra Motor dengan tema "Future Forward". Dihadiri 2.000+ tamu undangan.',
    result: '98% survei pasca-event menyatakan kepuasan tertinggi terhadap elemen visual.',
    image: null,
    color: '#2D1B4E',
    emoji: '✦',
    featured: false,
    order: 5,
    createdAt: Date.now()
  }
];

/* ============================================================
   STORAGE API
============================================================ */
const PortfolioStorage = {

  /** Ambil semua item, diurutkan by order */
  getAll() {
    try {
      const raw = localStorage.getItem(KYD_STORAGE_KEY);
      if (!raw) return this._seed();
      const items = JSON.parse(raw);
      return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch (e) {
      console.error('[KYD Storage] Gagal membaca data:', e);
      return this._seed();
    }
  },

  /** Seed dengan default jika storage kosong */
  _seed() {
    this._save(DEFAULT_PORTFOLIO);
    return [...DEFAULT_PORTFOLIO];
  },

  /** Simpan array ke localStorage */
  _save(items) {
    try {
      localStorage.setItem(KYD_STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('⚠️ Penyimpanan penuh! Hapus beberapa item atau gunakan gambar yang lebih kecil (max ~400KB per gambar).');
      }
      return false;
    }
  },

  /** Ambil satu item by id */
  getById(id) {
    return this.getAll().find(item => item.id === id) || null;
  },

  /** Tambah item baru */
  add(itemData) {
    const items = this.getAll();
    const newItem = {
      ...itemData,
      id: 'kyd-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      order: items.length,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    items.push(newItem);
    return this._save(items) ? newItem : null;
  },

  /** Update item by id */
  update(id, updatedFields) {
    const items = this.getAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updatedFields, updatedAt: Date.now() };
    return this._save(items) ? items[idx] : null;
  },

  /** Hapus item by id */
  remove(id) {
    const items = this.getAll().filter(i => i.id !== id);
    /* re-assign order setelah hapus */
    items.forEach((item, i) => { item.order = i; });
    return this._save(items);
  },

  /** Pindah urutan item (drag/reorder) */
  reorder(fromIdx, toIdx) {
    const items = this.getAll();
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    items.forEach((item, i) => { item.order = i; });
    return this._save(items);
  },

  /** Toggle featured */
  toggleFeatured(id) {
    const item = this.getById(id);
    if (!item) return null;
    return this.update(id, { featured: !item.featured });
  },

  /** Kompres gambar sebelum disimpan (maks 800px, quality 0.75) */
  compressImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('File bukan gambar'));
        return;
      }
      const MAX_SIZE = 800;
      const QUALITY  = 0.75;
      const reader   = new FileReader();
      reader.onload  = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) { height = Math.round((height * MAX_SIZE) / width); width = MAX_SIZE; }
            else { width = Math.round((width * MAX_SIZE) / height); height = MAX_SIZE; }
          }
          canvas.width  = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', QUALITY));
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar'));
        img.src     = e.target.result;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });
  },

  /** Hitung estimasi ukuran data */
  getStorageSize() {
    const raw = localStorage.getItem(KYD_STORAGE_KEY) || '';
    const bytes = new Blob([raw]).size;
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  },

  /** Reset ke default */
  reset() {
    localStorage.removeItem(KYD_STORAGE_KEY);
    return this._seed();
  }
};

/* Export global */
window.PortfolioStorage = PortfolioStorage;
