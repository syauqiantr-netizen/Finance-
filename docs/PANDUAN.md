# Panduan Memasang & Menyambungkan Aplikasi (untuk non-teknis)

Waktu ± 10 menit, sekali saja. Ikuti berurutan.

---

## Bagian 1 — Pasang "jembatan" di Google Sheets (Apps Script)

Ini yang membuat aplikasi bisa menulis & membaca spreadsheet-mu.

1. Buka spreadsheet **`cf_syauqi_revised`** (CF syauqi) — ini yang kamu minta jadi
   tempat sinkron. Aplikasi hanya akan **menambah 2 tab baru** (`Log` = riwayat,
   `Snapshot` = data lengkap); tab model/ perhitunganmu yang lain **tidak disentuh**.
2. Di menu atas: **Extensions → Apps Script**.
3. Hapus semua isi yang ada, lalu **tempel seluruh isi file `apps-script/Code.gs`**
   dari repo ini.
4. Kata sandi **sudah saya isikan** untukmu di baris atas:
   ```js
   var KODE_RAHASIA = 'cf-syauqi-2026';
   ```
   Tidak perlu diubah (kata sandi ini juga **sudah otomatis terisi di aplikasi**).
   Kalau mau ganti, silakan, tapi harus **sama persis** dengan yang di aplikasi.
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
2. Isi **satu kolom saja**:
   - **URL Web App**: tempel URL dari **Bagian 1 langkah 8**.
   - **Kata sandi**: **sudah terisi otomatis** (`cf-syauqi-2026`) — biarkan.
   - **Kirim otomatis**: **sudah Aktif** dari awal — biarkan.
3. Ketuk **Kirim ringkasan sekarang** sekali untuk uji coba.
   - Berhasil → muncul "Terkirim/Tersinkron", dan di spreadsheet muncul tab
     **`Log`** & **`Snapshot`** terisi.
5. Untuk menarik data dari Sheets ke aplikasi (mis. di HP lain), ketuk **Tarik**.

Selesai! Mulai sekarang:
- **Setiap kamu mengubah angka di aplikasi** → otomatis tercatat di Sheets.
- **Ketuk "Tarik"** kapan pun untuk memuat versi terbaru dari Sheets.

---

## Mengedit dari Google Sheets (tab "✏️ Edit di sini")

Kode `apps-script/Code.gs` membuat **tab `✏️ Edit di sini`** secara otomatis di
spreadsheet. Isinya kolom **KUNING yang boleh kamu edit**:

- Pendapatan (Syauqi, Syarifah)
- Aset: RDPT, ETF/US Market, Emas, Kas, Rumah
- Imbal hasil (%): ETF, RDPT, Emas, Kas
- DCA nominal/bulan, KPR setoran/bulan, Saldo aktual bulan ini

**Cara pakai:** ketik angka baru di sel kuning → di aplikasi buka **Sinkron → Tarik**.
Angka di aplikasi ikut berubah. **Kosongkan** sel bila ingin memakai angka dari
aplikasi (sel kosong = tidak menimpa).

> Tab `Log` & `Snapshot` tetap **bukan untuk diedit tangan** — itu riwayat & data
> mesin. Untuk mengatur dari Sheets, pakai **hanya** tab `✏️ Edit di sini`.

### Kalau kamu memperbarui Code.gs (deploy ulang)

Setiap kali isi `Code.gs` berubah, aktifkan versi barunya:
**Apps Script → Deploy → Manage deployments → (pensil) Edit → Version: New version → Deploy.**
URL `…/exec` tidak berubah, jadi tak perlu diganti di aplikasi.

## Angka aplikasi mengisi tab model (Assumptions & Investment Projection)

Selain tab `Log`/`Snapshot`, `Code.gs` juga menulis angka aplikasi ke **sel biru
input** di tab model (rumus tidak disentuh):

| Angka di aplikasi | → Sel model |
|---|---|
| Aset RDPT / ETF / Emas / Kas | `Assumptions!C17 / C18 / C19 / C20` (Total `C22` ikut otomatis) |
| **Saldo asli bulan ini** | `Investment Projection` kolom **I (ACTUAL TOTAL)**, di baris bulan yang cocok (baris 5 = Jun-2026, 6 = Jul-2026, dst) |

Jadi begitu kamu isi "Saldo asli bulan ini" di aplikasi → otomatis masuk ke kolom
`ACTUAL TOTAL` bulan tersebut, dan `Variance`/`On Track?` ikut terhitung.

> Konsekuensi: sel-sel itu jadi **dikendalikan aplikasi**. Jika kamu ketik manual di
> sel yang sama, nanti tertimpa saat aplikasi sinkron. Edit angkanya di aplikasi.

## Menyamakan HP dengan laptop

Pengaturan sinkron disimpan **per perangkat**. Kalau laptop sudah "Tersinkron"
tapi HP belum:

1. Di HP buka aplikasi → **Lainnya → Sinkron**
2. Tempel **URL Web App yang sama** (kata sandi sudah terisi otomatis)
3. Ketuk **Tarik** → data dari Sheets termuat ke HP

## Arah sinkron (ringkas)

- **Aplikasi → Sheets:** otomatis penuh (setiap perubahan).
- **Sheets → Aplikasi:** ketuk **Tarik**; memuat data terbaru **plus** angka yang
  kamu isi di tab `✏️ Edit di sini`.

---

## Kalau ada masalah

| Gejala | Penyebab & solusi |
|--------|-------------------|
| "URL Web App belum diisi" | URL kosong di menu Sinkron — tempel URL `…/exec`. |
| "Kode rahasia salah" | Kata sandi di aplikasi ≠ `KODE_RAHASIA` di Code.gs. Samakan. |
| "Terkirim, tapi tanpa konfirmasi" | Normal untuk sebagian browser HP (mode no-cors). Data tetap masuk — cek tab `Log`. |
| Tab `Log`/`Snapshot` tak muncul | Deploy belum "Anyone" / belum Authorize. Ulangi Bagian 1 langkah 6–7. |
| Ubah `Code.gs` tapi tak berubah | Belum deploy versi baru. Manage deployments → New version → Deploy. |
