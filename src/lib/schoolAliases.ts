// Copied from the CRM's lib/schools/aliases.ts (no shared package between the
// two repos, so this is a manual sync — keep it in step with that file).
//
// Used here to merge the CRM's school catalog with this app's own by name
// when the two store the same school differently (CRM has "USC", this app
// has "University of Southern California"; CRM has "SMU", this app has
// "Southern Methodist University"; etc). A plain case-insensitive match
// misses all of these because the two forms share no substring — confirmed
// against production data as of 2026-08, where a naive match silently
// treated the CRM's "USC" and this app's "University of Southern
// California" as two different, unrelated schools instead of merging them.
//
// Known gap: this list isn't exhaustive. "CU Boulder" (here) vs. "University
// of Colorado Boulder" (CRM) and "Wheaton College (MA)" (here) vs. "Wheaton
// College" (CRM) aren't covered — they'll show as separate, unmerged entries
// until added to the CRM's alias list (in which case they'd need to be added
// here too) or reconciled directly in the data.

export interface SchoolAlias {
  db: string;
  also: string[];
}

export const SCHOOL_ALIASES: SchoolAlias[] = [
  { db: 'NYU', also: ['New York University'] },
  { db: 'USC', also: ['University of Southern California'] },
  { db: 'UCLA', also: ['University of California, Los Angeles', 'University of California Los Angeles'] },
  { db: 'MIT', also: ['Massachusetts Institute of Technology'] },
  { db: 'UNC Chapel Hill', also: ['University of North Carolina', 'University of North Carolina at Chapel Hill', 'UNC'] },
  { db: 'UC Berkeley', also: ['University of California, Berkeley', 'University of California Berkeley', 'UCB'] },
  { db: 'UC Davis', also: ['University of California, Davis', 'University of California Davis', 'UCD'] },
  { db: 'UC Irvine', also: ['University of California, Irvine', 'University of California Irvine', 'UCI'] },
  { db: 'UC San Diego', also: ['University of California, San Diego', 'University of California San Diego', 'UCSD'] },
  { db: 'UC Santa Barbara', also: ['University of California, Santa Barbara', 'University of California Santa Barbara', 'UCSB'] },
  { db: 'Georgia Tech', also: ['Georgia Institute of Technology'] },
  { db: 'Virginia Tech', also: ['Virginia Polytechnic Institute', 'Virginia Polytechnic Institute and State University'] },
  { db: 'NC State', also: ['North Carolina State University', 'NCSU'] },
  { db: 'SMU', also: ['Southern Methodist University'] },
  { db: 'TCU', also: ['Texas Christian University'] },
  { db: 'Penn State', also: ['Pennsylvania State University'] },
  { db: 'University of Pennsylvania', also: ['UPenn'] },
  { db: 'University of Illinois Urbana-Champaign', also: ['UIUC'] },
  { db: 'University of Michigan', also: ['UMich'] },
  { db: 'University of Wisconsin-Madison', also: ['UW-Madison', 'UW Madison'] },
  { db: 'University of Texas at Austin', also: ['UT Austin'] },
  { db: 'Carnegie Mellon University', also: ['CMU'] },
  { db: 'Johns Hopkins University', also: ['JHU'] },
  { db: 'Rensselaer Polytechnic Institute', also: ['RPI'] },
  { db: 'Worcester Polytechnic Institute', also: ['WPI'] },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[-–—]/g, ' ') // "Wisconsin - Madison" and "Wisconsin-Madison" must compare equal
    .replace(/\s+/g, ' ')
    .replace(/^the /, '')
    .replace(/^university of /, '')
    .replace(/^university /, '');
}

function related(a: string, b: string): boolean {
  if (a.length < 2 || b.length < 2) return false;
  return a === b || a.startsWith(b) || b.startsWith(a);
}

/**
 * A stable key two differently-spelled names for the same school both
 * resolve to — the alias group's canonical name if one matches, otherwise
 * the name's own normalized form.
 */
export function canonicalSchoolKey(name: string): string {
  const normalized = normalize(name);
  for (const group of SCHOOL_ALIASES) {
    const forms = [group.db, ...group.also].map(normalize);
    if (forms.some((form) => related(form, normalized))) return normalize(group.db);
  }
  return normalized;
}
