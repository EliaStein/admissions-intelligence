'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Mail, CreditCard, Calendar, FileText, Plus, ArrowRight } from 'lucide-react';
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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    <main className="max-w-7xl mx-auto px-4 py-8 mt-0">
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
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account and view your essays</p>
      </div>

      {/* User Information Card */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Account Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-sm text-gray-900">{userData.first_name} {userData.last_name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{userData.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Available Credits</p>
                  <p className="text-sm text-gray-900">{userData.credits}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-sm text-gray-900">{formatDate(userData.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credits Section */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Credits
            </h3>
            <Link
              href="/purchase-credits"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Purchase More Credits
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{userData.credits}</p>
              <p className="text-sm text-gray-500">Available Credits</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Each essay feedback costs 1 credit</p>
              <Link
                href="/purchase-credits"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center mt-1"
              >
                Purchase More Credits
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Essays Section */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              My Essays ({essays.length})
            </h3>
            <Link
              href="/essay-wizard"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Write New Essay
            </Link>
          </div>
        </div>

        {essays.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No essays yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by writing your first essay.</p>
            <div className="mt-6">
              <Link
                href="/essay-wizard"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write Your First Essay
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {essays.map((essay) => (
              <div key={essay.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium text-gray-900">
                          {essay.personal_statement ? 'Personal Statement' : 'Supplemental Essay'}
                        </span>
                      </div>
                      {essay.student_college && (
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{essay.student_college}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(essay.created_at)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Prompt:</span> {essay.selected_prompt}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        essay.essay_feedback
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {essay.essay_feedback ? 'Feedback Available' : 'No Feedback Yet'}
                      </span>
                    </div>
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
