export interface School {
  id: string;
  name: string;
}

export interface BasePrompt {
  id: string;
  prompt: string;
  word_count: number;
}

export type PromptSource = 'crm' | 'local';

export interface SchoolPrompt extends BasePrompt {
  school_id: string;
  school_name?: string;
  // Which backend this row came from — 'crm' is the CRM's essay_prompts
  // table (the shared source of truth); 'local' is this app's own table,
  // used only as a fallback when the CRM has nothing for the school yet.
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
