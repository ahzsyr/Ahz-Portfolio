/**
 * Import date parsing: YYYY-MM, YYYY-MM-DD, ISO → Date (UTC midnight).
 */

/**
 * @param {unknown} value
 * @returns {Date|null}
 */
export function parseImportDate(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const d = new Date(value);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  // YYYY-MM → first of month UTC
  const ym = /^(\d{4})-(\d{2})$/.exec(raw);
  if (ym) {
    const year = Number(ym[1]);
    const month = Number(ym[2]);
    if (month < 1 || month > 12) return null;
    return new Date(Date.UTC(year, month - 1, 1));
  }

  // YYYY-MM-DD
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]);
    const day = Number(ymd[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const d = new Date(Date.UTC(year, month - 1, day));
    if (
      d.getUTCFullYear() !== year ||
      d.getUTCMonth() !== month - 1 ||
      d.getUTCDate() !== day
    ) {
      return null;
    }
    return d;
  }

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
