import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { crmListSchools, crmEssayPromptsForSchools, latestCycleRealPrompts } from '@/lib/crmClient';
import { encodeSchoolId } from '@/lib/schoolId';

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
// with this app's own (legacy) schools table, de-duplicated by name. A
// school that exists in both keeps both ids (see lib/schoolId) so the essay
// lookup can fall back to the local table if the CRM has nothing for it yet.
export async function GET() {
  const [crmSchools, localResult] = await Promise.all([
    crmListSchools(),
    supabase
      .from('schools')
      .select('id, name, essay_prompts:essay_prompts(count)')
      .order('name'),
  ]);

  const crmPrompts = latestCycleRealPrompts(
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

  const byName = new Map<string, MergedSchool>();

  for (const s of crmSchools) {
    const key = s.name.trim().toLowerCase();
    byName.set(key, { name: s.name, crmId: s.id, crmCount: crmCountBySchoolId.get(s.id) ?? 0, localCount: 0 });
  }
  for (const s of localSchools) {
    const key = s.name.trim().toLowerCase();
    const existing = byName.get(key);
    if (existing) {
      existing.localId = s.id;
      existing.localCount = s.promptCount;
    } else {
      byName.set(key, { name: s.name, localId: s.id, crmCount: 0, localCount: s.promptCount });
    }
  }

  const merged = Array.from(byName.values())
    .map((s) => ({
      id: encodeSchoolId(s.crmId, s.localId),
      name: s.name,
      // Fallback rule: only trust the CRM's count when it actually has
      // prompts for this school; otherwise show the local count so schools
      // the CRM hasn't researched yet don't look empty.
      prompt_count: s.crmCount > 0 ? s.crmCount : s.localCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(merged);
}
