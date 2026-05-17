/* ============================================================
   DATA
============================================================ */
const portfolioData = {
  nusantara: {
    title: 'Nusantara Heritage Co.',
    cat: 'Branding & Identity',
    year: '2024',
    client: 'Nusantara Heritage Co.',
    tags: ['Logo Design', 'Brand System', 'Stationery', 'Packaging', 'Brand Guidelines'],
    emoji: '🌿',
    bg: 'linear-gradient(135deg,#E8DFD5 0%,#C8A96E22 100%)',
    desc: 'Nusantara Heritage Co. adalah perusahaan yang mengkurasi dan memasarkan kerajinan tangan autentik dari seluruh penjuru nusantara. Mereka membutuhkan identitas yang mencerminkan kekayaan budaya Indonesia namun tetap relevan bagi konsumen modern di pasar global.',
    result: 'Identitas baru berhasil meningkatkan brand recognition sebesar 240% dalam 6 bulan pertama. Produk kini terdistribusi di 8 negara Asia Tenggara dengan persepsi premium yang jauh lebih kuat.'
  },
  fintech: {
    title: 'FinWave Mobile App',
    cat: 'UI/UX Design',
    year: '2024',
    client: 'PT FinWave Technology',
    tags: ['UI Design', 'UX Research', 'Prototyping', 'Design System', 'Mobile App'],
    emoji: '◈',
    bg: 'linear-gradient(135deg,#1A1714,#3D2B1F)',
    desc: 'FinWave adalah startup fintech yang menyasar segmen milenial dan Gen-Z Indonesia. Mereka membutuhkan desain aplikasi yang tidak hanya cantik, tapi mampu menyederhanakan kompleksitas keuangan menjadi pengalaman yang terasa natural dan aman.',
    result: 'App store rating meningkat dari 3.2 ke 4.7 bintang setelah redesign. User retention rate naik 65% dan waktu onboarding turun 40%.'
  },
  kopi: {
    title: 'Kopi Rojo Packaging',
    cat: 'Packaging Design',
    year: '2023',
    client: 'Kopi Rojo',
    tags: ['Packaging', 'Print Design', 'Branding', 'Illustration', 'Retail'],
    emoji: '☕',
    bg: 'linear-gradient(135deg,#6B3A1F,#C8874A)',
    desc: 'Kopi Rojo adalah brand kopi specialty asal Toraja yang ingin bersaing di pasar premium nasional dan internasional. Tantangannya: menciptakan kemasan yang bercerita tentang asal-usul dan kebanggaan lokal tanpa terkesan kuno.',
    result: 'Penjualan meningkat 3x lipat dalam 6 bulan setelah relaunch. Kini terdistribusi di 200+ kafe specialty dan department store premium.'
  },
  edtech: {
    title: 'EduPath Platform',
    cat: 'Web Design',
    year: '2023',
    client: 'PT EduPath Indonesia',
    tags: ['Web Design', 'UI/UX', 'Illustration', 'Motion', 'Design System'],
    emoji: '📚',
    bg: 'linear-gradient(135deg,#2D4A6E,#4A90D9)',
    desc: 'EduPath adalah platform e-learning yang menghubungkan pelajar dengan mentor terbaik di Indonesia. Mereka ingin tampil serius tapi tetap approachable — platform yang membuat belajar terasa menyenangkan dan tidak menakutkan.',
    result: 'Waktu di platform meningkat rata-rata 42 menit per sesi. Conversion rate dari pengunjung ke pelajar berbayar naik dari 3.1% ke 8.7%.'
  },
  hotel: {
    title: 'Puri Alam Resort',
    cat: 'Spatial Branding',
    year: '2023',
    client: 'Puri Alam Group',
    tags: ['Spatial Design', 'Signage', 'Brand Identity', 'Environmental Graphics', 'Wayfinding'],
    emoji: '🏨',
    bg: 'linear-gradient(135deg,#C8B89A,#8B7355)',
    desc: 'Puri Alam adalah resort butik baru di Ubud, Bali yang memposisikan diri sebagai "luxury nature retreat". Seluruh elemen visual — dari signage hingga menu restoran — harus bernafaskan keseimbangan antara kemewahan dan ketenangan alam.',
    result: 'Resort mendapatkan rating 9.2/10 di Booking.com sejak pembukaan. Diliput oleh Condé Nast Traveler dan Tatler Asia dalam 3 bulan pertama.'
  },
  event: {
    title: 'Gala Nite 2024',
    cat: 'Motion & Event Design',
    year: '2024',
    client: 'Astra Motor Indonesia',
    tags: ['Motion Graphics', 'Event Design', 'Visual Identity', 'LED Content', 'Print'],
    emoji: '✦',
    bg: 'linear-gradient(135deg,#2D1B4E,#7B4FA6)',
    desc: 'Gala Nite adalah gala dinner tahunan Astra Motor Indonesia yang dihadiri 2.000+ tamu undangan. Tema 2024 adalah "Future Forward" — sebuah perayaan pencapaian sambil menatap masa depan industri otomotif yang elektrifikasi.',
    result: 'Event mendapat respons standing ovation. 98% survei pasca-event menyatakan kepuasan tertinggi terhadap elemen visual dan desain panggung.'
  }
};

