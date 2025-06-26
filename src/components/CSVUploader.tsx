'use client';

import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useUpload } from '../hooks/useUpload';
import { UploadStatus } from './ui/UploadStatus';

export function CSVUploader() {
  const { loading, error, stats, uploadFile } = useUpload();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  }, [uploadFile]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Upload Schools Data</h2>
        <p className="text-gray-600">Upload a CSV file containing school names and essay prompts</p>
      </div>

      <label className="block w-full">
        <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary-400 focus:outline-none">
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              Click to upload or drag and drop CSV file
            </span>
          </div>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={loading}
        />
      </label>

      <UploadStatus
        loading={loading}
        error={error}
        stats={stats}
      />
    </div>
  );
}
