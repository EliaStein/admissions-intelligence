export interface Essay {
  id?: string;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  student_college: string | null;
  selected_prompt: string;
  personal_statement: boolean;
  essay_content: string;
  created_at?: string;
}

export interface School {
  id: string;
  name: string;
  prompt_count?: number;
}