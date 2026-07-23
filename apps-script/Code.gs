// ============================================================
//  Keuangan Keluarga — jembatan Google Sheets (Apps Script)
//  Cara pakai: tempel SEMUA isi file ini ke Extensions > Apps Script
//  spreadsheet CF syauqi, lalu Deploy > New deployment > Web app
//  (Execute as: Me | Who has access: Anyone). Salin URL /exec.
//  Jika mengubah file ini, deploy ulang: Manage deployments >
//  Edit (pensil) > Version: New version > Deploy.
// ============================================================

var KODE_RAHASIA = 'cf-syauqi-2026';

// Nama tab yang bisa DIEDIT tangan untuk mengatur aplikasi dari Sheets
var NAMA_INPUT = '✏️ Edit di sini';

// Daftar kolom yang boleh diedit di tab Input.
// path = lokasi nilai di data aplikasi; type: 'rp' (rupiah) atau 'pct' (persen)
var DAFTAR = [
  { label: 'Pendapatan — Syauqi (Rp/bln)',    path: ['pendapatan', 'syauqi'],   type: 'rp'  },
  { label: 'Pendapatan — Syarifah (Rp/bln)',  path: ['pendapatan', 'syarifah'], type: 'rp'  },
  { label: 'Aset — RDPT (Rp)',                path: ['aset', 'rdpt'],           type: 'rp'  },
  { label: 'Aset — ETF / US Market (Rp)',     path: ['aset', 'etf'],            type: 'rp'  },
  { label: 'Aset — Emas (Rp)',                path: ['aset', 'emas'],           type: 'rp'  },
  { label: 'Aset — Kas (Rp)',                 path: ['aset', 'kas'],            type: 'rp'  },
  { label: 'Aset — Rumah (Rp)',               path: ['aset', 'rumah'],          type: 'rp'  },
  { label: 'Imbal hasil — ETF (%)',           path: ['imbal', 'etf'],           type: 'pct' },
  { label: 'Imbal hasil — RDPT (%)',          path: ['imbal', 'rdpt'],          type: 'pct' },
  { label: 'Imbal hasil — Emas (%)',          path: ['imbal', 'emas'],          type: 'pct' },
  { label: 'Imbal hasil — Kas (%)',           path: ['imbal', 'kas'],           type: 'pct' },
  { label: 'DCA — nominal per bulan (Rp)',    path: ['dca', 'nominal'],         type: 'rp'  },
  { label: 'KPR — setoran per bulan (Rp)',    path: ['kpr', 'setoran'],         type: 'rp'  },
  { label: 'Saldo aktual bulan ini (Rp)',     path: ['__aktual__'],             type: 'rp'  }
];

