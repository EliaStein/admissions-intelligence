import Papa from 'papaparse';
import { ParsedSchoolData, School, EssayPrompt } from '../types/essay';

export const parseCSV = (csvContent: string): ParsedSchoolData => {
  const result: ParsedSchoolData = {
    schools: [],
    errors: [],
  };

  const parsedData = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsedData.errors.length > 0) {
    result.errors.push('CSV parsing failed: Invalid file format');
    return result;
  }

  const schoolMap = new Map<string, School>();

  parsedData.data.forEach((row: any, index: number) => {
    const schoolName = row['School Name']?.trim();
    const promptText = row['Essay Prompt']?.trim();
    const wordCount = row['Word Count']?.toString().trim();

    if (!schoolName || !promptText) {
      result.errors.push(`Row ${index + 1}: Missing required fields`);
      return;
    }

    const prompt: EssayPrompt = {
      prompt: promptText,
      wordCount: wordCount || 'Not specified',
    };

    if (schoolMap.has(schoolName)) {
      const school = schoolMap.get(schoolName)!;
      school.prompts.push(prompt);
    } else {
      schoolMap.set(schoolName, {
        name: schoolName,
        prompts: [prompt],
      });
    }
  });

  result.schools = Array.from(schoolMap.values());
  return result;
};

export const validateCSVFormat = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const firstLine = content.split('\n')[0].toLowerCase();
      const requiredHeaders = ['school name', 'essay prompt', 'word count'];
      
      const hasRequiredHeaders = requiredHeaders.every(header => 
        firstLine.includes(header)
      );
      
      resolve(hasRequiredHeaders);
    };
    reader.readAsText(file);
  });
};
