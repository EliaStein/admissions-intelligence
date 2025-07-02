'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, User, Calendar, Search, Filter, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EssayData {
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
  updated_at: string;
  user_info: {
    id: string;
    credits: number;
    role: string;
    is_active: boolean;
  } | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function AdminEssaysList() {
  const router = useRouter();
  const [essays, setEssays] = useState<EssayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // The actual search query used for API calls
  const [personalStatementFilter, setPersonalStatementFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [selectedEssay, setSelectedEssay] = useState<EssayData | null>(null);
  const [selectedEssays, setSelectedEssays] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Reset pagination when search query or filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchQuery, personalStatementFilter]);

  const fetchEssays = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (personalStatementFilter !== 'all') {
        params.append('personal_statement', personalStatementFilter);
      }

      const response = await fetch(`/api/admin/essays?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch essays');
      }

      const data = await response.json();
      setEssays(data.essays);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching essays:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch essays');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, personalStatementFilter]);

  useEffect(() => {
    fetchEssays();
  }, [pagination.page, searchQuery, personalStatementFilter, fetchEssays]);

  const handleDeleteEssay = async (essayId: string) => {
    if (!confirm('Are you sure you want to delete this essay? This action cannot be undone.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`/api/admin/essays?id=${essayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete essay');
      }

      // Refresh the essays list
      fetchEssays();
    } catch (err) {
      console.error('Error deleting essay:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete essay');
    }
  };

  const handleSelectEssay = (essayId: string, checked: boolean) => {
    const newSelected = new Set(selectedEssays);
    if (checked) {
      newSelected.add(essayId);
    } else {
      newSelected.delete(essayId);
    }
    setSelectedEssays(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchTerm);
    }
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchTerm);
  };



  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(essays.map(essay => essay.id));
      setSelectedEssays(allIds);
      setShowBulkActions(true);
    } else {
      setSelectedEssays(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEssays.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedEssays.size} essays? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Delete essays one by one (could be optimized with a bulk delete endpoint)
      const deletePromises = Array.from(selectedEssays).map(essayId =>
        fetch(`/api/admin/essays?id=${essayId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        })
      );

      await Promise.all(deletePromises);

      // Clear selection and refresh
      setSelectedEssays(new Set());
      setShowBulkActions(false);
      fetchEssays();
    } catch (err) {
      console.error('Error bulk deleting essays:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete essays');
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Essays Management</h2>
            <p className="text-gray-600 mt-1">View and manage all submitted essays</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search essays... (Press Enter to search)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
                />
              </div>
              <button
                onClick={handleSearchSubmit}
                className="px-3 py-2 bg-primary-600 text-white border border-primary-600 rounded-r-md hover:bg-primary-700 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={personalStatementFilter}
                onChange={(e) => setPersonalStatementFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
              >
                <option value="all">All Essays</option>
                <option value="true">Personal Statements</option>
                <option value="false">Supplemental Essays</option>
              </select>
            </div>


          </div>
        </div>
        
        {/* Stats and Bulk Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <FileText className="w-4 h-4 mr-1" />
            {pagination.total} total essays
          </div>

          {showBulkActions && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedEssays.size} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => {
                  setSelectedEssays(new Set());
                  setShowBulkActions(false);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Essays Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedEssays.size === essays.length && essays.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Essay Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prompt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {essays.map((essay) => (
                <tr key={essay.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEssays.has(essay.id)}
                      onChange={(e) => handleSelectEssay(essay.id, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {essay.user_info?.id ? (
                            <button
                              onClick={() => handleViewUser(essay.user_info!.id)}
                              className="hover:text-primary-600 hover:underline transition-colors cursor-pointer text-left"
                              title="View User Details"
                            >
                              {essay.student_first_name} {essay.student_last_name}
                            </button>
                          ) : (
                            <span>{essay.student_first_name} {essay.student_last_name}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{essay.student_email}</div>
                        {essay.student_college && (
                          <div className="text-xs text-gray-400">{essay.student_college}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      essay.personal_statement 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {essay.personal_statement ? 'Personal Statement' : 'Supplemental'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {truncateText(essay.selected_prompt, 100)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(essay.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedEssay(essay)}
                        className="text-primary-600 hover:text-primary-900 p-1 rounded"
                        title="View Essay"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEssay(essay.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete Essay"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Essay View Modal */}
      {selectedEssay && (
        <EssayViewModal
          essay={selectedEssay}
          onClose={() => setSelectedEssay(null)}
        />
      )}
    </div>
  );
}

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
                Essay by {essay.student_first_name} {essay.student_last_name}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">{essay.student_email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">College:</span>
                  <span className="ml-2 text-gray-900">{essay.student_college || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      essay.personal_statement
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {essay.personal_statement ? 'Personal Statement' : 'Supplemental Essay'}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-900">{new Date(essay.created_at).toLocaleString()}</span>
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
