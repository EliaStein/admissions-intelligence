'use client';

import React, { useState, useEffect } from 'react';
import { essayService } from '../services/essayService';
import { School, BasePrompt, SchoolPrompt, formatWordLimit } from '../types/prompt';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../hooks/useAuth';

interface PromptGroup {
  key: string;
  label: string | null;
  ruleText: string;
  prompts: SchoolPrompt[];
}

// Groups a school's prompts into choice-sets for display only ("Choose 4 of
// 8", "Required — all 3") — it doesn't change the underlying one-prompt-at-a-
// time selection flow below. Prompts from the local-fallback table have no
// grouping metadata and each render as their own standalone group.
function groupPromptsForDisplay(prompts: SchoolPrompt[]): PromptGroup[] {
  const groups = new Map<string, { label: string | null; selectCount: number; isRequired: boolean; prompts: SchoolPrompt[] }>();
  const order: string[] = [];
  for (const p of prompts) {
    const key = p.groupKey ?? `__solo_${p.id}`;
    let g = groups.get(key);
    if (!g) {
      g = { label: p.groupLabel, selectCount: p.selectCount, isRequired: p.isRequired, prompts: [] };
      groups.set(key, g);
      order.push(key);
    }
    g.prompts.push(p);
  }
  return order.map((key) => {
    const g = groups.get(key)!;
    const n = g.prompts.length;
    let ruleText = '';
    if (!g.isRequired) {
      ruleText = g.selectCount >= n ? 'Optional' : `Optional — choose up to ${g.selectCount}`;
    } else if (g.selectCount < n) {
      ruleText = `Choose ${g.selectCount} of ${n}`;
    } else if (n > 1) {
      ruleText = 'Answer all';
    }
    return { key, label: g.label, ruleText, prompts: g.prompts };
  });
}

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
          const schoolName = schools.find((s) => s.id === selectedSchool)?.name ?? '';
          const promptData = await essayService.getPromptsBySchool(selectedSchool, schoolName);
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
  }, [selectedSchool, essayType, schools]);

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
                {formatWordLimit(prompt)}
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

      <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
        {groupPromptsForDisplay(prompts).map((group) => (
          <div key={group.key} className="space-y-3">
            {(group.label || group.ruleText) && (
              <div className="flex items-baseline justify-between px-1">
                {group.label && (
                  <h4 className="text-sm font-semibold text-gray-700">{group.label}</h4>
                )}
                {group.ruleText && (
                  <span className="text-xs text-gray-500">{group.ruleText}</span>
                )}
              </div>
            )}
            {group.prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => onPromptSelected(prompt)}
                className="w-full text-left p-4 border rounded-lg border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <p className="text-gray-900">{prompt.prompt}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatWordLimit(prompt)}
                </p>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
