'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, Users, Gift } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SharingOptionsWidget from './SharingOptionsWidget';
import ReferralUrlWidget from './ReferralUrlWidget';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    ViralLoops: {
      getCampaign(): Promise<{
        identify(data: { email: string }): void;
      }>;
    };
  }
}

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeViralLoops = useCallback(async () => {
    if (!user?.email) {
      // Don't try to initialize if there's no email
      setError('User email is not available.');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      let attempts = 0;
      const maxAttempts = 10;

      while (!window.ViralLoops && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.ViralLoops) {
        throw new Error('Viral Loops failed to load. Please refresh the page and try again.');
      }

      const campaign = await window.ViralLoops.getCampaign();
      campaign.identify({ email: user.email });

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing Viral Loops:', err);
      setError(err instanceof Error ? err.message : 'Failed to load referral system');
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (isOpen) {
      initializeViralLoops();
    }
  }, [isOpen, initializeViralLoops]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 flex justify-between items-start border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Refer a Friend
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Share with friends and earn rewards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading referral system...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-3 bg-red-100 rounded-full mb-4">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-600 text-center mb-4">{error}</p>
              <button
                onClick={initializeViralLoops}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <div>
              {/* Reward Information */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Gift className="w-5 h-5 text-primary-600" />
                  <h4 className="font-semibold text-gray-900">How it works</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Share your referral link with friends</li>
                  <li>• When they sign up and make their first purchase, you get rewarded</li>
                  <li>• Earn 1 free credit for each successful referral</li>
                </ul>
              </div>

              {/* Viral Loops Widgets Container */}
              <div className="relative">
                <SharingOptionsWidget ucid='FSHsStRJfckdYQCLN0IvMZrMb4c' />
                <div className="relative -mt-4 bg-white pt-2 z-10">
                  <ReferralUrlWidget ucid='FSHsStRJfckdYQCLN0IvMZrMb4c' />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}