'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { GoogleAuthButton } from './GoogleAuthButton';
import { useAnalytics } from '../../hooks/useAnalytics';

interface CreateAccountFormProps {
  onSuccess?: () => void;
}

interface PasswordRequirement {
  regex: RegExp;
  message: string;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { regex: /.{8,}/, message: 'At least 8 characters long' },
  { regex: /[A-Z]/, message: 'Contains uppercase letter' },
  { regex: /[a-z]/, message: 'Contains lowercase letter' },
  { regex: /[0-9]/, message: 'Contains number' },
  { regex: /[^A-Za-z0-9]/, message: 'Contains special character' }
];

export function CreateAccountForm({ onSuccess }: CreateAccountFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState<'student' | 'parent'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const analytics = useAnalytics();

  useEffect(() => {
    // Check for referral code in localStorage
    const storedReferralCode = localStorage.getItem('referralCode');
    if (storedReferralCode) {
      setReferralCode(storedReferralCode);
    }
  }, []);

  const validatePassword = (pass: string): boolean => {
    return PASSWORD_REQUIREMENTS.every(req => req.regex.test(pass));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!validatePassword(password)) {
        setError('Password does not meet requirements');
        setLoading(false);
        return;
      }

      await authService.signUp({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        userType,
        referralCode: referralCode || undefined,
      });

      analytics.trackAccountCreated({
        date: new Date().toISOString(),
        user: email.toLowerCase(),
      });

      if (referralCode) {
        localStorage.removeItem('referralCode');
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* User Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          I am a:
        </label>
        <div className="flex justify-center space-x-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="userType"
              value="student"
              checked={userType === 'student'}
              onChange={(e) => setUserType(e.target.value as 'student' | 'parent')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Student</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="userType"
              value="parent"
              checked={userType === 'parent'}
              onChange={(e) => setUserType(e.target.value as 'student' | 'parent')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Parent</span>
          </label>
        </div>
      </div>

      {/* Google Sign Up Button */}
      <GoogleAuthButton
        mode="signup"
        userType={userType}
        onError={setError}
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <div>
            <label htmlFor="firstName" className="sr-only">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="First Name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="lastName" className="sr-only">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowPasswordRequirements(true)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
        </div>

        {showPasswordRequirements && (
          <div className="text-sm space-y-2">
            <p className="font-medium text-gray-700">Password requirements:</p>
            <ul className="space-y-1">
              {PASSWORD_REQUIREMENTS.map((req, index) => (
                <li
                  key={index}
                  className={`flex items-center space-x-2 ${req.regex.test(password) ? 'text-green-600' : 'text-gray-500'
                    }`}
                >
                  <span className="w-4 h-4">
                    {req.regex.test(password) ? '✓' : '•'}
                  </span>
                  <span>{req.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !validatePassword(password)}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Sign up'
          )}
        </button>
      </form>
    </div>
  );
}
