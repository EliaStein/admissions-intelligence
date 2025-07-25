'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send } from 'lucide-react';
import { PromptSelection } from './PromptSelection';
import { SuccessMessage } from './SuccessMessage';
import AuthModal from './AuthModal';
import { DuplicateSubmissionModal } from './DuplicateSubmissionModal';
import { EssayPrompt } from '../types/prompt';
import { essayService } from '../services/essayService';
import { essayStorageService } from '../services/essayStorageService';
import { ActionPersistenceService } from '../services/actionPersistenceService';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { fileProcessingService } from '../services/fileProcessingService';
import { PERSONAL_STATEMENT_PROMPTS } from '../prompts/personalStatement.prompt';
import { useCredits } from '../hooks/useCredits';
import { useAnalytics } from '../hooks/useAnalytics';

type EssayType = 'personal' | 'supplemental' | null;
type Step = 'type' | 'school' | 'prompt' | 'essay' | 'info' | 'confirm';


function EssayWizard() {
  const { user } = useAuth();
  const router = useRouter();
  const { credits, loading: creditsLoading, refetch: refetchCredits } = useCredits();
  const analytics = useAnalytics();
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
  const [duplicateError, setDuplicateError] = useState<{ message: string; submissionCount: number } | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Save essay progress to localStorage using the service

  const requestFeedback = async (_selectedPrompt = selectedPrompt, essayContent = essay, _essayType = essayType) => {
    if (creditsLoading) return;
    ActionPersistenceService.saveAction('request_feedback');
    const essayToStore = {
      essayType: _essayType,
      selectedPrompt: _selectedPrompt,
      essay: essayContent,
      currentStep,
      selectedSchool: !!_selectedPrompt && 'school_id' in _selectedPrompt ? _selectedPrompt.school_name || '' : ''
    };
    if (!user) {
      console.log('no user')
      ActionPersistenceService.savePendingRequirement('login');
      essayStorageService.saveProgress(essayToStore);
      setShowAuthModal(true);
      return;
    }
    if (credits === null) return; // await creditsLoading
    if (!credits) {
      console.log('no credit')
      ActionPersistenceService.savePendingRequirement('credit');
      essayStorageService.saveProgress(essayToStore);
      router.push('/purchase-credits');
      return;
    }
    setIsSubmitting(true);

    try {
      setLoadingStep('Validating essay...');
      const student_college = !!_selectedPrompt && 'school_id' in _selectedPrompt ? _selectedPrompt.school_name || null : null;

      const essayData = {
        student_first_name: studentFirstName.trim(),
        student_last_name: studentLastName.trim(),
        student_email: studentEmail.trim(),
        student_college,
        selected_prompt: _selectedPrompt?.prompt,
        personal_statement: _essayType === 'personal',
        essay_content: essayContent.trim()
      };

      const userInfo = {
        user_id: user?.id,
        email: user?.email
      };

      setLoadingStep('Generating feedback...');
      await essayService.saveEssay(essayData as any, _selectedPrompt?.word_count, userInfo);

      // Track essay submission
      analytics.trackEssaySubmissionNew({
        essayType: _essayType === 'personal' ? 'Personal Statement' : 'Supplemental Essay',
        school: _essayType === 'supplemental' && _selectedPrompt && 'school_name' in _selectedPrompt ? _selectedPrompt.school_name : undefined,
        promptType: _essayType === 'personal' ? 'Personal Statement' : 'Supplemental',
        submissionMethod: 'text',
        userId: user?.id,
        date: new Date().toISOString(),
        prompt: _selectedPrompt?.prompt,
      });

      essayStorageService.clearProgress();
      ActionPersistenceService.clearAction();
      ActionPersistenceService.clearPendingRequirement();
      setLoadingStep('Finalizing submission...');
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Check for duplicate submission error
      if (err instanceof Error && (err as any).isDuplicate) {
        setDuplicateError({
          message: (err as any).duplicateMessage || err.message,
          submissionCount: (err as any).submissionCount || 0
        });
        essayStorageService.clearProgress();
        ActionPersistenceService.clearAction();
        ActionPersistenceService.clearPendingRequirement();
        setShowDuplicateModal(true);
        setError('');
        return;
      }

      if (errorMessage.includes('You need at least 1 credit to get AI feedback')) {
        ActionPersistenceService.saveAction('request_feedback');
        router.push('/purchase-credits');
        return;
      } else {
        setError('Failed to submit essay for feedback. Please try again.');
        setDuplicateError(null);
        setShowDuplicateModal(false);
      }
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
      setLoadingStep('');
    }

  }

  const handleSubmit = async () => {
    setError('');
    setDuplicateError(null);
    setShowDuplicateModal(false);

    if (!essay.trim()) {
      setError('Please write your essay before proceeding');
      return;
    }

    if (!selectedPrompt) {
      setError('Please select a prompt');
      return;
    }

    const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
    
    // For personal statements, allow up to 1000 words but warn at 650
    // For supplemental essays, use the original logic
    const maxWordCount = essayType === 'personal' ? 1000 : selectedPrompt.word_count * 2;
    if (wordCount > maxWordCount) {
      const limitText = essayType === 'personal' ? '1000' : selectedPrompt.word_count.toString();
      setError(`Essay exceeds the ${limitText} word limit`);
      return;
    }

    requestFeedback();
  };

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
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      }
    };

    loadUserProfile();
  }, [user?.id]);


  const continueRequestFeedback = () => {
    const savedProgress = essayStorageService.restoreProgress();
    if (savedProgress) {
      if (savedProgress.essayType) setEssayType(savedProgress.essayType);
      if (savedProgress.currentStep) setCurrentStep(savedProgress.currentStep);
      if (savedProgress.selectedSchool) setSelectedSchool(savedProgress.selectedSchool);
      if (savedProgress.selectedPrompt) setSelectedPrompt(savedProgress.selectedPrompt);
      if (savedProgress.essay) setEssay(savedProgress.essay);
      requestFeedback(
        savedProgress.selectedPrompt,
        savedProgress.essay,
        savedProgress.essayType
      );
    }
  };

  useEffect(() => {
    const action = ActionPersistenceService.getAction();
    const dependency = ActionPersistenceService.getPendingRequirement();
    console.log(`userId: ${user?.id} / action: ${action} / dependency: ${dependency}`);
    if (user && action === 'request_feedback' && !dependency && !creditsLoading) {
      continueRequestFeedback();
      return;
    }
  }, [user?.id, creditsLoading]);

  // Map steps to numbers based on essay type
  const getStepNumber = () => {
    // Both authenticated and unauthenticated users follow the same steps now
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
  };

  const getTotalSteps = () => {
    return essayType === 'personal' ? 3 : 4;
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
                  analytics.trackEssayTypeSelected({
                    userId: user?.id,
                    date: new Date().toISOString(),
                    essayType: 'personal',
                  });
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
                  analytics.trackEssayTypeSelected({
                    userId: user?.id,
                    date: new Date().toISOString(),
                    essayType: 'supplemental',
                  });
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
                  accept=".txt,.docx,.pdf,.doc"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p className="mt-1 ml-2 text-xs text-gray-500 text-left">
                  Supported formats: .txt, .docx, .pdf, .doc
                </p>
              </div>

              <textarea
                className={`w-full h-64 p-4 border rounded-lg focus:ring-2 resize-none transition-colors ${isSubmitting
                  ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                  : 'border-gray-200 focus:ring-primary-500 bg-white'
                  }`}
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Start writing your essay here..."
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className={`text-sm ${(() => {
                const currentWordCount = essay.trim().split(/\s+/).filter(Boolean).length;
                const displayLimit = essayType === 'personal' ? 650 : (selectedPrompt?.word_count || 0);
                return currentWordCount > displayLimit ? 'text-red-600' : 'text-gray-500';
              })()}`}>
                Words: {essay.trim().split(/\s+/).filter(Boolean).length} / {essayType === 'personal' ? 650 : selectedPrompt?.word_count}
              </span>
              <div className="space-x-4">
                <button
                  onClick={() => {
                    setCurrentStep(essayType === 'personal' ? 'prompt' : 'prompt');
                    setSelectedPrompt(null);
                  }}
                  disabled={isSubmitting}
                  className={`text-sm transition-colors ${isSubmitting
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-primary-600 hover:text-primary-800'
                    }`}
                >
                  Choose Different Prompt
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || creditsLoading}
                  className={`px-4 py-2 rounded-lg text-white transition-colors inline-flex items-center gap-2 ${isSubmitting
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Request Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Your Essay</h3>
          <p className="text-gray-600">{loadingStep}</p>
        </div>
        <p className="text-sm text-gray-500">
          This may take a few moments while we generate your personalized feedback...
        </p>
      </div>
    </div>
  );

  const handleAuthSuccess = useCallback(async () => {
    await refetchCredits();
    ActionPersistenceService.clearPendingRequirement();
    setShowAuthModal(false);
  }, [refetchCredits]);
  const handleAuthClose = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const handleDuplicateModalClose = useCallback(() => {
    setShowDuplicateModal(false);
    setDuplicateError(null);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      {isSubmitting && <LoadingOverlay />}

      <div className="bg-white p-8 rounded-lg shadow-lg">
        {renderStepIndicator()}
        {renderContent()}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
      />

      {/* Duplicate Submission Modal */}
      {duplicateError && (
        <DuplicateSubmissionModal
          message={duplicateError.message}
          submissionCount={duplicateError.submissionCount}
          isOpen={showDuplicateModal}
          onClose={handleDuplicateModalClose}
        />
      )}
    </div>
  );
}
export default memo(EssayWizard);
