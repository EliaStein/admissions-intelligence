'use client';

import React, { useState, memo } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './auth/LoginForm';
import { CreateAccountForm } from './auth/CreateAccountForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="p-6 flex justify-between items-start border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {isLogin ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <CreateAccountForm onSuccess={handleSuccess} />
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AuthModal);
