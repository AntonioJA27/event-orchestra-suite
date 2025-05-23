// src/hooks/useApi.ts
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseApiOptions {
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const execute = async <T>(
    apiCall: () => Promise<T>,
    options: UseApiOptions = {}
  ): Promise<T | null> => {
    const {
      successMessage,
      errorMessage,
      showSuccessToast = false,
      showErrorToast = true,
    } = options;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();

      if (successMessage && showSuccessToast) {
        toast({
          title: 'Éxito',
          description: successMessage,
        });
      }

      return result;
    } catch (err) {
      const errorMsg = errorMessage || (err instanceof Error ? err.message : 'An error occurred');
      setError(errorMsg);

      if (showErrorToast) {
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    execute,
  };
}