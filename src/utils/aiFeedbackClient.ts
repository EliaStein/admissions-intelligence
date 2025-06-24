import { Essay } from '../types/essay';
import { AiFeedbackRequest, AiFeedbackResponse } from '../types/aiService';

// Legacy interface for backward compatibility
interface LegacyAiFeedbackRequest {
  essay: Essay;
  user_info?: {
    user_id?: string;
    email?: string;
    [key: string]: any;
  };
}

interface AiFeedbackError {
  error: string;
  message?: string;
}

export async function submitEssayForFeedback(
  essay: Essay,
  wordCount: number,
  userInfo?: LegacyAiFeedbackRequest['user_info'],
): Promise<AiFeedbackResponse> {
  try {
    const requestBody: AiFeedbackRequest = {
      essay: {
        id: essay.id,
        student_first_name: essay.student_first_name,
        student_last_name: essay.student_last_name,
        student_email: essay.student_email,
        student_college: essay.student_college,
        selected_prompt: essay.selected_prompt,
        personal_statement: essay.personal_statement,
        essay_content: essay.essay_content,
        created_at: essay.created_at,
        word_count: wordCount,
      },
      ...(userInfo && { user_info: userInfo })
    };

    const response = await fetch('/api/ai-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData: AiFeedbackError = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to submit essay for feedback');
    }

    const data: AiFeedbackResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting essay for AI feedback:', error);
    throw error;
  }
}
