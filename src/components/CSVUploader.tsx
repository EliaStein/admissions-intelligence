import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { validateCSVFormat, parseCSV } from '../utils/csvParser';
import { essayService } from '../services/essayService';

export function CSVUploader() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const isValidFormat = await validateCSVFormat(file);
      if (!isValidFormat) {
        setError('Invalid CSV format. Please ensure the file has the required headers.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const parsedData = parseCSV(content);

        if (parsedData.errors.length > 0) {
          setError(parsedData.errors.join('\n'));
          return;
        }

        essayService.updateSchools(parsedData);
        setSuccess(true);
      };

      reader.readAsText(file);
    } catch (err) {
      setError('Failed to process the file. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Upload Essay Questions</h2>
        <p className="text-gray-600">Upload a CSV file containing school names and essay prompts</p>
      </div>

      <label className="block w-full">
        <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary-400 focus:outline-none">
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              Click to upload or drag and drop
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

      {loading && (
        <div className="mt-4 text-gray-600 flex items-center">
          <div className="animate-spin mr-2">⌛</div>
          Processing file...
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 text-green-600 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          File processed successfully!
        </div>
      )}
    </div>
  );
}
