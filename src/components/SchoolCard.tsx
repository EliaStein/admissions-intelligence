import React, { useState } from 'react';
import { ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { School } from '../types/essay';

interface SchoolCardProps {
  school: School;
}

export function SchoolCard({ school }: SchoolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
          {school.prompts.length} {school.prompts.length === 1 ? 'prompt' : 'prompts'}
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {school.prompts.map((prompt, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{prompt.prompt}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Word count: {prompt.wordCount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
