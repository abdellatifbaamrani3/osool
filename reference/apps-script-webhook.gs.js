/**
 * أصول / OSOOL — Google Sheets order webhook
 * ------------------------------------------------------------------
 * Paste this into Extensions → Apps Script on the "Osool — Orders" sheet.
 * Deployment instructions: docs/25-sheets-webhook.md §4
 *
 * Required tabs (exact names): Orders, Leads, Messages
 * Remember: after editing this file you must Deploy → New version,
 * otherwise the live web app keeps running the old code.
 */

// ⚠️ CHANGE THIS. Generate with:  openssl rand -hex 24
const SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_STRING';

const TZ = 'Asia/Riyadh';
const TAB_ORDERS = 'Orders';
const TAB_LEADS = 'Leads';
const TAB_MESSAGES = 'Messages';

// Orders column indices (1-based), must match docs/25-sheets-webhook.md §2.1
const COL = {
  createdAt: 1,   // A
  orderNumber: 2, // B
  name: 3,        // C
  phone: 4,       // D
  whatsapp: 5,    // E
  items: 6,       // F
  units: 7,       // G
  total: 8,       // H
  upsell: 9,      // I
  status: 10,     // J
  notes: 11,      // K
  city: 12,       // L
  address: 13,    // M
  confirmedAt: 14,// N
  deliveredAt: 15,// O
  utmSource: 16,  // P
  utmCampaign: 17,// Q
  utmContent: 18, // R
  riskFlag: 19,   // S
  orderId: 20,    // T
};

const ORDERS_WIDTH = 20;

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Serialise concurrent writes — two orders arriving at once would
    // otherwise race on getLastRow() and overwrite each other.
    lock.waitLock(30000);

    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, error: 'empty_body' }, 400);
    }

    const body = JSON.parse(e.postData.contents);

    if (body.secret !== SECRET) {
      return json({ ok: false, error: 'unauthorized' }, 401);
    }

    const type = body.type;
    const p = body.payload || {};

    switch (type) {
      case 'order.created': return json(handleOrderCreated(p));
      case 'order.updated': return json(handleOrderUpdated(p));
      case 'lead.captured': return json(handleLead(p));
      case 'message.received': return json(handleMessage(p));
      default: return json({ ok: false, error: 'unknown_type: ' + type }, 400);
    }
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: String(err) }, 500);
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function doGet() {
  // Lets you confirm the deployment is live by opening the URL in a browser.
  return json({ ok: true, service: 'osool-sheets-webhook', version: 1 });
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

function handleOrderCreated(p) {
  const sheet = tab(TAB_ORDERS);

  // Idempotency: never append the same order twice.
  const existing = findRowByOrderId(sheet, p.order_id);
  if (existing > 0) {
    writeOrderRow(sheet, existing, p, { preserveAgentFields: true });
    return { ok: true, action: 'updated_existing', row: existing };
  }

  const row = sheet.getLastRow() + 1;
  writeOrderRow(sheet, row, p, { preserveAgentFields: false });
  return { ok: true, action: 'created', row: row };
}

function handleOrderUpdated(p) {
  const sheet = tab(TAB_ORDERS);
  const row = findRowByOrderId(sheet, p.order_id);

  if (row < 0) {
    // The create webhook must have failed. Append rather than lose the order,
    // and flag it so it is visible in the sheet.
    const appended = sheet.getLastRow() + 1;
    p.risk_flag = (p.risk_flag ? p.risk_flag + ',' : '') + 'sheet_out_of_order';
    writeOrderRow(sheet, appended, p, { preserveAgentFields: false });
    return { ok: true, action: 'appended_missing', row: appended };
  }

  writeOrderRow(sheet, row, p, { preserveAgentFields: true });
  return { ok: true, action: 'updated', row: row };
}

/**
 * Writes an order row.
 * preserveAgentFields keeps whatever the confirmation team has typed into
 * Status / Notes / City / Address / Confirmed / Delivered, so a webhook
 * update can never wipe their work.
 */
function writeOrderRow(sheet, row, p, opts) {
  const preserve = opts && opts.preserveAgentFields;
  const current = preserve
    ? sheet.getRange(row, 1, 1, ORDERS_WIDTH).getValues()[0]
    : new Array(ORDERS_WIDTH).fill('');

  const get = (col, incoming) => {
    const existing = current[col - 1];
    if (preserve && existing !== '' && existing !== null) return existing;
    return incoming === null || incoming === undefined ? '' : incoming;
  };

  const values = new Array(ORDERS_WIDTH).fill('');

  values[COL.createdAt - 1]   = formatDate(p.created_at);
  values[COL.orderNumber - 1] = p.order_number || '';
  values[COL.name - 1]        = p.customer_name || '';
  values[COL.phone - 1]       = "'" + (p.phone_display || '');  // leading ' forces text, keeps the 0
  values[COL.whatsapp - 1]    = waFormula(p.phone_e164, p.order_number);
  values[COL.items - 1]       = p.items_summary || '';
  values[COL.units - 1]       = p.total_units || 0;
  values[COL.total - 1]       = p.total_sar || 0;
  values[COL.upsell - 1]      = p.upsell_status || '';
  values[COL.status - 1]      = get(COL.status, p.status || 'جديد');
  values[COL.notes - 1]       = get(COL.notes, '');
  values[COL.city - 1]        = get(COL.city, '');
  values[COL.address - 1]     = get(COL.address, '');
  values[COL.confirmedAt - 1] = get(COL.confirmedAt, '');
  values[COL.deliveredAt - 1] = get(COL.deliveredAt, '');
  values[COL.utmSource - 1]   = p.utm_source || '';
  values[COL.utmCampaign - 1] = p.utm_campaign || '';
  values[COL.utmContent - 1]  = p.utm_content || '';
  values[COL.riskFlag - 1]    = p.risk_flag || '';
  values[COL.orderId - 1]     = p.order_id || '';

  sheet.getRange(row, 1, 1, ORDERS_WIDTH).setValues([values]);

  if (p.risk_flag) {
    sheet.getRange(row, COL.riskFlag).setBackground('#FBEEEB').setFontColor('#B3402F');
  }
}

function findRowByOrderId(sheet, orderId) {
  if (!orderId) return -1;
  const last = sheet.getLastRow();
  if (last < 2) return -1;

  const ids = sheet.getRange(2, COL.orderId, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(orderId)) return i + 2;
  }
  return -1;
}

