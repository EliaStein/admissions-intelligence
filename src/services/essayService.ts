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

  async saveEssay(essay: Essay, auth0UserId: string): Promise<void> {
    // Get the profile ID for the Auth0 user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth0_user_id', auth0UserId)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // Save the essay with the profile ID
    const { error } = await supabase
      .from('essays')
      .insert({
        profile_id: profile.id,
        school_id: essay.student_college ? essay.student_college : null,
        prompt: essay.selected_prompt,
        essay_content: essay.essay_content,
        word_count: essay.essay_content.trim().split(/\s+/).length,
        is_personal_statement: essay.personal_statement,
        feedback_status: 'pending'
      });
      
    if (error) {
      console.error('Error saving essay:', error.message);
      throw error;
    }

    // Send email notification
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

  async getUserEssays(auth0UserId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth0_user_id', auth0UserId)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    const { data: essays, error } = await supabase
      .from('essays')
      .select(`
        *,
        schools (
          name
        )
      `)
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return essays;
  }
};
