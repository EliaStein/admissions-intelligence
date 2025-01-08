import { supabase } from '../lib/supabase';
import { parseSchoolsCSV } from '../utils/csvParser';
import type { Database } from '../types/supabase';

type School = Database['public']['Tables']['schools']['Row'];
type SchoolInsert = Database['public']['Tables']['schools']['Insert'];
type EssayPromptInsert = Database['public']['Tables']['essay_prompts']['Insert'];

interface UploadResult {
  success: boolean;
  schoolsAdded: number;
  promptsAdded: number;
  errors: string[];
}

export const uploadService = {
  async uploadCSV(file: File): Promise<UploadResult> {
    const result: UploadResult = {
      success: false,
      schoolsAdded: 0,
      promptsAdded: 0,
      errors: []
    };

    try {
      // First check if we're authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        result.errors.push('You must be logged in to upload data');
        return result;
      }

      const parsed = await parseSchoolsCSV(file);
      result.errors.push(...parsed.errors);

      if (parsed.errors.length > 0) {
        return result;
      }

      // Insert schools and collect their IDs
      const schoolMap = new Map<string, string>();
      
      for (const [schoolName, schoolData] of parsed.schools) {
        const { data: school, error } = await supabase
          .from('schools')
          .upsert({ name: schoolName })
          .select()
          .single();

        if (error) {
          result.errors.push(`Failed to add school ${schoolName}: ${error.message}`);
          continue;
        }

        schoolMap.set(schoolName, school.id);
        result.schoolsAdded++;
      }

      // Insert prompts with corresponding school IDs
      const prompts = parsed.prompts.map(prompt => ({
        ...prompt,
        school_id: schoolMap.get(prompt.school_id)
      }));

      const { error: promptError } = await supabase
        .from('essay_prompts')
        .upsert(prompts);

      if (promptError) {
        result.errors.push(`Failed to add prompts: ${promptError.message}`);
      } else {
        result.promptsAdded = prompts.length;
      }

      result.success = result.errors.length === 0;
    } catch (error) {
      result.errors.push(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }
};
