'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';

interface AuthFormProps {
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

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const validatePassword = (pass: string): boolean => {
    return PASSWORD_REQUIREMENTS.every(req => req.regex.test(pass));
  };

  const getFailedRequirements = (pass: string): string[] => {
    return PASSWORD_REQUIREMENTS
      .filter(req => !req.regex.test(pass))
      .map(req => req.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          // More specific error messages based on error type
          if (error.message.includes("Invalid login credentials")) {
            // Check if email exists but password is wrong
            const { count } = await supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
              .eq('email', email.toLowerCase());
              
            if (count && count > 0) {
              throw new Error('Incorrect password. Please try again or reset your password.');
            } else {
              throw new Error('No account found with this email address. Please check the email or create a new account.');
            }
          } else {
            throw error;
          }
        }
      } else {
        // Validate password requirements
        if (!validatePassword(password)) {
          setError('Password does not meet requirements');
          setLoading(false);
          return;
        }

        // Sign up the user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        if (authData.user) {
          // Insert user data into your custom users table
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: email.toLowerCase(),
              first_name: firstName,
              last_name: lastName,
              role: 'student',
              is_active: true
            });

          if (userError) {
            // If user table insert fails, delete the auth user
            await supabase.auth.admin.deleteUser(authData.user.id);
            throw new Error('Failed to create user profile');
          }
        }
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setShowPasswordRequirements(false);
              }}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-2">
            {!isLogin && (
              <>
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
              </>
            )}
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
                  onFocus={() => !isLogin && setShowPasswordRequirements(true)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          {!isLogin && showPasswordRequirements && (
            <div className="text-sm space-y-2">
              <p className="font-medium text-gray-700">Password requirements:</p>
              <ul className="space-y-1">
                {PASSWORD_REQUIREMENTS.map((req, index) => (
                  <li
                    key={index}
                    className={`flex items-center space-x-2 ${
                      req.regex.test(password) ? 'text-green-600' : 'text-gray-500'
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
            disabled={loading || (!isLogin && !validatePassword(password))}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLogin ? 'Sign in' : 'Sign up'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
