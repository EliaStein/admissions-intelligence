import React from 'react';

interface StudentInfoFormProps {
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  error?: string;
}

export function StudentInfoForm({
  studentFirstName,
  studentLastName,
  studentEmail,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onSubmit,
  onBack,
  isSubmitting,
  error
}: StudentInfoFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Student Information</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="studentFirstName" className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              id="studentFirstName"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={studentFirstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="studentLastName" className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              id="studentLastName"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={studentLastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700">
            Email Address *
          </label>
          <input
            id="studentEmail"
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={studentEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Back to Essay
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-md text-white ${
            isSubmitting 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Essay'}
        </button>
      </div>
    </div>
  );
}