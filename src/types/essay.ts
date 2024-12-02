export interface EssayPrompt {
  prompt: string;
  wordCount: number | string;
}

export interface School {
  name: string;
  prompts: EssayPrompt[];
}

export interface ParsedSchoolData {
  schools: School[];
  errors: string[];
}
