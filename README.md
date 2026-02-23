# 🌟 AksesorisKu - Toko Aksesoris Online

Website toko aksesoris online modern yang dibangun dengan Next.js, React, TypeScript, dan Tailwind CSS.

## ✨ Fitur Utama

### 🏠 Halaman Utama
- Hero section dengan desain menarik
- Kategori aksesoris (Kalung, Gelang, Cincin, Anting)
- Produk terbaru
- Footer informatif

### 🛍️ Halaman Produk
- Grid produk dengan card design
- Fitur pencarian produk
- Filter berdasarkan kategori
- Sorting harga (termurah-termahal)
- Responsive design

### 📱 Halaman Detail Produk
- Gambar produk besar
- Informasi lengkap produk
- Selector jumlah
- Tombol "Tambah ke Keranjang" dan "Beli Sekarang"
- Produk serupa

### 🛒 Keranjang Belanja
- Daftar produk yang ditambahkan
- Ubah jumlah produk
- Hapus produk
- Total harga otomatis
- Lanjut ke checkout

### 💳 Checkout
- Form informasi pembeli
- Pilihan metode pembayaran (COD/Transfer)
- Ringkasan pesanan
- Konfirmasi pesanan

### 🔐 Autentikasi
- Login pengguna
- Registrasi pengguna
- UI modern dan responsif

### 👨‍💼 Dashboard Admin
- Kelola produk (CRUD)
- Statistik produk
- Tabel produk dengan aksi
- Modal untuk tambah/edit produk

## 🚀 Teknologi yang Digunakan

- **Next.js 15** - React framework dengan App Router
- **React 18** - Library UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Context API** - State management untuk keranjang

## 📁 Struktur Project

```
src/
├── app/                    # App Router pages
│   ├── admin/             # Dashboard admin
│   ├── auth/              # Login & Register
│   ├── cart/              # Keranjang belanja
│   ├── checkout/          # Checkout
│   ├── product/[id]/      # Detail produk
│   ├── products/          # Daftar produk
│   ├── layout.tsx         # Layout utama
│   └── page.tsx           # Homepage
├── components/            # Komponen reusable
│   ├── Button.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   └── ProductCard.tsx
├── data/                  # Data dummy
│   └── products.ts
├── lib/                   # Utilities & Context
│   └── CartContext.tsx
└── types/                 # TypeScript types
    └── index.ts
```

## 🛠️ Instalasi & Setup

1. **Clone atau download project**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```

4. **Buka browser dan akses:**
   ```
   http://localhost:3000
   ```

## 📸 Gambar Produk

Untuk menampilkan gambar produk, Anda perlu menambahkan file gambar ke folder `public/images/` dengan nama sesuai yang ada di `src/data/products.ts`:

- kalung-mutiara.jpg
- gelang-rosegold.jpg
- cincin-berlian.jpg
- anting-kristal.jpg
- kalung-choker.jpg
- gelang-charm.jpg
- cincin-vintage.jpg
- anting-hoop.jpg
- kalung-heart.jpg
- gelang-tennis.jpg

Atau Anda bisa menggunakan placeholder images dari layanan seperti:
- https://picsum.photos/400/400
- https://via.placeholder.com/400x400

## 🎨 Kustomisasi

### Warna Tema
Tema utama menggunakan warna pink dan putih. Untuk mengubah warna, edit file `tailwind.config.js` atau ubah class CSS di komponen.

### Menambah Produk
Edit file `src/data/products.ts` untuk menambah atau mengubah data produk.

### Menambah Kategori
Edit file `src/data/products.ts` pada array `categories` dan update type `CategoryType` di `src/types/index.ts`.

## 📱 Responsive Design

Website ini fully responsive dan telah dioptimasi untuk:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🔧 Fitur yang Bisa Dikembangkan

- [ ] Integrasi dengan backend API
- [ ] Payment gateway integration
- [ ] User authentication dengan JWT
- [ ] Wishlist produk
- [ ] Review dan rating produk
- [ ] Notifikasi real-time
- [ ] Admin analytics dashboard
- [ ] Multi-language support
- [ ] PWA (Progressive Web App)

## 📄 License

Project ini dibuat untuk keperluan pembelajaran dan demo. Silakan gunakan dan modifikasi sesuai kebutuhan.

## 🤝 Kontribusi

Jika Anda ingin berkontribusi:
1. Fork repository
2. Buat branch fitur baru
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

---

**Dibuat dengan ❤️ untuk pecinta aksesoris**
