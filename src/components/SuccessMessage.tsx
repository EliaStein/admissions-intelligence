import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  onReset: () => void;
}

export function SuccessMessage({ onReset }: SuccessMessageProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Essay Submitted Successfully!</h3>
      <div className="max-w-md mx-auto">
        <p className="text-gray-600 mb-8">
          Thank you for submitting your essay. We'll review it carefully and send detailed feedback to your email within 24 hours.
        </p>
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          Submit Another Essay
        </button>
      </div>
    </div>
  );
}
