'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, School, Calendar, Hash, Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import { EssayPromptModal } from './EssayPromptModal';
import { CSVImportModal } from './CSVImportModal';
import Papa from 'papaparse';

interface EssayPromptData {
  id: string;
  prompt: string;
  word_count: string;
  created_at: string;
  updated_at: string;
  schools: {
    id: string;
    name: string;
  } | null;
}

export function EssayPromptsList() {
  const [essayPrompts, setEssayPrompts] = useState<EssayPromptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<EssayPromptData | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchEssayPrompts();
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setSchools(data || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this essay prompt? This action cannot be undone.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`/api/admin/essay-prompts?id=${promptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete essay prompt');
      }

      // Refresh the prompts list
      fetchEssayPrompts();
    } catch (err) {
      console.error('Error deleting essay prompt:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete essay prompt');
    }
  };

  const fetchEssayPrompts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/admin/essay-prompts', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch essay prompts');
      }

      const data = await response.json();
      setEssayPrompts(data.essayPrompts);
    } catch (err) {
      console.error('Error fetching essay prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch essay prompts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const downloadCSV = () => {
    const csvData = essayPrompts.map(prompt => ({
      'School': prompt.schools?.name || 'No School',
      'Prompt': prompt.prompt,
      'Word Count': prompt.word_count,
      'Created Date': formatDate(prompt.created_at),
      'Updated Date': formatDate(prompt.updated_at),
      'ID': prompt.id
    }));

    const csv = Papa.unparse(csvData, {
      header: true,
      quotes: true,
      quoteChar: '"',
      escapeChar: '"',
      delimiter: ',',
      newline: '\n'
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `essay-prompts-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        <div className="text-red-800">Error: {error}</div>
        <button
          onClick={fetchEssayPrompts}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Essay Prompts ({essayPrompts.length})
            </h3>
            <p className="text-gray-600 mt-1">Manage essay prompts for different schools</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={downloadCSV}
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              disabled={essayPrompts.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Prompt
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prompt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Word Count
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
            {essayPrompts.map((prompt) => (
              <tr key={prompt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <School className="w-4 h-4 mr-2 text-gray-400" />
                    <div className="text-sm font-medium text-gray-900">
                      {prompt.schools?.name || 'No School'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-md">
                    <div className="font-medium mb-1">
                      {truncateText(prompt.prompt, 80)}
                    </div>
                    {prompt.prompt.length > 80 && (
                      <div className="text-xs text-gray-500">
                        {prompt.prompt.length} characters
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Hash className="w-4 h-4 mr-2 text-gray-400" />
                    {prompt.word_count}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(prompt.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingPrompt(prompt)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Edit Prompt"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete Prompt"
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
      </div>

      {essayPrompts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No essay prompts found</h3>
          <p className="mt-1 text-sm text-gray-500">No essay prompts have been created yet.</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <EssayPromptModal
          schools={schools}
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            setShowCreateModal(false);
            fetchEssayPrompts();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingPrompt && (
        <EssayPromptModal
          schools={schools}
          prompt={editingPrompt}
          onClose={() => setEditingPrompt(null)}
          onSave={() => {
            setEditingPrompt(null);
            fetchEssayPrompts();
          }}
        />
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <CSVImportModal
          onClose={() => setShowImportModal(false)}
          onImportComplete={() => {
            setShowImportModal(false);
            fetchEssayPrompts();
          }}
        />
      )}
    </div>
  );
}
