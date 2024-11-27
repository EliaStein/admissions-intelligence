import React from 'react';
import { EssayType } from './types';

interface EssayTypeStepProps {
  onSelect: (type: EssayType) => void;
}

export function EssayTypeStep({ onSelect }: EssayTypeStepProps) {
  return (
    <div className="space-y-4">
      <button
        onClick={() => onSelect('personal')}
        className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
      >
        Personal Statement
      </button>
      <button
        onClick={() => onSelect('supplemental')}
        className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
      >
        Supplemental Essays
      </button>
    </div>
  );
}
