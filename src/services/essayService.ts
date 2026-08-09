import { supabase } from '../lib/supabase';
import { Essay } from '../types/essay';
import { School, SchoolPrompt } from '../types/prompt';

export const essayService = {
  // Backed by src/app/api/schools/route.ts, which merges the CRM's school
  // catalog with this app's own (legacy) table.
  async getSchools(): Promise<(School & { prompt_count: number })[]> {
    try {
      const response = await fetch('/api/schools');
      if (!response.ok) throw new Error(`Failed to fetch schools: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching schools:', error);
      return [];
    }
  },

  // Backed by src/app/api/schools/essays/route.ts, which reads from the CRM
  // and falls back to this app's own table if the CRM has nothing for the
  // school yet.
  async getPromptsBySchool(schoolId: string, schoolName: string): Promise<SchoolPrompt[]> {
    try {
      const params = new URLSearchParams({ schoolId, schoolName });
      const response = await fetch(`/api/schools/essays?${params}`);
      if (!response.ok) throw new Error(`Failed to fetch prompts: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }
  },

  async saveEssay(
    essay: Essay,
    wordCount?: number,
    userInfo?: { user_id?: string; email?: string;[key: string]: unknown }
  ): Promise<any> {
    try {
      const requestBody = {
        essay,
        ...(wordCount && { word_count: wordCount }),
        ...(userInfo && { user_info: userInfo })
      };

      // The API derives the user from this token; submissions require login.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('You must be signed in to submit an essay');
      }

      const response = await fetch('/api/essays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle duplicate submission error specially
        if (errorData.isDuplicate) {
          const duplicateError = new Error(errorData.message || 'Duplicate submission detected');
          (duplicateError as any).isDuplicate = true;
          (duplicateError as any).submissionCount = errorData.submissionCount;
          (duplicateError as any).duplicateMessage = errorData.message;
          throw duplicateError;
        }

        throw new Error(errorData.message || errorData.error || 'Failed to save essay');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error saving essay:', error);
      throw error;
    }
  },

  async deleteEssay(id: string): Promise<void> {
    const { error } = await supabase
      .from('essays')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting essay:', error);
    }
  }
};
