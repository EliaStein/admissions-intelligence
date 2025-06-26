import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin-client';
import Papa from 'papaparse';

interface CSVRow {
  'School': string;
  'Prompt': string;
  'Word Count': string;
  'ID'?: string;
}

interface ExistingPrompt {
  id: string;
  school_id: string;
  prompt: string;
  word_count: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  schoolsProcessed?: number;
  promptsProcessed?: number;
  errors?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const supabase = await getAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as 'rewrite' | 'add';

    if (!file || !mode) {
      return NextResponse.json(
        { error: 'File and mode are required' },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const parseResult = Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'CSV parsing failed',
        errors: parseResult.errors.map(err => err.message),
      } as ImportResult);
    }

    const requiredHeaders = ['School', 'Prompt', 'Word Count'];
    const headers = parseResult.meta.fields || [];
    const missingHeaders = requiredHeaders.filter(header =>
      !headers.some(h => h.toLowerCase() === header.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required headers: ${missingHeaders.join(', ')}`,
      } as ImportResult);
    }

    const errors: string[] = [];
    let schoolsProcessed = 0;
    let promptsProcessed = 0;

    // Fetch all existing schools and essay prompts upfront
    const { data: existingSchools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name');

    if (schoolsError) {
      return NextResponse.json({
        success: false,
        message: `Failed to fetch existing schools: ${schoolsError.message}`,
      } as ImportResult, { status: 500 });
    }

    const { data: existingPrompts, error: promptsError } = await supabase
      .from('essay_prompts')
      .select('id, school_id, prompt, word_count');

    if (promptsError) {
      return NextResponse.json({
        success: false,
        message: `Failed to fetch existing prompts: ${promptsError.message}`,
      } as ImportResult, { status: 500 });
    }

    // Create maps for quick lookups
    const schoolsMap = new Map<string, string>(); // name -> id
    const existingPromptsMap = new Map<string, ExistingPrompt>(); // id -> prompt data

    existingSchools?.forEach(school => {
      schoolsMap.set(school.name, school.id);
    });

    existingPrompts?.forEach(prompt => {
      existingPromptsMap.set(prompt.id, prompt);
    });

    // Prepare data for bulk operations
    const schoolsToCreate: Array<{ name: string }> = [];
    const promptsToUpdate: Array<{ id: string; school_id: string; prompt: string; word_count: string; updated_at: string }> = [];
    const promptsToCreate: Array<{ school_id: string; prompt: string; word_count: string }> = [];
    const newSchoolsMap = new Map<string, string>(); // temporary map for new schools

    // Process CSV data and categorize operations
    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i];
      const rowNumber = i + 2; // +2 for header and 0-based index

      const schoolName = row['School']?.trim();
      const prompt = row['Prompt']?.trim();
      const wordCount = row['Word Count']?.trim() || 'Not specified';
      const existingId = row['ID']?.trim();

      if (!schoolName || !prompt) {
        errors.push(`Row ${rowNumber}: Missing required fields (School or Prompt)`);
        continue;
      }

      // Handle school creation
      let schoolId: string;
      if (schoolsMap.has(schoolName)) {
        schoolId = schoolsMap.get(schoolName)!;
      } else if (newSchoolsMap.has(schoolName)) {
        schoolId = newSchoolsMap.get(schoolName)!;
      } else {
        // Mark school for creation
        if (!schoolsToCreate.some(s => s.name === schoolName)) {
          schoolsToCreate.push({ name: schoolName });
        }
        // Use a temporary ID that will be replaced after bulk insert
        schoolId = `temp_${schoolName}`;
        newSchoolsMap.set(schoolName, schoolId);
      }

      // Handle essay prompt operations
      if (mode === 'rewrite' && existingId) {
        if (existingPromptsMap.has(existingId)) {
          promptsToUpdate.push({
            id: existingId,
            school_id: schoolId,
            prompt,
            word_count: wordCount,
            updated_at: new Date().toISOString(),
          });
        } else {
          // If ID doesn't exist, create new prompt
          promptsToCreate.push({
            school_id: schoolId,
            prompt,
            word_count: wordCount,
          });
        }
      } else {
        // Add mode - create new prompt
        promptsToCreate.push({
          school_id: schoolId,
          prompt,
          word_count: wordCount,
        });
      }
    }

    // Bulk create schools first
    if (schoolsToCreate.length > 0) {
      const { data: newSchools, error: schoolCreateError } = await supabase
        .from('schools')
        .insert(schoolsToCreate)
        .select('id, name');

      if (schoolCreateError) {
        return NextResponse.json({
          success: false,
          message: `Failed to create schools: ${schoolCreateError.message}`,
        } as ImportResult, { status: 500 });
      }

      // Update maps with new school IDs
      newSchools?.forEach(school => {
        const tempId = `temp_${school.name}`;
        schoolsMap.set(school.name, school.id);

        // Update prompts that reference temporary school IDs
        promptsToUpdate.forEach(prompt => {
          if (prompt.school_id === tempId) {
            prompt.school_id = school.id;
          }
        });

        promptsToCreate.forEach(prompt => {
          if (prompt.school_id === tempId) {
            prompt.school_id = school.id;
          }
        });
      });

      schoolsProcessed = newSchools?.length || 0;
    }

    // Bulk update prompts using upsert
    if (promptsToUpdate.length > 0) {
      const { data: updatedPrompts, error: updateError } = await supabase
        .from('essay_prompts')
        .upsert(promptsToUpdate, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select('id');

      if (updateError) {
        errors.push(`Failed to update prompts: ${updateError.message}`);
      } else {
        promptsProcessed += updatedPrompts?.length || 0;
      }
    }

    // Bulk create prompts
    if (promptsToCreate.length > 0) {
      const { data: newPrompts, error: promptCreateError } = await supabase
        .from('essay_prompts')
        .insert(promptsToCreate)
        .select('id');

      if (promptCreateError) {
        errors.push(`Failed to create prompts: ${promptCreateError.message}`);
      } else {
        promptsProcessed += newPrompts?.length || 0;
      }
    }

    const result: ImportResult = {
      success: errors.length === 0 || promptsProcessed > 0,
      message: errors.length === 0
        ? `Import completed successfully!`
        : `Import completed with ${errors.length} errors. ${promptsProcessed} prompts processed.`,
      schoolsProcessed,
      promptsProcessed,
      errors: errors.length > 0 ? errors : undefined,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Import failed',
      } as ImportResult,
      { status: 500 }
    );
  }
}
