# latihan doπ

Aplikasi latihan TKA/TPA berbasis **HTML, CSS, dan JavaScript native**. Tidak menggunakan framework, backend, database, maupun layanan login.

## Menjalankan aplikasi

1. Ekstrak folder project.
2. Buka `index.html` menggunakan browser modern.
3. Masukkan nama peserta.
4. Pilih latihan kategori (10 soal, 20 soal, atau seluruh bank) atau simulasi CBT penuh.

Aplikasi dapat dijalankan langsung melalui `index.html`. Untuk pengalaman development, Anda juga dapat menjalankan folder ini memakai ekstensi Live Server di VS Code.

## Isi project

- `index.html` — halaman utama.
- `styles.css` — identitas visual, tipografi, light theme, dan responsive.
- `app.js` — alur latihan, timer, scoring, navigasi, riwayat, unduhan, dan penyimpanan lokal.
- `questions.json` — sumber utama bank soal yang mudah diperiksa dan diperbarui.
- `question-bank.js` — file bank soal yang dimuat browser; dibuat otomatis dari JSON.
- `build_bank.py` — skrip untuk memperbarui `question-bank.js` setelah JSON diedit.
- `SOURCES.md` — daftar referensi publik.

Bank awal berisi **160 soal latihan orisinal**:

| Kategori | Jumlah | Ragam |
|---|---:|---|
| Verbal | 50 | Sinonim, antonim, analogi, pemahaman bacaan, penalaran deduktif |
| Kuantitatif | 50 | Deret, komparasi kuantitatif, aritmetika, soal cerita, interpretasi data |
| Spasial | 60 | Rotasi arah, pencerminan, pola matriks, jaring-jaring kubus, susunan kubus |

## Aturan simulasi

Mengikuti dokumen spesifikasi yang diberikan:

- Verbal: 30 soal / 25 menit.
- Kuantitatif: 30 soal / 35 menit.
- Spasial: 60 soal / 25 menit.
- Total: 120 soal / 85 menit berdasarkan penjumlahan waktu tiap subtes.
- Subtes berjalan berurutan; ketika waktunya habis, subtes dikunci dan aplikasi berpindah otomatis ke subtes berikutnya.
- Navigasi nomor soal, penanda soal, dan peringatan sisa waktu lima menit tersedia.
- Benar +1, salah/kosong 0.

## Skor

Dokumen spesifikasi menyebut rentang skor 200–800 tetapi tidak memberikan rumus konversi resminya. Aplikasi memakai rumus linear estimasi:

`Skor = 200 + (jawaban benar / jumlah soal) × 600`

Untuk simulasi lengkap, penyebut adalah 120. Untuk latihan kategori, skor bersifat proporsional terhadap jumlah soal sesi dan tidak dimaksudkan untuk dibandingkan dengan standar seleksi. Angka target 450, 500, dan 550–600 ditampilkan sebagai panduan perkiraan yang tercantum di dokumen pengguna, bukan jaminan kelulusan.

## Sumber referensi dan atribusi

Soal pada bank awal **ditulis ulang sebagai soal latihan orisinal**. Sumber di tiap soal adalah referensi kategori, ragam, atau konsep soal; bukan pernyataan bahwa naskah soal tersebut disalin dari sumber. Tidak ada klaim bahwa soal ini merupakan soal resmi, bocoran, atau soal asli PIP UNPAD/Bappenas.

Referensi publik yang digunakan untuk memahami ragam latihan:

1. CregAsia, *Contoh Soal TPA BAPPENAS 2025 (9)* — https://www.cregasia.com/soal/83/contoh-soal-tpa-bappenas-2025-9
2. Jobstreet Indonesia, *45+ Contoh Soal TPA: Pembahasan dan Tips Mengerjakannya* — https://id.jobstreet.com/id/career-advice/article/contoh-soal-tpa-pembahasan-tips-mengerjakan
3. Jago TPA, *Materi Tes TPA Lengkap, Cek Verbal, Numerik, Logika, dan Spasial* — https://jagotpa.id/materi-tes-tpa-lengkap-cek-verbal-numerik-logika-dan-spasial/
4. Kementerian PPN/Bappenas, *Petunjuk Teknis Instalasi dan Tata Tertib SKBT-TPA* — https://rekrutmen.bappenas.go.id/file/news/lampiran-iii-petunjuk-teknis-instalasi-dan-tata-tertib-skbt-tpa.pdf
5. Cognitive Testing, *Free Spatial Reasoning Practice Test* — https://cognitivetesting.org/practice-tests/spatial-reasoning
6. PIP Unpad, *Perubahan Website Pendaftaran TKA PIP Unpad* — https://pipunpad.id/article/perubahan-website-pendaftaran-tka-pip-unpad

Periksa ketentuan penggunaan masing-masing sumber sebelum memasukkan materi pihak ketiga secara verbatim ke versi publik. Atribusi sumber tidak otomatis menggantikan izin penggunaan ulang.

## Penyimpanan dan privasi

- Nama peserta disimpan pada `localStorage`.
- Riwayat maksimal 20 hasil terbaru disimpan di `localStorage`.
- File hasil dapat diunduh sebagai JSON atau CSV dan dicetak menjadi PDF melalui dialog print browser.
- Semua pemrosesan dilakukan pada browser. Data tidak tersinkron lintas perangkat dan dapat hilang bila data browser dibersihkan.

## Memperbarui bank soal

Edit `questions.json` dengan format objek yang sama seperti contoh. Setiap soal idealnya memiliki:

- `id`, `category`, `type`, `difficulty`, `prompt`
- `options` berisi tepat lima opsi A–E
- `answer` berupa index 0–4
- `explanation`
- `source` berupa label dan URL rujukan
- `original: true` untuk menandai soal latihan yang dibuat sendiri

Setelah mengedit `questions.json`, jalankan perintah berikut dari folder project:

```bash
python build_bank.py
```

Skrip akan memvalidasi field penting, memastikan lima opsi dan index kunci jawaban valid, lalu memperbarui `question-bank.js`. File JavaScript terpisah digunakan agar aplikasi tetap dapat dibuka langsung melalui `index.html` tanpa `fetch()` JSON yang dapat dibatasi browser pada protokol `file://`.
