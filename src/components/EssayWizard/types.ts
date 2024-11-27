export type EssayType = 'personal' | 'supplemental' | null;

export type School = {
  name: string;
  prompts: string[];
};

export type EssayPrompt = {
  text: string;
  maxWords?: number;
  maxChars?: number;
};

export type FormData = {
  essayType: EssayType;
  school: School | null;
  prompt: string;
  essayText: string;
  firstName: string;
  lastName: string;
  email: string;
};
