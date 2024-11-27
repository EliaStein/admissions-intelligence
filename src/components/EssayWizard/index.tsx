import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../../config/emailjs';
import { StepIndicator } from './StepIndicator';
import { EssayTypeStep } from './EssayTypeStep';
import { SchoolStep } from './SchoolStep';
import { PromptStep } from './PromptStep';
import { EssayStep } from './EssayStep';
import { ContactStep } from './ContactStep';
import { SuccessStep } from './SuccessStep';
import type { EssayType, School, FormData } from './types';

const initialFormData: FormData = {
  essayType: null,
  school: null,
  prompt: '',
  essayText: '',
  firstName: '',
  lastName: '',
  email: '',
};

export function EssayWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [essayFile, setEssayFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const essayContent = essayFile 
        ? await essayFile.text() 
        : formData.essayText;

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          essay_type: formData.essayType,
          school: formData.school?.name || 'N/A',
          essay_prompt: formData.prompt,
          essay_text: essayContent,
        }
      );
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData(initialFormData);
    setEssayFile(null);
    setIsSuccess(false);
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (isSuccess) {
    return <SuccessStep onReset={resetForm} />;
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "What essay would you like help with?";
      case 2:
        return formData.essayType === 'supplemental' 
          ? "Select a school" 
          : "Choose your prompt";
      case 3:
        return formData.essayType === 'supplemental'
          ? "Choose your prompt"
          : "Write or upload your essay";
      case 4:
        return formData.essayType === 'supplemental'
          ? "Write or upload your essay"
          : "Enter your contact information";
      case 5:
        return "Enter your contact information";
      default:
        return "";
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <EssayTypeStep
            onSelect={(type) => {
              setFormData({ ...formData, essayType: type });
              setStep(2);
            }}
          />
        );
      case 2:
        return formData.essayType === 'supplemental' ? (
          <SchoolStep
            onSelect={(school) => {
              setFormData({ ...formData, school });
              setStep(3);
            }}
          />
        ) : (
          <PromptStep
            onSelect={(prompt) => {
              setFormData({ ...formData, prompt });
              setStep(3);
            }}
          />
        );
      case 3:
        return formData.essayType === 'supplemental' ? (
          <PromptStep
            school={formData.school}
            onSelect={(prompt) => {
              setFormData({ ...formData, prompt });
              setStep(4);
            }}
          />
        ) : (
          <EssayStep
            essayText={formData.essayText}
            essayFile={essayFile}
            onTextChange={(text) => setFormData({ ...formData, essayText: text })}
            onFileChange={setEssayFile}
            onNext={() => setStep(4)}
          />
        );
      case 4:
        return formData.essayType === 'supplemental' ? (
          <EssayStep
            essayText={formData.essayText}
            essayFile={essayFile}
            onTextChange={(text) => setFormData({ ...formData, essayText: text })}
            onFileChange={setEssayFile}
            onNext={() => setStep(5)}
          />
        ) : (
          <ContactStep
            firstName={formData.firstName}
            lastName={formData.lastName}
            email={formData.email}
            isSubmitting={isSubmitting}
            onFirstNameChange={(value) => setFormData({ ...formData, firstName: value })}
            onLastNameChange={(value) => setFormData({ ...formData, lastName: value })}
            onEmailChange={(value) => setFormData({ ...formData, email: value })}
            onSubmit={handleSubmit}
          />
        );
      case 5:
        return (
          <ContactStep
            firstName={formData.firstName}
            lastName={formData.lastName}
            email={formData.email}
            isSubmitting={isSubmitting}
            onFirstNameChange={(value) => setFormData({ ...formData, firstName: value })}
            onLastNameChange={(value) => setFormData({ ...formData, lastName: value })}
            onEmailChange={(value) => setFormData({ ...formData, email: value })}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xl">
      <StepIndicator currentStep={step} essayType={formData.essayType} />
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          {getStepTitle()}
        </h2>

        {renderCurrentStep()}
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
