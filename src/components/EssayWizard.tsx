'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PromptSelection } from './PromptSelection';
import { StudentInfoForm } from './StudentInfoForm';
import { SuccessMessage } from './SuccessMessage';
import { EssayPrompt } from '../types/prompt';
import { essayService } from '../services/essayService';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { fileProcessingService } from '../services/fileProcessingService';
import { PERSONAL_STATEMENT_PROMPTS } from '../prompts/personalStatement.prompt';

type EssayType = 'personal' | 'supplemental' | null;
type Step = 'type' | 'school' | 'prompt' | 'essay' | 'info' | 'confirm';


export function EssayWizard() {
  const { user } = useAuth();
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [userProfileLoaded, setUserProfileLoaded] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Load user profile data when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('first_name, last_name, email')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setStudentFirstName(data.first_name);
            setStudentLastName(data.last_name);
            setStudentEmail(data.email);
            setUserProfileLoaded(true);
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      }
    };
    
    loadUserProfile();
  }, [user]);

  // Map steps to numbers based on essay type and auth status
  const getStepNumber = () => {
    if (!user) {
      // For unauthenticated users
      if (essayType === 'personal') {
        switch (currentStep) {
          case 'type': return 1;
          case 'prompt': return 2;
          case 'essay': return 3;
          case 'info': return 4;
          default: return 1;
        }
      } else { // supplemental
        switch (currentStep) {
          case 'type': return 1;
          case 'school': return 2;
          case 'prompt': return 3;
          case 'essay': return 4;
          case 'info': return 5;
          default: return 1;
        }
      }
    } else {
      // For authenticated users
      if (essayType === 'personal') {
        switch (currentStep) {
          case 'type': return 1;
          case 'prompt': return 2;
          case 'essay': return 3;
          default: return 1;
        }
      } else { // supplemental
        switch (currentStep) {
          case 'type': return 1;
          case 'school': return 2;
          case 'prompt': return 3;
          case 'essay': return 4;
          default: return 1;
        }
      }
    }
  };

  const getTotalSteps = () => {
    if (!user) {
      return essayType === 'personal' ? 4 : 5;
    } else {
      return essayType === 'personal' ? 3 : 4;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await fileProcessingService.processFile(file);

      if (result.success) {
        setEssay(result.content);
        setError('');
      } else {
        setError(result.error || 'Failed to process the file.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Failed to process the file. Please try again or use a different file.');
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    setError('');

    // For authenticated users, validate only the essay content
    if (user) {
      if (!essay.trim()) {
        setError('Essay content is required');
        return;
      }

      if (!selectedPrompt) {
        setError('Please select a prompt');
        return;
      }

      const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > selectedPrompt.word_count * 2) {
        setError(`Essay exceeds the ${selectedPrompt.word_count} word limit`);
        return;
      }

      try {
        setIsSubmitting(true);

        const essayData = {
          student_first_name: studentFirstName.trim(),
          student_last_name: studentLastName.trim(),
          student_email: studentEmail.trim(),
          student_college: 'school_id' in selectedPrompt ? selectedPrompt.school_name || null : null,
          selected_prompt: selectedPrompt.prompt,
          personal_statement: essayType === 'personal',
          essay_content: essay.trim()
        };

        const userInfo = {
          user_id: user.id,
          email: user.email
        };

        await essayService.saveEssay(essayData, selectedPrompt.word_count, userInfo);

        setIsSuccess(true);
      } catch (err) {
        setError('Failed to submit essay for feedback. Please try again.');
        console.error('Submit error:', err);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // For non-authenticated users, validate all fields
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
    if (wordCount > selectedPrompt.word_count * 2) {
      setError(`Essay exceeds the ${selectedPrompt.word_count} word limit`);
      return;
    }

    try {
      setIsSubmitting(true);

      const essayData = {
        student_first_name: studentFirstName.trim(),
        student_last_name: studentLastName.trim(),
        student_email: studentEmail.trim(),
        student_college: 'school_id' in selectedPrompt ? selectedPrompt.school_name || null : null,
        selected_prompt: selectedPrompt.prompt,
        personal_statement: essayType === 'personal',
        essay_content: essay.trim()
      };

      await essayService.saveEssay(essayData, selectedPrompt.word_count, {email: studentEmail});

      setIsSuccess(true);
    } catch (err) {
      setError('Failed to submit essay for feedback. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStudentFirstName(user ? studentFirstName : '');
    setStudentLastName(user ? studentLastName : '');
    setStudentEmail(user ? studentEmail : '');
    setEssay('');
    setSelectedPrompt(null);
    setSelectedSchool('');
    setCurrentStep('type');
    setEssayType(null);
    setIsSuccess(false);
    setError('');
  };

  useEffect(() => {
    if (formRef.current && currentStep === 'info') {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  const renderStepIndicator = () => (
    <div className="mb-12">
      <div className="flex justify-center items-center">
        {Array.from({ length: getTotalSteps() }).map((_, i) => (
          <React.Fragment key={i}>
            <div 
              className={`
                relative flex items-center justify-center
                w-8 h-8 sm:w-12 sm:h-12 rounded-full transition-all duration-200
                ${i + 1 === getStepNumber() 
                  ? 'bg-primary-600 text-white ring-4 ring-primary-100' 
                  : i + 1 < getStepNumber()
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-400'
                }
              `}
            >
              <span className="relative z-10 hidden sm:inline text-lg font-medium">{i + 1}</span>
              <span className="relative z-10 sm:hidden w-2 h-2 rounded-full bg-current"></span>
            </div>
            {i < getTotalSteps() - 1 && (
              <div 
                className={`
                  h-1 mx-2 sm:mx-4 transition-all duration-200 w-12 sm:w-24
                  ${i + 1 < getStepNumber() 
                    ? 'bg-primary-100' 
                    : 'bg-gray-100'
                  }
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-center mt-4 text-sm text-gray-500">
        Step {getStepNumber()} of {getTotalSteps()}
      </div>
    </div>
  );

  const renderContent = () => {
    if (isSuccess) {
      return <SuccessMessage onReset={resetForm} />;
    }

    switch (currentStep) {
      case 'type':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center mb-8">What essay would you like help with?</h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => {
                  setEssayType('personal');
                  setCurrentStep('prompt');
                }}
                className="w-full p-6 border-2 rounded-lg border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors group"
              >
                <h3 className="text-lg font-medium mb-2 group-hover:text-primary-600">Personal Statement</h3>
                <p className="text-sm text-gray-500">Write your college application essay</p>
              </button>
              <button
                onClick={() => {
                  setEssayType('supplemental');
                  setCurrentStep('school');
                }}
                className="w-full p-6 border-2 rounded-lg border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors group"
              >
                <h3 className="text-lg font-medium mb-2 group-hover:text-primary-600">Supplemental Essays</h3>
                <p className="text-sm text-gray-500">Write school-specific essays</p>
              </button>
            </div>
          </div>
        );

      case 'school':
        return (
          <PromptSelection 
            onPromptSelected={(prompt) => {
              setSelectedPrompt(prompt);
              setCurrentStep('essay');
            }}
            personalStatementPrompts={PERSONAL_STATEMENT_PROMPTS}
            essayType={essayType}
            selectedSchool={selectedSchool}
            onSchoolSelect={(schoolId) => {
              setSelectedSchool(schoolId);
              // If a school is selected, move to the prompt selection step
              if (schoolId) {
                setCurrentStep('prompt');
              }
            }}
            onBack={() => {
              setCurrentStep('type');
            }}
          />
        );

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
            onSchoolSelect={(schoolId) => {
              setSelectedSchool(schoolId);
              if (!schoolId && essayType === 'supplemental') {
                setCurrentStep('school');
              }
            }}
            onBack={() => {
              if (essayType === 'personal') {
                setCurrentStep('type');
              } else {
                setCurrentStep('school');
              }
            }}
          />
        );

      case 'essay':
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Writing Prompt:</h3>
              <p className="text-gray-600">{selectedPrompt?.prompt}</p>
              <p className="mt-2 text-sm text-gray-500">
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
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p className="mt-1 ml-2 text-xs text-gray-500 text-left">
                  Supported formats: .txt, .docx, .pdf (For .doc files, please save as .docx first)
                </p>
              </div>
              
              <textarea
                className="w-full h-64 p-4 border rounded-lg focus:ring-2 border-gray-200 focus:ring-primary-500 resize-none"
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Start writing your essay here..."
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
                    setCurrentStep(essayType === 'personal' ? 'prompt' : 'prompt');
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
                    
                    if (user && userProfileLoaded) {
                      // For authenticated users, submit directly
                      handleSubmit();
                    } else {
                      // For unauthenticated users, go to the info step
                      setCurrentStep('info');
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Request Feedback'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'info':
        // Only needed for non-authenticated users, authenticated users should never reach this case
        return (
          <div ref={formRef}>
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

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        {renderStepIndicator()}
        {renderContent()}
      </div>
    </div>
  );
}
