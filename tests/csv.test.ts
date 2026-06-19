import { describe, it, expect } from 'vitest';
import { escapeCsvCell, toCsvRow, toCsv } from '@/utils/csv';

describe('escapeCsvCell', () => {
  it('passes through plain values', () => {
    expect(escapeCsvCell('Alice')).toBe('Alice');
    expect(escapeCsvCell(42)).toBe('42');
  });

  it('renders null/undefined as empty', () => {
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(undefined)).toBe('');
  });

  it('quotes values containing commas, quotes, or newlines', () => {
    expect(escapeCsvCell('Doe, John')).toBe('"Doe, John"');
    expect(escapeCsvCell('a"b')).toBe('"a""b"');
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"');
  });

  it('neutralizes formula injection by prefixing a quote', () => {
    expect(escapeCsvCell('=1+1')).toBe("'=1+1");
    expect(escapeCsvCell('+SUM(A1)')).toBe("'+SUM(A1)");
    expect(escapeCsvCell('-2')).toBe("'-2");
    expect(escapeCsvCell('@cmd')).toBe("'@cmd");
  });

  it('both neutralizes a formula and quotes when structure chars are present', () => {
    // leading = triggers the quote prefix; the comma forces CSV quoting
    expect(escapeCsvCell('=HYPERLINK("x"),y')).toBe('"\'=HYPERLINK(""x""),y"');
  });
});

describe('toCsvRow / toCsv', () => {
  it('joins escaped cells with commas', () => {
    expect(toCsvRow(['a', 'b,c', 1])).toBe('a,"b,c",1');
  });

  it('builds a full document with a header row', () => {
    const csv = toCsv(['Name', 'Note'], [['Alice', 'ok'], ['Bob', '=evil']]);
    expect(csv).toBe("Name,Note\nAlice,ok\nBob,'=evil");
  });
});
