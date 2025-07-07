'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, User, Mail, Calendar, CreditCard, FileText, Clock, School, Edit } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UserEditModal } from '@/components/admin/UserEditModal';
import { UserFetch } from '@/app/utils/user-fetch';

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  credits: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EssayData {
  id: string;
  selected_prompt: string;
  personal_statement: string;
  student_college: string;
  essay_content: string;
  essay_feedback: string | null;
  created_at: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<UserData | null>(null);
  const [essays, setEssays] = useState<EssayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEssay, setSelectedEssay] = useState<EssayData | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await UserFetch.get<{ user: UserData; essays: EssayData[] }>(`/api/admin/users/${userId}`);
      setUser(data.user);
      setEssays(data.essays);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, fetchUserDetails]);

  const handleEditUser = () => {
    if (user) {
      setEditingUser(user);
    }
  };

  const truncateText = (text: string | null | undefined, maxLength: number = 150) => {
    if (!text || typeof text !== 'string') return 'No content';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8 mt-0">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute adminOnly>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8 mt-0">
            <div className="text-center">
              <div className="text-red-600 text-lg">{error}</div>
              <Link
                href="/admin/users"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 mt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Users
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute adminOnly>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8 mt-0">
            <div className="text-center">
              <div className="text-gray-600 text-lg">User not found</div>
              <Link
                href="/admin/users"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 mt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Users
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 py-8 mt-0">
          <div className="mb-8">
            <Link
              href="/admin/users"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              User Details: {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-600 mt-2">View user information and essays</p>
          </div>

          {/* User Information Card */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  User Information
                </h3>
                <button
                  onClick={handleEditUser}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-sm text-gray-900">{user.first_name} {user.last_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Credits</p>
                      <p className="text-sm text-gray-900">{user.credits}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full ${user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <p className="text-sm text-gray-900 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-sm text-gray-900">{user.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-sm text-gray-900">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Essays */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Essays ({essays.length})
              </h3>
            </div>
            
            {essays.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No essays found</h3>
                <p className="mt-1 text-sm text-gray-500">This user hasn't submitted any essays yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {essays.map((essay) => (
                  <div key={essay.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <School className="w-4 h-4 mr-1" />
                            {essay.student_college || 'No college specified'}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(essay.created_at)}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Prompt:</p>
                          <p className="text-sm text-gray-600">{essay.selected_prompt}</p>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Personal Statement:</p>
                          <p className="text-sm text-gray-600">{truncateText(essay.personal_statement)}</p>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Essay Content:</p>
                          <p className="text-sm text-gray-600">{truncateText(essay.essay_content)}</p>
                        </div>
                        
                        {essay.essay_feedback && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                            <p className="text-sm text-gray-600">{truncateText(essay.essay_feedback)}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <button
                          onClick={() => setSelectedEssay(essay)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View Full Essay
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Essay View Modal */}
      {selectedEssay && (
        <EssayViewModal
          essay={selectedEssay}
          onClose={() => setSelectedEssay(null)}
        />
      )}

      {/* User Edit Modal */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(updatedUser: UserData) => {
            // Update the user data
            setUser(updatedUser);
            setEditingUser(null);
          }}
        />
      )}
    </ProtectedRoute>
  );
}

// Essay View Modal Component
interface EssayViewModalProps {
  essay: EssayData;
  onClose: () => void;
}

function EssayViewModal({ essay, onClose }: EssayViewModalProps) {
  const [activeTab, setActiveTab] = React.useState<'content' | 'feedback' | 'prompt' | 'personal'>('content');

  const tabs = [
    { id: 'content' as const, label: 'Essay Content' },
    { id: 'feedback' as const, label: 'Feedback' },
    { id: 'prompt' as const, label: 'Prompt' },
  ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50"
      onClick={handleBackdropClick}
    >
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Essay Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="font-medium text-gray-700">College:</span>
                  <span className="ml-2 text-gray-900">{essay.student_college || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-900">{formatDate(essay.created_at)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

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
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'content' && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Essay Content:</h4>
                <div className="text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                  {essay.essay_content}
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Feedback:</h4>
                {essay.essay_feedback ? (
                  <div className="text-gray-900 bg-blue-50 p-4 rounded-md whitespace-pre-wrap">
                    {essay.essay_feedback}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <FileText className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500">No AI feedback available for this essay.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prompt' && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Writing Prompt:</h4>
                <div className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {essay.selected_prompt}
                </div>
              </div>
            )}

            {activeTab === 'personal' && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Personal Statement:</h4>
                <div className="text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                  {essay.personal_statement || 'No personal statement content available.'}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
