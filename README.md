# UTBelajar — Platform Belajar Digital Mandiri

> **Tagline:** *“Belajar Lebih Cerdas, Raih Hasil Lebih Baik.”*

**UTBelajar** adalah platform pembelajaran digital independen yang dikembangkan untuk membantu pelajar belajar mandiri secara terarah, mengerjakan latihan soal komprehensif, memantau grafik perkembangan belajar, dan berdiskusi dengan asisten AI.

> **Catatan Independensi:** UTBelajar merupakan platform belajar independen dan **bukan** situs resmi Universitas Terbuka serta tidak berafiliasi secara resmi dengan Universitas Terbuka. Tidak terdapat kolom NIM / nomor mahasiswa dalam seluruh sistem aplikasi.

---

## 🚀 Fitur Utama

1. **Autentikasi Aman (Supabase Auth)**:
   - Registrasi akun (Nama Lengkap, Email, Program Studi pilihan, Password).
   - Validasi input, toggle lihat password, pesan kesalahan jelas, dan auto-redirect sesi aktif.
   - Sesi terlindungi dengan Row Level Security (RLS).
2. **Dashboard Perkembangan Belajar**:
   - Sapaan dinamis waktu nyata: *"Halo, [Nama Pengguna]!"*.
   - 4 Kartu Statistik Nyata: Total Latihan, Rata-rata Nilai, Total Waktu Belajar, dan Tingkat Akurasi.
   - 3 Grafik Interaktif (Chart.js):
     - Grafik garis perkembangan nilai dari waktu ke waktu (Filter: 7 Hari, 30 Hari, Semua Data).
     - Grafik batang durasi & aktivitas belajar mingguan (dalam menit).
     - Grafik donat distribusi latihan per mata kuliah.
   - Kartu "Lanjutkan Belajar" & Riwayat Aktivitas Terbaru.
3. **Latihan Soal 5 Tahap**:
   - **Tahap 1:** Pilih Program Studi (Sistem Informasi, Manajemen, Ilmu Komunikasi, Akuntansi).
   - **Tahap 2:** Pilih Mata Kuliah (dilengkapi kode & jumlah paket).
   - **Tahap 3:** Pilih Paket Soal (Tingkat kesulitan, jumlah soal, estimasi waktu).
   - **Tahap 4:** Runner Pengerjaan Interaktif (1 soal per tampilan, hitung mundur timer, pilihan jawaban A/B/C/D, tombol Tandai Ragu-ragu, palet nomor 1..N, konfirmasi sebelum kumpulkan).
   - **Tahap 5:** Penilaian Server-side Aman (`submit_quiz_attempt` RPC) & Pembahasan Lengkap per soal dengan kunci jawaban dan penjelasan mendalam.
4. **UTBelajar AI — Asisten Belajar**:
   - Antarmuka chatbot 2 kolom dengan riwayat percakapan yang tersimpan per pengguna di Supabase.
   - Chip prompt rekomendasi topik belajar cepat.
   - Dukungan format Markdown, blok kode, tombol salin respons, dan indikator mengetik (*typing indicator*).
   - Terhubung ke Supabase Edge Functions (`ai-chat`) yang mendukung Google Gemini API atau OpenAI.
5. **Profil Pengguna & Logout**:
   - Menampilkan identitas pelajar, program studi minat, dan tanggal bergabung.
   - Modal Edit Profil untuk mengubah nama dan program studi.
   - Ringkasan capaian belajar.
   - Logout aman dengan pembersihan sesi.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend:** HTML5, CSS3 murni (Custom Properties, Flexbox & Grid, Animasi Halus), JavaScript Vanilla (ES Modules).
