import 'server-only';

// Reads the CRM's public reference-data endpoints (schools + essay_prompts —
// no auth, no user data; see app/api/schools/{search,essays}/route.ts in the
// CRM repo). Server-side only: never call this from a 'use client' component.

const CRM_API_BASE_URL = process.env.CRM_API_BASE_URL;

// Must match NO_SUPPLEMENT_GROUP in the CRM's lib/essays/grouping.ts — a
// sentinel row meaning "confirmed: no supplement," not a real prompt.
const NO_SUPPLEMENT_GROUP = '__none__';

export interface CrmSchool {
  id: string;
  name: string;
}

export interface CrmEssayPrompt {
  id: string;
  school_id: string | null;
  prompt_type: 'common_app_main' | 'school_supplement';
  prompt: string;
  word_limit: number | null;
  min_word_count: number | null;
  application_cycle: string;
  group_key: string | null;
  group_label: string | null;
  select_count: number;
  is_required: boolean;
}

async function crmFetch<T>(path: string): Promise<T | null> {
  if (!CRM_API_BASE_URL) return null;
  try {
    const res = await fetch(`${CRM_API_BASE_URL}${path}`, { next: { revalidate: 300 } });
    if (!res.ok) {
      console.error(`[crmClient] ${path} -> ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[crmClient] ${path} failed:`, err);
    return null;
  }
}

/** Full school catalog (bounded), or a name search when `query` is given. */
export async function crmListSchools(query?: string): Promise<CrmSchool[]> {
  const params = new URLSearchParams({ limit: '500' });
  if (query) params.set('q', query);
  return (await crmFetch<CrmSchool[]>(`/api/schools/search?${params}`)) ?? [];
}

/** Raw supplement rows for the given CRM school ids, across all cycles (batched in groups of 100 per the CRM's own cap). */
export async function crmEssayPromptsForSchools(schoolIds: string[]): Promise<CrmEssayPrompt[]> {
  if (schoolIds.length === 0) return [];
  const batches: string[][] = [];
  for (let i = 0; i < schoolIds.length; i += 100) batches.push(schoolIds.slice(i, i + 100));

  const results = await Promise.all(
    batches.map((batch) => crmFetch<CrmEssayPrompt[]>(`/api/schools/essays?ids=${batch.join(',')}`))
  );
  return results.flatMap((r) => r ?? []);
}

/**
 * Keep only each school's OWN latest application_cycle (not one global
 * latest across every school) and drop "no supplement" marker rows. Cycles
 * roll out school-by-school, not all at once — verified against production
 * data as of 2026-08: Howard, Mount Holyoke, Pomona, Simpson, and USC were
 * all still on the prior cycle while most other schools had moved to the
 * current one. Computing one global "latest" instead of a per-school one
 * would have zeroed out their real prompt counts.
 */
export function latestCycleRealPromptsBySchool(rows: CrmEssayPrompt[]): CrmEssayPrompt[] {
  const bySchool = new Map<string, CrmEssayPrompt[]>();
  for (const r of rows) {
    if (!r.school_id) continue;
    const arr = bySchool.get(r.school_id);
    if (arr) arr.push(r);
    else bySchool.set(r.school_id, [r]);
  }

  const out: CrmEssayPrompt[] = [];
  for (const schoolRows of bySchool.values()) {
    let latest: string | null = null;
    for (const r of schoolRows) if (!latest || r.application_cycle > latest) latest = r.application_cycle;
    for (const r of schoolRows) {
      if (r.application_cycle === latest && r.group_key !== NO_SUPPLEMENT_GROUP) out.push(r);
    }
  }
  return out;
}
