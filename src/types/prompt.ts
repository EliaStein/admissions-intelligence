export interface School {
    id: string;
    name: string;
  }
  
  export interface BasePrompt {
    id: string;
    prompt: string;
    word_count: number;
  }
  
  export interface SchoolPrompt extends BasePrompt {
    school_id: string;
    school_name?: string;
  }
  
  export type EssayPrompt = BasePrompt | SchoolPrompt;