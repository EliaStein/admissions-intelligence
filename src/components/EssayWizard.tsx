import React, { useState } from 'react';
import { PromptSelection } from './PromptSelection';
import { EssayPrompt } from '../types/prompt';

const PERSONAL_STATEMENT_PROMPTS = [
  {
    id: 'ps-1',
    prompt: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.',
    word_count: 650
  },
  {
    id: 'ps-2', 
    prompt: 'The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?',
    word_count: 650
  },
  {
    id: 'ps-3',
    prompt: 'Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?',
    word_count: 650
  },
  {
    id: 'ps-4',
    prompt: 'Reflect on something that someone has done for you that has made you happy or thankful in a surprising way. How has this gratitude affected or motivated you?',
    word_count: 650
  },
  {
    id: 'ps-5',
    prompt: 'Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.',
    word_count: 650
  },
  {
    id: 'ps-6',
    prompt: 'Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?',
    word_count: 650
  },
  {
    id: 'ps-7',
    prompt: 'Share an essay on any topic of your choice. It can be one you\'ve already written, one that responds to a different prompt, or one of your own design.',
    word_count: 650
  }
];

export function EssayWizard() {
  const [selectedPrompt, setSelectedPrompt] = useState<EssayPrompt | null>(null);
  const [essay, setEssay] = useState('');

  const handlePromptSelected = (prompt: EssayPrompt) => {
    setSelectedPrompt(prompt);
    setEssay('');
  };

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {!selectedPrompt ? (
        <PromptSelection 
          onPromptSelected={handlePromptSelected} 
          personalStatementPrompts={PERSONAL_STATEMENT_PROMPTS}
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-900">Writing Prompt:</h3>
            <p className="mt-2 text-gray-600">{selectedPrompt.prompt}</p>
            <p className="mt-1 text-sm text-gray-500">
              Word limit: {selectedPrompt.word_count}
            </p>
          </div>

          <textarea
            className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Start writing your essay here..."
          />

          <div className="flex justify-between items-center">
            <span className={`text-sm ${wordCount > selectedPrompt.word_count ? 'text-red-600' : 'text-gray-500'}`}>
              Words: {wordCount} / {selectedPrompt.word_count}
            </span>
            <button
              onClick={() => setSelectedPrompt(null)}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Choose Different Prompt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
