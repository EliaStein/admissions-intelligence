export interface School {
    id: string;
    name: string;
  }
  
  export interface EssayPrompt {
    id: string;
    school_id: string;
    prompt: string;
    word_count: number;
    school_name: string;
  }