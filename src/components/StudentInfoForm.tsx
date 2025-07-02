'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, Send } from 'lucide-react';

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
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleFirstNameBlur = () => {
    if (!studentFirstName.trim()) {
      setFirstNameError('First name is required');
    } else {
      setFirstNameError('');
    }
  };

  const handleLastNameBlur = () => {
    if (!studentLastName.trim()) {
      setLastNameError('Last name is required');
    } else {
      setLastNameError('');
    }
  };

  const handleEmailBlur = () => {
    if (!studentEmail) {
      setEmailError('Email is required');
    } else if (!validateEmail(studentEmail)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Student Information</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="studentFirstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              id="studentFirstName"
              type="text"
              className={`block w-full px-4 py-2 rounded-lg shadow-sm transition-colors
                ${firstNameError 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                } bg-white`}
              value={studentFirstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              onBlur={handleFirstNameBlur}
              required
            />
            {firstNameError && (
              <p className="mt-1 text-sm text-red-600">{firstNameError}</p>
            )}
          </div>

          <div>
            <label htmlFor="studentLastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              id="studentLastName"
              type="text"
              className={`block w-full px-4 py-2 rounded-lg shadow-sm transition-colors
                ${lastNameError 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                } bg-white`}
              value={studentLastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              onBlur={handleLastNameBlur}
              required
            />
            {lastNameError && (
              <p className="mt-1 text-sm text-red-600">{lastNameError}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            id="studentEmail"
            type="email"
            className={`block w-full px-4 py-2 rounded-lg shadow-sm transition-colors
              ${emailError 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
              } bg-white`}
            value={studentEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
            required
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error === 'INSUFFICIENT_CREDITS' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                You need at least 1 credit to get feedback.
              </span>
              <Link href="/purchase-credits">
                <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1">
                  Purchase Credits
                </button>
              </Link>
            </div>
          ) : (
            error
          )}
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onBack}
          className="text-sm text-primary-600 hover:text-primary-800 transition-colors"
        >
          Back to Essay
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !!firstNameError || !!lastNameError || !!emailError}
          className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center gap-2 ${
            isSubmitting || firstNameError || lastNameError || emailError
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg transform hover:-translate-y-0.5'
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
              <span>Submit Essay</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
