import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type School = Database['public']['Tables']['schools']['Row'];
type EssayPrompt = Database['public']['Tables']['essay_prompts']['Row'];

const SCHOOLS_PER_PAGE = 20;

export const schoolService = {
  async getSchools(page: number = 0) {
    const start = page * SCHOOLS_PER_PAGE;
    const end = start + SCHOOLS_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from('schools')
      .select('*', { count: 'exact' })
      .range(start, end)
      .order('name');

    if (error) throw error;

    return {
      schools: data as School[],
      total: count || 0,
      hasMore: (count || 0) > end + 1
    };
  },

  async getSchoolPrompts(schoolId: string) {
    const { data, error } = await supabase
      .from('essay_prompts')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at');

    if (error) throw error;
    return data as EssayPrompt[];
  },

  async searchSchools(query: string, page: number = 0) {
    const start = page * SCHOOLS_PER_PAGE;
    const end = start + SCHOOLS_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from('schools')
      .select('*', { count: 'exact' })
      .ilike('name', `%${query}%`)
      .range(start, end)
      .order('name');

    if (error) throw error;

    return {
      schools: data as School[],
      total: count || 0,
      hasMore: (count || 0) > end + 1
    };
  },

  subscribeToSchools(callback: (schools: School[]) => void) {
    return supabase
      .from('schools')
      .on('*', (payload) => {
        this.getSchools().then(({ schools }) => callback(schools));
      })
      .subscribe();
  }
};
