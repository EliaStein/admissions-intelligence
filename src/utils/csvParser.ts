import Papa from 'papaparse';
import type { Database } from '../types/supabase';

type SchoolInsert = Database['public']['Tables']['schools']['Insert'];
type EssayPromptInsert = Database['public']['Tables']['essay_prompts']['Insert'];

interface ParsedData {
  schools: Map<string, SchoolInsert>;
  prompts: EssayPromptInsert[];
  errors: string[];
}

export function validateCSVHeaders(headers: string[]): boolean {
  const requiredHeaders = ['School Name', 'Essay Prompt', 'Word Count'];
  return requiredHeaders.every(header => 
    headers.some(h => h.toLowerCase() === header.toLowerCase())
  );
}

export function parseSchoolsCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        const parsed: ParsedData = {
          schools: new Map(),
          prompts: [],
          errors: []
        };

        if (!validateCSVHeaders(results.meta.fields || [])) {
          parsed.errors.push('Invalid CSV format: Missing required headers');
          resolve(parsed);
          return;
        }

        results.data.forEach((row: any, index: number) => {
          const schoolName = row['School Name']?.trim();
          const prompt = row['Essay Prompt']?.trim();
          const wordCount = row['Word Count']?.toString().trim();

          if (!schoolName || !prompt) {
            parsed.errors.push(`Row ${index + 1}: Missing required fields`);
            return;
          }

          if (!parsed.schools.has(schoolName)) {
            parsed.schools.set(schoolName, {
              name: schoolName
            });
          }

          parsed.prompts.push({
            school_id: '', // Will be set after school insertion
            prompt,
            word_count: wordCount || 'Not specified'
          });
        });

        resolve(parsed);
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
}
