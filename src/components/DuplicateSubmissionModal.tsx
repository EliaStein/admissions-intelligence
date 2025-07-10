import React from 'react';
import { AlertTriangle, Calendar, X } from 'lucide-react';

interface DuplicateSubmissionModalProps {
  message: string;
  submissionCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export function DuplicateSubmissionModal({ message, submissionCount, isOpen, onClose }: DuplicateSubmissionModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const lines = message.split('\n').filter(line => line.trim());
  const mainMessage = lines[0];
  const encouragementStart = lines.findIndex(line => line.includes('If you are looking for deeper guidance'));
  const encouragementMessage = encouragementStart !== -1 ? lines[encouragementStart] : '';
  const ctaStart = lines.findIndex(line => line.includes('Let\'s schedule'));
  const ctaMessage = ctaStart !== -1 ? lines[ctaStart].replace(/\*\*/g, '') : '';
  const linkStart = lines.findIndex(line => line.includes('Link:'));
  const linkLine = linkStart !== -1 ? lines[linkStart] : '';
  const linkMatch = linkLine.match(/\[([^\]]+)\]\(([^)]+)\)/);
  const linkText = linkMatch ? linkMatch[1] : 'Book a time';
  const linkUrl = linkMatch ? linkMatch[2] : 'http://calendly.com/Zach-endeavorcollegecounseling';

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-medium text-amber-800 mb-2">
                    Multiple Submissions Detected
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {mainMessage}
                  </p>
                  {submissionCount > 0 && (
                    <p className="text-amber-600 text-xs mt-1">
                      We found {submissionCount} similar submissions in the past month.
                    </p>
                  )}
                </div>

                {encouragementMessage && (
                  <p className="text-amber-700 text-sm">
                    {encouragementMessage}
                  </p>
                )}

                {ctaMessage && (
                  <div className="bg-white rounded-md p-4 border border-amber-200">
                    <p className="text-amber-800 font-medium text-sm mb-3">
                      {ctaMessage}
                    </p>
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {linkText}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4 text-amber-600 hover:text-amber-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
