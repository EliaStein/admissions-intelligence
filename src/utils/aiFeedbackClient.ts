import { Essay } from '../types/essay';

interface AiFeedbackRequest {
  essay: Essay;
  user_info?: {
    user_id?: string;
    email?: string;
    [key: string]: any;
  };
}

interface AiFeedbackResponse {
  success: boolean;
  message: string;
  received_at: string;
  essay_id: string;
  word_count: number;
}

interface AiFeedbackError {
  error: string;
  message?: string;
}

export async function submitEssayForFeedback(
  essay: Essay,
  userInfo?: AiFeedbackRequest['user_info']
): Promise<AiFeedbackResponse> {
  try {
    const requestBody: AiFeedbackRequest = {
      essay,
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
