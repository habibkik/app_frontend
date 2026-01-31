import { useState, useCallback } from "react";
import type { ApiResponse, RequestOptions } from "@/types/api.types";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseApiReturn<T, P extends unknown[]> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T, P extends unknown[] = []>(
  apiFunction: (...params: P) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFunction(...params);

        if (response.success && response.data) {
          setData(response.data);
          options.onSuccess?.(response.data);
          return response.data;
        }

        const errorMessage = response.error?.message || "An error occurred";
        setError(errorMessage);
        options.onError?.(errorMessage);
        return null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        options.onError?.(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset };
}
