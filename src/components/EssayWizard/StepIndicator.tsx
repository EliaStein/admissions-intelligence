import React from 'react';
import { EssayType } from './types';

interface StepIndicatorProps {
  currentStep: number;
  essayType: EssayType;
}

export function StepIndicator({ currentStep, essayType }: StepIndicatorProps) {
  const totalSteps = essayType === 'personal' ? 4 : 5;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center max-w-xs mx-auto">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index + 1 === currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200'
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
}
