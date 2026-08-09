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

/** Common App main prompts (school_id is always null for these). */
export async function crmCommonAppPrompts(): Promise<CrmEssayPrompt[]> {
  return (await crmFetch<CrmEssayPrompt[]>('/api/schools/essays?type=common_app_main')) ?? [];
}

/** Keep only the latest application_cycle present, drop "no supplement" marker rows. */
export function latestCycleRealPrompts(rows: CrmEssayPrompt[]): CrmEssayPrompt[] {
  let latest: string | null = null;
  for (const r of rows) if (!latest || r.application_cycle > latest) latest = r.application_cycle;
  if (!latest) return [];
  return rows.filter((r) => r.application_cycle === latest && r.group_key !== NO_SUPPLEMENT_GROUP);
}
