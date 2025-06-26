'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, School, Calendar, Hash } from 'lucide-react';

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

  useEffect(() => {
    fetchEssayPrompts();
  }, []);

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
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Essay Prompts ({essayPrompts.length})
        </h3>
      </div>

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
                ID
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
                        Full text: {prompt.prompt.length} characters
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-500 font-mono">
                    {prompt.id.slice(0, 8)}...
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {essayPrompts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No essay prompts found</h3>
          <p className="mt-1 text-sm text-gray-500">No essay prompts have been created yet.</p>
        </div>
      )}
    </div>
  );
}
