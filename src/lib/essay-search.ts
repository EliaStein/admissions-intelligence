/**
 * Builds the PostgREST `.or()` filter for the admin essay search.
 *
 * The raw search term is user-controlled and is interpolated into PostgREST's
 * filter grammar, where `,` `(` `)` `.` are structural. Quoting each value and
 * escaping the quote/backslash characters keeps the term from breaking out of
 * its `ilike` condition and altering the query (PostgREST filter injection).
 */

const SEARCH_COLUMNS = [
  'student_first_name',
  'student_last_name',
  'student_email',
  'student_college',
] as const;

export function buildEssaySearchFilter(search: string): string {
  // Escape backslash and double-quote so the value can be safely wrapped in
  // PostgREST double quotes; the wrapping neutralizes structural characters.
  const escaped = search.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return SEARCH_COLUMNS.map((col) => `${col}.ilike."%${escaped}%"`).join(',');
}
