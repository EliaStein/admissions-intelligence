import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { FileText, Calendar, PenLine, X } from 'lucide-react';
import { Link } from 'react-router-dom';

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
}

interface EssayModalProps {
  essay: Essay;
  onClose: () => void;
}

function EssayModal({ essay, onClose }: EssayModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 flex justify-between items-start border-b">
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
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Prompt:</h4>
            <p className="text-gray-600">{essay.selected_prompt}</p>
          </div>
          
          <div className="prose max-w-none">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Your Essay:</h4>
            <div className="whitespace-pre-wrap text-gray-800 font-serif">
              {essay.essay_content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!user) return;

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
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
  }, [user]);

  if (loading) {
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

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your profile information. This might be because your account was recently created.
          </p>
          <Link
            to="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Information</h2>
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
      </div>

      {/* Essays */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Essays</h2>
          {essays.length > 0 && (
            <Link
              to="/essay-wizard"
              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
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
              to="/essay-wizard"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
                className="w-full text-left border rounded-lg p-4 hover:border-primary-500 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {essay.personal_statement ? 'Personal Statement' : essay.student_college}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{essay.selected_prompt}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
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
    </div>
  );
}
