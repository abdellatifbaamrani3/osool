// Column layout (1-based): date, orderid, country, name, phone, product,
// sku, quantity, total price, currency, status
var ROW_WIDTH = 11;
var STATUS_COL = 11; // K — filled by the confirmation team, never overwritten

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "empty_body" });
    }

    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const orderId = String(data.orderid || "");

    const rowValues = [
      data.date || "",
      orderId,
      data.country || "KSA",
      data.name || "",
      data.phone || "",
      data.product || "",
      data.sku || "",
      data.quantity || "",
      data["total price"] || "",
      data.currency || "SAR",
      "",
    ];

    const existingRow = findOrderRow(sheet, orderId);
    if (existingRow > 0) {
      // Preserve the agent-entered status (column K) so an upsell update
      // never wipes what the confirmation team has already typed.
      const currentStatus = sheet
        .getRange(existingRow, STATUS_COL)
        .getValue();
      rowValues[STATUS_COL - 1] = currentStatus;
      sheet.getRange(existingRow, 1, 1, ROW_WIDTH).setValues([rowValues]);
      return jsonResponse({ ok: true, action: "updated", row: existingRow });
    }

    sheet.appendRow(rowValues);
    return jsonResponse({ ok: true, action: "created" });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  } finally {
    try {
      lock.releaseLock();
    } catch (ignored) {}
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: "osool-google-sheets-webhook" });
}

function findOrderRow(sheet, orderId) {
  if (!orderId) return -1;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i += 1) {
    if (String(values[i][0]) === orderId) {
      return i + 2;
    }
  }

  return -1;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
