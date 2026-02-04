'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import { marked } from 'marked';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';

interface Essay {
  id: string;
  selected_prompt: string;
  student_college: string | null;
  personal_statement: boolean;
  created_at: string;
  essay_content: string;
  essay_feedback: string | null;
  student_email: string;
}

export default function EssayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feedback' | 'essay' | 'prompt'>('essay');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchEssay();
  }, [user, authLoading, params.id]);

  const fetchEssay = async () => {
    try {
      setLoading(true);
      setError(null);

      const essayId = Array.isArray(params.id) ? params.id[0] : params.id;
      if (!essayId || !user?.email) {
        setError('Invalid essay ID or user not authenticated.');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('essays')
        .select('*')
        .eq('id', essayId)
        .eq('student_email', user.email)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Essay not found or you do not have permission to view it.');
        } else {
          throw fetchError;
        }
        return;
      }

      const essayData = data as Essay;
      setEssay(essayData);

      // Set initial active tab based on whether feedback exists
      setActiveTab(essayData.essay_feedback ? 'feedback' : 'essay');
    } catch (err) {
      console.error('Error fetching essay:', err);
      setError('Failed to load essay. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <button
          onClick={() => router.push('/profile')}
          className="mt-4 flex items-center text-primary-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </button>
      </div>
    );
  }

  if (!essay) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Essay Not Found</h1>
          <p className="text-gray-600 mb-8">The essay you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center text-primary-600 hover:text-primary-700 transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center text-primary-600 hover:text-primary-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {essay.personal_statement ? 'Personal Statement' : essay.student_college}
                </h1>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  Submitted on {new Date(essay.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'feedback' && essay.essay_feedback && (
              <div>
                <div
                  className="text-gray-800 bg-blue-50 p-4 rounded-lg prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: marked(essay.essay_feedback)
                  }}
                />
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
      <Footer />
    </div>
  );
}
