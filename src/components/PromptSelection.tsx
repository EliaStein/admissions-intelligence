import React, { useState, useEffect } from 'react';
import { essayService } from '../services/essayService';
import { School, BasePrompt, SchoolPrompt } from '../types/prompt';

interface PromptSelectionProps {
  onPromptSelected: (prompt: BasePrompt) => void;
  personalStatementPrompts: BasePrompt[];
}

export function PromptSelection({ onPromptSelected, personalStatementPrompts }: PromptSelectionProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [prompts, setPrompts] = useState<SchoolPrompt[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<BasePrompt | null>(null);
  const [promptType, setPromptType] = useState<'school' | 'personal'>('school');

  useEffect(() => {
    const loadSchools = async () => {
      const schoolData = await essayService.getSchools();
      setSchools(schoolData);
    };
    loadSchools();
  }, []);

  useEffect(() => {
    const loadPrompts = async () => {
      if (selectedSchool) {
        const promptData = await essayService.getPromptsBySchool(selectedSchool);
        setPrompts(promptData);
      }
    };
    loadPrompts();
  }, [selectedSchool]);

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(e.target.value);
    setSelectedPrompt(null);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const promptId = e.target.value;
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
      setSelectedPrompt(prompt);
      onPromptSelected(prompt);
    }
  };

  const handlePersonalPromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const promptId = e.target.value;
    const prompt = personalStatementPrompts.find(p => p.id === promptId);
    if (prompt) {
      setSelectedPrompt(prompt);
      onPromptSelected(prompt);
    }
  };

  const handlePromptTypeChange = (type: 'school' | 'personal') => {
    setPromptType(type);
    setSelectedSchool('');
    setSelectedPrompt(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <button
          onClick={() => handlePromptTypeChange('school')}
          className={`px-4 py-2 rounded-md ${
            promptType === 'school'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Supplemental Essays
        </button>
        <button
          onClick={() => handlePromptTypeChange('personal')}
          className={`px-4 py-2 rounded-md ${
            promptType === 'personal'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Personal Statement
        </button>
      </div>

      {promptType === 'school' ? (
        <div className="space-y-4">
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
              <option value="">Choose a school</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSchool && (
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
                <option value="">Choose a prompt</option>
                {prompts.map((prompt) => (
                  <option key={prompt.id} value={prompt.id}>
                    {prompt.prompt}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            onChange={handlePersonalPromptChange}
          >
            <option value="">Choose a prompt</option>
            {personalStatementPrompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.prompt}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}