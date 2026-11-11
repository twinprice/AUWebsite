/**
 * Acoustic Underground site feedback database.
 *
 * This runs inside a Google Sheet as an Apps Script web app. The sheet is the
 * database: one row per note. feedback.html adds rows, responses.html reads
 * them and changes Status and Notes. Setup steps are in feedback-db/SETUP.md.
 *
 * The review passcode lives in Script Properties (key PASSCODE), not here,
 * so it never ends up in the public GitHub repo.
 */

const SHEET_NAME = 'Responses';
const HEADERS = ['ID', 'Received', 'From', 'Type', 'Where', 'Priority', 'Summary', 'Details',
  'Screenshot', 'Device', 'Browser', 'Status', 'Notes', 'Updated'];
const STATUSES = ['New', 'Reviewing', 'Planned', 'Done', "Won't fix"];
const COL = Object.fromEntries(HEADERS.map((h, i) => [h, i + 1]));

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

// Run this once from the editor to create the Responses tab and check setup.
function setup() {
  sheet_();
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
      sh.appendRow([
        id, now,
        clean_(d.From, 60), clean_(d.Type, 30), clean_(d.Where, 80), clean_(d.Priority, 40),
        clean_(d.Summary, 200), clean_(d.Details, 5000), clean_(d.Screenshot, 500),
        clean_(d.Device, 200), clean_(d.Browser, 400),
        'New', '', now
      ]);
      return json_({ ok: true, id: id });
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
