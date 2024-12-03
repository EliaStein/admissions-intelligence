import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, MessageSquare, Loader2, CheckCircle, Upload } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';
import { essayService } from '../services/essayService';
import { School } from '../types/essay';

type EssayType = 'personal' | 'supplemental' | null;

const PERSONAL_STATEMENT_PROMPTS = [
  "Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.",
  "The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?",
  "Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?",
  "Reflect on something that someone has done for you that has made you happy or thankful in a surprising way. How has this gratitude affected or motivated you?",
  "Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.",
  "Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?",
  "Share an essay on any topic of your choice. It can be one you've already written, one that responds to a different prompt, or one of your own design."
];

export function EssayWizard() {
  const [step, setStep] = useState(1);
  const [essayType, setEssayType] = useState<EssayType>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [essayText, setEssayText] = useState('');
  const [essayFile, setEssayFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    // Get schools from the essay service
    const updateSchools = () => {
      const currentSchools = essayService.getSchools();
      if (currentSchools.length > 0) {
        setSchools(currentSchools);
      }
    };

    // Initial load
    updateSchools();

    // Set up polling to check for updates
    const interval = setInterval(updateSchools, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEssayFile(e.target.files[0]);
      setEssayText('');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEssayText(e.target.value);
    setEssayFile(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const essayContent = essayFile 
        ? await essayFile.text() 
        : essayText;

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          email,
          first_name: firstName,
          last_name: lastName,
          essay_type: essayType,
          school: selectedSchool?.name || 'N/A',
          essay_prompt: selectedPrompt,
          essay_text: essayContent,
        }
      );
      
      setIsSuccess(true);
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setEssayType(null);
    setSelectedSchool(null);
    setSelectedPrompt('');
    setEssayText('');
    setEssayFile(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setIsSuccess(false);
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStepIndicator = () => {
    const totalSteps = essayType === 'personal' ? 4 : 5;
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center max-w-xs mx-auto">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <React.Fragment key={index}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index + 1 === step ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}>
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div className="flex-1 h-1 bg-gray-200 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  if (isSuccess) {
    return (
      <div className="text-center p-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
        <p className="text-gray-600 mb-6">
          Your essay has been submitted successfully. We'll send detailed feedback to your email shortly.
        </p>
        <button
          onClick={resetForm}
          className="bg-primary-600 text-white px-6 py-3 rounded-full hover:bg-primary-700 transition-colors"
        >
          Submit Another Essay
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xl">
      {renderStepIndicator()}
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          What essay would you like help with?
        </h2>

        {step === 1 && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setEssayType('personal');
                setStep(2);
              }}
              className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
            >
              Personal Statement
            </button>
            <button
              onClick={() => {
                setEssayType('supplemental');
                setStep(2);
              }}
              className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
            >
              Supplemental Essays
            </button>
          </div>
        )}

        {step === 2 && essayType === 'personal' && (
          <div className="space-y-4">
            {PERSONAL_STATEMENT_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedPrompt(prompt);
                  setStep(3);
                }}
                className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {step === 2 && essayType === 'supplemental' && (
          <div className="space-y-4">
            {schools.length > 0 ? (
              schools.map((school) => (
                <button
                  key={school.name}
                  onClick={() => {
                    setSelectedSchool(school);
                    setStep(3);
                  }}
                  className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900">{school.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {school.prompts.length} {school.prompts.length === 1 ? 'prompt' : 'prompts'} available
                  </p>
                </button>
              ))
            ) : (
              <div className="text-center text-gray-600 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No supplemental essays available yet.</p>
                <p className="text-sm mt-2">Please check back later or contact support.</p>
              </div>
            )}
          </div>
        )}

        {step === 3 && essayType === 'supplemental' && selectedSchool && (
          <div className="space-y-4">
            {selectedSchool.prompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedPrompt(prompt.prompt);
                  setStep(4);
                }}
                className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
              >
                <p className="text-gray-900 mb-2">{prompt.prompt}</p>
                <p className="text-sm text-gray-600">Word limit: {prompt.wordCount}</p>
              </button>
            ))}
          </div>
        )}

        {((essayType === 'personal' && step === 3) || (essayType === 'supplemental' && step === 4)) && (
          <div className="space-y-6">
            <div className="space-y-4">
              <textarea
                placeholder="Enter your essay here..."
                value={essayText}
                onChange={handleTextChange}
                disabled={!!essayFile}
                className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
              />
              <div className="text-center">
                <span className="text-gray-500">or</span>
              </div>
              <div className="flex justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
                    <Upload className="w-5 h-5" />
                    <span>{essayFile ? essayFile.name : 'Upload File'}</span>
                  </div>
                </label>
              </div>
            </div>
            {(essayText || essayFile) && (
              <button
                onClick={() => setStep(step + 1)}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-full hover:bg-primary-700 transition-colors"
              >
                Request Feedback
              </button>
            )}
          </div>
        )}

        {((essayType === 'personal' && step === 4) || (essayType === 'supplemental' && step === 5)) && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border-2 border-gray-200 rounded-lg"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!firstName || !lastName || !email || isSubmitting}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Essay'
              )}
            </button>
          </div>
        )}
      </div>

      {step > 1 && (
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      )}
    </div>
  );
}
