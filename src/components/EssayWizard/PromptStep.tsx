import React from 'react';
import { School } from './types';
import { PERSONAL_STATEMENT_PROMPTS } from './constants';

interface PromptStepProps {
  school?: School;
  onSelect: (prompt: string) => void;
}

export function PromptStep({ school, onSelect }: PromptStepProps) {
  const prompts = school ? school.prompts : PERSONAL_STATEMENT_PROMPTS;

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onSelect(prompt)}
          className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
