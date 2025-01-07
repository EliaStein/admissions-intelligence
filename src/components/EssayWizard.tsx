import React, { useState } from 'react';
import { PromptSelection } from './PromptSelection';
import { StudentInfoForm } from './StudentInfoForm';
import { EssayPrompt } from '../types/prompt';
import { essayService } from '../services/essayService';
import { Essay } from '../types/essay';

const PERSONAL_STATEMENT_PROMPTS = [
  {
    id: 'ps1',
    prompt: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.',
    word_count: 650
  },
  {
    id: 'ps2',
    prompt: 'The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?',
    word_count: 650
  },
  {
    id: 'ps3',
    prompt: 'Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?',
    word_count: 650
  },
  {
    id: 'ps4',
    prompt: 'Reflect on something that someone has done for you that has made you happy or thankful in a surprising way. How has this gratitude affected or motivated you?',
    word_count: 650
  },
  {
    id: 'ps5',
    prompt: 'Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.',
    word_count: 650
  },
  {
    id: 'ps6',
    prompt: 'Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?',
    word_count: 650
  },
  {
    id: 'ps7',
    prompt: 'Share an essay on any topic of your choice. It can be one you\'ve already written, one that responds to a different prompt, or one of your own design.',
    word_count: 650
  }
];

type Step = 'prompt' | 'essay' | 'info';

export function EssayWizard() {
  const [currentStep, setCurrentStep] = useState<Step>('prompt');
  const [selectedPrompt, setSelectedPrompt] = useState<EssayPrompt | null>(null);
  const [essay, setEssay] = useState('');
  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePromptSelected = (prompt: EssayPrompt) => {
    setSelectedPrompt(prompt);
    setCurrentStep('essay');
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!studentFirstName.trim()) {
      setError('First name is required');
      return;
    }

    if (!studentLastName.trim()) {
      setError('Last name is required');
      return;
    }

    if (!validateEmail(studentEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!essay.trim()) {
      setError('Essay content is required');
      return;
    }

    if (!selectedPrompt) {
      setError('Please select a prompt');
      return;
    }

    const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > selectedPrompt.word_count) {
      setError(`Essay exceeds the ${selectedPrompt.word_count} word limit`);
      return;
    }

    try {
      setIsSubmitting(true);
      const newEssay: Essay = {
        student_first_name: studentFirstName.trim(),
        student_last_name: studentLastName.trim(),
        student_email: studentEmail.trim(),
        student_college: 'school_id' in selectedPrompt ? selectedPrompt.school_name || null : null,
        selected_prompt: selectedPrompt.prompt,
        personal_statement: !('school_id' in selectedPrompt),
        essay_content: essay.trim()
      };

      await essayService.saveEssay(newEssay);
      
      // Reset form
      setStudentFirstName('');
      setStudentLastName('');
      setStudentEmail('');
      setEssay('');
      setSelectedPrompt(null);
      setCurrentStep('prompt');
    } catch (err) {
      setError('Failed to submit essay. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (!essay.trim()) {
      setError('Please write your essay before proceeding');
      return;
    }
    setError('');
    setCurrentStep('info');
  };

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  if (currentStep === 'prompt') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <PromptSelection 
          onPromptSelected={handlePromptSelected} 
          personalStatementPrompts={PERSONAL_STATEMENT_PROMPTS}
        />
      </div>
    );
  }

  if (currentStep === 'info') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <StudentInfoForm
          studentFirstName={studentFirstName}
          studentLastName={studentLastName}
          studentEmail={studentEmail}
          onFirstNameChange={setStudentFirstName}
          onLastNameChange={setStudentLastName}
          onEmailChange={setStudentEmail}
          onSubmit={handleSubmit}
          onBack={() => setCurrentStep('essay')}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium text-gray-900">Writing Prompt:</h3>
        <p className="mt-2 text-gray-600">{selectedPrompt?.prompt}</p>
        <p className="mt-1 text-sm text-gray-500">
          Word limit: {selectedPrompt?.word_count}
        </p>
      </div>

      <div className="space-y-4">
        <textarea
          className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Start writing your essay here..."
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-between items-center">
        <span className={`text-sm ${wordCount > (selectedPrompt?.word_count || 0) ? 'text-red-600' : 'text-gray-500'}`}>
          Words: {wordCount} / {selectedPrompt?.word_count}
        </span>
        <div className="space-x-4">
          <button
            onClick={() => {
              setSelectedPrompt(null);
              setCurrentStep('prompt');
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Choose Different Prompt
          </button>
          <button
            onClick={handleNextStep}
            className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
}