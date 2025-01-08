import { supabase } from '../lib/supabase';
import { Essay } from '../types/essay';
import { School, SchoolPrompt } from '../types/prompt';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';

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
      school_name: prompt.schools.name
    })) || [];
  },

  async saveEssay(essay: Essay): Promise<void> {
    // First save to Supabase
    const { error } = await supabase
      .from('essays')
      .insert(essay);
      
    if (error) {
      console.error('Error saving essay:', error.message);
      throw error;
    }

    // Then send email notification
    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: EMAILJS_CONFIG.TO_EMAIL,
          student_name: `${essay.student_first_name} ${essay.student_last_name}`,
          student_email: essay.student_email,
          college: essay.student_college || 'Personal Statement',
          prompt: essay.selected_prompt,
          essay_type: essay.personal_statement ? 'Personal Statement' : 'Supplemental Essay',
          essay_content: essay.essay_content,
          submission_date: new Date().toLocaleString()
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      );
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't throw here since the essay was saved successfully
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
