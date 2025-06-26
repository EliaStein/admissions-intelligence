'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CSVImportModalProps {
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  schoolsProcessed?: number;
  promptsProcessed?: number;
  errors?: string[];
}

export function CSVImportModal({ onClose, onImportComplete }: CSVImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'rewrite' | 'add' | null>('rewrite');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setResult(null);
    } else {
      alert('Please select a valid CSV file.');
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !importMode) return;

    setLoading(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mode', importMode);

      const response = await fetch('/api/admin/import/essay-prompts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data);
      
      if (data.success) {
        setTimeout(() => {
          onImportComplete();
        }, 2000);
      }
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Import failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImportMode('rewrite');
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50"
      onClick={handleBackdropClick}
    >
      <div className="relative top-20 mx-auto p-6 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-gray-900">Import Essay Prompts from CSV</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* File Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex-1">
              <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'Click to upload CSV file'}
                  </span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={loading}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Expected format: School Name, Essay Prompt, Word Count
          </p>
        </div>

        {/* Import Mode Selection */}
        {selectedFile && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Import Mode
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="rewrite"
                  checked={importMode === 'rewrite'}
                  onChange={(e) => setImportMode(e.target.value as 'rewrite')}
                  className="mt-1"
                  disabled={loading}
                />
                <div>
                  <div className="font-medium text-gray-900">Rewrite (Update/Add)</div>
                  <div className="text-sm text-gray-600">
                    Update existing prompts by ID if they exist, otherwise add new ones. 
                    This will modify existing data.
                  </div>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="add"
                  checked={importMode === 'add'}
                  onChange={(e) => setImportMode(e.target.value as 'add')}
                  className="mt-1"
                  disabled={loading}
                />
                <div>
                  <div className="font-medium text-gray-900">Add Only</div>
                  <div className="text-sm text-gray-600">
                    Add all items from the CSV as new entries. 
                    Existing data will not be modified.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className={`mb-6 p-4 rounded-md ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              )}
              <div className="flex-1">
                <div className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </div>
                {result.success && (
                  <div className="text-sm text-green-700 mt-1">
                    {result.schoolsProcessed && `Schools processed: ${result.schoolsProcessed}`}
                    {result.promptsProcessed && ` • Prompts processed: ${result.promptsProcessed}`}
                  </div>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div className="text-sm text-red-700 mt-2">
                    <div className="font-medium">Errors:</div>
                    <ul className="list-disc list-inside mt-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={resetForm}
            className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
            disabled={loading}
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile || !importMode || loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Importing...' : 'Import CSV'}
          </button>
        </div>
      </div>
    </div>
  );
}
