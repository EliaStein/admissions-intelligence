import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { crmEssayPromptsForSchools, latestCycleRealPromptsBySchool } from '@/lib/crmClient';
import { decodeSchoolId } from '@/lib/schoolId';
import type { SchoolPrompt } from '@/types/prompt';

interface LocalPromptRow {
  id: string;
  school_id: string;
  prompt: string;
  word_count: string;
  schools: { name: string } | null;
}

async function fetchCrmPrompts(crmId: string, schoolName: string): Promise<SchoolPrompt[]> {
  const rows = latestCycleRealPromptsBySchool(await crmEssayPromptsForSchools([crmId]));
  return rows.map((r) => ({
    id: r.id,
    school_id: crmId,
    school_name: schoolName,
    prompt: r.prompt,
    // Preserve null. The CRM uses NULL for "the school states no word limit";
    // coercing that to 0 previously made the prompt unsubmittable, since the
    // wizard's guard reads 0 as "zero words allowed".
    word_count: r.word_limit,
    min_word_count: r.min_word_count,
    source: 'crm',
    groupKey: r.group_key,
    groupLabel: r.group_label,
    selectCount: r.select_count,
    isRequired: r.is_required,
  }));
}

async function fetchLocalPrompts(localId: string, schoolName: string): Promise<SchoolPrompt[]> {
  const { data, error } = await supabase
    .from('essay_prompts')
    .select('id, school_id, prompt, word_count, schools ( name )')
    .eq('school_id', localId);

  if (error) {
    console.error('[schools/essays] local fetch error:', error);
    return [];
  }

  return ((data as unknown as LocalPromptRow[] | null) ?? []).map((p) => ({
    id: p.id,
    school_id: p.school_id,
    school_name: p.schools?.name || schoolName,
    prompt: p.prompt,
    // Legacy free-text column: values range from "650" to "100 characters" to
    // "Not specified". Take the leading number when there is one, else null
    // ("no stated limit") — never 0, which would block submission entirely.
    word_count: Number.isFinite(parseInt(p.word_count, 10)) ? parseInt(p.word_count, 10) : null,
    min_word_count: null,
    source: 'local',
    groupKey: null,
    groupLabel: null,
    selectCount: 1,
    isRequired: true,
  }));
}

// Essay prompts for one school, keyed by the composite id from GET
// /api/schools. Fetches both the CRM and this app's own (legacy) table when
// the school exists in both, and returns whichever currently has more
// prompts — never fewer than what was already available locally before this
// change. CRM wins ties, since it's the intended long-term source of truth.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const schoolId = params.get('schoolId');
  const schoolName = params.get('schoolName') ?? '';
  if (!schoolId) {
    return NextResponse.json({ error: 'schoolId is required' }, { status: 400 });
  }

  const { crmId, localId } = decodeSchoolId(schoolId);
  const [crmPrompts, localPrompts] = await Promise.all([
    crmId ? fetchCrmPrompts(crmId, schoolName) : Promise.resolve([] as SchoolPrompt[]),
    localId ? fetchLocalPrompts(localId, schoolName) : Promise.resolve([] as SchoolPrompt[]),
  ]);

  const prompts = crmPrompts.length >= localPrompts.length ? crmPrompts : localPrompts;

  return NextResponse.json(prompts);
}
