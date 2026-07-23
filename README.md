# Keuangan Keluarga — Aplikasi + Sinkronisasi Google Sheets

Aplikasi ini adalah **PWA** (web app yang bisa dipasang seperti aplikasi HP) untuk
anggaran, KPR, investasi, dan simulasi pensiun keluarga. Semua data tersimpan di HP
kamu **dan** bisa disinkronkan dua arah ke Google Sheets.

## Cara kerja sinkronisasi

| Arah | Cara | Otomatis? |
|------|------|-----------|
| **Aplikasi → Sheets** | Setiap perubahan dikirim ke tab `Log` (riwayat) + `Snapshot` (data lengkap) | ✅ Ya — nyalakan **"Kirim otomatis"** (kirim 4 detik setelah berhenti mengetik) |
| **Sheets → Aplikasi** | Tombol **"Tarik"** memuat data terakhir **+ angka yang kamu isi di tab `✏️ Edit di sini`** | Manual (satu ketuk) |

Untuk mengubah angka dari sisi Google Sheets, edit **kolom kuning** di tab
**`✏️ Edit di sini`** (dibuat otomatis oleh `Code.gs`), lalu ketuk **Tarik** di aplikasi.

Aplikasi berbicara dengan Google Sheets lewat sebuah **Google Apps Script Web App**
yang kamu pasang sekali di spreadsheet, diamankan dengan kata sandi.

## File di repo ini

- `index.html` — seluruh aplikasi (React, sudah jadi, satu file)
- `manifest.json`, `sw.js`, `icon-*.png` — supaya bisa dipasang & jalan offline
- `apps-script/Code.gs` — kode yang kamu tempel ke Apps Script spreadsheet
- `docs/PANDUAN.md` — **panduan langkah demi langkah (Bahasa Indonesia, non-teknis)**

## Mulai cepat

1. Buka **`docs/PANDUAN.md`** dan ikuti 3 langkah: pasang Apps Script → salin URL →
   masukkan URL + kata sandi di aplikasi (menu **Sinkron**).
2. Nyalakan **Kirim otomatis**. Selesai.
