// Ganti KODE_RAHASIA, lalu Deploy > New deployment > Web app
// Execute as: Me   |   Who has access: Anyone

var KODE_RAHASIA = 'cf-syauqi-2026';

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

    return keluar({ ok: true, masuk: p.length });
  } catch (err) {
    return keluar({ ok: false, pesan: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.rahasia !== KODE_RAHASIA) return keluar({ ok: false, pesan: 'Kode rahasia salah' });
  if (p.ambil === 'data') {
    var snap = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Snapshot');
    return keluar({ ok: true, data: snap ? String(snap.getRange('B2').getValue()) : '' });
  }
  return keluar({ ok: true, pesan: 'Siap menerima' });
}

function keluar(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
