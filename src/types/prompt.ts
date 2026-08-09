export interface School {
  id: string;
  name: string;
}

export interface BasePrompt {
  id: string;
  prompt: string;
  // null = the school states no word limit for this prompt. Distinct from 0,
  // which would mean "zero words allowed" — see formatWordLimit / the submit
  // guard in EssayWizard, both of which must treat null as "no cap".
  word_count: number | null;
  min_word_count?: number | null;
}

export type PromptSource = 'crm' | 'local';

export interface SchoolPrompt extends BasePrompt {
  school_id: string;
  school_name?: string;
  // Which backend this row came from — 'crm' is the CRM's essay_prompts
  // table (the shared source of truth); 'local' is this app's own table,
  // used only as a fallback when the CRM has fewer prompts for the school.
  source: PromptSource;
  // Choice-set metadata ("choose 2 of 4") — always present for 'crm' rows,
  // defaulted to a standalone-required set of one for 'local' rows, which
  // predate this concept.
  groupKey: string | null;
  groupLabel: string | null;
  selectCount: number;
  isRequired: boolean;
}

export type EssayPrompt = BasePrompt | SchoolPrompt;

/** "250–400 words" / "650 words" / "No stated word limit" */
export function formatWordLimit(p: { word_count: number | null; min_word_count?: number | null }): string {
  if (p.word_count == null) return 'No stated word limit';
  if (p.min_word_count != null && p.min_word_count > 0) {
    return `${p.min_word_count}–${p.word_count} words`;
  }
  return `${p.word_count} words`;
}

/**
 * Hard cap the submit guard enforces, or null when the submission is uncapped.
 * Personal statements are always capped at 1000; supplementals get twice the
 * school's stated limit, and are uncapped when no limit is stated.
 *
 * Pure and exported specifically so the null case stays covered by tests — a
 * `?? 0` here previously made every no-stated-limit prompt unsubmittable.
 */
export function submissionWordCap(
  prompt: { word_count: number | null },
  essayType: 'personal' | 'supplemental'
): number | null {
  if (essayType === 'personal') return 1000;
  return prompt.word_count == null ? null : prompt.word_count * 2;
}
