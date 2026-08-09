import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { crmListSchools, crmEssayPromptsForSchools, latestCycleRealPromptsBySchool } from '@/lib/crmClient';
import { encodeSchoolId } from '@/lib/schoolId';
import { canonicalSchoolKey } from '@/lib/schoolAliases';

interface LocalSchoolRow {
  id: string;
  name: string;
  essay_prompts: { count: number }[];
}

interface MergedSchool {
  name: string;
  crmId?: string;
  localId?: string;
  crmCount: number;
  localCount: number;
}

// Full school list for the "pick a school" step. Merges the CRM's catalog
// with this app's own (legacy) schools table, de-duplicated by canonical
// name (see lib/schoolAliases — a plain string match misses e.g. the CRM's
// "USC" vs. this app's "University of Southern California"). A school that
// exists in both keeps both ids (see lib/schoolId) so the essay lookup can
// fall back to the local table if the CRM currently has fewer prompts for it.
export async function GET() {
  const [crmSchools, localResult] = await Promise.all([
    crmListSchools(),
    supabase
      .from('schools')
      .select('id, name, essay_prompts:essay_prompts(count)')
      .order('name'),
  ]);

  const crmPrompts = latestCycleRealPromptsBySchool(
    await crmEssayPromptsForSchools(crmSchools.map((s) => s.id))
  );
  const crmCountBySchoolId = new Map<string, number>();
  for (const p of crmPrompts) {
    if (!p.school_id) continue;
    crmCountBySchoolId.set(p.school_id, (crmCountBySchoolId.get(p.school_id) ?? 0) + 1);
  }

  const localSchools = ((localResult.data as unknown as LocalSchoolRow[] | null) ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    promptCount: s.essay_prompts[0]?.count ?? 0,
  }));

  const byKey = new Map<string, MergedSchool>();

  for (const s of crmSchools) {
    byKey.set(canonicalSchoolKey(s.name), {
      name: s.name,
      crmId: s.id,
      crmCount: crmCountBySchoolId.get(s.id) ?? 0,
      localCount: 0,
    });
  }
  for (const s of localSchools) {
    const key = canonicalSchoolKey(s.name);
    const existing = byKey.get(key);
    if (existing) {
      existing.localId = s.id;
      existing.localCount = s.promptCount;
    } else {
      byKey.set(key, { name: s.name, localId: s.id, crmCount: 0, localCount: s.promptCount });
    }
  }

  const merged = Array.from(byKey.values())
    .map((s) => ({
      id: encodeSchoolId(s.crmId, s.localId),
      name: s.name,
      // Never show fewer prompts than were already available before this
      // change — show whichever source currently has more for this school.
      prompt_count: Math.max(s.crmCount, s.localCount),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(merged);
}
