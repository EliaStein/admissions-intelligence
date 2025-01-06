import { supabase } from '../supabase';
import { Essay } from '../types/essay';
import { School, EssayPrompt } from '../types/prompt';

export const essayService = {
  async getSchools(): Promise<School[]> {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error('Error fetching schools:', error);
      return [];
    }
    
    return data || [];
  },

  async getPromptsBySchool(schoolId: string): Promise<EssayPrompt[]> {
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
      school_name: prompt.schools.name
    })) || [];
  },

  // Keep existing methods...
  async saveEssay(essay: Essay): Promise<void> {
    const { error } = await supabase
      .from('essays')
      .upsert(essay);
      
    if (error) {
      console.error('Error saving essay:', error);
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