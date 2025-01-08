import React, { useState, useEffect } from 'react';
import { essayService } from '../services/essayService';
import { School, BasePrompt, SchoolPrompt } from '../types/prompt';

interface PromptSelectionProps {
  onPromptSelected: (prompt: BasePrompt) => void;
  personalStatementPrompts: BasePrompt[];
  essayType: 'personal' | 'supplemental' | null;
  selectedSchool: string;
  onSchoolSelect: (schoolId: string) => void;
}

export function PromptSelection({
  onPromptSelected,
  personalStatementPrompts,
  essayType,
  selectedSchool,
  onSchoolSelect
}: PromptSelectionProps) {
  const [schools, setSchools] = useState<(School & { prompt_count: number })[]>([]);
  const [prompts, setPrompts] = useState<SchoolPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchools = async () => {
      setLoading(true);
      const schoolData = await essayService.getSchools();
      setSchools(schoolData);
      setLoading(false);
    };

    if (essayType === 'supplemental') {
      loadSchools();
    }
  }, [essayType]);

  useEffect(() => {
    const loadPrompts = async () => {
      if (selectedSchool) {
        setLoading(true);
        const promptData = await essayService.getPromptsBySchool(selectedSchool);
        setPrompts(promptData);
        setLoading(false);
      }
    };
    loadPrompts();
  }, [selectedSchool]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (essayType === 'supplemental' && !selectedSchool) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Select School</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
          {schools.map((school) => (
            <button
              key={school.id}
              onClick={() => onSchoolSelect(school.id)}
              className="w-full text-left p-4 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">{school.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {school.prompt_count} {school.prompt_count === 1 ? 'prompt' : 'prompts'} available
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const displayPrompts = essayType === 'personal' ? personalStatementPrompts : prompts;
  const selectedSchoolName = schools.find(s => s.id === selectedSchool)?.name;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          {essayType === 'personal' ? 'Select Personal Statement Prompt' : `Select ${selectedSchoolName} Prompt`}
        </h2>
        {essayType === 'supplemental' && (
          <button
            onClick={() => onSchoolSelect('')}
            className="text-sm text-indigo-600 hover:text-indigo-800 mt-2"
          >
            Choose Different School
          </button>
        )}
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
        {displayPrompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onPromptSelected(prompt)}
            className="w-full text-left p-4 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <p className="text-gray-900">{prompt.prompt}</p>
            <p className="text-sm text-gray-500 mt-2">
              Word limit: {prompt.word_count}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}