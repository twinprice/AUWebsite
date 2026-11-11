/**
 * Acoustic Underground site feedback database.
 *
 * This runs inside a Google Sheet as an Apps Script web app. The sheet is the
 * database: one row per note. feedback.html adds rows, responses.html reads
 * them and changes Status and Notes. Setup steps are in feedback-db/SETUP.md.
 *
 * The review passcode lives in Script Properties (key PASSCODE), not here,
 * so it never ends up in the public GitHub repo.
 *
 * Screenshots: the form shrinks each image in the browser, then sends it here.
 * They are saved to a Drive folder named "AU site feedback screenshots",
 * shared as "anyone with the link can view", and their links go in the Images column.
 */

const SHEET_NAME = 'Responses';
const HEADERS = ['ID', 'Received', 'From', 'Type', 'Where', 'Priority', 'Summary', 'Details',
  'Screenshot', 'Device', 'Browser', 'Status', 'Notes', 'Updated', 'Images'];
const STATUSES = ['New', 'Reviewing', 'Planned', 'Done', "Won't fix"];
const COL = Object.fromEntries(HEADERS.map((h, i) => [h, i + 1]));
const FOLDER_NAME = 'AU site feedback screenshots';
const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // after the browser shrinks it, a screenshot is usually 150-500 KB
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build();
    sh.getRange(2, COL.Status, sh.getMaxRows() - 1, 1).setDataValidation(rule);
  }
  // Sheets made before a column was added get its header filled in
  const have = sh.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  HEADERS.forEach((h, i) => { if (have[i] !== h && have[i] === '') sh.getRange(1, i + 1).setValue(h).setFontWeight('bold'); });
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function passcodeOk_(code) {
  const real = PropertiesService.getScriptProperties().getProperty('PASSCODE');
  return !!real && String(code || '') === real;
}

// Trim, cap length, and stop the sheet from treating text as a formula.
function clean_(value, max) {
  let s = String(value == null ? '' : value).slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function folder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { /* deleted, make a new one */ } }
  const found = DriveApp.getFoldersByName(FOLDER_NAME);
  const folder = found.hasNext() ? found.next() : DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('FOLDER_ID', folder.getId());
  return folder;
}

// Saves up to MAX_IMAGES images sent as {name, type, data(base64)} and returns their view links.
function saveImages_(images, id) {
  if (!Array.isArray(images) || !images.length) return [];
  const folder = folder_();
  const links = [];
  images.slice(0, MAX_IMAGES).forEach((img, i) => {
    const ext = IMAGE_TYPES[img && img.type];
    if (!ext || typeof img.data !== 'string') return;
    const bytes = Utilities.base64Decode(img.data);
    if (bytes.length > MAX_IMAGE_BYTES) return;
    const blob = Utilities.newBlob(bytes, img.type, id + '-' + (i + 1) + '.' + ext);
    const file = folder.createFile(blob);
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { /* some accounts block link sharing */ }
    links.push('https://drive.google.com/file/d/' + file.getId() + '/view');
  });
  return links;
}

// Run this once from the editor to create the Responses tab and check setup.
function setup() {
  sheet_();
  folder_(); // asks for Drive access the first time
  const has = !!PropertiesService.getScriptProperties().getProperty('PASSCODE');
  Logger.log(has ? 'Ready. Responses tab exists and PASSCODE is set.' : 'Responses tab exists. Now add PASSCODE in Project Settings > Script Properties.');
}

/** GET ?code=PASSCODE  -> every note, newest first */
function doGet(e) {
  if (!passcodeOk_(e.parameter.code)) return json_({ ok: false, error: 'passcode' });
  const values = sheet_().getDataRange().getValues();
  const head = values.shift();
  const rows = values
    .filter(r => r[0] !== '')
    .map(r => Object.fromEntries(head.map((h, i) => [h, r[i] instanceof Date ? r[i].toISOString() : r[i]])));
  rows.reverse();
  return json_({ ok: true, statuses: STATUSES, rows: rows });
}

/** POST {action:'add', ...note}  or  {action:'update', code, id, Status?, Notes?} */
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad request' }); }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();

    if (d.action === 'add') {
      if (d._honey) return json_({ ok: true }); // spam bot filled the hidden field
      if (!d.Summary || !d.Details) return json_({ ok: false, error: 'missing fields' });
      const id = Utilities.getUuid().slice(0, 8);
      const now = new Date();
      lock.releaseLock(); // uploads can take a few seconds; don't block other notes
      let links = [];
      try { links = saveImages_(d.images, id); } catch (err) { links = ['(image upload failed: ' + String(err).slice(0, 120) + ')']; }
      lock.waitLock(10000);
      sh.appendRow([
        id, now,
        clean_(d.From, 60), clean_(d.Type, 30), clean_(d.Where, 80), clean_(d.Priority, 40),
        clean_(d.Summary, 200), clean_(d.Details, 5000), clean_(d.Screenshot, 500),
        clean_(d.Device, 200), clean_(d.Browser, 400),
        'New', '', now, links.join('\n')
      ]);
      return json_({ ok: true, id: id, images: links.length });
    }

    if (d.action === 'update') {
      if (!passcodeOk_(d.code)) return json_({ ok: false, error: 'passcode' });
      const last = sh.getLastRow();
      if (last < 2) return json_({ ok: false, error: 'not found' });
      const ids = sh.getRange(2, COL.ID, last - 1, 1).getValues().map(r => String(r[0]));
      const i = ids.indexOf(String(d.id));
      if (i < 0) return json_({ ok: false, error: 'not found' });
      const row = i + 2;
      if (d.Status !== undefined) {
        if (STATUSES.indexOf(d.Status) < 0) return json_({ ok: false, error: 'bad status' });
        sh.getRange(row, COL.Status).setValue(d.Status);
      }
      if (d.Notes !== undefined) sh.getRange(row, COL.Notes).setValue(clean_(d.Notes, 5000));
      const now = new Date();
      sh.getRange(row, COL.Updated).setValue(now);
      return json_({ ok: true, updated: now.toISOString() });
    }

    return json_({ ok: false, error: 'unknown action' });
  } finally {
    lock.releaseLock();
  }
}
