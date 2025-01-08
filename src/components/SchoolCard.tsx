import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import type { Database } from '../types/supabase';

type School = Database['public']['Tables']['schools']['Row'];
type EssayPrompt = Database['public']['Tables']['essay_prompts']['Row'];

interface SchoolCardProps {
  school: School;
}

export function SchoolCard({ school }: SchoolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prompts, setPrompts] = useState<EssayPrompt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExpanded && prompts.length === 0) {
      setLoading(true);
      schoolService.getSchoolPrompts(school.id)
        .then(setPrompts)
        .finally(() => setLoading(false));
    }
  }, [isExpanded, school.id]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-primary-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="mt-2 text-sm text-gray-600">
          {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'}
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              prompts.map((prompt) => (
                <div key={prompt.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{prompt.prompt}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Word count: {prompt.word_count}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
