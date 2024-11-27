import React from 'react';
import { School } from './types';
import { SCHOOLS } from './constants';

interface SchoolStepProps {
  onSelect: (school: School) => void;
}

export function SchoolStep({ onSelect }: SchoolStepProps) {
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
      {SCHOOLS.map((school, index) => (
        <button
          key={index}
          onClick={() => onSelect(school)}
          className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
        >
          {school.name}
        </button>
      ))}
    </div>
  );
}
