import { useState, useCallback } from 'react';
import { uploadService } from '../services/uploadService';

interface UploadStats {
  schoolsAdded: number;
  promptsAdded: number;
}

export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UploadStats | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setStats(null);

    try {
      const result = await uploadService.uploadCSV(file);

      if (result.errors.length > 0) {
        setError(result.errors.join('\n'));
        return false;
      }

      setStats({
        schoolsAdded: result.schoolsAdded,
        promptsAdded: result.promptsAdded
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    stats,
    uploadFile
  };
}
