'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { FileText, Calendar, PenLine, X, CreditCard, Plus, Users, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { ReferralModal } from './ReferralModal';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Essay {
  id: string;
  selected_prompt: string;
  student_college: string | null;
  personal_statement: boolean;
  created_at: string;
  essay_content: string;
  essay_feedback: string | null;
}

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFirstName: string;
  currentLastName: string;
  onSave: (firstName: string, lastName: string) => Promise<void>;
}

interface EssayModalProps {
  essay: Essay;
  onClose: () => void;
}

function EditNameModal({ isOpen, onClose, currentFirstName, currentLastName, onSave }: EditNameModalProps) {
  const [firstName, setFirstName] = useState(currentFirstName);
  const [lastName, setLastName] = useState(currentLastName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFirstName(currentFirstName);
      setLastName(currentLastName);
      setError(null);
    }
  }, [isOpen, currentFirstName, currentLastName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSave(firstName.trim(), lastName.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Edit Name</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                maxLength={50}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                maxLength={50}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EssayModal({ essay, onClose }: EssayModalProps) {
  const [activeTab, setActiveTab] = useState<'feedback' | 'essay' | 'prompt'>(
    essay.essay_feedback ? 'feedback' : 'essay'
  );

  const tabs = essay.essay_feedback
    ? [
        { id: 'feedback' as const, label: 'Feedback' },
        { id: 'essay' as const, label: 'Your Essay' },
        { id: 'prompt' as const, label: 'Prompt' },
      ]
    : [
        { id: 'essay' as const, label: 'Your Essay' },
        { id: 'prompt' as const, label: 'Prompt' },
      ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 flex justify-between items-start border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {essay.personal_statement ? 'Personal Statement' : essay.student_college}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Submitted on {new Date(essay.created_at).toLocaleDateString()}
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
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-280px)]">
            {activeTab === 'feedback' && essay.essay_feedback && (
              <div>
                <div className="text-gray-800 bg-blue-50 p-4 rounded-lg whitespace-pre-wrap">
                  {essay.essay_feedback}
                </div>
              </div>
            )}

            {activeTab === 'essay' && (
              <div>
                <div className="whitespace-pre-line text-gray-800 bg-gray-50 p-4 rounded-lg leading-relaxed">
                  {essay.essay_content}
                </div>
              </div>
            )}

            {activeTab === 'prompt' && (
              <div>
                <div className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {essay.selected_prompt}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);

  useEffect(() => {
    // Check for payment success parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      setShowPaymentSuccess(true);
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    async function loadProfile() {
      setError(null);

      if (authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('first_name, last_name, email, role, created_at')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error('Profile not found');

        setProfile(profileData);

        // Fetch user's essays
        const { data: essaysData, error: essaysError } = await supabase
          .from('essays')
          .select('*')
          .eq('student_email', user.email)
          .order('created_at', { ascending: false });

        if (essaysError) throw essaysError;
        setEssays(essaysData || []);
      } catch (err) {
        console.error('Profile loading error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, authLoading]);

  const handleSaveName = async (firstName: string, lastName: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update name');
      }

      const result = await response.json();

      // Update the local profile state
      setProfile(prev => prev ? {
        ...prev,
        first_name: result.user.first_name,
        last_name: result.user.last_name,
      } : null);

    } catch (error) {
      console.error('Error updating name:', error);
      throw error;
    }
  };

  const handlePurchaseCredits = () => {
    // Navigate to credit purchase page
    window.location.href = '/purchase-credits';
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!profile && !loading && error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your profile information. This might be because your account was recently created.
          </p>
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-6">Your credits have been added to your account.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/essay-wizard"
                    className="inline-flex items-center justify-center bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors font-medium"
                  >
                    <PenLine className="w-4 h-4 mr-2" />
                    Write Essay
                  </Link>
                  <button
                    onClick={() => setShowPaymentSuccess(false)}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
          <button
            onClick={() => setShowEditNameModal(true)}
            className="text-primary-600 hover:text-primary-700 transition-colors p-2 rounded-md hover:bg-primary-50"
            title="Edit name"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-medium text-gray-900">
              {profile.first_name} {profile.last_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium text-gray-900">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Type</p>
            <p className="text-lg font-medium text-gray-900 capitalize">{profile.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="text-lg font-medium text-gray-900">
              {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Credits Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <p className="text-sm text-gray-500">Available Credits</p>
                <p className=" font-bold text-primary-600">
                  <CreditCard className="h-6 w-6 mb-2 mr-2 text-primary-600 inline-block"/>
                  <span className='text-2xl'>{creditsLoading ? '-' : credits}</span>
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowReferralModal(true)}
                className="inline-flex items-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Refer a Friend
              </button>
              <button
                onClick={handlePurchaseCredits}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buy More Credits
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Each essay feedback costs 1 credit. Purchase more credits to continue getting feedback.
          </p>
        </div>
      </div>

      {/* Essays */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Essays</h2>
          {essays.length > 0 && (
            <Link
              href="/essay-wizard"
              className="flex items-center text-primary-600 border-gray-200 hover:text-primary-700 transition-colors"
            >
              <PenLine className="w-4 h-4 mr-2" />
              Write New Essay
            </Link>
          )}
        </div>

        {essays.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Essays Yet
            </h3>
            <p className="text-gray-500 mb-8">
              Start your college application journey by writing your first essay.
            </p>
            <Link
              href="/essay-wizard"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg border-gray-200 hover:bg-primary-700 transition-colors"
            >
              <PenLine className="w-5 h-5 mr-2" />
              Write Your First Essay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {essays.map((essay) => (
              <button
                key={essay.id}
                onClick={() => setSelectedEssay(essay)}
                className="w-full text-left border rounded-lg p-4 border-gray-200 hover:border-primary-500 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <h3 className="font-medium text-gray-900">
                      {essay.personal_statement ? 'Personal Statement' : essay.student_college}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {essay.essay_content.length > 150
                        ? `${essay.essay_content.substring(0, 150)}...`
                        : essay.essay_content}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 flex-shrink-0">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(essay.created_at).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Essay Modal */}
      {selectedEssay && (
        <EssayModal
          essay={selectedEssay}
          onClose={() => setSelectedEssay(null)}
        />
      )}

      {/* Edit Name Modal */}
      <EditNameModal
        isOpen={showEditNameModal}
        onClose={() => setShowEditNameModal(false)}
        currentFirstName={profile?.first_name || ''}
        currentLastName={profile?.last_name || ''}
        onSave={handleSaveName}
      />

      {/* Referral Modal */}
      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />
    </div>
  );
}
