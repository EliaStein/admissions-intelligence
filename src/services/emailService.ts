import 'server-only';
import sgMail from '@sendgrid/mail';
import { marked } from 'marked';
import { ConfigService, CONFIG_KEYS } from './configService';

export interface EmailTemplateData {
  student_name: string;
  essay_type: string;
  feedback: string;
}

export class EmailService {
  private static isInitialized = false;

  private static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const apiKey = await ConfigService.getConfigValue(CONFIG_KEYS.SENDGRID_API_KEY);
    if (!apiKey) {
      throw new Error('SendGrid API key not found in configuration');
    }

    sgMail.setApiKey(apiKey);
    this.isInitialized = true;
  }

  public static async sendEssayFeedbackEmail(
    toEmail: string,
    studentName: string,
    essayType: string,
    feedback: string
  ): Promise<void> {
    try {
      await this.initialize();

      const templateId = await ConfigService.getConfigValue(CONFIG_KEYS.SENDGRID_TEMPLATE_ID);
      if (!templateId) {
        throw new Error('SendGrid template ID not found in configuration');
      }

      // Convert markdown feedback to HTML
      const feedbackHtml = await marked(feedback);

      const msg = {
        to: toEmail,
        from: 'info@admissionsintelligence.ai',
        templateId: templateId,
        dynamicTemplateData: {
          student_name: studentName,
          essay_type: essayType,
          feedback: feedbackHtml
        }
      };
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending essay feedback email:', error);
      console.error(JSON.stringify(error));
      throw new Error('Failed to send essay feedback email');
    }
  }

}