- **Grafik:** [Chart.js](https://www.chartjs.org/) melalui CDN.
- **Ikon:** Lucide Icons / SVG orisinal.
- **Tipografi:** Google Fonts *Plus Jakarta Sans*.
- **Backend:** Supabase (Auth, PostgreSQL Database, Row Level Security, Edge Functions).

---

## 📂 Struktur Folder Proyek

```text
E:\A_UTBELAJAR/
├── index.html                   # Router utama (cek sesi -> dashboard / login)
├── login.html                   # Halaman masuk (layout split-screen 2 kolom)
├── register.html                # Halaman pendaftaran akun (tanpa NIM)
├── dashboard.html               # Beranda perkembangan belajar & grafik
├── latihan-soal.html            # Engine latihan soal interaktif 5 tahap
├── utbelajar-ai.html            # Antarmuka chatbot asisten belajar
├── profile.html                 # Halaman detail akun, edit profil & logout
├── css/
│   ├── style.css                # CSS utama, variabel tema, app shell & reset
│   ├── auth.css                 # Gaya khusus halaman login & registrasi
│   ├── dashboard.css            # Gaya kartu statistik & grafik dashboard
│   ├── latihan.css              # Gaya runner soal, opsi jawaban, palet & hasil
│   ├── chatbot.css              # Gaya bubble chat, riwayat & prompt chips
│   └── profile.css              # Gaya kartu profil & modal
├── js/
│   ├── config.js                # Konfigurasi URL & Anon Key Supabase
│   ├── supabase.js              # Inisialisasi client Supabase via CDN ESM
│   ├── utils.js                 # Helper toast, markdown parser, format waktu
│   ├── auth.js                  # Handler login, register & auth guards
│   ├── navigation.js            # Controller sidebar, drawer mobile & user bar
│   ├── dashboard.js             # Perhitungan statistik & render Chart.js
│   ├── latihan.js               # Alur 5 tahap latihan soal & submit RPC
│   ├── chatbot.js               # Controller chat, histori & pemanggilan AI
│   └── profile.js               # Pengelolaan profil pengguna & konfirmasi logout
├── assets/
│   ├── icons/                   # Logo SVG orisinal UTBelajar & Favicon
│   └── images/                  # Ilustrasi visual edukasi digital
├── supabase/
│   ├── schema.sql               # Skema PostgreSQL lengkap, RLS & RPC server-side
│   └── functions/
│       └── ai-chat/
│           └── index.ts         # Edge Function Deno untuk Gemini / OpenAI
├── .env.example                 # Dokumentasi variabel lingkungan
└── README.md                    # Dokumentasi lengkap proyek
```

---

## ⚙️ Panduan Menjalankan Proyek

### 1. Menjalankan di Lokal (Browser / VS Code Live Server)

Karena menggunakan JavaScript ES Modules (`import/export`), jalankan proyek menggunakan server lokal HTTP (bukan membuka langsung via `file://`):

- **Opsi A (VS Code Live Server):**
  1. Buka folder `E:\A_UTBELAJAR` di VS Code.
  2. Klik kanan pada `index.html` lalu pilih **"Open with Live Server"**.
  3. Aplikasi akan terbuka di browser pada `http://127.0.0.1:5500`.

- **Opsi B (Node.js / npx serve):**
  ```powershell
  npx serve . -p 5173
  ```
  Buka `http://localhost:5173` di browser.

---

### 2. Konfigurasi Backend Supabase

#### Langkah 1: Buat Proyek Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Buat proyek baru (*New Project*).
3. Salin **Project URL** dan **anon / public key** dari menu **Project Settings > API**.

#### Langkah 2: Masukkan Kredensial ke `js/config.js`
Buka file `js/config.js` dan ganti nilai berikut:
```javascript
const DEFAULT_SUPABASE_URL = "https://proyek-anda.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOi...";
```
*(Alternatif: Anda juga dapat memasukkannya langsung di konsol browser via `setSupabaseCredentials(url, anonKey)`).*

#### Langkah 3: Eksekusi Database Schema di Supabase
1. Masuk ke menu **SQL Editor** di dashboard Supabase Anda.
2. Buat kueri baru, lalu salin seluruh isi file [`supabase/schema.sql`](file:///e:/A_UTBELAJAR/supabase/schema.sql).
3. Klik tombol **Run**.
4. Skema ini secara otomatis akan:
   - Membuat tabel: `profiles`, `study_programs`, `courses`, `question_sets`, `questions`, `question_answers`, `quiz_attempts`, `quiz_responses`, `study_sessions`, `ai_conversations`, `ai_messages`.
   - Mengaktifkan **Row Level Security (RLS)** pada seluruh tabel.
   - Mengamankan tabel `question_answers` (kunci jawaban) agar tidak dapat dibaca query frontend.
   - Membuat fungsi server-side `submit_quiz_attempt` untuk penilaian yang aman.
   - Memasukkan data awal (*seed data*) program studi, mata kuliah, paket soal, dan pertanyaan latihan lengkap beserta penjelasannya.

---

### 3. Konfigurasi UTBelajar AI (Supabase Edge Function)

Untuk mengaktifkan asisten chatbot UTBelajar AI:

1. **Deploy Edge Function menggunakan Supabase CLI:**
   ```powershell
   supabase functions deploy ai-chat --no-verify-jwt
   ```
2. **Setel API Key Penyedia AI di Supabase Secrets:**
   ```powershell
   # Jika menggunakan Google Gemini API:
   supabase secrets set GEMINI_API_KEY=AIzaSy...

   # Atau jika menggunakan OpenAI:
   supabase secrets set OPENAI_API_KEY=sk-...
   ```
3. *Catatan:* Jika API Key belum disetel, antarmuka chat UTBelajar AI akan tetap berfungsi dan secara ramah menginformasikan bahwa layanan AI sedang dalam tahap konfigurasi oleh administrator tanpa merusak aplikasi.

---

## 🔒 Keamanan dan Privasi

- **Tanpa Pengumpulan Identitas Akademik Pribadi:** Tidak ada kolom NIM (*Nomor Induk Mahasiswa*) pada formulir, basis data, atau penyimpanan lokal mana pun.
- **Row Level Security (RLS):** Setiap pengguna hanya memiliki hak akses baca dan tulis pada data riwayat latihan, profil, waktu belajar, dan percakapan AI miliknya sendiri (`auth.uid() = user_id`).
- **Integritas Penilaian Latihan:** Kunci jawaban tidak pernah dikirimkan ke peramban pengguna saat latihan dimulai. Penilaian dievaluasi langsung di sisi server melalui fungsi PostgreSQL `submit_quiz_attempt(p_question_set_id, p_responses, p_duration_seconds)`.

---

## 📄 Lisensi & Pernyataan Hukum

Proyek UTBelajar ini dikembangkan untuk tujuan edukasi mandiri. Seluruh merek, nama mata kuliah, dan logo resmi Universitas Terbuka adalah hak milik eksklusif Universitas Terbuka. UTBelajar beroperasi secara independen tanpa ikatan institusional.
# UTBELAJAR
