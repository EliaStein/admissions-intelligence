import { getAdminClient } from '../lib/supabase-admin-client';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  submissionCount: number;
  message?: string;
}

export class EssayDuplicateDetectionService {
  private static readonly MAX_SUBMISSIONS_PER_MONTH = 5;

  public static async checkForDuplicate(
    studentEmail: string,
    isPersonalStatement: boolean
  ): Promise<DuplicateCheckResult> {
    if (!isPersonalStatement) {
      return { isDuplicate: false, submissionCount: 0 };
    }

    try {
      const supabaseAdmin = await getAdminClient();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { data: recentEssays, error } = await supabaseAdmin
        .from('essays')
        .select('essay_content, created_at')
        .eq('student_email', studentEmail)
        .eq('personal_statement', true)
        .gte('created_at', oneMonthAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recent essays:', error);
        return { isDuplicate: false, submissionCount: 0 };
      }

      if (!recentEssays || recentEssays.length === 0) {
        return { isDuplicate: false, submissionCount: 0 };
      }

      if (recentEssays.length >= this.MAX_SUBMISSIONS_PER_MONTH) {
        return {
          isDuplicate: true,
          submissionCount: recentEssays.length,
          message: this.getDuplicateMessage()
        };
      }

      return { isDuplicate: false, submissionCount: recentEssays.length };
    } catch (error) {
      console.error('Error in duplicate detection:', error);
      return { isDuplicate: false, submissionCount: 0 };
    }
  }

  private static getDuplicateMessage(): string {
    return `We've noticed multiple submissions for feedback on this same essay. We totally get it — crafting a strong personal statement takes work!

If you're looking for deeper guidance or feel stuck, we'd love to help you move forward.

**Let's schedule a quick call to talk through it**

Link: [Book a time](http://calendly.com/Zach-endeavorcollegecounseling)`;
  }
}