// ---- Aplikasi MENGIRIM data ke sini (app -> Sheets) --------
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.rahasia !== KODE_RAHASIA) return keluar({ ok: false, pesan: 'Kode rahasia salah' });
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var log = ss.getSheetByName('Log');
    if (!log) {
      log = ss.insertSheet('Log');
      log.appendRow(['Waktu', 'Layar', 'Item', 'Dari', 'Jadi', 'Perangkat']);
      log.setFrozenRows(1);
      log.setColumnWidth(1, 150);
      log.setColumnWidth(3, 260);
    }
    var p = body.perubahan || [];
    if (p.length) {
      var rows = p.map(function (x) {
        return [new Date(x.waktu), x.layar, x.item, x.dari, x.jadi, body.perangkat || ''];
      });
      log.getRange(log.getLastRow() + 1, 1, rows.length, 6).setValues(rows);
    }

    var snap = ss.getSheetByName('Snapshot');
    if (!snap) snap = ss.insertSheet('Snapshot');
    snap.clear();
    snap.getRange('A1').setValue('Terakhir disinkron');
    snap.getRange('B1').setValue(new Date());
    snap.getRange('A2').setValue('Data (JSON)');
    snap.getRange('B2').setValue(body.data || '');
    var r = body.ringkasan || [];
    if (r.length) snap.getRange(4, 1, r.length, 2).setValues(r);
    snap.setColumnWidth(1, 210);
    snap.setColumnWidth(2, 260);

    // tulis angka aplikasi ke tab model (Assumptions + Investment Projection)
    try { tulisModel(ss, body.data); } catch (err2) {}

    // pastikan tab "Edit di sini" tersedia (nilai lama tidak ditimpa)
    siapkanInput(ss);

    return keluar({ ok: true, masuk: p.length });
  } catch (err) {
    return keluar({ ok: false, pesan: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// ---- Aplikasi MENARIK data dari sini (Sheets -> app) -------
// Mengembalikan data Snapshot yang sudah DITIMPA nilai dari tab "Edit di sini".
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.rahasia !== KODE_RAHASIA) return keluar({ ok: false, pesan: 'Kode rahasia salah' });
  if (p.ambil === 'data') {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    siapkanInput(ss);
    var snap = ss.getSheetByName('Snapshot');
    var base = {};
    if (snap) { try { base = JSON.parse(String(snap.getRange('B2').getValue()) || '{}'); } catch (err) { base = {}; } }
    var merged = terapkanInput(ss, base);
    return keluar({ ok: true, data: JSON.stringify(merged) });
  }
  return keluar({ ok: true, pesan: 'Siap menerima' });
}

// Buat tab "Edit di sini" bila belum ada (tidak menimpa isian yang sudah ada)
function siapkanInput(ss) {
  var sh = ss.getSheetByName(NAMA_INPUT);
  if (sh) return sh;
  sh = ss.insertSheet(NAMA_INPUT, 0); // taruh paling depan
  sh.setColumnWidth(1, 300);
  sh.setColumnWidth(2, 170);
  sh.setColumnWidth(3, 380);

  sh.getRange('A1:C1').merge()
    .setValue('✏️ EDIT DI SINI  —  ubah angka di kolom KUNING, lalu di aplikasi buka Sinkron › Tarik')
    .setFontWeight('bold').setBackground('#1A7F64').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center').setWrap(true);
  sh.getRange('A2').setValue('Yang diatur').setFontWeight('bold');
  sh.getRange('B2').setValue('Isi nilai').setFontWeight('bold');
  sh.getRange('C2').setValue('Catatan').setFontWeight('bold');
  sh.getRange('A2:C2').setBackground('#EAF3EF');

  var n = DAFTAR.length;
  for (var i = 0; i < n; i++) {
    var row = 3 + i, f = DAFTAR[i];
    sh.getRange(row, 1).setValue(f.label);
    sh.getRange(row, 3)
      .setValue(f.type === 'pct'
        ? 'Isi angka persen, mis. 10 untuk 10%. Kosongkan = pakai nilai dari aplikasi.'
        : 'Isi angka rupiah tanpa titik. Kosongkan = pakai nilai dari aplikasi.')
      .setFontColor('#5C6B85');
  }

  var edit = sh.getRange(3, 2, n, 1);
  edit.setBackground('#FFF6D6');
  edit.setNumberFormat('#,##0');
  edit.setBorder(true, true, true, true, true, true, '#E6C200', SpreadsheetApp.BorderStyle.SOLID);

  sh.setFrozenRows(2);
  sh.getRange(3 + n + 1, 1)
    .setValue('Kolom KUNING = boleh diedit. Kosongkan sel bila ingin memakai angka dari aplikasi.')
    .setFontColor('#5C6B85');
  return sh;
}

// Timpa data Snapshot dengan nilai non-kosong dari tab "Edit di sini"
function terapkanInput(ss, base) {
  var sh = ss.getSheetByName(NAMA_INPUT);
  if (!sh) return base;
  var n = DAFTAR.length;
  var vals = sh.getRange(3, 2, n, 1).getValues();
  var asOf = base && base.asOf;
  for (var i = 0; i < n; i++) {
    var v = vals[i][0];
    if (v === '' || v === null) continue;
    if (typeof v !== 'number') {
      var num = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
      if (isNaN(num)) continue;
      v = num;
    }
    var f = DAFTAR[i];
    if (f.type === 'pct') v = v / 100;
    if (f.path[0] === '__aktual__') {
      if (asOf) { base.aktual = base.aktual || {}; base.aktual[asOf] = v; }
      continue;
    }
    var o = base, path = f.path;
    for (var k = 0; k < path.length - 1; k++) {
      if (typeof o[path[k]] !== 'object' || o[path[k]] == null) o[path[k]] = {};
      o = o[path[k]];
    }
    o[path[path.length - 1]] = v;
  }
  return base;
}

// Menu bantu + siapkan tab saat spreadsheet dibuka
function onOpen() {
  try { siapkanInput(SpreadsheetApp.getActiveSpreadsheet()); } catch (e) {}
  try {
    SpreadsheetApp.getUi().createMenu('Keuangan')
      .addItem('Buat / tampilkan tab "Edit di sini"', 'menuBuatInput')
      .addToUi();
  } catch (e) {}
}
function menuBuatInput() { siapkanInput(SpreadsheetApp.getActiveSpreadsheet()); }

// Tulis angka aplikasi ke sel-sel model (arah aplikasi -> model).
// Hanya menulis SEL BIRU input; rumus tidak disentuh.
function tulisModel(ss, dataJson) {
  var d;
  try { d = JSON.parse(dataJson || '{}'); } catch (e) { return; }

  // 1) Nilai portofolio -> Assumptions C17..C20 (RDPT/ETF/Emas/Kas)
  var asum = ss.getSheetByName('Assumptions');
  if (asum && d.aset) {
    if (typeof d.aset.rdpt === 'number') asum.getRange('C17').setValue(d.aset.rdpt);
    if (typeof d.aset.etf  === 'number') asum.getRange('C18').setValue(d.aset.etf);
    if (typeof d.aset.emas === 'number') asum.getRange('C19').setValue(d.aset.emas);
    if (typeof d.aset.kas  === 'number') asum.getRange('C20').setValue(d.aset.kas);
    // Total portfolio (C22) ikut otomatis lewat rumus SUM.
  }

  // 2) Saldo aktual bulanan -> Investment Projection kolom I (ACTUAL TOTAL),
  //    dicocokkan per bulan berdasarkan tanggal di kolom C.
  var proj = ss.getSheetByName('Investment Projection');
  if (proj) {
    var lastRow = proj.getLastRow();
    if (lastRow >= 5) {
      var bulan = proj.getRange(5, 3, lastRow - 4, 1).getValues(); // C5..C{last}

      // 2a) Saldo aktual bulanan -> kolom I (ACTUAL TOTAL).
      //     Total = aktual investasi + aktual buffer (per pot); fallback ke
      //     nilai total lama (d.aktual) untuk bulan yang belum dipisah.
      var tot = {};
      if (d.aktual && typeof d.aktual === 'object') {
        for (var kk in d.aktual) if (typeof d.aktual[kk] === 'number') tot[kk] = d.aktual[kk];
      }
      var bulanSet = {};
      if (d.aktualInv && typeof d.aktualInv === 'object') for (var ka in d.aktualInv) bulanSet[ka] = 1;
      if (d.aktualBuf && typeof d.aktualBuf === 'object') for (var kb in d.aktualBuf) bulanSet[kb] = 1;
      for (var mk in bulanSet) {
        var iv = (d.aktualInv && typeof d.aktualInv[mk] === 'number') ? d.aktualInv[mk] : 0;
        var bv = (d.aktualBuf && typeof d.aktualBuf[mk] === 'number') ? d.aktualBuf[mk] : 0;
        tot[mk] = iv + bv;
      }
      for (var key in tot) {
        var val = tot[key];
        if (typeof val !== 'number') continue;
        var bag = String(key).split('-');
        var yy = parseInt(bag[0], 10), mm = parseInt(bag[1], 10);
        if (!yy || !mm) continue;
        for (var i = 0; i < bulan.length; i++) {
          var dt = bulan[i][0];
          if (dt instanceof Date && dt.getFullYear() === yy && (dt.getMonth() + 1) === mm) {
            proj.getRange(5 + i, 9).setValue(val); // kolom I = 9
            break;
          }
        }
      }

      // 2b) DCA bulanan aplikasi -> kolom D (DCA This Month). Baris pertama
      //     (bulan pangkal) = 0, sesuai model. Override per-bulan dari dcaKhusus.
      if (d.dca && typeof d.dca.nominal === 'number') {
        var nominal = d.dca.nominal;
        var khusus = d.dcaKhusus || {};
        var out = [];
        for (var j = 0; j < bulan.length; j++) {
          var dj = bulan[j][0];
          if (!(dj instanceof Date)) break; // berhenti di akhir tabel proyeksi
          var ymj = dj.getFullYear() + '-' + ('0' + (dj.getMonth() + 1)).slice(-2);
          var dca = (j === 0) ? 0 : (typeof khusus[ymj] === 'number' ? khusus[ymj] : nominal);
          out.push([dca]);
        }
        if (out.length) proj.getRange(5, 4, out.length, 1).setValues(out); // kolom D = 4
      }
    }
  }
}

function keluar(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
