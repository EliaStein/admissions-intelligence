import OpenAI from 'openai';
import { CONFIG_KEYS, ConfigService } from './configService';
import { API_PERSONAL_STATEMENT_AND_RULES_PROMPT, CAPS_FEEDBACK_PROMPT, SUPPLEMENTAL_FEEDBACK_PROMPT } from '../prompts/aiService.prompt';
import { AiFeedbackRequest, AiFeedbackResponse } from '../types/aiService';

export class AIService {

  private static openaiClient: OpenAI | null = null;

  private static async getOpenAIClient(): Promise<OpenAI> {
    if (this.openaiClient) return this.openaiClient;

    const openAIKey = await ConfigService.getConfigValue(CONFIG_KEYS.OPEN_AI_KEY);
    if (!openAIKey) throw new Error('OpenAI API key not found in config table');

    return this.openaiClient = new OpenAI({
      apiKey: openAIKey,
    });
  }

  private static constructSystemPrompt(isPersonalStatement: boolean, maxWordCount: number): string {
    const feedbackPrompt = isPersonalStatement ? CAPS_FEEDBACK_PROMPT : SUPPLEMENTAL_FEEDBACK_PROMPT;
    return `${feedbackPrompt}\n\n${API_PERSONAL_STATEMENT_AND_RULES_PROMPT(maxWordCount)}`;
  }

  public static countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  public static async generateFeedback(
    essayPrompt: string,
    essayContent: string,
    isPersonalStatement: boolean,
    wordCount: number,
    maxWordCount: number
  ): Promise<string> {
    const openai = await this.getOpenAIClient();
    const systemPrompt = this.constructSystemPrompt(isPersonalStatement, maxWordCount);
    const userContent = `${essayPrompt}\n\n---\n\nessay content (word count = ${wordCount} words):\n${essayContent}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || "Unable to generate feedback at this time.";
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI feedback');
    }
  }

  public static validateEssayRequest(body: AiFeedbackRequest): { isValid: boolean; error?: string } {
    if (!body.essay) {
      return { isValid: false, error: 'Essay data is required' };
    }

    const { essay } = body;
    const requiredFields = [
      'student_first_name',
      'student_last_name',
      'student_email',
      'selected_prompt',
      'essay_content',
      'word_count'
    ];

    for (const field of requiredFields) {
      if (!essay[field as keyof typeof essay]) {
        return { isValid: false, error: `Missing required field: ${field}` };
      }
    }

    return { isValid: true };
  }

  public static async processAIFeedbackRequest(body: AiFeedbackRequest): Promise<AiFeedbackResponse> {
    const validation = this.validateEssayRequest(body);
    if (!validation.isValid) throw new Error(validation.error);

    const { essay, user_info } = body;
    const calculatedWordCount = this.countWords(essay.essay_content);

    console.log('=== AI Feedback Request Received ===');
    console.log('Essay Data:', {
      essay, user_info
    });

    console.log('=== Generating AI Feedback ===');
    const feedback = await this.generateFeedback(
      essay.selected_prompt,
      essay.essay_content,
      essay.personal_statement,
      calculatedWordCount,
      essay.word_count
    );

    console.log('AI feedback generated successfully');
    console.log('=== End AI Feedback Request ===\n');

    return {
      success: true,
      message: 'AI feedback generated successfully',
      feedback: feedback,
      essay_analysis: {
        word_count: calculatedWordCount,
        character_count: essay.essay_content.length,
        essay_type: essay.personal_statement ? 'Personal Statement' : 'Supplemental Essay',
        student_name: `${essay.student_first_name} ${essay.student_last_name}`,
        prompt: essay.selected_prompt
      },
      generated_at: new Date().toISOString(),
      essay_id: essay.id || 'pending'
    };
  }
}
