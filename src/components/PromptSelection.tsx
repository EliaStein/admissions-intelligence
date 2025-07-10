'use client';

import React, { useState, useEffect } from 'react';
import { essayService } from '../services/essayService';
import { School, BasePrompt, SchoolPrompt } from '../types/prompt';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../hooks/useAuth';

interface PromptSelectionProps {
  onPromptSelected: (prompt: BasePrompt) => void;
  personalStatementPrompts: BasePrompt[];
  essayType: 'personal' | 'supplemental' | null;
  selectedSchool: string;
  onSchoolSelect: (schoolId: string) => void;
  onBack: () => void;
}

export function PromptSelection({
  onPromptSelected,
  personalStatementPrompts,
  essayType,
  selectedSchool,
  onSchoolSelect,
  onBack
}: PromptSelectionProps) {
  const [schools, setSchools] = useState<(School & { prompt_count: number })[]>([]);
  const [prompts, setPrompts] = useState<SchoolPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const analytics = useAnalytics();
  const { user } = useAuth();

  useEffect(() => {
    const loadSchools = async () => {
      if (essayType === 'supplemental') {
        setLoading(true);
        try {
          const schoolData = await essayService.getSchools();
          setSchools(schoolData);
        } catch (error) {
          console.error('Error loading schools:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSchools();
  }, [essayType]);

  useEffect(() => {
    const loadPrompts = async () => {
      if (selectedSchool) {
        setLoading(true);
        try {
          const promptData = await essayService.getPromptsBySchool(selectedSchool);
          setPrompts(promptData);
        } catch (error) {
          console.error('Error loading prompts:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (essayType === 'supplemental') {
      loadPrompts();
    }
  }, [selectedSchool, essayType]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  // For personal statements, show the personal statement prompts directly
  if (essayType === 'personal') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Select Personal Statement Prompt</h2>
          <button
            onClick={onBack}
            className="text-sm text-primary-600  hover:text-primary-800"
          >
            Back
          </button>
        </div>
        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
          {personalStatementPrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => {
                analytics.trackPersonalStatementPromptSelected({
                  userId: user?.id,
                  date: new Date().toISOString(),
                  prompt: prompt.prompt,
                });
                onPromptSelected(prompt);
              }}
              className="w-full text-left p-4 border rounded-lg border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
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

  // For supplemental essays, show school selection if no school is selected
  if (!selectedSchool) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Select School</h2>
          <button
            onClick={onBack}
            className="text-sm text-primary-600 border-gray-200 hover:text-primary-800"
          >
            Back
          </button>
        </div>
        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
          {schools.map((school) => (
            <button
              key={school.id}
              onClick={() => onSchoolSelect(school.id)}
              className="w-full text-left p-4 border rounded-lg border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
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

  // Show school-specific prompts
  const selectedSchoolName = schools.find(s => s.id === selectedSchool)?.name;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Select {selectedSchoolName} Prompt
          </h2>
          <button
            onClick={() => onSchoolSelect('')}
            className="text-sm text-primary-600 border-gray-200 hover:text-primary-800 mt-2"
          >
            Choose Different School
          </button>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-primary-600 border-gray-200 hover:text-primary-800"
        >
          Back
        </button>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onPromptSelected(prompt)}
            className="w-full text-left p-4 border rounded-lg border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
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
