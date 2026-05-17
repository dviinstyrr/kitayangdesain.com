# Kita Yang Desain — Portfolio Website

Website portofolio minimalis untuk [kitayangdesain.com](https://kitayangdesain.com)

## 🚀 Deploy ke GitHub Pages

### Cara 1 — GitHub Web (Termudah)
1. Buat repository baru di GitHub: `kitayangdesain`
2. Upload file `index.html` dan `404.html` ke repository
3. Buka **Settings → Pages**
4. Source: pilih `main` branch, folder `/ (root)`
5. Klik **Save** — website live dalam 1-2 menit di `https://username.github.io/kitayangdesain`

### Cara 2 — Git CLI
```bash
git init
git add .
git commit -m "Initial portfolio"
git remote add origin https://github.com/USERNAME/kitayangdesain.git
git push -u origin main
```
Aktifkan GitHub Pages di Settings → Pages.

### Custom Domain (kitayangdesain.com)
1. Buat file `CNAME` berisi: `kitayangdesain.com`
2. Di dashboard domain Anda, tambahkan DNS records:
   - `A` → `185.199.108.153`
   - `A` → `185.199.109.153`
   - `A` → `185.199.110.153`
   - `A` → `185.199.111.153`
   - `CNAME` `www` → `USERNAME.github.io`
3. Di GitHub Pages Settings, masukkan custom domain: `kitayangdesain.com`
4. Centang **Enforce HTTPS**

## 📁 Struktur File
```
/
├── index.html       ← Website utama (single file, semua halaman)
├── 404.html         ← Halaman error custom
├── CNAME            ← Custom domain (buat manual)
└── README.md        ← Panduan ini
```

## ✏️ Kustomisasi Konten

Semua konten ada dalam `index.html`. Cari teks berikut untuk menggantinya:

| Cari | Ganti dengan |
|------|-------------|
| `Andi Wirawan` | Nama Anda |
| `hello@kitayangdesain.com` | Email Anda |
| `+62 812 3456 7890` | No. HP Anda |
| `Jl. Kemang Raya No. 88` | Alamat Anda |
| `@kitayangdesain` | Username sosmed Anda |

## 🎨 Ganti Warna
Di bagian `:root` CSS (baris pertama `<style>`):
```css
--accent: #C8A96E;    /* Warna utama/emas */
--fg: #1A1714;        /* Warna teks gelap */
--bg: #F7F5F2;        /* Background utama */
```

## ⚡ Performa
- File tunggal ~70KB (tanpa gambar)
- Hanya 2 external request: Google Fonts
- Tidak ada JavaScript library
- Lighthouse score: ~95+

## 📞 Support
Questions? Email: hello@kitayangdesain.com
