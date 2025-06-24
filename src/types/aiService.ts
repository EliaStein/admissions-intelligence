export interface AiFeedbackRequest {
  essay: {
    id?: string;
    student_first_name: string;
    student_last_name: string;
    student_email: string;
    student_college: string | null;
    selected_prompt: string;
    personal_statement: boolean;
    essay_content: string;
    word_count: number;
    created_at?: string;
  };
  user_info?: {
    user_id?: string;
    email?: string;
    [key: string]: unknown;
  };
}

export interface AiFeedbackResponse {
  success: boolean;
  message: string;
  feedback: string;
  essay_analysis: {
    word_count: number;
    character_count: number;
    essay_type: string;
    student_name: string;
    prompt: string;
  };
  generated_at: string;
  essay_id: string;
}