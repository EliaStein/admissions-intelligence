import React, { useState, useEffect } from 'react';
import { essayService } from '../services/essayService';
import { School, EssayPrompt } from '../types/prompt';

interface PromptSelectionProps {
  onPromptSelected: (prompt: EssayPrompt) => void;
  personalStatementPrompts: EssayPrompt[];
}

export function PromptSelection({ onPromptSelected, personalStatementPrompts }: PromptSelectionProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [prompts, setPrompts] = useState<EssayPrompt[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<EssayPrompt | null>(null);
  const [promptType, setPromptType] = useState<'school' | 'personal'>('school');

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    if (promptType === 'school' && selectedSchool) {
      loadPrompts(selectedSchool);
    } else {
      setPrompts([]);
      setSelectedPrompt(null);
    }
  }, [selectedSchool, promptType]);

  const loadSchools = async () => {
    const schoolsData = await essayService.getSchools();
    setSchools(schoolsData);
  };

  const loadPrompts = async (schoolId: string) => {
    const promptsData = await essayService.getPromptsBySchool(schoolId);
    setPrompts(promptsData);
  };

  const handlePromptTypeChange = (type: 'school' | 'personal') => {
    setPromptType(type);
    setSelectedSchool('');
    setSelectedPrompt(null);
  };

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(e.target.value);
    setSelectedPrompt(null);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let prompt: EssayPrompt | undefined;
    
    if (promptType === 'school') {
      prompt = prompts.find(p => p.id === e.target.value);
    } else {
      prompt = personalStatementPrompts.find(p => p.id === e.target.value);
    }
    
    if (prompt) {
      setSelectedPrompt(prompt);
      onPromptSelected(prompt);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded-md ${
            promptType === 'school'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => handlePromptTypeChange('school')}
        >
          School Essays
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            promptType === 'personal'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => handlePromptTypeChange('personal')}
        >
          Personal Statement
        </button>
      </div>

      {promptType === 'school' ? (
        <div>
          <label htmlFor="school" className="block text-sm font-medium text-gray-700">
            Select School
          </label>
          <select
            id="school"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={selectedSchool}
            onChange={handleSchoolChange}
          >
            <option value="">Select a school...</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label htmlFor="personal-prompt" className="block text-sm font-medium text-gray-700">
            Select Personal Statement Prompt
          </label>
          <select
            id="personal-prompt"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={selectedPrompt?.id || ''}
            onChange={handlePromptChange}
          >
            <option value="">Select a prompt...</option>
            {personalStatementPrompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.prompt}
              </option>
            ))}
          </select>
        </div>
      )}

      {promptType === 'school' && selectedSchool && (
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Select Prompt
          </label>
          <select
            id="prompt"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={selectedPrompt?.id || ''}
            onChange={handlePromptChange}
          >
            <option value="">Select a prompt...</option>
            {prompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.prompt}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedPrompt && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Selected Prompt:</h3>
          <p className="mt-2 text-gray-600">{selectedPrompt.prompt}</p>
          <p className="mt-1 text-sm text-gray-500">
            Word limit: {selectedPrompt.word_count}
          </p>
        </div>
      )}
    </div>
  );
}