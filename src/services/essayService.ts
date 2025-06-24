import { supabase } from '../lib/supabase';
import { Essay } from '../types/essay';
import { School, SchoolPrompt } from '../types/prompt';

export const essayService = {
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

    return data?.map(school => ({
      id: school.id,
      name: school.name,
      prompt_count: school.essay_prompts[0].count
    })) || [];
  },

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

    return data?.map(prompt => ({
      ...prompt,
      school_name: (prompt.schools as any)?.name || ''
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

      // Save essay via API endpoint
      const response = await fetch('/api/essays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to save essay');
      }

      const result = await response.json();
      console.log('Essay saved successfully:', result.message);
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
