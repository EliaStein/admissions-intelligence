import React from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface UploadStatusProps {
  loading: boolean;
  error: string | null;
  stats: { schoolsAdded: number; promptsAdded: number; } | null;
}

export function UploadStatus({ loading, error, stats }: UploadStatusProps) {
  if (loading) {
    return (
      <div className="mt-4 text-gray-600 flex items-center">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Processing file...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 text-red-600 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        <div className="text-sm whitespace-pre-wrap">{error}</div>
      </div>
    );
  }

  if (stats) {
    return (
      <div className="mt-4 text-green-600 flex items-center">
        <CheckCircle className="w-5 h-5 mr-2" />
        <div>
          Successfully added {stats.schoolsAdded} schools and {stats.promptsAdded} prompts
        </div>
      </div>
    );
  }

  return null;
}
