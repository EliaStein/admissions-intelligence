import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { crmEssayPromptsForSchools, latestCycleRealPrompts } from '@/lib/crmClient';
import { decodeSchoolId } from '@/lib/schoolId';
import type { SchoolPrompt } from '@/types/prompt';

interface LocalPromptRow {
  id: string;
  school_id: string;
  prompt: string;
  word_count: string;
  schools: { name: string } | null;
}

// Essay prompts for one school, keyed by the composite id from GET
// /api/schools. Tries the CRM first (current cycle, real prompts only);
// falls back to this app's own table only when the CRM has nothing for the
// school yet, so a school that hasn't been researched in the CRM doesn't
// silently lose its existing prompts here.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const schoolId = params.get('schoolId');
  const schoolName = params.get('schoolName') ?? '';
  if (!schoolId) {
    return NextResponse.json({ error: 'schoolId is required' }, { status: 400 });
  }

  const { crmId, localId } = decodeSchoolId(schoolId);
  let prompts: SchoolPrompt[] = [];

  if (crmId) {
    const rows = latestCycleRealPrompts(await crmEssayPromptsForSchools([crmId]));
    prompts = rows.map((r) => ({
      id: r.id,
      school_id: crmId,
      school_name: schoolName,
      prompt: r.prompt,
      word_count: r.word_limit ?? 0,
      source: 'crm',
      groupKey: r.group_key,
      groupLabel: r.group_label,
      selectCount: r.select_count,
      isRequired: r.is_required,
    }));
  }

  if (prompts.length === 0 && localId) {
    const { data, error } = await supabase
      .from('essay_prompts')
      .select('id, school_id, prompt, word_count, schools ( name )')
      .eq('school_id', localId);

    if (error) {
      console.error('[schools/essays] local fallback error:', error);
    } else {
      prompts = ((data as unknown as LocalPromptRow[] | null) ?? []).map((p) => ({
        id: p.id,
        school_id: p.school_id,
        school_name: p.schools?.name || schoolName,
        prompt: p.prompt,
        word_count: parseInt(p.word_count, 10) || 0,
        source: 'local',
        groupKey: null,
        groupLabel: null,
        selectCount: 1,
        isRequired: true,
      }));
    }
  }

  return NextResponse.json(prompts);
}
