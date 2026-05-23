# 💰 Expense Tracker

Aplikasi pencatat pengeluaran modern berbahasa Indonesia, dibangun dengan **Nuxt 3**, **Supabase** (Auth + Realtime), **Prisma**, dan **PostgreSQL**.

> **Status pengembangan: SEMUA fase (1–5) selesai** ✅
> Core · Charts & Analytics · Anggaran & Target · Recurring & Realtime · Polish (unit test + aksesibilitas).

---

## ✨ Fitur (Fase 1 — sudah ada)

- 🔐 **Autentikasi** via Supabase (daftar / masuk / keluar) + proteksi route otomatis
- ⏱️ **Auto-logout** setelah 1 jam tidak aktif
- 💸 **Manajemen Pengeluaran**
  - Tambah / edit / hapus / duplikat
  - Form dengan validasi (Zod), penghitung karakter, dan **auto-save draf** (localStorage)
  - Tabel dengan **sortir**, **filter** (kategori, metode bayar, rentang tanggal, pencarian), **pagination** (10/25/50)
  - **Aksi massal** (hapus banyak sekaligus)
  - **Export CSV**
- 📊 **Dashboard**: kartu ringkasan (bulan ini, tahun ini, rata-rata harian, kategori terbesar), transaksi terbaru
- 📈 **Charts & Analitik** (Chart.js):
  - **Pie** — pengeluaran per kategori (mengikuti periode terpilih)
  - **Bar** — tren harian 30 hari terakhir
  - **Line** — tren bulanan 12 bulan terakhir
  - **Selektor periode**: Bulan Ini / Tahun Ini / Semua / Kustom
  - Charts di-*lazy load* & hanya render di client
- 🎯 **Anggaran** (Budget): batas per kategori per bulan, progress bar (hijau/kuning/merah), **alert saat lewat batas**, selektor bulan, edit/hapus
- 🏁 **Target Keuangan** (Goals): target tabungan + tenggat, progress, tambah tabungan, **auto-selesai** saat tercapai, indikator tenggat
- 🔁 **Pengeluaran Berulang**: jadwal mingguan/bulanan/tahunan, **auto-generate** saat jatuh tempo, lewati/jeda/hapus, indikator 🔁 di tabel
- ⚡ **Realtime**: tabel pengeluaran sinkron otomatis lintas perangkat/tab (Supabase Realtime)
- 👤 **Profil**: ubah nama, email, kata sandi
- 🌙 **Mode gelap** (tersimpan di localStorage)
- 📱 **Responsif penuh** (mobile-first) dengan toast notifikasi
- ♿ **Aksesibilitas**: modal bisa ditutup dengan **Esc**, *focus* otomatis, **scroll-lock** body saat modal terbuka
- 🧪 **Unit test** (Vitest): 33 test untuk formatters, validators, constants, period & toast

## 🧪 Testing

```bash
npm test          # jalankan semua unit test sekali
npm run test:watch  # mode watch
```
Test berada di folder `tests/` dan mencakup util & composable murni (tanpa perlu DB/jaringan).

---

## 🚀 Cara Menjalankan

### 1. Prasyarat
- Node.js 18+ (terdeteksi: v24)
- Akun & project [Supabase](https://supabase.com)

### 2. Isi kredensial
Salin nilai dari **Supabase Dashboard** ke file `.env` (sudah dibuat; lihat `.env.example` untuk panduan):

```env
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOi..."
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"   # pooler, untuk runtime
DIRECT_URL="postgresql://...:5432/postgres"                    # direct, untuk migrate
```

> 📍 **Di mana mencarinya?**
> - `SUPABASE_URL` & `SUPABASE_ANON_KEY` → Project Settings → **API**
> - `DATABASE_URL` / `DIRECT_URL` → Project Settings → **Database → Connection string**

### 3. Install & siapkan database
```bash
npm install                 # sudah dijalankan saat scaffold
npm run db:migrate          # buat tabel di PostgreSQL (butuh DIRECT_URL valid)
# atau, tanpa membuat file migrasi:
# npm run db:push
```

### 4. Aktifkan Realtime + RLS (opsional, untuk sinkron otomatis)
Buka **Supabase Dashboard → SQL Editor**, lalu jalankan isi file
[`supabase/realtime-setup.sql`](supabase/realtime-setup.sql). Ini mengaktifkan
Row Level Security (isolasi data) dan Realtime untuk tabel `expenses`.

> Tanpa langkah ini, aplikasi tetap berfungsi penuh — hanya fitur sinkron
> realtime lintas perangkat yang tidak aktif.

### 5. Jalankan
```bash
npm run dev
```
Buka http://localhost:3000

> 💡 **Tips Supabase:** untuk testing cepat, matikan *Confirm email* di
> **Authentication → Providers → Email** agar bisa langsung login setelah daftar.

---

## 📜 Skrip yang tersedia

| Perintah            | Fungsi                                         |
|---------------------|------------------------------------------------|
| `npm run dev`       | Jalankan server pengembangan                   |
| `npm run build`     | Build untuk produksi                           |
| `npm run preview`   | Pratinjau hasil build                          |
| `npm run typecheck` | Pemeriksaan tipe TypeScript                    |
| `npm test`          | Jalankan unit test (Vitest)                    |
| `npm run db:migrate`| Migrasi database (Prisma)                      |
| `npm run db:push`   | Sinkron skema ke DB tanpa file migrasi         |
| `npm run db:studio` | Buka Prisma Studio (GUI database)              |

---

## 🏗️ Arsitektur singkat

```
.
├── pages/            # Halaman (dashboard, login, expenses, profile, dll)
├── components/       # Komponen UI (ExpenseForm, ExpenseTable, Navbar, dll)
├── composables/      # useAuth, useExpenses, useToast, useDarkMode
├── layouts/          # default (app shell) & auth
├── plugins/          # idle-logout (auto logout 1 jam)
├── middleware/       # (proteksi route ditangani modul @nuxtjs/supabase)
├── utils/            # constants, formatters, validators
├── types/            # tipe data client
├── server/
│   ├── api/          # endpoint REST (expenses, analytics)
│   └── utils/        # prisma singleton, auth (requireUser), serialize
└── prisma/
    └── schema.prisma # skema database
```

**Keamanan data:** Setiap endpoint memverifikasi sesi Supabase (`requireUser`) dan
memfilter query berdasarkan `userId`, sehingga data antar-pengguna terisolasi.
ID user pada tabel `users` disinkronkan dengan UID Supabase Auth.
