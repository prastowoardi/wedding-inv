/**
 * ====================================================================
 * GOOGLE APPS SCRIPT - BUKU TAMU & RSVP ONLINE (MULTI-DEVICE)
 * ====================================================================
 *
 * PANDUAN CEPAT (HANYA 3 MENIT):
 * 1. Buka browser dan kunjungi: https://sheets.new (membuat Google Spreadsheet baru)
 * 2. Beri nama file, misal: "RSVP Wedding"
 * 3. Pada menu atas, klik: Ekstensi (Extensions) > Apps Script
 * 4. Hapus semua kode yang ada di editor Apps Script, lalu PASTE SELURUH KODE DI FILE INI
 * 5. Klik icon Disket (Simpan / Save)
 * 6. Klik tombol biru "Deploy" (di pojok kanan atas) > pilih "New deployment"
 * 7. Klik icon Gerigi di sebelah "Select type", pilih "Web app"
 * 8. Atur konfigurasi:
 *    - Description: "RSVP Undangan Web"
 *    - Execute as: "Me (email Anda)"
 *    - Who has access: "Anyone" (Siapa saja)  <-- PENTING SEKALI!
 * 9. Klik tombol "Deploy". Jika Google meminta izin akun, klik "Authorize access",
 *    pilih akun Google Anda, klik "Advanced" (Lanjutan), lalu klik "Go to Untitled project (unsafe)".
 * 10. Salin "Web app URL" yang muncul (format: https://script.google.com/macros/s/.../exec)
 * 11. Buka file `assets/js/config.js` di project ini, lalu paste ke bagian:
 *     endpoint: 'URL_YANG_TADI_DISALIN',
 *
 * SELESAI! Mulai detik itu, semua tamu dari HP mana pun akan otomatis saling
 * melihat ucapan secara live, dan Anda punya rekap kehadiran di Google Spreadsheet!
 */

function doGet(e) {
  var sheet = getOrCreateSheet();
  var rows = sheet.getDataRange().getValues();
  var wishes = [];

  // Baris pertama (index 0) adalah header kolom
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[1] && !row[4]) continue; // Lewati jika kosong

    var parsedTime;
    try {
      parsedTime = row[0] ? new Date(row[0]).getTime() : Date.now();
      if (isNaN(parsedTime)) parsedTime = Date.now();
    } catch (err) {
      parsedTime = Date.now();
    }

    wishes.push({
      createdAt: parsedTime,
      name: String(row[1] || 'Tamu'),
      attendance: String(row[2] || 'Hadir'),
      guests: String(row[3] || '1'),
      message: String(row[4] || '')
    });
  }

  // Urutkan dari yang terbaru
  wishes.sort(function (a, b) {
    return b.createdAt - a.createdAt;
  });

  return ContentService
    .createTextOutput(JSON.stringify(wishes))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Kunci antrean 10 detik agar jika banyak tamu kirim bersamaan data tidak tertimpa
  lock.tryLock(10000);

  try {
    var sheet = getOrCreateSheet();
    var data = {};

    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var now = data.createdAt ? new Date(data.createdAt) : new Date();
    var timeFormatted = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    var newRow = [
      timeFormatted,
      data.name || 'Anonim',
      data.attendance || 'Hadir',
      data.guests || '1',
      data.message || ''
    ];

    sheet.appendRow(newRow);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  // Jika sheet baru dan kosong, buatkan header kolom otomatis
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Waktu', 'Nama Lengkap', 'Kehadiran', 'Jumlah Tamu', 'Ucapan & Doa']);
    var headerRange = sheet.getRange(1, 1, 1, 5);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#e8efe3');
  }

  return sheet;
}
