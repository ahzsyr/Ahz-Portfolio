/**
 * Minimal CSV parser — quoted fields, header row.
 * No external dependency.
 */

/**
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsvRows(text) {
  const input = String(text ?? "").replace(/^\uFEFF/, "");
  if (!input.trim()) return [];

  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  while (i < input.length) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }

  // last field / row
  if (field.length > 0 || row.length > 0 || input.endsWith(",")) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
}

/**
 * @param {string} text
 * @returns {{ headers: string[], records: Record<string, string>[] }}
 */
export function parseCsv(text) {
  const rows = parseCsvRows(text);
  if (!rows.length) return { headers: [], records: [] };

  const headers = rows[0].map((h) => String(h).trim());
  const records = rows.slice(1).map((cols) => {
    const rec = {};
    headers.forEach((h, idx) => {
      rec[h] = cols[idx] != null ? String(cols[idx]) : "";
    });
    return rec;
  });
  return { headers, records };
}

/**
 * Escape a CSV cell.
 * @param {unknown} value
 */
export function escapeCsvCell(value) {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * @param {string[]} headers
 * @param {Record<string, unknown>[]} records
 */
export function toCsv(headers, records) {
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const rec of records) {
    lines.push(headers.map((h) => escapeCsvCell(rec[h])).join(","));
  }
  return `${lines.join("\n")}\n`;
}
