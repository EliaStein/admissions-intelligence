import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  onReset: () => void;
}

export function SuccessMessage({ onReset }: SuccessMessageProps) {
  return (
    <div className="text-center p-8">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
      <p className="text-gray-600 mb-6">
        Your essay has been submitted successfully. We'll send detailed feedback to your email shortly.
      </p>
      <button
        onClick={onReset}
        className="bg-primary-600 text-white px-6 py-3 rounded-full hover:bg-primary-700 transition-colors"
      >
        Submit Another Essay
      </button>
    </div>
  );
}
