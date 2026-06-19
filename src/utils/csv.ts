/**
 * CSV serialization helpers that are safe against both CSV structure breakage
 * and spreadsheet formula injection.
 *
 * - Any cell containing a comma, quote, or newline is wrapped in double quotes
 *   with embedded quotes doubled (RFC 4180).
 * - Any cell whose text begins with a formula trigger (= + - @, or a leading
 *   tab/CR) is prefixed with a single quote so spreadsheet apps treat it as
 *   text rather than executing it.
 */

const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

export function escapeCsvCell(value: unknown): string {
  let cell = value === null || value === undefined ? '' : String(value);

  // Neutralize spreadsheet formula injection.
  if (cell.length > 0 && FORMULA_TRIGGERS.includes(cell[0])) {
    cell = `'${cell}`;
  }

  // Quote when the cell contains characters that would break CSV structure.
  if (/[",\n\r]/.test(cell)) {
    cell = `"${cell.replace(/"/g, '""')}"`;
  }

  return cell;
}

export function toCsvRow(cells: unknown[]): string {
  return cells.map(escapeCsvCell).join(',');
}

export function toCsv(headers: unknown[], rows: unknown[][]): string {
  return [toCsvRow(headers), ...rows.map(toCsvRow)].join('\n');
}
