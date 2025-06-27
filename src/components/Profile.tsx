'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, Calendar, Pen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  credits: number;
  is_active: boolean;
  created_at: string;
}

interface Essay {
  id: string;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  student_college: string | null;
  selected_prompt: string;
  personal_statement: boolean;
  essay_content: string;
  essay_feedback: string | null;
  created_at: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

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
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const { data: userInfo, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        setUserData(userInfo);

        // Fetch user essays based on email
        const { data: essayData, error: essayError } = await supabase
          .from('essays')
          .select('id, student_first_name, student_last_name, student_email, student_college, selected_prompt, personal_statement, essay_content, essay_feedback, created_at')
          .eq('student_email', userInfo.email)
          .order('created_at', { ascending: false });

        if (essayError) throw essayError;
        setEssays(essayData || []);

      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to load user data'}</p>
          <Link
            href="/"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-6">Your credits have been added to your account.</p>
              <button
                onClick={() => setShowPaymentSuccess(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <p className="text-gray-800 font-medium">{userData.first_name} {userData.last_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <p className="text-gray-800">{userData.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Account Type</label>
            <p className="text-gray-800 capitalize">{userData.role}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Member Since</label>
            <p className="text-gray-800">{formatDate(userData.created_at)}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Available Credits</label>
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-primary-600 mr-2" />
                <span className="text-2xl font-bold text-primary-600">{loading ? '-' : userData.credits}</span>
              </div>
            </div>
            <Link
              href="/purchase-credits"
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors inline-flex items-center text-sm font-medium"
            >
              + Buy More Credits
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-2">Each essay feedback costs 1 credit. Purchase more credits to continue getting feedback.</p>
        </div>
      </div>

      {/* Essays Section */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">Your Essays</h3>
            <Link
              href="/essay-wizard"
              className="text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center text-sm font-medium"
            >
              <Edit className="w-4 h-4 mr-1" />
              Write New Essay
            </Link>
          </div>
        </div>

        {essays.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Edit className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No essays yet</h3>
            <p className="text-gray-500 mb-6">Get started by writing your first essay.</p>
            <Link
              href="/essay-wizard"
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors inline-flex items-center text-sm font-medium"
            >
              <Edit className="w-4 h-4 mr-2" />
              Write Your First Essay
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {essays.map((essay) => (
              <div key={essay.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-800">
                        {essay.student_college || (essay.personal_statement ? 'Personal Statement' : 'Supplemental Essay')}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(essay.created_at)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {essay.selected_prompt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