/* ============================================================
   LOADER
============================================================ */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hide');
    animateSkillBars();
  }, 900);
});

/* ============================================================
   CURSOR
============================================================ */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.left = mx+'px'; cursor.style.top = my+'px'; });
function animRing() { rx += (mx-rx)*0.12; ry += (my-ry)*0.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(animRing); }
animRing();
document.querySelectorAll('a,button,.pf-card,.blog-card,.collab-card,.venture-item,[data-hover]').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ============================================================
   NAV SCROLL
============================================================ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
  document.getElementById('back-top').classList.toggle('show', window.scrollY > 500);
});

/* ============================================================
   HAMBURGER
============================================================ */
function toggleMenu() {
  document.getElementById('hamburger').classList.toggle('open');
  document.getElementById('nav-drawer').classList.toggle('open');
  document.body.style.overflow = document.getElementById('nav-drawer').classList.contains('open') ? 'hidden' : '';
}

/* ============================================================
   PAGE NAVIGATION
============================================================ */
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-'+page);
  if (target) {
    target.classList.add('active');
    target.querySelectorAll('.fade-in,.stagger').forEach(el => {
      el.style.animation = 'none';
      requestAnimationFrame(() => { el.style.animation = ''; });
    });
  }
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    a.classList.toggle('active', a.getAttribute('data-page') === page);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (page === 'profile') setTimeout(animateSkillBars, 400);
  return false;
}

/* ============================================================
   SKILL BARS
============================================================ */
function animateSkillBars() {
  document.querySelectorAll('.skill-fill').forEach(bar => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) { bar.classList.add('animate'); obs.unobserve(bar); } });
    }, { threshold: 0.3 });
    obs.observe(bar);
  });
}

/* ============================================================
   PORTFOLIO FILTER
============================================================ */
function filterPortfolio(cat, btn) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.pf-card').forEach(card => {
    const show = cat === 'all' || card.getAttribute('data-cat') === cat;
    card.style.transition = 'opacity 0.3s, transform 0.3s';
    if (show) { card.style.opacity = '1'; card.style.transform = 'scale(1)'; card.style.pointerEvents = ''; }
    else { card.style.opacity = '0.2'; card.style.transform = 'scale(0.97)'; card.style.pointerEvents = 'none'; }
  });
}

function showMorePortfolio() {
  showToast('Menampilkan semua 120+ karya...');
}

/* ============================================================
   PORTFOLIO MODAL
============================================================ */
function openModal(id) {
  const d = portfolioData[id];
  if (!d) return;
  document.getElementById('modal-inner').innerHTML = `
    <div class="modal-img" style="background:${d.bg}">
      <span style="font-size:4rem">${d.emoji}</span>
    </div>
    <div class="modal-tags">
      ${d.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
    </div>
    <span class="label">${d.cat} · ${d.year}</span>
    <h2 class="title-md" style="margin-bottom:0.5rem">${d.title}</h2>
    <p style="font-size:0.82rem;color:var(--fg3);margin-bottom:2rem">Klien: ${d.client}</p>
    <div class="divider"></div>
    <h4 style="font-weight:600;margin-bottom:0.75rem;font-size:0.9rem">Tentang Proyek</h4>
    <p style="font-size:0.92rem;color:var(--fg2);line-height:1.8;margin-bottom:2rem">${d.desc}</p>
    <h4 style="font-weight:600;margin-bottom:0.75rem;font-size:0.9rem">Hasil</h4>
    <p style="font-size:0.92rem;color:var(--fg2);line-height:1.8;margin-bottom:2.5rem">${d.result}</p>
    <a href="#" class="btn btn-primary" onclick="closeModalDirect();navigate('collab')">Proyek Serupa? Hubungi Kami →</a>
  `;
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('modal')) closeModalDirect();
}

function closeModalDirect() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModalDirect(); });

/* ============================================================
   BLOG POST OPEN
============================================================ */
function openBlogPost(id) {
  showToast('Membuka artikel...');
}

/* ============================================================
   FORM SUBMIT
============================================================ */
function submitForm() {
  showToast('✓ Pesan terkirim! Kami akan segera menghubungi Anda.');
}

/* ============================================================
   TOAST
============================================================ */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ============================================================
   INTERSECTION OBSERVER — general reveal
============================================================ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('fade-in'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.service-item,.process-step,.testimonial-card,.blog-card,.collab-card').forEach(el => revealObs.observe(el));

/* ============================================================
   COUNTER ANIMATION
============================================================ */
function animateCounter(el) {
  const target = parseFloat(el.textContent);
  const suffix = el.textContent.replace(/[\d.]/g, '');
  let current = 0;
  const inc = target / 40;
  const timer = setInterval(() => {
    current = Math.min(current + inc, target);
    el.textContent = (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;
    if (current >= target) clearInterval(timer);
  }, 30);
}
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-num').forEach(animateCounter);
      statObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
const statsBar = document.querySelector('.stats-bar');
if (statsBar) statObs.observe(statsBar);