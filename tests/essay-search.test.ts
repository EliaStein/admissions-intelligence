import { describe, it, expect } from 'vitest';
import { buildEssaySearchFilter } from '@/lib/essay-search';

describe('buildEssaySearchFilter', () => {
  it('builds an ilike OR filter across the four search columns', () => {
    const filter = buildEssaySearchFilter('smith');
    expect(filter).toBe(
      'student_first_name.ilike."%smith%",' +
        'student_last_name.ilike."%smith%",' +
        'student_email.ilike."%smith%",' +
        'student_college.ilike."%smith%"'
    );
  });

  it('quotes values so commas and parens cannot break out of the condition', () => {
    // A raw comma/paren would otherwise terminate the ilike value and inject a
    // new PostgREST condition. Quoting keeps it inside the value.
    const filter = buildEssaySearchFilter('a,b)');
    expect(filter).toContain('student_first_name.ilike."%a,b)%"');
    // No unescaped structural break: every column condition is still present.
    expect(filter.split('.ilike.').length - 1).toBe(4);
  });

  it('escapes embedded double quotes and backslashes', () => {
    expect(buildEssaySearchFilter('a"b')).toContain('ilike."%a\\"b%"');
    expect(buildEssaySearchFilter('a\\b')).toContain('ilike."%a\\\\b%"');
  });
});
