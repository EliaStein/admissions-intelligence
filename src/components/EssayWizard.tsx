import React, { useState, useCallback } from 'react';
import { PromptSelection } from './PromptSelection';
import { StudentInfoForm } from './StudentInfoForm';
import { SuccessMessage } from './SuccessMessage';
import { EssayPrompt } from '../types/prompt';
import { essayService } from '../services/essayService';
import { Essay } from '../types/essay';

type EssayType = 'personal' | 'supplemental' | null;
type Step = 'type' | 'school' | 'prompt' | 'essay' | 'info' | 'success';

export function EssayWizard() {
  const [essayType, setEssayType] = useState<EssayType>(null);
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<EssayPrompt | null>(null);
  const [essay, setEssay] = useState('');
  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getStepNumber = () => {
    if (essayType === 'personal') {
      const steps: Record<Step, number> = {
        type: 1,
        school: 1,
        prompt: 2,
        essay: 3,
        info: 4,
        success: 4
      };
      return steps[currentStep];
    } else {
      const steps: Record<Step, number> = {
        type: 1,
        school: 2,
        prompt: 3,
        essay: 4,
        info: 5,
        success: 5
      };
      return steps[currentStep];
    }
  };

  const getTotalSteps = () => {
    return essayType === 'personal' ? 4 : 5;
  };

  const renderStepIndicator = () => {
    const steps = getTotalSteps();
    const currentStepNum = getStepNumber();
    
    return (
      <div className="mb-8">
        <div className="flex justify-center items-center space-x-3">
          {Array.from({ length: steps }).map((_, index) => (
            <React.Fragment key={index}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${index + 1 === currentStepNum 
                  ? 'bg-primary-600 text-white' 
                  : index + 1 < currentStepNum
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-gray-200 text-gray-400'
                }
              `}>
                {index + 1}
              </div>
              {index < steps - 1 && (
                <div className={`
                  w-12 h-0.5
                  ${index + 1 < currentStepNum 
                    ? 'bg-gray-200' 
                    : 'bg-gray-200'
                  }
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setEssay(text);
        }
      };
      reader.readAsText(file);
    }
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
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
        personal_statement: essayType === 'personal',
        essay_content: essay.trim()
      };

      await essayService.saveEssay(newEssay);
      setCurrentStep('success');
    } catch (err) {
      setError('Failed to submit essay. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEssayType(null);
    setCurrentStep('type');
    setSelectedSchool('');
    setSelectedPrompt(null);
    setEssay('');
    setStudentFirstName('');
    setStudentLastName('');
    setStudentEmail('');
    setError('');
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center mb-8">Choose Essay Type</h2>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  setEssayType('personal');
                  setCurrentStep('prompt');
                }}
                className="w-full p-6 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <h3 className="text-lg font-medium mb-2">Personal Statement</h3>
                <p className="text-sm text-gray-500">Write your college application essay</p>
              </button>
              <button
                onClick={() => {
                  setEssayType('supplemental');
                  setCurrentStep('school');
                }}
                className="w-full p-6 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <h3 className="text-lg font-medium mb-2">Supplemental Essays</h3>
                <p className="text-sm text-gray-500">Write school-specific essays</p>
              </button>
            </div>
          </div>
        );

      case 'school':
      case 'prompt':
        return (
          <PromptSelection 
            onPromptSelected={(prompt) => {
              setSelectedPrompt(prompt);
              setCurrentStep('essay');
            }}
            personalStatementPrompts={PERSONAL_STATEMENT_PROMPTS}
            essayType={essayType}
            selectedSchool={selectedSchool}
            onSchoolSelect={setSelectedSchool}
          />
        );

      case 'essay':
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-900">Writing Prompt:</h3>
              <p className="mt-2 text-gray-600">{selectedPrompt?.prompt}</p>
              <p className="mt-1 text-sm text-gray-500">
                Word limit: {selectedPrompt?.word_count}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Essay (Optional)
                </label>
                <input
                  type="file"
                  accept=".txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              
              <textarea
                className="w-full h-64 p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Enter your essay here..."
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-between items-center">
              <span className={`text-sm ${
                essay.trim().split(/\s+/).filter(Boolean).length > (selectedPrompt?.word_count || 0)
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}>
                Words: {essay.trim().split(/\s+/).filter(Boolean).length} / {selectedPrompt?.word_count}
              </span>
              <div className="space-x-4">
                <button
                  onClick={() => {
                    setCurrentStep(essayType === 'personal' ? 'prompt' : 'school');
                    setSelectedPrompt(null);
                  }}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Choose Different Prompt
                </button>
                <button
                  onClick={() => {
                    if (!essay.trim()) {
                      setError('Please write your essay before proceeding');
                      return;
                    }
                    setError('');
                    setCurrentStep('info');
                    // Scroll to top smoothly
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Request Feedback
                </button>
              </div>
            </div>
          </div>
        );

      case 'info':
        return (
          <StudentInfoForm
            studentFirstName={studentFirstName}
            studentLastName={studentLastName}
            studentEmail={studentEmail}
            onFirstNameChange={setStudentFirstName}
            onLastNameChange={setLastNameName}
            onEmailChange={setStudentEmail}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep('essay')}
            isSubmitting={isSubmitting}
            error={error}
          />
        );

      case 'success':
        return (
          <SuccessMessage onReset={resetForm} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        {currentStep !== 'success' && renderStepIndicator()}
        {renderContent()}
      </div>
    </div>
  );
}

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
