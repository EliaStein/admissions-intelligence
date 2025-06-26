'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface School {
  id: string;
  name: string;
}

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

interface EssayPromptModalProps {
  schools: School[];
  prompt?: EssayPromptData;
  onClose: () => void;
  onSave: () => void;
}

export function EssayPromptModal({ schools, prompt, onClose, onSave }: EssayPromptModalProps) {
  const [formData, setFormData] = useState({
    school_id: prompt?.schools?.id || '',
    prompt: prompt?.prompt || '',
    word_count: prompt?.word_count || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!prompt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const url = '/api/admin/essay-prompts';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing 
        ? { id: prompt.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} essay prompt`);
      }

      onSave();
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} essay prompt:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} essay prompt`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Essay Prompt' : 'Create New Essay Prompt'}
            </h3>
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

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="school_id" className="block text-sm font-medium text-gray-700">
                School
              </label>
              <select
                id="school_id"
                name="school_id"
                value={formData.school_id}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a school</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                Essay Prompt
              </label>
              <textarea
                id="prompt"
                name="prompt"
                value={formData.prompt}
                onChange={handleInputChange}
                required
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter the essay prompt text..."
              />
            </div>

            <div>
              <label htmlFor="word_count" className="block text-sm font-medium text-gray-700">
                Word Count
              </label>
              <input
                type="text"
                id="word_count"
                name="word_count"
                value={formData.word_count}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 650, 250-500, etc."
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the word count requirement (e.g., "650", "250-500", "No limit")
              </p>
            </div>

            {isEditing && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Created:</strong> {new Date(prompt.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Last Updated:</strong> {new Date(prompt.updated_at).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Prompt' : 'Create Prompt')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
