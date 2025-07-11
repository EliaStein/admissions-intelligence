'use client';

import React, { useState } from 'react';
import { LoginForm } from './auth/LoginForm';
import { CreateAccountForm } from './auth/CreateAccountForm';
import { ForgotPasswordForm } from './auth/ForgotPasswordForm';

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showForgotPassword
              ? 'Reset your password'
              : isLogin
                ? 'Sign in to your account'
                : 'Create your account'
            }
          </h2>
          {!showForgotPassword && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          )}
        </div>

        {showForgotPassword ? (
          <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
        ) : isLogin ? (
          <LoginForm
            onSuccess={onSuccess}
            onForgotPassword={() => setShowForgotPassword(true)}
          />
        ) : (
          <CreateAccountForm onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
}