/* ------------------------------------------------------------------ */
/* Leads                                                               */
/* ------------------------------------------------------------------ */

function handleLead(p) {
  const sheet = tab(TAB_LEADS);
  const last = sheet.getLastRow();

  // Update the most recent matching lead for this phone instead of appending
  // a new row on every debounced keystroke.
  if (last >= 2) {
    const phones = sheet.getRange(2, 3, last - 1, 1).getValues();
    for (let i = phones.length - 1; i >= 0; i--) {
      if (String(phones[i][0]).replace(/^'/, '') === String(p.phone_display)) {
        writeLeadRow(sheet, i + 2, p);
        return { ok: true, action: 'updated', row: i + 2 };
      }
    }
  }

  const row = last + 1;
  writeLeadRow(sheet, row, p);
  return { ok: true, action: 'created', row: row };
}

function writeLeadRow(sheet, row, p) {
  const existingStatus = sheet.getRange(row, 9).getValue();
  sheet.getRange(row, 1, 1, 10).setValues([[
    formatDate(p.created_at),
    p.customer_name || '',
    "'" + (p.phone_display || ''),
    waFormula(p.phone_e164, null),
    p.cart_summary || '',
    p.cart_value_sar || 0,
    p.utm_source || '',
    p.utm_campaign || '',
    existingStatus || 'جديد',
    p.lead_id || '',
  ]]);
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

function handleMessage(p) {
  const sheet = tab(TAB_MESSAGES);
  const row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, 7).setValues([[
    formatDate(p.created_at),
    p.name || '',
    "'" + (p.phone_display || ''),
    waFormula(p.phone_e164, null),
    p.subject || '',
    p.message || '',
    false,
  ]]);
  return { ok: true, action: 'created', row: row };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function tab(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Missing tab: ' + name + ' — create it exactly as named.');
  return sheet;
}

function formatDate(iso) {
  const d = iso ? new Date(iso) : new Date();
  return Utilities.formatDate(d, TZ, 'yyyy-MM-dd HH:mm');
}

function waFormula(e164, orderNumber) {
  if (!e164) return '';
  const number = String(e164).replace(/\D/g, '');   // wa.me wants digits only
  const text = orderNumber
    ? encodeURIComponent('مرحباً، بخصوص طلبك رقم ' + orderNumber + ' من أصول')
    : encodeURIComponent('مرحباً من أصول');
  return '=HYPERLINK("https://wa.me/' + number + '?text=' + text + '";"واتساب")';
}

function json(obj, code) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  // Apps Script web apps always return 200; `ok:false` in the body signals failure.
  // The backend treats ok:false as a retryable error. (code is accepted for readability.)
}

/* ------------------------------------------------------------------ */
/* One-time setup helper — run manually from the Apps Script editor    */
/* ------------------------------------------------------------------ */

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TZ);

  const specs = [
    [TAB_ORDERS, ['التاريخ والوقت','رقم الطلب','الاسم','رقم الجوال','واتساب','المنتجات','عدد القطع','الإجمالي','العرض الإضافي','الحالة','ملاحظات','المدينة','العنوان','تاريخ التأكيد','تاريخ التوصيل','المصدر','الحملة','الإعلان','تنبيه','معرّف الطلب']],
    [TAB_LEADS, ['التاريخ','الاسم','رقم الجوال','واتساب','السلة','قيمة السلة','المصدر','الحملة','حالة المتابعة','معرّف']],
    [TAB_MESSAGES, ['التاريخ','الاسم','رقم الجوال','واتساب','الموضوع','الرسالة','تم الرد']],
  ];

  specs.forEach(function (spec) {
    const name = spec[0], headers = spec[1];
    let sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#14483C').setFontColor('#FBF8F3');
    sheet.setFrozenRows(1);
    sheet.setRightToLeft(true);
  });

  // Phone column as plain text so leading zeros survive
  const orders = ss.getSheetByName(TAB_ORDERS);
  orders.getRange('D2:D').setNumberFormat('@');
  orders.hideColumns(COL.orderId);

  // Status dropdown
  const statuses = ['جديد','مؤكد','مشحون','تم التوصيل','ما رد','ملغي','مرتجع'];
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(statuses, true).build();
  orders.getRange('J2:J').setDataValidation(rule);

  const leads = ss.getSheetByName(TAB_LEADS);
  leads.getRange('C2:C').setNumberFormat('@');
  const leadRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['جديد','تم التواصل','تحوّل لطلب','فقدنا'], true).build();
  leads.getRange('I2:I').setDataValidation(leadRule);

  const messages = ss.getSheetByName(TAB_MESSAGES);
  messages.getRange('C2:C').setNumberFormat('@');
  messages.getRange('G2:G').insertCheckboxes();
}
