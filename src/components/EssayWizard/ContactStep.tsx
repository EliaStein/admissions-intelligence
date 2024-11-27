import React from 'react';
import { Loader2 } from 'lucide-react';

interface ContactStepProps {
  firstName: string;
  lastName: string;
  email: string;
  isSubmitting: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
}

export function ContactStep({
  firstName,
  lastName,
  email,
  isSubmitting,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onSubmit,
}: ContactStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
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
            onChange={(e) => onLastNameChange(e.target.value)}
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
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full p-2 border-2 border-gray-200 rounded-lg"
        />
      </div>
      <button
        onClick={onSubmit}
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
  );
}
