# Panduan Memasang & Menyambungkan Aplikasi (untuk non-teknis)

Waktu ± 10 menit, sekali saja. Ikuti berurutan.

---

## Bagian 1 — Pasang "jembatan" di Google Sheets (Apps Script)

Ini yang membuat aplikasi bisa menulis & membaca spreadsheet-mu.

1. Buka spreadsheet yang mau dipakai sebagai tempat data.
   > Saran: pakai sheet **"Log Keuangan"** (yang sudah kamu buat), supaya tab
   > `Log` & `Snapshot` dari aplikasi tidak bercampur dengan model `cf_syauqi_revised`.
2. Di menu atas: **Extensions → Apps Script**.
3. Hapus semua isi yang ada, lalu **tempel seluruh isi file `apps-script/Code.gs`**
   dari repo ini.
4. Di baris paling atas, ganti kata sandi:
   ```js
   var KODE_RAHASIA = 'ganti-kode-ini';
   ```
   Ganti `ganti-kode-ini` dengan kata sandi bebas buatanmu, misal `rahasia-syauqi-2026`.
   **Ingat/catat** — nanti dipakai di aplikasi. (Boleh huruf/angka/strip, tanpa spasi.)
5. Klik ikon **Simpan** (💾).
6. Klik **Deploy → New deployment**.
   - Klik ikon gerigi ⚙️ di kiri → pilih **Web app**.
   - **Description**: bebas, misal `sinkron keuangan`.
   - **Execute as**: **Me** (email kamu).
   - **Who has access**: **Anyone**.
   - Klik **Deploy**.
7. Google minta izin (**Authorize access**) → pilih akunmu → jika muncul
   "Google hasn't verified this app", klik **Advanced → Go to (nama proyek) (unsafe)
   → Allow**. (Aman, ini skrip milikmu sendiri.)
8. Muncul **Web app URL** berupa
   `https://script.google.com/macros/s/AKfyc…/exec`.
   **Salin URL ini.** Inilah alamat jembatanmu.

> Kalau nanti kamu mengubah `Code.gs`, ulangi **Deploy → Manage deployments →
> (pensil) Edit → Version: New version → Deploy** supaya perubahan aktif.

---

## Bagian 2 — Buka aplikasinya

Kamu punya dua cara memakai aplikasi (`index.html`):

- **Cara A (paling praktis): lewat GitHub Pages.**
  Setelah file di-push ke GitHub, aktifkan Pages sekali:
  **Repo → Settings → Pages → Source: Deploy from a branch → Branch:
  `claude/apps-sheets-bidirectional-sync-0hzlzj` / `(root)` → Save.**
  Tunggu ±1 menit, lalu buka URL yang muncul, contohnya
  `https://syauqiantr-netizen.github.io/finance-/`.
  Di HP, buka URL itu di Chrome/Safari → menu → **Add to Home Screen** →
  jadi aplikasi di layar HP, bisa dipakai offline.

- **Cara B (tanpa hosting):** buka file `index.html` langsung di browser.
  Cepat untuk mencoba, tapi tidak bisa dipasang ke layar HP.

---

## Bagian 3 — Sambungkan aplikasi ke Sheets

1. Di aplikasi, buka menu **Lainnya → Sinkron** (atau tab **Sinkron**).
2. Isi:
   - **URL Web App**: tempel URL dari **Bagian 1 langkah 8**.
   - **Kata sandi**: tulis **persis sama** dengan `KODE_RAHASIA` di Apps Script.
3. Nyalakan **Kirim otomatis** → jadi **Aktif**.
4. Ketuk **Kirim ringkasan sekarang** sekali untuk uji coba.
   - Berhasil → muncul "Terkirim/Tersinkron", dan di spreadsheet muncul tab
     **`Log`** & **`Snapshot`** terisi.
5. Untuk menarik data dari Sheets ke aplikasi (mis. di HP lain), ketuk **Tarik**.

Selesai! Mulai sekarang:
- **Setiap kamu mengubah angka di aplikasi** → otomatis tercatat di Sheets.
- **Ketuk "Tarik"** kapan pun untuk memuat versi terbaru dari Sheets.

---

## Yang perlu diketahui (batasan jujur)

Aplikasi ini memakai model **"aplikasi = sumber utama, Sheets = cermin + riwayat"**:

- Arah **aplikasi → Sheets berjalan otomatis penuh.**
- Arah **Sheets → aplikasi** memuat kembali *snapshot* yang ditulis aplikasi
  (tab `Snapshot`, sel `B2` berisi data JSON). Jadi mengetik ulang angka
  **langsung di sel-sel model** tidak otomatis masuk ke aplikasi — edit angka
  sebaiknya dilakukan **di dalam aplikasi**, lalu Sheets menyusul otomatis.

Kalau kamu mau versi di mana **mengedit sel tertentu di Sheets langsung mengubah
aplikasi** (misalnya nilai portofolio / split DCA di tab khusus "Input"),
itu bisa dibuatkan sebagai pengembangan lanjutan — tinggal bilang.

---

## Kalau ada masalah

| Gejala | Penyebab & solusi |
|--------|-------------------|
| "URL Web App belum diisi" | URL kosong di menu Sinkron — tempel URL `…/exec`. |
| "Kode rahasia salah" | Kata sandi di aplikasi ≠ `KODE_RAHASIA` di Code.gs. Samakan. |
| "Terkirim, tapi tanpa konfirmasi" | Normal untuk sebagian browser HP (mode no-cors). Data tetap masuk — cek tab `Log`. |
| Tab `Log`/`Snapshot` tak muncul | Deploy belum "Anyone" / belum Authorize. Ulangi Bagian 1 langkah 6–7. |
| Ubah `Code.gs` tapi tak berubah | Belum deploy versi baru. Manage deployments → New version → Deploy. |
