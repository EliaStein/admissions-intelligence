import React from 'react';
import { Upload } from 'lucide-react';

interface EssayStepProps {
  essayText: string;
  essayFile: File | null;
  onTextChange: (text: string) => void;
  onFileChange: (file: File) => void;
  onNext: () => void;
}

export function EssayStep({
  essayText,
  essayFile,
  onTextChange,
  onFileChange,
  onNext,
}: EssayStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <textarea
          placeholder="Enter your essay here..."
          value={essayText}
          onChange={(e) => onTextChange(e.target.value)}
          disabled={!!essayFile}
          className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
        />
        <div className="text-center">
          <span className="text-gray-500">or</span>
        </div>
        <div className="flex justify-center">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".txt,.doc,.docx,.pdf"
              onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])}
              className="hidden"
            />
            <div className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
              <Upload className="w-5 h-5" />
              <span>{essayFile ? essayFile.name : 'Upload File'}</span>
            </div>
          </label>
        </div>
      </div>
      {(essayText || essayFile) && (
        <button
          onClick={onNext}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-full hover:bg-primary-700 transition-colors"
        >
          Request Feedback
        </button>
      )}
    </div>
  );
}
