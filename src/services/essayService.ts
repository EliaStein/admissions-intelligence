import { supabase } from '../lib/supabase';
import { Essay } from '../types/essay';
import { School, SchoolPrompt } from '../types/prompt';

export const essayService = {
  // TODO: move to backend
  async getSchools(): Promise<(School & { prompt_count: number })[]> {
    const { data, error } = await supabase
      .from('schools')
      .select(`
        id,
        name,
        essay_prompts:essay_prompts(count)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching schools:', error);
      return [];
    }

    type SchoolWithPrompts = { id: string; name: string; essay_prompts: { count: number }[] };
    return (data as unknown as SchoolWithPrompts[])?.map(school => ({
      id: school.id,
      name: school.name,
      prompt_count: school.essay_prompts[0].count
    })) || [];
  },

  // TODO: move to backend
  async getPromptsBySchool(schoolId: string): Promise<SchoolPrompt[]> {
    const { data, error } = await supabase
      .from('essay_prompts')
      .select(`
        id,
        school_id,
        prompt,
        word_count,
        schools (
          name
        )
      `)
      .eq('school_id', schoolId);

    if (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }

    type PromptWithSchool = { id: string; school_id: string; prompt: string; word_count: string; schools: { name: string } | null };
    return (data as unknown as PromptWithSchool[])?.map(prompt => ({
      id: prompt.id,
      school_id: prompt.school_id,
      prompt: prompt.prompt,
      word_count: parseInt(prompt.word_count, 10) || 0,
      school_name: prompt.schools?.name || ''
    })) || [];
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

      const response = await fetch('/api/essays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
